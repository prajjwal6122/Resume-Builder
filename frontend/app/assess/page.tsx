'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/app/store/assessmentStore';
import type { EvaluationResult } from '@/app/types';

/* ── Score ring helper ─────────────────────────── */
function ScoreRing({ score, max = 8 }: { score: number; max?: number }) {
  const pct = score / max;
  const r = 22; const circ = 2 * Math.PI * r;
  const color = pct >= 0.75 ? '#10B981' : pct >= 0.5 ? '#3B82F6' : pct >= 0.3 ? '#F59E0B' : '#EF4444';
  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="none" stroke="var(--bg-subtle)" strokeWidth="4" />
      <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
              strokeLinecap="round" strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct)}
              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.8s ease' }} />
      <text x="28" y="28" textAnchor="middle" dominantBaseline="central"
            fontSize="13" fontWeight="700" fill={color}>{score.toFixed(1)}</text>
    </svg>
  );
}

/* ── Dimension bar ─────────────────────────────── */
function DimBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = (score / max) * 100;
  const color = pct === 100 ? 'var(--emerald-500)' : pct >= 50 ? 'var(--blue-500)' : 'var(--amber-500)';
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-44 shrink-0" style={{ color: 'var(--txt-secondary)' }}>{label}</span>
      <div className="flex-1 progress-track">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color: 'var(--txt-primary)' }}>
        {score}/{max}
      </span>
    </div>
  );
}

/* ── Evaluation panel ──────────────────────────── */
function EvalPanel({ ev }: { ev: EvaluationResult }) {
  const scoreColor =
    ev.total_score >= 6 ? '#10B981' :
    ev.total_score >= 4 ? '#3B82F6' :
    ev.total_score >= 2 ? '#F59E0B' : '#EF4444';

  const label =
    ev.total_score >= 6.5 ? 'Excellent' :
    ev.total_score >= 4.5 ? 'Good' :
    ev.total_score >= 3   ? 'Developing' : 'Needs Work';

  return (
    <div className="card anim-scale-in mt-4" style={{ borderColor: 'var(--blue-200)' }}>
      <div className="flex items-start gap-4 mb-4">
        <ScoreRing score={ev.total_score} />
        <div>
          <div className="font-bold text-sm" style={{ color: 'var(--txt-primary)' }}>AI Evaluation</div>
          <div className="font-black text-lg" style={{ color: scoreColor }}>{label}</div>
        </div>
        <div className="ml-auto text-right text-sm" style={{ color: 'var(--txt-muted)' }}>
          {ev.total_score.toFixed(1)} / 8.0
        </div>
      </div>

      {/* Reasoning */}
      <div className="rounded-xl p-4 mb-4 text-sm leading-relaxed" style={{ background: 'var(--bg-subtle)', color: 'var(--txt-secondary)' }}>
        {ev.reasoning}
      </div>

      {/* Score dimensions */}
      <div className="space-y-2.5 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--txt-muted)' }}>Breakdown</p>
        <DimBar label="Correctness"            score={ev.score_breakdown.correctness} max={2} />
        <DimBar label="Depth of Understanding" score={ev.score_breakdown.depth}       max={2} />
        <DimBar label="Practical Examples"     score={ev.score_breakdown.examples}    max={2} />
        <DimBar label="Clarity"                score={ev.score_breakdown.clarity}     max={1} />
        <DimBar label="Confidence Calibration" score={ev.score_breakdown.confidence}  max={1} />
      </div>

      {/* Strengths / flags in a 2-col grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {ev.strengths.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#059669' }}>✅ Strengths</p>
            <ul className="space-y-1">
              {ev.strengths.map((s,i) => (
                <li key={i} className="text-xs flex gap-2" style={{ color: 'var(--txt-secondary)' }}>
                  <span style={{ color: '#059669' }}>•</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {ev.red_flags.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#DC2626' }}>⚠️ Red flags</p>
            <ul className="space-y-1">
              {ev.red_flags.map((f,i) => (
                <li key={i} className="text-xs flex gap-2" style={{ color: 'var(--txt-secondary)' }}>
                  <span style={{ color: '#DC2626' }}>•</span>{f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Follow-up */}
      {ev.follow_up_needed && ev.follow_up_question && (
        <div className="mt-4 rounded-xl p-3 text-sm"
             style={{ background: 'var(--blue-50)', border: '1px solid var(--blue-200)' }}>
          <span className="font-semibold" style={{ color: 'var(--blue-600)' }}>💬 Follow-up: </span>
          <span style={{ color: 'var(--txt-secondary)' }}>{ev.follow_up_question}</span>
        </div>
      )}
    </div>
  );
}

export default function AssessPage() {
  const router = useRouter();
  const {
    questions, answers, currentQuestionIndex, status,
    isLoading, sessionId, errorMessage, isDemo,
    getCurrentQuestion, submitAnswer, nextQuestion,
    completeAssessment, setError,
  } = useAssessmentStore();

  const [text, setText]               = useState('');
  const [evalResult, setEvalResult]   = useState<EvaluationResult | null>(null);
  const [submitted, setSubmitted]     = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentQ = getCurrentQuestion();

  useEffect(() => { if (!sessionId && status === 'idle') router.push('/'); }, [sessionId, status, router]);
  useEffect(() => { if (!submitted) textareaRef.current?.focus(); }, [currentQuestionIndex, submitted]);

  const handleSubmit = async () => {
    if (!text.trim() || isLoading || submitted) return;
    setSubmitted(true);
    try {
      const ev = await submitAnswer(text);
      if (ev) setEvalResult(ev);
    } catch (e) {
      setSubmitted(false);
      setError((e as Error).message);
    }
  };

  const handleNext = () => {
    setText(''); setEvalResult(null); setSubmitted(false);
    nextQuestion();
    setTimeout(() => textareaRef.current?.focus(), 80);
  };

  const handleComplete = async () => {
    try { await completeAssessment(); router.push('/dashboard'); }
    catch (e) { setError((e as Error).message); }
  };

  const progress = questions.length ? (answers.length / questions.length) * 100 : 0;
  const isLast   = currentQuestionIndex >= questions.length - 1;
  const DIFF_COLORS: Record<string, string> = {
    beginner:'#059669', intermediate:'#D97706', advanced:'#DC2626'
  };

  if (!currentQ) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full anim-spin mx-auto mb-4" />
        <p style={{ color: 'var(--txt-secondary)' }}>Loading assessment…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ── NAVBAR ─────────────────────────────────── */}
      <nav className="navbar px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 font-bold text-lg tracking-tight"
                  style={{ color: 'var(--txt-primary)' }}>
            <div className="w-7 h-7 rounded-lg gradient-blue flex items-center justify-center text-white font-black text-xs">S</div>
            SkillAssess
          </button>

          {/* Progress bar */}
          <div className="flex items-center gap-3 flex-1 max-w-xs mx-8">
            <div className="flex-1 progress-track">
              <div className="progress-fill-blue" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--blue-600)' }}>
              {answers.length}/{questions.length}
            </span>
          </div>

          {isDemo && (
            <span className="badge badge-amber text-xs">Demo mode</span>
          )}
        </div>
      </nav>

      {/* ── MAIN ───────────────────────────────────── */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">

        {/* Error */}
        {errorMessage && (
          <div className="mb-4 p-4 rounded-xl text-sm flex justify-between"
               style={{ background: 'var(--red-100)', color: '#B91C1C', border: '1px solid #FECACA' }}>
            <span>❌ {errorMessage}</span>
            <button onClick={() => setError(null)} className="opacity-60 hover:opacity-100 ml-4">✕</button>
          </div>
        )}

        {/* Question card */}
        <div className="card anim-fade-up mb-4" style={{ borderColor: 'var(--border-med)' }}>
          {/* Meta row */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="badge badge-blue">🔧 {currentQ.skill}</span>
            <span className="badge" style={{
              background: DIFF_COLORS[currentQ.difficulty] + '18',
              color: DIFF_COLORS[currentQ.difficulty]
            }}>
              {currentQ.difficulty}
            </span>
            <span className="ml-auto text-xs" style={{ color: 'var(--txt-muted)' }}>
              Q{(currentQ.order || currentQuestionIndex + 1)} of {questions.length}
            </span>
          </div>

          <h2 className="text-xl font-bold leading-relaxed mb-4" style={{ color: 'var(--txt-primary)' }}>
            {currentQ.text}
          </h2>

          {currentQ.expected_depth && !submitted && (
            <details className="text-xs" style={{ color: 'var(--txt-muted)' }}>
              <summary className="cursor-pointer hover:text-blue-600 select-none">
                💡 What does a strong answer include?
              </summary>
              <p className="mt-2 pl-3 border-l-2 leading-relaxed"
                 style={{ borderColor: 'var(--border)', color: 'var(--txt-secondary)' }}>
                {currentQ.expected_depth}
              </p>
            </details>
          )}
        </div>

        {/* Answer input */}
        {!submitted && (
          <div className="card anim-fade-up stagger-1">
            <label className="block text-xs font-bold uppercase tracking-wider mb-3"
                   style={{ color: 'var(--txt-muted)' }}>Your Answer</label>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
              }}
              placeholder="Be specific — what tools/approach would you choose and why?&#10;Real examples from your experience carry more weight than theory.&#10;&#10;(Ctrl + Enter to submit)"
              className="input-field"
              style={{ height: 180, resize: 'none' }}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs" style={{ color: 'var(--txt-muted)' }}>
                {text.length} chars
                {text.length > 0 && text.length < 60 && (
                  <span style={{ color: 'var(--amber-500)', marginLeft: 8 }}>• Add more detail</span>
                )}
              </div>
              <button onClick={handleSubmit}
                      disabled={text.trim().length < 15 || isLoading}
                      className="btn btn-primary">
                {isLoading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full anim-spin" /> Evaluating…</>
                  : <>Submit Answer →</>}
              </button>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {submitted && !evalResult && isLoading && (
          <div className="card mt-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 border-2 border-transparent border-t-blue-500 rounded-full anim-spin" />
              <span className="text-sm" style={{ color: 'var(--txt-secondary)' }}>Analysing your answer…</span>
            </div>
            <div className="space-y-3">
              {['Correctness','Depth','Examples','Clarity','Confidence'].map(d => (
                <div key={d} className="flex gap-3 items-center">
                  <div className="skeleton w-44 h-3" />
                  <div className="flex-1 skeleton h-3" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evaluation result */}
        {evalResult && <EvalPanel ev={evalResult} />}

        {/* Navigation after eval */}
        {submitted && evalResult && (
          <div className="flex gap-3 mt-5 anim-fade-up">
            {!isLast ? (
              <button onClick={handleNext} className="btn btn-primary flex-1" style={{ padding: '14px' }}>
                Next Question →
              </button>
            ) : (
              <button onClick={handleComplete} disabled={isLoading} className="btn btn-primary flex-1"
                      style={{ padding: '14px', fontSize: 15 }}>
                {isLoading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full anim-spin" /> Generating Results…</>
                  : '🏁 Complete & See Results'}
              </button>
            )}
          </div>
        )}

        {/* Previous answers accordion */}
        {answers.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--txt-muted)' }}>
              Previous Answers ({answers.length})
            </p>
            <div className="space-y-2">
              {[...answers].reverse().map((ans, i) => {
                const q = questions.find(q => q.id === ans.question_id);
                const col = ans.total_score >= 6 ? '#059669' : ans.total_score >= 4 ? 'var(--blue-600)' : '#D97706';
                return (
                  <details key={i}>
                    <summary className="card card-hover py-3 cursor-pointer flex items-center justify-between list-none"
                             style={{ padding: '12px 20px' }}>
                      <span className="font-medium text-sm" style={{ color: 'var(--txt-primary)' }}>
                        {q?.skill || 'Question'} — Q{questions.indexOf(q!) + 1}
                      </span>
                      <span className="font-bold text-sm" style={{ color: col }}>{ans.total_score.toFixed(1)}/8</span>
                    </summary>
                    <div className="pl-4 py-2">
                      <p className="text-xs italic" style={{ color: 'var(--txt-muted)' }}>{ans.reasoning}</p>
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
