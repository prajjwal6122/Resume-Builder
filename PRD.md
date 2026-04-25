# Product Requirements Document (PRD)

## AI-Powered Skill Assessment & Personalized Learning Plan Agent

---

## Problem Statement

### The Gap

**Current Reality:**

- Resumes list skills; they don't prove competency
- A developer claiming "Advanced Python" might struggle with basic problem-solving
- Recruiters spend 40% of screening time on false positives
- Junior developers don't know what skills compound into career growth

**Quantified Pain:**

- 60% of candidates overstate skills (industry research)
- Average cost of bad hire: $15K–$30K
- Career paths are chaotic; most developers pursue random upskilling

### Why This Matters

**For Candidates:**

- No validated feedback on real skill levels
- Wasted time learning irrelevant skills
- Career progression is trial-and-error

**For Recruiters:**

- Expensive screening (hours per candidate)
- High false positive rate (poor quality hires)
- No efficient way to assess remote candidates

**For Organizations:**

- Onboarding failures due to skill gaps
- Expensive rework and knowledge transfer

---

## Target Users (Hackathon Focus)

### **PRIMARY: Candidate-Self-Assessment**

#### Persona 1: Early-Career Developer 👤

- Age: 22–28
- Challenge: Building credible skill profile
- Goal: Clear learning roadmap aligned with market demand
- Motivation: Career acceleration, salary negotiation
- **Use Case:** "I want to know if my resume claims are legit"

#### Persona 2: Mid-Career Developer Transitioning 👤

- Age: 28–38
- Challenge: Switching domains/stacks (e.g., Backend → Full-stack)
- Goal: Validate existing skills + identify key gaps
- Motivation: Career growth, avoiding wasted learning time
- **Use Case:** "Before applying to senior roles, let me test my real depth"

#### Persona 3: Career Coach / Educator 👤

- Age: 30–60
- Challenge: Give students actionable feedback
- Goal: Generate personalized learning paths at scale
- Motivation: Student outcomes, reputation
- **Use Case:** "Help my bootcamp graduates validate readiness for job market"

---

### **SECONDARY: Recruiter Features (POST-HACKATHON)**

> ⏸️ **NOT for this hackathon. Will add in v2 (2–4 weeks post-submission).**

- Recruiter / Talent Manager (bulk screening, candidate comparison, hiring workflow)
- Integration with job boards and ATS systems
- Candidate ranking and automated filtering

---

## Features

### 🎯 HACKATHON MVP: Candidate Assessment & Learning (P0)

**ALL of these must ship for demo. Everything is candidate-focused.**

#### 1. Resume + JD Upload

- **What:** Accept resume (PDF/DOCX) + job description (text/PDF)
- **Why:** Entry point; enables all downstream features
- **Acceptance Criteria:**
  - Parse text from PDF/DOCX correctly
  - Extract both documents in <2 seconds
  - Handle 50+ page documents
  - Show clear error messages on unsupported formats

#### 2. Skill Extraction (Bidirectional)

- **From JD:** Extract required skills (rank by importance)
- **From Resume:** Extract claimed skills (with years of experience)
- **Why:** Foundation for all matching and assessment
- **Acceptance Criteria:**
  - Extract 15–25 skills per JD (realistic range)
  - Identify skill level expectations (Junior/Mid/Senior)
  - Accuracy >80% (vs. manual annotation)
  - Distinguish between core and adjacent skills

#### 3. Conversational Assessment Engine

- **What:** AI asks 5–7 targeted questions, user answers in chat
- **Why:** Real-time skill validation, engaging UX, adaptive questioning
- **Acceptance Criteria:**
  - Questions visible in <3 seconds
  - Questions are specific and testable
  - Chat is responsive (streaming enabled)
  - Auto-saves user answers
  - Supports follow-up questions based on answer quality

#### 4. Real-Time Scoring System

- **What:** Evaluate each answer on 5 dimensions (correctness, depth, examples, clarity, confidence)
- **Why:** Nuanced skill assessment (not binary pass/fail)
- **Acceptance Criteria:**
  - Score formula transparent and documented
  - Score updates in real-time as user types
  - Shows score breakdown (not just total)
  - Handles edge cases (vague answers, non-answers, off-topic)

#### 5. Skill Gap Dashboard

- **What:** Visual summary of assessed skills vs. claimed skills
- **Why:** Clear feedback on actual proficiency + confidence intervals
- **Acceptance Criteria:**
  - Shows all skills (claimed and assessed)
  - Color-coded: match (green), gap (red), exceed (blue)
  - Displays score (0–8) and confidence interval
  - Sortable by gap size, importance, or alphabetical

#### 6. Personalized Learning Plan

- **What:** Prioritized roadmap of skills to learn (with time estimates, dependencies, curated resources)
- **Why:** Actionable next steps for career growth
- **Acceptance Criteria:**
  - Recommends 5–10 skills (prioritized by market value + adjacency)
  - Includes realistic time estimates (5–40 hours per skill)
  - Identifies skill dependencies (don't recommend React before JavaScript)
  - Lists 2–3 curated resources per skill (links + platforms)
  - Explains WHY each skill matters (how it connects to the target role)
  - Exportable as PDF

---

### ⏸️ POST-HACKATHON FEATURES (v1.1)

**These are RECRUITER-ONLY and NOT needed for hackathon demo. Can be added 2–4 weeks later.**

#### P1 Features: Recruiter Screening (2–3 weeks post-submission)

- [ ] Bulk candidate assessment
- [ ] Recruiter dashboard (see all candidates)
- [ ] Candidate filtering + ranking by skill match
- [ ] Skill gap comparison across candidates
- [ ] Export results to CSV/PDF for hiring team
- [ ] Integration with job boards (LinkedIn, etc.)

#### P2 Features: Advanced Capabilities (1–2 months post-submission)

- [ ] Video assessment (speech analysis)
- [ ] Skill benchmarking (peer comparison)
- [ ] Collaborative learning (study groups)
- [ ] Integration with learning platforms (Udemy, Coursera)
- [ ] Certification pathways
- [ ] Multi-language support

---

## User Stories

### Story 1: Early-Career Developer Self-Assessment

```
AS A    junior developer (1–2 years experience)
I WANT  validated feedback on my real skill level
SO THAT I can build a credible resume and know what to learn next

Acceptance Criteria:
✓ Upload resume + target job description
✓ Receive 6–7 targeted questions in ~30 seconds
✓ Get instant scoring on each answer
✓ See skill breakdown (claimed vs. assessed)
✓ Get a personalized learning plan with time estimates
✓ Share results with mentors/recruiters
```

### Story 2: Career Switcher Learning Path

```
AS A    mid-career backend developer switching to full-stack
I WANT  know exactly which frontend skills to prioritize
SO THAT I can plan efficient learning + negotiate salary accurately

Acceptance Criteria:
✓ System identifies skills I already have (Python → JavaScript transfer)
✓ Prioritizes gaps (highest market value first)
✓ Estimates time to proficiency for each skill
✓ Recommends learning sequence (dependencies)
✓ Suggests practical projects to apply skills
```

### Story 3: Recruiter Fast-Track Screening

```
AS A    recruiter screening 20+ candidates/day
I WANT  quick, reliable skill validation without coding interviews
SO THAT I can shortlist candidates 3x faster

Acceptance Criteria:
✓ Bulk upload resumes + JD
✓ Auto-run assessment on each candidate
✓ Get ranked candidate list (best match first)
✓ See skill gap breakdown per candidate
✓ Filter by score, skills, or gap size
✓ Export results to CSV/PDF
```

### Story 4: Candidate Improvement Tracking

```
AS A    developer who completed a learning plan
I WANT  retake the assessment to prove improvement
SO THAT I can update my resume + negotiate better

Acceptance Criteria:
✓ Easy retake (same questions or new set)
✓ See improvement over time (progress chart)
✓ Confidence intervals around scores
✓ Exportable report of growth
```

### Story 5: Educator Creating Learning Cohorts

```
AS A    bootcamp instructor
I WANT  assess all students' skills at course start
SO THAT I can tailor curriculum and track progress

Acceptance Criteria:
✓ Batch upload student resumes
✓ Define class-wide job description
✓ Get aggregate results (class skill gaps)
✓ See individual progress reports
✓ Export data for analytics
```

---

## Success Metrics

### User Engagement

- **DAU (Daily Active Users):** 500+ within 3 months
- **Assessment Completion Rate:** 85%+ (of started sessions)
- **Average Session Duration:** 12–15 minutes
- **Repeat Usage:** 40%+ of users retake within 3 months

### Quality & Accuracy

- **Score Calibration:** Within ±0.5 points of expert evaluation (sample validation)
- **User Satisfaction:** NPS ≥ 50
- **Skill Extraction Accuracy:** 80%+ (vs. manual annotation)
- **False Positive Rate:** <15% (overestimation of skills)

### Business Metrics

- **Cost per Assessment:** <$0.10 (LLM usage)
- **Time to Assessment:** <3 seconds (question generation)
- **Recruiter Adoption:** 100+ companies using bulk feature within 6 months
- **Resource Click-Through:** 30%+ of learning plans lead to resource engagement

### System Performance

- **Page Load Time:** <2 seconds
- **Chat Latency:** <500ms (p95)
- **API Uptime:** 99.5%+
- **Cost per Monthly Active User:** <$1.50

---

## Constraints

### Technical

- **Timeline:** Must be buildable in 48–72 hours (hackathon)
- **No Fine-tuning:** Use off-the-shelf LLMs (GPT-4)
- **Simple Architecture:** Prefer CRUD operations over complex ML pipelines
- **Budget:** $500–$1,500 (LLM API costs during hackathon)

### Product

- **MVP Scope:** 6 core features only (no recruiter dashboard yet)
- **No Video:** Streaming AI is complex; text-only for hackathon
- **Single JD:** Assess against one job per session (not multiple)
- **Storage:** Keep all data ephemeral (no long-term DB needed for demo)

### Team

- **Max 4 developers:** Frontend (1–2), Backend (1–2), AI (1)
- **Skill Mix:** At least 1 person comfortable with LLM APIs
- **Time Zone:** Coordinated work; async-friendly code

---

## Assumptions

### User Behavior

- Users can articulate their experience clearly in chat
- Candidates want honest feedback (not just praise)
- Recruiters will use this to supplement (not replace) live interviews
- Learning plans are used within 1 month of generation

### Technology

- OpenAI API remains available + affordable ($0.05–$0.30 per assessment)
- PDF parsing is reliable enough (small errors acceptable)
- WebSocket connection is stable (no fallback needed for MVP)
- Users have modern browsers (Chrome, Firefox, Safari)

### Market

- There is demand for quick skill validation (validated by surveys)
- Developers will share results (social proof)
- Companies will pay for bulk licensing (post-MVP)
- Alternative credentials (bootcamps, certifications) remain valued

### Project

- No major pivots needed mid-hackathon
- Judges prioritize UX + AI logic (not scale)
- Minimal customization per company (one-size-fits-most learning plans)
- Sample data is sufficient for demo (no need for 1,000s of real assessments)

---

## Success Definition (For Hackathon)

✅ **Judges will be impressed if:**

1. System works end-to-end (upload → assessment → plan in <15 min)
2. Questions are smart + difficulty adapts
3. Scoring is transparent + difficult to game
4. Learning plans feel actionable (not generic)
5. UX is polished (no clunky forms, good error handling)
6. Demo is smooth + repeatable

❌ **Red Flags:**

- Questions are generic/repeated
- Scoring feels arbitrary or gameable
- System crashes or times out
- Learning plans are obvious/unhelpful
- UI is unfinished or confusing

---

## Rollout Plan (Post-Hackathon)

### Phase 1: Early Access (Week 1–2)

- Beta with 50 developers (friends, alumni, bootcamp students)
- Collect feedback on UX + accuracy
- Iterate on question quality

### Phase 2: Recruiter Pilot (Week 3–6)

- Partner with 3–5 hiring managers
- Build bulk assessment feature
- Validate business model (freemium vs. paid)

### Phase 3: Scale (Month 2–3)

- Open to public (free for individuals)
- Premium plans for recruiters/educators
- Integrate with job boards (LinkedIn, Indeed)

---

**Document Version:** 1.0  
**Last Updated:** April 26, 2026  
**Owner:** Product Team
