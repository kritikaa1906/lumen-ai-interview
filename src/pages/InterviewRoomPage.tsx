import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Interview, Question, Answer } from '../types';
import { QuestionPanel } from '../components/interview/QuestionPanel';
import { AnswerEditor } from '../components/interview/AnswerEditor';
import { TimerWidget } from '../components/interview/TimerWidget';
import { Modal } from '../components/ui/Modal';
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface InterviewRoomPageProps {
  interviewId: number;
  onFinish: (interviewId: number) => void;
  onExit: () => void;
}

export const InterviewRoomPage: React.FC<InterviewRoomPageProps> = ({
  interviewId,
  onFinish,
  onExit,
}) => {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [codeSnippets, setCodeSnippets] = useState<Record<number, string>>({});
  const [codeLanguages, setCodeLanguages] = useState<Record<number, string>>({});
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingAnswer, setSavingAnswer] = useState<boolean>(false);
  const [savedStatus, setSavedStatus] = useState<boolean>(false);
  const [completing, setCompleting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch session data
  useEffect(() => {
    setLoading(true);
    api
      .getInterviewById(interviewId)
      .then((res) => {
        if (res.success && res.interview) {
          setInterview(res.interview);
          setQuestions(res.questions);

          // Populate existing answers and code snippets
          const answersMap: Record<number, string> = {};
          const codesMap: Record<number, string> = {};
          const langsMap: Record<number, string> = {};
          res.answers.forEach((ans) => {
            answersMap[ans.question_id] = ans.answer_text;
            if (ans.code_snippet) codesMap[ans.question_id] = ans.code_snippet;
            if (ans.code_language) langsMap[ans.question_id] = ans.code_language;
          });
          setAnswers(answersMap);
          setCodeSnippets(codesMap);
          setCodeLanguages(langsMap);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load interview session.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [interviewId]);

  const currentQuestion = questions[currentIndex];

  const handleAnswerChange = (text: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: text,
    }));
    setSavedStatus(false);
  };

  const handleDictateAnswer = (chunk: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: (prev[currentQuestion.id] || '') + chunk,
    }));
    setSavedStatus(false);
  };

  const handleCodeChange = (code: string) => {
    if (!currentQuestion) return;
    setCodeSnippets((prev) => ({
      ...prev,
      [currentQuestion.id]: code,
    }));
    setSavedStatus(false);
  };

  const handleCodeLanguageChange = (lang: string) => {
    if (!currentQuestion) return;
    setCodeLanguages((prev) => ({
      ...prev,
      [currentQuestion.id]: lang,
    }));
  };

  const handleSaveAnswer = async () => {
    if (!currentQuestion) return;
    const text = answers[currentQuestion.id] || '';
    const code = codeSnippets[currentQuestion.id] || '';
    const lang = codeLanguages[currentQuestion.id] || 'typescript';
    setSavingAnswer(true);
    setError(null);

    try {
      await api.saveAnswer(interviewId, currentQuestion.id, text, {
        timeSpentSeconds: elapsedSeconds,
        codeSnippet: code,
        codeLanguage: lang,
      });
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to save answer to MySQL');
    } finally {
      setSavingAnswer(false);
    }
  };

  const handleNext = async () => {
    // Auto-save current answer
    if (currentQuestion && (answers[currentQuestion.id] || codeSnippets[currentQuestion.id])) {
      await handleSaveAnswer();
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = async () => {
    if (currentQuestion && (answers[currentQuestion.id] || codeSnippets[currentQuestion.id])) {
      await handleSaveAnswer();
    }
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleJumpTo = async (index: number) => {
    if (currentQuestion && (answers[currentQuestion.id] || codeSnippets[currentQuestion.id])) {
      await handleSaveAnswer();
    }
    setCurrentIndex(index);
  };

  const handleCompleteInterview = async () => {
    setShowConfirmModal(false);
    setCompleting(true);
    setError(null);

    try {
      // First save current answer if unsaved
      if (currentQuestion && (answers[currentQuestion.id] || codeSnippets[currentQuestion.id])) {
        await api.saveAnswer(
          interviewId,
          currentQuestion.id,
          answers[currentQuestion.id] || '',
          {
            timeSpentSeconds: elapsedSeconds,
            codeSnippet: codeSnippets[currentQuestion.id] || '',
            codeLanguage: codeLanguages[currentQuestion.id] || 'typescript',
          }
        );
      }

      const res = await api.completeInterview(interviewId);
      if (res.success) {
        onFinish(interviewId);
      }
    } catch (err: any) {
      setError(err.message || 'Evaluation failed. Ensure at least one answer has been entered.');
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 space-y-3 text-[#A7B09C]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C6F36B]" />
        <span className="text-xs">Connecting to interview cockpit...</span>
      </div>
    );
  }

  if (error && !interview) {
    return (
      <div className="p-8 max-w-xl mx-auto space-y-4">
        <div className="p-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
        <button
          onClick={onExit}
          className="px-4 py-2 text-xs rounded border border-[#282C24] text-[#A7B09C] hover:text-[#F5F2E9]"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const answeredCount = Object.values(answers).filter((text) => text.trim().length > 0).length;
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-[calc(100vh-60px)] flex flex-col bg-[#111310]">
      {/* Cockpit Top Bar */}
      <div className="border-b border-[#282C24] bg-[#141712] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 text-xs text-[#74796F] hover:text-[#F5F2E9] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <span className="text-[#282C24]">|</span>
          <div className="text-xs font-semibold text-[#F5F2E9] truncate">
            {interview?.role_title} Mock Loop
          </div>
        </div>

        {/* Question Jumper buttons */}
        <div className="flex items-center gap-1.5">
          {questions.map((q, idx) => {
            const isAnswered = Boolean(answers[q.id]?.trim());
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => handleJumpTo(idx)}
                className={`w-7 h-7 text-xs font-mono rounded font-semibold transition-all flex items-center justify-center ${
                  isCurrent
                    ? 'bg-[#C6F36B] text-[#111310]'
                    : isAnswered
                    ? 'bg-[#1B1E19] text-[#C6F36B] border border-[#C6F36B]/30'
                    : 'bg-[#111310] text-[#74796F] border border-[#282C24] hover:text-[#F5F2E9]'
                }`}
                title={`Question ${idx + 1}: ${q.topic_tag}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <TimerWidget
            timeLimitMinutes={interview?.time_limit_minutes || 0}
            onTick={(secs) => setElapsedSeconds(secs)}
          />
          <div className="hidden sm:block text-xs text-[#74796F] font-mono tabular-nums">
            {answeredCount}/{questions.length} Answered
          </div>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f] transition-all shadow-sm"
          >
            Submit & Evaluate
          </button>
        </div>
      </div>

      {/* Signature Thin Electric Lime Progress Bar */}
      <div className="w-full h-1 bg-[#1B1E19]">
        <div
          className="h-full bg-[#C6F36B] transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Interview Area */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-6">
        {error && (
          <div className="p-3.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Question Card */}
        <QuestionPanel
          question={currentQuestion}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          roleTitle={interview?.role_title || 'Software Engineer'}
          onDictateAnswer={handleDictateAnswer}
        />

        {/* Answer Cockpit Editor */}
        <AnswerEditor
          answerText={answers[currentQuestion.id] || ''}
          onChange={handleAnswerChange}
          codeSnippet={codeSnippets[currentQuestion.id] || ''}
          codeLanguage={codeLanguages[currentQuestion.id] || 'typescript'}
          onCodeChange={handleCodeChange}
          onCodeLanguageChange={handleCodeLanguageChange}
          onSave={handleSaveAnswer}
          saving={savingAnswer}
          savedStatus={savedStatus}
          onNext={handleNext}
          onPrev={handlePrev}
          isFirst={currentIndex === 0}
          isLast={currentIndex === questions.length - 1}
          onSubmitAll={() => setShowConfirmModal(true)}
        />
      </div>

      {/* Evaluation In-Progress Overlay */}
      {completing && (
        <div className="fixed inset-0 z-50 bg-[#111310]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-xl bg-[#1B1E19] border border-[#C6F36B]/40 flex items-center justify-center text-[#C6F36B] shadow-2xl">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-xl font-bold font-display text-[#F5F2E9]">
              Synthesizing Rubric Evaluation
            </h3>
            <p className="text-xs text-[#A7B09C] leading-relaxed">
              Google Gemini is benchmarking your responses against production engineering standards across
              Relevance, Technical Accuracy, Structure, and Supporting Evidence.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C6F36B]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Persisting evaluation to MySQL results table...</span>
          </div>
        </div>
      )}

      {/* Final Submission Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Submit Answers for AI Evaluation?"
        description="Your responses will be graded according to the weighted rubric and saved to your history."
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-[#111310] border border-[#282C24] space-y-2">
            <div className="flex justify-between text-[#74796F]">
              <span>Answered Questions:</span>
              <span className="font-mono text-[#C6F36B] font-bold tabular-nums">
                {answeredCount} of {questions.length}
              </span>
            </div>
            {answeredCount < questions.length && (
              <div className="text-[11px] text-[#EAB308]">
                Note: {questions.length - answeredCount} question(s) remain unanswered. Unanswered questions will receive zero points.
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 rounded-lg border border-[#282C24] text-[#A7B09C] hover:text-[#F5F2E9]"
            >
              Continue Editing
            </button>
            <button
              type="button"
              onClick={handleCompleteInterview}
              className="px-4 py-2 font-semibold rounded-lg bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f]"
            >
              Confirm & Evaluate
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
