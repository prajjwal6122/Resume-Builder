# Backend Implementation Guide
## AI-Powered Skill Assessment & Personalized Learning Plan Agent

---

## Backend Overview

The backend is a Node.js + Express server that orchestrates:
- User authentication (JWT-based or Supabase Auth integration)
- Document parsing (resume/JD extraction)
- API communication with the AI pipeline
- Database persistence (Supabase-managed PostgreSQL)
- Real-time WebSocket updates (Socket.IO, optional)

**Key Design Principle:** Backend is stateless and thin. Heavy lifting (LLM calls, scoring) happens in the Python AI pipeline.

---

## Module Architecture

```
Backend Modules
├── Authentication & Auth Layer
│   └── JWT token validation, user sessions
│
├── Upload & Parsing Module
│   ├── Resume text extraction
│   ├── JD text extraction
│   └── File validation (PDF, DOCX)
│
├── Assessment Orchestration Module
│   ├── Create assessment session
│   ├── Manage Q&A flow
│   ├── Track answer submissions
│   └── Aggregate results
│
├── AI Service Integration Module
│   ├── Skill extraction calls
│   ├── Question generation calls
│   ├── Answer evaluation calls
│   ├── Gap analysis calls
│   └── Learning plan generation calls
│
├── Scoring & Gap Analysis Module
│   ├── Aggregate skill scores
│   ├── Calculate gaps
│   ├── Identify overestimations
│   └── Rank by importance
│
├── Learning Plan Module
│   ├── Fetch generated plans
│   ├── Store plan preferences
│   └── Export functionality
│
└── Cache & Database Layer
    ├── PostgreSQL for persistence
    ├── Redis for session/caching
    └── Connection pooling
```

---

## API Endpoints

### **Authentication Endpoints**

#### `POST /api/auth/register`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "error": "Email already exists"
}
```

---

#### `POST /api/auth/login`
Login and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

#### `POST /api/auth/logout`
Invalidate session (optional; JWT is stateless).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### **Upload & Parsing Endpoints**

#### `POST /api/upload/resume`
Upload and parse a resume.

**Request (multipart/form-data):**
```
Content-Type: multipart/form-data

resume: <file: resume.pdf or resume.docx>
```

**Response (200 OK):**
```json
{
  "success": true,
  "resume": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "extracted_text": "John Doe\nSoftware Engineer with 3 years...",
    "extracted_skills": [
      {"name": "Python", "years": 3, "proficiency": "advanced"},
      {"name": "JavaScript", "years": 2, "proficiency": "intermediate"},
      {"name": "AWS", "years": 1, "proficiency": "beginner"}
    ],
    "parsed_at": "2026-04-26T10:30:00Z"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "error": "Unsupported file format. Please upload PDF or DOCX."
}
```

---

#### `POST /api/upload/jd`
Upload and parse a job description.

**Request (multipart/form-data OR raw text):**
```
Option 1: File
Content-Type: multipart/form-data
jd_file: <file: jd.pdf or jd.txt>

Option 2: Raw text
Content-Type: application/json
{
  "jd_text": "We are looking for a Software Engineer with 5+ years of Python experience..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "jd": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "title": "Senior Software Engineer - Backend",
    "company": "TechCorp",
    "extracted_text": "We are looking for...",
    "extracted_skills": [
      {
        "name": "Python",
        "criticality": "high",
        "required_level": "intermediate",
        "years_required": 3
      },
      {
        "name": "PostgreSQL",
        "criticality": "high",
        "required_level": "intermediate",
        "years_required": 2
      },
      {
        "name": "Docker",
        "criticality": "medium",
        "required_level": "beginner",
        "years_required": 1
      }
    ],
    "parsed_at": "2026-04-26T10:31:00Z"
  }
}
```

---

#### `GET /api/upload/demo-data`
Get pre-loaded sample resume and JD (for quick demo).

**Response (200 OK):**
```json
{
  "success": true,
  "resume_id": "demo-resume-001",
  "jd_id": "demo-jd-001",
  "resume_text": "Jane Developer...",
  "jd_text": "Senior Full-Stack Engineer...",
  "resume_skills": [...],
  "jd_skills": [...]
}
```

---

### **Assessment Endpoints**

#### `POST /api/assess/start`
Start a new assessment session.

**Request:**
```json
{
  "resume_id": "550e8400-e29b-41d4-a716-446655440001",
  "jd_id": "550e8400-e29b-41d4-a716-446655440002"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "assessment": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "status": "started",
    "resume_id": "550e8400-e29b-41d4-a716-446655440001",
    "jd_id": "550e8400-e29b-41d4-a716-446655440002",
    "started_at": "2026-04-26T10:32:00Z",
    "questions": [
      {
        "id": "q1",
        "skill": "Python",
        "difficulty": "intermediate",
        "text": "Describe how you would design a REST API endpoint for user authentication using Python and Flask.",
        "order": 1
      },
      {
        "id": "q2",
        "skill": "PostgreSQL",
        "difficulty": "intermediate",
        "text": "How would you optimize a slow SQL query...",
        "order": 2
      }
    ],
    "total_questions": 6
  }
}
```

---

#### `POST /api/assess/{assessmentId}/answer`
Submit an answer to a question.

**Request:**
```json
{
  "question_id": "q1",
  "answer_text": "I would use Flask with Flask-JWT-Extended for authentication. First, I'd create an endpoint that validates credentials...",
  "time_taken_seconds": 120
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "evaluation": {
    "question_id": "q1",
    "answer_text": "I would use Flask with...",
    "raw_score": 6.5,
    "score_breakdown": {
      "correctness": 2,
      "depth": 2,
      "examples": 1,
      "clarity": 1,
      "confidence": 0
    },
    "reasoning": "The answer correctly identifies Flask-JWT-Extended and explains the authentication flow. The candidate demonstrates knowledge of best practices.",
    "follow_up_needed": true,
    "follow_up_question": "Can you explain the JWT token refresh strategy?",
    "assessment_progress": "2/6 questions answered"
  }
}
```

**Streaming Response (Optional, via Server-Sent Events):**
```
event: evaluation_start
data: {"status": "evaluating"}

event: evaluation_stream
data: {"reasoning_partial": "The answer correctly identifies..."}

event: evaluation_stream
data: {"reasoning_partial": " Flask-JWT-Extended..."}

event: evaluation_complete
data: {"raw_score": 6.5, "score_breakdown": {...}}
```

---

#### `GET /api/assess/{assessmentId}`
Get current assessment state and questions.

**Response (200 OK):**
```json
{
  "success": true,
  "assessment": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "status": "in_progress",
    "current_question": 2,
    "total_questions": 6,
    "questions": [
      {
        "id": "q1",
        "text": "Describe how you would design...",
        "skill": "Python",
        "answered": true,
        "score": 6.5
      },
      {
        "id": "q2",
        "text": "How would you optimize...",
        "skill": "PostgreSQL",
        "answered": false,
        "score": null
      }
    ]
  }
}
```

---

#### `POST /api/assess/{assessmentId}/complete`
Mark assessment as complete and trigger result generation.

**Response (200 OK):**
```json
{
  "success": true,
  "assessment": {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "status": "completed",
    "completed_at": "2026-04-26T10:45:00Z",
    "assessment_duration_minutes": 13,
    "results_ready": true,
    "results_id": "550e8400-e29b-41d4-a716-446655440004"
  }
}
```

---

#### `GET /api/assess/{assessmentId}/results`
Get assessment results (skill scores, gaps, learning plan).

**Response (200 OK):**
```json
{
  "success": true,
  "results": {
    "assessment_id": "550e8400-e29b-41d4-a716-446655440003",
    "generated_at": "2026-04-26T10:45:15Z",
    
    "skill_scores": [
      {
        "skill": "Python",
        "claimed_level": 7,
        "assessed_level": 6,
        "gap": -1,
        "confidence_interval": "±0.8",
        "match_quality": "good"
      },
      {
        "skill": "PostgreSQL",
        "claimed_level": 6,
        "assessed_level": 5,
        "gap": -1,
        "confidence_interval": "±0.9",
        "match_quality": "good"
      },
      {
        "skill": "Docker",
        "claimed_level": 0,
        "assessed_level": 0,
        "gap": 0,
        "confidence_interval": "±0.5",
        "match_quality": "untested"
      }
    ],
    
    "gaps_summary": {
      "top_gap": {
        "skill": "Testing/TDD",
        "claimed": 0,
        "assessed": 0,
        "gap_type": "missing",
        "impact": "high"
      },
      "total_gap_score": 8,
      "overestimated_count": 2,
      "accurate_count": 4
    },
    
    "assessment_quality": {
      "completion_rate": 100,
      "answer_quality": "good",
      "confidence_calibration": "decent"
    }
  }
}
```

---

### **Learning Plan Endpoints**

#### `POST /api/learning/generate`
Explicitly trigger learning plan generation (auto-triggered on completion).

**Request:**
```json
{
  "assessment_id": "550e8400-e29b-41d4-a716-446655440003",
  "preferences": {
    "max_weeks": 12,
    "hours_per_week": 10,
    "learning_style": "project-based"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "learning_plan": {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "assessment_id": "550e8400-e29b-41d4-a716-446655440003",
    "generated_at": "2026-04-26T10:45:20Z",
    
    "summary": {
      "total_estimated_hours": 120,
      "suggested_weekly_hours": 10,
      "estimated_completion_weeks": 12,
      "difficulty": "medium"
    },
    
    "skills": [
      {
        "priority": 1,
        "skill": "Testing (Jest/Mocha)",
        "current_level": 0,
        "target_level": 3,
        "estimated_hours": 25,
        "importance": "critical",
        "reason": "You need testing to pass code reviews. 0 experience found in assessment.",
        "dependencies": ["JavaScript fundamentals"],
        "learning_sequence": 1,
        
        "resources": [
          {
            "title": "Jest Official Documentation",
            "url": "https://jestjs.io/docs/getting-started",
            "type": "documentation",
            "difficulty": "beginner",
            "duration_minutes": 60,
            "cost": "free",
            "rating": 4.8
          },
          {
            "title": "Test-Driven Development with Jest",
            "url": "https://www.udemy.com/course/jest-testing/",
            "type": "course",
            "difficulty": "intermediate",
            "duration_minutes": 480,
            "cost": 14.99,
            "rating": 4.7
          },
          {
            "title": "JavaScript Testing Best Practices",
            "url": "https://kentcdodds.com/blog/common-mistakes-with-react-testing-library",
            "type": "blog",
            "difficulty": "intermediate",
            "duration_minutes": 20,
            "cost": "free",
            "rating": 4.9
          }
        ]
      },
      
      {
        "priority": 2,
        "skill": "Docker & Containerization",
        "current_level": 0,
        "target_level": 2,
        "estimated_hours": 20,
        "importance": "high",
        "reason": "Required for the role. Not mentioned in resume.",
        "dependencies": ["Linux basics"],
        "learning_sequence": 2,
        
        "resources": [
          {
            "title": "Docker Mastery",
            "url": "https://www.udemy.com/course/docker-mastery/",
            "type": "course",
            "difficulty": "beginner",
            "duration_minutes": 720,
            "cost": 14.99,
            "rating": 4.8
          }
        ]
      }
    ],
    
    "timeline": {
      "week_1_2": ["Start Testing (Jest)"],
      "week_3_4": ["Testing (Jest)", "Start Docker"],
      "week_5_8": ["Docker", "Advanced Testing"],
      "week_9_12": ["Apply in projects", "Polish"]
    }
  }
}
```

---

#### `GET /api/learning/{planId}`
Retrieve a generated learning plan.

**Response (200 OK):**
```json
(same as above)
```

---

#### `GET /api/learning/{planId}/export`
Export learning plan as PDF.

**Response (200 OK):**
- Content-Type: application/pdf
- Returns PDF file with learning plan

---

### **Utility Endpoints**

#### `GET /api/health`
Health check for the backend.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-04-26T10:50:00Z",
  "services": {
    "api": "ok",
    "database": "ok",
    "redis": "ok",
    "ai_pipeline": "ok"
  }
}
```

---

#### `GET /api/skills`
Get master list of all tracked skills.

**Response (200 OK):**
```json
{
  "success": true,
  "skills": [
    {
      "id": "skill-python",
      "name": "Python",
      "category": "programming-language",
      "description": "General-purpose programming language",
      "typical_learning_hours": 100,
      "subcategories": ["Core", "Web Frameworks", "Data Science"]
    },
    {
      "id": "skill-js",
      "name": "JavaScript",
      "category": "programming-language",
      "description": "Web programming language",
      "typical_learning_hours": 80
    }
  ],
  "total": 50
}
```

---

#### `GET /api/resources?skill={skillId}`
Get curated resources for a specific skill.

**Response (200 OK):**
```json
{
  "success": true,
  "skill": "Python",
  "resources": [
    {
      "id": "res-1",
      "title": "Python Official Documentation",
      "url": "https://docs.python.org/3/",
      "type": "documentation",
      "difficulty": "all",
      "cost": "free",
      "rating": 4.9
    },
    {
      "id": "res-2",
      "title": "Real Python Tutorials",
      "url": "https://realpython.com/",
      "type": "tutorials",
      "difficulty": "beginner-intermediate",
      "cost": "free",
      "rating": 4.8
    }
  ]
}
```

---

## Database Schema (Detailed)

```sql
-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- RESUMES
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_filename VARCHAR(255),
  original_text TEXT NOT NULL,
  parsed_text TEXT,
  language VARCHAR(10) DEFAULT 'en',
  extracted_skills JSONB, -- [{name, years, proficiency}, ...]
  extraction_confidence DECIMAL(3,2),
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resumes_user_id ON resumes(user_id);

-- JOB DESCRIPTIONS
CREATE TABLE job_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255),
  company VARCHAR(255),
  original_text TEXT NOT NULL,
  parsed_text TEXT,
  language VARCHAR(10) DEFAULT 'en',
  extracted_skills JSONB, -- [{name, criticality, required_level, years_required}, ...]
  extraction_confidence DECIMAL(3,2),
  is_sample BOOLEAN DEFAULT FALSE, -- Pre-loaded demo JDs
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jds_user_id ON job_descriptions(user_id);
CREATE INDEX idx_jds_sample ON job_descriptions(is_sample);

-- SKILLS MASTER TABLE
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100), -- programming-language, framework, tool, soft-skill, etc.
  subcategory VARCHAR(100),
  description TEXT,
  typical_learning_hours INT,
  prerequisite_skills JSONB, -- [{skill_id, required_level}, ...]
  market_demand_score DECIMAL(3,2), -- 0-10, how in-demand this skill is
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_skills_category ON skills(category);

-- ASSESSMENTS (one row per user/JD assessment session)
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  jd_id UUID NOT NULL REFERENCES job_descriptions(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'started', -- started, in_progress, completed
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  duration_minutes INT,
  assessment_quality_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_status ON assessments(status);

-- ASSESSMENT QUESTIONS
CREATE TABLE assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id),
  question_text TEXT NOT NULL,
  difficulty VARCHAR(50), -- beginner, intermediate, advanced
  question_order INT,
  ai_generated BOOLEAN DEFAULT TRUE,
  custom_follow_up BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assessment_questions_assessment_id ON assessment_questions(assessment_id);

-- ASSESSMENT ANSWERS
CREATE TABLE assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  
  -- Scoring dimensions (0-2 each, except confidence which is 0-1 and clarity 0-1)
  score_correctness INT CHECK (score_correctness >= 0 AND score_correctness <= 2),
  score_depth INT CHECK (score_depth >= 0 AND score_depth <= 2),
  score_examples INT CHECK (score_examples >= 0 AND score_examples <= 2),
  score_clarity INT CHECK (score_clarity >= 0 AND score_clarity <= 1),
  score_confidence INT CHECK (score_confidence >= 0 AND score_confidence <= 1),
  
  total_score DECIMAL(3,1), -- Aggregate: 0-8
  evaluation_notes TEXT,
  ai_evaluation_raw JSONB, -- Raw response from LLM
  answer_time_seconds INT,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assessment_answers_assessment_id ON assessment_answers(assessment_id);

-- SKILL SCORES (summary per assessment per skill)
CREATE TABLE skill_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id),
  
  claimed_level INT CHECK (claimed_level >= 0 AND claimed_level <= 8), -- From resume
  assessed_level INT CHECK (assessed_level >= 0 AND assessed_level <= 8), -- From assessment
  
  question_count INT,
  average_score DECIMAL(3,1),
  confidence_interval DECIMAL(3,2), -- ±0.5 to ±1.0
  
  -- Gap analysis
  gap_size INT, -- assessed_level - claimed_level
  gap_direction VARCHAR(50), -- overestimated, underestimated, accurate
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_skill_scores_assessment_id ON skill_scores(assessment_id);

-- LEARNING PLANS
CREATE TABLE learning_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  total_estimated_hours INT,
  suggested_weekly_hours INT,
  estimated_completion_weeks INT,
  difficulty_level VARCHAR(50),
  
  is_shared BOOLEAN DEFAULT FALSE,
  shared_token VARCHAR(255),
  
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_learning_plans_user_id ON learning_plans(user_id);
CREATE INDEX idx_learning_plans_shared_token ON learning_plans(shared_token);

-- LEARNING PLAN ITEMS (recommended skills to learn)
CREATE TABLE learning_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES learning_plans(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id),
  
  priority INT CHECK (priority > 0), -- 1 = highest priority
  current_level INT CHECK (current_level >= 0 AND current_level <= 8),
  target_level INT CHECK (target_level >= 0 AND target_level <= 8),
  estimated_hours INT,
  
  importance VARCHAR(50), -- critical, high, medium, low
  reason TEXT,
  learning_sequence INT, -- Order in which to learn
  
  prerequisite_skills JSONB, -- [{skill_id, target_level}, ...]
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_learning_plan_items_plan_id ON learning_plan_items(plan_id);

-- RESOURCES (curated learning materials)
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES skills(id),
  
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  
  resource_type VARCHAR(100), -- course, tutorial, blog, video, book, documentation, github
  difficulty VARCHAR(50), -- beginner, intermediate, advanced, all
  
  duration_minutes INT,
  cost DECIMAL(8,2), -- 0 for free
  currency VARCHAR(10) DEFAULT 'USD',
  
  rating DECIMAL(2,1), -- 0-5
  review_count INT DEFAULT 0,
  
  last_verified_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resources_skill_id ON resources(skill_id);

-- AUDIT LOG (for tracking changes)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255),
  table_name VARCHAR(100),
  record_id UUID,
  changes JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

---

## Error Handling

### **Standard Error Response**
```json
{
  "success": false,
  "error": "Short error message",
  "details": "Longer explanation for debugging",
  "code": "ERROR_CODE_UPPERCASE",
  "timestamp": "2026-04-26T10:50:00Z"
}
```

### **HTTP Status Codes**
- **200 OK** – Success
- **201 Created** – Resource created
- **400 Bad Request** – Invalid input
- **401 Unauthorized** – Missing/invalid JWT
- **403 Forbidden** – Insufficient permissions
- **404 Not Found** – Resource doesn't exist
- **409 Conflict** – Duplicate entry
- **429 Too Many Requests** – Rate limited
- **500 Internal Server Error** – Server crash
- **503 Service Unavailable** – AI pipeline down

---

## Rate Limiting

```
By IP Address:
├── 100 requests/minute for public endpoints
├── 50 requests/minute for assessment endpoints
└── 10 assessment sessions/hour per user

By User (authenticated):
├── 20 assessments/day
└── 3 concurrent assessment sessions
```

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Redis connection verified
- [ ] JWT secret generated
- [ ] CORS configured for frontend URL
- [ ] Rate limiting configured
- [ ] Error tracking (Sentry) enabled
- [ ] Logging configured
- [ ] SSL certificates installed
- [ ] Database backups scheduled

---

**Last Updated:** April 26, 2026
