"""
Skill Extraction Service — extracts skills from resume and JD text using LLM.
Falls back to keyword matching if LLM is unavailable.
"""
import json
import logging
import re
from app.services.llm_client import call_llm_json, is_llm_available

logger = logging.getLogger(__name__)

# Skill name normalization map
SKILL_ALIAS_MAP = {
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "py": "Python",
    "python": "Python",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "react.js": "React",
    "reactjs": "React",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "flask": "Flask",
    "fastapi": "FastAPI",
    "django": "Django",
    "express": "Express.js",
    "express.js": "Express.js",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "aws": "AWS",
    "amazon web services": "AWS",
    "gcp": "Google Cloud",
    "azure": "Microsoft Azure",
    "redis": "Redis",
    "graphql": "GraphQL",
    "rest api": "REST APIs",
    "rest apis": "REST APIs",
    "restful": "REST APIs",
    "sql": "SQL",
    "git": "Git",
    "linux": "Linux",
    "nginx": "Nginx",
    "celery": "Celery",
    "tdd": "Testing/TDD",
    "test driven development": "Testing/TDD",
    "testing": "Testing/TDD",
    "pytest": "Testing/TDD",
    "jest": "Testing/TDD",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
}

RESUME_SKILL_EXTRACTION_PROMPT = """
You are an expert technical recruiter analyzing a resume to extract skills.

RESUME TEXT:
{text}

TASK: Extract ALL technical and professional skills mentioned in this resume.

For each skill, provide:
- name: standardized skill name (e.g., "Python" not "python" or "py")
- category: one of [programming-language, framework, library, database, tool, cloud, methodology, soft-skill, other]
- years: estimated years of experience (number, or 0 if unclear)
- proficiency: one of [beginner, intermediate, advanced, expert] (infer from context)

RULES:
- Normalize names: js→JavaScript, ts→TypeScript, postgres→PostgreSQL
- Only extract genuine technical skills
- Infer years from job dates if not explicitly stated
- Only include skills that are actually mentioned

OUTPUT FORMAT (JSON only, no markdown):
{{"skills": [
  {{"name": "Python", "category": "programming-language", "years": 4, "proficiency": "advanced"}},
  {{"name": "PostgreSQL", "category": "database", "years": 3, "proficiency": "intermediate"}}
]}}
"""

JD_SKILL_EXTRACTION_PROMPT = """
You are an expert technical recruiter analyzing a job description to extract required skills.

JOB DESCRIPTION:
{text}

TASK: Extract ALL skills that this job requires or would value.

For each skill, provide:
- name: standardized skill name
- category: one of [programming-language, framework, library, database, tool, cloud, methodology, soft-skill, other]
- criticality: one of [critical, high, medium, low] (based on language: "must have"=critical, "required"=high, "nice-to-have"=low)
- required_level: one of [beginner, intermediate, advanced, expert]
- years_required: minimum years required (number, or null if not specified)

OUTPUT FORMAT (JSON only, no markdown):
{{"skills": [
  {{"name": "Python", "category": "programming-language", "criticality": "critical", "required_level": "advanced", "years_required": 5}},
  {{"name": "Testing/TDD", "category": "methodology", "criticality": "critical", "required_level": "intermediate", "years_required": null}}
]}}
"""


def normalize_skill_name(name: str) -> str:
    """Normalize a skill name using the alias map."""
    return SKILL_ALIAS_MAP.get(name.lower(), name.title())


def normalize_skills(skills: list) -> list:
    """Deduplicate and normalize skill names."""
    seen = set()
    normalized = []
    
    for skill in skills:
        canonical = normalize_skill_name(skill.get("name", ""))
        if canonical and canonical not in seen:
            skill["name"] = canonical
            normalized.append(skill)
            seen.add(canonical)
    
    return normalized


async def extract_skills_from_resume(text: str) -> list:
    """
    Extract skills from resume text.
    Returns list of ResumeSkill dicts.
    """
    if not text.strip():
        return []

    # Try LLM first
    if is_llm_available():
        prompt = RESUME_SKILL_EXTRACTION_PROMPT.format(text=text[:4000])
        result = await call_llm_json(prompt)
        
        if result and "skills" in result:
            skills = result["skills"]
            return normalize_skills(skills)

    # Fallback: keyword matching
    logger.warning("LLM unavailable — using keyword-based skill extraction for resume")
    return _keyword_extract_resume(text)


async def extract_skills_from_jd(text: str) -> list:
    """
    Extract required skills from job description text.
    Returns list of JDSkill dicts.
    """
    if not text.strip():
        return []

    # Try LLM first
    if is_llm_available():
        prompt = JD_SKILL_EXTRACTION_PROMPT.format(text=text[:4000])
        result = await call_llm_json(prompt)
        
        if result and "skills" in result:
            skills = result["skills"]
            return normalize_skills(skills)

    # Fallback: keyword matching
    logger.warning("LLM unavailable — using keyword-based skill extraction for JD")
    return _keyword_extract_jd(text)


def _keyword_extract_resume(text: str) -> list:
    """Simple keyword-based skill extraction as fallback."""
    text_lower = text.lower()
    
    known_skills = [
        ("Python", "programming-language", 2, "intermediate"),
        ("JavaScript", "programming-language", 1, "intermediate"),
        ("TypeScript", "programming-language", 1, "intermediate"),
        ("React", "framework", 1, "intermediate"),
        ("Node.js", "framework", 1, "intermediate"),
        ("Flask", "framework", 1, "intermediate"),
        ("FastAPI", "framework", 1, "intermediate"),
        ("Django", "framework", 1, "intermediate"),
        ("PostgreSQL", "database", 2, "intermediate"),
        ("MongoDB", "database", 1, "beginner"),
        ("Redis", "database", 1, "beginner"),
        ("Docker", "tool", 1, "beginner"),
        ("Git", "tool", 2, "intermediate"),
        ("AWS", "cloud", 1, "beginner"),
        ("Linux", "tool", 1, "intermediate"),
        ("Testing/TDD", "methodology", 0, "beginner"),
        ("CI/CD", "methodology", 0, "beginner"),
        ("REST APIs", "methodology", 1, "intermediate"),
    ]
    
    found = []
    for skill_name, category, years, proficiency in known_skills:
        if skill_name.lower() in text_lower or any(
            alias in text_lower 
            for alias, canonical in SKILL_ALIAS_MAP.items() 
            if canonical == skill_name
        ):
            found.append({
                "name": skill_name,
                "category": category,
                "years": years,
                "proficiency": proficiency
            })
    
    return found


def _keyword_extract_jd(text: str) -> list:
    """Simple keyword-based JD skill extraction as fallback."""
    text_lower = text.lower()
    
    # Define skills with their JD keywords and criticality signals
    known_skills = [
        ("Python", "programming-language", "critical"),
        ("JavaScript", "programming-language", "high"),
        ("TypeScript", "programming-language", "medium"),
        ("React", "framework", "high"),
        ("Node.js", "framework", "medium"),
        ("Flask", "framework", "medium"),
        ("FastAPI", "framework", "medium"),
        ("PostgreSQL", "database", "high"),
        ("MongoDB", "database", "medium"),
        ("Redis", "database", "medium"),
        ("Docker", "tool", "high"),
        ("Kubernetes", "tool", "medium"),
        ("AWS", "cloud", "medium"),
        ("Testing/TDD", "methodology", "critical"),
        ("CI/CD", "methodology", "high"),
        ("REST APIs", "methodology", "high"),
        ("Git", "tool", "medium"),
        ("Linux", "tool", "medium"),
        ("System Design", "methodology", "medium"),
    ]
    
    found = []
    for skill_name, category, default_criticality in known_skills:
        if skill_name.lower() in text_lower:
            # Try to detect criticality from surrounding text
            criticality = default_criticality
            idx = text_lower.find(skill_name.lower())
            context = text_lower[max(0, idx-50):idx+100]
            
            if any(w in context for w in ["must", "required", "critical", "mandatory"]):
                criticality = "critical"
            elif any(w in context for w in ["nice to have", "preferred", "plus"]):
                criticality = "low"
            
            found.append({
                "name": skill_name,
                "category": category,
                "criticality": criticality,
                "required_level": "intermediate",
                "years_required": None
            })
    
    return found
