"""
Question Generation Service — generates targeted assessment questions using LLM.
Falls back to hardcoded question templates if LLM fails.
"""
import logging
from app.services.llm_client import call_llm_json, is_llm_available
from app.data.fallback_questions import get_fallback_questions

logger = logging.getLogger(__name__)

QUESTION_GENERATION_PROMPT = """
You are an expert technical interviewer generating assessment questions.

CANDIDATE RESUME:
{resume_text}

CANDIDATE'S CLAIMED SKILLS: {claimed_skills}

JOB REQUIREMENTS (skills needed):
{jd_skills}

TASK: Generate exactly 6 targeted assessment questions that:
1. Test the MOST CRITICAL skills from the job description
2. Focus on skills the candidate claims experience with
3. Dig for PRACTICAL KNOWLEDGE (not theory)
4. Progress in difficulty: 2 beginner, 2 intermediate, 2 advanced
5. Catch overconfidence by asking for specific examples and edge cases

CRITICAL GUIDELINES:
- Each question must have a clear, verifiable answer
- Ask "how would you" or "walk me through" (practical, not trivia)
- Include edge cases and failure scenarios
- NO yes/no questions
- Tailor difficulty to the candidate's experience level
- Prioritize skills that appear in BOTH the resume AND the JD

OUTPUT FORMAT (JSON only, no markdown):
{{"questions": [
  {{
    "id": "q1",
    "text": "...",
    "skill": "...",
    "difficulty": "beginner|intermediate|advanced",
    "expected_depth": "...",
    "why_this_question": "...",
    "difficulty_score": 1|2|3
  }}
]}}
"""


async def generate_questions(
    resume_text: str,
    jd_skills: list,
    resume_skills: list,
    n: int = 6
) -> list:
    """
    Generate assessment questions based on resume and JD.
    Returns list of Question dicts.
    """
    # Format skills for prompt
    claimed_skills = [s.get("name") for s in resume_skills if isinstance(s, dict)]
    jd_skill_names = [
        f"{s.get('name')} ({s.get('criticality', 'medium')})"
        for s in jd_skills if isinstance(s, dict)
    ]

    # Try LLM first
    if is_llm_available():
        prompt = QUESTION_GENERATION_PROMPT.format(
            resume_text=resume_text[:2000],
            claimed_skills=", ".join(claimed_skills[:15]),
            jd_skills="\n".join(jd_skill_names[:15])
        )
        result = await call_llm_json(prompt)
        
        if result and "questions" in result:
            questions = result["questions"]
            if len(questions) >= 4:
                # Add order index
                for i, q in enumerate(questions):
                    q["order"] = i + 1
                return _validate_questions(questions)

    # Fallback to hardcoded questions
    logger.warning("LLM unavailable or returned insufficient questions — using fallback")
    return get_fallback_questions(jd_skills, n=n)


def _validate_questions(questions: list) -> list:
    """
    Validate question quality and distribution.
    Ensures we have good difficulty distribution and required fields.
    """
    valid = []
    
    for q in questions:
        if not q.get("text") or not q.get("skill"):
            continue
        
        # Ensure required fields
        q.setdefault("id", f"q{len(valid)+1}")
        q.setdefault("difficulty", "intermediate")
        q.setdefault("expected_depth", "Answer should demonstrate practical understanding")
        q.setdefault("why_this_question", "Tests practical skill depth")
        q.setdefault("difficulty_score", 2)
        
        # Validate difficulty value
        if q["difficulty"] not in ["beginner", "intermediate", "advanced"]:
            q["difficulty"] = "intermediate"
        
        valid.append(q)

    # Ensure minimum 4 questions
    if len(valid) < 4:
        logger.warning(f"Only {len(valid)} valid questions — too few, using fallback")
        return []  # Caller will use fallback

    return valid[:8]  # Max 8 questions
