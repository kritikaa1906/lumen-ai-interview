import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { db } from '../db';
import { geminiService } from '../services/geminiService';

export async function createInterview(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const {
      roleTitle,
      difficulty = 'medium',
      interviewType = 'technical',
      questionCount = 3,
      resumeId,
      companyTrack,
      jobDescription,
      timeLimitMinutes,
    } = req.body;

    if (!roleTitle || typeof roleTitle !== 'string') {
      return res.status(400).json({ success: false, error: 'A job role title is required.' });
    }

    const count = Math.max(1, Math.min(10, parseInt(questionCount, 10) || 3));

    let resumeSkills: string[] = [];
    let candidateExperience: string | undefined;

    if (resumeId) {
      const resume = await db.getResumeById(parseInt(resumeId, 10));
      if (resume && resume.user_id === userId) {
        resumeSkills = resume.extracted_skills;
        candidateExperience = resume.experience_summary;
      }
    }

    // 1. Generate questions via Gemini or seed pool
    const { questions: generatedQuestions, isFallback } = await geminiService.generateQuestions({
      roleTitle: roleTitle.trim(),
      difficulty: difficulty as any,
      interviewType: interviewType as any,
      count,
      resumeSkills,
      candidateExperience,
      companyTrack: companyTrack?.trim(),
      jobDescription: jobDescription?.trim(),
    });

    // 2. Create Interview in DB
    const interview = await db.createInterview({
      user_id: userId,
      resume_id: resumeId ? parseInt(resumeId, 10) : null,
      role_title: roleTitle.trim(),
      difficulty: difficulty as any,
      interview_type: interviewType as any,
      question_count: generatedQuestions.length,
      is_fallback: isFallback,
      company_track: companyTrack?.trim(),
      job_description: jobDescription?.trim(),
      time_limit_minutes: parseInt(timeLimitMinutes, 10) || 0,
    });

    // 3. Save Questions in DB
    const questionsToInsert = generatedQuestions.map((q, idx) => ({
      interview_id: interview.id,
      order_index: idx + 1,
      question_text: q.questionText,
      topic_tag: q.topicTag,
      difficulty: q.difficulty,
      expected_concepts: q.expectedConcepts,
      example_answer: q.exampleAnswer,
    }));

    const savedQuestions = await db.createQuestions(questionsToInsert);

    return res.status(201).json({
      success: true,
      interview,
      questions: savedQuestions,
      isFallback,
    });
  } catch (err: any) {
    console.error('[InterviewController] createInterview error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create interview session.' });
  }
}

export async function getInterviews(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { status, search } = req.query;

    const list = await db.getInterviewsByUserId(userId, {
      status: status as string,
      search: search as string,
    });

    // Attach results score if completed
    const enriched = await Promise.all(
      list.map(async (item) => {
        const result = item.status === 'completed' ? await db.getResultByInterviewId(item.id) : null;
        return {
          ...item,
          score: result ? result.overall_score : null,
        };
      })
    );

    return res.json({
      success: true,
      interviews: enriched,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve interview history.' });
  }
}

export async function getInterviewById(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid interview ID.' });
    }

    const interview = await db.getInterviewById(id);
    if (!interview || interview.user_id !== req.user!.id) {
      return res.status(404).json({ success: false, error: 'Interview session not found or unauthorized.' });
    }

    const questions = await db.getQuestionsByInterviewId(id);
    const answers = await db.getAnswersByInterviewId(id);
    const result = interview.status === 'completed' ? await db.getResultByInterviewId(id) : null;

    return res.json({
      success: true,
      interview,
      questions,
      answers,
      result,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch interview details.' });
  }
}

export async function updateInterview(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(req.params.id, 10);
    const interview = await db.getInterviewById(id);

    if (!interview || interview.user_id !== req.user!.id) {
      return res.status(404).json({ success: false, error: 'Interview session not found or unauthorized.' });
    }

    const { status } = req.body;
    if (status && ['in_progress', 'completed', 'abandoned'].includes(status)) {
      const updated = await db.updateInterview(id, { status });
      return res.json({ success: true, interview: updated });
    }

    return res.status(400).json({ success: false, error: 'Invalid update parameters.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to update interview.' });
  }
}

export async function saveAnswer(req: AuthRequest, res: Response) {
  try {
    const interviewId = parseInt(req.params.id, 10);
    const { questionId, answerText, timeSpentSeconds, codeSnippet, codeLanguage } = req.body;

    if (isNaN(interviewId) || !questionId) {
      return res.status(400).json({ success: false, error: 'Invalid interview or question identifier.' });
    }

    const interview = await db.getInterviewById(interviewId);
    if (!interview || interview.user_id !== req.user!.id) {
      return res.status(404).json({ success: false, error: 'Interview not found or unauthorized.' });
    }

    const question = await db.getQuestionById(parseInt(questionId, 10));
    if (!question || question.interview_id !== interviewId) {
      return res.status(400).json({ success: false, error: 'Question does not belong to this interview session.' });
    }

    const saved = await db.saveAnswer({
      interview_id: interviewId,
      question_id: parseInt(questionId, 10),
      user_id: req.user!.id,
      answer_text: typeof answerText === 'string' ? answerText : '',
      time_spent_seconds: parseInt(timeSpentSeconds, 10) || 0,
      code_snippet: typeof codeSnippet === 'string' ? codeSnippet : undefined,
      code_language: typeof codeLanguage === 'string' ? codeLanguage : undefined,
    });

    return res.json({
      success: true,
      answer: saved,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to save answer.' });
  }
}

export async function completeInterview(req: AuthRequest, res: Response) {
  try {
    const interviewId = parseInt(req.params.id, 10);
    if (isNaN(interviewId)) {
      return res.status(400).json({ success: false, error: 'Invalid interview ID.' });
    }

    const interview = await db.getInterviewById(interviewId);
    if (!interview || interview.user_id !== req.user!.id) {
      return res.status(404).json({ success: false, error: 'Interview not found or unauthorized.' });
    }

    const questions = await db.getQuestionsByInterviewId(interviewId);
    const answers = await db.getAnswersByInterviewId(interviewId);

    if (answers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please submit at least one answer before completing the interview.',
      });
    }

    // Build QA evaluation payload with code snippets and pacing duration
    const qaPairs = questions.map((q) => {
      const matched = answers.find((a) => a.question_id === q.id);
      let ansCombined = matched?.answer_text || '';
      if (matched?.code_snippet) {
        ansCombined += `\n\n[Candidate Code Submission (${matched.code_language || 'javascript'})]:\n${matched.code_snippet}`;
      }
      return {
        questionId: q.id,
        questionText: q.question_text,
        topicTag: q.topic_tag,
        expectedConcepts: q.expected_concepts,
        answerText: ansCombined || '(Candidate did not provide an answer)',
        timeSpentSeconds: matched?.time_spent_seconds || 60,
      };
    });

    // Run AI / rubric evaluation
    const evaluation = await geminiService.evaluateInterview({
      roleTitle: interview.role_title,
      difficulty: interview.difficulty,
      qaPairs,
    });

    // Save results including pacing feedback
    const result = await db.saveResult({
      interview_id: interviewId,
      user_id: req.user!.id,
      overall_score: evaluation.overallScore,
      relevance_score: evaluation.relevanceScore,
      technical_score: evaluation.technicalScore,
      clarity_score: evaluation.clarityScore,
      examples_score: evaluation.examplesScore,
      strengths: evaluation.strengths,
      missing_concepts: evaluation.missingConcepts,
      improvements: evaluation.improvements,
      question_evaluations: evaluation.questionEvaluations,
      pacing_feedback: evaluation.pacingFeedback,
      evaluator_source: evaluation.evaluatorSource,
    });

    // Mark interview as completed atomically
    const completedAt = new Date().toISOString();
    await db.updateInterview(interviewId, {
      status: 'completed',
      completed_at: completedAt,
    });

    return res.json({
      success: true,
      message: 'Interview evaluated and saved successfully.',
      result,
    });
  } catch (err: any) {
    console.error('[InterviewController] completeInterview error:', err);
    return res.status(500).json({ success: false, error: 'Failed to evaluate interview.' });
  }
}

export async function getResults(req: AuthRequest, res: Response) {
  try {
    const interviewId = parseInt(req.params.id, 10);
    if (isNaN(interviewId)) {
      return res.status(400).json({ success: false, error: 'Invalid interview ID.' });
    }

    const interview = await db.getInterviewById(interviewId);
    if (!interview || interview.user_id !== req.user!.id) {
      return res.status(404).json({ success: false, error: 'Interview not found or unauthorized.' });
    }

    const result = await db.getResultByInterviewId(interviewId);
    if (!result) {
      return res.status(404).json({ success: false, error: 'Results not yet generated for this interview.' });
    }

    const questions = await db.getQuestionsByInterviewId(interviewId);
    const answers = await db.getAnswersByInterviewId(interviewId);

    return res.json({
      success: true,
      interview,
      result,
      questions,
      answers,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to fetch interview results.' });
  }
}
