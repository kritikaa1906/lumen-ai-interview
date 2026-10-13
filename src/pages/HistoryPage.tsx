import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Interview } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  Search,
  Filter,
  Loader2,
  AlertCircle,
  PlaySquare,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface HistoryPageProps {
  onViewResults: (id: number) => void;
  onResumeInterview: (id: number) => void;
  onNewInterview: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onViewResults,
  onResumeInterview,
  onNewInterview,
}) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fetchInterviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getInterviews({
        status: statusFilter,
        search: searchQuery,
      });
      if (res.success && res.interviews) {
        setInterviews(res.interviews);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load interview history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInterviews();
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#282C24]">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-[#C6F36B]">
            Audit Log
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-[#F5F2E9] mt-1">
            Interview History
          </h1>
          <p className="text-xs text-[#A7B09C] mt-1">
            Reopen previous evaluations, review question rubrics, and resume sessions in progress.
          </p>
        </div>

        <button
          onClick={onNewInterview}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f] transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <PlaySquare className="w-3.5 h-3.5" />
          <span>New Mock Session</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Interactive segmented filter control (Buttons allowed per skill) */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#141712] border border-[#282C24] w-full sm:w-auto">
          {['all', 'completed', 'in_progress'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                statusFilter === status
                  ? 'bg-[#1B1E19] text-[#C6F36B] border border-[#C6F36B]/20 shadow-sm'
                  : 'text-[#74796F] hover:text-[#F5F2E9]'
              }`}
            >
              {status === 'all' ? 'All Sessions' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#74796F]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search role title..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[#141712] border border-[#282C24] text-[#F5F2E9] placeholder-[#74796F] focus:border-[#C6F36B] focus:outline-none"
          />
        </form>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table / List View */}
      {loading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center text-[#A7B09C] space-y-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#C6F36B]" />
          <span className="text-xs">Querying session history from MySQL...</span>
        </div>
      ) : interviews.length === 0 ? (
        <div className="p-12 text-center rounded-lg border border-[#282C24] bg-[#1B1E19] space-y-3">
          <p className="text-sm font-semibold text-[#F5F2E9]">No matching sessions found</p>
          <p className="text-xs text-[#74796F]">
            Adjust your search query or launch a new interview session.
          </p>
          <button
            onClick={onNewInterview}
            className="mt-2 px-4 py-2 text-xs font-semibold rounded bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f]"
          >
            Start First Interview
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-[#282C24] bg-[#1B1E19] overflow-hidden">
          <div className="divide-y divide-[#282C24]">
            {interviews.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#141712] transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-[#F5F2E9]">
                      {item.role_title}
                    </span>
                    {item.is_fallback && (
                      <span className="text-[10px] text-[#A7B09C] font-mono">
                        · Curated Dataset
                      </span>
                    )}
                  </div>

                  {/* Clean unboxed metadata */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#74796F]">
                    <span className="capitalize">{item.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{item.interview_type}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.question_count} Questions</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    <span aria-hidden="true">·</span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  {item.score !== null && item.score !== undefined ? (
                    <div className="text-right">
                      <span className="font-mono text-base font-bold text-[#C6F36B] tabular-nums">
                        {item.score.toFixed(1)}
                      </span>
                      <span className="text-[11px] text-[#74796F] ml-1">/100</span>
                    </div>
                  ) : null}

                  {item.status === 'completed' ? (
                    <button
                      onClick={() => onViewResults(item.id)}
                      className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-[#282C24] text-[#A7B09C] hover:text-[#F5F2E9] hover:border-[#3A3F34] transition-colors flex items-center gap-1.5"
                    >
                      <span>Audit Results</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onResumeInterview(item.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f] transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Resume</span>
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
