/**
 * API service layer — all backend calls centralized here
 */
import axios, { AxiosError } from 'axios';
import type {
  StartAssessmentResponse,
  AnswerResponse,
  CompleteResponse,
  AssessmentResults,
  LearningPlan,
} from '@/app/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message =
      (error.response?.data as { detail?: string })?.detail ||
      error.message ||
      'An unexpected error occurred';
    throw new Error(message);
  }
);


// ════════════════════════════════════════
// UPLOAD ENDPOINTS
// ════════════════════════════════════════

export async function uploadResume(file: File): Promise<{ resume_id: string; text: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/upload/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return {
    resume_id: response.data.resume.id,
    text: response.data.resume.extracted_text,
  };
}

export async function uploadJDText(jdText: string): Promise<{ jd_id: string }> {
  const response = await api.post('/api/upload/jd-text', { jd_text: jdText });
  return { jd_id: response.data.jd.id };
}

export async function getDemoData(): Promise<{
  resume_id: string;
  jd_id: string;
  resume_preview: string;
  jd_preview: string;
}> {
  const response = await api.get('/api/upload/demo-data');
  return response.data;
}


// ════════════════════════════════════════
// ASSESSMENT ENDPOINTS
// ════════════════════════════════════════

export async function startAssessment(
  resumeText: string,
  jdText: string,
  isDemo: boolean = false
): Promise<StartAssessmentResponse> {
  const response = await api.post('/api/assess/start', {
    resume_text: resumeText,
    jd_text: jdText,
    is_demo: isDemo,
  });
  return response.data;
}

export async function submitAnswer(
  sessionId: string,
  questionId: string,
  answerText: string,
  questionText: string,
  expectedDepth?: string
): Promise<AnswerResponse> {
  const response = await api.post(`/api/assess/${sessionId}/answer`, {
    question_id: questionId,
    answer_text: answerText,
    question_text: questionText,
    expected_depth: expectedDepth,
  });
  return response.data;
}

export async function completeAssessment(sessionId: string): Promise<CompleteResponse> {
  const response = await api.post(`/api/assess/${sessionId}/complete`);
  return response.data;
}

export async function getResults(
  sessionId: string
): Promise<{ results: AssessmentResults; learning_plan: LearningPlan }> {
  const response = await api.get(`/api/assess/${sessionId}/results`);
  return response.data;
}

export async function getSession(sessionId: string) {
  const response = await api.get(`/api/assess/${sessionId}`);
  return response.data;
}

export async function checkHealth(): Promise<{
  status: string;
  services: Record<string, string | number>;
}> {
  const response = await api.get('/health');
  return response.data;
}
