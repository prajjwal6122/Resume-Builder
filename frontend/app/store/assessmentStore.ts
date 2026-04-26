/**
 * Zustand store for assessment state management
 */
'use client';

import { create } from 'zustand';
import type {
  AssessmentState,
  Question,
  EvaluationResult,
  AssessmentResults,
  LearningPlan,
  ResumeSkill,
  JDSkill,
} from '@/app/types';
import * as api from '@/app/services/api';

interface AssessmentActions {
  // Actions
  loadDemoData: () => Promise<{ resumeText: string; jdText: string }>;
  startAssessment: (resumeText: string, jdText: string, isDemo?: boolean) => Promise<void>;
  submitAnswer: (answer: string) => Promise<EvaluationResult | null>;
  completeAssessment: () => Promise<void>;
  nextQuestion: () => void;
  setError: (message: string | null) => void;
  reset: () => void;

  // Getters (computed)
  getCurrentQuestion: () => Question | null;
  getProgress: () => number;
  isAssessmentComplete: () => boolean;
}

type AssessmentStore = AssessmentState & AssessmentActions;

const initialState: AssessmentState = {
  sessionId: null,
  status: 'idle',
  isDemo: false,
  resumeText: '',
  jdText: '',
  resumeSkills: [],
  jdSkills: [],
  questions: [],
  answers: [],
  currentQuestionIndex: 0,
  results: null,
  learningPlan: null,
  errorMessage: null,
  isLoading: false,
};

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  ...initialState,

  // ════════════════════════════════════════
  // ACTIONS
  // ════════════════════════════════════════

  loadDemoData: async () => {
    set({ isLoading: true, errorMessage: null });
    try {
      // Use hardcoded demo text from backend sample data
      const response = await api.getDemoData();
      set({ isLoading: false });
      // Return actual texts from the API — we'll use them in startAssessment
      return {
        resumeText: '[DEMO_RESUME]',
        jdText: '[DEMO_JD]',
      };
    } catch (error) {
      set({ isLoading: false, errorMessage: (error as Error).message });
      throw error;
    }
  },

  startAssessment: async (resumeText: string, jdText: string, isDemo = false) => {
    set({ status: 'starting', isLoading: true, errorMessage: null });
    try {
      const response = await api.startAssessment(resumeText, jdText, isDemo);

      set({
        sessionId: response.session_id,
        status: 'in_progress',
        isDemo: response.is_demo,
        resumeText,
        jdText,
        resumeSkills: response.resume_skills as ResumeSkill[],
        jdSkills: response.jd_skills as JDSkill[],
        questions: response.questions as Question[],
        answers: [],
        currentQuestionIndex: 0,
        isLoading: false,
      });
    } catch (error) {
      set({
        status: 'error',
        errorMessage: (error as Error).message,
        isLoading: false,
      });
      throw error;
    }
  },

  submitAnswer: async (answerText: string) => {
    const state = get();
    const currentQuestion = state.questions[state.currentQuestionIndex];

    if (!state.sessionId || !currentQuestion) return null;

    set({ status: 'evaluating', isLoading: true });

    try {
      const response = await api.submitAnswer(
        state.sessionId,
        currentQuestion.id,
        answerText,
        currentQuestion.text,
        currentQuestion.expected_depth
      );

      const evaluation = response.evaluation as EvaluationResult;

      set((prev) => ({
        answers: [...prev.answers, evaluation],
        isLoading: false,
        status: 'in_progress',
      }));

      return evaluation;
    } catch (error) {
      set({
        status: 'error',
        errorMessage: (error as Error).message,
        isLoading: false,
      });
      throw error;
    }
  },

  nextQuestion: () => {
    const state = get();
    const nextIndex = state.currentQuestionIndex + 1;

    if (nextIndex < state.questions.length) {
      set({ currentQuestionIndex: nextIndex });
    }
  },

  completeAssessment: async () => {
    const state = get();
    if (!state.sessionId) return;

    set({ status: 'completing', isLoading: true });

    try {
      const response = await api.completeAssessment(state.sessionId);

      set({
        status: 'completed',
        results: response.results as AssessmentResults,
        learningPlan: response.learning_plan as LearningPlan,
        isLoading: false,
      });
    } catch (error) {
      set({
        status: 'error',
        errorMessage: (error as Error).message,
        isLoading: false,
      });
      throw error;
    }
  },

  setError: (message) => {
    set({ errorMessage: message, status: message ? 'error' : 'idle' });
  },

  reset: () => {
    set(initialState);
  },

  // ════════════════════════════════════════
  // GETTERS
  // ════════════════════════════════════════

  getCurrentQuestion: () => {
    const state = get();
    return state.questions[state.currentQuestionIndex] || null;
  },

  getProgress: () => {
    const state = get();
    if (state.questions.length === 0) return 0;
    return Math.round((state.currentQuestionIndex / state.questions.length) * 100);
  },

  isAssessmentComplete: () => {
    const state = get();
    return state.currentQuestionIndex >= state.questions.length && state.answers.length > 0;
  },
}));
