import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerWidgetProps {
  timeLimitMinutes?: number;
  onTimeExpired?: () => void;
  onTick?: (secondsElapsed: number) => void;
}

export const TimerWidget: React.FC<TimerWidgetProps> = ({
  timeLimitMinutes = 0,
  onTimeExpired,
  onTick,
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const isTimed = timeLimitMinutes > 0;
  const totalLimitSeconds = timeLimitMinutes * 60;
  const secondsRemaining = isTimed ? Math.max(0, totalLimitSeconds - secondsElapsed) : 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => {
        const next = prev + 1;
        if (onTick) onTick(next);

        if (isTimed && next >= totalLimitSeconds) {
          clearInterval(timer);
          if (onTimeExpired) onTimeExpired();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimed, totalLimitSeconds, onTimeExpired, onTick]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isWarning = isTimed && secondsRemaining <= 300 && secondsRemaining > 60;
  const isCritical = isTimed && secondsRemaining <= 60;

  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono tabular-nums border transition-colors ${
        isCritical
          ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444] animate-pulse'
          : isWarning
          ? 'bg-[#EAB308]/20 border-[#EAB308] text-[#EAB308]'
          : 'bg-[#111310] border-[#282C24] text-[#A7B09C]'
      }`}
    >
      {isCritical || isWarning ? (
        <AlertTriangle className="w-3.5 h-3.5" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-[#C6F36B]" />
      )}
      <span>
        {isTimed ? `${formatTime(secondsRemaining)} left` : `${formatTime(secondsElapsed)} elapsed`}
      </span>
    </div>
  );
};
