import assert from 'assert';
import bcrypt from 'bcryptjs';
import { db } from '../server/db';
import { geminiService } from '../server/services/geminiService';
import { resumeService } from '../server/services/resumeService';

async function runTests() {
  console.log('==================================================');
  console.log('🧪 RUNNING LUMEN AI INTERVIEW AUTOMATED TEST SUITE');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed += 1;
    } catch (err: any) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   Error: ${err.message}`);
      failed += 1;
    }
  }

  // 1. Health & Database Check
  await test('Database health check reports valid status and counters', async () => {
    const health = await db.getHealth();
    assert.strictEqual(health.status, 'healthy');
    assert.ok(health.dialect);
    assert.ok(health.stats.usersCount >= 1);
    assert.ok(health.stats.interviewsCount >= 1);
  });

  // 2. User Registration & Retrieval
  const testEmail = `candidate_${Date.now()}@teststudio.ai`;
  let testUserId = 0;

  await test('User creation and secure bcrypt password hashing', async () => {
    const hash = await bcrypt.hash('secretPassword123', 10);
    const user = await db.createUser({
      email: testEmail,
      password_hash: hash,
      name: 'Jordan Lee',
      title: 'Software Engineer',
      target_role: 'Backend Developer',
    });

    assert.ok(user.id);
    assert.strictEqual(user.email, testEmail);
    testUserId = user.id;

    // Verify retrieval
    const retrieved = await db.getUserByEmail(testEmail);
    assert.ok(retrieved);
    assert.strictEqual(retrieved.id, user.id);

    // Verify password verification
    const isValid = await bcrypt.compare('secretPassword123', retrieved.password_hash);
    assert.strictEqual(isValid, true);

    const isInvalid = await bcrypt.compare('wrongPassword', retrieved.password_hash);
    assert.strictEqual(isInvalid, false);
  });

  // 3. User Profile Update
  await test('User profile update updates target role and timestamps', async () => {
    const updated = await db.updateUser(testUserId, {
      name: 'Jordan Lee, Staff',
      target_role: 'AI/ML Engineer',
    });

    assert.ok(updated);
    assert.strictEqual(updated.name, 'Jordan Lee, Staff');
    assert.strictEqual(updated.target_role, 'AI/ML Engineer');
  });

  // 4. Resume Processing & PDF Magic Bytes
  await test('Resume processing rejects non-PDF files', async () => {
    const fakeBuffer = Buffer.from('This is a plaintext file renamed to resume.pdf');
    let threw = false;
    try {
      await resumeService.processResumeUpload({
        userId: testUserId,
        originalName: 'fake.pdf',
        buffer: fakeBuffer,
        size: fakeBuffer.length,
      });
    } catch {
      threw = true;
    }
    assert.strictEqual(threw, true, 'Must reject files without %PDF- magic bytes');
  });

  await test('Resume processing handles valid PDF buffer and extracts skills', async () => {
    // Construct a minimal valid PDF header
    const samplePdfText = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 72 >>\nstream\nBT /F1 12 Tf 72 712 Td (Jordan Lee TypeScript React Node.js Docker SQL) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000207 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n329\n%%EOF`;
    const buffer = Buffer.from(samplePdfText);

    const resume = await resumeService.processResumeUpload({
      userId: testUserId,
      originalName: 'jordan_resume.pdf',
      buffer,
      size: buffer.length,
    });

    assert.ok(resume.id);
    assert.strictEqual(resume.user_id, testUserId);
    assert.ok(Array.isArray(resume.extracted_skills));
  });

  // 5. Question Generation (Gemini or Curated Fallback)
  let generatedQuestions: any[] = [];
  await test('Question generation produces structured questions with expected concepts', async () => {
    const res = await geminiService.generateQuestions({
      roleTitle: 'Full-Stack Developer',
      difficulty: 'medium',
      interviewType: 'technical',
      count: 3,
      resumeSkills: ['React', 'TypeScript', 'Node.js'],
    });

    assert.ok(res.questions.length >= 3);
    assert.ok(res.questions[0].questionText);
    assert.ok(res.questions[0].topicTag);
    assert.ok(Array.isArray(res.questions[0].expectedConcepts));
    generatedQuestions = res.questions;
  });

  // 6. Interview Persistence in Database
  let testInterviewId = 0;
  await test('Interview creation persists interview session and questions in DB', async () => {
    const interview = await db.createInterview({
      user_id: testUserId,
      role_title: 'Full-Stack Developer',
      difficulty: 'medium',
      interview_type: 'technical',
      question_count: generatedQuestions.length,
    });

    assert.ok(interview.id);
    assert.strictEqual(interview.status, 'in_progress');
    testInterviewId = interview.id;

    const savedQuestions = await db.createQuestions(
      generatedQuestions.map((q, idx) => ({
        interview_id: interview.id,
        order_index: idx + 1,
        question_text: q.questionText,
        topic_tag: q.topicTag,
        difficulty: q.difficulty,
        expected_concepts: q.expectedConcepts,
        example_answer: q.exampleAnswer,
      }))
    );

    assert.strictEqual(savedQuestions.length, generatedQuestions.length);
    assert.strictEqual(savedQuestions[0].interview_id, testInterviewId);
  });

  // 7. Answer Submission & Upsert
  await test('Answer submission saves and updates candidate answers', async () => {
    const questions = await db.getQuestionsByInterviewId(testInterviewId);
    assert.ok(questions.length > 0);

    const q1 = questions[0];
    const ans1 = await db.saveAnswer({
      interview_id: testInterviewId,
      question_id: q1.id,
      user_id: testUserId,
      answer_text: 'I use useMemo for caching expensive computations and useCallback for stable callback references.',
    });

    assert.ok(ans1.id);
    assert.strictEqual(ans1.question_id, q1.id);

    // Test answer update (upsert)
    const ansUpdated = await db.saveAnswer({
      interview_id: testInterviewId,
      question_id: q1.id,
      user_id: testUserId,
      answer_text: 'Updated: I use useMemo for caching computations and useCallback for reference stability.',
    });

    assert.strictEqual(ansUpdated.id, ans1.id, 'Should update existing answer record');
  });

  // 8. Evaluation & Weighted Score Formula
  await test('Weighted rubric evaluation calculation matches 40/30/20/10 formula', async () => {
    const questions = await db.getQuestionsByInterviewId(testInterviewId);
    const answers = await db.getAnswersByInterviewId(testInterviewId);

    const qaPairs = questions.map((q) => {
      const match = answers.find((a) => a.question_id === q.id);
      return {
        questionId: q.id,
        questionText: q.question_text,
        topicTag: q.topic_tag,
        expectedConcepts: q.expected_concepts,
        answerText: match?.answer_text || 'Candidate provided concise reasoning.',
      };
    });

    const evalResult = await geminiService.evaluateInterview({
      roleTitle: 'Full-Stack Developer',
      difficulty: 'medium',
      qaPairs,
    });

    assert.ok(evalResult.overallScore >= 0 && evalResult.overallScore <= 100);
    assert.ok(evalResult.relevanceScore >= 0 && evalResult.relevanceScore <= 100);
    assert.ok(evalResult.technicalScore >= 0 && evalResult.technicalScore <= 100);
    assert.ok(evalResult.clarityScore >= 0 && evalResult.clarityScore <= 100);
    assert.ok(evalResult.examplesScore >= 0 && evalResult.examplesScore <= 100);

    // Verify mathematical rubric formula:
    // (relevance * 0.40) + (technical * 0.30) + (clarity * 0.20) + (examples * 0.10)
    const expectedScore = Math.round(
      (evalResult.relevanceScore * 0.40 +
        evalResult.technicalScore * 0.30 +
        evalResult.clarityScore * 0.20 +
        evalResult.examplesScore * 0.10) * 10
    ) / 10;

    assert.strictEqual(evalResult.overallScore, expectedScore, 'Score must match 40/30/20/10 weighted rubric');

    // Save result to DB
    const savedResult = await db.saveResult({
      interview_id: testInterviewId,
      user_id: testUserId,
      overall_score: evalResult.overallScore,
      relevance_score: evalResult.relevanceScore,
      technical_score: evalResult.technicalScore,
      clarity_score: evalResult.clarityScore,
      examples_score: evalResult.examplesScore,
      strengths: evalResult.strengths,
      missing_concepts: evalResult.missingConcepts,
      improvements: evalResult.improvements,
      question_evaluations: evalResult.questionEvaluations,
      evaluator_source: evalResult.evaluatorSource,
    });

    assert.ok(savedResult.id);
    await db.updateInterview(testInterviewId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  });

  // 9. Analytics Aggregation from DB records
  await test('Analytics service aggregates completed counts and rubric averages from DB', async () => {
    const analytics = await db.getUserAnalytics(testUserId);
    assert.strictEqual(analytics.totalCompleted, 1);
    assert.ok(analytics.averageScore > 0);
    assert.strictEqual(analytics.scoreTrend.length, 1);
    assert.strictEqual(analytics.rubricAverages.length, 4);
    assert.strictEqual(analytics.recentSessions.length, 1);
  });

  // 10. Cross-User Privacy & Isolation
  await test('Cross-user queries isolate user interview records', async () => {
    const user2Interviews = await db.getInterviewsByUserId(99999);
    assert.strictEqual(user2Interviews.length, 0, 'Must not expose another candidate data');
  });

  console.log('\n==================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
