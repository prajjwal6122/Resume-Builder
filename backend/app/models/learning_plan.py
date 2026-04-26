"""
Pydantic models for learning plans
"""
from pydantic import BaseModel
from typing import Optional


class Resource(BaseModel):
    title: str
    url: str
    type: str = "course"        # course, blog, documentation, video, tutorial
    difficulty: str = "beginner"
    duration_hours: Optional[float] = None
    cost: str = "free"          # "free" or "$XX.XX"
    rating: float = 4.5
    when_to_use: Optional[str] = None


class LearningPhase(BaseModel):
    phase: int
    title: str
    duration_hours: int
    topics: list[str] = []
    projects: list[str] = []


class LearningSkill(BaseModel):
    priority: int
    skill: str
    category: str = "technical"
    current_level: float = 0
    target_level: float = 3
    estimated_hours: int
    weeks_at_5hrs: Optional[int] = None
    importance: str = "high"    # critical, high, medium, low
    why_important: str = ""
    prerequisites: list[dict] = []
    learning_phases: list[LearningPhase] = []
    resources: list[Resource] = []
    projects: list[dict] = []


class PlanSummary(BaseModel):
    total_hours: int
    weeks_5hrs_per_week: int
    weeks_10hrs_per_week: int
    estimated_completion: str
    difficulty: str = "medium"


class LearningPlan(BaseModel):
    summary: PlanSummary
    skills: list[LearningSkill]
    timeline: dict = {}
    success_criteria: list[str] = []
