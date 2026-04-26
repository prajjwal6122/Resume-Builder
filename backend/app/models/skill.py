"""
Pydantic models for skills
"""
from pydantic import BaseModel
from typing import Optional


class ResumeSkill(BaseModel):
    name: str
    category: str = "other"
    years: Optional[float] = None
    proficiency: Optional[str] = None  # beginner, intermediate, advanced, expert


class JDSkill(BaseModel):
    name: str
    category: str = "other"
    criticality: str = "medium"  # critical, high, medium, low
    required_level: Optional[str] = None
    years_required: Optional[int] = None


class SkillExtractionResult(BaseModel):
    skills: list
    extraction_confidence: float = 0.8
    total_skills_found: int = 0
    notes: Optional[str] = None
