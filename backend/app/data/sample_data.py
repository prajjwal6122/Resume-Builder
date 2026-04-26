"""
Sample data for demo mode — Jane Developer persona
This file contains the hardcoded resume, JD, and pre-generated demo data.
"""

SAMPLE_RESUME = """
Jane Developer
Senior Software Engineer
jane.developer@email.com | github.com/janedeveloper | linkedin.com/in/janedeveloper

SUMMARY
Software Engineer with 5 years of experience building scalable web applications.
Strong background in Python backend development and React frontend applications.
Experience with database optimization and REST API design.

TECHNICAL SKILLS
Programming Languages: Python (4 years), JavaScript (3 years), TypeScript (2 years)
Frameworks: Flask, FastAPI, React, Node.js
Databases: PostgreSQL (3 years), MongoDB (1 year), Redis (1 year)
Tools: Docker (1 year), Git, Linux, Nginx
Cloud: AWS (basics - S3, EC2), Heroku

EXPERIENCE

Senior Software Engineer — TechCorp (2023–Present)
- Built and maintained Python/Flask REST APIs serving 50,000+ daily users
- Optimized PostgreSQL queries reducing p95 latency from 800ms to 120ms
- Implemented Redis caching layer cutting database load by 60%
- Led migration from monolith to microservices architecture
- Mentored 2 junior developers

Software Engineer — StartupXYZ (2021–2023)
- Developed React frontend applications with TypeScript
- Built RESTful APIs using Python FastAPI
- Worked with PostgreSQL for data modeling and complex queries
- Deployed applications on AWS (EC2, S3, RDS)
- Collaborated in Agile/Scrum team environment

Junior Developer — WebAgency (2020–2021)
- Full-stack development using Python Django and React
- Database design and optimization
- Frontend styling with Tailwind CSS

EDUCATION
B.S. Computer Science — State University (2020)

PROJECTS
- Resume Builder App: Python FastAPI + React + PostgreSQL
- E-commerce API: Django REST Framework, 10K+ products
- Personal Finance Tracker: React Native + Node.js + MongoDB
"""

SAMPLE_JD = """
Senior Backend Engineer — FinTech Innovators Inc.
Location: Remote (US preferred) | Full-time

ABOUT THE ROLE
We're looking for a Senior Backend Engineer to join our growing team building the next generation
of financial technology products. You'll be working on high-scale systems processing millions of
transactions daily.

REQUIREMENTS
Technical Skills (Required):
- 5+ years of Python backend development (CRITICAL)
- Deep expertise in PostgreSQL — query optimization, indexing, performance tuning (CRITICAL)
- Strong understanding of REST API design principles (CRITICAL)
- Testing and Test-Driven Development (TDD) experience — we don't ship without tests (CRITICAL)
- Docker and containerization (HIGH)
- Experience with CI/CD pipelines (HIGH)
- Redis for caching and message queuing (MEDIUM)
- AWS services (EC2, S3, Lambda) (MEDIUM)

Nice to Have:
- Kubernetes experience
- GraphQL API design
- Financial domain knowledge
- Celery for task queues

Soft Skills:
- Excellent communication skills
- Ability to mentor junior engineers
- Strong problem-solving mindset
- Experience in Agile/Scrum environments

WHAT WE OFFER
- Competitive salary ($150K–$180K)
- Remote-first culture
- Comprehensive health benefits
- Annual learning budget ($2,000/year)
- Stock options
"""

SAMPLE_QUESTIONS = [
    {
        "id": "q1",
        "text": "Describe how you would design a scalable REST API endpoint for user authentication in Python. What security considerations, rate limiting strategies, and token management approaches would you implement?",
        "skill": "Python",
        "difficulty": "intermediate",
        "expected_depth": "Should mention JWT/OAuth, bcrypt for password hashing, rate limiting (Redis or IP-based), token refresh strategy, HTTPS enforcement, input validation",
        "why_this_question": "Tests real-world API design thinking — common gap area for candidates who claim Python experience",
        "difficulty_score": 2,
        "order": 1
    },
    {
        "id": "q2",
        "text": "Walk me through your debugging process for a PostgreSQL query that takes 10+ seconds to execute. What tools and techniques would you use to diagnose and fix the performance issue?",
        "skill": "PostgreSQL",
        "difficulty": "intermediate",
        "expected_depth": "Should mention EXPLAIN ANALYZE, index analysis, N+1 query detection, query rewriting, partial indexes, covering indexes, connection pooling",
        "why_this_question": "Separates candidates who know SQL from those who can actually optimize it under pressure",
        "difficulty_score": 2,
        "order": 2
    },
    {
        "id": "q3",
        "text": "How do you approach writing tests for a complex Python service that interacts with a database and external APIs? What testing strategies, tools, and patterns do you use?",
        "skill": "Testing/TDD",
        "difficulty": "intermediate",
        "expected_depth": "Should mention pytest, mocking (unittest.mock), fixtures, database test isolation, factory_boy, testing async code, integration vs unit tests",
        "why_this_question": "Testing is CRITICAL for this role. This catches the very common gap where Python devs claim experience but don't test",
        "difficulty_score": 2,
        "order": 3
    },
    {
        "id": "q4",
        "text": "Explain what happens when you run 'docker build -t myapp .' and then 'docker run -p 8080:8000 myapp'. What's happening at each step, and how would you optimize the Docker image for production?",
        "skill": "Docker",
        "difficulty": "beginner",
        "expected_depth": "Should explain image layers, Dockerfile instructions, container networking, port mapping, multi-stage builds, .dockerignore",
        "why_this_question": "Tests basic Docker understanding — catches fake experience immediately",
        "difficulty_score": 1,
        "order": 4
    },
    {
        "id": "q5",
        "text": "You've been tasked with designing a system to process 10,000 financial transactions per hour with zero data loss. What architecture decisions would you make, and how would you handle failures?",
        "skill": "System Design",
        "difficulty": "advanced",
        "expected_depth": "Should discuss message queues, idempotency, retry logic, dead letter queues, database transactions, ACID properties, monitoring",
        "why_this_question": "Tests system-level thinking for high-stakes financial systems",
        "difficulty_score": 3,
        "order": 5
    },
    {
        "id": "q6",
        "text": "How would you implement a CI/CD pipeline for a Python microservice? What stages would you include and why?",
        "skill": "CI/CD",
        "difficulty": "intermediate",
        "expected_depth": "Should mention linting, unit tests, integration tests, Docker build, staging deployment, production deployment, rollback strategy",
        "why_this_question": "Senior engineers should understand deployment pipelines — critical for team velocity",
        "difficulty_score": 2,
        "order": 6
    }
]

# Pre-scored demo evaluation for Q1 (shown instantly in demo mode)
SAMPLE_EVALUATION_Q1 = {
    "question_id": "q1",
    "answer_text": "For user authentication in Python, I'd use JWT tokens with Flask-JWT-Extended or FastAPI's OAuth2 implementation. The endpoint would accept email/password, validate against bcrypt-hashed passwords in the database, and return a signed JWT with expiry. For rate limiting I'd use Redis to track attempts per IP address — block after 5 failures in 10 minutes. Refresh tokens would be stored in the database and invalidated on logout.",
    "score_breakdown": {
        "correctness": 2,
        "depth": 1,
        "examples": 1,
        "clarity": 1,
        "confidence": 0
    },
    "total_score": 5.5,
    "reasoning": "The answer correctly identifies core authentication components: JWT, bcrypt, and rate limiting with Redis. The candidate shows practical knowledge of Flask-JWT-Extended. However, the answer lacks depth — no mention of token rotation strategy, HTTPS enforcement, or security headers. The rate limiting strategy is correct in concept but doesn't address distributed systems. The overconfident framing ('I'd use...') without acknowledging trade-offs is noted. Missing: refresh token expiry strategy, account lockout vs. progressive delays, monitoring for brute force attacks.",
    "red_flags": [
        "Didn't mention HTTPS/TLS enforcement",
        "No mention of CSRF protection for cookie-based tokens",
        "Absolute framing without acknowledging trade-offs"
    ],
    "strengths": [
        "Correctly identified bcrypt for password hashing",
        "Redis-based rate limiting is the right approach",
        "Understands JWT token structure"
    ],
    "follow_up_needed": True,
    "follow_up_question": "How would you handle token refresh across multiple devices, and what happens if a refresh token is stolen?",
    "is_fallback": False
}

SAMPLE_RESULTS = {
    "skill_scores": [
        {
            "skill": "Python",
            "claimed_level": 7,
            "assessed_level": 5.5,
            "gap": -1.5,
            "gap_type": "overestimated",
            "severity": "medium",
            "confidence_interval": "±0.8",
            "match_quality": "partial",
            "questions_asked": 1
        },
        {
            "skill": "PostgreSQL",
            "claimed_level": 6,
            "assessed_level": 5,
            "gap": -1.0,
            "gap_type": "accurate",
            "severity": "low",
            "confidence_interval": "±0.9",
            "match_quality": "good",
            "questions_asked": 1
        },
        {
            "skill": "Testing/TDD",
            "claimed_level": 0,
            "assessed_level": 0,
            "gap": 0,
            "gap_type": "missing",
            "severity": "high",
            "confidence_interval": "±0.5",
            "match_quality": "gap",
            "questions_asked": 1
        },
        {
            "skill": "Docker",
            "claimed_level": 3,
            "assessed_level": 2,
            "gap": -1.0,
            "gap_type": "overestimated",
            "severity": "low",
            "confidence_interval": "±0.7",
            "match_quality": "partial",
            "questions_asked": 1
        },
        {
            "skill": "System Design",
            "claimed_level": 4,
            "assessed_level": 5,
            "gap": 1.0,
            "gap_type": "underestimated",
            "severity": "positive",
            "confidence_interval": "±1.0",
            "match_quality": "strength",
            "questions_asked": 1
        },
        {
            "skill": "CI/CD",
            "claimed_level": 0,
            "assessed_level": 2,
            "gap": 2.0,
            "gap_type": "underestimated",
            "severity": "positive",
            "confidence_interval": "±0.8",
            "match_quality": "strength",
            "questions_asked": 1
        }
    ],
    "gaps_summary": {
        "overestimation_count": 2,
        "underestimation_count": 2,
        "accurate_count": 1,
        "missing_count": 1,
        "overall_calibration": "moderate",
        "assessment_reliability": 0.82
    },
    "narrative": "Jane shows strong practical knowledge in Python and PostgreSQL, though slightly overstated on resume. The critical gap is Testing/TDD — the JD requires it, and it's completely absent from her background. Surprisingly strong in system design and CI/CD knowledge. Immediate priority: establish a testing practice before applying to this role."
}

SAMPLE_LEARNING_PLAN = {
    "narrative": (
        "Your foundation in Python, PostgreSQL, and Flask is solid — you're not starting from scratch. "
        "Testing/TDD builds directly on your Python knowledge, so expect faster progress there than the hours suggest. "
        "Docker is adjacent to your Linux/AWS work. At 10 hrs/week, this roadmap takes ~10 weeks — "
        "realistic without burning out."
    ),
    "summary": {
        "total_hours": 95,
        "weeks_5hrs_per_week": 19,
        "weeks_10hrs_per_week": 10,
        "estimated_completion": "~10 weeks at 10 hrs/week",
        "difficulty": "medium",
        "adjacent_skills_count": 2,
        "skills_count": 4,
    },
    "skills": [
        {
            "priority": 1,
            "skill": "Testing & TDD (pytest)",
            "category": "methodology",
            "current_level": 0,
            "target_level": 4,
            "estimated_hours": 30,
            "weeks_at_5hrs": 6,
            "importance": "critical",
            "why_important": "This JD explicitly requires TDD experience. You have 0 testing background — this is the #1 gap between you and the role. Senior engineers who can't write tests are a liability.",
            "prerequisites": [{"skill": "Python", "target_level": 3, "status": "already_have"}],
            "resources": [
                {
                    "title": "pytest Official Documentation",
                    "url": "https://docs.pytest.org/",
                    "type": "documentation",
                    "difficulty": "beginner",
                    "duration_hours": 2,
                    "cost": "free",
                    "rating": 4.9
                },
                {
                    "title": "Python Testing with pytest (Brian Okken)",
                    "url": "https://pragprog.com/titles/bopytest2/python-testing-with-pytest/",
                    "type": "book",
                    "difficulty": "beginner-intermediate",
                    "duration_hours": 15,
                    "cost": "$35",
                    "rating": 4.8
                },
                {
                    "title": "Test-Driven Development with Python (Harry Percival)",
                    "url": "https://www.obeythetestinggoat.com/",
                    "type": "book",
                    "difficulty": "intermediate",
                    "duration_hours": 20,
                    "cost": "free",
                    "rating": 4.7
                }
            ]
        },
        {
            "priority": 2,
            "skill": "Docker & Containerization",
            "category": "tool",
            "current_level": 2,
            "target_level": 5,
            "estimated_hours": 25,
            "weeks_at_5hrs": 5,
            "importance": "high",
            "why_important": "Docker is required by the JD. Your current experience is basic — you need to be comfortable with multi-stage builds, Docker Compose, and production optimization.",
            "prerequisites": [{"skill": "Linux basics", "target_level": 2, "status": "need_basics"}],
            "resources": [
                {
                    "title": "Docker Official Documentation",
                    "url": "https://docs.docker.com/get-started/",
                    "type": "documentation",
                    "difficulty": "beginner",
                    "duration_hours": 3,
                    "cost": "free",
                    "rating": 4.8
                },
                {
                    "title": "Docker Mastery (Bret Fisher) — Udemy",
                    "url": "https://www.udemy.com/course/docker-mastery/",
                    "type": "course",
                    "difficulty": "beginner-intermediate",
                    "duration_hours": 19,
                    "cost": "$14.99",
                    "rating": 4.8
                }
            ]
        },
        {
            "priority": 3,
            "skill": "CI/CD Pipelines",
            "category": "devops",
            "current_level": 2,
            "target_level": 4,
            "estimated_hours": 20,
            "weeks_at_5hrs": 4,
            "importance": "high",
            "why_important": "The JD requires CI/CD experience. Your assessment showed surprising knowledge here — you just need to formalize and practice it.",
            "prerequisites": [
                {"skill": "Docker", "target_level": 3, "status": "learning"},
                {"skill": "Testing", "target_level": 3, "status": "learning"}
            ],
            "resources": [
                {
                    "title": "GitHub Actions Documentation",
                    "url": "https://docs.github.com/en/actions",
                    "type": "documentation",
                    "difficulty": "beginner",
                    "duration_hours": 3,
                    "cost": "free",
                    "rating": 4.7
                },
                {
                    "title": "The DevOps Handbook",
                    "url": "https://itrevolution.com/product/the-devops-handbook/",
                    "type": "book",
                    "difficulty": "intermediate",
                    "duration_hours": 15,
                    "cost": "$30",
                    "rating": 4.8
                }
            ]
        },
        {
            "priority": 4,
            "skill": "Advanced Python Patterns",
            "category": "programming-language",
            "current_level": 5.5,
            "target_level": 7,
            "estimated_hours": 20,
            "weeks_at_5hrs": 4,
            "importance": "medium",
            "why_important": "Your Python score showed room for improvement in depth. Focus on async programming, context managers, decorators, and design patterns.",
            "prerequisites": [],
            "resources": [
                {
                    "title": "Fluent Python (Luciano Ramalho)",
                    "url": "https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/",
                    "type": "book",
                    "difficulty": "intermediate-advanced",
                    "duration_hours": 30,
                    "cost": "$60",
                    "rating": 4.9
                },
                {
                    "title": "Real Python — Advanced Tutorials",
                    "url": "https://realpython.com/tutorials/advanced/",
                    "type": "tutorials",
                    "difficulty": "intermediate",
                    "duration_hours": 10,
                    "cost": "free",
                    "rating": 4.8
                }
            ]
        }
    ],
    "timeline": {
        "month_1": {
            "focus": ["Testing fundamentals (pytest)", "Start Docker deep-dive"],
            "hours": 40,
            "milestones": ["Write 50+ tests for existing projects", "Get pytest confidence up"]
        },
        "month_2": {
            "focus": ["TDD practice", "Docker Compose & production", "CI/CD with GitHub Actions"],
            "hours": 35,
            "milestones": ["Build fully containerized app with tests", "Set up CI pipeline"]
        },
        "month_3": {
            "focus": ["Advanced Python", "Integration practice", "Real project application"],
            "hours": 20,
            "milestones": ["Apply TDD to a real project", "Full CI/CD pipeline live"]
        }
    },
    "success_criteria": [
        "Can write unit and integration tests for complex Python services",
        "Comfortable with pytest fixtures, mocking, and async testing",
        "Can Dockerize a multi-service application with Docker Compose",
        "Has a working CI/CD pipeline on GitHub Actions",
        "Python assessment score improves from 5.5 to 7+ on re-assessment"
    ]
}
