import React from 'react';
import { CheckCircle2, Clock, ArrowRight, PlaySquare } from 'lucide-react';

interface PracticeProgressWidgetProps {
  completed: number;
  inProgress: number;
  onStartNew?: () => void;
  onResumeLatest?: () => void;
}

export const PracticeProgressWidget: React.FC<PracticeProgressWidgetProps> = ({
  completed,
  inProgress,
  onStartNew,
  onResumeLatest,
}) => {
  const total = completed + inProgress;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Ring geometry
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Completed arc offset
  const completedOffset =
    total > 0 ? circumference - (completed / total) * circumference : circumference;

  // In-progress arc
  const inProgressRatio = total > 0 ? inProgress / total : 0;
  const inProgressLength = inProgressRatio * circumference;

  return (
    <div className="rounded-lg border border-[#282C24] bg-[#1B1E19] p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#282C24]">
        <div className="space-y-0.5">
          <span className="text-xs font-medium uppercase tracking-wider text-[#A7B09C]">
            Practice Progress
          </span>
          <p className="text-[11px] text-[#74796F]">
            Session completion & workflow status
          </p>
        </div>
        <span className="font-mono text-xs font-bold text-[#C6F36B] tabular-nums">
          {completionPercentage}% Finished
        </span>
      </div>

      {/* Center Visualization and Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
        {/* Ring Chart */}
        <div className="sm:col-span-5 flex items-center justify-center">
          <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="rotate-[-90deg]">
              {/* Background Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#111310"
                strokeWidth={strokeWidth}
                fill="transparent"
              />

              {/* Completed Arc (Electric Lime) */}
              {completed > 0 && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#C6F36B"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={completedOffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              )}

              {/* In-Progress Arc (Sage Glow) */}
              {inProgress > 0 && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#A7B09C"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${inProgressLength} ${circumference}`}
                  strokeDashoffset={-((completed / (total || 1)) * circumference)}
                  fill="transparent"
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              )}
            </svg>

            {/* Inner Stats */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono text-2xl font-bold tracking-tight text-[#F5F2E9] tabular-nums">
                {total}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#74796F]">
                Sessions
              </span>
            </div>
          </div>
        </div>

        {/* Legend & Metric Summary */}
        <div className="sm:col-span-7 space-y-3">
          <div className="space-y-2">
            {/* Completed Metric Row */}
            <div className="p-2.5 rounded bg-[#111310] border border-[#282C24] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#C6F36B]" />
                <span className="text-xs text-[#F5F2E9] font-medium">Completed</span>
              </div>
              <span className="font-mono text-xs font-bold text-[#C6F36B] tabular-nums">
                {completed}
              </span>
            </div>

            {/* In-Progress Metric Row */}
            <div className="p-2.5 rounded bg-[#111310] border border-[#282C24] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#A7B09C]" />
                <span className="text-xs text-[#F5F2E9] font-medium">In Progress</span>
              </div>
              <span className="font-mono text-xs font-bold text-[#A7B09C] tabular-nums">
                {inProgress}
              </span>
            </div>
          </div>

          {/* Quick Action Button */}
          {inProgress > 0 && onResumeLatest ? (
            <button
              onClick={onResumeLatest}
              className="w-full py-2 px-3 text-xs font-semibold rounded bg-[#C6F36B] text-[#111310] hover:bg-[#d6f88f] transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Resume Active Loop</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : onStartNew ? (
            <button
              onClick={onStartNew}
              className="w-full py-2 px-3 text-xs font-semibold rounded bg-[#111310] border border-[#282C24] text-[#F5F2E9] hover:border-[#C6F36B] hover:text-[#C6F36B] transition-all flex items-center justify-center gap-1.5"
            >
              <PlaySquare className="w-3.5 h-3.5" />
              <span>Launch Next Session</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
