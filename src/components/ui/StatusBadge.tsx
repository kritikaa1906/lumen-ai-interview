import React from 'react';

interface StatusBadgeProps {
  status: 'created' | 'in_progress' | 'completed' | 'abandoned' | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const formatText = () => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'abandoned':
        return 'Archived';
      case 'created':
        return 'Ready';
      default:
        return status;
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'completed':
        return 'text-[#C6F36B]';
      case 'in_progress':
        return 'text-[#E5E7EB]';
      case 'abandoned':
        return 'text-[#74796F]';
      default:
        return 'text-[#A7B09C]';
    }
  };

  // Zero-pill rule: Clean unboxed text with typography, no pill capsule
  return (
    <span className={`text-xs font-medium tracking-wide uppercase ${getTextColor()}`}>
      {formatText()}
    </span>
  );
};
