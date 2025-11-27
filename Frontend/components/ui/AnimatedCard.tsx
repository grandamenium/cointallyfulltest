'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: 'lift' | 'scale' | 'glow';
  onClick?: () => void;
}

export function AnimatedCard({
  children,
  className = '',
  hoverEffect = 'lift',
  onClick
}: AnimatedCardProps) {
  const hoverVariants = {
    lift: {
      y: -4,
      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
      transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const }
    },
    scale: {
      scale: 1.02,
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)',
      transition: { duration: 0.25 }
    },
    glow: {
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
      borderColor: 'rgba(59, 130, 246, 0.8)',
      transition: { duration: 0.25 }
    }
  };

  return (
    <motion.div
      className={`rounded-lg border border-gray-200 bg-white p-6 transition-all duration-250 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      whileHover={hoverVariants[hoverEffect]}
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
      {children}
    </motion.div>
  );
}
