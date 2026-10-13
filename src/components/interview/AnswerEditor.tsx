import React, { useState } from 'react';
import { Check, Loader2, Code2, AlignLeft } from 'lucide-react';
import { CodeSandbox } from './CodeSandbox';

interface AnswerEditorProps {
  answerText: string;
  onChange: (text: string) => void;
  codeSnippet?: string;
  codeLanguage?: string;
  onCodeChange?: (code: string) => void;
  onCodeLanguageChange?: (lang: string) => void;
  onSave: () => void;
  saving: boolean;
  savedStatus: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  isFirst: boolean;
  isLast: boolean;
  onSubmitAll: () => void;
}

export const AnswerEditor: React.FC<AnswerEditorProps> = ({
  answerText,
  onChange,
  codeSnippet = '',
  codeLanguage = 'typescript',
  onCodeChange,
  onCodeLanguageChange,
  onSave,
  saving,
  savedStatus,
  onNext,
  onPrev,
  isFirst,
  isLast,
  onSubmitAll,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'code'>('text');

  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  const charCount = answerText.length;
  const hasCode = Boolean(codeSnippet && codeSnippet.trim().length > 0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onSave();
      if (!isLast && onNext) {
        onNext();
      }
    }
  };

  return (
    <div className="rounded-lg border border-[#282C24] bg-[#1B1E19] p-6 space-y-4">
      {/* Header with Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#74796F] border-b border-[#282C24] pb-3">
        <div className="flex items-center gap-2">
          {/* Segmented control for Text vs Code */}
          <div className="flex items-center gap-1 p-0.5 rounded bg-[#111310] border border-[#282C24]">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
                activeTab === 'text'
                  ? 'bg-[#1B1E19] text-[#C6F36B] font-semibold shadow-sm'
                  : 'text-[#74796F] hover:text-[#F5F2E9]'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Explanation & Tradeoffs</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors ${
                activeTab === 'code'
                  ? 'bg-[#1B1E19] text-[#C6F36B] font-semibold shadow-sm'
                  : 'text-[#74796F] hover:text-[#F5F2E9]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code Sandbox {hasCode && '· Active'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono tabular-nums text-[11px]">
          <span>{wordCount} words</span>
          <span aria-hidden="true">·</span>
          <span>{charCount} chars</span>
        </div>
      </div>

      {/* Text Mode */}
      {activeTab === 'text' && (
        <div className="relative">
          <textarea
            id="answer-input"
            value={answerText}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Structure your answer clearly: state your approach, trade-offs, edge cases, and rationale..."
            rows={9}
            className="w-full rounded-lg bg-[#111310] border border-[#282C24] p-4 text-sm text-[#F5F2E9] placeholder-[#74796F] focus:border-[#C6F36B] focus:outline-none focus:ring-1 focus:ring-[#C6F36B] transition-colors resize-y min-h-[200px]"
          />
        </div>
      )}

      {/* Code Mode */}
      {activeTab === 'code' && onCodeChange && onCodeLanguageChange && (
        <CodeSandbox
          code={codeSnippet}
          language={codeLanguage}
          onChange={onCodeChange}
          onLanguageChange={onCodeLanguageChange}
        />
      )}

      {/* Footer controls & Shortcuts */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-[#74796F]">
          {saving ? (
            <span className="flex items-center gap-1.5 text-[#A7B09C]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving answer to MySQL...
            </span>
          ) : savedStatus ? (
            <span className="flex items-center gap-1.5 text-[#C6F36B]">
              <Check className="w-3.5 h-3.5" /> Answer persisted
            </span>
          ) : (
            <span>Press Cmd+Enter to save & advance</span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onPrev}
            disabled={isFirst}
            className={`px-4 py-2 text-xs font-medium rounded-lg border border-[#282C24] transition-colors ${
              isFirst
                ? 'opacity-30 cursor-not-allowed text-[#74796F]'
                : 'text-[#A7B09C] hover:text-[#F5F2E9] hover:bg-[#111310]'
            }`}
          >
            Previous
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#111310] border border-[#282C24] text-[#F5F2E9] hover:border-[#C6F36B] hover:text-[#C6F36B] transition-all"
          >
            Save Answer
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={onSubmitAll}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f] transition-all shadow-sm"
            >
              Finish & Evaluate Session
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f] transition-all shadow-sm"
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
