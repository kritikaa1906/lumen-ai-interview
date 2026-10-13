import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Interview, InterviewResult, Question, Answer } from '../types';
import { ScoreRing } from '../components/ui/ScoreRing';
import { RubricBar } from '../components/ui/RubricBar';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Download,
  Printer,
  FileCode,
} from 'lucide-react';

interface ResultsPageProps {
  interviewId: number;
  onPracticeAgain: () => void;
  onReturnDashboard: () => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  interviewId,
  onPracticeAgain,
  onReturnDashboard,
}) => {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getInterviewResults(interviewId)
      .then((res) => {
        if (res.success) {
          setInterview(res.interview);
          setResult(res.result);
          setQuestions(res.questions);
          setAnswers(res.answers);
          if (res.questions.length > 0) {
            setExpandedQuestionId(res.questions[0].id);
          }
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to retrieve interview results.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [interviewId]);

  if (loading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 space-y-3 text-[#A7B09C]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C6F36B]" />
        <span className="text-xs">Fetching verified evaluation from MySQL...</span>
      </div>
    );
  }

  if (error || !result || !interview) {
    return (
      <div className="p-8 max-w-xl mx-auto space-y-4">
        <div className="p-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444]">
          {error || 'Results not found.'}
        </div>
        <button
          onClick={onReturnDashboard}
          className="px-4 py-2 text-xs rounded border border-[#282C24] text-[#A7B09C] hover:text-[#F5F2E9]"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const toggleExpand = (id: number) => {
    setExpandedQuestionId(expandedQuestionId === id ? null : id);
  };

  const handleExportMarkdown = () => {
    if (!result || !interview) return;
    const content = `# LUMEN AI INTERVIEW AUDIT REPORT
**Role:** ${interview.role_title} (${interview.difficulty} · ${interview.interview_type})
**Overall Score:** ${result.overall_score}/100
**Evaluator:** ${result.evaluator_source}
**Date:** ${new Date(result.created_at || Date.now()).toLocaleDateString()}

## Rubric Criterion Breakdown
- Relevance (40% Weight): ${result.relevance_score}/100
- Technical Accuracy (30% Weight): ${result.technical_score}/100
- Structure & Clarity (20% Weight): ${result.clarity_score}/100
- Supporting Examples (10% Weight): ${result.examples_score}/100

## Strengths
${result.strengths.map((s) => `- ${s}`).join('\n')}

## Missing Concepts
${result.missing_concepts.map((m) => `- ${m}`).join('\n')}

## Actionable Next Steps
${result.improvements.map((i) => `- ${i}`).join('\n')}

## Detailed Question-by-Question Audit
${questions
  .map((q, idx) => {
    const ans = answers.find((a) => a.question_id === q.id);
    const evalRec = result.question_evaluations?.find((e) => e.questionId === q.id);
    return `### Question ${idx + 1}: ${q.question_text} [${q.topic_tag}]
**Candidate Response:**
${ans?.answer_text || '(No response provided)'}

**Score:** ${evalRec?.score ?? 'N/A'}/100
**Evaluator Feedback:**
${evalRec?.feedback || 'N/A'}

**Benchmark Model Answer:**
${q.example_answer || 'N/A'}
`;
  })
  .join('\n\n')}
`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumen-${interview.role_title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-audit.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!result || !interview) return;
    const data = {
      interview,
      result,
      questions,
      answers,
      generatedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumen-interview-${interview.id}-evaluation.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 print:p-0 print:space-y-4">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#282C24]">
        <div>
          <button
            onClick={onReturnDashboard}
            className="flex items-center gap-1.5 text-xs text-[#74796F] hover:text-[#F5F2E9] mb-2 transition-colors print:hidden"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-[#F5F2E9]">
            {interview.role_title} · Evaluation Audit
          </h1>
          <div className="flex items-center gap-2 text-xs text-[#74796F] mt-1">
            <span className="capitalize">{interview.difficulty} Track</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{interview.interview_type} Focus</span>
            <span aria-hidden="true">·</span>
            <span>Evaluator: {result.evaluator_source}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 print:hidden flex-wrap">
          <button
            onClick={handleExportMarkdown}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#282C24] text-[#A7B09C] hover:text-[#F5F2E9] hover:bg-[#1B1E19] transition-colors flex items-center gap-1.5"
            title="Download full Markdown report"
          >
            <Download className="w-3.5 h-3.5 text-[#C6F36B]" />
            <span>Export .MD</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#282C24] text-[#A7B09C] hover:text-[#F5F2E9] hover:bg-[#1B1E19] transition-colors flex items-center gap-1.5"
            title="Download complete JSON evaluation"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-[#282C24] text-[#A7B09C] hover:text-[#F5F2E9] hover:bg-[#1B1E19] transition-colors flex items-center gap-1.5"
            title="Print or save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button
            onClick={onPracticeAgain}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Practice Another</span>
          </button>
        </div>
      </div>

      {/* Hero Score & Rubric Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* Overall Score Dial */}
        <div className="md:col-span-4 rounded-lg border border-[#282C24] bg-[#1B1E19] p-6 flex flex-col items-center justify-center text-center space-y-3">
          <ScoreRing score={result.overall_score} size={140} strokeWidth={10} />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#F5F2E9]">Weighted Overall Score</h3>
            <p className="text-[11px] text-[#74796F]">
              Calculated deterministically via weighted 4-tier rubric
            </p>
          </div>
        </div>

        {/* 4 Criterion Dimensions */}
        <div className="md:col-span-8 rounded-lg border border-[#282C24] bg-[#1B1E19] p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#282C24]">
            <span className="text-xs font-medium uppercase tracking-wider text-[#A7B09C]">
              Criterion Performance Breakdown
            </span>
            <span className="text-[11px] text-[#74796F]">Weighted Formula</span>
          </div>

          <div className="space-y-3.5">
            <RubricBar
              label="Relevance"
              weight="40% Weight"
              score={result.relevance_score}
              evidence="Directly addresses the scenario and core architectural challenges."
            />
            <RubricBar
              label="Technical Accuracy"
              weight="30% Weight"
              score={result.technical_score}
              evidence="Correctness of algorithms, protocols, data structures, and edge cases."
            />
            <RubricBar
              label="Structure & Clarity"
              weight="20% Weight"
              score={result.clarity_score}
              evidence="Conciseness, organization, and engineering articulation."
            />
            <RubricBar
              label="Supporting Examples"
              weight="10% Weight"
              score={result.examples_score}
              evidence="Practical experience, benchmarks, or trade-off reasoning."
            />
          </div>
        </div>
      </div>

      {/* Strengths, Missing Concepts, Improvements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="rounded-lg border border-[#282C24] bg-[#1B1E19] p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C6F36B]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Key Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-[#A7B09C]">
            {result.strengths.map((str, idx) => (
              <li key={idx} className="leading-relaxed flex items-start gap-1.5">
                <span className="text-[#C6F36B] font-bold">·</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Missing Concepts */}
        <div className="rounded-lg border border-[#282C24] bg-[#1B1E19] p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#EAB308]">
            <AlertTriangle className="w-4 h-4" />
            <span>Missing Concepts</span>
          </div>
          <ul className="space-y-2 text-xs text-[#A7B09C]">
            {result.missing_concepts.map((item, idx) => (
              <li key={idx} className="leading-relaxed flex items-start gap-1.5">
                <span className="text-[#EAB308] font-bold">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actionable Improvements */}
        <div className="rounded-lg border border-[#282C24] bg-[#1B1E19] p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F2E9]">
            <Lightbulb className="w-4 h-4 text-[#C6F36B]" />
            <span>Actionable Next Steps</span>
          </div>
          <ul className="space-y-2 text-xs text-[#A7B09C]">
            {result.improvements.map((imp, idx) => (
              <li key={idx} className="leading-relaxed flex items-start gap-1.5">
                <span className="text-[#C6F36B] font-bold">·</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question-by-Question Deep Review */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#282C24]">
          <h3 className="text-base font-bold font-display text-[#F5F2E9]">
            Question-by-Question Evaluation Audit
          </h3>
          <span className="text-xs text-[#74796F] font-mono tabular-nums">
            {questions.length} Questions Evaluated
          </span>
        </div>

        <div className="space-y-3">
          {questions.map((q, idx) => {
            const answer = answers.find((a) => a.question_id === q.id);
            const evalRecord = result.question_evaluations?.find((e) => e.questionId === q.id);
            const isExpanded = expandedQuestionId === q.id;

            return (
              <div
                key={q.id}
                className="rounded-lg border border-[#282C24] bg-[#1B1E19] overflow-hidden transition-all"
              >
                {/* Header row */}
                <button
                  type="button"
                  onClick={() => toggleExpand(q.id)}
                  className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-[#141712] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#74796F]">
                      <span className="font-mono text-[#C6F36B]">Question {idx + 1}</span>
                      <span aria-hidden="true">·</span>
                      <span>{q.topic_tag}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-[#F5F2E9] leading-snug">
                      {q.question_text}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {evalRecord && (
                      <span className="font-mono text-xs font-bold text-[#C6F36B] tabular-nums">
                        {evalRecord.score}/100
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#74796F]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#74796F]" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-[#282C24] space-y-4 text-xs">
                    {/* Candidate's submitted answer */}
                    <div className="space-y-1.5 pt-4">
                      <div className="text-[11px] font-medium uppercase tracking-wider text-[#74796F]">
                        Your Submitted Response
                      </div>
                      <div className="p-3.5 rounded bg-[#111310] border border-[#282C24] text-[#F5F2E9] leading-relaxed whitespace-pre-wrap">
                        {answer?.answer_text || '(No response provided)'}
                      </div>
                    </div>

                    {/* AI Feedback */}
                    {evalRecord?.feedback && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[#C6F36B]">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Evaluator Feedback</span>
                        </div>
                        <div className="p-3.5 rounded bg-[#141712] border border-[#282C24] text-[#A7B09C] leading-relaxed">
                          {evalRecord.feedback}
                        </div>
                      </div>
                    )}

                    {/* Benchmark Model Answer */}
                    {q.example_answer && (
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-medium uppercase tracking-wider text-[#A7B09C]">
                          Benchmark High-Score Answer Example
                        </div>
                        <div className="p-3.5 rounded bg-[#111310] border border-[#282C24] text-[#A7B09C] leading-relaxed italic">
                          "{q.example_answer}"
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-lg bg-[#141712] border border-[#282C24] text-[11px] text-[#74796F] text-center">
        Lumen AI Interview Studio · Practice scores and rubric feedback are advisory tools designed for interview preparation and skill benchmarking.
      </div>
    </div>
  );
};
