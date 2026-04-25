# AI System Design & Prompting Guide
## MOST CRITICAL DOCUMENT
## AI-Powered Skill Assessment & Personalized Learning Plan Agent

---

## AI System Overview

The AI system consists of 5 interconnected components, each using carefully crafted prompts and scoring logic:

1. **Skill Extraction** – Parse JD + Resume → Extract required and claimed skills
2. **Question Generation** – Generate targeted questions based on resume + skills
3. **Answer Evaluation** – Score answers on 5 dimensions using a rubric
4. **Gap Analysis** – Compare claimed vs assessed, identify anomalies
5. **Learning Plan** – Recommend adjacent skills + resources + time estimates

Each component is designed to be **interpretable, auditable, and difficult to game**.

---

## 1. Skill Extraction Engine

### **Purpose**
Parse unstructured resume/JD text and extract:
- Skill names (canonical form)
- Skill level / years of experience (resume only)
- Skill criticality (JD only)
- Category (programming language, framework, tool, soft skill, etc.)

### **Architecture**

```
Input: Resume text OR JD text
  ↓
LLM Prompt (Skill Extraction)
  ↓
Raw JSON response
  ↓
Post-processing (deduplication, normalization)
  ↓
Output: Structured skill list
```

### **Skill Extraction Prompt**

```
You are an expert technical recruiter and skill analyst. 
Your job is to extract technical and professional skills from a resume or job description.

TASK:
Extract ALL explicitly mentioned skills from the provided TEXT.
For each skill, determine:
1. Skill name (standardized, singular form)
2. Category (programming-language, framework, tool, database, soft-skill, methodology, etc.)
3. Years of experience (resume only, omit for JD)
4. Proficiency level (resume only: beginner, intermediate, advanced, expert)
5. Criticality (JD only: critical, high, medium, low - how essential for the role)

RULES:
- Extract compound skills (e.g., "React.js" → "React", "Flask REST API" → "Flask")
- Only extract genuine technical skills (not "team player", "hard-working", etc.)
- Normalize names (JavaScript, js, JS → JavaScript)
- For resume: if years not mentioned, infer from context
- For JD: if not mentioned, infer from phrasing ("must have" = critical, "nice-to-have" = low)

TEXT:
{text}

OUTPUT FORMAT (JSON):
{
  "skills": [
    {
      "name": "Python",
      "category": "programming-language",
      "years": 3,  // resume only
      "proficiency": "advanced",  // resume only
      "criticality": "critical"  // jd only
    },
    ...
  ],
  "extraction_confidence": 0.92,  // 0-1, how confident in extraction
  "notes": "Found X skills, Y of which are software-related"
}
```

### **Output Format**

```json
{
  "skills": [
    {
      "name": "Python",
      "category": "programming-language",
      "years": 3,
      "proficiency": "advanced",
      "criticality": "critical"
    },
    {
      "name": "PostgreSQL",
      "category": "database",
      "years": 2,
      "proficiency": "intermediate",
      "criticality": "high"
    },
    {
      "name": "Docker",
      "category": "tool",
      "years": 1,
      "proficiency": "beginner",
      "criticality": "medium"
    }
  ],
  "extraction_confidence": 0.88,
  "total_skills_found": 23
}
```

### **Post-Processing Logic**

```python
def normalize_skills(raw_skills):
    """
    Deduplicate and normalize skill names
    """
    skill_map = {
        'js': 'JavaScript',
        'ts': 'TypeScript',
        'py': 'Python',
        'postgres': 'PostgreSQL',
        'mongo': 'MongoDB',
        'rest api': 'REST APIs',
        'graphql': 'GraphQL',
        # ... more mappings
    }
    
    normalized = []
    seen_skills = set()
    
    for skill in raw_skills:
        name = skill['name'].lower()
        canonical = skill_map.get(name, name.title())
        
        if canonical not in seen_skills:
            skill['name'] = canonical
            normalized.append(skill)
            seen_skills.add(canonical)
    
    return normalized
```

### **Validation Rules**

```python
def validate_extraction(skills, source_type):
    """
    Filter out low-confidence extractions
    """
    valid_categories = [
        'programming-language', 'framework', 'library',
        'database', 'tool', 'platform', 'cloud',
        'methodology', 'soft-skill'
    ]
    
    validated = []
    for skill in skills:
        # Must have name and category
        if not skill.get('name') or not skill.get('category'):
            continue
        
        # Category must be valid
        if skill['category'] not in valid_categories:
            skill['category'] = 'other'
        
        # Resume: years must be 0-60
        if source_type == 'resume':
            skill['years'] = max(0, min(60, skill.get('years', 0)))
        
        validated.append(skill)
    
    return validated
```

---

## 2. Question Generation Engine

### **Purpose**
Generate targeted assessment questions based on:
- Resume skills (what they claim)
- JD skills (what's required)
- Difficulty level progression (beginner → intermediate → advanced)
- Anti-bluff mechanisms (practical, scenario-based)

### **Architecture**

```
Input: Resume text, JD skills, resume skills
  ↓
LLM Prompt (Question Generation)
  ↓
Raw question list (5-7 questions)
  ↓
Validation (diversity, difficulty, clarity)
  ↓
Output: Structured question list
```

### **Question Generation Prompt**

```
You are an expert technical interviewer. 
You need to generate tough but fair questions to assess a candidate's technical skills.

CONTEXT:
- Candidate's Resume: {resume_text}
- Candidate's Claimed Skills: {claimed_skills}
- Job Requirements: {jd_skills}

TASK:
Generate 6-8 assessment questions that:
1. Test the MOST CRITICAL skills from the job description
2. Prioritize skills the candidate claims experience with
3. Dig for PRACTICAL KNOWLEDGE (not theory)
4. Increase in difficulty (2-3 beginner, 2-3 intermediate, 1-2 advanced)
5. Detect overconfidence and gaps

GUIDELINES:
- Each question should have a clear correct answer
- Ask "how would you" or "explain how you would" (practical)
- Avoid yes/no questions
- Include edge cases or error scenarios
- Skip obvious/memorization questions
- Tailor to the candidate's experience level

QUESTION FORMAT:
For each question, provide:
- Question text (1-2 sentences, clear and specific)
- Skill being tested
- Difficulty level (beginner, intermediate, advanced)
- Expected depth (1-2 sentences minimum answer)
- Why this question matters (for interviewer notes)

EXAMPLE (DO NOT COPY):
Q: You're building a REST API that needs to handle 1000 requests/second. Your database queries are getting slow. Walk me through how you'd diagnose and fix this.
- Skill: Database Optimization
- Difficulty: Intermediate
- Expected depth: Should mention indexing, query optimization, caching, maybe load testing
- Why: Tests practical SQL optimization skills, not just syntax

GENERATE:
{generate_questions_json}
```

### **Output Format**

```json
{
  "questions": [
    {
      "id": "q1",
      "text": "Describe how you would design a scalable REST API endpoint for user authentication. What would you consider for security, rate limiting, and token refresh?",
      "skill": "Python",
      "difficulty": "intermediate",
      "expected_depth": "Should mention JWT/OAuth, password hashing (bcrypt), rate limiting strategies, token refresh logic, HTTPS",
      "why_this_question": "Tests real-world API design thinking, common pitfall area for overconfident juniors",
      "difficulty_score": 2  // 1=easy, 3=hard
    },
    {
      "id": "q2",
      "text": "You have a PostgreSQL query that takes 10 seconds to run. Show me your debugging process.",
      "skill": "PostgreSQL",
      "difficulty": "intermediate",
      "expected_depth": "Should mention EXPLAIN ANALYZE, indexes, query optimization, maybe adding indexes, or query rewrite",
      "why_this_question": "Practical database troubleshooting; separates talkers from doers",
      "difficulty_score": 2
    },
    {
      "id": "q3",
      "text": "Explain what happens when you run 'docker run -it ubuntu bash'. What happens inside and outside the container?",
      "skill": "Docker",
      "difficulty": "beginner",
      "expected_depth": "Should explain container isolation, process namespacing, image vs container distinction",
      "why_this_question": "Tests basic Docker understanding; catches fake experience",
      "difficulty_score": 1
    }
  ],
  "total_questions": 6,
  "difficulty_distribution": {
    "beginner": 2,
    "intermediate": 3,
    "advanced": 1
  }
}
```

### **Question Diversity Logic**

```python
def validate_questions(questions, min_questions=5, max_questions=8):
    """
    Ensure questions are diverse and well-distributed
    """
    # Check distribution
    difficulties = [q['difficulty'] for q in questions]
    assert difficulties.count('beginner') >= 2, "Need at least 2 beginner questions"
    assert difficulties.count('intermediate') >= 2, "Need at least 2 intermediate questions"
    
    # Check skill diversity
    skills = [q['skill'] for q in questions]
    unique_skills = len(set(skills))
    assert unique_skills >= 4, f"Only {unique_skills} unique skills (need 4+)"
    
    # Check length
    assert len(questions) >= min_questions, f"Only {len(questions)} questions (need {min_questions})"
    assert len(questions) <= max_questions, f"{len(questions)} questions exceed max {max_questions}"
    
    return questions
```

---

## 3. Answer Evaluation Engine (CRITICAL)

### **Purpose**
Score each answer on 5 dimensions to assess TRUE proficiency.

**This is where we catch overconfidence.**

### **Evaluation Rubric**

```
Each answer is evaluated on these 5 dimensions:

1. CORRECTNESS (0-2)
   - 0: Incorrect or completely off-topic
   - 1: Partially correct, significant gaps
   - 2: Correct, accurate, shows understanding

2. DEPTH (0-2)
   - 0: Surface-level or memorized, no real understanding
   - 1: Some depth, explains some concepts but missing details
   - 2: Deep, explains underlying concepts, trade-offs, considerations

3. PRACTICAL EXAMPLES (0-2)
   - 0: No examples or irrelevant examples
   - 1: Generic example or specific but incomplete example
   - 2: Specific, relevant, real-world example (code snippet, scenario)

4. CLARITY (0-1)
   - 0: Unclear, rambling, hard to follow
   - 1: Clear, well-structured, easy to follow

5. CONFIDENCE CALIBRATION (0-1)
   - 0: Overconfident (uses absolute language, won't admit uncertainty)
   - 1: Appropriately confident (admits what they don't know, nuanced)

FINAL SCORE = SUM(all dimensions) = 0-8

PROFICIENCY MAPPING:
- 0-1: No proficiency
- 2-3: Beginner
- 4-5: Intermediate
- 6-7: Advanced
- 8: Expert
```

### **Evaluation Prompt**

```
You are an expert technical interviewer evaluating a candidate's answer.

QUESTION:
{question}

EXPECTED DEPTH:
{expected_depth}

CANDIDATE'S ANSWER:
{answer}

EVALUATION TASK:
Evaluate this answer on 5 dimensions. Be STRICT and FAIR.

1. CORRECTNESS (0-2)
   - Is the core answer factually correct?
   - Are there any red flags or misconceptions?

2. DEPTH (0-2)
   - Does the answer show deep understanding or just surface-level knowledge?
   - Are edge cases, trade-offs, or considerations mentioned?
   - Can they explain WHY, not just HOW?

3. PRACTICAL EXAMPLES (0-2)
   - Are there concrete, specific examples?
   - Code snippets? Real-world scenarios?
   - Or just generic statements?

4. CLARITY (0-1)
   - Is the answer easy to follow?
   - Is it well-structured?
   - Or is it rambling and confusing?

5. CONFIDENCE CALIBRATION (0-1)
   - Does the candidate admit what they don't know?
   - Use absolute language ("always", "never") inappropriately?
   - Or appropriately qualified ("in most cases", "it depends")?

IMPORTANT:
- Candidates who sound confident but miss basic concepts = LOW score
- Candidates who say "I'm not sure" about basics = RED FLAG
- Look for buzzword salad without real understanding
- Recognize false certainty

OUTPUT FORMAT (JSON):
{
  "score_correctness": 2,
  "score_depth": 1,
  "score_examples": 1,
  "score_clarity": 1,
  "score_confidence": 0,
  "total_score": 5,
  "reasoning": "The answer correctly identifies Flask-JWT, but shows limited depth in authentication strategies. No examples of actual implementation or error handling. Overconfident language ('the right way to do it') without acknowledging edge cases.",
  "red_flags": [
    "Didn't mention bcrypt for password hashing",
    "Claimed one approach works for all use cases"
  ],
  "strengths": [
    "Correct base concept",
    "Mentions JWT"
  ],
  "follow_up_needed": true,
  "follow_up_question": "How would you handle token refresh on the frontend? What happens if the refresh token expires?"
}
```

### **Anti-Bluff Mechanisms**

```python
def detect_overconfidence(answer, score_dict):
    """
    Detect signs of overconfidence or buzzword salad
    """
    red_flags = []
    
    # Absolute language without qualification
    absolutes = ['always', 'never', 'the only way', 'must have', 'definitely']
    for absolute in absolutes:
        if absolute in answer.lower():
            red_flags.append(f"Used absolute language: '{absolute}'")
    
    # Buzzwords without explanation
    buzzwords = ['scalable', 'enterprise', 'cloud-native', 'microservices']
    for buzzword in buzzwords:
        if buzzword in answer.lower():
            if score_dict['score_depth'] < 2:
                red_flags.append(f"Mentioned '{buzzword}' but depth score is low")
    
    # Claimed confident but wrong answer
    if score_dict['score_confidence'] == 1 and score_dict['score_correctness'] < 1:
        red_flags.append("Confident but incorrect answer (major red flag)")
    
    # Very short answer but high confidence
    if len(answer.split()) < 50 and score_dict['score_confidence'] == 1:
        if score_dict['score_depth'] < 2:
            red_flags.append("Short answer with high confidence but low depth")
    
    return red_flags

def adjust_score_for_red_flags(base_score, red_flags):
    """
    Penalize overconfident answers
    """
    penalty = len(red_flags) * 0.5
    adjusted_score = max(0, base_score - penalty)
    return adjusted_score
```

### **Evaluation Streaming**

```
For real-time UX, stream evaluation to client:

1. Send: "Analyzing correctness..."
   (LLM thinking about correctness)

2. Send: "This answer shows X but misses Y..."
   (Partial reasoning)

3. Send: "Score breakdown: Correctness 2/2, Depth 1/2..."
   (Scores appear)

4. Send: "Total: 5/8. Strong foundation, but needs deeper understanding of..."
   (Final score and summary)
```

---

## 4. Gap Analysis Engine

### **Purpose**
Compare claimed vs assessed skills to identify:
- Overestimated skills (red flag for overconfidence)
- Underestimated skills (hidden strengths)
- Missing skills (learning priorities)
- Confidence calibration issues

### **Gap Analysis Logic**

```python
def analyze_gaps(resume_skills, skill_scores):
    """
    Gap analysis between claimed and assessed
    """
    gaps = []
    
    for skill in skill_scores:
        skill_name = skill['skill']
        claimed = skill['claimed_level']  # 0-8
        assessed = skill['assessed_level']  # 0-8
        
        gap = assessed - claimed
        
        if abs(gap) > 0.5:  # Meaningful gap
            gap_analysis = {
                'skill': skill_name,
                'claimed': claimed,
                'assessed': assessed,
                'gap': gap,
                'gap_type': None,
                'severity': None,
                'recommendation': None
            }
            
            # Classify gap
            if gap < -1.5:
                # Overestimated significantly
                gap_analysis['gap_type'] = 'overestimated'
                gap_analysis['severity'] = 'high' if claimed > 5 else 'medium'
                gap_analysis['recommendation'] = 'Red flag. Interview further or practice more.'
                
            elif gap < -0.5:
                # Slightly overestimated
                gap_analysis['gap_type'] = 'overestimated'
                gap_analysis['severity'] = 'low'
                gap_analysis['recommendation'] = 'Normal. Add more depth via learning plan.'
                
            elif gap > 1.5:
                # Underestimated significantly
                gap_analysis['gap_type'] = 'underestimated'
                gap_analysis['severity'] = 'positive'
                gap_analysis['recommendation'] = 'Hidden strength! Highlight in resume.'
                
            elif gap > 0.5:
                # Slightly underestimated
                gap_analysis['gap_type'] = 'underestimated'
                gap_analysis['severity'] = 'positive'
                gap_analysis['recommendation'] = 'Good sign. Build on this strength.'
                
            else:
                gap_analysis['gap_type'] = 'accurate'
                gap_analysis['severity'] = 'none'
                gap_analysis['recommendation'] = 'Self-assessment is accurate.'
            
            gaps.append(gap_analysis)
    
    return gaps

def identify_learning_priorities(gaps, jd_skills):
    """
    Prioritize which skills to learn based on:
    1. JD criticality
    2. Current gap size
    3. Learning difficulty (time estimate)
    """
    priorities = []
    
    for gap in gaps:
        # Find criticality in JD
        jd_skill = next((s for s in jd_skills if s['name'] == gap['skill']), None)
        criticality = jd_skill['criticality'] if jd_skill else 'medium'
        
        # Prioritize missing or severely underassessed
        if gap['gap_type'] in ['missing', 'underestimated']:
            if criticality in ['critical', 'high']:
                priority_score = 1  # Highest
            elif criticality == 'medium':
                priority_score = 2
            else:
                priority_score = 3
        else:
            priority_score = 4  # Lower priority
        
        priorities.append({
            'skill': gap['skill'],
            'priority_score': priority_score,
            'rationale': f"Criticality: {criticality}, Gap: {gap['gap']}"
        })
    
    # Sort by priority
    priorities.sort(key=lambda x: x['priority_score'])
    return priorities
```

### **Output Format**

```json
{
  "gaps": [
    {
      "skill": "Python",
      "claimed": 7,
      "assessed": 6,
      "gap": -1,
      "gap_type": "slightly_overestimated",
      "severity": "low",
      "confidence_interval": "±0.8",
      "recommendation": "Normal self-assessment variance. Strengthen with advanced topics."
    },
    {
      "skill": "Testing/TDD",
      "claimed": 0,
      "assessed": 0,
      "gap": 0,
      "gap_type": "missing",
      "severity": "high",
      "confidence_interval": "±0.5",
      "recommendation": "Critical gap. JD requires this skill. Add to learning plan."
    }
  ],
  "summary": {
    "overestimation_count": 1,
    "underestimation_count": 1,
    "accurate_count": 4,
    "missing_count": 2,
    "overall_calibration": "good",
    "assessment_reliability": 0.87
  }
}
```

---

## 5. Learning Plan Generation Engine

### **Purpose**
Generate actionable, personalized learning roadmap with:
- Adjacent skills (realistic progression)
- Time estimates (hours to weeks)
- Curated resources (blogs, courses, docs)
- Dependencies (prerequisites)
- Realistic timeline

### **Adjacent Skills Logic**

```python
SKILL_DEPENDENCY_GRAPH = {
    'JavaScript': {
        'prerequisites': [],
        'next_steps': [
            'TypeScript',      # Natural progression
            'React',           # Popular framework
            'Node.js',         # Server-side JS
            'Vue',             # Alternative framework
        ],
        'depth_progression': [
            'Basic syntax',
            'Functions & closures',
            'Async/await & promises',
            'Advanced patterns (composition, etc.)'
        ]
    },
    'React': {
        'prerequisites': ['JavaScript'],
        'next_steps': [
            'React Query',
            'Redux',
            'Next.js',
            'Testing (Jest, React Testing Library)'
        ],
        'depth_progression': [
            'Components & JSX',
            'Hooks & state management',
            'Performance optimization',
            'Advanced patterns (render props, compound components)'
        ]
    },
    'Testing': {
        'prerequisites': ['Any programming language'],
        'next_steps': [
            'Test-Driven Development (TDD)',
            'Continuous Integration',
            'Property-Based Testing'
        ],
        'depth_progression': [
            'Unit tests',
            'Integration tests',
            'E2E tests',
            'Test architecture'
        ]
    },
    # ... many more
}

def find_adjacent_skills(current_skill, target_skill, skill_levels):
    """
    Find realistic skill progression from current to target
    
    Logic:
    1. If missing skill → Start from prerequisites
    2. If weak skill → Deepen existing knowledge
    3. If strong skill → Explore adjacent skills
    """
    path = []
    
    # Case 1: Completely missing (never even tried)
    if current_skill not in skill_levels or skill_levels[current_skill] == 0:
        # Start with fundamentals + quick wins
        path = [
            current_skill,
            'Best practices for ' + current_skill,
            'Common libraries/frameworks',
        ]
    
    # Case 2: Weak but claimed (1-3/8)
    elif skill_levels[current_skill] < 3:
        # Deepen existing knowledge
        path = [
            'Core concepts in ' + current_skill,
            'Intermediate patterns',
            'Real-world projects',
        ]
    
    # Case 3: Strong (5+/8)
    else:
        # Explore related skills
        graph = SKILL_DEPENDENCY_GRAPH.get(current_skill, {})
        path = graph.get('next_steps', [])
    
    return path
```

### **Time Estimation Logic**

```python
SKILL_TIME_ESTIMATES = {
    'Python': 100,  # hours
    'JavaScript': 80,
    'React': 60,
    'Testing': 40,
    'Docker': 30,
    'GraphQL': 50,
    # ... many more
}

def estimate_learning_time(skill, current_level, target_level, learning_pace='normal'):
    """
    Estimate hours needed to reach target level
    
    Formula:
    hours = base_estimate * (target_level - current_level) / 8 * pace_multiplier
    """
    base_hours = SKILL_TIME_ESTIMATES.get(skill, 50)  # Default 50 hours
    
    level_gap = target_level - current_level
    if level_gap <= 0:
        return 0
    
    pace_multipliers = {
        'fast': 0.7,      # 7 hours/week
        'normal': 1.0,    # 5 hours/week
        'slow': 1.5       # 3 hours/week
    }
    
    multiplier = pace_multipliers.get(learning_pace, 1.0)
    
    hours = base_hours * (level_gap / 8) * multiplier
    
    # Convert to weeks
    hours_per_week = {'fast': 7, 'normal': 5, 'slow': 3}[learning_pace]
    weeks = hours / hours_per_week
    
    return {
        'hours': round(hours),
        'weeks': round(weeks),
        'hours_per_week': hours_per_week,
        'months': round(weeks / 4, 1)
    }
```

### **Learning Plan Generation Prompt**

```
You are an expert learning path designer and curriculum architect.
Your job is to create a personalized, achievable learning plan.

CONTEXT:
- Candidate's assessed skills: {skill_scores}
- Candidate's gaps: {gaps}
- Job requirements: {jd_skills}
- Target completion: {target_weeks} weeks
- Available weekly hours: {hours_per_week}

TASK:
Create a personalized learning plan that:
1. Fills critical gaps (JD-required skills)
2. Builds on existing strengths
3. Maintains motivation (quick wins + long-term goals)
4. Considers prerequisites (don't learn advanced before basics)
5. Is realistic (not 100 hours in 2 weeks)

LEARNING PRINCIPLES:
- Spaced repetition (revisit concepts over time)
- Progressive complexity (basics → intermediate → advanced)
- Project-based learning (apply as you learn)
- Mix theory and practice (not just tutorials)

RESOURCE STRATEGY:
- Start with free resources (docs, blogs, free courses)
- Recommend paid courses only if essential
- Mix media types (video, written, interactive)
- Include official documentation

OUTPUT:
For each recommended skill:
- Why it's important
- Prerequisites (what to learn first)
- Estimated time
- Learning sequence (phases)
- Recommended resources (top 3)
- Practical projects to apply skill

Create JSONL output...
```

### **Output Format**

```json
{
  "learning_plan": {
    "summary": {
      "total_hours": 120,
      "weeks_full_time": 3,
      "weeks_5hrs_per_week": 24,
      "weeks_10hrs_per_week": 12,
      "estimated_completion": "July 2026",
      "difficulty": "medium"
    },
    "skills": [
      {
        "priority": 1,
        "skill": "Testing (Jest/Mocha)",
        "category": "methodology",
        "current_level": 0,
        "target_level": 3,
        "estimated_hours": 25,
        "weeks_at_5hrs": 5,
        "importance": "critical",
        
        "why_important": "Required by 8/10 candidates in this JD. Currently a gap. Will improve code quality and confidence.",
        
        "prerequisites": [
          {
            "skill": "JavaScript",
            "target_level": 5,
            "status": "already_have"
          }
        ],
        
        "learning_phases": [
          {
            "phase": 1,
            "title": "Testing Fundamentals",
            "duration_hours": 8,
            "topics": [
              "Why testing matters",
              "Test types: unit, integration, E2E",
              "Jest setup and basic syntax"
            ],
            "projects": ["Write 10 unit tests for simple functions"]
          },
          {
            "phase": 2,
            "title": "Testing Patterns",
            "duration_hours": 10,
            "topics": [
              "Mocking and stubbing",
              "Testing async code",
              "Testing React components"
            ],
            "projects": ["Write test suite for existing React component"]
          },
          {
            "phase": 3,
            "title": "TDD & Best Practices",
            "duration_hours": 7,
            "topics": [
              "Test-Driven Development workflow",
              "Coverage targets",
              "Integration with CI/CD"
            ],
            "projects": ["Contribute tests to open-source project"]
          }
        ],
        
        "resources": [
          {
            "title": "Jest Official Documentation",
            "url": "https://jestjs.io/",
            "type": "documentation",
            "difficulty": "beginner",
            "duration_hours": 2,
            "cost": "free",
            "rating": 4.9,
            "when_to_use": "Reference during setup and learning"
          },
          {
            "title": "Testing JavaScript",
            "url": "https://testingjavascript.com/",
            "type": "course",
            "difficulty": "beginner-intermediate",
            "duration_hours": 15,
            "cost": 149,
            "rating": 4.8,
            "when_to_use": "Comprehensive course covering all testing concepts"
          },
          {
            "title": "Kent C Dodds - Testing Fundamentals",
            "url": "https://kentcdodds.com/blog/common-mistakes-with-react-testing-library",
            "type": "blog",
            "difficulty": "intermediate",
            "duration_hours": 1,
            "cost": "free",
            "rating": 4.9,
            "when_to_use": "Learn best practices and common mistakes"
          }
        ],
        
        "projects": [
          {
            "title": "Test-drive a calculator app",
            "description": "Build a calculator using TDD (write tests first)",
            "duration_hours": 8,
            "skills_practiced": ["Testing", "JavaScript", "TDD"]
          },
          {
            "title": "Add tests to open-source project",
            "description": "Contribute tests to a small open-source JS project",
            "difficulty": "intermediate",
            "skills_practiced": ["Testing", "Collaboration"]
          }
        ]
      },
      
      {
        "priority": 2,
        "skill": "Docker & Containerization",
        "category": "tool",
        "current_level": 0,
        "target_level": 2,
        "estimated_hours": 20,
        "weeks_at_5hrs": 4,
        "importance": "high",
        
        "why_important": "JD mentions Docker. Useful for local development and deployment.",
        
        "prerequisites": [
          {
            "skill": "Linux basics",
            "target_level": 2,
            "status": "need_to_learn_first"
          }
        ],
        
        "learning_phases": [
          {
            "phase": 1,
            "title": "Docker Fundamentals",
            "duration_hours": 10,
            "topics": [
              "What is containerization?",
              "Images vs containers",
              "Dockerfile basics",
              "Docker commands (run, build, etc.)"
            ],
            "projects": ["Create Dockerfile for a Node.js app"]
          },
          {
            "phase": 2,
            "title": "Docker Compose & Multi-container",
            "duration_hours": 10,
            "topics": [
              "Docker Compose basics",
              "Multi-container apps",
              "Networking between containers",
              "Volumes and data persistence"
            ],
            "projects": ["Docker Compose setup for full-stack app (Node + Postgres)"]
          }
        ],
        
        "resources": [
          {
            "title": "Docker Official Documentation",
            "url": "https://docs.docker.com/",
            "type": "documentation",
            "cost": "free"
          },
          {
            "title": "Docker Mastery on Udemy",
            "url": "https://www.udemy.com/course/docker-mastery/",
            "type": "course",
            "cost": 14.99,
            "rating": 4.8
          }
        ]
      }
    ],
    
    "timeline": {
      "month_1": {
        "focus": ["Testing fundamentals", "Linux basics intro"],
        "hours": 40,
        "milestones": ["Complete Jest course", "Write 20+ unit tests"]
      },
      "month_2": {
        "focus": ["Advanced testing", "Docker basics"],
        "hours": 40,
        "milestones": ["Contribute to open-source tests", "Build Dockerized app"]
      },
      "month_3": {
        "focus": ["Polish and practice", "Optional: GraphQL or advanced topics"],
        "hours": 40,
        "milestones": ["Real-world project with full test coverage + Docker"]
      }
    },
    
    "success_criteria": [
      "Can write unit tests for complex JS code",
      "Understand TDD and can practice it",
      "Can Dockerize a multi-container application",
      "Confidence increased from self-assessment to demonstrated skill"
    ]
  }
}
```

---

## Cost Optimization

### **API Call Strategy**

```
Per Assessment (avg):
- Skill Extraction: 1 call (~0.02)
- Question Generation: 1 call (~0.03)
- Answer Evaluation: 6 answers × 1 call (~0.12)
- Gap Analysis: 1 call (~0.01)
- Learning Plan: 1 call (~0.02)

TOTAL: ~$0.20 per assessment using GPT-4 (as of April 2026)

For 48-hour hackathon: 100 assessments = $20
For production: Optimize with caching, batch processing, fallbacks
```

### **Caching Strategy**

```python
# Cache skill extraction results (1 hour)
CACHE[hash(resume_text)] = extracted_skills

# Cache question templates (24 hours)
# Cache resource recommendations (7 days)
# Use Redis for distributed caching
```

### **Fallback Mechanisms**

```python
def generate_questions_with_fallback(resume_skills, jd_skills):
    """
    If LLM fails, use template-based fallback
    """
    try:
        # Try LLM first
        return llm_generate_questions(resume_skills, jd_skills)
    except LLMTimeout:
        # Fallback: Use pre-made question templates
        return template_based_questions(jd_skills)
    except LLMError:
        # Last resort: Generic questions
        return generic_questions(jd_skills)
```

---

## Quality Assurance

### **Testing & Validation**

```python
# Validate evaluation consistency
def test_evaluation_consistency():
    """
    Same answer should get same score (±0.5 variance)
    """
    same_answer = "I use Python daily. I write Flask apps."
    
    score_1 = evaluate_answer(question_1, same_answer)
    score_2 = evaluate_answer(question_1, same_answer)
    
    assert abs(score_1 - score_2) < 0.5, "Evaluation not consistent!"

# Validate question quality
def test_question_quality():
    """
    Questions should be answerable in 2-3 minutes
    """
    # Manually verify 10 random questions
    pass

# Validate learning plans
def test_learning_plan_realism():
    """
    Learning plans should be achievable (100-200 hours max)
    """
    plan = generate_learning_plan(gaps, preferences)
    assert plan['total_hours'] <= 200, "Plan is too ambitious!"
```

---

## Anti-Gaming Techniques

### **What We Prevent**

```
❌ Memorized answers → Test depth, require examples, ask follow-ups
❌ Vague BS → Score clarity/examples low
❌ Buzzwords without understanding → Score depth low
❌ Overconfident BS → Penalize confidence calibration
❌ Copy-pasted solutions → Ask why, ask variations
```

### **Implementation**

```python
def detect_gaming(answer, question, score_dict):
    """
    Detect signs of gaming or cheating
    """
    red_flags = []
    
    # Too-perfect answer (probably copied)
    if score_dict['score_correctness'] == 2 and \
       score_dict['score_clarity'] == 0:
        red_flags.append("Suspiciously perfect but unclear (copied code?)")
    
    # Generic non-answer
    if len(answer.split()) < 30 and \
       score_dict['score_examples'] == 0:
        red_flags.append("Very short answer with no examples")
    
    # Confidence without substance
    if 'always' in answer.lower() and \
       score_dict['score_confidence'] == 1 and \
       score_dict['score_depth'] < 2:
        red_flags.append("Overconfident but shallow")
    
    return red_flags
```

---

## Iteration & Improvement

### **Post-Hackathon Enhancements**

1. **Fine-tuned models** – Train on 1000+ real interviews
2. **Vector embeddings** – Use embeddings for skill matching
3. **Video assessment** – Analyze tone, confidence, body language
4. **Multi-turn reasoning** – Chain-of-thought prompts
5. **Diverse question pool** – 50+ question variations per skill
6. **Real-time calibration** – Adjust rubric based on feedback

---

**This is the beating heart of the system. Get this right, and everything else follows.**

**Last Updated:** April 26, 2026
