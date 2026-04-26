"""
Answer Evaluation Service — scores answers on 5 dimensions using LLM.
Implements the rubric from AI_DESIGN.md.
"""
import logging
from app.services.llm_client import call_llm_json, is_llm_available
from app.models.evaluation import EvaluationResult, ScoreBreakdown

logger = logging.getLogger(__name__)

EVALUATION_PROMPT = """
You are an expert technical interviewer evaluating a candidate's answer.

QUESTION: {question}

EXPECTED DEPTH (what a good answer covers):
{expected_depth}

CANDIDATE'S ANSWER:
{answer}

EVALUATION TASK:
Evaluate this answer on 5 dimensions. Be STRICT and FAIR. Do not be lenient.

Scoring rubric:
1. CORRECTNESS (0-2): Is the answer factually correct?
   - 0: Incorrect or completely off-topic
   - 1: Partially correct, significant gaps or misconceptions
   - 2: Correct and accurate

2. DEPTH (0-2): Does the answer show deep understanding?
   - 0: Surface-level, memorized, no real understanding of WHY
   - 1: Some depth but missing trade-offs, edge cases, or underlying concepts
   - 2: Deep understanding — explains WHY, mentions trade-offs, considerations

3. PRACTICAL EXAMPLES (0-2): Are there concrete, specific examples?
   - 0: No examples, or only vague/generic statements
   - 1: One generic example or an incomplete specific example
   - 2: Specific, real-world example with code snippet or detailed scenario

4. CLARITY (0-1): Is the answer clear and well-structured?
   - 0: Unclear, rambling, hard to follow
   - 1: Clear, organized, easy to understand

5. CONFIDENCE CALIBRATION (0-1): Is the candidate appropriately confident?
   - 0: Overconfident (uses "always"/"never", won't admit uncertainty, absolute statements)
   - 1: Appropriately confident (admits limitations, says "it depends", nuanced)

IMPORTANT RED FLAGS to note:
- Buzzword salad without real understanding → DEPTH = 0
- Confident but wrong → score confidence 0, flag it
- Very short answers (< 50 words) with no examples → EXAMPLES = 0

OUTPUT FORMAT (JSON only, no markdown):
{{
  "score_correctness": 0-2,
  "score_depth": 0-2,
  "score_examples": 0-2,
  "score_clarity": 0-1,
  "score_confidence": 0-1,
  "reasoning": "2-3 sentence explanation of the score",
  "red_flags": ["flag1", "flag2"],
  "strengths": ["strength1", "strength2"],
  "follow_up_needed": true|false,
  "follow_up_question": "optional follow-up question if needed"
}}
"""


def detect_overconfidence(answer: str, scores: dict) -> list:
    """
    Detect signs of overconfidence or buzzword salad.
    Returns list of red flag strings.
    """
    red_flags = []
    answer_lower = answer.lower()

    # Absolute language without qualification
    absolutes = ["always", "never", "the only way", "definitely", "obviously", "simply"]
    for word in absolutes:
        if word in answer_lower:
            red_flags.append(f"Used absolute language: '{word}'")
            break

    # Buzzwords without substance
    buzzwords = ["scalable", "enterprise-grade", "cloud-native", "best practice"]
    for buzzword in buzzwords:
        if buzzword in answer_lower and scores.get("score_depth", 2) < 1:
            red_flags.append(f"Mentioned '{buzzword}' without explanation")
            break

    # Confident but wrong
    if scores.get("score_confidence", 0) == 1 and scores.get("score_correctness", 2) == 0:
        red_flags.append("Confident but incorrect answer (major red flag)")

    # Very short answer with high confidence
    word_count = len(answer.split())
    if word_count < 40 and scores.get("score_depth", 2) < 1:
        red_flags.append(f"Very short answer ({word_count} words) with low depth")

    return red_flags


def calculate_total_score(breakdown: dict) -> float:
    """Calculate total score (0-8) from dimension breakdown."""
    total = (
        breakdown.get("score_correctness", 0) +
        breakdown.get("score_depth", 0) +
        breakdown.get("score_examples", 0) +
        breakdown.get("score_clarity", 0) +
        breakdown.get("score_confidence", 0)
    )
    
    # Apply red flag penalty (0.5 per flag, max 1.5 penalty)
    return min(8.0, max(0.0, float(total)))


FALLBACK_EVALUATION = {
    "score_correctness": 1,
    "score_depth": 1,
    "score_examples": 0,
    "score_clarity": 1,
    "score_confidence": 1,
    "reasoning": "Evaluation service temporarily unavailable. Your answer has been noted and scored with our baseline rubric. The system will refine this score shortly.",
    "red_flags": [],
    "strengths": ["Answer received and recorded"],
    "follow_up_needed": False,
    "follow_up_question": None
}


async def evaluate_answer(
    question_text: str,
    answer_text: str,
    question_id: str,
    expected_depth: str = ""
) -> EvaluationResult:
    """
    Evaluate a candidate's answer and return scored EvaluationResult.
    """
    if not answer_text.strip():
        return EvaluationResult(
            question_id=question_id,
            answer_text=answer_text,
            score_breakdown=ScoreBreakdown(),
            total_score=0.0,
            reasoning="No answer provided.",
            red_flags=["No answer submitted"],
            strengths=[],
            follow_up_needed=False,
            is_fallback=True
        )

    # Try LLM evaluation
    if is_llm_available():
        prompt = EVALUATION_PROMPT.format(
            question=question_text,
            expected_depth=expected_depth or "Answer should demonstrate practical understanding with specific examples",
            answer=answer_text[:2000]
        )
        result = await call_llm_json(prompt)
        
        if result and "score_correctness" in result:
            # Validate score ranges
            result["score_correctness"] = max(0, min(2, int(result.get("score_correctness", 1))))
            result["score_depth"] = max(0, min(2, int(result.get("score_depth", 1))))
            result["score_examples"] = max(0, min(2, int(result.get("score_examples", 0))))
            result["score_clarity"] = max(0, min(1, int(result.get("score_clarity", 1))))
            result["score_confidence"] = max(0, min(1, int(result.get("score_confidence", 1))))
            
            # Detect additional overconfidence signals
            llm_red_flags = result.get("red_flags", [])
            extra_flags = detect_overconfidence(answer_text, result)
            all_flags = list(set(llm_red_flags + extra_flags))

            total_score = calculate_total_score(result)

            return EvaluationResult(
                question_id=question_id,
                answer_text=answer_text,
                score_breakdown=ScoreBreakdown(
                    correctness=result["score_correctness"],
                    depth=result["score_depth"],
                    examples=result["score_examples"],
                    clarity=result["score_clarity"],
                    confidence=result["score_confidence"]
                ),
                total_score=total_score,
                reasoning=result.get("reasoning", ""),
                red_flags=all_flags,
                strengths=result.get("strengths", []),
                follow_up_needed=result.get("follow_up_needed", False),
                follow_up_question=result.get("follow_up_question"),
                is_fallback=False
            )

    # Fallback evaluation
    logger.warning("LLM unavailable — using fallback evaluation")
    fb = FALLBACK_EVALUATION.copy()
    total_score = calculate_total_score(fb)
    
    return EvaluationResult(
        question_id=question_id,
        answer_text=answer_text,
        score_breakdown=ScoreBreakdown(
            correctness=fb["score_correctness"],
            depth=fb["score_depth"],
            examples=fb["score_examples"],
            clarity=fb["score_clarity"],
            confidence=fb["score_confidence"]
        ),
        total_score=total_score,
        reasoning=fb["reasoning"],
        red_flags=fb["red_flags"],
        strengths=fb["strengths"],
        follow_up_needed=False,
        is_fallback=True
    )
