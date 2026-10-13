import React, { useState } from 'react';
import { Question } from '../../types';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { VoiceControls } from './VoiceControls';

interface QuestionPanelProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  roleTitle: string;
  onDictateAnswer?: (text: string) => void;
}

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  question,
  currentIndex,
  totalQuestions,
  roleTitle,
  onDictateAnswer,
}) => {
  const [showHints, setShowHints] = useState<boolean>(false);

  return (
    <div className="rounded-lg border border-[#282C24] bg-[#1B1E19] p-6 space-y-4">
      {/* Question metadata header — unboxed text, no pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#74796F] border-b border-[#282C24] pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[#C6F36B] font-semibold tabular-nums">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span aria-hidden="true">·</span>
          <span>{roleTitle}</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{question.difficulty}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="font-mono text-[11px] text-[#A7B09C]">
            Topic: {question.topic_tag}
          </div>
          {onDictateAnswer && (
            <VoiceControls
              questionText={question.question_text}
              onDictatedText={onDictateAnswer}
            />
          )}
        </div>
      </div>

      {/* Primary Question Prompt */}
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-bold font-display text-[#F5F2E9] leading-snug">
          {question.question_text}
        </h2>
      </div>

      {/* Practice Hint Accordion */}
      {question.expected_concepts && question.expected_concepts.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => setShowHints(!showHints)}
            className="flex items-center gap-1.5 text-xs text-[#A7B09C] hover:text-[#C6F36B] transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{showHints ? 'Hide Key Rubric Objectives' : 'View Key Rubric Objectives'}</span>
            {showHints ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showHints && (
            <div className="mt-3 p-3.5 rounded bg-[#111310] border border-[#282C24] text-xs text-[#A7B09C] space-y-1.5 animate-in fade-in duration-150">
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#74796F]">
                Expected Technical Points
              </p>
              <ul className="list-disc list-inside space-y-1 text-[#F5F2E9]/90">
                {question.expected_concepts.map((concept, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {concept}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
