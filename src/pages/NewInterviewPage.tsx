import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ResumeProfile } from '../types';
import {
  Play,
  Loader2,
  FileText,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface NewInterviewPageProps {
  onInterviewCreated: (interviewId: number) => void;
  onNavigateTab: (tab: string) => void;
}

export const NewInterviewPage: React.FC<NewInterviewPageProps> = ({
  onInterviewCreated,
  onNavigateTab,
}) => {
  const [roleTitle, setRoleTitle] = useState('Full-Stack Developer');
  const [customRole, setCustomRole] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [interviewType, setInterviewType] = useState<'technical' | 'behavioral' | 'system_design' | 'mixed'>('technical');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [resumes, setResumes] = useState<ResumeProfile[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [loadingResumes, setLoadingResumes] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const predefinedRoles = [
    'Full-Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'Python Developer',
    'Data Analyst',
    'Machine Learning Engineer',
    'AI/ML Engineer',
    'SQL Developer',
    'Custom Track...',
  ];

  useEffect(() => {
    api
      .getResumes()
      .then((res) => {
        if (res.success && res.resumes) {
          setResumes(res.resumes);
          if (res.resumes.length > 0) {
            setSelectedResumeId(res.resumes[0].id);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load resumes:', err);
      })
      .finally(() => {
        setLoadingResumes(false);
      });
  }, []);

  const effectiveRole = roleTitle === 'Custom Track...' ? customRole.trim() : roleTitle;

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveRole) {
      setError('Please specify a target engineering role.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api.createInterview({
        roleTitle: effectiveRole,
        difficulty,
        interviewType,
        questionCount,
        resumeId: selectedResumeId,
      });

      if (res.success && res.interview) {
        onInterviewCreated(res.interview.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize interview questions.');
      setSubmitting(false);
    }
  };

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-3 border-b border-[#282C24]">
        <div className="text-xs font-medium uppercase tracking-wider text-[#C6F36B]">
          Mock Interview Studio
        </div>
        <h1 className="text-2xl md:text-3xl font-bold font-display text-[#F5F2E9] mt-1">
          Configure Your Practice Loop
        </h1>
        <p className="text-xs text-[#A7B09C] mt-1">
          Select target seniority, domain track, and optionally connect a resume profile to customize Gemini questions.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleStartInterview} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Target Role Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#A7B09C] uppercase tracking-wider">
              1. Target Job Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {predefinedRoles.map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setRoleTitle(role)}
                  className={`p-2.5 text-xs text-left rounded-lg border transition-all ${
                    roleTitle === role
                      ? 'bg-[#1B1E19] border-[#C6F36B] text-[#C6F36B] font-semibold'
                      : 'bg-[#141712] border-[#282C24] text-[#A7B09C] hover:border-[#3A3F34] hover:text-[#F5F2E9]'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {roleTitle === 'Custom Track...' && (
              <input
                type="text"
                required
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Enter custom title (e.g. Platform Architect, DevOps Engineer)"
                className="w-full mt-2 p-2.5 rounded-lg bg-[#111310] border border-[#282C24] text-xs text-[#F5F2E9] placeholder-[#74796F] focus:border-[#C6F36B] focus:outline-none"
              />
            )}
          </div>

          {/* Difficulty Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#A7B09C] uppercase tracking-wider">
              2. Evaluation Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'easy', label: 'Foundational', sub: 'Core syntax & basics' },
                { id: 'medium', label: 'Professional', sub: 'Production architectures' },
                { id: 'hard', label: 'Staff / Principal', sub: 'High concurrency & failure modes' },
              ].map((lvl) => (
                <button
                  type="button"
                  key={lvl.id}
                  onClick={() => setDifficulty(lvl.id as any)}
                  className={`p-3 text-left rounded-lg border transition-all ${
                    difficulty === lvl.id
                      ? 'bg-[#1B1E19] border-[#C6F36B] text-[#F5F2E9]'
                      : 'bg-[#141712] border-[#282C24] text-[#A7B09C] hover:border-[#3A3F34]'
                  }`}
                >
                  <div className={`text-xs font-bold ${difficulty === lvl.id ? 'text-[#C6F36B]' : ''}`}>
                    {lvl.label}
                  </div>
                  <div className="text-[10px] text-[#74796F] mt-0.5">{lvl.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Interview Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#A7B09C] uppercase tracking-wider">
              3. Interview Focus Track
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'technical', label: 'Technical Depth' },
                { id: 'system_design', label: 'System Design & Tradeoffs' },
                { id: 'behavioral', label: 'STAR Behavioral Scenarios' },
                { id: 'mixed', label: 'Full Mixed Comprehensive Loop' },
              ].map((track) => (
                <button
                  type="button"
                  key={track.id}
                  onClick={() => setInterviewType(track.id as any)}
                  className={`p-2.5 text-xs text-left rounded-lg border transition-all ${
                    interviewType === track.id
                      ? 'bg-[#1B1E19] border-[#C6F36B] text-[#C6F36B] font-semibold'
                      : 'bg-[#141712] border-[#282C24] text-[#A7B09C] hover:border-[#3A3F34] hover:text-[#F5F2E9]'
                  }`}
                >
                  {track.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#A7B09C] uppercase tracking-wider">
              4. Question Count
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 5, 8].map((count) => (
                <button
                  type="button"
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`py-2 text-xs font-mono font-bold rounded-lg border tabular-nums transition-all ${
                    questionCount === count
                      ? 'bg-[#1B1E19] border-[#C6F36B] text-[#C6F36B]'
                      : 'bg-[#141712] border-[#282C24] text-[#74796F] hover:text-[#F5F2E9]'
                  }`}
                >
                  {count} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Attached Resume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#A7B09C] uppercase tracking-wider">
                5. Connect Resume Profile (Optional)
              </label>
              <button
                type="button"
                onClick={() => onNavigateTab('resumes')}
                className="text-[11px] text-[#C6F36B] hover:underline"
              >
                + Upload New PDF
              </button>
            </div>

            {loadingResumes ? (
              <div className="p-3 text-xs text-[#74796F]">Loading candidate resumes...</div>
            ) : resumes.length === 0 ? (
              <div className="p-3.5 rounded-lg bg-[#141712] border border-[#282C24] text-xs text-[#74796F]">
                No resumes uploaded yet. Questions will be generated from standard domain competencies.
              </div>
            ) : (
              <select
                value={selectedResumeId || ''}
                onChange={(e) => setSelectedResumeId(e.target.value ? parseInt(e.target.value, 10) : null)}
                className="w-full p-2.5 rounded-lg bg-[#111310] border border-[#282C24] text-xs text-[#F5F2E9] focus:border-[#C6F36B] focus:outline-none"
              >
                <option value="">Do not attach resume (Standard rubric questions)</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.file_name} ({r.extracted_skills?.length || 0} skills extracted)
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Right Column: Configuration Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-lg border border-[#282C24] bg-[#1B1E19] p-6 space-y-5 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-[#282C24]">
              <span className="text-xs font-medium uppercase tracking-wider text-[#A7B09C]">
                Session Blueprint
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#C6F36B]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ready to Generate</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#282C24]/60">
                <span className="text-[#74796F]">Target Track:</span>
                <span className="font-semibold text-[#F5F2E9]">{effectiveRole || 'Full-Stack Developer'}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#282C24]/60">
                <span className="text-[#74796F]">Evaluation Depth:</span>
                <span className="font-semibold text-[#F5F2E9] capitalize">{difficulty}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#282C24]/60">
                <span className="text-[#74796F]">Focus:</span>
                <span className="font-semibold text-[#F5F2E9] capitalize">{interviewType}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#282C24]/60">
                <span className="text-[#74796F]">Question Count:</span>
                <span className="font-mono font-semibold text-[#C6F36B] tabular-nums">
                  {questionCount} Questions
                </span>
              </div>

              {selectedResume && (
                <div className="py-2 space-y-1.5">
                  <span className="text-[#74796F]">Extracted Resume Skills:</span>
                  <div className="text-[11px] text-[#A7B09C] leading-relaxed">
                    {selectedResume.extracted_skills.slice(0, 6).join(' · ')}
                    {selectedResume.extracted_skills.length > 6 && ' · +more'}
                  </div>
                </div>
              )}
            </div>

            <div className="p-3.5 rounded bg-[#111310] border border-[#282C24] text-[11px] text-[#74796F] space-y-1">
              <div className="text-[#A7B09C] font-medium">Evaluation Guarantee:</div>
              <p>
                Answers are persisted to MySQL with timestamp verification. Evaluated via Google Gemini 3.8
                Flash across 4 weighted dimensions.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 text-xs font-semibold rounded-lg bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f] transition-all flex items-center justify-center gap-2 shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Interview Questions...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Begin Interview Cockpit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
