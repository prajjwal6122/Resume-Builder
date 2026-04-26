'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/app/store/assessmentStore';
import type { LearningSkill, Resource } from '@/app/types';

// ─── Constants ──────────────────────────────────────────────
const IMPORTANCE_STYLES: Record<string, { bg: string; color: string; border: string; label: string }> = {
  critical: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', label: 'Critical' },
  high:     { bg: '#FEF3C7', color: '#D97706', border: '#FDE68A', label: 'High' },
  medium:   { bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE', label: 'Medium' },
  low:      { bg: '#F8FAFC', color: '#64748B', border: '#E2E8F0', label: 'Low' },
};

const RESOURCE_ICONS: Record<string, string> = {
  course: '🎓', book: '📚', documentation: '📖', video: '🎥',
  tutorial: '💻', blog: '✍️', interactive: '🎮', default: '📌',
};

const PHASE_COLORS = [
  'linear-gradient(135deg, #2563EB, #60A5FA)',
  'linear-gradient(135deg, #7C3AED, #A78BFA)',
  'linear-gradient(135deg, #059669, #34D399)',
  'linear-gradient(135deg, #EA580C, #FB923C)',
  'linear-gradient(135deg, #DC2626, #F87171)',
];

// ─── Resource Card ───────────────────────────────────────────
function ResourceCard({ r }: { r: Resource }) {
  const icon = RESOURCE_ICONS[r.type] || RESOURCE_ICONS.default;
  const isFree = r.cost === 'free';
  return (
    <a href={r.url} target="_blank" rel="noopener noreferrer" className="resource-card">
      <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {r.title}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{r.type}</span>
          {r.duration_hours && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {r.duration_hours}h</span>
          )}
          <span style={{ fontSize: 11, fontWeight: 700, color: isFree ? '#16A34A' : '#D97706' }}>
            {isFree ? '✓ Free' : r.cost}
          </span>
          {r.rating && (
            <span style={{ fontSize: 11, color: '#F59E0B' }}>★ {r.rating}</span>
          )}
        </div>
      </div>
      <span style={{ fontSize: 14, color: 'var(--text-muted)', flexShrink: 0 }}>↗</span>
    </a>
  );
}

// ─── Skill Path Card ─────────────────────────────────────────
function SkillPathCard({ skill, index, isExpanded, onToggle }: {
  skill: LearningSkill; index: number; isExpanded: boolean; onToggle: () => void;
}) {
  const imp = IMPORTANCE_STYLES[skill.importance] || IMPORTANCE_STYLES.medium;
  const gradient = PHASE_COLORS[index % PHASE_COLORS.length];
  const progressPct = Math.round((skill.current_level / 8) * 100);
  const targetPct = Math.round((skill.target_level / 8) * 100);

  return (
    <div className={`path-card${isExpanded ? ' expanded' : ''}`} onClick={onToggle}
      style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Left accent line */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: gradient, borderRadius: '16px 0 0 16px' }} />

      <div style={{ paddingLeft: 16 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* Priority bubble */}
          <div style={{
            width: 42, height: 42, borderRadius: 12, background: gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 18,
            fontFamily: 'Bricolage Grotesque, sans-serif', flexShrink: 0
          }}>
            {skill.priority}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Bricolage Grotesque, sans-serif' }}>{skill.skill}</h3>
              <span style={{
                padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                background: imp.bg, color: imp.color, border: `1px solid ${imp.border}`,
                textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>{imp.label}</span>
            </div>

            {/* Meta row */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-muted)' }}>
              <span>⏱ <strong style={{ color: 'var(--text)' }}>{skill.estimated_hours}h</strong> total</span>
              {skill.weeks_at_5hrs && <span>📅 <strong style={{ color: 'var(--text)' }}>{skill.weeks_at_5hrs} weeks</strong> @ 5h/wk</span>}
              <span>📈 Level {skill.current_level.toFixed(0)} → {skill.target_level.toFixed(0)}</span>
            </div>
          </div>

          {/* Expand toggle */}
          <div style={{ color: 'var(--text-muted)', fontSize: 13, flexShrink: 0, paddingTop: 4 }}>
            {isExpanded ? '▲ Collapse' : '▼ See Roadmap'}
          </div>
        </div>

        {/* Level progress */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 80 }}>Current level</span>
          <div style={{ flex: 1, position: 'relative', height: 10, background: 'var(--gray-100)', borderRadius: 99 }}>
            {/* Target marker */}
            <div style={{
              position: 'absolute', top: -3, bottom: -3,
              left: `${targetPct}%`,
              width: 2, background: 'var(--gray-300)',
              borderRadius: 1
            }} />
            {/* Current fill */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${progressPct}%`,
              background: gradient, borderRadius: 99
            }} />
            {/* Target label */}
            <div style={{
              position: 'absolute', top: -18, left: `${targetPct}%`,
              fontSize: 9, color: 'var(--text-muted)', transform: 'translateX(-50%)',
              whiteSpace: 'nowrap', fontWeight: 700
            }}>Target</div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 50, textAlign: 'right' }}>
            {skill.current_level.toFixed(0)}/8 → {skill.target_level.toFixed(0)}/8
          </span>
        </div>

        {/* Why important (always visible) */}
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.65 }}>
          {skill.why_important}
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="anim-fade-up" style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>

            {/* Prerequisites */}
            {skill.prerequisites && skill.prerequisites.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10 }}>
                  Prerequisites
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {skill.prerequisites.map((p, i) => (
                    <span key={i} style={{
                      padding: '5px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                      background: p.status === 'already_have' ? '#DCFCE7' : '#EFF6FF',
                      color: p.status === 'already_have' ? '#16A34A' : '#2563EB',
                      border: `1px solid ${p.status === 'already_have' ? '#BBF7D0' : '#BFDBFE'}`,
                    }}>
                      {p.status === 'already_have' ? '✓' : '→'} {p.skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Learning phases */}
            {skill.learning_phases && skill.learning_phases.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12 }}>
                  📍 Learning Phases
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {skill.learning_phases.map((phase, pi) => (
                    <div key={pi} style={{
                      display: 'flex', gap: 14, alignItems: 'flex-start',
                      padding: '14px 16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--border)'
                    }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {pi + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{phase.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{phase.duration_hours}h</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            {skill.resources && skill.resources.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10 }}>
                  📚 Curated Resources ({skill.resources.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {skill.resources.map((r, ri) => <ResourceCard key={ri} r={r} />)}
                </div>
              </div>
            )}

            {/* Practice projects */}
            {skill.projects && skill.projects.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10 }}>
                  🛠️ Practice Projects
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {skill.projects.map((proj, pi) => (
                    <div key={pi} style={{ padding: '12px 16px', background: '#EDE9FE', border: '1px solid #DDD6FE', borderRadius: 12 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: '#5B21B6', marginBottom: 4 }}>{proj.title}</div>
                      <div style={{ fontSize: 12, color: '#6D28D9' }}>{proj.description}</div>
                      {proj.duration_hours && (
                        <div style={{ fontSize: 11, color: '#7C3AED', marginTop: 6, fontWeight: 600 }}>~{proj.duration_hours}h</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function LearningPlanPage() {
  const router = useRouter();
  const { learningPlan, sessionId } = useAssessmentStore();
  const [expanded, setExpanded] = useState<number | null>(0);

  useEffect(() => { if (!sessionId) router.push('/'); }, [sessionId, router]);

  const handleExport = () => {
    if (!learningPlan) return;
    const { summary, skills, success_criteria } = learningPlan;
    const text = [
      '# SkillAssess — Personalized Learning Path',
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      `## Summary`,
      `Total: ${summary.total_hours}h | ${summary.weeks_10hrs_per_week} weeks @ 10h/wk`,
      `Completion: ${summary.estimated_completion}`,
      '',
      '## Priority Skills',
      ...skills.map((s, i) => [
        `### ${i+1}. ${s.skill} [${s.importance.toUpperCase()}]`,
        `Hours: ${s.estimated_hours}h | Level: ${s.current_level.toFixed(0)} → ${s.target_level.toFixed(0)}/8`,
        s.why_important,
        '',
        'Resources:',
        ...s.resources.map(r => `  • ${r.title} — ${r.cost === 'free' ? 'Free' : r.cost} (${r.url})`),
        '',
      ].join('\n')),
      '## Success Criteria',
      ...success_criteria.map(c => `• ${c}`),
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'skillassess_learning_path.md'; a.click();
    URL.revokeObjectURL(url);
  };

  if (!learningPlan) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner spinner-blue" style={{ width: 40, height: 40, borderWidth: 3, margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--text-sub)', fontWeight: 500 }}>Building your learning path...</div>
      </div>
    </div>
  );

  const { summary, skills, timeline, success_criteria } = learningPlan;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>

      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 16 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 800 }}>S</div>
            SkillAssess
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push('/dashboard')}>← Dashboard</button>
          <button className="btn btn-secondary btn-sm" onClick={handleExport}>↓ Export .md</button>
          <button className="btn btn-primary btn-sm" onClick={() => { useAssessmentStore.getState().reset(); router.push('/'); }}>
            🔄 New Assessment
          </button>
        </div>
      </nav>

      {/* Hero banner */}
      <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #4C1D95 60%, #2563EB 100%)', color: 'white', padding: '48px 24px 40px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7, marginBottom: 10 }}>
                Your Personalized
              </div>
              <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 8, lineHeight: 1.1, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Learning Path
              </h1>
              <p style={{ opacity: 0.8, fontSize: 15, maxWidth: 480, lineHeight: 1.6 }}>
                Prioritized by your skill gaps and the role requirements. Each skill is ordered by impact and learning feasibility.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, flexShrink: 0 }}>
              {[
                { v: `${summary.total_hours}h`, l: 'Total Learning', sub: 'curated estimate' },
                { v: `${summary.weeks_10hrs_per_week}w`, l: '@ 10h / week', sub: 'to job-ready' },
                { v: String(skills.length), l: 'Priority Skills', sub: 'ranked by impact' },
              ].map(({ v, l, sub }) => (
                <div key={l} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '18px 16px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div style={{ fontSize: 30, fontWeight: 800, fontFamily: 'Bricolage Grotesque, sans-serif', lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6, opacity: 0.9 }}>{l}</div>
                  <div style={{ fontSize: 10, opacity: 0.6, marginTop: 3 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline breadcrumb */}
          <div style={{ marginTop: 32, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {skills.map((s, i) => (
              <div key={s.skill} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  background: 'rgba(255,255,255,0.15)', borderRadius: 99, padding: '4px 12px',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: expanded === i ? '0 0 0 2px rgba(255,255,255,0.5)' : 'none'
                }} onClick={() => setExpanded(expanded === i ? null : i)}>
                  {i + 1}. {s.skill}
                </div>
                {i < skills.length - 1 && <span style={{ opacity: 0.4, fontSize: 14 }}>→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
        <div className="anim-fade-up">

          {/* Skills list */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Your Skills Roadmap
              </h2>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Click any skill to expand its full roadmap</span>
            </div>

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Vertical connector line */}
              <div style={{
                position: 'absolute', left: 33, top: 50, bottom: 50,
                width: 2, background: 'linear-gradient(180deg, #BFDBFE, #DDD6FE, #E2E8F0)',
                zIndex: 0
              }} />

              {skills.map((skill, i) => (
                <div key={skill.skill} style={{ position: 'relative', zIndex: 1 }}>
                  <SkillPathCard
                    skill={skill}
                    index={i}
                    isExpanded={expanded === i}
                    onToggle={() => setExpanded(expanded === i ? null : i)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Week-by-week timeline */}
          {Object.keys(timeline).length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                📅 Week-by-Week Timeline
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {Object.entries(timeline).map(([period, data], i) => {
                  const gradient = PHASE_COLORS[i % PHASE_COLORS.length];
                  return (
                    <div key={period} className="card-sm" style={{ borderLeft: '4px solid', borderColor: 'transparent', backgroundImage: `linear-gradient(white, white), ${gradient}`, backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', borderRadius: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Phase {i + 1}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{data.hours}h</div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{data.focus}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{data.milestone}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Success criteria */}
          {success_criteria.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                🏆 You'll Know You're Ready When...
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                {success_criteria.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px', background: 'white', border: '1px solid var(--border)', borderRadius: 14 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-sub)', lineHeight: 1.6, margin: 0 }}>{c}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div style={{ padding: '32px', background: 'white', border: '1px solid var(--border)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Complete this plan and re-assess
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Once you've built the skills, take a new assessment to verify your growth and update your roadmap.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <button className="btn btn-secondary" onClick={handleExport}>↓ Download Plan</button>
              <button className="btn btn-gradient" onClick={() => { useAssessmentStore.getState().reset(); router.push('/'); }}>
                🔄 Start New Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
