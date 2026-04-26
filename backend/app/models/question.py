"""
Pydantic models for assessment questions
"""
from pydantic import BaseModel
from typing import Optional


class Question(BaseModel):
    id: str
    text: str
    skill: str
    difficulty: str = "intermediate"  # beginner, intermediate, advanced
    expected_depth: Optional[str] = None
    why_this_question: Optional[str] = None
    difficulty_score: int = 2  # 1=easy, 2=medium, 3=hard
    order: Optional[int] = None


class QuestionList(BaseModel):
    questions: list[Question]
    total_questions: int
    difficulty_distribution: dict = {}
