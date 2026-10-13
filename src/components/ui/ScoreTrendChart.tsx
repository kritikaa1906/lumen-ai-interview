import React, { useState } from 'react';

interface ScorePoint {
  sessionIndex: number;
  interviewId: number;
  role: string;
  date: string;
  score: number;
  relevance: number;
  technical: number;
  clarity: number;
  examples: number;
}

interface ScoreTrendChartProps {
  data: ScorePoint[];
}

export const ScoreTrendChart: React.FC<ScoreTrendChartProps> = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState<ScorePoint | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-[#282C24] rounded-lg bg-[#1B1E19]">
        <p className="text-sm text-[#A7B09C]">No evaluation data points recorded yet.</p>
        <p className="text-xs text-[#74796F] mt-1">Complete your first mock interview to track performance trajectory.</p>
      </div>
    );
  }

  // If only 1 data point, duplicate or display cleanly
  const chartPoints = data.length === 1 ? [data[0], data[0]] : data;

  const width = 640;
  const height = 180;
  const padding = { top: 20, right: 30, bottom: 30, left: 40 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const minScore = 40;
  const maxScore = 100;

  const getX = (index: number) => {
    if (chartPoints.length <= 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (chartPoints.length - 1)) * innerWidth;
  };

  const getY = (val: number) => {
    const clamped = Math.max(minScore, Math.min(maxScore, val));
    return padding.top + innerHeight - ((clamped - minScore) / (maxScore - minScore)) * innerHeight;
  };

  // Generate SVG path string
  const pathD = chartPoints.reduce((acc, curr, idx) => {
    const x = getX(idx);
    const y = getY(curr.score);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Gradient area path string
  const areaD = `${pathD} L ${getX(chartPoints.length - 1)} ${padding.top + innerHeight} L ${getX(0)} ${
    padding.top + innerHeight
  } Z`;

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-[#282C24] bg-[#1B1E19] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-[#A7B09C]">
          Score Trajectory
        </span>
        {hoveredPoint ? (
          <div className="text-xs font-mono tabular-nums text-[#C6F36B]">
            {hoveredPoint.role} · {hoveredPoint.score.toFixed(1)}/100
          </div>
        ) : (
          <span className="text-xs text-[#74796F]">Across recent evaluations</span>
        )}
      </div>

      <div className="w-full aspect-[16/6] min-h-[160px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C6F36B" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#C6F36B" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[50, 75, 100].map((level) => {
            const y = getY(level);
            return (
              <g key={level}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#282C24"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-[#74796F] text-[9px] font-mono tabular-nums"
                >
                  {level}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#scoreGlow)" />

          {/* Line stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="#C6F36B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data point dots */}
          {chartPoints.map((pt, idx) => {
            const cx = getX(idx);
            const cy = getY(pt.score);
            return (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r="4.5"
                className="fill-[#111310] stroke-[#C6F36B] stroke-[2] cursor-pointer transition-transform hover:scale-150"
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};
