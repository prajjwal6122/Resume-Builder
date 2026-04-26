'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/app/store/assessmentStore';
import type { SkillScore, GapType } from '@/app/types';

/* ── Score ring ────────────────────────────────── */
function ScoreRing({ score, max = 8, size = 64 }: { score: number; max?: number; size?: number }) {
  const pct = Math.max(0, Math.min(score / max, 1));
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const color =
    pct >= 0.75 ? '#10B981' :
    pct >= 0.5  ? '#3B82F6' :
    pct >= 0.3  ? '#F59E0B' : '#EF4444';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-subtle)" strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
              strokeLinecap="round" strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct)}
              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1s ease' }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
            fontSize={size < 60 ? 11 : 13} fontWeight="800" fill={color}>
        {score.toFixed(1)}
      </text>
    </svg>
  );
}

/* ── Skill gap card ────────────────────────────── */
const GAP_CONFIG: Record<GapType, { label: string; color: string; bg: string; border: string; icon: string }> = {
  overestimated: { label: 'Overstated',      color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: '⚠️' },
  underestimated:{ label: 'Hidden Strength', color: '#059669', bg: '#F0FDF4', border: '#6EE7B7', icon: '✨' },
  accurate:      { label: 'Accurate',        color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', icon: '✓' },
  missing:       { label: 'Gap',             color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: '📌' },
  untested:      { label: 'Not Tested',      color: '#94A3B8', bg: 'var(--bg-subtle)', border: 'var(--border)', icon: '–' },
};

function SkillCard({ s }: { s: SkillScore }) {
  const cfg   = GAP_CONFIG[s.gap_type] || GAP_CONFIG.accurate;
  const claim = s.claimed_level  ?? 0;
  const asses = s.assessed_level ?? 0;

  return (
    <div className="card" style={{ border: `1.5px solid ${cfg.border}`, background: cfg.bg }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-bold" style={{ color: 'var(--txt-primary)' }}>{s.skill}</h3>
          <span className="badge text-xs mt-1" style={{ background: cfg.color + '18', color: cfg.color }}>
            {cfg.icon} {cfg.label}
          </span>
        </div>
        <ScoreRing score={asses} size={52} />
      </div>

      {/* Dual bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-xs w-20 shrink-0" style={{ color: 'var(--txt-muted)' }}>Resume</span>
          <div className="flex-1 progress-track">
            <div className="h-full rounded-full" style={{ width: `${(claim/8)*100}%`, background: '#CBD5E1', transition: 'width 0.8s ease' }} />
          </div>
          <span className="text-xs w-6 text-right font-medium" style={{ color: 'var(--txt-muted)' }}>{claim}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs w-20 shrink-0" style={{ color: 'var(--txt-muted)' }}>Assessed</span>
          <div className="flex-1 progress-track">
            <div className="h-full rounded-full" style={{ width: `${(asses/8)*100}%`, background: cfg.color, transition: 'width 0.8s ease' }} />
          </div>
          <span className="text-xs w-6 text-right font-bold" style={{ color: cfg.color }}>{asses.toFixed(1)}</span>
        </div>
      </div>

      {s.gap !== null && Math.abs(s.gap) > 0.2 && (
        <p className="text-xs mt-2" style={{ color: 'var(--txt-muted)' }}>
          Gap: <strong style={{ color: cfg.color }}>{s.gap > 0 ? '+' : ''}{s.gap.toFixed(1)} pts</strong>
          {' · '}{s.questions_asked} question{s.questions_asked !== 1 ? 's' : ''} assessed
          {' · '}<span style={{ color: 'var(--txt-muted)' }}>{s.confidence_interval}</span>
        </p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { results, sessionId, questions, answers } = useAssessmentStore();

  useEffect(() => { if (!sessionId) router.push('/'); }, [sessionId, router]);

  if (!results) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full anim-spin mx-auto mb-4" />
        <p style={{ color: 'var(--txt-secondary)' }}>Generating results…</p>
      </div>
    </div>
  );

  const { skill_scores, gaps_summary, narrative } = results;

  const tested  = skill_scores.filter(s => s.assessed_level !== null);
  const avgScore = tested.length
    ? tested.reduce((a, s) => a + (s.assessed_level ?? 0), 0) / tested.length
    : 0;
  const overest = skill_scores.filter(s => s.gap_type === 'overestimated');
  const strengths= skill_scores.filter(s => s.gap_type === 'underestimated');
  const missing = skill_scores.filter(s => s.gap_type === 'missing');

  const sortOrder: Record<GapType, number> = {
    missing:0, overestimated:1, accurate:2, underestimated:3, untested:4
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ── NAVBAR ─────────────────────────────────── */}
      <nav className="navbar px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 font-bold text-lg tracking-tight"
                  style={{ color: 'var(--txt-primary)' }}>
            <div className="w-7 h-7 rounded-lg gradient-blue flex items-center justify-center text-white font-black text-xs">S</div>
            SkillAssess
          </button>
          <div className="flex gap-3">
            <button onClick={() => router.push('/assess')} className="btn btn-ghost text-sm">← Retake</button>
            <button onClick={() => router.push('/plan')}   className="btn btn-primary text-sm">
              View Learning Path →
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">

        {/* ── HEADER ─────────────────────────────────── */}
        <div className="mb-8 anim-fade-up">
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--blue-600)' }}>
            {questions.length} questions · {answers.length} answered
          </p>
          <h1 className="text-4xl font-black mb-2" style={{ color: 'var(--txt-primary)' }}>
            Assessment <span className="gradient-text">Results</span>
          </h1>
        </div>

        {/* ── SUMMARY BANNER ─────────────────────────── */}
        <div className="card card-blue mb-8 anim-fade-up stagger-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { val: avgScore.toFixed(1), sub: 'Avg Score /8' },
              { val: strengths.length,    sub: 'Hidden Strengths' },
              { val: overest.length,      sub: 'Overstated Skills' },
              { val: missing.length,      sub: 'Skill Gaps' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-black text-white">{s.val}</div>
                <div className="text-xs text-blue-100 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── NARRATIVE ──────────────────────────────── */}
        {narrative && (
          <div className="card mb-6 anim-fade-up stagger-2" style={{ borderColor: 'var(--blue-200)', background: 'var(--blue-50)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🧠</span>
              <span className="font-bold" style={{ color: 'var(--blue-700)' }}>AI Summary</span>
            </div>
            <p className="leading-relaxed" style={{ color: 'var(--txt-secondary)' }}>{narrative}</p>
          </div>
        )}

        {/* ── ALERTS ─────────────────────────────────── */}
        {overest.length > 0 && (
          <div className="rounded-xl p-4 mb-4 anim-slide-r"
               style={{ background: 'var(--red-100)', border: '1px solid #FECACA' }}>
            <h3 className="font-bold mb-1" style={{ color: '#B91C1C' }}>⚠️ Overstated Proficiency</h3>
            <p className="text-sm" style={{ color: '#7F1D1D' }}>
              Your resume overstates: <strong>{overest.map(s=>s.skill).join(', ')}</strong>.
              This is common — your learning plan addresses it directly.
            </p>
          </div>
        )}
        {strengths.length > 0 && (
          <div className="rounded-xl p-4 mb-6"
               style={{ background: 'var(--emerald-100)', border: '1px solid #6EE7B7' }}>
            <h3 className="font-bold mb-1" style={{ color: '#065F46' }}>✨ Hidden Strengths Found</h3>
            <p className="text-sm" style={{ color: '#064E3B' }}>
              You outperformed your resume in: <strong>{strengths.map(s=>s.skill).join(', ')}</strong>.
              Update your resume to highlight these!
            </p>
          </div>
        )}

        {/* ── SKILL GRID ─────────────────────────────── */}
        <h2 className="text-xl font-bold mb-4 anim-fade-up" style={{ color: 'var(--txt-primary)' }}>
          Skill Breakdown
        </h2>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {[...skill_scores].sort((a,b) => (sortOrder[a.gap_type]??5)-(sortOrder[b.gap_type]??5))
            .map((s, i) => (
              <div key={s.skill} className={`anim-fade-up stagger-${Math.min(i+1,5)}`}>
                <SkillCard s={s} />
              </div>
            ))}
        </div>

        {/* ── CTA ────────────────────────────────────── */}
        <div className="card gradient-bg-soft text-center py-8 anim-fade-up"
             style={{ border: '1.5px solid var(--blue-200)' }}>
          <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--txt-primary)' }}>
            Ready to close the gaps?
          </h2>
          <p className="mb-6 text-base" style={{ color: 'var(--txt-secondary)' }}>
            Your personalised learning roadmap is ready — with curated resources,
            phase-by-phase milestones, and realistic time estimates.
          </p>
          <button onClick={() => router.push('/plan')} className="btn btn-primary"
                  style={{ fontSize: 15, padding: '13px 32px' }}>
            🗺️ View My Learning Roadmap →
          </button>
        </div>
      </div>
    </div>
  );
}
