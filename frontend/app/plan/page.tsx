'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '@/app/store/assessmentStore';
import type { LearningSkill, Resource } from '@/app/types';

/* ══════════════════════════════════════════════════
   RESOURCE CARD
   ══════════════════════════════════════════════════ */
const R_ICONS: Record<string, string> = {
  course:'🎓', book:'📚', documentation:'📖',
  video:'🎬', tutorial:'💻', blog:'✍️', interactive:'🎮',
};
const R_COLORS: Record<string, string> = {
  course:'var(--blue-100)', book:'var(--purple-100)', documentation:'var(--emerald-100)',
  video:'var(--red-100)',   tutorial:'var(--amber-100)', blog:'var(--bg-subtle)',
  interactive:'var(--emerald-100)',
};

function ResourceCard({ r }: { r: Resource }) {
  return (
    <a href={r.url} target="_blank" rel="noopener noreferrer"
       className="flex items-start gap-3 p-3 rounded-xl transition-all group"
       style={{ background: 'white', border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)' }}
       onMouseOver={e => {
         (e.currentTarget as HTMLElement).style.borderColor = 'var(--blue-200)';
         (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
       }}
       onMouseOut={e => {
         (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
         (e.currentTarget as HTMLElement).style.transform = '';
       }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
           style={{ background: R_COLORS[r.type] || 'var(--bg-subtle)' }}>
        {R_ICONS[r.type] || '📌'}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--txt-primary)' }}>
          {r.title}
        </h4>
        <div className="flex items-center gap-2 flex-wrap mt-0.5">
          <span className="text-xs capitalize" style={{ color: 'var(--txt-muted)' }}>{r.type}</span>
          {r.duration_hours && <span className="text-xs" style={{ color: 'var(--txt-muted)' }}>· {r.duration_hours}h</span>}
          <span className="text-xs font-semibold" style={{ color: r.cost === 'free' ? '#059669' : 'var(--amber-500)' }}>
            {r.cost === 'free' ? '✓ Free' : r.cost}
          </span>
          {r.rating && <span className="text-xs" style={{ color: 'var(--amber-500)' }}>★ {r.rating}</span>}
        </div>
      </div>
      <span className="text-sm opacity-30 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--blue-600)' }}>↗</span>
    </a>
  );
}

/* ══════════════════════════════════════════════════
   PHASE STEP  (learn → apply → master)
   ══════════════════════════════════════════════════ */
function PhaseStep({ phase, isLast }: { phase: { phase: number; title: string; topics: string[]; project: string }; isLast: boolean }) {
  const colors = ['var(--blue-600)', '#7C3AED', '#059669'];
  const bgs    = ['var(--blue-50)', 'var(--purple-100)', 'var(--emerald-100)'];
  const c = colors[(phase.phase - 1) % 3];
  const bg = bgs[(phase.phase - 1) % 3];

  return (
    <div className={`relative flex gap-4 ${!isLast ? 'phase-connector' : ''}`}>
      {/* Circle */}
      <div className="shrink-0 flex flex-col items-center">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2"
             style={{ background: bg, borderColor: c, color: c }}>
          {phase.phase}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="card" style={{ padding: '16px 20px' }}>
          <h4 className="font-bold mb-1" style={{ color: 'var(--txt-primary)' }}>{phase.title}</h4>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {phase.topics.map(t => (
              <span key={t} className="badge badge-neutral text-xs">{t}</span>
            ))}
          </div>
          <div className="rounded-lg p-3 text-sm flex items-start gap-2"
               style={{ background: bg, border: `1px solid ${c}30` }}>
            <span>🛠️</span>
            <div>
              <span className="font-semibold" style={{ color: c }}>Project milestone: </span>
              <span style={{ color: 'var(--txt-secondary)' }}>{phase.project}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   SKILL ROW CARD  (expandable)
   ══════════════════════════════════════════════════ */
const IMP_STYLE: Record<string, { badge: string; accent: string }> = {
  critical: { badge: 'badge-critical', accent: '#DC2626' },
  high:     { badge: 'badge-high',     accent: '#D97706' },
  medium:   { badge: 'badge-medium',   accent: 'var(--blue-600)' },
  low:      { badge: 'badge-low',      accent: 'var(--txt-muted)' },
};

function SkillRow({ skill, idx, open, toggle }: {
  skill: LearningSkill; idx: number; open: boolean; toggle: () => void;
}) {
  const imp = IMP_STYLE[skill.importance] || IMP_STYLE.medium;
  const pctCurrent = (skill.current_level / 8) * 100;
  const pctTarget  = (skill.target_level  / 8) * 100;

  return (
    <div className={`card transition-all ${open ? 'shadow-md' : ''}`}
         style={{ borderColor: open ? 'var(--blue-200)' : 'var(--border)' }}>

      {/* Header button */}
      <button onClick={toggle} className="w-full text-left">
        <div className="flex items-start gap-4">
          {/* Priority badge */}
          <div className="w-9 h-9 rounded-xl gradient-blue flex items-center justify-center text-white font-black text-sm shrink-0">
            {idx}
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-lg" style={{ color: 'var(--txt-primary)' }}>{skill.skill}</h3>
              <span className={`badge ${imp.badge}`}>{skill.importance}</span>
              {(skill as any).is_adjacent_skill && (
                <span className="badge badge-success">⚡ Adjacent — fast to acquire</span>
              )}
            </div>

            {/* Progress bars */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs w-16 shrink-0" style={{ color: 'var(--txt-muted)' }}>Now</span>
              <div className="flex-1 progress-track">
                <div className="h-full rounded-full" style={{ width: `${pctCurrent}%`, background: '#CBD5E1', transition: 'width 0.8s ease' }} />
              </div>
              <span className="text-xs w-5 text-right" style={{ color: 'var(--txt-muted)' }}>{skill.current_level.toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs w-16 shrink-0" style={{ color: 'var(--txt-muted)' }}>Target</span>
              <div className="flex-1 progress-track">
                <div className="h-full rounded-full" style={{ width: `${pctTarget}%`, background: imp.accent, transition: 'width 0.8s ease' }} />
              </div>
              <span className="text-xs w-5 text-right font-bold" style={{ color: imp.accent }}>{skill.target_level.toFixed(0)}</span>
            </div>
          </div>

          {/* Time estimate */}
          <div className="text-right shrink-0">
            <div className="font-black text-xl gradient-text">{skill.estimated_hours}h</div>
            <div className="text-xs" style={{ color: 'var(--txt-muted)' }}>
              ~{skill.weeks_at_5hrs}w @ 5h/wk
            </div>
          </div>
        </div>

        {/* Why */}
        <p className="text-sm mt-3 leading-relaxed text-left"
           style={{ color: 'var(--txt-secondary)' }}>{skill.why_important}</p>

        {/* Unlocks */}
        {(skill as any).unlocks?.length > 0 && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs" style={{ color: 'var(--txt-muted)' }}>Unlocks:</span>
            {(skill as any).unlocks.map((u: string) => (
              <span key={u} className="badge badge-purple text-xs">{u}</span>
            ))}
          </div>
        )}

        <div className="mt-2 text-xs font-semibold" style={{ color: 'var(--blue-600)' }}>
          {open ? '▲ Hide details' : '▼ Show phases & resources'}
        </div>
      </button>

      {/* Expanded: phases + resources */}
      {open && (
        <div className="mt-4 pt-4 border-t anim-fade-in" style={{ borderColor: 'var(--border)' }}>
          <div className="grid md:grid-cols-2 gap-8">

            {/* Phases */}
            {(skill as any).phases?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--txt-muted)' }}>
                  📍 Learning Phases
                </h4>
                <div>
                  {(skill as any).phases.map((p: any, i: number) => (
                    <PhaseStep key={i} phase={p} isLast={i === (skill as any).phases.length - 1} />
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            <div>
              {skill.resources.length > 0 && (
                <>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--txt-muted)' }}>
                    🎯 Curated Resources ({skill.resources.length})
                  </h4>
                  <div className="space-y-2">
                    {skill.resources.map((r, i) => <ResourceCard key={i} r={r} />)}
                  </div>
                </>
              )}

              {/* Prerequisites */}
              {skill.prerequisites.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--txt-muted)' }}>Prerequisites</h4>
                  <div className="flex flex-wrap gap-2">
                    {skill.prerequisites.map((p, i) => (
                      <span key={i} className={`badge ${p.status === 'already_have' ? 'badge-success' : 'badge-high'}`}>
                        {p.status === 'already_have' ? '✓' : '→'} {p.skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PAGE
   ══════════════════════════════════════════════════ */
export default function PlanPage() {
  const router = useRouter();
  const { learningPlan, sessionId, results } = useAssessmentStore();
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => { if (!sessionId) router.push('/'); }, [sessionId, router]);

  if (!learningPlan) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-transparent border-t-purple-500 rounded-full anim-spin mx-auto mb-4" />
        <p style={{ color: 'var(--txt-secondary)' }}>Building your roadmap…</p>
      </div>
    </div>
  );

  const { summary, skills, timeline, success_criteria } = learningPlan;
  const narrative = (learningPlan as any).narrative ?? (results?.narrative ?? '');

  const handleExport = () => {
    const md = [
      '# SkillAssess — Personalised Learning Roadmap',
      '',
      `**Total time:** ${summary.total_hours}h | **Est. completion:** ${summary.estimated_completion}`,
      '',
      '## Skills to Develop',
      ...skills.map((s, i) => [
        `### ${i+1}. ${s.skill} (${s.estimated_hours}h)`,
        s.why_important, '',
      ].join('\n')),
      '## Success Criteria',
      ...success_criteria.map(c => `- ${c}`),
    ].join('\n');
    const b = new Blob([md], { type: 'text/markdown' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(b);
    a.download = 'learning_roadmap.md'; a.click();
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
            <button onClick={() => router.push('/dashboard')} className="btn btn-ghost text-sm">← Results</button>
            <button onClick={handleExport} className="btn btn-secondary text-sm">↓ Export .md</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────── */}
      <div className="card-blue px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="anim-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
                   style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                🗺️ Personalised Roadmap
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
                Your Learning<br />Roadmap
              </h1>
              {narrative && (
                <p className="text-blue-100 leading-relaxed text-base">{narrative}</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 anim-fade-up stagger-2">
              {[
                { val: summary.total_hours + 'h', label: 'Total Hours' },
                { val: summary.weeks_10hrs_per_week + ' wks', label: 'At 10h/week' },
                { val: summary.weeks_5hrs_per_week  + ' wks', label: 'At 5h/week' },
                { val: skills.length, label: 'Skills' },
              ].map(s => (
                <div key={s.label} className="rounded-xl text-center py-4 px-2"
                     style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div className="text-2xl font-black text-white">{s.val}</div>
                  <div className="text-xs text-blue-200 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Adjacent skills callout */}
          {(summary as any).adjacent_skills_count > 0 && (
            <div className="mt-6 rounded-xl p-4 flex items-start gap-3"
                 style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <span className="text-xl">⚡</span>
              <div>
                <div className="font-bold text-white text-sm">Zone of Proximal Development</div>
                <div className="text-blue-100 text-sm">
                  {(summary as any).adjacent_skills_count} of {skills.length} target skills
                  are <strong>adjacent</strong> to what you already know — expect faster acquisition
                  because your existing knowledge transfers directly.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">

        {/* ── SKILL CARDS ─────────────────────────── */}
        <div className="mb-10">
          <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--txt-primary)' }}>
            Priority Skills
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--txt-secondary)' }}>
            Ordered by ROI: job criticality × gap size ÷ acquisition difficulty
          </p>
          <div className="space-y-4">
            {skills.map((s, i) => (
              <div key={s.skill} className={`anim-fade-up stagger-${Math.min(i+1,5)}`}>
                <SkillRow skill={s} idx={i+1} open={open===i} toggle={() => setOpen(open===i ? null : i)} />
              </div>
            ))}
          </div>
        </div>

        {/* ── WEEK-BY-WEEK TIMELINE ──────────────── */}
        {Array.isArray(timeline) && timeline.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--txt-primary)' }}>
              Week-by-Week Timeline
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--txt-secondary)' }}>
              Phase milestones give you concrete checkpoints so you always know you're progressing.
            </p>
            <div className="card" style={{ padding: '24px 28px' }}>
              <div className="space-y-4">
                {(timeline as any[]).map((t, i) => (
                  <div key={i} className={`flex gap-4 ${i < (timeline as any[]).length - 1 ? 'timeline-line' : ''}`}>
                    {/* Week circle */}
                    <div className="shrink-0">
                      <div className="w-8 h-8 rounded-full gradient-blue flex items-center justify-center text-white font-bold text-xs">
                        {t.week_start}
                      </div>
                    </div>
                    <div className="flex-1 pb-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold text-sm" style={{ color: 'var(--txt-primary)' }}>
                            Wk {t.week_start}–{t.week_end}: <span className="gradient-text">{t.skill}</span>
                            <span className="ml-1 text-xs font-normal" style={{ color: 'var(--txt-muted)' }}>
                              Phase {t.phase} — {t.title}
                            </span>
                          </div>
                          <p className="text-xs mt-1" style={{ color: 'var(--txt-muted)' }}>
                            🛠️ {t.milestone}
                          </p>
                        </div>
                        <span className="badge badge-blue shrink-0">{t.hours}h</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SUCCESS CRITERIA ───────────────────── */}
        {success_criteria.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--txt-primary)' }}>🏆 How You'll Know You're Ready</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--txt-muted)' }}>
              These are your concrete re-application checkpoints.
            </p>
            <ul className="space-y-3">
              {success_criteria.map((c, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs text-white gradient-blue mt-0.5">
                    {i+1}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--txt-secondary)' }}>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── RESTART ────────────────────────────── */}
        <div className="text-center py-8">
          <p className="text-sm mb-4" style={{ color: 'var(--txt-muted)' }}>
            Complete the roadmap and re-assess to measure real progress.
          </p>
          <button
            onClick={() => { useAssessmentStore.getState().reset(); router.push('/'); }}
            className="btn btn-secondary"
          >
            🔄 Start New Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
