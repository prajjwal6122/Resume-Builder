'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/app/store/assessmentStore';
import * as api from '@/app/services/api';

// ─── Sample demo texts ───────────────────────────────────────────────
const DEMO_RESUME = `Jane Developer — Senior Software Engineer
jane.developer@email.com | github.com/janedeveloper

SKILLS: Python (4 yrs, advanced), JavaScript (3 yrs), React (2 yrs), PostgreSQL (3 yrs), Docker (1 yr), Redis (1 yr), AWS basics

EXPERIENCE:
Senior Software Engineer — TechCorp (2023–Present)
• Built Python/Flask REST APIs serving 50,000+ daily users
• Optimized PostgreSQL queries reducing p95 latency from 800ms → 120ms
• Implemented Redis caching layer cutting DB load by 60%

Software Engineer — StartupXYZ (2021–2023)
• React frontend + FastAPI backend development
• PostgreSQL data modeling and complex queries
• Deployed on AWS (EC2, S3, RDS)

EDUCATION: B.S. Computer Science — State University (2020)`;

const DEMO_JD = `Senior Backend Engineer — FinTech Innovators Inc. (Remote)

REQUIRED:
• 5+ years Python backend development (CRITICAL)
• Deep PostgreSQL expertise — query optimization, indexing (CRITICAL)
• Testing and TDD — we don't ship without tests (CRITICAL)
• Docker and containerization (HIGH)
• CI/CD pipelines — GitHub Actions or similar (HIGH)
• REST API design principles (CRITICAL)

NICE TO HAVE:
• Kubernetes, GraphQL, Celery, financial domain knowledge

Salary: $150K–$180K | Equity | Learning budget $2K/year`;

export default function Home() {
  const router = useRouter();
  const { startAssessment, setError, isLoading } = useAssessmentStore();

  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [resumeFile, setResumeFile] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [starting, setStarting] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── File handling ─────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt', 'md'].includes(ext || '')) {
      setError('Please upload a PDF, DOCX, or TXT file.');
      return;
    }
    try {
      const { text } = await api.uploadResume(file);
      setResumeText(text);
      setResumeFile(file.name);
    } catch (e) {
      // Fallback: read as text for demo
      const reader = new FileReader();
      reader.onload = (ev) => {
        const t = ev.target?.result as string;
        setResumeText(t || '');
        setResumeFile(file.name);
      };
      reader.readAsText(file);
    }
  }, [setError]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  // ─── Demo mode ─────────────────────────────────────────
  const loadDemo = () => {
    setResumeText(DEMO_RESUME);
    setJdText(DEMO_JD);
    setResumeFile('Jane_Developer_Resume.pdf (demo)');
    setDemoLoaded(true);
  };

  // ─── Start flow ────────────────────────────────────────
  const handleStart = async () => {
    if (!resumeText.trim() || !jdText.trim()) {
      setError('Please provide both a resume and job description.');
      return;
    }
    setStarting(true);
    try {
      await startAssessment(resumeText.trim(), jdText.trim(), demoLoaded);
      router.push('/assess');
    } catch (e) {
      setError((e as Error).message);
      setStarting(false);
    }
  };

  const canStart = resumeText.trim().length > 50 && jdText.trim().length > 50;

  // ═══════════════════════════════════════════════════════
  return (
    <div className="min-h-screen grid-bg">

      {/* ── Navbar ──────────────────────────────────────── */}
      <nav className="navbar">
        <div className="flex items-center gap-2.5">
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color: 'white', fontFamily: 'Bricolage Grotesque, sans-serif'
          }}>S</div>
          <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' }}>
            SkillAssess
          </span>
        </div>

        <div className="flex items-center gap-1" style={{ fontSize: 14 }}>
          {['How it works', 'Sample Output', 'About'].map(item => (
            <button key={item} className="btn btn-ghost btn-sm">{item}</button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 600,
            color: '#16A34A',
            background: '#DCFCE7', padding: '4px 10px', borderRadius: 99, border: '1px solid #BBF7D0'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
            AI Ready
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleStart} disabled={!canStart || starting}>
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 24px 60px' }}>
        <div className="hero-gradient" />

        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

          {/* Left — copy */}
          <div>
            <div className="hero-badge anim-fade-up">
              <span style={{ background: '#2563EB', color: 'white', borderRadius: 99, padding: '2px 8px', fontSize: 11 }}>NEW</span>
              AI-Powered Career Intelligence
            </div>

            <h1 style={{ fontSize: 52, fontWeight: 800, marginTop: 20, marginBottom: 16, lineHeight: 1.1 }}
              className="anim-fade-up anim-delay-100">
              From Resume to
              <br />
              <span className="text-gradient">Learning Roadmap</span>
              <br />
              in Minutes
            </h1>

            <p style={{ fontSize: 16, color: 'var(--text-sub)', lineHeight: 1.7, maxWidth: 440, marginBottom: 32 }}
              className="anim-fade-up anim-delay-200">
              Upload your resume + job description. Our AI assesses your <em>real</em> skill proficiency through a short conversation, then generates a{' '}
              <strong style={{ color: 'var(--text)' }}>personalized learning path</strong>{' '}
              with curated resources and honest time estimates.
            </p>

            <div className="anim-fade-up anim-delay-300" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={handleStart} disabled={!canStart || starting}>
                {starting ? <><div className="spinner" /> Starting...</> : '🚀 Build My Learning Path'}
              </button>
              <button className="btn btn-secondary btn-lg" onClick={loadDemo}>
                ⚡ Try Demo
              </button>
            </div>

            <div className="anim-fade-up anim-delay-300" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 24, color: 'var(--text-muted)', fontSize: 13 }}>
              <div style={{ display: 'flex' }}>
                {['#2563EB', '#7C3AED', '#10B981'].map((c, i) => (
                  <div key={i} style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: c, border: '2px solid white',
                    marginLeft: i > 0 ? -8 : 0
                  }} />
                ))}
              </div>
              <span><strong style={{ color: 'var(--text)' }}>1,000+</strong> learning paths generated</span>
            </div>

            {/* Value props */}
            <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
              {[
                { icon: '🎯', text: '5-dimension skill scoring' },
                { icon: '⚡', text: 'Instant gap analysis' },
                { icon: '🗺️', text: 'Curated learning paths' },
              ].map(({ icon, text }) => (
                <div key={text} className="tag">
                  <span>{icon}</span> {text}
                </div>
              ))}
            </div>
          </div>

          {/* Right — upload form as floating card */}
          <div className="card-float anim-scale-in" style={{ maxWidth: 460 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📄</span> Start Your Assessment
              {demoLoaded && (
                <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>Demo loaded ✓</span>
              )}
            </h2>

            {/* Resume drop zone */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                Resume
              </label>
              <div
                className={`drop-zone${isDragging ? ' drag-over' : ''}${resumeText ? ' has-file' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                style={{ padding: '20px 16px' }}
              >
                {resumeText ? (
                  <div>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>✅</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#16A34A' }}>{resumeFile}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {resumeText.length.toLocaleString()} characters extracted
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setResumeText(''); setResumeFile(''); }}
                      style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>📎</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Drop your resume or click to upload</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>PDF, DOCX, or TXT — max 10MB</div>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

              {!resumeText && (
                <>
                  <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', margin: '10px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
                    or paste text
                    <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border)' }} />
                  </div>
                  <textarea
                    className="input"
                    placeholder="Paste your resume text here..."
                    style={{ height: 80, fontSize: 13 }}
                    onChange={(e) => { setResumeText(e.target.value); setResumeFile('Pasted resume'); }}
                  />
                </>
              )}
            </div>

            {/* JD text area */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
                Job Description
              </label>
              <textarea
                className="input"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste the job description here — include required skills, responsibilities, and must-haves."
                style={{ height: 120, fontSize: 13 }}
              />
              <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{jdText.length} characters</div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1, fontSize: 13 }} onClick={loadDemo}>
                ⚡ Use Demo Data
              </button>
              <button className="btn btn-primary" style={{ flex: 1, fontSize: 13 }} onClick={handleStart} disabled={!canStart || starting}>
                {starting
                  ? <><div className="spinner" /> Starting...</>
                  : '🚀 Start Assessment →'}
              </button>
            </div>

            {demoLoaded && (
              <div style={{
                marginTop: 14, padding: '10px 14px', background: '#EFF6FF',
                border: '1px solid #BFDBFE', borderRadius: 10, fontSize: 12, color: '#1D4ED8', fontWeight: 500
              }}>
                ✨ <strong>Demo:</strong> Jane Developer vs. FinTech JD — a realistic skill gap scenario showing Testing/TDD as a critical missing skill.
              </div>
            )}
          </div>
        </div>

        {/* Company logos row */}
        <div style={{ maxWidth: 1100, margin: '60px auto 0', textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Trusted by engineers from
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap', opacity: 0.4, filter: 'grayscale(1)' }}>
            {['Google', 'Stripe', 'Airbnb', 'Netflix', 'Shopify'].map(co => (
              <span key={co} style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--gray-600)' }}>{co}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────── */}
      <section style={{ padding: '60px 24px', background: 'white', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 10 }}>How It Works</h2>
            <p style={{ color: 'var(--text-sub)', fontSize: 16 }}>From upload to personalized roadmap in under 10 minutes</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { n: '1', icon: '📄', title: 'Upload', desc: 'Resume + Job Description', color: '#EFF6FF', border: '#BFDBFE', accent: '#2563EB' },
              { n: '2', icon: '🤖', title: 'Quick Assessment', desc: '6 targeted questions on key skills', color: '#EDE9FE', border: '#DDD6FE', accent: '#7C3AED' },
              { n: '3', icon: '📊', title: 'Gap Analysis', desc: 'Claimed vs actual proficiency', color: '#ECFDF5', border: '#BBF7D0', accent: '#16A34A' },
              { n: '4', icon: '🗺️', title: 'Learning Path', desc: 'Curated roadmap with resources', color: '#FFF7ED', border: '#FED7AA', accent: '#EA580C' },
            ].map((step) => (
              <div key={step.n} className="stat-card" style={{ background: step.color, borderColor: step.border, textAlign: 'left', padding: '24px 20px' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: step.accent,
                  color: 'white', fontWeight: 800, fontSize: 15,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 14
                }}>{step.n}</div>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{step.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Key Differentiators ─────────────────────────── */}
      <section style={{ padding: '60px 24px', background: 'var(--gray-50)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32, textAlign: 'center' }}>
            Not just another AI tool
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[
              { icon: '🎯', title: '5-Dimension Scoring', desc: 'Every answer graded on Correctness, Depth, Examples, Clarity, and Confidence Calibration — not just "right or wrong".' },
              { icon: '🔍', title: 'Anti-Bluff Detection', desc: 'Our rubric penalizes buzzword salad and overconfident claims. Real knowledge > rehearsed phrases.' },
              { icon: '🗺️', title: 'Adjacent Skill Routing', desc: 'We recommend skills you can realistically learn fastest given your current knowledge base — not generic paths.' },
              { icon: '⏱️', title: 'Honest Time Estimates', desc: 'Each skill comes with realistic hours and weeks — calibrated to your current level, not a beginner.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer style={{ padding: '24px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
        Built with FastAPI · Next.js · OpenAI · Smart Prompting. No fine-tuning. Just solid engineering.
      </footer>
    </div>
  );
}
