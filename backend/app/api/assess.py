"""
Assessment API routes — main assessment flow.
Handles session creation, answer submission, and result retrieval.
"""
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.services import session_manager
from app.services.skill_extractor import extract_skills_from_resume, extract_skills_from_jd
from app.services.question_generator import generate_questions
from app.services.answer_evaluator import evaluate_answer
from app.services.gap_analyzer import analyze_gaps
from app.services.learning_planner import generate_learning_plan_from_gaps
from app.data.sample_data import (
    SAMPLE_RESUME, SAMPLE_JD, SAMPLE_QUESTIONS,
    SAMPLE_EVALUATION_Q1, SAMPLE_RESULTS, SAMPLE_LEARNING_PLAN
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/assess", tags=["assessment"])


class StartAssessmentRequest(BaseModel):
    resume_text: str
    jd_text: str
    is_demo: bool = False


class AnswerRequest(BaseModel):
    question_id: str
    answer_text: str
    question_text: Optional[str] = None
    expected_depth: Optional[str] = None


@router.post("/start")
async def start_assessment(request: StartAssessmentRequest):
    """
    Start a new assessment session.
    1. Creates session
    2. Extracts skills from resume + JD
    3. Generates questions
    Returns session_id + questions
    """
    try:
        resume_text = request.resume_text.strip()
        jd_text = request.jd_text.strip()
        is_demo = request.is_demo

        if not resume_text or not jd_text:
            raise HTTPException(status_code=400, detail="Both resume_text and jd_text are required.")

        # Demo mode — use hardcoded data for instant response
        if is_demo or (resume_text == SAMPLE_RESUME.strip() and jd_text == SAMPLE_JD.strip()):
            session = session_manager.create_session(resume_text, jd_text, is_demo=True)
            
            # Use hardcoded sample skills and questions
            from app.data.fallback_questions import get_fallback_questions
            demo_jd_skills = [
                {"name": "Python", "criticality": "critical"},
                {"name": "PostgreSQL", "criticality": "critical"},
                {"name": "Testing/TDD", "criticality": "critical"},
                {"name": "Docker", "criticality": "high"},
                {"name": "System Design", "criticality": "medium"},
                {"name": "CI/CD", "criticality": "high"},
            ]
            demo_resume_skills = [
                {"name": "Python", "years": 4, "proficiency": "advanced"},
                {"name": "JavaScript", "years": 3, "proficiency": "intermediate"},
                {"name": "PostgreSQL", "years": 3, "proficiency": "intermediate"},
                {"name": "React", "years": 2, "proficiency": "intermediate"},
                {"name": "Docker", "years": 1, "proficiency": "beginner"},
                {"name": "AWS", "years": 1, "proficiency": "beginner"},
            ]
            
            session_manager.update_session(
                session.id,
                jd_skills=demo_jd_skills,
                resume_skills=demo_resume_skills,
                questions=SAMPLE_QUESTIONS
            )

            return {
                "success": True,
                "session_id": session.id,
                "is_demo": True,
                "questions": SAMPLE_QUESTIONS,
                "total_questions": len(SAMPLE_QUESTIONS),
                "resume_skills": demo_resume_skills,
                "jd_skills": demo_jd_skills,
                "message": "Demo mode active — using sample data for instant responses."
            }

        # Real mode — call AI services
        logger.info("Starting assessment — extracting skills...")

        # Step 1: Extract skills in parallel
        resume_skills, jd_skills = await _extract_skills_parallel(resume_text, jd_text)

        # Step 2: Create session
        session = session_manager.create_session(resume_text, jd_text)
        session_manager.update_session(
            session.id,
            resume_skills=resume_skills,
            jd_skills=jd_skills
        )

        # Step 3: Generate questions
        logger.info(f"Session {session.id}: generating questions...")
        questions = await generate_questions(resume_text, jd_skills, resume_skills)
        
        session_manager.update_session(session.id, questions=questions)

        return {
            "success": True,
            "session_id": session.id,
            "is_demo": False,
            "questions": questions,
            "total_questions": len(questions),
            "resume_skills": resume_skills,
            "jd_skills": jd_skills
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Assessment start error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to start assessment: {str(e)}")


async def _extract_skills_parallel(resume_text: str, jd_text: str):
    """Extract skills from both documents concurrently."""
    import asyncio
    resume_task = extract_skills_from_resume(resume_text)
    jd_task = extract_skills_from_jd(jd_text)
    return await asyncio.gather(resume_task, jd_task)


@router.post("/{session_id}/answer")
async def submit_answer(session_id: str, request: AnswerRequest):
    """
    Submit an answer for evaluation.
    Returns scored evaluation result.
    """
    try:
        session = session_manager.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found or expired.")

        question_id = request.question_id
        answer_text = request.answer_text.strip()

        if not answer_text:
            raise HTTPException(status_code=400, detail="Answer text cannot be empty.")

        # Demo mode shortcut for Q1
        if session.is_demo and question_id == "q1":
            eval_dict = SAMPLE_EVALUATION_Q1.copy()
            eval_dict["answer_text"] = answer_text  # Use actual answer
            session_manager.add_answer(session_id, eval_dict)
            
            return {
                "success": True,
                "evaluation": eval_dict,
                "progress": f"1/{len(session.questions)} questions answered"
            }

        # Find the question
        question = next(
            (q for q in session.questions if q.get("id") == question_id),
            None
        )

        # Use provided question text or fallback to finding it
        question_text = request.question_text or (question.get("text", "") if question else "")
        expected_depth = request.expected_depth or (question.get("expected_depth", "") if question else "")

        if not question_text:
            raise HTTPException(status_code=400, detail=f"Question {question_id} not found in session.")

        # Evaluate the answer
        logger.info(f"Session {session_id}: evaluating answer for {question_id}")
        evaluation = await evaluate_answer(
            question_text=question_text,
            answer_text=answer_text,
            question_id=question_id,
            expected_depth=expected_depth
        )

        # Store evaluation in session
        eval_dict = evaluation.model_dump()
        # Flatten score_breakdown for easier storage
        eval_dict["total_score"] = evaluation.total_score
        session_manager.add_answer(session_id, eval_dict)

        answers_count = len(session_manager.get_session(session_id).answers)
        total_questions = len(session.questions)

        return {
            "success": True,
            "evaluation": eval_dict,
            "progress": f"{answers_count}/{total_questions} questions answered",
            "is_complete": answers_count >= total_questions
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Answer submission error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


@router.get("/{session_id}")
async def get_session(session_id: str):
    """Get current session state."""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired.")
    
    return {
        "success": True,
        "session": {
            "id": session.id,
            "status": session.status,
            "total_questions": len(session.questions),
            "answered_count": len(session.answers),
            "questions": session.questions,
            "is_demo": session.is_demo
        }
    }


@router.post("/{session_id}/complete")
async def complete_assessment(session_id: str):
    """
    Mark assessment as complete.
    Triggers gap analysis and learning plan generation.
    Returns results + learning plan.
    """
    try:
        session = session_manager.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found or expired.")

        if not session.answers:
            raise HTTPException(status_code=400, detail="No answers submitted yet.")

        # Demo mode — return pre-computed results instantly
        if session.is_demo:
            session_manager.complete_session(
                session_id,
                results=SAMPLE_RESULTS,
                learning_plan=SAMPLE_LEARNING_PLAN
            )
            return {
                "success": True,
                "session_id": session_id,
                "results": SAMPLE_RESULTS,
                "learning_plan": SAMPLE_LEARNING_PLAN,
                "is_demo": True
            }

        # Real mode: compute gap analysis
        logger.info(f"Session {session_id}: computing gap analysis...")
        gap_analysis = analyze_gaps(session)

        # Generate learning plan
        logger.info(f"Session {session_id}: generating learning plan...")
        learning_plan = generate_learning_plan_from_gaps(
            gap_analysis,
            session.jd_skills
        )

        # Build results dict
        results = {
            "skill_scores": gap_analysis.skill_scores,
            "gaps_summary": gap_analysis.summary.model_dump(),
            "narrative": gap_analysis.narrative
        }

        # Save to session
        session_manager.complete_session(session_id, results=results, learning_plan=learning_plan)

        return {
            "success": True,
            "session_id": session_id,
            "results": results,
            "learning_plan": learning_plan,
            "is_demo": False
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Assessment completion error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to complete assessment: {str(e)}")


@router.get("/{session_id}/results")
async def get_results(session_id: str):
    """Get completed assessment results and learning plan."""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired.")
    
    if session.status != "completed":
        raise HTTPException(status_code=400, detail="Assessment not yet completed. Call /complete first.")
    
    return {
        "success": True,
        "session_id": session_id,
        "results": session.results,
        "learning_plan": session.learning_plan
    }
