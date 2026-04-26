'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/app/store/assessmentStore';
import * as api from '@/app/services/api';

/* ── Sample demo texts ────────────────────────────── */
const DEMO_RESUME = `Jane Developer — Senior Software Engineer
Python (4 yrs) · PostgreSQL (3 yrs) · React · Docker (1 yr) · Flask · FastAPI
Built REST APIs serving 50 K+ daily users. Optimized PostgreSQL p95 latency 800 ms → 120 ms.`;

const DEMO_JD = `Senior Backend Engineer — FinTech Innovators
CRITICAL: Python 5+ yrs · PostgreSQL optimization · Testing/TDD · REST API design
HIGH: Docker · CI/CD pipelines
MEDIUM: Redis · AWS`;

export default function Home() {
  const router = useRouter();
  const { startAssessment, setError, isLoading, errorMessage } = useAssessmentStore();

  const [resumeText, setResumeText]     = useState('');
  const [jdText, setJdText]             = useState('');
  const [resumeFile, setResumeFile]     = useState('');
  const [isDragging, setIsDragging]     = useState(false);
  const [isDemo, setIsDemo]             = useState(false);
  const [starting, setStarting]         = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── file handling ──────────────────────────────── */
  const handleFile = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'txt', 'md'].includes(ext || '')) {
      setError('Supported formats: PDF, DOCX, TXT'); return;
    }
    if (file.size > 10_000_000) { setError('Max file size: 10 MB'); return; }

    try {
      const { text } = await api.uploadResume(file);
      setResumeText(text);
      setResumeFile(file.name);
    } catch (e) { setError((e as Error).message); }
  }, [setError]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0]; if (f) handleFile(f);
  }, [handleFile]);

  /* ── demo ───────────────────────────────────────── */
  const loadDemo = () => {
    setIsDemo(true);
    setResumeText(DEMO_RESUME);
    setJdText(DEMO_JD);
    setResumeFile('Jane_Developer_Resume.pdf (demo)');
  };

  /* ── start ──────────────────────────────────────── */
  const handleStart = async () => {
    if (!resumeText.trim() || !jdText.trim()) {
      setError('Please provide both a resume and job description.'); return;
    }
    setStarting(true);
    try {
      await startAssessment(resumeText, jdText, isDemo);
      router.push('/assess');
    } catch { /* error set in store */ }
    finally { setStarting(false); }
  };

  const canStart = resumeText.trim().length > 20 && jdText.trim().length > 20;

  /* ── render ─────────────────────────────────────── */
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── NAVBAR ─────────────────────────────────── */}
      <nav className="navbar px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center text-white font-black text-sm shadow-sm">S</div>
            <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--txt-primary)' }}>SkillAssess</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: 'var(--txt-secondary)' }}>
            <span>How it works</span>
            <span>About</span>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--txt-muted)' }}>
            <span className="dot-live" />
            <span>AI Ready</span>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────── */}
      <section className="grid-bg relative overflow-hidden">
        {/* Gradient blob */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
             style={{ background: 'radial-gradient(circle, #BFDBFE 0%, #EDE9FE 100%)' }} />

        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Left — text */}
            <div className="anim-fade-up">
              {/* Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 badge-blue">
                🎯 AI Skill Assessment Agent
              </div>

              <h1 className="text-5xl md:text-6xl font-black mb-4 leading-[1.1]" style={{ color: 'var(--txt-primary)' }}>
                Know your <span className="gradient-text">real</span>{' '}
                skills.<br />Build your path.
              </h1>

              <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--txt-secondary)' }}>
                Upload your resume + job description. Our AI runs a brief conversational
                assessment, identifies your real skill gaps, then builds a{' '}
                <strong style={{ color: 'var(--txt-primary)' }}>personalised learning roadmap</strong>{' '}
                with curated resources and time estimates.
              </p>

              {/* CTA row */}
              <div className="flex flex-wrap gap-3 mb-8">
                <button onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="btn btn-primary text-base px-6 py-3">
                  Get Started Free
                </button>
                <button onClick={loadDemo} className="btn btn-secondary text-base px-6 py-3">
                  ⚡ Try Demo
                </button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--txt-muted)' }}>
                <div className="flex -space-x-2">
                  {['👩‍💻','👨‍💻','👩‍🔬'].map((e,i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-base"
                         style={{ background: ['#EFF6FF','#F5F3FF','#ECFDF5'][i] }}>{e}</div>
                  ))}
                </div>
                <span>500+ engineers assessed this month</span>
              </div>
            </div>

            {/* Right — floating UI cards */}
            <div className="hidden md:block relative h-80 anim-fade-in stagger-2">
              {/* Main card */}
              <div className="float-card absolute top-0 right-0 w-72">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl gradient-blue flex items-center justify-center text-white text-lg">🗺️</div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: 'var(--txt-primary)' }}>Learning Roadmap</div>
                    <div className="text-xs" style={{ color: 'var(--txt-muted)' }}>Personalised for you</div>
                  </div>
                </div>
                {[
                  { skill: 'Testing/TDD', hours: '30h', pct: 0, color: '#EF4444' },
                  { skill: 'Docker', hours: '25h', pct: 40, color: '#F59E0B' },
                  { skill: 'CI/CD', hours: '20h', pct: 60, color: '#3B82F6' },
                ].map(s => (
                  <div key={s.skill} className="mb-2">
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--txt-secondary)' }}>
                      <span>{s.skill}</span><span className="font-semibold">{s.hours}</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill-blue h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Score card */}
              <div className="float-card float-card-2 absolute bottom-4 left-0 w-52">
                <div className="text-xs font-semibold mb-2" style={{ color: 'var(--txt-muted)' }}>ASSESSMENT SCORE</div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black gradient-text">5.5</span>
                  <span className="text-sm pb-1" style={{ color: 'var(--txt-muted)' }}>/8</span>
                </div>
                <div className="mt-2 text-xs" style={{ color: '#059669' }}>↑ 2 hidden strengths found</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────── */}
      <section className="py-16 px-6" style={{ background: 'white', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 anim-fade-up">
            <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--txt-primary)' }}>
              How it works
            </h2>
            <p style={{ color: 'var(--txt-secondary)' }}>Four steps from resume to roadmap</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { n:'1', icon:'📄', title:'Upload',        desc:'Resume + Job Description' },
              { n:'2', icon:'🤖', title:'AI Assessment', desc:'6 targeted questions' },
              { n:'3', icon:'📊', title:'Gap Analysis',  desc:'Claimed vs. actual skills' },
              { n:'4', icon:'🗺️', title:'Learning Path', desc:'Your personalised roadmap' },
            ].map((s, i) => (
              <div key={s.n} className={`card card-hover text-center anim-fade-up stagger-${i+1}`}>
                <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center text-white font-black text-sm mx-auto mb-3">
                  {s.n}
                </div>
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="font-bold mb-1" style={{ color: 'var(--txt-primary)' }}>{s.title}</div>
                <div className="text-sm" style={{ color: 'var(--txt-muted)' }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPLOAD SECTION ─────────────────────────── */}
      <section id="upload-section" className="py-16 px-6" style={{ background: 'var(--bg)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 anim-fade-up">
            <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--txt-primary)' }}>
              Start your assessment
            </h2>
            <p style={{ color: 'var(--txt-secondary)' }}>Takes under 10 minutes</p>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="mb-4 p-4 rounded-xl text-sm flex items-center justify-between"
                 style={{ background: 'var(--red-100)', color: '#B91C1C', border: '1px solid #FECACA' }}>
              <span>❌ {errorMessage}</span>
              <button onClick={() => setError(null)} className="ml-4 opacity-60 hover:opacity-100">✕</button>
            </div>
          )}

          <div className="card" style={{ padding: 32 }}>
            {/* Demo banner */}
            {isDemo && (
              <div className="mb-6 p-3 rounded-xl text-sm flex items-center gap-2"
                   style={{ background: 'var(--amber-100)', color: '#92400E', border: '1px solid #FDE68A' }}>
                ✨ <strong>Demo mode:</strong> Using Jane Developer's resume vs. FinTech Senior Backend JD — a realistic gap scenario
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* ── Resume ── */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3"
                       style={{ color: 'var(--txt-muted)' }}>Your Resume</label>

                {/* Drop zone */}
                <div
                  onClick={() => fileRef.current?.click()}
                  onDrop={onDrop}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  className="relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
                  style={{
                    borderColor: isDragging ? 'var(--blue-500)' : resumeText ? '#6EE7B7' : 'var(--border-med)',
                    background: isDragging ? 'var(--blue-50)' : resumeText ? '#F0FDF4' : 'var(--bg-subtle)',
                  }}
                >
                  {resumeText ? (
                    <div>
                      <div className="text-3xl mb-1">✅</div>
                      <div className="font-semibold text-sm" style={{ color: '#059669' }}>{resumeFile}</div>
                      <button onClick={e => { e.stopPropagation(); setResumeText(''); setResumeFile(''); setIsDemo(false); }}
                              className="mt-2 text-xs underline" style={{ color: 'var(--txt-muted)' }}>Remove</button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">📎</div>
                      <div className="font-semibold text-sm mb-1" style={{ color: 'var(--txt-primary)' }}>
                        {isDragging ? 'Drop it!' : 'Drop file or click to upload'}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--txt-muted)' }}>PDF, DOCX, TXT — max 10 MB</div>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md" className="hidden"
                       onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

                {/* Paste fallback */}
                {!resumeText && (
                  <div className="mt-3">
                    <p className="text-xs text-center mb-2" style={{ color: 'var(--txt-muted)' }}>— or paste text —</p>
                    <textarea
                      placeholder="Paste your resume text here…"
                      className="input-field" style={{ height: 120, fontSize: 13 }}
                      onChange={e => { setResumeText(e.target.value); setResumeFile('Pasted Resume'); }}
                    />
                  </div>
                )}
              </div>

              {/* ── JD ── */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3"
                       style={{ color: 'var(--txt-muted)' }}>Job Description</label>
                <textarea
                  value={jdText}
                  onChange={e => setJdText(e.target.value)}
                  placeholder="Paste the job description here…&#10;&#10;Include required skills, responsibilities and nice-to-haves for the best learning plan."
                  className="input-field"
                  style={{ height: 240 }}
                />
                <div className="text-xs mt-1.5 text-right" style={{ color: 'var(--txt-muted)' }}>
                  {jdText.length} chars
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button onClick={loadDemo} className="btn btn-secondary flex-1">
                ⚡ Use Sample Data (Demo)
              </button>
              <button onClick={handleStart} disabled={!canStart || isLoading || starting}
                      className="btn btn-primary flex-1" style={{ fontSize: 15, padding: '13px 24px' }}>
                {starting || isLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full anim-spin" />
                  Analysing…</>
                ) : (
                  <>🚀 Start Assessment →</>
                )}
              </button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { icon:'⚡', label:'~10 minutes', sub:'Quick assessment' },
              { icon:'🔒', label:'No sign-up', sub:'No data stored' },
              { icon:'🎯', label:'ZPD-based', sub:'Realistic skill gaps' },
            ].map(b => (
              <div key={b.label} className="card text-center py-4" style={{ padding: '16px' }}>
                <div className="text-xl mb-1">{b.icon}</div>
                <div className="font-bold text-sm" style={{ color: 'var(--txt-primary)' }}>{b.label}</div>
                <div className="text-xs" style={{ color: 'var(--txt-muted)' }}>{b.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer className="py-8 px-6 text-center text-sm" style={{ color: 'var(--txt-muted)', borderTop: '1px solid var(--border)' }}>
        <span className="font-bold" style={{ color: 'var(--txt-primary)' }}>SkillAssess</span> ·{' '}
        AI-powered skill gap analysis &amp; personalised learning paths
      </footer>
    </div>
  );
}
