import React from 'react';

interface RubricBarProps {
  label: string;
  weight: string;
  score: number; // 0 to 100
  evidence?: string;
}

export const RubricBar: React.FC<RubricBarProps> = ({
  label,
  weight,
  score,
  evidence,
}) => {
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#F5F2E9]">{label}</span>
          <span className="text-[#74796F]">· {weight}</span>
        </div>
        <span className="font-mono tabular-nums font-bold text-[#C6F36B]">
          {clamped.toFixed(1)}/100
        </span>
      </div>

      <div className="h-1.5 w-full bg-[#111310] rounded-full overflow-hidden border border-[#282C24]">
        <div
          className="h-full bg-[#C6F36B] transition-all duration-700 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>

      {evidence && (
        <p className="text-[11px] text-[#A7B09C] leading-relaxed pt-0.5">{evidence}</p>
      )}
    </div>
  );
};
