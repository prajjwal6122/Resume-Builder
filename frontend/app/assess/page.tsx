'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/app/store/assessmentStore';
import type { EvaluationResult } from '@/app/types';

const DIFF_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  beginner:     { bg: '#DCFCE7', color: '#16A34A', label: 'Beginner' },
  intermediate: { bg: '#FEF3C7', color: '#D97706', label: 'Intermediate' },
  advanced:     { bg: '#FEE2E2', color: '#DC2626', label: 'Advanced' },
};

function ScoreMeter({ score, max, label }: { score: number; max: number; label: string }) {
  const pct = Math.round((score / max) * 100);
  const fillClass = pct >= 80 ? 'score-fill-great' : pct >= 55 ? 'score-fill-good' : pct >= 35 ? 'score-fill-avg' : 'score-fill-poor';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 12, color: 'var(--text-sub)', minWidth: 160, flexShrink: 0 }}>{label}</span>
      <div className="score-track" style={{ flex: 1 }}>
        <div className={`score-fill ${fillClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, minWidth: 36, textAlign: 'right', color: 'var(--text)' }}>
        {score}/{max}
      </span>
    </div>
  );
}

function EvalPanel({ evaluation }: { evaluation: EvaluationResult }) {
  const total = evaluation.total_score;
  const pct = Math.round((total / 8) * 100);
  const scoreColor = pct >= 75 ? '#16A34A' : pct >= 50 ? '#2563EB' : pct >= 30 ? '#D97706' : '#DC2626';

  return (
    <div className="anim-fade-up" style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-lg)',
      marginTop: 16,
    }}>
      {/* Top bar */}
      <div style={{
        background: 'linear-gradient(135deg, #EFF6FF, #EDE9FE)',
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: 'var(--shadow-sm)' }}>🤖</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>AI Evaluation</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>5-dimension assessment</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: scoreColor, lineHeight: 1, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            {total.toFixed(1)}<span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>/8</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {pct >= 75 ? 'Strong' : pct >= 50 ? 'Good' : pct >= 30 ? 'Developing' : 'Needs Work'}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Reasoning */}
        <div style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.7, padding: '14px 16px', background: 'var(--gray-50)', borderRadius: 12 }}>
          {evaluation.reasoning}
        </div>

        {/* Score breakdown */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12 }}>Score Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ScoreMeter label="✓ Correctness" score={evaluation.score_breakdown.correctness} max={2} />
            <ScoreMeter label="⬇ Depth of Understanding" score={evaluation.score_breakdown.depth} max={2} />
            <ScoreMeter label="💡 Practical Examples" score={evaluation.score_breakdown.examples} max={2} />
            <ScoreMeter label="📝 Clarity" score={evaluation.score_breakdown.clarity} max={1} />
            <ScoreMeter label="🎯 Confidence Calibration" score={evaluation.score_breakdown.confidence} max={1} />
          </div>
        </div>

        {/* Strengths + Flags row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {evaluation.strengths.length > 0 && (
            <div style={{ background: '#ECFDF5', border: '1px solid #BBF7D0', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#16A34A', marginBottom: 8 }}>✅ Strengths</div>
              {evaluation.strengths.slice(0, 3).map((s, i) => (
                <div key={i} style={{ fontSize: 12, color: '#15803D', marginBottom: 4, paddingLeft: 12, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>•</span> {s}
                </div>
              ))}
            </div>
          )}
          {evaluation.red_flags.length > 0 && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#DC2626', marginBottom: 8 }}>⚠️ Red Flags</div>
              {evaluation.red_flags.slice(0, 3).map((f, i) => (
                <div key={i} style={{ fontSize: 12, color: '#B91C1C', marginBottom: 4, paddingLeft: 12, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0 }}>•</span> {f}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Follow-up */}
        {evaluation.follow_up_needed && evaluation.follow_up_question && (
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563EB', marginBottom: 6 }}>💬 Follow-up</div>
            <div style={{ fontSize: 13, color: '#1D4ED8' }}>{evaluation.follow_up_question}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AssessPage() {
  const router = useRouter();
  const {
    questions, answers, currentQuestionIndex, sessionId, isLoading, errorMessage,
    getCurrentQuestion, submitAnswer, nextQuestion, completeAssessment, setError,
  } = useAssessmentStore();

  const [answerText, setAnswerText] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentQ = getCurrentQuestion();

  useEffect(() => { if (!sessionId) router.push('/'); }, [sessionId, router]);
  useEffect(() => { if (!submitted) setTimeout(() => textareaRef.current?.focus(), 100); }, [currentQuestionIndex, submitted]);

  const handleSubmit = async () => {
    if (!answerText.trim() || isLoading || submitted) return;
    setSubmitted(true);
    try {
      const ev = await submitAnswer(answerText);
      if (ev) setEvaluation(ev);
    } catch (e) {
      setSubmitted(false);
      setError((e as Error).message);
    }
  };

  const handleNext = () => {
    setAnswerText(''); setEvaluation(null); setSubmitted(false);
    nextQuestion();
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await completeAssessment();
      router.push('/dashboard');
    } catch (e) {
      setError((e as Error).message);
      setCompleting(false);
    }
  };

  const isLastQ = currentQuestionIndex >= questions.length - 1;
  const progress = questions.length > 0 ? ((answers.length) / questions.length) * 100 : 0;
  const diffCfg = currentQ ? DIFF_STYLE[currentQ.difficulty] || DIFF_STYLE.intermediate : null;

  if (!currentQ) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner spinner-blue" style={{ margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--text-sub)' }}>Loading assessment...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>

      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/')} className="btn btn-ghost btn-sm">← Back</button>
          <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 16 }}>SkillAssess</span>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, maxWidth: 400, margin: '0 24px' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            Q{Math.min(currentQuestionIndex + 1, questions.length)} / {questions.length}
          </span>
          <div className="progress-track" style={{ flex: 1 }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue-600)' }}>{Math.round(progress)}%</span>
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          ~{Math.max(0, questions.length - answers.length) * 2} min remaining
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

        {/* Error */}
        {errorMessage && (
          <div style={{ marginBottom: 16, padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, fontSize: 13, color: '#DC2626', display: 'flex', justifyContent: 'space-between' }}>
            {errorMessage}
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontWeight: 700 }}>✕</button>
          </div>
        )}

        {/* Question card */}
        <div className="question-card anim-fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
            {diffCfg && (
              <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: diffCfg.bg, color: diffCfg.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {diffCfg.label}
              </span>
            )}
            <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
              🔧 {currentQ.skill}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
              Question {currentQ.order || currentQuestionIndex + 1}
            </span>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, color: 'var(--text)', marginBottom: 16 }}>
            {currentQ.text}
          </h2>

          {!submitted && currentQ.expected_depth && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                💡 What makes a strong answer?
              </summary>
              <p style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 8, paddingLeft: 16, borderLeft: '2px solid var(--border)', lineHeight: 1.6 }}>
                {currentQ.expected_depth}
              </p>
            </details>
          )}
        </div>

        {/* Answer input */}
        {!submitted && (
          <div className="card anim-fade-up anim-delay-100" style={{ marginTop: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-sub)', display: 'block', marginBottom: 10 }}>
              Your Answer
            </label>
            <textarea
              ref={textareaRef}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
              }}
              disabled={isLoading}
              className="input"
              placeholder={`Write your answer here — be specific and include real examples from your experience.\n\nAim for 100+ words. Ctrl+Enter to submit.`}
              style={{ height: 180, fontSize: 14, lineHeight: 1.65 }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {answerText.length} chars
                {answerText.length > 0 && answerText.length < 60 && (
                  <span style={{ color: '#D97706', marginLeft: 8 }}>• Add more detail for a better score</span>
                )}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ctrl+Enter</span>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={answerText.trim().length < 15 || isLoading}
                >
                  {isLoading
                    ? <><div className="spinner" /> Evaluating...</>
                    : 'Submit Answer →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submitted answer display */}
        {submitted && (
          <div style={{ marginTop: 16, padding: '14px 18px', background: 'var(--gray-50)', border: '1px solid var(--border)', borderRadius: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>Your Answer</div>
            <div style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{answerText}</div>
          </div>
        )}

        {/* Loading evaluation */}
        {submitted && !evaluation && isLoading && (
          <div className="card anim-fade-in" style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div className="spinner spinner-blue" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>AI is evaluating your answer...</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Scoring 5 dimensions</div>
              </div>
            </div>
            {['Correctness', 'Depth of Understanding', 'Practical Examples', 'Clarity', 'Confidence'].map(d => (
              <div key={d} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 160 }}>{d}</span>
                <div className="skeleton" style={{ height: 8, flex: 1, borderRadius: 99 }} />
              </div>
            ))}
          </div>
        )}

        {/* Evaluation result */}
        {evaluation && <EvalPanel evaluation={evaluation} />}

        {/* Navigation */}
        {submitted && evaluation && (
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }} className="anim-fade-up">
            {!isLastQ ? (
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleNext}>
                Next Question →
              </button>
            ) : (
              <button
                className="btn btn-gradient btn-lg"
                style={{ flex: 1, fontSize: 15 }}
                onClick={handleComplete}
                disabled={completing}
              >
                {completing
                  ? <><div className="spinner" /> Generating your learning path...</>
                  : '🗺️ Complete & Get My Learning Path →'}
              </button>
            )}
          </div>
        )}

        {/* Previous answers */}
        {answers.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12 }}>
              Completed ({answers.length} / {questions.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...answers].reverse().map((ans, i) => {
                const q = questions.find(q => q.id === ans.question_id);
                const pct = (ans.total_score / 8) * 100;
                const color = pct >= 75 ? '#16A34A' : pct >= 50 ? '#2563EB' : pct >= 30 ? '#D97706' : '#DC2626';
                return (
                  <details key={i}>
                    <summary style={{
                      padding: '12px 16px', background: 'white', border: '1px solid var(--border)',
                      borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      fontSize: 13, fontWeight: 500, listStyle: 'none'
                    }}>
                      <span style={{ color: 'var(--text-sub)' }}>{q?.skill} — Q{questions.indexOf(q!) + 1}</span>
                      <span style={{ fontWeight: 700, color }}>{ans.total_score.toFixed(1)}/8</span>
                    </summary>
                    <div style={{ padding: '10px 16px 10px', background: 'var(--gray-50)', borderRadius: '0 0 12px 12px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {ans.reasoning}
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
