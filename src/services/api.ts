import {
  User,
  ResumeProfile,
  Interview,
  Question,
  Answer,
  InterviewResult,
  DashboardAnalytics,
  DatabaseHealth,
} from '../types';

const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('lumen_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('lumen_token', token);
    } else {
      localStorage.removeItem('lumen_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({ error: 'Invalid response from server' }));

    if (!res.ok) {
      const errorMessage = data.error || `HTTP ${res.status}: Failed request`;
      throw new Error(errorMessage);
    }

    return data as T;
  }

  // --- HEALTH ---
  public async getHealth(): Promise<{ status: string; hasGeminiKey: boolean; service: string }> {
    return this.request('/health');
  }

  public async getDbHealth(): Promise<{ success: boolean; health: DatabaseHealth }> {
    return this.request('/health/db');
  }

  // --- AUTH ---
  public async register(payload: {
    email: string;
    password: string;
    name: string;
    title?: string;
    targetRole?: string;
  }): Promise<{ success: boolean; token: string; user: User }> {
    const res = await this.request<{ success: boolean; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    return res;
  }

  public async login(payload: {
    email: string;
    password: string;
  }): Promise<{ success: boolean; token: string; user: User }> {
    const res = await this.request<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(res.token);
    return res;
  }

  // --- PROFILE ---
  public async getProfile(): Promise<{ success: boolean; user: User }> {
    return this.request('/profile');
  }

  public async updateProfile(payload: {
    name?: string;
    title?: string;
    targetRole?: string;
  }): Promise<{ success: boolean; user: User }> {
    return this.request('/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // --- RESUMES ---
  public async getResumes(): Promise<{ success: boolean; resumes: ResumeProfile[] }> {
    return this.request('/resumes');
  }

  public async uploadResume(file: File): Promise<{ success: boolean; resume: ResumeProfile }> {
    const formData = new FormData();
    formData.append('resume', file);
    return this.request('/resumes', {
      method: 'POST',
      body: formData,
    });
  }

  public async deleteResume(id: number): Promise<{ success: boolean }> {
    return this.request(`/resumes/${id}`, {
      method: 'DELETE',
    });
  }

  // --- INTERVIEWS ---
  public async createInterview(payload: {
    roleTitle: string;
    difficulty: string;
    interviewType: string;
    questionCount: number;
    resumeId?: number | null;
    companyTrack?: string;
    jobDescription?: string;
    timeLimitMinutes?: number;
  }): Promise<{ success: boolean; interview: Interview; questions: Question[]; isFallback: boolean }> {
    return this.request('/interviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getInterviews(params?: { status?: string; search?: string }): Promise<{
    success: boolean;
    interviews: Interview[];
  }> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/interviews${qs}`);
  }

  public async getInterviewById(id: number): Promise<{
    success: boolean;
    interview: Interview;
    questions: Question[];
    answers: Answer[];
    result: InterviewResult | null;
  }> {
    return this.request(`/interviews/${id}`);
  }

  public async saveAnswer(
    interviewId: number,
    questionId: number,
    answerText: string,
    extra?: {
      timeSpentSeconds?: number;
      codeSnippet?: string;
      codeLanguage?: string;
    }
  ): Promise<{ success: boolean; answer: Answer }> {
    return this.request(`/interviews/${interviewId}/answers`, {
      method: 'POST',
      body: JSON.stringify({
        questionId,
        answerText,
        timeSpentSeconds: extra?.timeSpentSeconds,
        codeSnippet: extra?.codeSnippet,
        codeLanguage: extra?.codeLanguage,
      }),
    });
  }

  public async completeInterview(
    interviewId: number
  ): Promise<{ success: boolean; result: InterviewResult }> {
    return this.request(`/interviews/${interviewId}/complete`, {
      method: 'POST',
    });
  }

  public async getInterviewResults(interviewId: number): Promise<{
    success: boolean;
    interview: Interview;
    result: InterviewResult;
    questions: Question[];
    answers: Answer[];
  }> {
    return this.request(`/interviews/${interviewId}/results`);
  }

  // --- ANALYTICS ---
  public async getAnalytics(): Promise<{ success: boolean; analytics: DashboardAnalytics }> {
    return this.request('/analytics');
  }
}

export const api = new ApiClient();
