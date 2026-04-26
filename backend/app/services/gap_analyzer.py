"""
Gap Analysis Engine — compares claimed vs assessed skills to identify gaps.
Pure Python logic — no LLM needed for this component.
"""
import logging
from app.models.gap import SkillGap, GapSummary, GapAnalysis
from app.models.session import AssessmentSession

logger = logging.getLogger(__name__)

GAP_THRESHOLD = 1.0  # Gaps < 1.0 are considered "accurate"


def proficiency_to_score(proficiency: str) -> float:
    """Convert resume proficiency level to 0-8 scale."""
    mapping = {
        "beginner": 2.0,
        "intermediate": 4.5,
        "advanced": 6.5,
        "expert": 8.0
    }
    return mapping.get(proficiency.lower() if proficiency else "", 3.0)


def years_to_score(years: float) -> float:
    """Convert years of experience to approximate 0-8 scale."""
    if years <= 0:
        return 0.0
    elif years <= 1:
        return 2.0
    elif years <= 2:
        return 3.5
    elif years <= 3:
        return 4.5
    elif years <= 5:
        return 6.0
    elif years <= 8:
        return 7.0
    else:
        return 8.0


def get_claimed_level(skill_name: str, resume_skills: list) -> float:
    """Get the claimed proficiency level (0-8) for a skill from resume."""
    for skill in resume_skills:
        if isinstance(skill, dict):
            if skill.get("name", "").lower() == skill_name.lower():
                # Use proficiency if available, else infer from years
                proficiency = skill.get("proficiency", "")
                years = skill.get("years", 0) or 0
                
                if proficiency:
                    score = proficiency_to_score(proficiency)
                elif years > 0:
                    score = years_to_score(years)
                else:
                    score = 2.0  # Default to beginner if mentioned but no details
                
                return round(score, 1)
    
    return 0.0  # Skill not claimed in resume


def classify_gap(claimed: float, assessed: float) -> tuple[str, str, str]:
    """
    Classify the gap between claimed and assessed skill.
    Returns (gap_type, severity, recommendation).
    """
    gap = assessed - claimed  # Positive = underestimated, Negative = overestimated

    if claimed == 0 and assessed == 0:
        return "missing", "high", "Critical gap. Not in resume, not demonstrated in assessment."
    
    if gap < -2.0:
        return "overestimated", "high", "Significant overestimation. Resume claims vs. assessment show a major gap. Interview further or practice more."
    elif gap < -GAP_THRESHOLD:
        return "overestimated", "medium", "Resume slightly overstates this skill. Normal to see — add more depth via learning plan."
    elif gap > 2.0:
        return "underestimated", "positive", "Hidden strength! You performed significantly better than your resume suggests. Highlight this skill more."
    elif gap > GAP_THRESHOLD:
        return "underestimated", "positive", "Good sign — you're stronger than you think. Build on this strength."
    else:
        return "accurate", "none", "Self-assessment is accurate. Keep building on this foundation."


def analyze_gaps(session: AssessmentSession) -> GapAnalysis:
    """
    Analyze gaps between claimed and assessed skills.
    Returns full GapAnalysis object.
    """
    resume_skills = session.resume_skills or []
    jd_skills = session.jd_skills or []
    answers = session.answers or []
    questions = session.questions or []

    # Build assessment scores per skill from answers
    skill_assessed_scores: dict[str, list[float]] = {}
    
    for answer in answers:
        if not isinstance(answer, dict):
            continue
        
        question_id = answer.get("question_id", "")
        total_score = answer.get("total_score", 0)
        
        # Find the skill for this question
        question = next((q for q in questions if q.get("id") == question_id), None)
        if question:
            skill = question.get("skill", "Unknown")
            if skill not in skill_assessed_scores:
                skill_assessed_scores[skill] = []
            skill_assessed_scores[skill].append(float(total_score))

    # Collect all skills to analyze (from JD + resume)
    all_skills = set()
    for s in jd_skills:
        if isinstance(s, dict):
            all_skills.add(s.get("name", ""))
    for s in resume_skills:
        if isinstance(s, dict):
            all_skills.add(s.get("name", ""))
    for skill in skill_assessed_scores.keys():
        all_skills.add(skill)

    all_skills.discard("")  # Remove empty strings

    # Get JD criticality map
    jd_criticality = {}
    for s in jd_skills:
        if isinstance(s, dict):
            jd_criticality[s.get("name", "")] = s.get("criticality", "medium")

    gaps = []
    skill_scores_list = []

    for skill_name in all_skills:
        claimed = get_claimed_level(skill_name, resume_skills)
        
        # Get assessed score (average of all questions for this skill)
        assessed_scores = skill_assessed_scores.get(skill_name, [])
        if assessed_scores:
            assessed = round(sum(assessed_scores) / len(assessed_scores), 1)
            questions_asked = len(assessed_scores)
        else:
            # If no questions asked about this skill, use claimed as assessed (no data)
            assessed = 0.0 if claimed == 0 else None
            questions_asked = 0

        if assessed is None:
            # No assessment data — not tested
            skill_scores_list.append({
                "skill": skill_name,
                "claimed_level": claimed,
                "assessed_level": None,
                "gap": None,
                "gap_type": "untested",
                "severity": "none",
                "confidence_interval": "N/A",
                "match_quality": "untested",
                "questions_asked": 0
            })
            continue

        gap_value = assessed - claimed
        gap_type, severity, recommendation = classify_gap(claimed, assessed)

        # Get criticality from JD
        criticality = jd_criticality.get(skill_name, "medium")
        
        # Escalate severity for missing critical skills
        if gap_type == "missing" and criticality == "critical":
            severity = "high"
        
        confidence_interval = "±1.0" if questions_asked == 1 else f"±{max(0.5, 1.0 - questions_asked * 0.15):.1f}"

        skill_gap = SkillGap(
            skill=skill_name,
            claimed=claimed,
            assessed=assessed,
            gap=round(gap_value, 1),
            gap_type=gap_type,
            severity=severity,
            confidence_interval=confidence_interval,
            recommendation=recommendation,
            impact=criticality
        )
        gaps.append(skill_gap)

        skill_scores_list.append({
            "skill": skill_name,
            "claimed_level": claimed,
            "assessed_level": assessed,
            "gap": round(gap_value, 1),
            "gap_type": gap_type,
            "severity": severity,
            "confidence_interval": confidence_interval,
            "match_quality": gap_type,
            "questions_asked": questions_asked
        })

    # Calculate summary
    overestimated = sum(1 for g in gaps if g.gap_type == "overestimated")
    underestimated = sum(1 for g in gaps if g.gap_type == "underestimated")
    accurate = sum(1 for g in gaps if g.gap_type == "accurate")
    missing = sum(1 for g in gaps if g.gap_type == "missing")

    if overestimated == 0:
        calibration = "excellent"
    elif overestimated <= 1:
        calibration = "good"
    elif overestimated <= 3:
        calibration = "moderate"
    else:
        calibration = "poor"

    summary = GapSummary(
        overestimation_count=overestimated,
        underestimation_count=underestimated,
        accurate_count=accurate,
        missing_count=missing,
        overall_calibration=calibration,
        assessment_reliability=round(0.95 - (overestimated * 0.05), 2)
    )

    # Generate narrative
    narrative = _generate_narrative(gaps, summary)

    return GapAnalysis(
        gaps=gaps,
        skill_scores=skill_scores_list,
        summary=summary,
        narrative=narrative
    )


def _generate_narrative(gaps: list, summary: GapSummary) -> str:
    """Generate a plain-text summary of the gap analysis."""
    parts = []

    missing_high = [g for g in gaps if g.gap_type == "missing" and g.impact == "critical"]
    if missing_high:
        skill_names = ", ".join(g.skill for g in missing_high[:3])
        parts.append(f"Critical gaps identified in: {skill_names}. These are required by the role and absent from your profile.")

    overestimated = [g for g in gaps if g.gap_type == "overestimated" and g.severity in ["high", "medium"]]
    if overestimated:
        skill_names = ", ".join(g.skill for g in overestimated[:2])
        parts.append(f"Your resume overstates proficiency in: {skill_names}. Focus on deepening these skills.")

    strengths = [g for g in gaps if g.gap_type == "underestimated"]
    if strengths:
        skill_names = ", ".join(g.skill for g in strengths[:2])
        parts.append(f"Hidden strengths found in: {skill_names}. Make sure to highlight these on your resume.")

    if not parts:
        parts.append("Your self-assessment is well-calibrated. Continue building depth across all assessed skills.")

    return " ".join(parts)
