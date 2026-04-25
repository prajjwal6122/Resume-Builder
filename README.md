# AI-Powered Skill Assessment & Personalized Learning Plan Agent

## Problem Statement

**Traditional resumes are a poor signal of actual competency.**

Hiring managers face a critical gap:
- Candidates claim advanced skills they don't possess
- Recruiters can't verify proficiency without expensive interviews
- Resume screening is manual, time-consuming, and unreliable
- Career developers don't know which skills to prioritize learning

This leads to:
- Bad hiring decisions (6+ weeks wasted on poor fits)
- Career frustration (developers upskilling in the wrong areas)
- Inefficient talent matching

---

## Solution Overview

**SkillAssess** is an AI-powered assessment platform that:

1. **Extracts Real Requirements** from job descriptions
2. **Evaluates Actual Proficiency** through dynamic conversational assessment
3. **Scores Skill Depth** using a sophisticated rubric system
4. **Identifies Gaps** between claimed and real skills
5. **Generates Personalized Learning Plans** with adjacent, achievable goals
6. **Provides Resources & Time Estimates** for skill development

The system doesn't just parse resumes—it actively questions candidates to assess real-world competency, then creates actionable learning roadmaps.

---

## Key Features

### ✅ Smart Skill Extraction
- Automatically identifies required skills from job descriptions
- Disambiguates between required, nice-to-have, and adjacent skills
- Uses multi-turn AI analysis (not just keyword matching)

### ✅ Conversational Assessment Engine
- Dynamic question generation based on candidate resume
- Questions adapt based on answer quality
- Difficulty levels: Beginner → Intermediate → Advanced
- Anti-bluff mechanisms to catch overconfidence

### ✅ Sophisticated Scoring System
- Multi-dimensional evaluation:
  - **Correctness** (0–2)
  - **Depth** (0–2)
  - **Practical Examples** (0–2)
  - **Clarity** (0–1)
  - **Confidence Calibration** (0–1)
- Final score: 0–8 (maps to proficiency level)

### ✅ Intelligent Gap Analysis
- Compares claimed vs. assessed skills
- Identifies false positives (claimed but can't execute)
- Highlights genuine strengths
- Prioritizes gaps for learning impact

### ✅ Personalized Learning Roadmap
- Recommends adjacent skills (realistic progression)
- Time estimates (hours → weeks)
- Curated resource links
- Skill dependency mapping

---

## Demo Flow

```
User Uploads Resume + JD
         ↓
System Extracts Skills
         ↓
AI Generates 5–7 Questions (conversational)
         ↓
User Answers in Chat
         ↓
Real-time Evaluation & Scoring
         ↓
Skill Gap Dashboard
         ↓
Personalized Learning Plan
```

**Time:** 10–15 minutes per candidate

---

## Tech Stack

### Frontend
- **React 18** – Interactive UI
- **TypeScript** – Type safety
- **Tailwind CSS** – Styling
- **Zustand** – State management
- **Socket.IO** – Real-time chat

### Backend
- **Node.js + Express** – API server
- **Python FastAPI** – AI pipeline (separate microservice)
- **PostgreSQL** – Persistent storage
- **Redis** – Caching + session management
- **LangChain** – LLM orchestration
- **OpenAI GPT-4** – Core intelligence

### Deployment
- **Docker** – Containerization
- **AWS EC2 / Railway** – Server hosting
- **Vercel / Netlify** – Frontend CDN

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  [Upload] → [Chat Assessment] → [Dashboard] → [Plan]   │
└────────────────────────┬────────────────────────────────┘
                         │
                    REST + WebSocket
                         │
┌────────────────────────▼────────────────────────────────┐
│               Backend (Node.js/Express)                  │
│  [Auth] → [Resume Parser] → [JD Parser] → [API Routes] │
└────────────────────────┬────────────────────────────────┘
                         │
                    Service Bus / Queue
                         │
┌────────────────────────▼────────────────────────────────┐
│            AI Pipeline (Python FastAPI)                 │
│  [Extraction] → [Question Gen] → [Evaluation] → [Plan] │
└────────────────────────┬────────────────────────────────┘
                         │
                    API Calls
                         │
┌────────────────────────▼────────────────────────────────┐
│              External Services                           │
│  [OpenAI GPT-4] [Embedding Service] [Vector DB]        │
└─────────────────────────────────────────────────────────┘
                         │
                    ↓ Persistence ↓
┌────────────────────────────────────────────────────────┐
│    PostgreSQL Database (Users, Resumes, Plans)         │
│    Redis Cache (Sessions, Embeddings)                  │
└─────────────────────────────────────────────────────────┘
```

---

## How It Works

### Phase 1: Input & Parsing
User uploads resume + job description → System extracts text and identifies:
- Required skills
- Experience level expectations
- Domain context

### Phase 2: Question Generation
AI engine generates 5–7 questions that:
- Match candidate's resume experience
- Test the most critical skills
- Progressively increase difficulty
- Include follow-ups for depth

### Phase 3: Real-time Evaluation
As user answers:
- System streams evaluation thoughts
- Scores on 5 dimensions
- Detects overconfidence or gaps
- Prepares follow-up questions

### Phase 4: Gap Analysis
Algorithm compares:
- Claimed skills vs. assessed skills
- Score distribution
- Confidence calibration
- Identifying genuine strengths and red flags

### Phase 5: Learning Plan Generation
System recommends:
- Adjacent skills (dependencies)
- Time estimates (with confidence)
- Specific resources (curated by skill)
- Suggested study sequence

---

## Setup Instructions

### Prerequisites
- Node.js 18+ | Python 3.10+ | PostgreSQL 14+ | Docker

### Local Setup

#### 1. Clone Repository
```bash
git clone https://github.com/prajjwal6122/Resume-Builder.git
cd Resume-Builder
```

#### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

**Required Environment Variables** (.env):
```
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/skillassess
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret

# Frontend
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

#### 3. AI Pipeline Setup
```bash
cd ai-pipeline
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

#### 4. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
```

**Required Environment Variables** (.env.local):
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
```

#### 5. Database Initialization
```bash
cd backend
npm run db:migrate
npm run db:seed  # Optional: load sample data
```

---

## Running the Project

### Development Mode (All Services)

**Terminal 1: Backend**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2: AI Pipeline**
```bash
cd ai-pipeline
python app.py
# Runs on http://localhost:8000
```

**Terminal 3: Frontend**
```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

### Docker (Single Command)
```bash
docker-compose up
```

Verify services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/health
- AI Service: http://localhost:8000/health

---

## Demo Instructions

### Quick Demo (5 minutes)

1. **Go to Upload Page**
   - Click "Start Assessment"
   - Choose "Use Sample JD & Resume" (pre-loaded)

2. **Watch Question Generation**
   - System extracts 8 skills from JD
   - Generates first question in ~2 seconds

3. **Submit Answers**
   - Type sample answer or use pre-written response
   - See real-time evaluation

4. **View Results**
   - See skill scores (0–8 scale)
   - View gap analysis
   - Check learning roadmap

### Full Demo (15 minutes)

1. Upload real resume + JD
2. Go through 5–7 assessment questions
3. Explore skill dashboard
4. Review personalized learning plan
5. Click resource links (external)

---

## Future Improvements

### Post-Hackathon (2–4 weeks)
- [ ] Video assessment (tone, confidence analysis)
- [ ] Skill dependency graph visualization
- [ ] Peer comparison benchmarking
- [ ] Progress tracking (follow-up assessments)
- [ ] Integration with learning platforms (Coursera, Udemy)

### Long-term Vision (3–6 months)
- [ ] Fine-tuned models for domain-specific assessment
- [ ] Recruiter dashboard (bulk candidate screening)
- [ ] Career marketplace matching
- [ ] Continuous assessment (weekly micro-skills)
- [ ] Skill certification recommendations

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT License – See [LICENSE](LICENSE) for details.

---

## Questions?

- **Issues**: Open a GitHub issue
- **Questions**: Discussions section
- **Direct Contact**: team@skillassess.io

---

**Last Updated:** April 26, 2026
