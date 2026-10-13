import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  accent?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  accent = false,
}) => {
  return (
    <div
      className={`relative p-5 rounded-lg border transition-colors ${
        accent
          ? 'bg-[#1B1E19] border-[#C6F36B]/30'
          : 'bg-[#1B1E19] border-[#282C24] hover:border-[#3A3F34]'
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-[#A7B09C]">
          {label}
        </span>
        {Icon && (
          <div className="p-1.5 rounded bg-[#111310] border border-[#282C24] text-[#A7B09C]">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold font-mono tracking-tight text-[#F5F2E9] tabular-nums">
          {value}
        </span>
      </div>

      {subtext && (
        <p className="mt-2 text-xs text-[#74796F] truncate">{subtext}</p>
      )}
    </div>
  );
};
