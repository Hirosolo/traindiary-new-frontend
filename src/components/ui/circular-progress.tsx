import React from "react";

interface CircularProgressProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  icon: string;
  color: string;
  backgroundColor?: string;
  size?: number;
  strokeWidth?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  label,
  unit = "",
  icon,
  color,
  backgroundColor = "rgba(255, 255, 255, 0.05)",
  size = 160,
  strokeWidth = 8,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(100, (value / max) * 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color mapping for the progress stroke
  const colorClasses: Record<string, string> = {
    "text-blue-500": "#3b82f6",
    "text-orange-500": "#f97316",
    "text-purple-500": "#a855f7",
    "text-primary": "#3b82f6",
  };

  const strokeColor = colorClasses[color] || "#3b82f6";

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.5s ease-in-out",
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`p-2 rounded-lg ${color} bg-opacity-10 mb-1`}>
            <span className="material-symbols-outlined text-lg" style={{ color: strokeColor }}>
              {icon}
            </span>
          </div>
          <p className="text-2xl font-bold font-display text-white">
            {value}
            {unit && <span className="text-xs text-text-dim ml-0.5">{unit}</span>}
          </p>
          <p className="text-[10px] text-text-dim mt-1">{percentage.toFixed(0)}%</p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-[9px] font-bold tracking-[0.2em] text-text-dim uppercase">
          {label}
        </p>
        <p className="text-[8px] text-text-dim uppercase tracking-wider mt-1">
          {value}/{max}
        </p>
      </div>
    </div>
  );
};
