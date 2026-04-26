/**
 * Shared TypeScript interfaces for SkillAssess
 */

// ═══════════════════════════════════════
// SKILLS
// ═══════════════════════════════════════

export interface ResumeSkill {
  name: string;
  category: string;
  years?: number;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface JDSkill {
  name: string;
  category: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  required_level?: string;
  years_required?: number;
}

// ═══════════════════════════════════════
// ASSESSMENT QUESTIONS
// ═══════════════════════════════════════

export interface Question {
  id: string;
  text: string;
  skill: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  expected_depth?: string;
  why_this_question?: string;
  difficulty_score?: number;
  order?: number;
}

// ═══════════════════════════════════════
// EVALUATION
// ═══════════════════════════════════════

export interface ScoreBreakdown {
  correctness: number;  // 0-2
  depth: number;        // 0-2
  examples: number;     // 0-2
  clarity: number;      // 0-1
  confidence: number;   // 0-1
}

export interface EvaluationResult {
  question_id: string;
  answer_text: string;
  score_breakdown: ScoreBreakdown;
  total_score: number;    // 0-8
  reasoning: string;
  red_flags: string[];
  strengths: string[];
  follow_up_needed: boolean;
  follow_up_question?: string;
  is_fallback?: boolean;
}

// ═══════════════════════════════════════
// GAP ANALYSIS
// ═══════════════════════════════════════

export type GapType = 'overestimated' | 'underestimated' | 'accurate' | 'missing' | 'untested';
export type Severity = 'high' | 'medium' | 'low' | 'positive' | 'none';

export interface SkillScore {
  skill: string;
  claimed_level: number;
  assessed_level: number | null;
  gap: number | null;
  gap_type: GapType;
  severity: Severity;
  confidence_interval: string;
  match_quality: string;
  questions_asked: number;
}

export interface GapSummary {
  overestimation_count: number;
  underestimation_count: number;
  accurate_count: number;
  missing_count: number;
  overall_calibration: string;
  assessment_reliability: number;
}

export interface AssessmentResults {
  skill_scores: SkillScore[];
  gaps_summary: GapSummary;
  narrative?: string;
}

// ═══════════════════════════════════════
// LEARNING PLAN
// ═══════════════════════════════════════

export interface Resource {
  title: string;
  url: string;
  type: 'course' | 'blog' | 'documentation' | 'video' | 'book' | 'tutorial' | 'interactive';
  difficulty: string;
  duration_hours?: number;
  cost: string;
  rating?: number;
  when_to_use?: string;
}

export interface LearningSkill {
  priority: number;
  skill: string;
  category: string;
  current_level: number;
  target_level: number;
  estimated_hours: number;
  weeks_at_5hrs?: number;
  importance: 'critical' | 'high' | 'medium' | 'low';
  why_important: string;
  prerequisites: Array<{ skill: string; status: string }>;
  resources: Resource[];
  projects: Array<{ title: string; description: string; duration_hours?: number }>;
}

export interface PlanSummary {
  total_hours: number;
  weeks_5hrs_per_week: number;
  weeks_10hrs_per_week: number;
  estimated_completion: string;
  difficulty: string;
}

export interface LearningPlan {
  summary: PlanSummary;
  skills: LearningSkill[];
  timeline: Record<string, { focus: string; hours: number; milestone: string }>;
  success_criteria: string[];
}

// ═══════════════════════════════════════
// SESSION STATE
// ═══════════════════════════════════════

export type AssessmentStatus = 'idle' | 'uploading' | 'starting' | 'in_progress' | 'evaluating' | 'completing' | 'completed' | 'error';

export interface AssessmentState {
  sessionId: string | null;
  status: AssessmentStatus;
  isDemo: boolean;
  resumeText: string;
  jdText: string;
  resumeSkills: ResumeSkill[];
  jdSkills: JDSkill[];
  questions: Question[];
  answers: EvaluationResult[];
  currentQuestionIndex: number;
  results: AssessmentResults | null;
  learningPlan: LearningPlan | null;
  errorMessage: string | null;
  isLoading: boolean;
}

// ═══════════════════════════════════════
// API RESPONSES
// ═══════════════════════════════════════

export interface APIError {
  detail: string;
}

export interface StartAssessmentResponse {
  success: boolean;
  session_id: string;
  is_demo: boolean;
  questions: Question[];
  total_questions: number;
  resume_skills: ResumeSkill[];
  jd_skills: JDSkill[];
}

export interface AnswerResponse {
  success: boolean;
  evaluation: EvaluationResult;
  progress: string;
  is_complete: boolean;
}

export interface CompleteResponse {
  success: boolean;
  session_id: string;
  results: AssessmentResults;
  learning_plan: LearningPlan;
  is_demo: boolean;
}
