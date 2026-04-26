"""
Learning Plan Generator — The core agent output.

Architecture:
  1. Identify "adjacent skills" — skills near the candidate's current level
     that build upon what they already know (Zone of Proximal Development).
  2. Sort by ROI: (JD criticality × gap size) / acquisition difficulty.
  3. Build a sequential dependency-aware roadmap.
  4. Attach curated resources + project milestones per phase.
  5. Optionally enrich with LLM-generated narrative if API key is available.
"""
import math
import logging
from typing import Optional
from app.services.llm_client import call_llm_json, is_llm_available
from app.models.gap import GapAnalysis, SkillGap
from app.data.resource_database import get_resources_for_skill

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# SKILL DEPENDENCY GRAPH
# Defines prerequisite chains and what unlocks after mastery.
# ─────────────────────────────────────────────────────────────────────────────
SKILL_DEPENDENCY_GRAPH: dict[str, dict] = {
    "Python": {
        "prerequisites": [],
        "unlocks": ["FastAPI", "Flask", "Django", "Testing/TDD", "Celery", "NumPy"],
        "adjacent": ["Go", "Ruby"],
        "difficulty": 3,          # 1 = easy, 5 = very hard
        "base_hours": 100,
    },
    "JavaScript": {
        "prerequisites": [],
        "unlocks": ["TypeScript", "React", "Node.js", "Vue", "Testing/TDD"],
        "adjacent": ["TypeScript"],
        "difficulty": 3,
        "base_hours": 80,
    },
    "TypeScript": {
        "prerequisites": ["JavaScript"],
        "unlocks": ["React", "Next.js", "NestJS", "Angular"],
        "adjacent": ["JavaScript"],
        "difficulty": 2,
        "base_hours": 50,
    },
    "React": {
        "prerequisites": ["JavaScript"],
        "unlocks": ["Next.js", "Redux", "React Native"],
        "adjacent": ["Vue", "Angular"],
        "difficulty": 3,
        "base_hours": 60,
    },
    "Node.js": {
        "prerequisites": ["JavaScript"],
        "unlocks": ["Express.js", "NestJS", "Socket.io"],
        "adjacent": ["Deno"],
        "difficulty": 3,
        "base_hours": 50,
    },
    "FastAPI": {
        "prerequisites": ["Python"],
        "unlocks": ["Testing/TDD", "Docker", "PostgreSQL"],
        "adjacent": ["Flask", "Django"],
        "difficulty": 2,
        "base_hours": 35,
    },
    "Flask": {
        "prerequisites": ["Python"],
        "unlocks": ["Testing/TDD", "Docker", "PostgreSQL", "Redis"],
        "adjacent": ["FastAPI", "Django"],
        "difficulty": 2,
        "base_hours": 40,
    },
    "Django": {
        "prerequisites": ["Python"],
        "unlocks": ["Django REST Framework", "Celery"],
        "adjacent": ["FastAPI", "Flask"],
        "difficulty": 3,
        "base_hours": 60,
    },
    "PostgreSQL": {
        "prerequisites": [],
        "unlocks": ["Database Optimization", "System Design"],
        "adjacent": ["MySQL", "SQLite"],
        "difficulty": 3,
        "base_hours": 60,
    },
    "MongoDB": {
        "prerequisites": [],
        "unlocks": ["Aggregation Pipelines", "Atlas Search"],
        "adjacent": ["PostgreSQL", "Redis"],
        "difficulty": 2,
        "base_hours": 40,
    },
    "Redis": {
        "prerequisites": [],
        "unlocks": ["Celery", "Rate Limiting", "Pub/Sub"],
        "adjacent": ["Memcached"],
        "difficulty": 2,
        "base_hours": 25,
    },
    "Testing/TDD": {
        "prerequisites": ["Python"],   # or any language
        "unlocks": ["CI/CD", "BDD", "Property-Based Testing"],
        "adjacent": ["BDD", "Integration Testing"],
        "difficulty": 2,
        "base_hours": 50,
    },
    "Docker": {
        "prerequisites": ["Linux"],
        "unlocks": ["Docker Compose", "Kubernetes", "CI/CD"],
        "adjacent": ["Podman"],
        "difficulty": 3,
        "base_hours": 30,
    },
    "CI/CD": {
        "prerequisites": ["Git", "Testing/TDD", "Docker"],
        "unlocks": ["Kubernetes", "Infrastructure as Code", "GitOps"],
        "adjacent": ["GitHub Actions", "Jenkins"],
        "difficulty": 3,
        "base_hours": 35,
    },
    "AWS": {
        "prerequisites": ["Linux", "Docker"],
        "unlocks": ["Kubernetes", "Serverless", "Infrastructure as Code"],
        "adjacent": ["GCP", "Azure"],
        "difficulty": 4,
        "base_hours": 80,
    },
    "Kubernetes": {
        "prerequisites": ["Docker", "Linux"],
        "unlocks": ["Helm", "Service Mesh", "GitOps"],
        "adjacent": ["Docker Swarm"],
        "difficulty": 5,
        "base_hours": 60,
    },
    "System Design": {
        "prerequisites": ["PostgreSQL", "REST APIs"],
        "unlocks": ["Distributed Systems", "Microservices Architecture"],
        "adjacent": ["Distributed Systems"],
        "difficulty": 5,
        "base_hours": 80,
    },
    "GraphQL": {
        "prerequisites": ["REST APIs"],
        "unlocks": ["Apollo", "Relay"],
        "adjacent": ["REST APIs"],
        "difficulty": 2,
        "base_hours": 40,
    },
    "Linux": {
        "prerequisites": [],
        "unlocks": ["Docker", "AWS", "Shell Scripting"],
        "adjacent": ["Shell Scripting"],
        "difficulty": 2,
        "base_hours": 40,
    },
    "Git": {
        "prerequisites": [],
        "unlocks": ["CI/CD", "GitHub Actions"],
        "adjacent": [],
        "difficulty": 1,
        "base_hours": 20,
    },
    "REST APIs": {
        "prerequisites": [],
        "unlocks": ["GraphQL", "API Design", "OpenAPI"],
        "adjacent": ["GraphQL"],
        "difficulty": 2,
        "base_hours": 30,
    },
}


# ─────────────────────────────────────────────────────────────────────────────
# ADJACENCY SCORING — Zone of Proximal Development
# Adjacent skills are those 1-2 hops from what the candidate already knows.
# They're easier to acquire because knowledge transfers.
# ─────────────────────────────────────────────────────────────────────────────

def get_adjacency_bonus(skill_name: str, candidate_skills: list[str]) -> float:
    """
    Return a 0.0–1.0 bonus if the skill is adjacent to skills the candidate
    already has. Higher bonus = easier to acquire = higher priority.
    """
    skill_info = SKILL_DEPENDENCY_GRAPH.get(skill_name, {})
    prerequisites = skill_info.get("prerequisites", [])
    adjacent = skill_info.get("adjacent", [])

    # Check if candidate has prerequisites (makes skill unlocked)
    prereqs_satisfied = sum(
        1 for p in prerequisites
        if any(p.lower() in s.lower() for s in candidate_skills)
    )
    prereq_bonus = (prereqs_satisfied / max(len(prerequisites), 1)) * 0.6

    # Check adjacency (related skills)
    adjacent_known = sum(
        1 for a in adjacent
        if any(a.lower() in s.lower() for s in candidate_skills)
    )
    adjacent_bonus = min(adjacent_known * 0.2, 0.4)

    return min(prereq_bonus + adjacent_bonus, 1.0)


def estimate_learning_time(
    skill_name: str,
    current_level: float,
    target_level: float,
    adjacency_bonus: float = 0.0,
) -> dict:
    """
    Estimate hours and weeks needed to reach target proficiency.
    Formula: base_hours × (gap / 8) × difficulty_factor × (1 - adjacency_reduction)
    """
    skill_info = SKILL_DEPENDENCY_GRAPH.get(skill_name, {})
    base_hours = skill_info.get("base_hours", 50)
    difficulty = skill_info.get("difficulty", 3)

    level_gap = max(0.0, target_level - current_level)
    if level_gap == 0:
        return {"hours": 0, "weeks_5hrs": 0, "weeks_10hrs": 0}

    difficulty_factor = 0.7 + (difficulty * 0.1)          # 0.8 – 1.2
    adjacency_reduction = adjacency_bonus * 0.3            # up to 30% faster
    adjusted = base_hours * (level_gap / 8) * difficulty_factor * (1 - adjacency_reduction)
    hours = max(5, math.ceil(adjusted))

    return {
        "hours": hours,
        "weeks_5hrs": math.ceil(hours / 5),
        "weeks_10hrs": math.ceil(hours / 10),
    }


def get_skill_prerequisites(skill_name: str) -> list[str]:
    """Return prerequisite list, filtering generic placeholders."""
    info = SKILL_DEPENDENCY_GRAPH.get(skill_name, {})
    return [p for p in info.get("prerequisites", []) if p not in ("Any programming language",)]


# ─────────────────────────────────────────────────────────────────────────────
# LEARNING PATH PHASES
# Each skill is broken into structured phases: learn → apply → master
# ─────────────────────────────────────────────────────────────────────────────
SKILL_PHASES: dict[str, list[dict]] = {
    "Testing/TDD": [
        {"phase": 1, "title": "Foundation: pytest & unit tests",
         "topics": ["pytest basics", "test structure", "assertions", "fixtures"],
         "project": "Write 20 unit tests for an existing codebase"},
        {"phase": 2, "title": "Test-Driven Development cycle",
         "topics": ["Red-Green-Refactor", "mocking", "test doubles", "coverage"],
         "project": "Build a simple API with TDD from scratch"},
        {"phase": 3, "title": "Integration & advanced patterns",
         "topics": ["Integration tests", "database fixtures", "property-based testing"],
         "project": "Full test suite with CI integration"},
    ],
    "Docker": [
        {"phase": 1, "title": "Containers & images",
         "topics": ["What is Docker", "Dockerfile", "images vs containers", "port mapping"],
         "project": "Dockerize one of your existing projects"},
        {"phase": 2, "title": "Docker Compose & networking",
         "topics": ["docker-compose.yml", "service networking", "volumes", "environment vars"],
         "project": "Multi-service app (API + DB) with Docker Compose"},
        {"phase": 3, "title": "Production optimisation",
         "topics": ["Multi-stage builds", "non-root user", ".dockerignore", "health checks"],
         "project": "Optimised production Dockerfile with <100MB image"},
    ],
    "CI/CD": [
        {"phase": 1, "title": "GitHub Actions fundamentals",
         "topics": ["Workflows", "triggers", "jobs & steps", "secrets"],
         "project": "Auto-run tests on every pull request"},
        {"phase": 2, "title": "Full pipeline: lint → test → build",
         "topics": ["Linting", "test matrix", "Docker build in CI", "artifacts"],
         "project": "Complete CI pipeline for a Python project"},
        {"phase": 3, "title": "Continuous Deployment",
         "topics": ["Staging environments", "deployment strategies", "rollback"],
         "project": "Auto-deploy to Railway/Render on merge to main"},
    ],
    "PostgreSQL": [
        {"phase": 1, "title": "SQL fundamentals & schema design",
         "topics": ["SELECT/JOIN/GROUP BY", "normalisation", "constraints", "indexes"],
         "project": "Design and query a 5-table schema from scratch"},
        {"phase": 2, "title": "Query optimisation",
         "topics": ["EXPLAIN ANALYZE", "B-tree vs GIN indexes", "N+1 detection", "CTEs"],
         "project": "Optimise 3 slow queries from a real project"},
        {"phase": 3, "title": "Advanced patterns",
         "topics": ["Transactions & ACID", "connection pooling", "JSONB", "partitioning"],
         "project": "Add full-text search + audit log to existing DB"},
    ],
    "Python": [
        {"phase": 1, "title": "Python fundamentals & idioms",
         "topics": ["List comprehensions", "generators", "context managers", "decorators"],
         "project": "Build a CLI tool with argparse + rich"},
        {"phase": 2, "title": "Concurrency & async",
         "topics": ["asyncio", "threading vs multiprocessing", "GIL", "aiohttp"],
         "project": "Async web scraper processing 100 URLs concurrently"},
        {"phase": 3, "title": "Performance & packaging",
         "topics": ["cProfile", "memory_profiler", "packaging with pyproject.toml"],
         "project": "Profile and optimise a data processing script 5×"},
    ],
    "System Design": [
        {"phase": 1, "title": "Core concepts & patterns",
         "topics": ["CAP theorem", "load balancing", "caching strategies", "CDNs"],
         "project": "Design a URL shortener end-to-end"},
        {"phase": 2, "title": "Databases at scale",
         "topics": ["Sharding", "replication", "event sourcing", "CQRS"],
         "project": "Design a notification system for 1M users"},
        {"phase": 3, "title": "Distributed systems",
         "topics": ["Message queues", "saga pattern", "idempotency", "observability"],
         "project": "Design a payment processing system"},
    ],
}

DEFAULT_PHASES = [
    {"phase": 1, "title": "Foundations & core concepts",
     "topics": ["Core syntax & concepts", "official documentation walkthrough"],
     "project": "Build a small project from scratch"},
    {"phase": 2, "title": "Practical application",
     "topics": ["Real-world patterns", "common pitfalls", "best practices"],
     "project": "Integrate into an existing codebase"},
    {"phase": 3, "title": "Mastery & depth",
     "topics": ["Advanced patterns", "performance", "edge cases"],
     "project": "Build something you'd put in your portfolio"},
]


def _get_phases(skill_name: str) -> list[dict]:
    return SKILL_PHASES.get(skill_name, DEFAULT_PHASES)


def _get_project_ideas(skill_name: str) -> list[dict]:
    """Concise project idea list for quick view."""
    ideas = {
        "Testing/TDD": [
            {"title": "Test-drive a REST API", "description": "Write the tests first, then make them pass", "hours": 8},
            {"title": "Retroactively test an old project", "description": "Reach 80% coverage on an existing codebase", "hours": 10},
        ],
        "Docker": [
            {"title": "Dockerize your portfolio project", "description": "Multi-stage build, non-root user, under 100MB", "hours": 6},
            {"title": "Local dev environment", "description": "API + Postgres + Redis all in docker-compose", "hours": 4},
        ],
        "CI/CD": [
            {"title": "GitHub Actions for a Python repo", "description": "lint → test → build → deploy on merge", "hours": 5},
        ],
        "PostgreSQL": [
            {"title": "Query optimization challenge", "description": "Take 3 slow queries and cut their time in half", "hours": 4},
            {"title": "Schema design from scratch", "description": "Design + implement a normalised 5-table schema", "hours": 6},
        ],
        "Python": [
            {"title": "Build a CLI tool", "description": "Async, well-tested, packaged with pyproject.toml", "hours": 10},
        ],
        "System Design": [
            {"title": "Design a URL shortener", "description": "Full architecture document with diagrams", "hours": 4},
            {"title": "Design review peer session", "description": "Review someone else's design and get reviewed", "hours": 3},
        ],
    }
    return ideas.get(skill_name, [
        {"title": f"Build a {skill_name} showcase project", "description": "Something you'd proudly show an interviewer", "hours": 8}
    ])


# ─────────────────────────────────────────────────────────────────────────────
# LLM NARRATIVE ENRICHMENT
# ─────────────────────────────────────────────────────────────────────────────
NARRATIVE_PROMPT = """
You are a senior engineering mentor creating a personalised learning narrative.

CANDIDATE CONTEXT:
{context}

Write a SHORT, motivating 2-3 sentence narrative that:
1. Acknowledges what the candidate already knows (their strengths)
2. Explains why these specific skills are the right next step for THEM
3. Frames the learning as achievable, not overwhelming

Tone: direct, supportive, honest. Like a good mentor, not a salesperson.

OUTPUT: JSON with one field: {{"narrative": "..."}}
"""


async def enrich_with_narrative(plan_context: str) -> Optional[str]:
    """Use LLM to generate a personalised motivating narrative."""
    if not is_llm_available():
        return None
    try:
        result = await call_llm_json(
            NARRATIVE_PROMPT.format(context=plan_context),
            temperature=0.5,
        )
        return result.get("narrative") if result else None
    except Exception as e:
        logger.warning(f"Narrative generation failed: {e}")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# MAIN PLAN GENERATOR
# ─────────────────────────────────────────────────────────────────────────────

def generate_learning_plan_from_gaps(
    gap_analysis: GapAnalysis,
    jd_skills: list,
    resume_skills: Optional[list] = None,
    max_skills: int = 5,
) -> dict:
    """
    Generate the personalised learning plan.

    Priority formula for each gap:
        priority = (jd_criticality_weight × gap_severity) / acquisition_difficulty
        then boosted by adjacency_bonus (Zone of Proximal Development)
    """
    # Build lookup maps
    jd_criticality_map: dict[str, str] = {}
    for s in jd_skills:
        if isinstance(s, dict):
            jd_criticality_map[s.get("name", "")] = s.get("criticality", "medium")

    candidate_skill_names: list[str] = []
    if resume_skills:
        candidate_skill_names = [s.get("name", "") for s in resume_skills if isinstance(s, dict)]

    criticality_weights = {"critical": 4, "high": 3, "medium": 2, "low": 1}

    # Score every actionable gap
    scored_gaps: list[tuple[float, SkillGap]] = []
    for gap in gap_analysis.gaps:
        if gap.gap_type not in ("missing", "overestimated"):
            continue

        crit = jd_criticality_map.get(gap.skill, "medium")
        crit_w = criticality_weights.get(crit, 2)
        gap_severity = abs(gap.gap) if gap.gap is not None else 2.0
        adj_bonus = get_adjacency_bonus(gap.skill, candidate_skill_names)
        difficulty = SKILL_DEPENDENCY_GRAPH.get(gap.skill, {}).get("difficulty", 3)

        # Higher score = higher priority
        score = (crit_w * gap_severity * (1 + adj_bonus)) / difficulty
        scored_gaps.append((score, gap))

    scored_gaps.sort(key=lambda x: x[0], reverse=True)
    top_gaps = [gap for _, gap in scored_gaps[:max_skills]]

    # ── Build each skill entry ─────────────────────────────────────────────
    plan_skills: list[dict] = []
    total_hours = 0

    for i, gap in enumerate(top_gaps):
        current = float(gap.assessed) if gap.assessed is not None else 0.0
        # Target: get them to a solid working level (current + 3 levels, max 7)
        target = min(7.0, current + 3.0)

        adj_bonus = get_adjacency_bonus(gap.skill, candidate_skill_names)
        time_est = estimate_learning_time(gap.skill, current, target, adj_bonus)
        hours = time_est["hours"]
        total_hours += hours

        crit = jd_criticality_map.get(gap.skill, "medium")
        prereqs = get_skill_prerequisites(gap.skill)
        prereq_status = [
            {
                "skill": p,
                "status": "already_have"
                if any(p.lower() in s.lower() for s in candidate_skill_names)
                else "need_to_learn_first",
            }
            for p in prereqs
        ]

        resources = get_resources_for_skill(gap.skill, max_resources=4)
        phases = _get_phases(gap.skill)
        projects = _get_project_ideas(gap.skill)

        # Dynamic "why" text based on gap type + adjacency
        if gap.gap_type == "missing":
            if adj_bonus > 0.5:
                why = (
                    f"{gap.skill} is required by this role (priority: {crit}) and you don't have it yet — "
                    f"but because you already know {', '.join(candidate_skill_names[:2])}, "
                    f"you'll pick it up faster than most. This is your highest-ROI learning investment."
                )
            else:
                why = (
                    f"{gap.skill} is a critical requirement in the JD and completely absent from your background. "
                    f"Acquiring it unlocks this role and opens several adjacent skill paths."
                )
        else:
            why = (
                f"Your resume suggests stronger {gap.skill} proficiency than your answers demonstrated. "
                f"Closing this gap from the inside will significantly improve both your interview performance "
                f"and your day-to-day effectiveness."
            )

        plan_skills.append({
            "priority": i + 1,
            "skill": gap.skill,
            "category": SKILL_DEPENDENCY_GRAPH.get(gap.skill, {}).get("category", "technical"),
            "current_level": current,
            "target_level": target,
            "estimated_hours": hours,
            "weeks_at_5hrs": time_est["weeks_5hrs"],
            "weeks_at_10hrs": time_est["weeks_10hrs"],
            "importance": crit,
            "adjacency_bonus": round(adj_bonus, 2),
            "is_adjacent_skill": adj_bonus > 0.4,
            "why_important": why,
            "prerequisites": prereq_status,
            "phases": phases,
            "resources": resources,
            "projects": projects,
            "unlocks": SKILL_DEPENDENCY_GRAPH.get(gap.skill, {}).get("unlocks", [])[:3],
        })

    # ── Summary ───────────────────────────────────────────────────────────
    weeks_5 = math.ceil(total_hours / 5)
    weeks_10 = math.ceil(total_hours / 10)
    adjacent_count = sum(1 for s in plan_skills if s.get("is_adjacent_skill"))

    summary = {
        "total_hours": total_hours,
        "weeks_5hrs_per_week": weeks_5,
        "weeks_10hrs_per_week": weeks_10,
        "estimated_completion": f"~{weeks_10} weeks at 10 hrs/week",
        "difficulty": "intensive" if total_hours > 120 else "medium" if total_hours > 60 else "achievable",
        "adjacent_skills_count": adjacent_count,
        "skills_count": len(plan_skills),
    }

    # ── Timeline ──────────────────────────────────────────────────────────
    timeline = _build_detailed_timeline(plan_skills)

    # ── Success criteria ──────────────────────────────────────────────────
    success_criteria = [
        f"Can confidently discuss and demonstrate {s['skill']} in a technical interview"
        for s in plan_skills[:3]
    ] + [
        "Re-assessment score improves by 2+ points per skill",
        "Portfolio has at least one project showcasing each priority skill",
    ]

    # ── Narrative (sync fallback; async enrichment available separately) ──
    narrative = _build_fallback_narrative(plan_skills, candidate_skill_names, total_hours)

    return {
        "summary": summary,
        "skills": plan_skills,
        "timeline": timeline,
        "success_criteria": success_criteria,
        "narrative": narrative,
    }


def _build_fallback_narrative(
    plan_skills: list[dict],
    candidate_skills: list[str],
    total_hours: int,
) -> str:
    """Generate a concise narrative without LLM."""
    if not plan_skills:
        return "Your skills are well-aligned with the role. Focus on deepening existing knowledge."

    top = plan_skills[0]["skill"]
    adjacent = [s["skill"] for s in plan_skills if s.get("is_adjacent_skill")]
    non_adjacent = [s["skill"] for s in plan_skills if not s.get("is_adjacent_skill")]

    parts = []
    if candidate_skills:
        known = candidate_skills[:3]
        parts.append(
            f"Your foundation in {', '.join(known)} is solid — "
            f"you're not starting from scratch."
        )

    if adjacent:
        parts.append(
            f"{', '.join(adjacent[:2])} {'build' if len(adjacent) > 1 else 'builds'} "
            f"directly on what you already know, so expect faster progress there."
        )

    if non_adjacent:
        parts.append(
            f"{top} requires dedicated focus but has the highest impact "
            f"on your employability for this role."
        )

    parts.append(
        f"At 10 hrs/week, this entire roadmap takes ~{math.ceil(total_hours/10)} weeks — "
        f"realistic without burning out."
    )

    return " ".join(parts)


def _build_detailed_timeline(plan_skills: list[dict]) -> list[dict]:
    """Build a week-by-week timeline with phase milestones."""
    timeline = []
    week = 1

    for skill in plan_skills:
        phases = skill.get("phases", [])
        weeks_per_phase = max(1, skill.get("weeks_at_10hrs", 3) // max(len(phases), 1))

        for phase in phases:
            end_week = week + weeks_per_phase - 1
            timeline.append({
                "week_start": week,
                "week_end": end_week,
                "skill": skill["skill"],
                "phase": phase["phase"],
                "title": phase["title"],
                "topics": phase.get("topics", []),
                "milestone": phase.get("project", f"Complete {phase['title']}"),
                "hours": math.ceil(skill["estimated_hours"] / max(len(phases), 1)),
            })
            week = end_week + 1

    return timeline
