export interface User {
  id: number;
  email: string;
  name: string;
  title: string;
  targetRole: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResumeProfile {
  id: number;
  user_id: number;
  file_name: string;
  file_size: number;
  raw_text: string;
  extracted_skills: string[];
  experience_summary?: string;
  created_at: string;
}

export interface Question {
  id: number;
  interview_id: number;
  order_index: number;
  question_text: string;
  topic_tag: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expected_concepts: string[];
  example_answer?: string;
  created_at?: string;
}

export interface Answer {
  id: number;
  interview_id: number;
  question_id: number;
  user_id: number;
  answer_text: string;
  time_spent_seconds?: number;
  code_snippet?: string;
  code_language?: string;
  submitted_at: string;
}

export interface QuestionEvaluation {
  questionId: number;
  score: number;
  feedback: string;
}

export interface InterviewResult {
  id: number;
  interview_id: number;
  user_id: number;
  overall_score: number;
  relevance_score: number;
  technical_score: number;
  clarity_score: number;
  examples_score: number;
  strengths: string[];
  missing_concepts: string[];
  improvements: string[];
  question_evaluations: QuestionEvaluation[];
  pacing_feedback?: {
    totalTimeSeconds: number;
    wordsPerMinute: number;
    averageSecondsPerQuestion: number;
  };
  evaluator_source: string;
  created_at: string;
}

export interface Interview {
  id: number;
  user_id: number;
  resume_id: number | null;
  role_title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  interview_type: 'technical' | 'behavioral' | 'system_design' | 'mixed';
  question_count: number;
  status: 'created' | 'in_progress' | 'completed' | 'abandoned';
  is_fallback: boolean;
  company_track?: string;
  job_description?: string;
  time_limit_minutes?: number;
  created_at: string;
  completed_at: string | null;
  score?: number | null;
}

export interface DashboardAnalytics {
  totalCompleted: number;
  totalInProgress: number;
  averageScore: number;
  scoreTrend: Array<{
    sessionIndex: number;
    interviewId: number;
    role: string;
    date: string;
    score: number;
    relevance: number;
    technical: number;
    clarity: number;
    examples: number;
  }>;
  rubricAverages: Array<{
    key: string;
    name: string;
    average: number;
  }>;
  recentSessions: Array<{
    id: number;
    role: string;
    difficulty: string;
    type: string;
    status: string;
    date: string;
    score: number | null;
  }>;
}

export interface DatabaseHealth {
  status: string;
  dialect: string;
  isMysqlConnected: boolean;
  stats: {
    usersCount: number;
    interviewsCount: number;
    questionsCount: number;
    answersCount: number;
    resultsCount: number;
    resumesCount: number;
  };
  storagePath: string;
  timestamp: string;
}
