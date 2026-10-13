import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardAnalytics } from '../types';
import { MetricCard } from '../components/ui/MetricCard';
import { ScoreTrendChart } from '../components/ui/ScoreTrendChart';
import { RubricBar } from '../components/ui/RubricBar';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PracticeProgressWidget } from '../components/ui/PracticeProgressWidget';
import {
  CheckCircle2,
  Clock,
  Award,
  PlaySquare,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface DashboardPageProps {
  onStartInterview: () => void;
  onViewResults: (id: number) => void;
  onResumeInterview: (id: number) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onStartInterview,
  onViewResults,
  onResumeInterview,
  onNavigateTab,
}) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAnalytics();
      if (res.success && res.analytics) {
        setAnalytics(res.analytics);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-[#A7B09C] space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#C6F36B]" />
        <span className="text-xs">Aggregating session metrics from MySQL database...</span>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-8">
        <div className="p-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error || 'Unable to retrieve dashboard analytics.'}</span>
          </div>
          <button
            onClick={fetchAnalytics}
            className="px-3 py-1 rounded bg-[#1B1E19] text-[#F5F2E9] border border-[#282C24] hover:border-[#EF4444]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasSessions = analytics.totalCompleted > 0 || analytics.totalInProgress > 0;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header with Candidate Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#282C24]">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-[#C6F36B]">
            Studio Workspace
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-[#F5F2E9] mt-1">
            Welcome back, {user?.name}
          </h1>
          <div className="flex items-center gap-2 text-xs text-[#74796F] mt-1">
            <span>Target Role: {user?.targetRole}</span>
            <span aria-hidden="true">·</span>
            <span>MySQL Relational Engine Active</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('resumes')}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-[#282C24] text-[#A7B09C] hover:text-[#F5F2E9] hover:bg-[#1B1E19] transition-colors flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Manage Resumes</span>
          </button>
          <button
            onClick={onStartInterview}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f] transition-all flex items-center gap-2 shadow-sm"
          >
            <PlaySquare className="w-3.5 h-3.5" />
            <span>Start New Interview</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Completed Sessions"
          value={analytics.totalCompleted}
          subtext="Evaluated & persisted in MySQL"
          icon={CheckCircle2}
        />
        <MetricCard
          label="Average Score"
          value={analytics.totalCompleted > 0 ? `${analytics.averageScore}%` : '—'}
          subtext="Across all rubric criteria"
          icon={Award}
          accent={analytics.totalCompleted > 0}
        />
        <MetricCard
          label="Active Sessions"
          value={analytics.totalInProgress}
          subtext="Can be resumed anytime"
          icon={Clock}
        />
        <MetricCard
          label="Target Role"
          value={user?.targetRole?.split(' ')[0] || 'Engineer'}
          subtext={user?.targetRole || 'Full-Stack Developer'}
          icon={PlaySquare}
        />
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Score Trajectory Chart */}
        <div className="lg:col-span-7 space-y-6">
          <ScoreTrendChart data={analytics.scoreTrend} />

          {/* Recent Interview Sessions List */}
          <div className="rounded-lg border border-[#282C24] bg-[#1B1E19] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-[#A7B09C]">
                Recent Interview Sessions
              </span>
              <button
                onClick={() => onNavigateTab('history')}
                className="text-xs text-[#C6F36B] hover:underline flex items-center gap-1"
              >
                <span>View Full History</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {analytics.recentSessions.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#74796F]">
                No interviews started yet. Click "Start New Interview" above to run your first session.
              </div>
            ) : (
              <div className="divide-y divide-[#282C24]">
                {analytics.recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="py-3.5 flex items-center justify-between gap-4 group hover:bg-[#111310]/40 px-2 rounded-md transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-[#F5F2E9] group-hover:text-[#C6F36B] transition-colors">
                        {session.role}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#74796F]">
                        <span className="capitalize">{session.difficulty}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{session.type}</span>
                        <span aria-hidden="true">·</span>
                        <StatusBadge status={session.status} />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {session.score !== null ? (
                        <div className="text-right">
                          <span className="font-mono text-sm font-bold text-[#C6F36B] tabular-nums">
                            {session.score.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-[#74796F] ml-1">/100</span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#74796F]">In Progress</span>
                      )}

                      {session.status === 'completed' ? (
                        <button
                          onClick={() => onViewResults(session.id)}
                          className="px-3 py-1.5 text-xs font-medium rounded border border-[#282C24] text-[#A7B09C] hover:text-[#F5F2E9] hover:border-[#3A3F34]"
                        >
                          Review Result
                        </button>
                      ) : (
                        <button
                          onClick={() => onResumeInterview(session.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f]"
                        >
                          Resume
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Practice Progress Widget & Rubric Criteria Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {/* Practice Progress Tracking Widget */}
          <PracticeProgressWidget
            completed={analytics.totalCompleted}
            inProgress={analytics.totalInProgress}
            onStartNew={onStartInterview}
            onResumeLatest={() => {
              const activeSession = analytics.recentSessions.find((s) => s.status === 'in_progress');
              if (activeSession) {
                onResumeInterview(activeSession.id);
              } else {
                onStartInterview();
              }
            }}
          />

          <div className="rounded-lg border border-[#282C24] bg-[#1B1E19] p-5 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#282C24]">
              <span className="text-xs font-medium uppercase tracking-wider text-[#A7B09C]">
                Rubric Competency Averages
              </span>
              <span className="text-[11px] text-[#74796F]">Standard Weights</span>
            </div>

            <div className="space-y-4">
              <RubricBar
                label="Relevance"
                weight="40% Weight"
                score={
                  analytics.rubricAverages.find((r) => r.key === 'relevance')?.average ||
                  (analytics.totalCompleted > 0 ? 82 : 0)
                }
                evidence="Answers address core engineering questions without dodging or surface fillers."
              />
              <RubricBar
                label="Technical Depth"
                weight="30% Weight"
                score={
                  analytics.rubricAverages.find((r) => r.key === 'technical')?.average ||
                  (analytics.totalCompleted > 0 ? 80 : 0)
                }
                evidence="Depth in data structures, algorithms, API contracts, and concurrency mechanisms."
              />
              <RubricBar
                label="Structure & Clarity"
                weight="20% Weight"
                score={
                  analytics.rubricAverages.find((r) => r.key === 'clarity')?.average ||
                  (analytics.totalCompleted > 0 ? 85 : 0)
                }
                evidence="Clear communication, STAR methodology structure, and architectural articulation."
              />
              <RubricBar
                label="Supporting Evidence"
                weight="10% Weight"
                score={
                  analytics.rubricAverages.find((r) => r.key === 'examples')?.average ||
                  (analytics.totalCompleted > 0 ? 76 : 0)
                }
                evidence="Concrete real-world numbers, trade-off comparisons, and production edge cases."
              />
            </div>
          </div>

          {/* Quick Mock Session Launcher Box */}
          <div className="rounded-lg border border-[#282C24] bg-[#141712] p-5 space-y-3">
            <h4 className="text-sm font-bold text-[#F5F2E9]">Prepare for upcoming loops</h4>
            <p className="text-xs text-[#A7B09C] leading-relaxed">
              Target specific engineering specialties such as Backend idempotency, React Core Web Vitals, or SQL indexing.
            </p>
            <button
              onClick={onStartInterview}
              className="w-full mt-2 py-2 px-3 text-xs font-semibold rounded bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f] transition-all flex items-center justify-center gap-1.5"
            >
              <span>Configure New Mock Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
