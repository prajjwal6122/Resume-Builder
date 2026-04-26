"""
Pydantic models for gap analysis
"""
from pydantic import BaseModel
from typing import Optional


class SkillGap(BaseModel):
    skill: str
    claimed: float = 0      # 0-8
    assessed: float = 0     # 0-8
    gap: float = 0          # assessed - claimed (negative = overestimated)
    gap_type: str           # overestimated, underestimated, accurate, missing
    severity: str           # high, medium, low, positive, none
    confidence_interval: str = "±1.0"
    recommendation: str = ""
    impact: str = "medium"  # high, medium, low


class GapSummary(BaseModel):
    overestimation_count: int = 0
    underestimation_count: int = 0
    accurate_count: int = 0
    missing_count: int = 0
    overall_calibration: str = "unknown"
    assessment_reliability: float = 0.8


class GapAnalysis(BaseModel):
    gaps: list[SkillGap]
    skill_scores: list[dict] = []
    summary: GapSummary
    narrative: str = ""
