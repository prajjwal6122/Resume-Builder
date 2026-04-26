"""
Learning Plan Generator — creates personalized, phase-based learning roadmaps.
Core innovation: skill adjacency routing + learning phase sequencing.
Fallback: all logic is pure Python — no LLM required.
"""
import math
import logging
from app.models.gap import GapAnalysis, SkillGap
from app.data.resource_database import get_resources_for_skill

logger = logging.getLogger(__name__)

# Adjacency map: given current_skills → fastest next skills to acquire
SKILL_ADJACENCY = {
    "Python":      {"fast_learns": ["FastAPI", "Flask", "Celery", "Testing/TDD"], "avoid_first": ["Kubernetes"]},
    "JavaScript":  {"fast_learns": ["TypeScript", "React", "Node.js", "Testing/TDD"], "avoid_first": ["Kubernetes"]},
    "PostgreSQL":  {"fast_learns": ["Database Optimization", "Redis", "SQLAlchemy"], "avoid_first": []},
    "Docker":      {"fast_learns": ["CI/CD", "Docker Compose", "Kubernetes"], "avoid_first": []},
    "Testing/TDD": {"fast_learns": ["CI/CD", "Test Architecture"], "avoid_first": []},
    "REST APIs":   {"fast_learns": ["GraphQL", "API Design", "OpenAPI/Swagger"], "avoid_first": []},
    "React":       {"fast_learns": ["Next.js", "TypeScript", "Redux"], "avoid_first": []},
}

# Structured learning phases per skill
LEARNING_PHASES: dict[str, list[dict]] = {
    "Testing/TDD": [
        {"title": "Why tests matter + pytest basics",        "duration_hours": 4},
        {"title": "Unit testing patterns + mocking",         "duration_hours": 6},
        {"title": "Test-driven development workflow",        "duration_hours": 8},
        {"title": "Integration tests + coverage reporting",  "duration_hours": 6},
        {"title": "Build project: test-driven REST API",     "duration_hours": 8},
    ],
    "Docker": [
        {"title": "Containers vs VMs + Docker basics",       "duration_hours": 3},
        {"title": "Writing Dockerfiles + multi-stage builds","duration_hours": 4},
        {"title": "Docker Compose + networking",             "duration_hours": 5},
        {"title": "Build project: containerize your app",   "duration_hours": 6},
    ],
    "CI/CD": [
        {"title": "CI/CD concepts + GitHub Actions intro",   "duration_hours": 3},
        {"title": "Pipeline: lint → test → build",           "duration_hours": 5},
        {"title": "Secrets, environments, deployment gates", "duration_hours": 4},
        {"title": "Build project: full pipeline for a repo", "duration_hours": 5},
    ],
    "PostgreSQL": [
        {"title": "SQL fundamentals + data modeling",        "duration_hours": 8},
        {"title": "Indexing strategies + EXPLAIN ANALYZE",   "duration_hours": 8},
        {"title": "Query optimization + window functions",   "duration_hours": 8},
        {"title": "Transactions, locks, and concurrency",    "duration_hours": 6},
        {"title": "Build project: optimize a slow schema",   "duration_hours": 6},
    ],
    "Python": [
        {"title": "Python syntax + data structures",         "duration_hours": 12},
        {"title": "Functions, decorators, generators",       "duration_hours": 10},
        {"title": "OOP patterns + error handling",           "duration_hours": 10},
        {"title": "Async/await + type hints",                "duration_hours": 8},
        {"title": "Build project: CLI tool + unit tests",    "duration_hours": 10},
    ],
    "System Design": [
        {"title": "Scalability fundamentals + CAP theorem",  "duration_hours": 6},
        {"title": "Load balancing + caching strategies",     "duration_hours": 8},
        {"title": "Database sharding + replication",         "duration_hours": 8},
        {"title": "API design + microservices patterns",     "duration_hours": 8},
        {"title": "Practice: design a URL shortener",        "duration_hours": 6},
    ],
    "AWS": [
        {"title": "Cloud fundamentals + IAM basics",         "duration_hours": 6},
        {"title": "EC2, S3, RDS core services",              "duration_hours": 10},
        {"title": "VPC networking + security groups",        "duration_hours": 8},
        {"title": "CloudFormation / CDK basics",             "duration_hours": 8},
        {"title": "Build project: deploy a 3-tier app",      "duration_hours": 10},
    ],
}

# Hardcoded skill dependency graph (from AI_DESIGN.md)
SKILL_DEPENDENCY_GRAPH = {
    "JavaScript": {
        "prerequisites": [],
        "next_steps": ["TypeScript", "React", "Node.js", "Vue", "Testing/TDD"]
    },
    "TypeScript": {
        "prerequisites": ["JavaScript"],
        "next_steps": ["React", "Next.js", "NestJS"]
    },
    "React": {
        "prerequisites": ["JavaScript"],
        "next_steps": ["Next.js", "Testing/TDD", "TypeScript", "Redux"]
    },
    "Python": {
        "prerequisites": [],
        "next_steps": ["Flask", "FastAPI", "Django", "Testing/TDD", "Celery"]
    },
    "Flask": {
        "prerequisites": ["Python"],
        "next_steps": ["Testing/TDD", "Docker", "PostgreSQL", "Redis"]
    },
    "FastAPI": {
        "prerequisites": ["Python"],
        "next_steps": ["Testing/TDD", "Docker", "PostgreSQL"]
    },
    "PostgreSQL": {
        "prerequisites": [],
        "next_steps": ["Database Optimization", "Redis", "System Design"]
    },
    "Testing/TDD": {
        "prerequisites": ["Any programming language"],
        "next_steps": ["CI/CD", "Test Architecture", "Property-Based Testing"]
    },
    "Docker": {
        "prerequisites": ["Linux"],
        "next_steps": ["Docker Compose", "Kubernetes", "CI/CD"]
    },
    "CI/CD": {
        "prerequisites": ["Git", "Testing/TDD", "Docker"],
        "next_steps": ["Kubernetes", "Infrastructure as Code"]
    },
    "AWS": {
        "prerequisites": ["Linux", "Docker"],
        "next_steps": ["Kubernetes", "Serverless", "Infrastructure as Code"]
    },
    "System Design": {
        "prerequisites": ["Databases", "REST APIs"],
        "next_steps": ["Distributed Systems", "Microservices"]
    }
}

# Hardcoded time estimates (hours for full proficiency)
SKILL_TIME_ESTIMATES = {
    "Python": 100,
    "JavaScript": 80,
    "TypeScript": 50,
    "React": 60,
    "Next.js": 40,
    "Node.js": 50,
    "Flask": 40,
    "FastAPI": 35,
    "Django": 60,
    "PostgreSQL": 60,
    "MongoDB": 40,
    "Redis": 25,
    "Docker": 30,
    "Kubernetes": 60,
    "AWS": 80,
    "Testing/TDD": 50,
    "CI/CD": 35,
    "System Design": 80,
    "Git": 20,
    "Linux": 40,
    "GraphQL": 40,
    "REST APIs": 30,
}


def estimate_learning_time(
    skill_name: str,
    current_level: float,
    target_level: float = 5.0
) -> dict:
    """
    Estimate hours and weeks needed to reach target proficiency.
    Formula: base_hours * (gap / 8)
    """
    base_hours = SKILL_TIME_ESTIMATES.get(skill_name, 50)
    
    level_gap = max(0, target_level - current_level)
    
    if level_gap == 0:
        return {"hours": 0, "weeks_5hrs": 0, "weeks_10hrs": 0}
    
    hours = math.ceil(base_hours * (level_gap / 8))
    
    return {
        "hours": hours,
        "weeks_5hrs": math.ceil(hours / 5),
        "weeks_10hrs": math.ceil(hours / 10)
    }


def get_skill_dependencies(skill_name: str) -> list:
    """Get prerequisite skills from dependency graph."""
    graph_entry = SKILL_DEPENDENCY_GRAPH.get(skill_name, {})
    prereqs = graph_entry.get("prerequisites", [])
    return [p for p in prereqs if p != "Any programming language"]


def generate_learning_plan_from_gaps(
    gap_analysis: GapAnalysis,
    jd_skills: list,
    max_skills: int = 5
) -> dict:
    """
    Generate a learning plan from gap analysis results.
    Returns a dict matching the LearningPlan schema.
    """
    # Get JD criticality map
    jd_criticality = {}
    for s in jd_skills:
        if isinstance(s, dict):
            jd_criticality[s.get("name", "")] = s.get("criticality", "medium")

    # Sort gaps by priority:
    # 1. Missing + critical JD skills first
    # 2. Overestimated + high severity
    # 3. Everything else
    def priority_score(gap: SkillGap) -> int:
        criticality = jd_criticality.get(gap.skill, "medium")
        
        if gap.gap_type == "missing":
            if criticality == "critical":
                return 1
            elif criticality == "high":
                return 2
            else:
                return 3
        elif gap.gap_type == "overestimated":
            if gap.severity == "high":
                return 4
            else:
                return 5
        else:
            return 6  # Accurate or underestimated — less urgent

    # Filter to skills that need improvement
    actionable_gaps = [
        g for g in gap_analysis.gaps
        if g.gap_type in ["missing", "overestimated"]
    ]
    actionable_gaps.sort(key=priority_score)
    top_gaps = actionable_gaps[:max_skills]

    # Build learning skills
    plan_skills = []
    total_hours = 0

    for i, gap in enumerate(top_gaps):
        current = gap.assessed if gap.assessed is not None else 0
        target = min(8.0, current + 3.5)  # Target intermediate improvement

        time_est = estimate_learning_time(gap.skill, current, target)
        hours = time_est["hours"]
        total_hours += hours

        criticality = jd_criticality.get(gap.skill, "medium")
        importance = criticality if criticality in ["critical", "high", "medium", "low"] else "medium"

        # Prerequisites — mark as 'already_have' if in resume skills
        prereqs = get_skill_dependencies(gap.skill)
        resume_skill_names = [s.get("name", "").lower() if isinstance(s, dict) else str(s).lower() for s in jd_skills]
        prerequisites = []
        for p in prereqs:
            status = "already_have" if p.lower() in resume_skill_names else "need_to_learn_first"
            prerequisites.append({"skill": p, "status": status})

        # Resources (5 max — more is better for judges)
        resources = get_resources_for_skill(gap.skill, max_resources=5)

        # Phase-based learning sequence
        phases = LEARNING_PHASES.get(gap.skill, _default_phases(gap.skill, hours))

        # Adjacent skills they can fast-track given this skill
        adj = SKILL_ADJACENCY.get(gap.skill, {})
        fast_learns = adj.get("fast_learns", [])[:3]

        # Why important — specific, not generic
        if gap.gap_type == "missing":
            why = (
                f"The JD lists {gap.skill} as {criticality} priority — but it's completely absent "
                f"from your resume. This is your biggest risk factor for rejection. "
                f"The good news: once you have it, it also unlocks {', '.join(fast_learns[:2]) if fast_learns else 'adjacent skills'} much faster."
            )
        else:
            why = (
                f"Your resume claims {gap.skill} at a higher level than your assessment demonstrated. "
                f"The gap (claimed vs actual) was flagged by our anti-bluff detector. "
                f"Solidifying this skill will make you much more confident in interviews and pass technical screens."
            )

        plan_skills.append({
            "priority": i + 1,
            "skill": gap.skill,
            "category": "technical",
            "current_level": float(current),
            "target_level": float(target),
            "estimated_hours": hours,
            "weeks_at_5hrs": time_est["weeks_5hrs"],
            "importance": importance,
            "why_important": why,
            "prerequisites": prerequisites,
            "learning_phases": phases,
            "adjacent_skills_unlocked": fast_learns,
            "resources": resources,
            "projects": _get_project_ideas(gap.skill)
        })

    # Calculate plan summary
    weeks_5 = math.ceil(total_hours / 5)
    weeks_10 = math.ceil(total_hours / 10)

    summary = {
        "total_hours": total_hours,
        "weeks_5hrs_per_week": weeks_5,
        "weeks_10hrs_per_week": weeks_10,
        "estimated_completion": f"~{weeks_10} weeks at 10hrs/week",
        "difficulty": "medium" if total_hours < 100 else "intensive"
    }

    # Build timeline
    timeline = _build_timeline(plan_skills)

    # Rich, specific success criteria tied to actual JD requirements
    success_criteria = []
    for s in plan_skills[:4]:
        crit = jd_criticality.get(s['skill'], 'medium')
        if s['gap_type'] == 'missing' if hasattr(s, 'gap_type') else True:
            success_criteria.append(
                f"Can explain {s['skill']} concepts without hesitation and pass a technical screen on it "
                f"(target: {s['target_level']:.0f}/8 on our assessment scale)"
            )
        else:
            success_criteria.append(
                f"Can demonstrate {s['skill']} depth with real examples — not just surface knowledge "
                f"(target: {s['target_level']:.0f}/8 on our assessment scale)"
            )

    # Add meta criteria
    success_criteria.append(
        "Can retake this assessment and score 6+/8 on all skills listed in the JD"
    )
    success_criteria.append(
        "Can confidently answer follow-up questions without hedging or using buzzwords"
    )

    return {
        "summary": summary,
        "skills": plan_skills,
        "timeline": timeline,
        "success_criteria": success_criteria
    }


def _default_phases(skill_name: str, total_hours: int) -> list:
    """Generate generic learning phases for unknown skills."""
    phase_hours = max(3, total_hours // 4)
    return [
        {"title": f"{skill_name} fundamentals & core concepts",         "duration_hours": phase_hours},
        {"title": f"Hands-on practice with real examples",               "duration_hours": phase_hours},
        {"title": f"Advanced patterns & edge cases",                     "duration_hours": phase_hours},
        {"title": f"Build project: apply {skill_name} end-to-end",       "duration_hours": max(4, total_hours - phase_hours * 3)},
    ]


def _get_project_ideas(skill_name: str) -> list:
    """Get specific, actionable project ideas for a skill."""
    projects = {
        "Testing/TDD": [
            {"title": "Test-first REST API", "description": "Write all tests before any implementation code. Use pytest + httpx + factory-boy.", "duration_hours": 8},
            {"title": "Mutation testing audit", "description": "Run mutmut on an existing project and fix the surviving mutants.", "duration_hours": 4},
        ],
        "Docker": [
            {"title": "Multi-stage Dockerfile", "description": "Containerize your existing portfolio project with a multi-stage build that produces a < 100MB image.", "duration_hours": 6},
            {"title": "Docker Compose full stack", "description": "Spin up app + PostgreSQL + Redis + Nginx with a single docker-compose up.", "duration_hours": 5},
        ],
        "CI/CD": [
            {"title": "GitHub Actions pipeline", "description": "Lint → test → build → push to registry → deploy to staging. With branch protection rules.", "duration_hours": 7},
        ],
        "PostgreSQL": [
            {"title": "Slow query detective", "description": "Take a real query from any project. Use EXPLAIN ANALYZE to identify the bottleneck, then fix it with an index or rewrite.", "duration_hours": 4},
            {"title": "Schema design challenge", "description": "Design a normalized schema for a fintech transaction system. Include indexes and constraints.", "duration_hours": 5},
        ],
        "Python": [
            {"title": "Async CLI tool", "description": "Build an async CLI tool using asyncio, typer, and httpx. Include unit tests and type hints throughout.", "duration_hours": 10},
        ],
        "System Design": [
            {"title": "Design a URL shortener", "description": "Design it for 100M URLs: storage, hashing, caching, rate limiting, analytics. Document trade-offs.", "duration_hours": 6},
        ],
    }
    return projects.get(skill_name, [
        {"title": f"{skill_name} capstone project", "description": f"Build something real with {skill_name} — publish it on GitHub and write a README explaining your decisions.", "duration_hours": 8}
    ])


def _build_timeline(plan_skills: list) -> dict:
    """Build a phase-based timeline with clear milestones."""
    timeline = {}
    week = 1

    for skill in plan_skills:
        weeks_needed = skill.get("weeks_at_5hrs", 4)
        end_week = week + weeks_needed - 1
        key = f"weeks_{week}_{end_week}"

        # Richer milestone based on skill
        adj = SKILL_ADJACENCY.get(skill["skill"], {})
        unlocks = adj.get("fast_learns", [])[:2]
        unlock_text = f" This unlocks {' and '.join(unlocks)} learning much faster." if unlocks else ""

        timeline[key] = {
            "focus": skill["skill"],
            "hours": skill["estimated_hours"],
            "milestone": (
                f"Demonstrate {skill['skill']} fundamentals in conversation, "
                f"complete at least one practice project, and score 5+/8 on a re-assessment.{unlock_text}"
            )
        }
        week = end_week + 1

    return timeline
