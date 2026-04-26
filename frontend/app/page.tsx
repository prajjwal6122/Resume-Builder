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
      <nav className="navbar px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center text-white font-black text-lg shadow-md">S</div>
            <span className="font-bold text-xl tracking-tight hidden sm:block" style={{ color: 'var(--txt-primary)' }}>SkillAssess</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold" style={{ color: 'var(--txt-secondary)' }}>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it works</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#" className="hover:text-blue-600 transition-colors">About</a>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm" style={{ color: 'var(--txt-muted)' }}>
              <span className="dot-live" />
              <span>AI Ready</span>
            </div>
            <button className="btn btn-secondary !py-2 !px-4 text-sm">Sign In</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────── */}
      <section className="grid-bg relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — text */}
            <div className="anim-fade-up text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold mb-6 badge-blue shadow-sm">
                ✨ AI-Powered Career Intelligence
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tight" style={{ color: 'var(--txt-primary)' }}>
                Stop guessing. <br />
                <span className="gradient-text">Know</span> your real skills.
              </h1>

              <p className="text-lg sm:text-xl mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0" style={{ color: 'var(--txt-secondary)' }}>
                Upload your resume and job description. Our AI agent assesses your real proficiency through targeted conversation, identifying gaps you didn't know you had.
              </p>

              {/* CTA row */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                <button onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="btn btn-primary text-lg !px-10 !py-4 shadow-xl">
                  Get Started Free
                </button>
                <button onClick={loadDemo} className="btn btn-secondary text-lg !px-10 !py-4 shadow-md">
                  ⚡ See Live Demo
                </button>
              </div>

              {/* Social proof */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-sm" style={{ color: 'var(--txt-muted)' }}>
                <div className="flex -space-x-3">
                  {['👩‍💻','👨‍💻','👩‍🔬','🧑‍🎨'].map((e,i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-white flex items-center justify-center text-lg shadow-sm"
                         style={{ background: ['#EFF6FF','#F5F3FF','#ECFDF5','#FFFBEB'][i], zIndex: 10-i }}>{e}</div>
                  ))}
                </div>
                <div className="text-center sm:text-left">
                  <span className="font-bold text-slate-800">500+ developers</span> assessed this week
                </div>
              </div>
            </div>

            {/* Right — dynamic preview */}
            <div className="hidden lg:block relative h-[500px]">
              {/* Main roadmap card */}
              <div className="float-card absolute top-0 right-0 w-[400px] z-20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl gradient-blue flex items-center justify-center text-white text-2xl shadow-lg">🗺️</div>
                  <div>
                    <div className="font-bold text-lg" style={{ color: 'var(--txt-primary)' }}>Personalized Roadmap</div>
                    <div className="text-sm" style={{ color: 'var(--txt-muted)' }}>Senior Backend Engineer Path</div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { skill: 'Testing & TDD', hours: '12h', pct: 20, color: '#f87171' },
                    { skill: 'Docker Optimization', hours: '8h', pct: 45, color: '#fbbf24' },
                    { skill: 'Distributed Systems', hours: '24h', pct: 65, color: '#60a5fa' },
                  ].map(s => (
                    <div key={s.skill}>
                      <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'var(--txt-secondary)' }}>
                        <span>{s.skill}</span><span style={{ color: s.color }}>{s.hours} left</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${s.pct}%`, background: s.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skill gap pill */}
              <div className="float-card float-card-2 absolute bottom-20 left-0 w-64 z-30">
                <div className="text-xs font-bold uppercase tracking-widest mb-3 text-slate-400">Hidden Strength Found</div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-xl">✨</div>
                  <div>
                    <div className="font-bold text-emerald-700">System Design</div>
                    <div className="text-xs text-emerald-600">+2.5 levels above resume</div>
                  </div>
                </div>
              </div>

              {/* Decorative blobs */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6" style={{ background: 'white', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 anim-fade-up">
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: 'var(--txt-primary)' }}>
              How SkillAssess works
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--txt-secondary)' }}>
              We don't just scan keywords. Our AI agent acts as a technical interviewer to find your true boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { n:'01', icon:'📄', title:'Upload Data',     desc:'Submit your resume and the target Job Description.' },
              { n:'02', icon:'🤖', title:'AI Interview',    desc:'Answer 6-8 targeted technical questions generated by AI.' },
              { n:'03', icon:'📊', title:'Gap Analysis',   desc:'Get a reality check on your claimed vs. actual proficiency.' },
              { n:'04', icon:'🗺️', title:'Learning Plan',  desc:'Get a dependency-aware roadmap with curated resources.' },
            ].map((s, i) => (
              <div key={s.n} className={`card card-hover flex flex-col items-center text-center anim-fade-up`} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 rounded-2xl gradient-blue flex items-center justify-center text-white font-black text-sm shadow-lg mb-6">
                  {s.n}
                </div>
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="font-bold text-xl mb-3" style={{ color: 'var(--txt-primary)' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--txt-secondary)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UPLOAD SECTION ─────────────────────────── */}
      <section id="upload-section" className="py-24 px-4 sm:px-6" style={{ background: 'var(--bg)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 anim-fade-up">
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: 'var(--txt-primary)' }}>
              Ready for your assessment?
            </h2>
            <p className="text-lg" style={{ color: 'var(--txt-secondary)' }}>
              No sign-up required. Start your diagnostic now.
            </p>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="mb-8 p-4 rounded-2xl text-sm flex items-center justify-between shadow-sm animate-shake"
                 style={{ background: 'var(--red-100)', color: '#b91c1c', border: '1px solid rgba(185, 28, 28, 0.1)' }}>
              <div className="flex items-center gap-3">
                <span>⚠️</span>
                <span className="font-semibold">{errorMessage}</span>
              </div>
              <button onClick={() => setError(null)} className="ml-4 hover:bg-red-200 p-1 rounded-full transition-colors">✕</button>
            </div>
          )}

          <div className="card shadow-2xl !p-6 sm:!p-10 border-blue-100 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full opacity-50" />

            {/* Demo banner */}
            {isDemo && (
              <div className="mb-8 p-4 rounded-xl text-sm flex items-center gap-3 shadow-inner"
                   style={{ background: 'var(--amber-100)', color: '#92400e', border: '1px solid rgba(146, 64, 14, 0.1)' }}>
                <span className="text-xl">✨</span>
                <p><strong>Demo Mode Active:</strong> Using pre-loaded Senior Backend Engineer data for a quick walkthrough.</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* ── Resume ── */}
              <div className="flex flex-col">
                <label className="block text-xs font-black uppercase tracking-widest mb-4 text-slate-400">
                  Step 1: Your Profile
                </label>

                {/* Drop zone */}
                <div
                  onClick={() => fileRef.current?.click()}
                  onDrop={onDrop}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  className="relative flex-1 border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
                  style={{
                    borderColor: isDragging ? 'var(--blue-500)' : resumeText ? 'var(--emerald-500)' : 'var(--border-med)',
                    background: isDragging ? 'var(--blue-50)' : resumeText ? 'var(--emerald-100)' : 'white',
                  }}
                >
                  {resumeText ? (
                    <div className="animate-bounce-in">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm text-emerald-600">✓</div>
                      <div className="font-bold text-emerald-800 mb-1">{resumeFile}</div>
                      <div className="text-xs text-emerald-600 uppercase font-bold tracking-widest mb-4">File Analyzed</div>
                      <button onClick={e => { e.stopPropagation(); setResumeText(''); setResumeFile(''); setIsDemo(false); }}
                              className="text-xs font-bold text-red-500 hover:underline">Remove file</button>
                    </div>
                  ) : (
                    <div className="group-hover:scale-105 transition-transform">
                      <div className="text-5xl mb-4 group-hover:animate-pulse">📎</div>
                      <div className="font-bold text-lg mb-2" style={{ color: 'var(--txt-primary)' }}>
                        {isDragging ? 'Drop it here!' : 'Drop resume or click'}
                      </div>
                      <div className="text-xs font-medium" style={{ color: 'var(--txt-muted)' }}>PDF, DOCX, TXT · Up to 10MB</div>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md" className="hidden"
                       onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

                {/* Paste fallback */}
                {!resumeText && (
                  <div className="mt-6">
                    <p className="text-xs text-center font-bold text-slate-400 uppercase tracking-widest mb-4">— or paste text —</p>
                    <textarea
                      placeholder="Paste your resume content here..."
                      className="input-field shadow-inner" style={{ height: 140, fontSize: 14 }}
                      onChange={e => { setResumeText(e.target.value); setResumeFile('Pasted Resume'); }}
                    />
                  </div>
                )}
              </div>

              {/* ── JD ── */}
              <div className="flex flex-col">
                <label className="block text-xs font-black uppercase tracking-widest mb-4 text-slate-400">
                  Step 2: Target Role
                </label>
                <div className="flex-1 flex flex-col">
                  <textarea
                    value={jdText}
                    onChange={e => setJdText(e.target.value)}
                    placeholder="Paste the Job Description here...&#10;&#10;The more detailed, the better the assessment. Include requirements, stack, and responsibilities."
                    className="input-field flex-1 min-h-[300px] shadow-inner"
                    style={{ fontSize: 14 }}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Minimum 100 characters recommended
                    </div>
                    <div className="text-xs font-bold" style={{ color: jdText.length > 100 ? 'var(--emerald-600)' : 'var(--txt-muted)' }}>
                      {jdText.length} characters
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-10 border-t border-slate-100">
              <button onClick={loadDemo} className="btn btn-secondary flex-1 !py-4 shadow-md">
                ⚡ Use Sample Data (Demo)
              </button>
              <button onClick={handleStart} disabled={!canStart || isLoading || starting}
                      className="btn btn-primary flex-1 !py-4 shadow-xl text-lg">
                {starting || isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing your profile...</span>
                  </div>
                ) : (
                  <>🚀 Start Assessment</>
                )}
              </button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            {[
              { icon:'⚡', label:'~10 Minutes', sub:'Fast & efficient' },
              { icon:'🔒', label:'Privacy First', sub:'No data stored' },
              { icon:'🎯', label:'ZPD Model', sub:'Science-backed learning' },
            ].map(b => (
              <div key={b.label} className="card !py-4 !px-6 flex items-center gap-4 bg-white/50 border-transparent hover:border-blue-100">
                <div className="text-2xl">{b.icon}</div>
                <div>
                  <div className="font-bold text-sm" style={{ color: 'var(--txt-primary)' }}>{b.label}</div>
                  <div className="text-[10px] uppercase font-black tracking-widest" style={{ color: 'var(--txt-muted)' }}>{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────── */}
      <footer className="py-12 px-6 text-center" style={{ background: 'white', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-6 h-6 rounded-lg gradient-blue flex items-center justify-center text-white font-black text-[10px]">S</div>
            <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--txt-primary)' }}>SkillAssess</span>
          </div>
          <p className="text-sm mb-6" style={{ color: 'var(--txt-muted)' }}>
            Empowering developers with AI-driven career diagnostic and planning.
          </p>
          <div className="flex justify-center gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
            <a href="#" className="hover:text-blue-600">Privacy</a>
            <a href="#" className="hover:text-blue-600">Terms</a>
            <a href="#" className="hover:text-blue-600">Contact</a>
          </div>
          <div className="text-xs" style={{ color: 'var(--txt-muted)' }}>
            © 2026 SkillAssess. All rights reserved. Built with Next.js 16 and Tailwind 4.
          </div>
        </div>
      </footer>
    </div>
  );
}

