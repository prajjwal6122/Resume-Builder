"""
Hardcoded fallback questions for each skill — used when LLM fails or in demo mode.
30+ pre-written questions across 6 key skills.
"""

FALLBACK_QUESTIONS = {
    "Python": [
        {
            "id": "py1",
            "text": "Explain the difference between Python generators and regular functions. When would you use a generator, and can you show a practical example?",
            "skill": "Python",
            "difficulty": "intermediate",
            "expected_depth": "Yield vs return, lazy evaluation, memory efficiency, use cases like reading large files or infinite sequences",
            "difficulty_score": 2
        },
        {
            "id": "py2",
            "text": "How do you handle concurrency in Python? Explain the differences between threading, multiprocessing, and async/await, and when you'd choose each.",
            "skill": "Python",
            "difficulty": "intermediate",
            "expected_depth": "GIL limitation, I/O-bound vs CPU-bound, asyncio for I/O, multiprocessing for CPU",
            "difficulty_score": 2
        },
        {
            "id": "py3",
            "text": "Walk me through designing a Python REST API endpoint that must handle 500 concurrent requests. What framework, architecture decisions, and performance considerations apply?",
            "skill": "Python",
            "difficulty": "intermediate",
            "expected_depth": "FastAPI/Flask choice, async handlers, connection pooling, caching, load testing",
            "difficulty_score": 2
        },
        {
            "id": "py4",
            "text": "Describe a real performance problem you've debugged in Python. What tools did you use and what was the root cause?",
            "skill": "Python",
            "difficulty": "advanced",
            "expected_depth": "cProfile, memory_profiler, line_profiler, specific bottleneck identification",
            "difficulty_score": 3
        },
        {
            "id": "py5",
            "text": "What are Python decorators and how do they work under the hood? Write a decorator that adds caching to any function.",
            "skill": "Python",
            "difficulty": "intermediate",
            "expected_depth": "functools.wraps, closure mechanics, LRU cache implementation, handling args/kwargs",
            "difficulty_score": 2
        }
    ],

    "JavaScript": [
        {
            "id": "js1",
            "text": "Explain the JavaScript event loop. How does it handle async operations like setTimeout and fetch, and what's the difference between microtasks and macrotasks?",
            "skill": "JavaScript",
            "difficulty": "intermediate",
            "expected_depth": "Call stack, event loop, task queue, microtask queue (Promises), macrotask queue (setTimeout)",
            "difficulty_score": 2
        },
        {
            "id": "js2",
            "text": "How do closures work in JavaScript? Provide an example of a practical use case and a common pitfall.",
            "skill": "JavaScript",
            "difficulty": "beginner",
            "expected_depth": "Lexical scope, function factory pattern, loop variable capture problem",
            "difficulty_score": 1
        },
        {
            "id": "js3",
            "text": "What are the differences between var, let, and const in JavaScript? What problems did let and const solve?",
            "skill": "JavaScript",
            "difficulty": "beginner",
            "expected_depth": "Hoisting, block vs function scope, temporal dead zone, immutability vs rebinding",
            "difficulty_score": 1
        },
        {
            "id": "js4",
            "text": "Describe how you'd optimize a React application that has performance issues. What tools and techniques would you use?",
            "skill": "JavaScript",
            "difficulty": "advanced",
            "expected_depth": "React DevTools Profiler, memo, useMemo, useCallback, code splitting, virtualization",
            "difficulty_score": 3
        },
        {
            "id": "js5",
            "text": "Explain Promise chaining vs async/await. When would you use Promise.all() vs Promise.allSettled()?",
            "skill": "JavaScript",
            "difficulty": "intermediate",
            "expected_depth": "Error handling differences, parallel vs sequential execution, Promise.all fails fast",
            "difficulty_score": 2
        }
    ],

    "Testing": [
        {
            "id": "test1",
            "text": "Explain the difference between unit tests, integration tests, and end-to-end tests. When would you use each type, and what's the ideal test pyramid ratio?",
            "skill": "Testing/TDD",
            "difficulty": "beginner",
            "expected_depth": "Fast/isolated units, realistic integrations, slow/fragile E2E, 70/20/10 pyramid",
            "difficulty_score": 1
        },
        {
            "id": "test2",
            "text": "How would you test a Python function that calls an external API? Walk me through your approach, including what to mock and how.",
            "skill": "Testing/TDD",
            "difficulty": "intermediate",
            "expected_depth": "unittest.mock, patch decorator, mock_response, test for different status codes, don't test external service",
            "difficulty_score": 2
        },
        {
            "id": "test3",
            "text": "Describe the Test-Driven Development (TDD) workflow. How would you apply it when building a new feature?",
            "skill": "Testing/TDD",
            "difficulty": "intermediate",
            "expected_depth": "Red-Green-Refactor cycle, writing failing test first, minimal code to pass, refactor safely",
            "difficulty_score": 2
        },
        {
            "id": "test4",
            "text": "How do you test database interactions in Python? What's your approach to test isolation and database state management?",
            "skill": "Testing/TDD",
            "difficulty": "intermediate",
            "expected_depth": "pytest fixtures, transaction rollback, test database, factory_boy, freezegun for time",
            "difficulty_score": 2
        }
    ],

    "Docker": [
        {
            "id": "dock1",
            "text": "What's the difference between a Docker image and a Docker container? How does layering in Docker images work?",
            "skill": "Docker",
            "difficulty": "beginner",
            "expected_depth": "Image = template, container = running instance, layers = union filesystem, copy-on-write",
            "difficulty_score": 1
        },
        {
            "id": "dock2",
            "text": "How would you optimize a Dockerfile to produce a smaller, more secure production image?",
            "skill": "Docker",
            "difficulty": "intermediate",
            "expected_depth": "Multi-stage builds, minimal base images (alpine), non-root user, .dockerignore, layer caching",
            "difficulty_score": 2
        },
        {
            "id": "dock3",
            "text": "Explain Docker networking. How would you configure a multi-container application so services can communicate?",
            "skill": "Docker",
            "difficulty": "intermediate",
            "expected_depth": "Bridge network, user-defined networks, service discovery by name, Docker Compose networking",
            "difficulty_score": 2
        }
    ],

    "PostgreSQL": [
        {
            "id": "pg1",
            "text": "Explain the difference between B-tree, Hash, and GIN indexes in PostgreSQL. When would you use each?",
            "skill": "PostgreSQL",
            "difficulty": "intermediate",
            "expected_depth": "B-tree for range/equality, Hash for equality only, GIN for full-text/array/JSONB, partial indexes",
            "difficulty_score": 2
        },
        {
            "id": "pg2",
            "text": "Walk me through diagnosing a slow PostgreSQL query. What does EXPLAIN ANALYZE tell you and what would you look for?",
            "skill": "PostgreSQL",
            "difficulty": "intermediate",
            "expected_depth": "Sequential scan vs index scan, cost estimates, actual vs estimated rows, nested loops",
            "difficulty_score": 2
        },
        {
            "id": "pg3",
            "text": "How do PostgreSQL transactions and ACID properties work? Explain the isolation levels and when you'd choose each.",
            "skill": "PostgreSQL",
            "difficulty": "advanced",
            "expected_depth": "ACID, dirty read, non-repeatable read, phantom read, READ COMMITTED vs SERIALIZABLE",
            "difficulty_score": 3
        }
    ],

    "React": [
        {
            "id": "react1",
            "text": "Explain the React component lifecycle and how hooks like useEffect relate to it. What are common mistakes with useEffect dependencies?",
            "skill": "React",
            "difficulty": "intermediate",
            "expected_depth": "Mounting/updating/unmounting, dependency array, stale closures, cleanup function",
            "difficulty_score": 2
        },
        {
            "id": "react2",
            "text": "How does React's reconciliation algorithm (the 'diffing' algorithm) work? Why is the key prop important in lists?",
            "skill": "React",
            "difficulty": "intermediate",
            "expected_depth": "Virtual DOM, fiber architecture, O(n) diffing heuristics, key for stable identity",
            "difficulty_score": 2
        }
    ],

    "System Design": [
        {
            "id": "sys1",
            "text": "Design a URL shortener service (like bit.ly). Walk through the architecture, database schema, and how you'd handle scale.",
            "skill": "System Design",
            "difficulty": "intermediate",
            "expected_depth": "Base62 encoding, database choice, caching hot URLs, CDN, read-heavy optimization",
            "difficulty_score": 2
        },
        {
            "id": "sys2",
            "text": "How would you design a system to send 1 million email notifications per day? What are the key challenges and how would you address them?",
            "skill": "System Design",
            "difficulty": "advanced",
            "expected_depth": "Message queues, rate limiting per provider, retry with exponential backoff, idempotency, monitoring",
            "difficulty_score": 3
        }
    ]
}


def get_fallback_questions(jd_skills: list, n: int = 6) -> list:
    """
    Get fallback questions based on the top skills from the JD.
    Returns n questions prioritizing skills that appear in the JD.
    """
    questions = []
    used_ids = set()

    # Skill name normalization map
    skill_map = {
        "python": "Python",
        "javascript": "JavaScript",
        "js": "JavaScript",
        "testing": "Testing",
        "tdd": "Testing",
        "test": "Testing",
        "docker": "Docker",
        "postgresql": "PostgreSQL",
        "postgres": "PostgreSQL",
        "sql": "PostgreSQL",
        "react": "React",
        "system design": "System Design"
    }

    # Try to get questions for each JD skill
    for skill_item in jd_skills:
        skill_name = skill_item.get("name", "") if isinstance(skill_item, dict) else str(skill_item)
        normalized = skill_map.get(skill_name.lower(), skill_name)

        if normalized in FALLBACK_QUESTIONS:
            for q in FALLBACK_QUESTIONS[normalized]:
                if q["id"] not in used_ids and len(questions) < n:
                    questions.append(q)
                    used_ids.add(q["id"])

    # Fill with Python questions if not enough
    if len(questions) < n:
        for q in FALLBACK_QUESTIONS.get("Python", []):
            if q["id"] not in used_ids and len(questions) < n:
                questions.append(q)
                used_ids.add(q["id"])

    # Add order index
    for i, q in enumerate(questions):
        q["order"] = i + 1

    return questions[:n]
