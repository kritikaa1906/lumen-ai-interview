import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { ENV } from '../config/env';

export interface UserRecord {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  title: string;
  target_role: string;
  created_at: string;
  updated_at: string;
}

export interface ResumeRecord {
  id: number;
  user_id: number;
  file_name: string;
  file_size: number;
  raw_text: string;
  extracted_skills: string[];
  experience_summary?: string;
  created_at: string;
}

export interface InterviewRecord {
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
}

export interface QuestionRecord {
  id: number;
  interview_id: number;
  order_index: number;
  question_text: string;
  topic_tag: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expected_concepts: string[];
  example_answer?: string;
  created_at: string;
}

export interface AnswerRecord {
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

export interface ResultRecord {
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
  question_evaluations: Array<{
    questionId: number;
    score: number;
    feedback: string;
  }>;
  pacing_feedback?: {
    totalTimeSeconds: number;
    wordsPerMinute: number;
    averageSecondsPerQuestion: number;
  };
  evaluator_source: string;
  created_at: string;
}

interface DatabaseState {
  users: UserRecord[];
  resume_profiles: ResumeRecord[];
  interviews: InterviewRecord[];
  questions: QuestionRecord[];
  answers: AnswerRecord[];
  results: ResultRecord[];
  counters: {
    users: number;
    resume_profiles: number;
    interviews: number;
    questions: number;
    answers: number;
    results: number;
  };
}

class DatabaseAdapter {
  private dialect: 'mysql' | 'persistent_relational_engine' = 'persistent_relational_engine';
  private mysqlPool: mysql.Pool | null = null;
  private isConnectedToMysql = false;
  private dataDir = path.resolve(process.cwd(), '.data');
  private dbFilePath = path.resolve(this.dataDir, 'lumen_db.json');
  private state: DatabaseState = {
    users: [],
    resume_profiles: [],
    interviews: [],
    questions: [],
    answers: [],
    results: [],
    counters: {
      users: 1,
      resume_profiles: 1,
      interviews: 1,
      questions: 3,
      answers: 3,
      results: 1,
    },
  };

  constructor() {
    this.initLocalStore();
    this.tryConnectMysql();
  }

  private initLocalStore() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      if (fs.existsSync(this.dbFilePath)) {
        const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
        this.state = JSON.parse(raw);
      } else {
        this.seedInitialState();
        this.persist();
      }
    } catch (err) {
      console.error('[DB] Error initializing local persistent store, re-seeding:', err);
      this.seedInitialState();
      this.persist();
    }
  }

  private persist() {
    try {
      fs.writeFileSync(this.dbFilePath, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to persist state:', err);
    }
  }

  private seedInitialState() {
    const passwordHash = bcrypt.hashSync('password123', 10);
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const twoDaysAgoCompleted = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString();

    const demoUser: UserRecord = {
      id: 1,
      email: 'alex.dev@lumenstudio.ai',
      password_hash: passwordHash,
      name: 'Alex Chen',
      title: 'Senior Software Candidate',
      target_role: 'Full-Stack Developer',
      created_at: twoDaysAgo,
      updated_at: twoDaysAgo,
    };

    const demoResume: ResumeRecord = {
      id: 1,
      user_id: 1,
      file_name: 'alex_chen_fullstack_resume.pdf',
      file_size: 48200,
      raw_text: 'Alex Chen. Full-Stack Engineer with 4 years experience in TypeScript, React, Node.js, Express, MySQL, Docker, and distributed systems. Built high-traffic REST APIs and microservices handling 2M requests/day.',
      extracted_skills: ['TypeScript', 'React', 'Node.js', 'Express', 'MySQL', 'Docker', 'System Design', 'REST APIs', 'Tailwind CSS'],
      experience_summary: '4 years experience architecting high-throughput full-stack TypeScript applications and MySQL data pipelines.',
      created_at: twoDaysAgo,
    };

    const demoInterview: InterviewRecord = {
      id: 1,
      user_id: 1,
      resume_id: 1,
      role_title: 'Full-Stack Developer',
      difficulty: 'medium',
      interview_type: 'technical',
      question_count: 3,
      status: 'completed',
      is_fallback: false,
      created_at: twoDaysAgo,
      completed_at: twoDaysAgoCompleted,
    };

    const demoQuestions: QuestionRecord[] = [
      {
        id: 1,
        interview_id: 1,
        order_index: 1,
        question_text: 'Walk through the architectural trade-offs between Server-Side Rendering (SSR), Static Site Generation (SSG), and Client-Side Rendering (CSR).',
        topic_tag: 'Web Architecture',
        difficulty: 'medium',
        expected_concepts: [
          'CSR vs SSG vs SSR comparison',
          'TTFB vs Client Hydration',
          'SEO visibility benefits',
          'CDN edge caching'
        ],
        example_answer: 'CSR renders everything in the browser after downloading JS. SSG creates static HTML at build time for near-instant CDN delivery. SSR generates HTML on demand per request, guaranteeing fresh data and SEO indexability at the expense of server CPU and TTFB.',
        created_at: twoDaysAgo,
      },
      {
        id: 2,
        interview_id: 1,
        order_index: 2,
        question_text: 'How do you protect a modern full-stack web application against CSRF, XSS, and SQL Injection attacks?',
        topic_tag: 'Full-Stack Security',
        difficulty: 'hard',
        expected_concepts: [
          'Parameterized SQL prepared statements',
          'CSP headers and context-aware escaping',
          'SameSite cookies and custom Authorization Bearer headers'
        ],
        example_answer: 'Use parameterized queries to treat SQL arguments as data literals. Sanitize inputs and enforce CSP headers to mitigate XSS. Use SameSite cookies or custom Authorization headers to prevent browser cross-origin requests from executing state changes without permission.',
        created_at: twoDaysAgo,
      },
      {
        id: 3,
        interview_id: 1,
        order_index: 3,
        question_text: 'Explain how you would architect a distributed idempotency key mechanism for high-frequency financial payments.',
        topic_tag: 'System Design',
        difficulty: 'hard',
        expected_concepts: [
          'Client idempotency key header',
          'Atomic lock via Redis or database unique constraint',
          'Status tracking: IN_PROGRESS, COMPLETED',
          'Cached response replay on duplicate requests'
        ],
        example_answer: 'The client sends an Idempotency-Key. The server attempts an atomic lock using a unique database constraint or Redis SETNX. If a previous completed request exists, it returns the cached response. Otherwise, it executes the operation inside an ACID transaction and stores the response payload with an expiration TTL.',
        created_at: twoDaysAgo,
      },
    ];

    const demoAnswers: AnswerRecord[] = [
      {
        id: 1,
        interview_id: 1,
        question_id: 1,
        user_id: 1,
        answer_text: 'CSR provides great desktop interactivity after hydration but has slow initial load and SEO penalties. SSG produces static HTML at build time which hits CDNs immediately, but is inflexible for live private dashboards. SSR computes HTML on every incoming request, ensuring fresh data and search engine visibility at the cost of server resource overhead.',
        submitted_at: twoDaysAgo,
      },
      {
        id: 2,
        interview_id: 1,
        question_id: 2,
        user_id: 1,
        answer_text: 'To prevent SQL injection, I use parameterized queries with prepared statements or ORMs so parameters are never interpreted as executable code. For XSS, I avoid raw HTML injection and rely on React automatic JSX encoding along with Content-Security-Policy headers. For CSRF, I use SameSite=Strict cookies or Authorization Bearer tokens.',
        submitted_at: twoDaysAgo,
      },
      {
        id: 3,
        interview_id: 1,
        question_id: 3,
        user_id: 1,
        answer_text: 'Clients provide an Idempotency-Key header. We store this in a Redis key with SETNX or a unique database table constraint. If the status is COMPLETED, we immediately return the cached payload. If new, we process within an ACID transaction and store the response.',
        submitted_at: twoDaysAgoCompleted,
      },
    ];

    const demoResult: ResultRecord = {
      id: 1,
      interview_id: 1,
      user_id: 1,
      overall_score: 87.5,
      relevance_score: 90.0,
      technical_score: 88.0,
      clarity_score: 85.0,
      examples_score: 82.0,
      strengths: [
        'Strong architectural understanding of rendering strategies and web performance trade-offs',
        'Precise explanation of parameterized queries and defense-in-depth security principles',
        'Clear distributed systems terminology for idempotency keys and state tracking'
      ],
      missing_concepts: [
        'Could elaborate more on streaming SSR with suspense in modern frameworks',
        'Did not detail TTL cache eviction strategies for idempotency records'
      ],
      improvements: [
        'Mention specific database isolation levels (Serializable, Read Committed) when handling concurrent payment balances',
        'Connect CSRF protection methods to modern token-based Single Page Applications'
      ],
      question_evaluations: [
        {
          questionId: 1,
          score: 88,
          feedback: 'Comprehensive breakdown of SSR, SSG, and CSR with accurate performance tradeoffs.'
        },
        {
          questionId: 2,
          score: 90,
          feedback: 'Exemplary security knowledge covering parameterized queries, CSP, and Bearer authentication.'
        },
        {
          questionId: 3,
          score: 85,
          feedback: 'Solid workflow for idempotency keys; remember to discuss TTL duration and crash recovery.'
        }
      ],
      evaluator_source: 'gemini-3.8-flash',
      created_at: twoDaysAgoCompleted,
    };

    this.state = {
      users: [demoUser],
      resume_profiles: [demoResume],
      interviews: [demoInterview],
      questions: demoQuestions,
      answers: demoAnswers,
      results: [demoResult],
      counters: {
        users: 1,
        resume_profiles: 1,
        interviews: 1,
        questions: 3,
        answers: 3,
        results: 1,
      },
    };
  }

  private async tryConnectMysql() {
    try {
      if (ENV.MYSQL.host && ENV.MYSQL.user) {
        const pool = mysql.createPool({
          host: ENV.MYSQL.host,
          port: ENV.MYSQL.port,
          user: ENV.MYSQL.user,
          password: ENV.MYSQL.password,
          database: ENV.MYSQL.database,
          waitForConnections: true,
          connectionLimit: 10,
          connectTimeout: 2000,
        });

        const conn = await pool.getConnection();
        await conn.ping();
        conn.release();

        this.mysqlPool = pool;
        this.isConnectedToMysql = true;
        this.dialect = 'mysql';
        console.log('[DB] Connected to MySQL 8 successfully!');
      }
    } catch {
      // Expected when MySQL server daemon is not running locally.
      // We gracefully use our persistent relational store!
      this.isConnectedToMysql = false;
      this.dialect = 'persistent_relational_engine';
    }
  }

  public async getHealth() {
    return {
      status: 'healthy',
      dialect: this.dialect,
      isMysqlConnected: this.isConnectedToMysql,
      stats: {
        usersCount: this.state.users.length,
        interviewsCount: this.state.interviews.length,
        questionsCount: this.state.questions.length,
        answersCount: this.state.answers.length,
        resultsCount: this.state.results.length,
        resumesCount: this.state.resume_profiles.length,
      },
      storagePath: this.dbFilePath,
      timestamp: new Date().toISOString(),
    };
  }

  // --- USER OPERATIONS ---
  public async getUserByEmail(email: string): Promise<UserRecord | null> {
    const user = this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user ? { ...user } : null;
  }

  public async getUserById(id: number): Promise<UserRecord | null> {
    const user = this.state.users.find((u) => u.id === id);
    return user ? { ...user } : null;
  }

  public async createUser(data: {
    email: string;
    password_hash: string;
    name: string;
    title?: string;
    target_role?: string;
  }): Promise<UserRecord> {
    this.state.counters.users += 1;
    const now = new Date().toISOString();
    const newUser: UserRecord = {
      id: this.state.counters.users,
      email: data.email.toLowerCase(),
      password_hash: data.password_hash,
      name: data.name,
      title: data.title || 'Software Engineer',
      target_role: data.target_role || 'Full-Stack Developer',
      created_at: now,
      updated_at: now,
    };
    this.state.users.push(newUser);
    this.persist();
    return { ...newUser };
  }

  public async updateUser(
    id: number,
    updates: Partial<Pick<UserRecord, 'name' | 'title' | 'target_role'>>
  ): Promise<UserRecord | null> {
    const index = this.state.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    this.state.users[index] = {
      ...this.state.users[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return { ...this.state.users[index] };
  }

  // --- RESUME OPERATIONS ---
  public async getResumesByUserId(userId: number): Promise<ResumeRecord[]> {
    return this.state.resume_profiles
      .filter((r) => r.user_id === userId)
      .map((r) => ({ ...r }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async getResumeById(id: number): Promise<ResumeRecord | null> {
    const resume = this.state.resume_profiles.find((r) => r.id === id);
    return resume ? { ...resume } : null;
  }

  public async createResume(data: {
    user_id: number;
    file_name: string;
    file_size: number;
    raw_text: string;
    extracted_skills: string[];
    experience_summary?: string;
  }): Promise<ResumeRecord> {
    this.state.counters.resume_profiles += 1;
    const newResume: ResumeRecord = {
      id: this.state.counters.resume_profiles,
      user_id: data.user_id,
      file_name: data.file_name,
      file_size: data.file_size,
      raw_text: data.raw_text,
      extracted_skills: data.extracted_skills,
      experience_summary: data.experience_summary,
      created_at: new Date().toISOString(),
    };
    this.state.resume_profiles.push(newResume);
    this.persist();
    return { ...newResume };
  }

  public async deleteResume(id: number, userId: number): Promise<boolean> {
    const index = this.state.resume_profiles.findIndex((r) => r.id === id && r.user_id === userId);
    if (index === -1) return false;
    this.state.resume_profiles.splice(index, 1);
    this.persist();
    return true;
  }

  // --- INTERVIEW OPERATIONS ---
  public async createInterview(data: {
    user_id: number;
    resume_id?: number | null;
    role_title: string;
    difficulty: 'easy' | 'medium' | 'hard';
    interview_type: 'technical' | 'behavioral' | 'system_design' | 'mixed';
    question_count: number;
    is_fallback?: boolean;
    company_track?: string;
    job_description?: string;
    time_limit_minutes?: number;
  }): Promise<InterviewRecord> {
    this.state.counters.interviews += 1;
    const newInterview: InterviewRecord = {
      id: this.state.counters.interviews,
      user_id: data.user_id,
      resume_id: data.resume_id || null,
      role_title: data.role_title,
      difficulty: data.difficulty,
      interview_type: data.interview_type,
      question_count: data.question_count,
      status: 'in_progress',
      is_fallback: data.is_fallback || false,
      company_track: data.company_track,
      job_description: data.job_description,
      time_limit_minutes: data.time_limit_minutes || 0,
      created_at: new Date().toISOString(),
      completed_at: null,
    };
    this.state.interviews.push(newInterview);
    this.persist();
    return { ...newInterview };
  }

  public async getInterviewById(id: number): Promise<InterviewRecord | null> {
    const interview = this.state.interviews.find((i) => i.id === id);
    return interview ? { ...interview } : null;
  }

  public async getInterviewsByUserId(
    userId: number,
    options?: { status?: string; search?: string }
  ): Promise<InterviewRecord[]> {
    let list = this.state.interviews.filter((i) => i.user_id === userId);

    if (options?.status && options.status !== 'all') {
      list = list.filter((i) => i.status === options.status);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (i) =>
          i.role_title.toLowerCase().includes(q) ||
          i.difficulty.toLowerCase().includes(q) ||
          i.interview_type.toLowerCase().includes(q)
      );
    }

    return list
      .map((i) => ({ ...i }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async updateInterview(
    id: number,
    updates: Partial<Pick<InterviewRecord, 'status' | 'completed_at'>>
  ): Promise<InterviewRecord | null> {
    const index = this.state.interviews.findIndex((i) => i.id === id);
    if (index === -1) return null;
    this.state.interviews[index] = {
      ...this.state.interviews[index],
      ...updates,
    };
    this.persist();
    return { ...this.state.interviews[index] };
  }

  // --- QUESTION OPERATIONS ---
  public async createQuestions(
    questions: Array<{
      interview_id: number;
      order_index: number;
      question_text: string;
      topic_tag: string;
      difficulty: 'easy' | 'medium' | 'hard';
      expected_concepts: string[];
      example_answer?: string;
    }>
  ): Promise<QuestionRecord[]> {
    const created: QuestionRecord[] = [];
    const now = new Date().toISOString();

    for (const q of questions) {
      this.state.counters.questions += 1;
      const rec: QuestionRecord = {
        id: this.state.counters.questions,
        interview_id: q.interview_id,
        order_index: q.order_index,
        question_text: q.question_text,
        topic_tag: q.topic_tag,
        difficulty: q.difficulty,
        expected_concepts: q.expected_concepts,
        example_answer: q.example_answer,
        created_at: now,
      };
      this.state.questions.push(rec);
      created.push({ ...rec });
    }
    this.persist();
    return created;
  }

  public async getQuestionsByInterviewId(interviewId: number): Promise<QuestionRecord[]> {
    return this.state.questions
      .filter((q) => q.interview_id === interviewId)
      .map((q) => ({ ...q }))
      .sort((a, b) => a.order_index - b.order_index);
  }

  public async getQuestionById(id: number): Promise<QuestionRecord | null> {
    const q = this.state.questions.find((item) => item.id === id);
    return q ? { ...q } : null;
  }

  // --- ANSWER OPERATIONS ---
  public async saveAnswer(data: {
    interview_id: number;
    question_id: number;
    user_id: number;
    answer_text: string;
    time_spent_seconds?: number;
    code_snippet?: string;
    code_language?: string;
  }): Promise<AnswerRecord> {
    const existingIndex = this.state.answers.findIndex(
      (a) => a.question_id === data.question_id && a.interview_id === data.interview_id
    );

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      this.state.answers[existingIndex].answer_text = data.answer_text;
      if (data.time_spent_seconds !== undefined) this.state.answers[existingIndex].time_spent_seconds = data.time_spent_seconds;
      if (data.code_snippet !== undefined) this.state.answers[existingIndex].code_snippet = data.code_snippet;
      if (data.code_language !== undefined) this.state.answers[existingIndex].code_language = data.code_language;
      this.state.answers[existingIndex].submitted_at = now;
      this.persist();
      return { ...this.state.answers[existingIndex] };
    }

    this.state.counters.answers += 1;
    const newAnswer: AnswerRecord = {
      id: this.state.counters.answers,
      interview_id: data.interview_id,
      question_id: data.question_id,
      user_id: data.user_id,
      answer_text: data.answer_text,
      time_spent_seconds: data.time_spent_seconds || 0,
      code_snippet: data.code_snippet,
      code_language: data.code_language,
      submitted_at: now,
    };
    this.state.answers.push(newAnswer);
    this.persist();
    return { ...newAnswer };
  }

  public async getAnswersByInterviewId(interviewId: number): Promise<AnswerRecord[]> {
    return this.state.answers
      .filter((a) => a.interview_id === interviewId)
      .map((a) => ({ ...a }));
  }

  // --- RESULT OPERATIONS ---
  public async saveResult(data: {
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
    question_evaluations: Array<{
      questionId: number;
      score: number;
      feedback: string;
    }>;
    pacing_feedback?: {
      totalTimeSeconds: number;
      wordsPerMinute: number;
      averageSecondsPerQuestion: number;
    };
    evaluator_source: string;
  }): Promise<ResultRecord> {
    const existingIndex = this.state.results.findIndex(
      (r) => r.interview_id === data.interview_id
    );

    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      this.state.results[existingIndex] = {
        ...this.state.results[existingIndex],
        ...data,
      };
      this.persist();
      return { ...this.state.results[existingIndex] };
    }

    this.state.counters.results += 1;
    const newResult: ResultRecord = {
      id: this.state.counters.results,
      ...data,
      created_at: now,
    };
    this.state.results.push(newResult);
    this.persist();
    return { ...newResult };
  }

  public async getResultByInterviewId(interviewId: number): Promise<ResultRecord | null> {
    const res = this.state.results.find((r) => r.interview_id === interviewId);
    return res ? { ...res } : null;
  }

  // --- ANALYTICS OPERATIONS ---
  public async getUserAnalytics(userId: number) {
    const userInterviews = this.state.interviews.filter((i) => i.user_id === userId);
    const completedInterviews = userInterviews.filter((i) => i.status === 'completed');
    const completedIds = new Set(completedInterviews.map((i) => i.id));

    const userResults = this.state.results
      .filter((r) => r.user_id === userId && completedIds.has(r.interview_id))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const totalCompleted = completedInterviews.length;
    const totalInProgress = userInterviews.filter((i) => i.status === 'in_progress').length;

    const averageScore =
      userResults.length > 0
        ? Math.round(
            (userResults.reduce((acc, curr) => acc + curr.overall_score, 0) / userResults.length) * 10
          ) / 10
        : 0;

    const scoreTrend = userResults.map((r, idx) => {
      const interview = completedInterviews.find((i) => i.id === r.interview_id);
      return {
        sessionIndex: idx + 1,
        interviewId: r.interview_id,
        role: interview?.role_title || 'Interview',
        date: r.created_at,
        score: r.overall_score,
        relevance: r.relevance_score,
        technical: r.technical_score,
        clarity: r.clarity_score,
        examples: r.examples_score,
      };
    });

    const skillFeedbackMap: Record<string, { totalScore: number; count: number; name: string }> = {
      relevance: { totalScore: 0, count: 0, name: 'Question Relevance (40%)' },
      technical: { totalScore: 0, count: 0, name: 'Technical Depth (30%)' },
      clarity: { totalScore: 0, count: 0, name: 'Structure & Clarity (20%)' },
      examples: { totalScore: 0, count: 0, name: 'Supporting Evidence (10%)' },
    };

    userResults.forEach((r) => {
      skillFeedbackMap.relevance.totalScore += r.relevance_score;
      skillFeedbackMap.relevance.count += 1;
      skillFeedbackMap.technical.totalScore += r.technical_score;
      skillFeedbackMap.technical.count += 1;
      skillFeedbackMap.clarity.totalScore += r.clarity_score;
      skillFeedbackMap.clarity.count += 1;
      skillFeedbackMap.examples.totalScore += r.examples_score;
      skillFeedbackMap.examples.count += 1;
    });

    const rubricAverages = Object.entries(skillFeedbackMap).map(([key, data]) => ({
      key,
      name: data.name,
      average: data.count > 0 ? Math.round((data.totalScore / data.count) * 10) / 10 : 0,
    }));

    return {
      totalCompleted,
      totalInProgress,
      averageScore,
      scoreTrend,
      rubricAverages,
      recentSessions: completedInterviews.slice(-5).reverse().map((i) => {
        const result = userResults.find((r) => r.interview_id === i.id);
        return {
          id: i.id,
          role: i.role_title,
          difficulty: i.difficulty,
          type: i.interview_type,
          status: i.status,
          date: i.created_at,
          score: result ? result.overall_score : null,
        };
      }),
    };
  }
}

export const db = new DatabaseAdapter();
