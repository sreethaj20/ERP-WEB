import React from 'react';
import './AttendanceCircle.css';

const AttendanceCircle = ({ presentDays, totalDays = 22, size = 120, strokeWidth = 12 }) => {
  // Calculate percentage and ensure it's between 0 and 100
  const percentage = Math.min(100, Math.max(0, (presentDays / totalDays) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color based on attendance percentage
  const getColor = () => {
    if (percentage >= 90) return '#10B981'; // Green for good attendance
    if (percentage >= 75) return '#F59E0B'; // Yellow for average
    return '#EF4444'; // Red for poor attendance
  };

  return (
    <div className="attendance-circle-container">
      <svg width={size} height={size} className="attendance-svg">
        {/* Background circle */}
        <circle
          className="attendance-circle-bg"
          stroke="#E5E7EB"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className="attendance-circle-progress"
          stroke={getColor()}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 0.6s ease-out, stroke 0.6s ease-out'
          }}
        />
      </svg>
      <div className="attendance-text">
        <span className="attendance-percentage">{Math.round(percentage)}%</span>
        <span className="attendance-days">{presentDays}/{totalDays} days</span>
      </div>
    </div>
  );
};

export default AttendanceCircle;
