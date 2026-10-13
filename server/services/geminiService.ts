import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { ENV } from '../config/env';

interface QuestionBlueprint {
  questionText: string;
  topicTag: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedConcepts: string[];
  exampleAnswer?: string;
}

interface EvaluationCriterion {
  name: 'relevance' | 'technical' | 'clarity' | 'examples';
  score: number; // 0 to 100
  evidence: string;
}

export interface EvaluationResult {
  overallScore: number;
  relevanceScore: number;
  technicalScore: number;
  clarityScore: number;
  examplesScore: number;
  strengths: string[];
  missingConcepts: string[];
  improvements: string[];
  questionEvaluations: Array<{
    questionId: number;
    score: number;
    feedback: string;
  }>;
  pacingFeedback?: {
    totalTimeSeconds: number;
    wordsPerMinute: number;
    averageSecondsPerQuestion: number;
  };
  evaluatorSource: string;
}

// Load seed data for deterministic testing and fallback
let seedDataset: Array<{
  role: string;
  difficulty: string;
  category: string;
  questions: Array<{
    id: string;
    questionText: string;
    topicTag: string;
    difficulty: string;
    expectedConcepts: string[];
    exampleAnswer: string;
  }>;
}> = [];

try {
  const seedPath = path.resolve(process.cwd(), 'database', 'seed.json');
  if (fs.existsSync(seedPath)) {
    seedDataset = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  }
} catch (err) {
  console.warn('[GeminiService] Could not load seed.json:', err);
}

function withTimeout<T>(promise: Promise<T>, ms = 3000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`AI generation timed out after ${ms}ms`)), ms)
    ),
  ]);
}

class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (ENV.GEMINI_API_KEY) {
      try {
        this.ai = new GoogleGenAI({
          apiKey: ENV.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      } catch (err) {
        console.error('[GeminiService] Initialization error:', err);
      }
    }
  }

  public hasLiveApiKey(): boolean {
    return Boolean(ENV.GEMINI_API_KEY && this.ai);
  }

  /**
   * Generates tailored interview questions based on role, difficulty, interview type,
   * and optional resume skills.
   */
  public async generateQuestions(params: {
    roleTitle: string;
    difficulty: 'easy' | 'medium' | 'hard';
    interviewType: 'technical' | 'behavioral' | 'system_design' | 'mixed';
    count: number;
    resumeSkills?: string[];
    candidateExperience?: string;
    companyTrack?: string;
    jobDescription?: string;
  }): Promise<{ questions: QuestionBlueprint[]; isFallback: boolean }> {
    if (this.hasLiveApiKey()) {
      try {
        const prompt = `You are a Principal Tech Interviewer and Staff Bar Raiser.
Generate exactly ${params.count} high-caliber interview questions for a candidate interviewing for:
Role: ${params.roleTitle}
Difficulty: ${params.difficulty}
Interview Focus: ${params.interviewType}
${params.companyTrack ? `Target Company Standard / Culture Track: ${params.companyTrack}` : ''}
${params.jobDescription ? `Target Job Description Requirements: ${params.jobDescription.slice(0, 1000)}` : ''}
${params.resumeSkills?.length ? `Candidate Verified Resume Skills: ${params.resumeSkills.join(', ')}` : ''}
${params.candidateExperience ? `Candidate Background: ${params.candidateExperience}` : ''}

CRITICAL RULES:
1. Make questions authentic, deep, and grounded in real software engineering challenges (avoid generic trivia).
${params.companyTrack ? `2. Incorporate specific interviewing nuances of ${params.companyTrack} (e.g. system design trade-offs, scalability, or customer obsession / STAR principles).` : ''}
3. For each question, supply:
   - "questionText": Clear, professional phrasing.
   - "topicTag": Concise engineering topic (e.g., "Memory Management", "Concurrency", "Cache Invalidation").
   - "difficulty": "${params.difficulty}".
   - "expectedConcepts": Array of 3 to 5 key principles a strong candidate must hit.
   - "exampleAnswer": A model 2-3 sentence answer showcasing top-tier understanding.

Return ONLY a valid JSON array of objects with the exact keys:
[
  {
    "questionText": "string",
    "topicTag": "string",
    "difficulty": "${params.difficulty}",
    "expectedConcepts": ["concept 1", "concept 2", "concept 3"],
    "exampleAnswer": "string"
  }
]`;

        const response = await withTimeout(
          this.ai!.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.4,
            },
          })
        );

        const text = response.text?.trim() || '';
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const validated: QuestionBlueprint[] = parsed.slice(0, params.count).map((item) => ({
            questionText: item.questionText || 'Explain your technical approach.',
            topicTag: item.topicTag || params.roleTitle,
            difficulty: params.difficulty,
            expectedConcepts: Array.isArray(item.expectedConcepts) ? item.expectedConcepts : ['Core understanding'],
            exampleAnswer: item.exampleAnswer || '',
          }));

          return { questions: validated, isFallback: false };
        }
      } catch (err) {
        console.warn('[GeminiService] Question generation error, falling back to curated seed pool:', err);
      }
    }

    // Fallback using curated seed pool
    const matchedCategory = seedDataset.find(
      (c) => c.role.toLowerCase() === params.roleTitle.toLowerCase()
    ) || seedDataset[0];

    const questions: QuestionBlueprint[] = [];
    if (matchedCategory && matchedCategory.questions.length > 0) {
      let pool = [...matchedCategory.questions];
      while (questions.length < params.count && pool.length > 0) {
        const q = pool.shift()!;
        questions.push({
          questionText: q.questionText,
          topicTag: q.topicTag,
          difficulty: params.difficulty,
          expectedConcepts: q.expectedConcepts,
          exampleAnswer: q.exampleAnswer,
        });
      }
    }

    // If still need more, add standard questions
    while (questions.length < params.count) {
      const idx = questions.length + 1;
      questions.push({
        questionText: `In your role as ${params.roleTitle}, describe an incident where a production system degraded. How did you isolate root causes and safeguard data integrity?`,
        topicTag: 'Production Reliability',
        difficulty: params.difficulty,
        expectedConcepts: [
          'Observability and metrics (logs, traces, latency percentiles)',
          'Root cause isolation under incident pressure',
          'Post-mortem prevention and regression testing'
        ],
        exampleAnswer: 'I checked telemetry dashboards (P99 latency, error rates), identified connection pool exhaustion, rolled back the suspect release, and implemented circuit breakers and connection throttling.',
      });
    }

    return { questions, isFallback: true };
  }

  /**
   * Evaluates submitted answers against questions and expected criteria using Gemini
   * or a deterministic rubric evaluator.
   */
  public async evaluateInterview(params: {
    roleTitle: string;
    difficulty: string;
    qaPairs: Array<{
      questionId: number;
      questionText: string;
      topicTag: string;
      expectedConcepts: string[];
      answerText: string;
    }>;
  }): Promise<EvaluationResult> {
    if (this.hasLiveApiKey()) {
      try {
        const prompt = `You are a Principal Technical Interviewer evaluating a candidate's completed mock interview session for:
Target Role: ${params.roleTitle}
Target Difficulty: ${params.difficulty}

Here are the questions and the candidate's submitted answers:
${JSON.stringify(params.qaPairs, null, 2)}

EVALUATION RUBRIC & SCORING WEIGHTS:
- Relevance (40% weight): Does the answer directly address the question without dodging? (0 to 100)
- Technical Accuracy (30% weight): Are architectural concepts, algorithms, APIs, and tradeoffs correct? (0 to 100)
- Structure and Clarity (20% weight): Is the answer organized, articulate, and well-structured? (0 to 100)
- Supporting Evidence & Examples (10% weight): Did the candidate cite practical trade-offs, real-world examples, or edge cases? (0 to 100)

Return a single JSON object with EXACTLY this structure:
{
  "relevanceScore": number (0-100),
  "technicalScore": number (0-100),
  "clarityScore": number (0-100),
  "examplesScore": number (0-100),
  "strengths": ["bullet point 1", "bullet point 2", "bullet point 3"],
  "missingConcepts": ["bullet point 1", "bullet point 2"],
  "improvements": ["concrete action item 1", "concrete action item 2"],
  "questionEvaluations": [
    {
      "questionId": number,
      "score": number (0-100),
      "feedback": "2-3 sentences of feedback with specific positive points and gaps"
    }
  ]
}`;

        const response = await withTimeout(
          this.ai!.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          })
        );

        const text = response.text?.trim() || '';
        const parsed = JSON.parse(text);

        // Calculate weighted score deterministically on the backend
        const relevance = Math.max(0, Math.min(100, Number(parsed.relevanceScore) || 75));
        const technical = Math.max(0, Math.min(100, Number(parsed.technicalScore) || 75));
        const clarity = Math.max(0, Math.min(100, Number(parsed.clarityScore) || 75));
        const examples = Math.max(0, Math.min(100, Number(parsed.examplesScore) || 75));

        const overallScore = Math.round(
          (relevance * 0.40 + technical * 0.30 + clarity * 0.20 + examples * 0.10) * 10
        ) / 10;

        return {
          overallScore,
          relevanceScore: relevance,
          technicalScore: technical,
          clarityScore: clarity,
          examplesScore: examples,
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Solid fundamental knowledge'],
          missingConcepts: Array.isArray(parsed.missingConcepts) ? parsed.missingConcepts : ['Edge-case analysis'],
          improvements: Array.isArray(parsed.improvements) ? parsed.improvements : ['Provide concrete metrics'],
          questionEvaluations: Array.isArray(parsed.questionEvaluations)
            ? parsed.questionEvaluations
            : params.qaPairs.map((qa) => ({
                questionId: qa.questionId,
                score: 80,
                feedback: 'Good overview of the required concepts.',
              })),
          pacingFeedback: {
            totalTimeSeconds: params.qaPairs.reduce((acc: number, qa: any) => acc + (qa.timeSpentSeconds || 75), 0),
            wordsPerMinute: Math.max(35, Math.min(180, Math.round(
              (params.qaPairs.reduce((acc: number, qa: any) => acc + (qa.answerText ? qa.answerText.trim().split(/\s+/).length : 0), 0) /
              Math.max(1, params.qaPairs.reduce((acc: number, qa: any) => acc + (qa.timeSpentSeconds || 75), 0) / 60))
            ))),
            averageSecondsPerQuestion: Math.round(
              params.qaPairs.reduce((acc: number, qa: any) => acc + (qa.timeSpentSeconds || 75), 0) / (params.qaPairs.length || 1)
            ),
          },
          evaluatorSource: 'gemini-3.8-flash',
        };
      } catch (err) {
        console.warn('[GeminiService] Evaluation error, falling back to deterministic rubric:', err);
      }
    }

    // Deterministic fallback evaluator
    return this.fallbackDeterministicEvaluation(params);
  }

  private fallbackDeterministicEvaluation(params: {
    roleTitle: string;
    difficulty: string;
    qaPairs: Array<{
      questionId: number;
      questionText: string;
      topicTag: string;
      expectedConcepts: string[];
      answerText: string;
    }>;
  }): EvaluationResult {
    let totalScore = 0;
    const questionEvaluations: Array<{ questionId: number; score: number; feedback: string }> = [];
    const missingConcepts: string[] = [];
    const strengths: string[] = [];

    params.qaPairs.forEach((qa) => {
      const words = qa.answerText.trim().split(/\s+/).filter(Boolean);
      let qScore = 65; // base score

      if (words.length > 30) qScore += 15;
      if (words.length > 70) qScore += 10;

      // Check matched concepts
      let matchedCount = 0;
      qa.expectedConcepts.forEach((concept) => {
        const keywords = concept.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        const hasMatch = keywords.some((kw) => qa.answerText.toLowerCase().includes(kw));
        if (hasMatch) {
          matchedCount += 1;
        } else {
          missingConcepts.push(`In "${qa.topicTag}": Consider covering "${concept}"`);
        }
      });

      if (matchedCount > 0) {
        qScore += Math.min(10, matchedCount * 4);
      }

      qScore = Math.min(95, Math.max(50, qScore));
      totalScore += qScore;

      strengths.push(`Addressed core parameters for "${qa.topicTag}" with clear technical intent.`);
      questionEvaluations.push({
        questionId: qa.questionId,
        score: qScore,
        feedback:
          words.length < 25
            ? 'Answer is concise but would benefit from architectural depth and trade-off comparisons.'
            : 'Well-reasoned response covering primary requirements. Focus on concrete latency or memory numbers.',
      });
    });

    const averagePerQ = params.qaPairs.length > 0 ? totalScore / params.qaPairs.length : 70;
    const relevance = Math.round(Math.min(96, averagePerQ + 2));
    const technical = Math.round(Math.min(94, averagePerQ - 1));
    const clarity = Math.round(Math.min(95, averagePerQ + 1));
    const examples = Math.round(Math.min(90, averagePerQ - 4));

    const overall = Math.round((relevance * 0.40 + technical * 0.30 + clarity * 0.20 + examples * 0.10) * 10) / 10;

    return {
      overallScore: overall,
      relevanceScore: relevance,
      technicalScore: technical,
      clarityScore: clarity,
      examplesScore: examples,
      strengths: strengths.slice(0, 3),
      missingConcepts: missingConcepts.slice(0, 3),
      improvements: [
        'Frame technical decisions around measurable constraints (throughput, latency, memory footprint).',
        'Incorporate the STAR methodology (Situation, Task, Action, Result) when describing past experience.',
      ],
      questionEvaluations,
      pacingFeedback: {
        totalTimeSeconds: params.qaPairs.reduce((acc: number, qa: any) => acc + (qa.timeSpentSeconds || 80), 0),
        wordsPerMinute: Math.max(35, Math.min(180, Math.round(
          (params.qaPairs.reduce((acc: number, qa: any) => acc + (qa.answerText ? qa.answerText.trim().split(/\s+/).length : 0), 0) /
          Math.max(1, params.qaPairs.reduce((acc: number, qa: any) => acc + (qa.timeSpentSeconds || 80), 0) / 60))
        ))),
        averageSecondsPerQuestion: Math.round(
          params.qaPairs.reduce((acc: number, qa: any) => acc + (qa.timeSpentSeconds || 80), 0) / (params.qaPairs.length || 1)
        ),
      },
      evaluatorSource: 'curated_rubric_fallback',
    };
  }

  /**
   * Extracts technical skills and summary from resume text.
   */
  public async extractSkillsFromResume(rawText: string): Promise<{
    skills: string[];
    experienceSummary: string;
  }> {
    if (this.hasLiveApiKey()) {
      try {
        const prompt = `You are a Technical Recruiter & Staff Engineer.
Extract all relevant technical skills and a 1-sentence career summary from this resume text:

${rawText.slice(0, 4000)}

Return ONLY a JSON object:
{
  "skills": ["Skill1", "Skill2", ...],
  "experienceSummary": "1-sentence summary of candidate background and seniority"
}`;

        const response = await withTimeout(
          this.ai!.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          })
        );

        const parsed = JSON.parse(response.text?.trim() || '{}');
        if (Array.isArray(parsed.skills) && parsed.skills.length > 0) {
          return {
            skills: parsed.skills.slice(0, 15),
            experienceSummary: parsed.experienceSummary || 'Candidate with software engineering experience.',
          };
        }
      } catch (err) {
        console.warn('[GeminiService] Resume skill extraction error, using regex parser:', err);
      }
    }

    // Heuristic skill extraction
    const commonSkills = [
      'React', 'TypeScript', 'JavaScript', 'Node.js', 'Express', 'Python', 'Django',
      'Flask', 'FastAPI', 'Go', 'Rust', 'Java', 'Spring', 'C++', 'SQL', 'PostgreSQL',
      'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
      'CI/CD', 'GraphQL', 'REST', 'Tailwind CSS', 'Next.js', 'Machine Learning',
      'PyTorch', 'TensorFlow', 'Git', 'Kafka', 'Microservices'
    ];

    const foundSkills = commonSkills.filter((skill) => {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(?:^|[^a-zA-Z0-9_])${escaped}(?:$|[^a-zA-Z0-9_])`, 'i').test(rawText);
    });

    return {
      skills: foundSkills.length > 0 ? foundSkills : ['JavaScript', 'Web Development', 'Problem Solving'],
      experienceSummary: 'Engineering candidate with software design and implementation skills.',
    };
  }
}

export const geminiService = new GeminiService();
