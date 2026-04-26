'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/app/store/assessmentStore';
import type { SkillScore } from '@/app/types';

const GAP_COLORS: Record<string, { bar: string; badge: string; text: string; bg: string; label: string }> = {
  overestimated: { bar: '#EF4444', badge: 'badge-critical', text: '#DC2626', bg: '#FEF2F2', label: 'Overestimated' },
  underestimated: { bar: '#10B981', badge: 'badge-success', text: '#16A34A', bg: '#ECFDF5', label: '✨ Hidden Strength' },
  accurate:  { bar: '#3B82F6', badge: 'badge-medium', text: '#2563EB', bg: '#EFF6FF', label: 'Well Calibrated' },
  missing:   { bar: '#F59E0B', badge: 'badge-high', text: '#D97706', bg: '#FFFBEB', label: 'Skill Gap' },
  untested:  { bar: '#94A3B8', badge: 'badge-low', text: '#64748B', bg: '#F8FAFC', label: 'Not Tested' },
};

function SkillGapRow({ skill }: { skill: SkillScore }) {
  const cfg = GAP_COLORS[skill.gap_type] || GAP_COLORS.accurate;
  const claimed = skill.claimed_level || 0;
  const assessed = skill.assessed_level ?? 0;
  const maxVal = 8;

  return (
    <div style={{
      background: 'white', border: '1px solid var(--border)', borderRadius: 16,
      padding: '18px 20px', transition: 'box-shadow 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{skill.skill}</div>
          <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: cfg.text, fontFamily: 'Bricolage Grotesque, sans-serif', lineHeight: 1 }}>
            {assessed.toFixed(1)}
            <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>/8</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{skill.confidence_interval}</div>
        </div>
      </div>

      {/* Dual bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 64 }}>Claimed</span>
          <div className="score-track" style={{ flex: 1 }}>
            <div className="score-fill" style={{ width: `${(claimed / maxVal) * 100}%`, background: '#CBD5E1' }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', minWidth: 24, textAlign: 'right' }}>{claimed.toFixed(0)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 64 }}>Assessed</span>
          <div className="score-track" style={{ flex: 1 }}>
            <div className="score-fill" style={{ width: `${(assessed / maxVal) * 100}%`, background: cfg.bar }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: cfg.text, minWidth: 24, textAlign: 'right' }}>{assessed.toFixed(1)}</span>
        </div>
      </div>

      {skill.gap !== null && Math.abs(skill.gap) > 0.2 && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
          Gap: <span style={{ fontWeight: 600, color: cfg.text }}>{skill.gap > 0 ? '+' : ''}{skill.gap.toFixed(1)} pts</span>
          {' '}· {skill.questions_asked} question{skill.questions_asked !== 1 ? 's' : ''} assessed
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { results, questions, answers, sessionId } = useAssessmentStore();

  useEffect(() => { if (!sessionId) router.push('/'); }, [sessionId, router]);

  if (!results) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner spinner-blue" style={{ width: 40, height: 40, borderWidth: 3, margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--text-sub)', fontWeight: 500 }}>Analyzing your results...</div>
      </div>
    </div>
  );

  const { skill_scores, gaps_summary, narrative } = results;
  const overestimated = skill_scores.filter(s => s.gap_type === 'overestimated');
  const strengths = skill_scores.filter(s => s.gap_type === 'underestimated');
  const missing = skill_scores.filter(s => s.gap_type === 'missing');
  const avgScore = skill_scores
    .filter(s => s.assessed_level !== null)
    .reduce((sum, s) => sum + (s.assessed_level || 0), 0) /
    (skill_scores.filter(s => s.assessed_level !== null).length || 1);

  const sortedSkills = [...skill_scores].sort((a, b) => {
    const order: Record<string, number> = { missing: 0, overestimated: 1, accurate: 2, underestimated: 3, untested: 4 };
    return (order[a.gap_type] ?? 5) - (order[b.gap_type] ?? 5);
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>

      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/')} style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
            cursor: 'pointer', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 16
          }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 800 }}>S</div>
            SkillAssess
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => router.push('/assess')}>← Reassess</button>
          <button className="btn btn-primary btn-sm" onClick={() => router.push('/plan')}>
            View Learning Path →
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
        <div className="anim-fade-up">

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 6 }}>
              Assessment <span className="text-gradient">Results</span>
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: 15 }}>
              {questions.length} questions answered · {skill_scores.length} skills analyzed
            </p>
          </div>

          {/* AI Narrative */}
          {narrative && (
            <div style={{
              background: 'linear-gradient(135deg, #EFF6FF, #EDE9FE)',
              border: '1px solid #BFDBFE', borderRadius: 16, padding: '20px 24px', marginBottom: 28,
              display: 'flex', gap: 14, alignItems: 'flex-start'
            }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>🧠</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: '#1D4ED8' }}>AI Summary</div>
                <p style={{ color: '#374151', lineHeight: 1.7, fontSize: 14 }}>{narrative}</p>
              </div>
            </div>
          )}

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { value: avgScore.toFixed(1), label: 'Avg Score /8', color: '#2563EB', icon: '📊' },
              { value: String(strengths.length), label: 'Hidden Strengths', color: '#16A34A', icon: '✨' },
              { value: String(overestimated.length), label: 'Overestimated', color: '#DC2626', icon: '⚠️' },
              { value: String(missing.length), label: 'Skill Gaps', color: '#D97706', icon: '📍' },
            ].map(({ value, label, color, icon }) => (
              <div key={label} className="stat-card">
                <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                <div className="stat-value" style={{ color, marginBottom: 4 }}>{value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Alerts */}
          {overestimated.length > 0 && (
            <div style={{ marginBottom: 16, padding: '16px 20px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 14 }}>
              <div style={{ fontWeight: 700, color: '#DC2626', marginBottom: 4, fontSize: 14 }}>⚠️ Overestimation Detected</div>
              <p style={{ fontSize: 13, color: '#7F1D1D', lineHeight: 1.6 }}>
                Your resume overstates proficiency in: <strong>{overestimated.map(s => s.skill).join(', ')}</strong>. This is normal — your learning plan will target these gaps specifically.
              </p>
            </div>
          )}
          {strengths.length > 0 && (
            <div style={{ marginBottom: 24, padding: '16px 20px', background: '#ECFDF5', border: '1px solid #BBF7D0', borderRadius: 14 }}>
              <div style={{ fontWeight: 700, color: '#16A34A', marginBottom: 4, fontSize: 14 }}>✨ Hidden Strengths Found!</div>
              <p style={{ fontSize: 13, color: '#14532D', lineHeight: 1.6 }}>
                You performed better than your resume suggests in: <strong>{strengths.map(s => s.skill).join(', ')}</strong>. Highlight these on your resume!
              </p>
            </div>
          )}

          {/* Skill breakdown */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Skill Breakdown</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {sortedSkills.map(skill => <SkillGapRow key={skill.skill} skill={skill} />)}
            </div>
          </div>

          {/* CTA to learning path */}
          <div style={{
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            borderRadius: 20, padding: '32px 36px', color: 'white', textAlign: 'center'
          }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🗺️</div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>Your Learning Path is Ready</h2>
            <p style={{ opacity: 0.85, fontSize: 15, marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
              We've built a personalized roadmap prioritized by the role requirements and your real skill gaps — with curated resources and honest time estimates.
            </p>
            <button
              onClick={() => router.push('/plan')}
              style={{ background: 'white', color: '#2563EB', fontWeight: 700, fontSize: 15, padding: '13px 32px', borderRadius: 12, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
            >
              View My Personalized Learning Path →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
