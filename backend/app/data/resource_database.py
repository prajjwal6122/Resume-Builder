"""
Curated resource database for common skills.
Hardcoded for demo reliability — no external API needed.
"""

RESOURCE_DATABASE = {
    "Python": [
        {
            "title": "Python Official Documentation",
            "url": "https://docs.python.org/3/",
            "type": "documentation",
            "difficulty": "all",
            "duration_hours": 10,
            "cost": "free",
            "rating": 4.9
        },
        {
            "title": "Real Python Tutorials",
            "url": "https://realpython.com/",
            "type": "tutorials",
            "difficulty": "beginner-intermediate",
            "duration_hours": 20,
            "cost": "free",
            "rating": 4.8
        },
        {
            "title": "Fluent Python (Luciano Ramalho)",
            "url": "https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/",
            "type": "book",
            "difficulty": "intermediate-advanced",
            "duration_hours": 30,
            "cost": "$60",
            "rating": 4.9
        }
    ],
    "JavaScript": [
        {
            "title": "MDN Web Docs — JavaScript",
            "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
            "type": "documentation",
            "difficulty": "all",
            "duration_hours": 8,
            "cost": "free",
            "rating": 4.9
        },
        {
            "title": "JavaScript.info — The Modern JS Tutorial",
            "url": "https://javascript.info/",
            "type": "tutorials",
            "difficulty": "beginner-advanced",
            "duration_hours": 25,
            "cost": "free",
            "rating": 4.9
        },
        {
            "title": "You Don't Know JS (Kyle Simpson)",
            "url": "https://github.com/getify/You-Dont-Know-JS",
            "type": "book",
            "difficulty": "intermediate",
            "duration_hours": 20,
            "cost": "free",
            "rating": 4.8
        }
    ],
    "Testing": [
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
            "title": "Test-Driven Development with Python (Percival)",
            "url": "https://www.obeythetestinggoat.com/",
            "type": "book",
            "difficulty": "intermediate",
            "duration_hours": 20,
            "cost": "free",
            "rating": 4.7
        },
        {
            "title": "Python Testing with pytest (Brian Okken)",
            "url": "https://pragprog.com/titles/bopytest2/python-testing-with-pytest/",
            "type": "book",
            "difficulty": "beginner-intermediate",
            "duration_hours": 15,
            "cost": "$35",
            "rating": 4.8
        }
    ],
    "Docker": [
        {
            "title": "Docker Official Documentation — Get Started",
            "url": "https://docs.docker.com/get-started/",
            "type": "documentation",
            "difficulty": "beginner",
            "duration_hours": 3,
            "cost": "free",
            "rating": 4.8
        },
        {
            "title": "Docker Mastery: with Kubernetes +Swarm (Udemy)",
            "url": "https://www.udemy.com/course/docker-mastery/",
            "type": "course",
            "difficulty": "beginner-intermediate",
            "duration_hours": 19,
            "cost": "$14.99",
            "rating": 4.8
        },
        {
            "title": "Play with Docker — Free Hands-On Labs",
            "url": "https://labs.play-with-docker.com/",
            "type": "interactive",
            "difficulty": "beginner",
            "duration_hours": 5,
            "cost": "free",
            "rating": 4.6
        }
    ],
    "PostgreSQL": [
        {
            "title": "PostgreSQL Official Documentation",
            "url": "https://www.postgresql.org/docs/",
            "type": "documentation",
            "difficulty": "all",
            "duration_hours": 10,
            "cost": "free",
            "rating": 4.8
        },
        {
            "title": "Use The Index, Luke! — SQL Indexing Guide",
            "url": "https://use-the-index-luke.com/",
            "type": "tutorials",
            "difficulty": "intermediate",
            "duration_hours": 8,
            "cost": "free",
            "rating": 4.9
        },
        {
            "title": "Mastering PostgreSQL in Application Development",
            "url": "https://masteringpostgresql.com/",
            "type": "book",
            "difficulty": "intermediate-advanced",
            "duration_hours": 15,
            "cost": "$40",
            "rating": 4.7
        }
    ],
    "React": [
        {
            "title": "React Official Documentation",
            "url": "https://react.dev/",
            "type": "documentation",
            "difficulty": "beginner",
            "duration_hours": 5,
            "cost": "free",
            "rating": 4.9
        },
        {
            "title": "Epic React (Kent C. Dodds)",
            "url": "https://epicreact.dev/",
            "type": "course",
            "difficulty": "intermediate-advanced",
            "duration_hours": 35,
            "cost": "$299",
            "rating": 4.9
        }
    ],
    "TypeScript": [
        {
            "title": "TypeScript Official Handbook",
            "url": "https://www.typescriptlang.org/docs/handbook/intro.html",
            "type": "documentation",
            "difficulty": "beginner",
            "duration_hours": 5,
            "cost": "free",
            "rating": 4.8
        },
        {
            "title": "Total TypeScript (Matt Pocock)",
            "url": "https://www.totaltypescript.com/",
            "type": "course",
            "difficulty": "intermediate",
            "duration_hours": 20,
            "cost": "free",
            "rating": 4.9
        }
    ],
    "CI/CD": [
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
    ],
    "AWS": [
        {
            "title": "AWS Free Tier + Official Docs",
            "url": "https://aws.amazon.com/free/",
            "type": "documentation",
            "difficulty": "beginner",
            "duration_hours": 10,
            "cost": "free",
            "rating": 4.6
        },
        {
            "title": "AWS Certified Solutions Architect (A Cloud Guru)",
            "url": "https://acloudguru.com/course/aws-certified-solutions-architect-associate-saa-c03",
            "type": "course",
            "difficulty": "intermediate",
            "duration_hours": 40,
            "cost": "$39/mo",
            "rating": 4.7
        }
    ],
    "System Design": [
        {
            "title": "System Design Primer (GitHub)",
            "url": "https://github.com/donnemartin/system-design-primer",
            "type": "documentation",
            "difficulty": "intermediate",
            "duration_hours": 15,
            "cost": "free",
            "rating": 4.9
        },
        {
            "title": "Designing Data-Intensive Applications (Kleppmann)",
            "url": "https://dataintensive.net/",
            "type": "book",
            "difficulty": "intermediate-advanced",
            "duration_hours": 30,
            "cost": "$50",
            "rating": 4.9
        }
    ]
}


def get_resources_for_skill(skill_name: str, max_resources: int = 3) -> list:
    """Get curated resources for a skill, with fallback to generic resources."""
    # Normalize skill name
    name_map = {
        "testing/tdd": "Testing",
        "tdd": "Testing",
        "pytest": "Testing",
        "ci/cd": "CI/CD",
        "cicd": "CI/CD",
        "postgres": "PostgreSQL",
        "postgresql": "PostgreSQL",
        "js": "JavaScript",
        "typescript": "TypeScript",
        "ts": "TypeScript",
    }
    
    normalized = name_map.get(skill_name.lower(), skill_name)
    
    # Try exact match first
    if normalized in RESOURCE_DATABASE:
        return RESOURCE_DATABASE[normalized][:max_resources]
    
    # Try case-insensitive match
    for key, resources in RESOURCE_DATABASE.items():
        if key.lower() == normalized.lower():
            return resources[:max_resources]
    
    # Fallback: return generic learning resources
    return [
        {
            "title": f"{skill_name} — Official Documentation",
            "url": f"https://www.google.com/search?q={skill_name.replace(' ', '+')}+documentation",
            "type": "documentation",
            "difficulty": "beginner",
            "duration_hours": 5,
            "cost": "free",
            "rating": 4.5
        }
    ]
