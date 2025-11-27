'use client';

import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { ReactNode } from 'react';

interface InteractiveStatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onClick?: () => void;
  className?: string;
}

export function InteractiveStatCard({
  title,
  value,
  icon,
  trend,
  trendValue,
  onClick,
  className = ''
}: InteractiveStatCardProps) {
  const isNumeric = typeof value === 'number';

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→'
  };

  return (
    <motion.div
      className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      whileHover={{
        y: -4,
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
        transition: { duration: 0.25 }
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="mt-2">
            {isNumeric ? (
              <CountUp
                end={value}
                duration={1.2}
                decimals={2}
                prefix="$"
                separator=","
                className="text-3xl font-extrabold text-gray-900 tabular-nums"
              />
            ) : (
              <p className="text-3xl font-extrabold text-gray-900">{value}</p>
            )}
          </div>
          {trend && trendValue && (
            <p className={`mt-2 text-sm font-medium ${trendColors[trend]}`}>
              {trendIcons[trend]} {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <motion.div
            className="rounded-full bg-blue-50 p-3"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {icon}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
