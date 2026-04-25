# Project Scope & Focus (Hackathon MVP)

## Candidate-Centric Skill Assessment Agent

---

## 🎯 Core Objective (ONLY FOCUS HERE)

**Build a conversational AI agent that:**

1. ✅ **Accepts** a Job Description + Candidate Resume
2. ✅ **Extracts** required skills from JD, claimed skills from resume
3. ✅ **Assesses** real proficiency through targeted questions
4. ✅ **Scores** with transparency (multi-dimensional rubric)
5. ✅ **Identifies** skill gaps (claimed vs assessed)
6. ✅ **Generates** personalized learning roadmap with realistic time estimates
7. ✅ **Recommends** adjacent skills (not all skills, just impactful ones)
8. ✅ **Curates** resources (blogs, courses, docs, time estimates, cost)

**For: The Candidate** (self-improvement focus)

**Not for: Recruiters** (post-hackathon enhancement)

---

## 📍 What's IN-SCOPE (Hackathon MVP)

### **Core User Flow**

```
Candidate uploads Resume + JD
    ↓
System extracts required skills
    ↓
AI generates 5-7 targeted questions
    ↓
Candidate answers in chat (real-time evaluation)
    ↓
Dashboard shows: Claimed vs Assessed (with gaps)
    ↓
Learning Plan: "Here's what to learn & how long it takes"
    ↓
Download/Share results
```

### **Features IN-SCOPE**

| Feature                                   | Priority | Status           |
| ----------------------------------------- | -------- | ---------------- |
| **Resume + JD Upload**                    | P0       | ✅ Build         |
| **Text extraction** (PDF/DOCX)            | P0       | ✅ Build         |
| **Skill extraction** (LLM)                | P0       | ✅ Build         |
| **Question generation** (adaptive)        | P0       | ✅ Build         |
| **Real-time chat assessment**             | P0       | ✅ Build         |
| **Multi-dimensional scoring** (0-8 scale) | P0       | ✅ Build         |
| **Gap analysis dashboard**                | P0       | ✅ Build         |
| **Personalized learning plan**            | P0       | ✅ Build         |
| **Resource curation** (links + time)      | P0       | ✅ Build         |
| **Download/PDF export**                   | P0       | ✅ Build         |
| **Progress tracking** (save results)      | P1       | ✅ Build (basic) |
| **Sample data for demo**                  | P0       | ✅ Build         |

---

## ❌ What's OUT-OF-SCOPE (Post-Hackathon)

### **Recruiter Features** (OPTIONAL - Not for hackathon)

- ❌ Bulk candidate assessment
- ❌ Recruiter dashboard / comparisons
- ❌ Candidate filtering / ranking
- ❌ Integration with job boards
- ❌ Hiring workflow
- ❌ Candidate database
- ❌ Report generation for hiring

**When:** Add 2-4 weeks post-hackathon (separate code path)

### **Advanced Features** (NICE-TO-HAVE - Not for hackathon)

- ❌ Video assessment / speech analysis
- ❌ Multi-language support
- ❌ Fine-tuned models
- ❌ Skill dependency graph visualization
- ❌ Integration with learning platforms (Udemy, Coursera)
- ❌ Peer benchmarking / leaderboards
- ❌ Real-time collaboration

**When:** Add in months 2-3 (if product gains traction)

---

## 🎬 Demo Story (For Judges)

### **What You'll Demo**

> _"I'm a mid-career developer. I want to know if I'm ready for a senior role at my target company. Let me show you what SkillAssess does."_

**Step 1: Upload** (30 sec)

- Candidate uploads resume (has React, JavaScript, some Node.js)
- Pastes job description (needs React, Python, Docker, Testing, System Design)

**Step 2: See What's Required** (20 sec)

- System extracts 8 critical skills from JD
- Shows: "You claimed React + JavaScript. You're missing Python, Docker, Testing."

**Step 3: Chat Assessment** (1 min 30 sec)

- AI asks 6 targeted questions:
  - "Design a React component that handles authentication"
  - "You mention Docker once — explain it"
  - "Walk me through testing a React component"
  - etc.
- Each answer is **evaluated in real-time** (streaming)
- See score breakdown: Correctness (2/2), Depth (1/2), Examples (1/2)

**Step 4: See Results** (30 sec)

- Dashboard shows:
  - React: Claimed 8 → Assessed 7 ✅ (match)
  - Python: Claimed 0 → Assessed 0 ❌ (gap)
  - Testing: Claimed 0 → Assessed 1 🚨 (RED FLAG)
  - Docker: Claimed 0 → Assessed 0 ❌ (missing)

**Step 5: Learning Plan** (30 sec)

- "Here's what you should learn, in order:"
  1. Testing (Jest) – 25 hours, 5 weeks at 5 hrs/week
  2. Python Basics – 40 hours, 8 weeks
  3. Docker – 20 hours, 4 weeks
  4. System Design – 15 hours (optional, nice-to-have)
- Each skill has: resources, time, why it matters

**Closing** (20 sec)

> "That's SkillAssess. In 15 minutes, you got honest feedback on what you actually know vs. what you claimed. No surprise hiring failures. No wasted time learning the wrong skills. Just clarity."

---

## 💻 Technical Scope

### **Architecture (Simplified)**

```
Frontend (React)
├── Upload page
├── Chat assessment page
├── Results dashboard
└── Learning plan page

Backend (Node.js + Express)
├── File parsing (PDF/DOCX)
├── API orchestration
└── Database (store results)

AI Pipeline (Python FastAPI)
├── Skill extraction (LLM)
├── Question generation (LLM)
├── Answer evaluation (LLM + post-processing)
├── Gap analysis (rules + LLM)
└── Learning plan (rules + LLM)

Database
└── PostgreSQL (assessments, results, learning plans)
```

### **APIs (CANDIDATE-ONLY)**

```
POST /api/assess/start
  Input: resume_text, jd_text
  Output: assessment_id, questions

POST /api/assess/{id}/answer
  Input: question_id, answer_text
  Output: evaluation (score, reasoning)

GET /api/assess/{id}/results
  Output: skill_scores, gaps, learning_plan

GET /api/assess/{id}/results/export
  Output: PDF file
```

**What's NOT included:**

- No bulk assessment endpoints
- No recruiter authentication
- No candidate comparison
- No hiring workflow

---

## ⏰ Development Timeline (48–72 hours)

### **Day 1: Backend + AI Foundation**

- Resume/JD parsing
- Skill extraction pipeline
- Question generation engine
- Answer evaluation (scoring rubric)

### **Day 2: Frontend + Assessment Flow**

- Upload page
- Chat interface (real-time)
- Results dashboard
- Basic learning plan display

### **Day 3: Polish + Demo**

- End-to-end testing
- Sample data / demo mode
- UI refinements
- Production readiness

---

## 🎓 Learning Plan Focus

The learning plan should emphasize **adjacent skills** (realistic progression):

**DO:**
✅ "You know React, here's how to learn Node.js (the natural next step)"
✅ "You need Testing. Here's a 25-hour path (realistic for 5 weeks)"
✅ "Python is harder than JavaScript, plan 40 hours (not 5 hours)"
✅ "Start with Jest Testing before Docker (dependencies matter)"

**DON'T:**
❌ "Learn everything on the internet"
❌ "You're missing 50 skills; prioritize yourself"
❌ "Here's a generic roadmap (not personalized to YOU)"
❌ "No time estimates or dependencies"

---

## 🎯 Success Criteria (Hackathon)

**Judges will be impressed if:**

1. ✅ **End-to-end works** (upload → assessment → learning plan in <15 min)
2. ✅ **Questions are smart** (not generic ChatGPT; tailored to resume + JD)
3. ✅ **Scoring is transparent** (can see exactly how score is calculated)
4. ✅ **Learning plan is actionable** (specific, realistic, not overwhelming)
5. ✅ **UX is polished** (no crashes, clear flow, good design)
6. ✅ **AI logic is clever** (not just LLM wrapper; has real intelligence)

**Red flags:**
❌ Generic questions that could apply to anyone
❌ Inconsistent scoring
❌ Learning plans that are overwhelming
❌ Crashes or timeouts
❌ Looks unfinished

---

## 📊 Example Use Cases (NOT recruiter use cases)

### **Use Case 1: Career Switcher**

> "I'm a backend (Python) engineer wanting to become full-stack. Am I really ready for the frontend part?"
> **SkillAssess:** Assesses React knowledge → Finds gaps → Recommends JavaScript + React progression

### **Use Case 2: Early-Career Developer**

> "I claim 'intermediate JavaScript' on my resume. But am I? What should I learn next?"
> **SkillAssess:** Tests actual depth → Finds overconfidence in some areas, underconfidence in others → Recommends focused learning

### **Use Case 3: Bootcamp Graduate**

> "I finished a bootcamp. How ready am I for junior dev jobs?"
> **SkillAssess:** Tests against real junior requirements → Shows honest gaps → Personalized roadmap to be actually ready

### **Use Case 4: Skill Validator**

> "I've been self-teaching. Are my skills legitimate?"
> **SkillAssess:** Assesses real depth → Provides validation (and areas to improve)

---

## 🚫 NOT Use Cases (Recruiter-focused, skip for now)

❌ "I need to screen 100 candidates in one day"
❌ "Show me a ranked list of candidates"
❌ "I want to integrate with LinkedIn"
❌ "Can I see all candidates' results?"
❌ "I want to schedule interviews based on scores"

**These are v2 (post-hackathon).**

---

## 💡 Core Philosophy

**This is a tool FOR candidates, not FOR recruiters.**

It helps candidates:

- Know their real skills (not delusional)
- Identify clear learning priorities (not overwhelmed)
- Plan realistic progression (not "learn everything")
- Gain confidence through validation (or humility through gaps)

It does NOT:

- Rank candidates
- Judge fitness for a job
- Automate hiring
- Replace interviews

---

## 📋 Checklist Before Submission

### **Core MVP**

- [ ] Resume + JD upload works (drag-drop friendly)
- [ ] Skill extraction accurate (>80% quality)
- [ ] 5-7 questions generated per assessment
- [ ] Real-time evaluation streams (smooth UX)
- [ ] Scoring is transparent (shows breakdown)
- [ ] Gap analysis identifies overconfidence
- [ ] Learning plan is personalized (not generic)
- [ ] Resources are curated (not just links)
- [ ] Time estimates are realistic
- [ ] PDF export works

### **Demo Ready**

- [ ] Sample resume + JD pre-loaded
- [ ] Can complete full flow in 10 minutes
- [ ] No crashes or timeouts
- [ ] Looks polished (no placeholder text)
- [ ] Judges can understand value in <5 min

### **Code Quality**

- [ ] Well-commented code
- [ ] Error messages are helpful (not cryptic)
- [ ] No hardcoded secrets (API keys in .env)
- [ ] README has clear setup instructions
- [ ] All services (frontend, backend, AI) run locally

---

## 🎯 One-Line Summary

> **Help candidates assess their REAL skills, identify SPECIFIC gaps, and learn REALISTIC next steps — NOT to filter them, but to grow them.**

---

**Last Updated:** April 26, 2026
