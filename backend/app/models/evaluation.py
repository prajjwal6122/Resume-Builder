"""
Pydantic models for evaluation results
"""
from pydantic import BaseModel
from typing import Optional


class ScoreBreakdown(BaseModel):
    correctness: int = 0    # 0-2
    depth: int = 0          # 0-2
    examples: int = 0       # 0-2
    clarity: int = 0        # 0-1
    confidence: int = 0     # 0-1


class EvaluationResult(BaseModel):
    question_id: str
    answer_text: str
    score_breakdown: ScoreBreakdown
    total_score: float  # 0-8
    reasoning: str
    red_flags: list[str] = []
    strengths: list[str] = []
    follow_up_needed: bool = False
    follow_up_question: Optional[str] = None
    is_fallback: bool = False  # True if LLM failed and used mock
