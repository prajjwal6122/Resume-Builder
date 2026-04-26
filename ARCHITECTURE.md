# System Architecture
## AI-Powered Skill Assessment & Personalized Learning Plan Agent

---

## System Overview

SkillAssess is a microservices-based system with three main layers:

1. **Frontend Layer** (Next.js) – User-facing UI, real-time chat interface
2. **Backend Layer** (Node.js/Express) – API orchestration, database management, auth
3. **AI Layer** (Python FastAPI) – LLM orchestration, skill extraction, evaluation logic

These communicate via REST APIs and WebSockets, with Supabase used for persistence, auth, and storage.

---

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     USER BROWSERS                            │
│                   (Frontend: React)                          │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐       │
│  │  Upload Page │  │Chat/Assess  │  │  Dashboard   │  ...  │
│  └──────────────┘  └─────────────┘  └──────────────┘       │
└────────────┬─────────────────────────────────────────────────┘
             │
      HTTP + WebSocket
      (REST + Socket.IO)
             │
┌────────────▼─────────────────────────────────────────────────┐
│            API GATEWAY + BACKEND (Node.js)                   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express Routes                                      │   │
│  │  /api/auth/*        (login, register, JWT)         │   │
│  │  /api/upload/*      (resume, JD file handling)     │   │
│  │  /api/assess/*      (create, progress, get results)│   │
│  │  /api/learning/*    (fetch learning plans)         │   │
│  └──────────────────────────────────────────────────────┘   │
│                      │                                       │
│          ┌───────────┼───────────┬──────────────┐           │
│          ▼           ▼           ▼              ▼           │
│     ┌─────────┐ ┌─────────┐ ┌────────┐  ┌──────────┐       │
│     │  Resume │ │   JD    │ │ Redis  │  │PostgreSQL│       │
│     │ Parser  │ │ Parser  │ │(Cache) │  │(Persist) │       │
│     └────┬────┘ └────┬────┘ └────────┘  └──────────┘       │
│          │           │                                      │
│          └─────┬─────┘                                      │
│                │                                            │
│         ┌──────▼──────────────────────┐                     │
│         │  AI Service Client          │                     │
│         │ (HTTP to Python FastAPI)   │                     │
│         └──────┬──────────────────────┘                     │
└────────────────┼──────────────────────────────────────────────┘
                 │
        HTTP (Separate Process/Container)
                 │
┌────────────────▼──────────────────────────────────────────────┐
│         AI PIPELINE (Python FastAPI)                          │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ LLM Orchestration (LangChain)                        │   │
│  └────────────────────────────────────────────────────┐ │   │
│     ┌───────────────┐  ┌───────────────┐  ┌────────┐ │ │   │
│     │ Skill Extract │  │Question Gen   │  │Evaluate│ │ │   │
│     │  Prompt       │  │   Prompt      │  │Prompt  │ │ │   │
│     └───────────────┘  └───────────────┘  └────────┘ │ │   │
│  │                                                    │ │   │
│  │  ┌─────────────────────────────────────────────┐ │ │   │
│  │  │         OpenAI GPT-4 API                    │ │ │   │
│  │  └─────────────────────────────────────────────┘ │ │   │
│  └────────────────────────────────────────────────┘ │   │
│                                                       │   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Gap Analysis Engine (Python Logic)               │   │
│  │ - Compare claimed vs assessed                    │   │
│  │ - Calculate confidence intervals                 │   │
│  │ - Identify false positives                       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                       │   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Learning Plan Generator (Python Logic)          │   │
│  │ - Recommend adjacent skills                      │   │
│  │ - Estimate time per skill                        │   │
│  │ - Find curated resources                         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                       │   │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow (Step-by-Step)

### **Step 1: User Input**
```
User Action: Click "Start Assessment"
             ↓
Frontend:    Load upload form (resume + JD)
             ↓
Backend:     Validate file types (PDF, DOCX, TXT)
             ↓
             Return presigned S3 URL (for large files)
             OR process inline (for text)
```

### **Step 2: Document Parsing**
```
Backend:     Receive resume file
             ↓
Resume Parser: Extract text (PDF → plain text)
             ↓
Store in: PostgreSQL (resumes table)
         Redis (cache for 1 hour)
             ↓
Same for JD (text extraction)
```

### **Step 3: Skill Extraction**
```
Backend:     Extract text from resume + JD
             ↓
AI Pipeline: Call Python service
             POST /extract-skills
             Body: {resume_text, jd_text}
             ↓
Python:      Run LLM prompt (Skill Extraction Prompt)
             ↓
JSON Response:
{
  "jd_skills": [
    {"name": "Python", "level": "intermediate", "criticality": "high"},
    ...
  ],
  "resume_skills": [
    {"name": "Python", "years": 3, "proficiency": "claimed"}
  ]
}
             ↓
Backend:     Store in PostgreSQL (skills table, assessments table)
             ↓
Frontend:    Display extracted skills (for user confirmation)
```

### **Step 4: Question Generation**
```
Backend:     Create assessment session
             POST /api/assess/start
             ↓
AI Pipeline: Call Python service
             POST /generate-questions
             Body: {resume_text, jd_skills, skill_focus}
             ↓
Python:      Run LLM prompt (Question Generation Prompt)
             ↓
             Generate 5–7 questions (intermediate difficulty)
             ↓
JSON Response:
{
  "questions": [
    {
      "id": "q1",
      "skill": "Python",
      "difficulty": "intermediate",
      "text": "How would you...",
      "context": "This tests practical experience"
    }
  ]
}
             ↓
Backend:     Store in PostgreSQL (assessment_questions table)
             ↓
Frontend:    Stream questions via WebSocket
             ↓
User:        Sees first question in ~2 seconds
```

### **Step 5: Answer & Real-Time Evaluation**
```
User:        Types answer in chat
             ↓
Frontend:    Send answer via WebSocket
             POST /api/assess/{assessmentId}/answer
             ↓
Backend:     Log answer, validate (not empty)
             ↓
AI Pipeline: Call Python service
             POST /evaluate-answer
             Body: {question, answer, context, rubric}
             ↓
Python:      Run LLM prompt (Evaluation Prompt)
             ↓
             Stream evaluation thoughts (real-time)
             ↓
             Calculate scores (correctness, depth, examples, clarity, confidence)
             ↓
JSON Response:
{
  "raw_score": 6.5,
  "breakdown": {
    "correctness": 2,
    "depth": 1,
    "examples": 2,
    "clarity": 1,
    "confidence": 0
  },
  "reasoning": "Answer shows...",
  "follow_up": "Can you elaborate on..."
}
             ↓
Backend:     Store score in PostgreSQL
             ↓
Frontend:    Display score breakdown + follow-up question
             ↓
Repeat for all questions
```

### **Step 6: Gap Analysis**
```
After all answers collected:
Backend:     Call Python service
             POST /analyze-gaps
             Body: {assessment_results, skills_data}
             ↓
Python:      Compare claimed vs assessed scores
             ↓
             Identify:
             - Overestimated skills (claimed > assessed)
             - Underestimated skills (assessed > claimed)
             - True matches
             - Missed skills
             ↓
JSON Response:
{
  "skill_scores": [...],
  "gaps": [
    {
      "skill": "Testing/TDD",
      "claimed_level": 0,
      "assessed_level": 0,
      "gap_type": "missing",
      "impact": "high"
    }
  ],
  "summary": "You're stronger in..."
}
             ↓
Backend:     Store in PostgreSQL (assessment_results table)
             ↓
Frontend:    Display Skill Dashboard
```

### **Step 7: Learning Plan Generation**
```
Backend:     Call Python service
             POST /generate-learning-plan
             Body: {gaps, jd_requirements, skill_preferences}
             ↓
Python:      Identify adjacent skills + dependencies
             ↓
             Estimate time per skill (hours → weeks)
             ↓
             Search resource database (curated list)
             ↓
JSON Response:
{
  "learning_plan": [
    {
      "skill": "Testing (Jest)",
      "level_to_reach": "intermediate",
      "time_estimate": "20 hours",
      "importance": "high",
      "dependencies": ["JavaScript fundamentals"],
      "resources": [
        {"title": "Jest Handbook", "url": "...", "type": "blog"},
        {"title": "TDD for JavaScript", "url": "...", "type": "course"}
      ]
    }
  ],
  "total_hours": 120,
  "suggested_duration": "8–12 weeks (10 hrs/week)"
}
             ↓
Backend:     Store in PostgreSQL (learning_plans table)
             ↓
Frontend:    Display Learning Plan Page
             ↓
User:        Downloads plan or continues on platform
```

---

## Component Details

### **Frontend Component Architecture**

```
App
├── Pages/
│   ├── UploadPage
│   │   ├── FileUploadForm (drag-drop, validation)
│   │   ├── SampleSelector (use demo data)
│   │   └── LoadingIndicator
│   │
│   ├── AssessmentPage
│   │   ├── ChatInterface (real-time WebSocket)
│   │   ├── QuestionDisplay
│   │   ├── AnswerInput
│   │   ├── ScoreStreaming (real-time feedback)
│   │   └── ProgressBar
│   │
│   ├── DashboardPage
│   │   ├── SkillCard (claimed vs assessed)
│   │   ├── GapVisualization (bar chart)
│   │   ├── ScoreDistribution (histogram)
│   │   └── DetailsPanel
│   │
│   └── LearningPlanPage
│       ├── PlanHeader (summary)
│       ├── SkillRow (with dependencies)
│       ├── ResourceList (links + time)
│       └── ExportButton (PDF/CSV)
│
├── Hooks/
│   ├── useAssessment (fetch/store assessment)
│   ├── useWebSocket (real-time evaluation)
│   └── useAuth (JWT tokens)
│
├── Components/
│   ├── Header
│   ├── Footer
│   ├── ErrorBoundary
│   └── LoadingSpinner
│
└── Store/ (Zustand)
    ├── assessmentStore
    ├── userStore
    └── uiStore
```

### **Backend Modules**

```
backend/
├── routes/
│   ├── auth.js        (login, register)
│   ├── upload.js      (file handling)
│   ├── assess.js      (assessment CRUD)
│   └── learning.js    (plan retrieval)
│
├── middleware/
│   ├── auth.js        (JWT verification)
│   ├── errorHandler.js
│   └── logger.js
│
├── models/
│   ├── User.js
│   ├── Resume.js
│   ├── JobDescription.js
│   ├── Skill.js
│   ├── Assessment.js
│   ├── LearningPlan.js
│   └── etc.
│
├── services/
│   ├── resumeParser.js    (text extraction)
│   ├── jdParser.js        (text extraction)
│   ├── aiServiceClient.js (calls Python FastAPI)
│   └── redis.js           (caching)
│
├── db/
│   ├── migrations/
│   ├── seeds/
│   └── connection.js
│
└── app.js (Express setup)
```

### **AI Pipeline Modules**

```
ai_pipeline/
├── main.py            (FastAPI app)
├── routes/
│   ├── extract.py     (skill extraction endpoint)
│   ├── question.py    (question generation endpoint)
│   ├── evaluate.py    (answer evaluation endpoint)
│   ├── gap.py         (gap analysis endpoint)
│   └── learning.py    (learning plan endpoint)
│
├── prompts/
│   ├── extract_skills.txt
│   ├── generate_questions.txt
│   ├── evaluate_answer.txt
│   ├── analyze_gaps.txt
│   └── generate_plan.txt
│
├── llm/
│   ├── client.py      (OpenAI API wrapper)
│   └── config.py
│
├── logic/
│   ├── scoring.py     (rubric implementation)
│   ├── gap_analysis.py
│   └── resource_matcher.py
│
└── utils/
    ├── logging.py
    └── helpers.py
```

---

## Database Schema (PostgreSQL)

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Resumes Table
CREATE TABLE resumes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  original_text TEXT,
  parsed_text TEXT,
  extracted_skills JSONB,
  upload_date TIMESTAMP DEFAULT NOW()
);

-- Job Descriptions Table
CREATE TABLE job_descriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(255),
  original_text TEXT,
  parsed_text TEXT,
  extracted_skills JSONB,
  upload_date TIMESTAMP DEFAULT NOW()
);

-- Skills Table
CREATE TABLE skills (
  id UUID PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100),
  description TEXT,
  typical_learning_hours INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assessments Table (one per user/JD pair)
CREATE TABLE assessments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  resume_id UUID REFERENCES resumes(id),
  jd_id UUID REFERENCES job_descriptions(id),
  status VARCHAR(50), -- started, in_progress, completed
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assessment Questions Table
CREATE TABLE assessment_questions (
  id UUID PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id),
  skill_id UUID REFERENCES skills(id),
  question_text TEXT,
  difficulty VARCHAR(50), -- beginner, intermediate, advanced
  question_order INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assessment Answers Table
CREATE TABLE assessment_answers (
  id UUID PRIMARY KEY,
  question_id UUID REFERENCES assessment_questions(id),
  assessment_id UUID REFERENCES assessments(id),
  answer_text TEXT,
  score_correctness INT,
  score_depth INT,
  score_examples INT,
  score_clarity INT,
  score_confidence INT,
  total_score DECIMAL(3,1),
  evaluation_notes TEXT,
  answered_at TIMESTAMP DEFAULT NOW()
);

-- Skill Scores per Assessment
CREATE TABLE skill_scores (
  id UUID PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id),
  skill_id UUID REFERENCES skills(id),
  claimed_level INT, -- 0–8
  assessed_level INT, -- 0–8
  question_count INT,
  confidence_interval DECIMAL(3,2),
  gap_size INT, -- claimed - assessed
  created_at TIMESTAMP DEFAULT NOW()
);

-- Learning Plans Table
CREATE TABLE learning_plans (
  id UUID PRIMARY KEY,
  assessment_id UUID REFERENCES assessments(id),
  user_id UUID REFERENCES users(id),
  total_estimated_hours INT,
  suggested_weekly_hours INT,
  estimated_completion_weeks INT,
  generated_at TIMESTAMP DEFAULT NOW()
);

-- Learning Plan Items (skills to learn)
CREATE TABLE learning_plan_items (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES learning_plans(id),
  skill_id UUID REFERENCES skills(id),
  priority INT, -- 1 = highest
  estimated_hours INT,
  dependencies JSONB, -- skill IDs that should be learned first
  created_at TIMESTAMP DEFAULT NOW()
);

-- Resources Table
CREATE TABLE resources (
  id UUID PRIMARY KEY,
  skill_id UUID REFERENCES skills(id),
  title VARCHAR(255),
  url TEXT,
  resource_type VARCHAR(100), -- course, tutorial, blog, video
  difficulty VARCHAR(50),
  duration_minutes INT,
  cost DECIMAL(8,2),
  rating DECIMAL(2,1),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Deployment Architecture

### **Development Environment**
```
Local Machine
├── Frontend (npm start on :3000)
├── Backend (npm run dev on :5000)
└── AI Pipeline (python app.py on :8000)

Docker Compose:
All 3 services in containers, connected via Docker network
```

### **Production Environment**
```
Cloud (AWS / Railway / Vercel)

Frontend:
├── Built React app
├── Deployed to Vercel (CDN)
└── Environment: REACT_APP_API_URL=https://api.skillassess.io

Backend:
├── Node.js API (Docker image)
├── Deployed to AWS EC2 / Railway
├── Load balancer (if scaling)
├── PostgreSQL RDS (managed database)
└── Redis ElastiCache (managed cache)

AI Pipeline:
├── Python FastAPI (Docker image)
├── Deployed to separate EC2 / Railway instance
├── Auto-scaling based on queue depth
└── Separate from backend (can scale independently)

Queuing (Optional, for async processing):
├── Bull/BullMQ on Redis
├── Process expensive operations asynchronously
└── Avoid blocking user requests
```

### **Monitoring & Logging**
```
Application Monitoring:
├── Sentry (error tracking)
├── DataDog / Prometheus (metrics)
└── CloudWatch (AWS logs)

Performance:
├── New Relic (APM)
├── PageSpeed Insights (frontend)
└── LLM API usage dashboard (cost tracking)
```

---

## Integration Points

### **Frontend ↔ Backend**
- REST API (CRUD operations)
- WebSocket (real-time chat + streaming evaluation)
- Authentication (JWT in Authorization header)

### **Backend ↔ AI Pipeline**
- HTTP POST requests to FastAPI
- Timeout: 30 seconds per request
- Fallback: Return generic response if AI service is down

### **Backend ↔ Database**
- Connection pooling (min: 5, max: 20 connections)
- Prepared statements (prevent SQL injection)
- Migrations on deployment

### **Backend ↔ Cache (Redis)**
- Session storage (user: assessment state)
- Skill extraction results (cache for 1 hour)
- Learning plans (cache for 24 hours)
- Rate limiting (per IP address)

---

## Scalability Considerations (Post-MVP)

### **Bottlenecks**
1. **LLM API calls** – ~$0.05–$0.30 per assessment
   - Solution: Batch processing, caching question templates

2. **Question generation latency** – 3–5 seconds
   - Solution: Async job queue, pre-generate templates

3. **Database writes during assessment** – 1 write per answer
   - Solution: Batch writes, async logging

### **Horizontal Scaling**
- Backend: Stateless, scales horizontally (load balancer)
- AI Pipeline: Separate service, queues long operations
- Frontend: Static files, no scaling needed (CDN)

---

**Last Updated:** April 26, 2026
