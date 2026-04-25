# Implementation Plan (48–72 Hours)
## Execution Roadmap for Hackathon

---

## Overview

**Total Timeline:** 48–72 hours (3 days, working in parallel)

**Team Composition:** 4 developers
- Backend Engineer (Node.js) – 1 person
- Frontend Engineer (React) – 1 person
- AI/Python Engineer – 1 person
- Full-stack / DevOps – 1 person

**Success Criteria:** Full end-to-end demo working, polished UX, smart AI logic.

---

## Day 1: Foundation & Backend (0–24 hours)

### **Time Breakdown**
- 0–8 hours: Boilerplate + backend setup
- 8–16 hours: API endpoints + AI service integration
- 16–24 hours: Database + testing core flows

### **Backend Tasks**

#### ✅ Phase 1: Bootstrap (0–4 hours)

```bash
# Clone repo + install dependencies
git clone <repo>
cd backend
npm init -y
npm install express cors dotenv pg redis socket.io axios
npm install -D nodemon ts-node typescript @types/node

# Setup
mkdir src/{routes,models,services,middleware,db}
echo "API_PORT=5000
DATABASE_URL=postgresql://localhost/skillassess
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-...
JWT_SECRET=your-secret" > .env

# Create basic server
touch src/app.ts
touch src/server.ts
```

**Code (src/app.ts):**
```typescript
import express from 'express';
import cors from 'cors';
import { json } from 'express';

const app = express();
app.use(cors());
app.use(json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

export default app;
```

#### ✅ Phase 2: Database Setup (4–8 hours)

**Skip complex migrations.** Use raw SQL instead.

```sql
-- Create in PostgreSQL directly (minimal schema)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  resume_text TEXT,
  jd_text TEXT,
  status VARCHAR(50) DEFAULT 'started',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id),
  question_id VARCHAR(50),
  answer_text TEXT,
  score DECIMAL(3,1),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE learning_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id),
  plan_json JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Database Connection (src/db/connection.ts):**
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

export const query = (text: string, params?: any[]) => 
  pool.query(text, params);

export default pool;
```

#### ✅ Phase 3: Core API Routes (8–16 hours)

**Endpoints to build:**

1. **POST /api/assess/start** (5 minutes)
   - Accept resume_text + jd_text
   - Create assessment record
   - Call AI service to extract skills + generate questions
   - Return assessment ID + questions

2. **POST /api/assess/{id}/answer** (15 minutes)
   - Accept question_id + answer_text
   - Call AI service to evaluate
   - Store answer + score
   - Return evaluation + next question

3. **GET /api/assess/{id}/results** (10 minutes)
   - Fetch all answers
   - Aggregate scores
   - Return skill scores + gaps
   - Trigger learning plan generation

4. **POST /api/assess/{id}/complete** (5 minutes)
   - Mark assessment complete
   - Generate learning plan (call AI)
   - Store plan
   - Return plan ID

```typescript
// src/routes/assess.ts
import express, { Request, Response } from 'express';
import { query } from '../db/connection';
import { callAIPipeline } from '../services/aiClient';

const router = express.Router();

router.post('/start', async (req: Request, res: Response) => {
  try {
    const { resume_text, jd_text } = req.body;
    
    // Create assessment record
    const assessment = await query(
      'INSERT INTO assessments (resume_text, jd_text, status) VALUES ($1, $2, $3) RETURNING id',
      [resume_text, jd_text, 'started']
    );
    const assessmentId = assessment.rows[0].id;
    
    // Call AI to extract skills + generate questions
    const aiResponse = await callAIPipeline('generate-questions', {
      resume_text,
      jd_text,
    });
    
    // Store questions in cache (Redis) for speed
    const questions = aiResponse.questions;
    
    res.status(201).json({
      success: true,
      assessment: {
        id: assessmentId,
        status: 'started',
        questions: questions,
        total_questions: questions.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/answer', async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const { question_id, answer_text } = req.body;
    
    // Call AI to evaluate
    const evaluation = await callAIPipeline('evaluate-answer', {
      question_id,
      answer_text,
    });
    
    // Store answer
    await query(
      'INSERT INTO assessment_answers (assessment_id, question_id, answer_text, score) VALUES ($1, $2, $3, $4)',
      [assessmentId, question_id, answer_text, evaluation.total_score]
    );
    
    res.json({
      success: true,
      evaluation: evaluation,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

#### ✅ Phase 4: AI Service Integration (16–24 hours)

**Create simple HTTP client to Python FastAPI:**

```typescript
// src/services/aiClient.ts
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const callAIPipeline = async (endpoint: string, payload: any) => {
  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/${endpoint}`,
      payload,
      { timeout: 30000 }
    );
    return response.data;
  } catch (error) {
    console.error(`AI service error calling ${endpoint}:`, error.message);
    throw error;
  }
};
```

---

### **AI/Python Engineer Tasks**

#### ✅ Phase 1: Setup (0–4 hours)

```bash
mkdir ai-pipeline
cd ai-pipeline
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn python-dotenv openai pydantic

# Create files
mkdir src/{routes,prompts,llm,logic,utils}
touch src/main.py
touch .env
```

#### ✅ Phase 2: Core LLM Routes (4–16 hours)

**Create 5 endpoints:**

```python
# ai-pipeline/src/main.py
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import json

app = FastAPI()

@app.post("/generate-questions")
async def generate_questions(resume_text: str, jd_text: str):
    """Generate 5-7 assessment questions"""
    prompt = f"""
    Extract required skills from JD: {jd_text[:500]}
    Candidate resume: {resume_text[:500]}
    
    Generate 6 assessment questions that test critical skills.
    Return JSON with questions array.
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    
    content = response.choices[0].message.content
    # Parse JSON from response
    questions = json.loads(content)
    
    return {"questions": questions.get("questions", [])}

@app.post("/evaluate-answer")
async def evaluate_answer(question_id: str, answer_text: str, question_text: str):
    """Evaluate answer on 5 dimensions"""
    prompt = f"""
    Question: {question_text}
    Answer: {answer_text}
    
    Score on dimensions: correctness (0-2), depth (0-2), examples (0-2), clarity (0-1), confidence (0-1).
    Return JSON.
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
    )
    
    content = response.choices[0].message.content
    scores = json.loads(content)
    
    total = sum([
        scores.get('correctness', 0),
        scores.get('depth', 0),
        scores.get('examples', 0),
        scores.get('clarity', 0),
        scores.get('confidence', 0),
    ])
    
    return {
        "total_score": total,
        "score_breakdown": scores,
        "reasoning": "..."
    }

@app.post("/generate-learning-plan")
async def generate_learning_plan(gaps: list, jd_requirements: list):
    """Generate learning roadmap"""
    # Similar pattern...
    pass

@app.get("/health")
async def health():
    return {"status": "ok"}
```

#### ✅ Phase 3: Hardcoded Fallbacks (16–24 hours)

**For speed, pre-write JSON responses. Fallback if LLM fails.**

```python
# ai-pipeline/src/templates.py
FALLBACK_QUESTIONS = {
    "Python": [
        {
            "id": "q1",
            "text": "Walk me through how you'd design a REST API endpoint.",
            "skill": "Python",
            "difficulty": "intermediate"
        },
        # ... 5 more
    ],
    "JavaScript": [
        # ... questions
    ],
}

FALLBACK_LEARNING_PLAN = {
    "skills": [
        {
            "priority": 1,
            "skill": "Testing",
            "estimated_hours": 25,
            "resources": [...]
        },
        # ...
    ],
    "total_hours": 120,
}

def get_questions_with_fallback(resume, jd):
    try:
        return call_openai_for_questions(resume, jd)
    except:
        # Return template based on top skills in JD
        top_skill = extract_top_skill(jd)
        return FALLBACK_QUESTIONS.get(top_skill, FALLBACK_QUESTIONS["Python"])
```

---

## Day 2: Frontend + Integration (24–48 hours)

### **Frontend Engineer Tasks**

#### ✅ Phase 1: Boilerplate (24–28 hours)

```bash
cd frontend
npx create-react-app . --template typescript
npm install zustand socket.io-client axios tailwindcss

# Create folder structure
mkdir src/{pages,components,hooks,store,services,types}
```

#### ✅ Phase 2: Core Pages (28–40 hours)

**Build these pages:**

1. **Upload Page** (6 hours)
   - File upload form (drag-drop)
   - Use sample data button
   - Call POST /api/assess/start
   - Redirect to assessment page

```tsx
// src/pages/UploadPage.tsx
import { useState } from 'react';
import { useAssessmentStore } from '../store/assessmentStore';

export const UploadPage = () => {
  const [resume, setResume] = useState<File | null>(null);
  const [jd, setJD] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const startAssessment = useAssessmentStore(s => s.startAssessment);
  
  const handleStart = async () => {
    setLoading(true);
    const resumeText = await resume.text();
    await startAssessment(resumeText, jd);
    // Redirect to assessment page
  };
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Start Assessment</h1>
      
      {/* File upload */}
      <input 
        type="file" 
        onChange={(e) => setResume(e.target.files[0])}
        accept=".pdf,.txt,.docx"
      />
      
      {/* JD text area */}
      <textarea
        value={jd}
        onChange={(e) => setJD(e.target.value)}
        placeholder="Paste job description here..."
        className="w-full p-4 border rounded"
      />
      
      {/* Sample data button */}
      <button 
        onClick={() => {
          setResume(null); 
          setJD(SAMPLE_JD);
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Use Sample Data
      </button>
      
      {/* Start button */}
      <button 
        onClick={handleStart}
        disabled={loading}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Starting...' : 'Start Assessment'}
      </button>
    </div>
  );
};
```

2. **Assessment Page** (10 hours)
   - Display question
   - Text input for answer
   - Submit button
   - Stream evaluation in real-time
   - Show score breakdown
   - Next question button

```tsx
// src/pages/AssessmentPage.tsx
import { useEffect, useState } from 'react';
import { useAssessmentStore } from '../store/assessmentStore';
import { useSocket } from '../hooks/useSocket';

export const AssessmentPage = () => {
  const [evaluation, setEvaluation] = useState('');
  const [score, setScore] = useState<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  
  const assessment = useAssessmentStore(s => s.assessment);
  const currentQuestion = useAssessmentStore(s => s.getCurrentQuestion());
  const submitAnswer = useAssessmentStore(s => s.submitAnswer);
  
  const socket = useSocket();
  
  useEffect(() => {
    if (socket) {
      socket.on('evaluation_streaming', (chunk) => {
        setIsStreaming(true);
        setEvaluation(prev => prev + chunk);
      });
      
      socket.on('evaluation_complete', (data) => {
        setIsStreaming(false);
        setScore(data);
      });
    }
  }, [socket]);
  
  const handleSubmit = async (answer: string) => {
    setEvaluation('');
    setScore(null);
    await submitAnswer(assessment.id, currentQuestion.id, answer);
  };
  
  if (!currentQuestion) return <div>Loading...</div>;
  
  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{currentQuestion.text}</h2>
        <p className="text-gray-600">Skill: {currentQuestion.skill}</p>
      </div>
      
      <textarea
        placeholder="Your answer here..."
        className="w-full h-32 p-4 border rounded mb-4"
        onChange={(e) => {/* ... */}}
      />
      
      <button 
        onClick={() => handleSubmit(answer)}
        className="bg-blue-500 text-white px-6 py-2 rounded"
      >
        Submit Answer
      </button>
      
      {/* Real-time evaluation */}
      {isStreaming && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <p>{evaluation}</p>
        </div>
      )}
      
      {score && (
        <div className="mt-8 p-4 bg-green-100 rounded">
          <h3 className="font-bold">Score: {score.total_score}/8</h3>
          <ul>
            <li>Correctness: {score.score_breakdown.correctness}</li>
            <li>Depth: {score.score_breakdown.depth}</li>
            {/* ... */}
          </ul>
          <button onClick={() => goToNextQuestion()}>Next Question</button>
        </div>
      )}
    </div>
  );
};
```

3. **Dashboard Page** (8 hours)
   - Display skill scores (claimed vs assessed)
   - Gap visualization (simple table or bar chart)
   - Overestimation warning
   - Export button

```tsx
// src/pages/DashboardPage.tsx
export const DashboardPage = () => {
  const results = useAssessmentStore(s => s.results);
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Your Assessment Results</h1>
      
      {/* Skill scores table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Skill</th>
            <th>Claimed</th>
            <th>Assessed</th>
            <th>Gap</th>
          </tr>
        </thead>
        <tbody>
          {results.skill_scores.map(skill => (
            <tr key={skill.skill} className="border-t">
              <td>{skill.skill}</td>
              <td>{skill.claimed_level}</td>
              <td>{skill.assessed_level}</td>
              <td className={skill.gap < 0 ? 'text-red-500' : 'text-green-500'}>
                {skill.gap}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Export button */}
      <button onClick={() => exportPDF()}>Export Results</button>
      
      {/* Next: View Learning Plan */}
      <button onClick={() => navigate('/learning-plan')}>
        View Learning Plan
      </button>
    </div>
  );
};
```

4. **Learning Plan Page** (6 hours)
   - Display recommended skills
   - Time estimates
   - Resources
   - Export to PDF

#### ✅ Phase 3: State Management + Hooks (40–48 hours)

```typescript
// src/store/assessmentStore.ts (Zustand)
import create from 'zustand';

interface AssessmentStore {
  assessment: any;
  questions: any[];
  answers: any[];
  results: any;
  currentIndex: number;
  
  startAssessment: (resume: string, jd: string) => Promise<void>;
  submitAnswer: (assessmentId: string, questionId: string, answer: string) => Promise<void>;
  getCurrentQuestion: () => any;
  completeAssessment: () => Promise<void>;
  reset: () => void;
}

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  assessment: null,
  questions: [],
  answers: [],
  results: null,
  currentIndex: 0,
  
  startAssessment: async (resume, jd) => {
    const response = await fetch('/api/assess/start', {
      method: 'POST',
      body: JSON.stringify({ resume_text: resume, jd_text: jd }),
    });
    const data = await response.json();
    set({
      assessment: data.assessment,
      questions: data.assessment.questions,
    });
  },
  
  submitAnswer: async (assessmentId, questionId, answer) => {
    const response = await fetch(`/api/assess/${assessmentId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ question_id: questionId, answer_text: answer }),
    });
    const data = await response.json();
    
    const state = get();
    set({
      answers: [...state.answers, data.evaluation],
      currentIndex: state.currentIndex + 1,
    });
  },
  
  getCurrentQuestion: () => {
    const state = get();
    return state.questions[state.currentIndex];
  },
  
  completeAssessment: async () => {
    const state = get();
    const response = await fetch(`/api/assess/${state.assessment.id}/results`);
    const results = await response.json();
    set({ results });
  },
  
  reset: () => set({ assessment: null, questions: [], answers: [], results: null, currentIndex: 0 }),
}));
```

---

## Day 3: Polish + Demo (48–72 hours)

### **All Team Members: Integration & Polish**

#### ✅ Phase 1: End-to-End Testing (48–56 hours)

**Test the full flow:**
1. Upload resume + JD
2. See questions appear
3. Submit answer
4. See evaluation stream in real-time
5. Complete assessment
6. View dashboard + learning plan

**Bugs to fix:**
- File upload issues
- WebSocket connection drops
- AI timeouts
- UI misalignments

#### ✅ Phase 2: Sample Data + Demo Setup (56–64 hours)

**Prepare hardcoded demo:**

```typescript
// src/constants/sampleData.ts
export const SAMPLE_RESUME = `
Jane Developer
Senior Software Engineer, 5 years experience

Skills:
- Python (3 years)
- JavaScript (2 years)
- React (2 years)
- PostgreSQL (2 years)
- Docker (1 year)

Experience:
- Built REST APIs with Python/Flask
- Frontend development with React
- Database optimization

...
`;

export const SAMPLE_JD = `
Senior Backend Engineer - FinTech Company

Requirements:
- 5+ years Python development
- PostgreSQL optimization experience
- Docker/Kubernetes
- REST API design
- Testing/TDD experience (CRITICAL)
- AWS experience (nice-to-have)

...
`;
```

**Add button:** "Use Demo Data" on upload page
- Loads sample resume + JD
- Pre-populated questions
- Demo answers + evaluations

#### ✅ Phase 3: UX Polish (64–72 hours)

**Polish checklist:**
- [ ] Loader spinners appear immediately
- [ ] Streaming evaluation is smooth
- [ ] Progress bar visible at all times
- [ ] Error messages are clear
- [ ] Mobile responsive (test on phone)
- [ ] Colors are consistent (brand colors)
- [ ] Buttons are 48px+ (accessibility)
- [ ] Loading states on every button

**Visual improvements:**
- Add header with logo
- Footer with GitHub link
- Smooth transitions between pages
- Animations for score reveal

**UX improvements:**
- Keyboard shortcut (Ctrl+Enter) to submit answer
- Auto-focus answer input
- Show question number (2/6)
- Save answers locally (localStorage) in case of crash
- Clear instructions on each page

---

## What to Hardcode (Speed Over Perfection)

### ✅ Do Hardcode These:

```python
# Pre-made questions for demo
SAMPLE_QUESTIONS = {
    "Python": [...],
    "JavaScript": [...],
}

# Pre-made learning plans
SAMPLE_LEARNING_PLANS = {
    "testing": {...},
    "docker": {...},
}

# Pre-made evaluations (for demo with quick turnaround)
SAMPLE_EVALUATIONS = {
    "q1": {
        "total_score": 6.5,
        "reasoning": "Good understanding of...",
    }
}
```

### ❌ Don't Bother With:

```
❌ Video assessment (too complex)
❌ Multi-language support (English only)
❌ Detailed authentication (use demo token)
❌ Email notifications
❌ Payment/subscriptions
❌ Recruiter dashboard
❌ Progress tracking (save scores only)
❌ Resource library (link to external, don't build)
❌ Advanced visualizations (simple tables are fine)
❌ Mobile app (web-only)
❌ Database backups
❌ Advanced error handling
❌ Rate limiting (skip for demo)
```

---

## Risk Mitigation

### **Risk: LLM API Fails**
**Mitigation:** Pre-load fallback questions + evaluations
```python
if llm_fails:
    return FALLBACK_QUESTIONS[skill]
```

### **Risk: WebSocket Disconnects**
**Mitigation:** Poll API every 2 seconds instead
```typescript
const checkProgress = setInterval(() => {
  fetch(`/api/assess/${id}/progress`)
}, 2000);
```

### **Risk: Database Gets Slow**
**Mitigation:** Use Redis cache for all reads
```typescript
const results = await redis.get(`assessment:${id}`) 
  || await db.query(...)
```

### **Risk: Time Runs Out**
**Priority order:**
1. ✅ Upload + questions (MVP)
2. ✅ Assessment page (MVP)
3. ✅ Evaluation (MVP)
4. ✅ Results dashboard
5. 🟡 Learning plan (can be simple)
6. 🟡 Styling (Tailwind default is fine)
7. ❌ Recruiter features
8. ❌ Advanced visualizations

---

## Deployment Checklist (Last 30 minutes)

- [ ] Backend running on port 5000
- [ ] AI service running on port 8000
- [ ] Frontend running on port 3000
- [ ] All 3 services connected (no errors in console)
- [ ] Demo data loads without error
- [ ] Full assessment flow works (upload → assessment → results)
- [ ] No crashes or timeouts
- [ ] Mobile browser works (use phone)
- [ ] GitHub repo updated + latest commit pushed
- [ ] README has demo instructions
- [ ] Screenshots of UI in GitHub

---

## Demo Script (See DEMO_SCRIPT.md)

Have someone practice the demo script at hour 46 (full dry run).

---

## Post-Hackathon (Week 1)

- Collect judge feedback
- Fix critical bugs
- Refactor messy code
- Add more question variety
- Better resource curation
- Actual database migrations
- Better error handling
- Production deployment

---

**Key Principle: Good > Perfect. Get it working first, polish later.**

**Last Updated:** April 26, 2026
