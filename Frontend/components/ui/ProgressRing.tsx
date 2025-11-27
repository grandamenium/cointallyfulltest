'use client';

import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useEffect, useState } from 'react';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  showConfetti?: boolean;
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  showConfetti = true
}: ProgressRingProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Color based on percentage
  const getColor = () => {
    if (percentage < 30) return '#ef4444'; // red
    if (percentage < 70) return '#f59e0b'; // yellow/orange
    return '#10b981'; // green
  };

  const color = getColor();

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: mounted ? offset : circumference }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: mounted ? color : '#6b7280' }}>
            <CountUp end={percentage} duration={1.5} suffix="%" />
          </div>
          <div className="text-xs text-gray-500 mt-1">Complete</div>
        </div>
      </div>
      {/* Confetti effect at 100% */}
      {showConfetti && percentage === 100 && mounted && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-4xl">🎉</div>
        </motion.div>
      )}
    </div>
  );
}
