'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MascotImage } from '@/components/ui/MascotImage';

interface GeneratingAnimationProps {
  onComplete?: () => void;
}

interface StatusMessage {
  threshold: number;
  message: string;
}

// Status messages
const STATUS_MESSAGES: StatusMessage[] = [
  { threshold: 0, message: 'Gathering transaction data...' },
  { threshold: 20, message: 'Calculating capital gains...' },
  { threshold: 40, message: 'Applying tax methods...' },
  { threshold: 60, message: 'Generating forms...' },
  { threshold: 80, message: 'Almost done...' },
];

export function GeneratingAnimation({ onComplete }: GeneratingAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Gathering transaction data...');
  const [timeRemaining, setTimeRemaining] = useState(30);
  const shouldReduceMotion = useReducedMotion();

  // Simulate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Call onComplete after a short delay for better UX
          setTimeout(() => {
            onComplete?.();
          }, 500);
          return 100;
        }
        return prev + 1.25; // ~8 seconds total (100 / 1.25 * 100ms)
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  // Update status message based on progress
  useEffect(() => {
    const current = [...STATUS_MESSAGES]
      .reverse()
      .find(s => progress >= s.threshold);
    if (current) setStatus(current.message);
  }, [progress]);

  // Countdown timer
  useEffect(() => {
    setTimeRemaining(Math.max(1, Math.ceil((100 - progress) / 100 * 30)));
  }, [progress]);

  return (
    <div className="flex flex-col items-center space-y-8 py-12">
      {/* Mascot with bounce */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [-5, 5, -5] }}
        transition={
          shouldReduceMotion
            ? {}
            : {
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      >
        <MascotImage
          mascot="mascot-at-desk-analyzing-charts.png"
          alt="CoinTally mascot analyzing charts"
          size={200}
        />
      </motion.div>

      {/* Status message */}
      <motion.h3
        key={status}
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
        className="text-xl font-semibold text-gray-700 dark:text-gray-300"
      >
        {status}
      </motion.h3>

      {/* Progress bar with shimmer */}
      <div className="w-full max-w-md space-y-2">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden relative">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full relative overflow-hidden"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Shimmer overlay */}
            {!shouldReduceMotion && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{ width: '100%' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            )}
          </motion.div>
        </div>

        {/* Progress percentage and time remaining */}
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium">{Math.floor(progress)}%</span>
          <motion.span
            animate={
              shouldReduceMotion
                ? {}
                : progress >= 95
                ? { opacity: 0 }
                : { opacity: 1 }
            }
            transition={{ duration: 0.3 }}
          >
            ~{timeRemaining}s remaining
          </motion.span>
        </div>
      </div>

      {/* Additional context */}
      <p className="text-sm text-muted-foreground text-center max-w-md">
        Please wait while we process your transactions and generate your tax forms.
        This usually takes just a few seconds.
      </p>
    </div>
  );
}
