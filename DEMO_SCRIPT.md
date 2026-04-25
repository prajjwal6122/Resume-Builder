# Demo Script (3–5 Minutes)
## For Hackathon Judges

---

## Opening (20 seconds)

> "Hi everyone. We're SkillAssess—an AI system that solves a real problem: **resumes show claimed skills, not actual proficiency.**
> 
> Most hiring processes waste time screening candidates with fake credentials. We built a system that **validates real skill depth in 10 minutes.**
> 
> Let me show you."

---

## Setup (30 seconds)

> "We have three main components:
> 1. **Skill Extraction** – AI reads your resume + job description, identifies what matters
> 2. **Conversational Assessment** – AI asks targeted questions to test real knowledge
> 3. **Smart Scoring** – Grades answers on depth, correctness, practical examples
> 
> Let's go live."

---

## Live Demo Walkthrough (3 minutes)

### **Step 1: Upload (20 seconds)**

> "First, you upload a resume and job description. We'll use demo data for speed."
> 
> *Click "Use Sample Data" button*
> 
> "The system extracts required skills from the JD and skills from the resume. Notice: **the candidate claims advanced Python, but the JD requires testing—which they don't mention at all.** That's a red flag we'll catch."

### **Step 2: Assessment Questions (30 seconds)**

> "Now the AI generates **targeted questions** based on what they claim to know and what the job needs."
> 
> *Show first question*
> 
> "Here's question 1: **'Describe how you would design a scalable REST API endpoint for authentication.'** Notice it's specific and practical—not a trivia question."
> 
> *Scroll through 2-3 more questions*
> 
> "We have beginner, intermediate, and advanced questions. The AI tailors difficulty based on their resume."

### **Step 3: Real Answer + Evaluation (1 minute 30 seconds)**

> "Let me submit an answer to this API question."
> 
> *Type sample answer*
> 
> "Watch what happens next—**real-time evaluation streaming**."
> 
> *Click Submit*
> 
> "The AI is evaluating on 5 dimensions:
> - **Correctness** (0-2): Did they get the right answer?
> - **Depth** (0-2): Do they understand trade-offs?
> - **Examples** (0-2): Can they show real code or scenarios?
> - **Clarity** (0-1): Is it understandable?
> - **Confidence Calibration** (0-1): Are they appropriately confident or overconfident?
> 
> Total score: **0-8.**"
> 
> *Wait for evaluation to stream in*
> 
> "See that? The AI is thinking in real-time. This answer scores a **6.5/8**: good correctness, but **missing edge cases and security considerations.** That's real feedback."

### **Step 4: Skill Dashboard (30 seconds)**

> *Skip ahead to results (to save time)*
> 
> "After completing all 6 questions, we get **the dashboard:**
> 
> - **Left column:** What they claimed (from resume)
> - **Right column:** What we assessed (from answers)
> 
> Notice the **red gaps**—they claimed advanced Python but scored only 6/8. More importantly, **testing is 0/0** (they never mentioned it, and we caught them lacking experience)."
> 
> *Point to overestimation warning*
> 
> "**This is the key insight:** The candidate is overconfident in Python and completely missing testing—which is critical for this role."

### **Step 5: Learning Plan (30 seconds)**

> "Finally: **a personalized learning roadmap.**
> 
> Instead of 'learn everything,' we recommend the **5 most impactful skills in priority order:**
> 
> 1. **Testing (Jest/TDD)** – 25 hours – CRITICAL (JD requires it)
> 2. **Docker** – 20 hours – HIGH (mentioned in JD, they're missing it)
> 3. **Advanced Python patterns** – 15 hours – MEDIUM (they have basics, needs depth)
> 
> Each skill has **curated resources** (free courses, tutorials, blogs), **time estimates**, and **practice projects.**
> 
> **This isn't a generic learning plan.** It's specific to their gaps and the job."

---

## Key Differentiator (20 seconds)

> "Here's why **SkillAssess is NOT just a resume parser or a GPT wrapper:**
> 
> ✅ **Real Evaluation Logic** – We grade on 5 dimensions, catch overconfidence, detect gaming
> 
> ✅ **Structured Scoring** – 0-8 scale is auditable and defensible
> 
> ✅ **Smart AI Usage** – We use prompting + post-processing + rules (not just raw LLM output)
> 
> ✅ **Actionable Output** – Learning plans with time estimates, resources, dependencies
> 
> **In 10 minutes, this system gives more honest feedback than a 1-hour interview.**"

---

## Business Impact (20 seconds)

> "**For Recruiters:**
> - Screen 50+ candidates/week instead of 5
> - Reduce false positives (bad hires cost $30K)
> - Validate remote candidates without live coding
> 
> **For Developers:**
> - Honest assessment of your real skills
> - Clear learning priorities (not random upskilling)
> - Marketable roadmap
> 
> **For Education:**
> - Bootcamps and universities can give real feedback at scale
> - Employers actually hire from your program"

---

## Closing (10 seconds)

> "We built this in 48 hours with a simple architecture:
> - React frontend (real-time chat)
> - Node.js backend (API orchestration)
> - Python FastAPI (AI pipeline)
> - PostgreSQL (persistence)
> 
> No fine-tuning. No complex ML. Just **smart prompting + solid engineering.**
> 
> **The future of hiring isn't more interviews. It's smarter, faster assessment.**
> 
> Thank you."

---

## Backup Answers (If Judges Ask)

### **Q: How do you prevent cheating?**
> "Good question. We use several anti-bluff techniques:
> 1. **Follow-up questions** – We ask why, not just what
> 2. **Edge case questions** – 'What if X fails?'
> 3. **Practical examples** – We score heavily on showing real code/scenarios
> 4. **Overconfidence detection** – We penalize answers that use absolute language without acknowledging trade-offs
> 5. **Diversity** – Questions are generated dynamically, hard to pre-memorize"

### **Q: What about false positives?**
> "We report confidence intervals (±0.5 to ±1.0) around each score. If someone gets lucky guesses, the score range will be wide, flagging uncertainty. Additionally, the skill score is the average of multiple questions, so one lucky answer doesn't distort the overall assessment."

### **Q: Why not just use traditional coding interviews?**
> "Coding interviews are expensive (30 min per candidate) and biased (whiteboard anxiety, luck of the question). Our system scales: one human interviewer can't assess 1000 candidates. AI can. Plus, we're assessing practical understanding, not gotcha questions."

### **Q: How do you generate resources?**
> "We have a curated database of resources (Udemy courses, free blogs, official docs, YouTube) and match them to skills using keyword matching + manual curation. Resources include cost, difficulty, rating, and duration so candidates can prioritize."

### **Q: What's the cost per assessment?**
> "~$0.20 using GPT-4 (API calls for extraction, generation, evaluation, planning). At scale, with caching and optimizations, we can get it down to $0.05-$0.10 per assessment."

### **Q: Why not just use GPT to generate learning plans?**
> "Because generic learning plans are useless ('learn Python'). We use the actual assessment results to determine what they're weak at, identify job requirements, and then generate personalized recommendations. The learning plan is constrained by their current level, realistic time, and dependencies."

### **Q: How is this different from Hackerrank / Codility?**
> "Those systems test coding skills through automated tests. Ours tests practical understanding and soft skills through conversation. You can pass Hackerrank by Googling solutions; you can't fake understanding in a conversational assessment. Plus, we generate learning paths—they just score."

### **Q: What about international candidates or non-native English speakers?**
> "Currently optimized for English and US job market. Scaling internationally would require: (1) language support, (2) localized job descriptions, (3) cultural context in scoring. This is a post-hackathon enhancement."

---

## Live Demo Contingencies

### **If AI Service is Down:**
Use hardcoded sample data
```
"Sorry, the AI service is rebooting. 
Let me show you with pre-recorded results instead."
→ Skip to dashboard/learning plan
```

### **If Frontend Won't Load:**
Show GitHub repository and screenshots
```
"Let me show you the code and demo screenshots instead."
→ Open GitHub repo, show README, show screenshot.png
```

### **If WebSocket Fails:**
Use polling instead
```
"The real-time streaming is using WebSockets, 
but we're using polling as fallback."
```

### **If Running Out of Time:**
Jump to learning plan
```
"Let me skip ahead to show you the most impressive part—
the personalized learning plan."
→ Skip to Step 5
```

---

## What NOT to Demo

❌ **Don't show:**
- Database schema
- Code repositories (unless asked)
- Error messages
- Loading spinners (feels slow)
- Recruiter dashboard (out of scope for MVP)
- Integration with job boards
- Video assessment (not built)

✅ **DO show:**
- Full end-to-end flow (upload → assessment → results)
- Real-time evaluation streaming
- Smart question generation
- Gap analysis with specific numbers
- Learning plan with resources
- Mobile responsiveness (if time)

---

## Timing Breakdown

```
Opening:              20 sec
Setup:                30 sec
Step 1 (Upload):      20 sec
Step 2 (Questions):   30 sec
Step 3 (Evaluation):  90 sec  ← LONGEST (show real-time)
Step 4 (Dashboard):   30 sec
Step 5 (Learning):    30 sec
Differentiator:       20 sec
Business Impact:      20 sec
Closing:              10 sec
──────────────────────────────
TOTAL:              5 minutes 20 seconds
```

**Reserve:** 1–2 minutes for judge questions

---

## Practice Checklist

- [ ] Run through demo at least 3 times
- [ ] Time yourself (keep under 5 minutes)
- [ ] Practice backup answers
- [ ] Have sample data loaded
- [ ] Test all 3 services running (backend, AI, frontend)
- [ ] Clear browser cache
- [ ] Phone plugged in
- [ ] Have GitHub link ready
- [ ] Have screenshots ready (in case of crash)
- [ ] Practice the opening hook (first 20 seconds MUST hook judges)

---

## Judge Perception Goals

By the end of the demo, judges should think:

1. ✅ **"This actually works"** (end-to-end demo running smoothly)
2. ✅ **"This is clever"** (not just LLM wrapper; smart evaluation logic)
3. ✅ **"This solves a real problem"** (resumes ARE unreliable; hiring IS expensive)
4. ✅ **"This is technically sound"** (architecture is clean, not hacky)
5. ✅ **"This is market-ready"** (UX is polished, could actually be used)

---

**Last Updated:** April 26, 2026
