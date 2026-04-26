"""
Assessment session model — in-memory storage for hackathon demo
"""
from pydantic import BaseModel
from typing import Optional, Any
from enum import Enum
import uuid
import time


class AssessmentStatus(str, Enum):
    STARTED = "started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class AssessmentSession(BaseModel):
    id: str
    status: AssessmentStatus = AssessmentStatus.STARTED
    resume_text: str = ""
    jd_text: str = ""
    resume_skills: list = []
    jd_skills: list = []
    questions: list = []
    answers: list = []   # list of EvaluationResult dicts
    results: Optional[dict] = None
    learning_plan: Optional[dict] = None
    created_at: float = 0.0
    completed_at: Optional[float] = None
    is_demo: bool = False

    class Config:
        use_enum_values = True
