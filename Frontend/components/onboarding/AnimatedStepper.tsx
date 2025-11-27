'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ANIMATION_DURATION, EASING } from '@/utils/animations';

interface AnimatedStepperProps {
  currentStep: number; // 1-6
  steps: string[]; // Array of step labels (6 items)
}

export function AnimatedStepper({ currentStep, steps }: AnimatedStepperProps) {
  // Respect user's motion preferences
  const shouldReduceMotion = useReducedMotion();

  // Ensure we have exactly 6 steps
  if (steps.length !== 6) {
    console.warn('AnimatedStepper expects exactly 6 steps');
  }

  return (
    <>
      {/* Desktop View: Horizontal Stepper */}
      <div className="hidden md:flex items-start justify-between w-full" role="navigation" aria-label="Onboarding progress">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isFuture = stepNumber > currentStep;

          return (
            <div key={stepNumber} className="flex items-center flex-1 last:flex-initial">
              {/* Step Container */}
              <div className="flex flex-col items-center relative">
                {/* Step Circle */}
                <motion.div
                  className={cn(
                    'relative flex items-center justify-center rounded-full border-2',
                    'w-10 h-10 transition-colors duration-300',
                    {
                      'bg-green-500 border-green-500 text-white': isCompleted,
                      'bg-blue-500 border-blue-500 text-white': isCurrent,
                      'bg-gray-300 border-gray-300 text-gray-500': isFuture,
                    }
                  )}
                  initial={false}
                  animate={isCurrent && !shouldReduceMotion ? {
                    scale: [1, 1.05, 1],
                  } : {
                    scale: 1,
                  }}
                  transition={{
                    repeat: isCurrent && !shouldReduceMotion ? Infinity : 0,
                    duration: 2,
                    ease: 'easeInOut',
                  }}
                  aria-label={`Step ${stepNumber}: ${label}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {/* Pulsing Border for Current Step */}
                  {isCurrent && !shouldReduceMotion && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-blue-500"
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: 'easeOut',
                      }}
                      style={{
                        willChange: 'transform, opacity',
                      }}
                      aria-hidden="true"
                    />
                  )}

                  {/* Step Content: Checkmark or Number */}
                  {isCompleted ? (
                    <motion.div
                      initial={shouldReduceMotion ? { opacity: 1 } : { x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : ANIMATION_DURATION.slower / 1000,
                        ease: [0.34, 1.56, 0.64, 1],
                      }}
                    >
                      <Check className="w-5 h-5" aria-hidden="true" />
                    </motion.div>
                  ) : (
                    <span className="text-sm font-semibold" aria-hidden="true">
                      {stepNumber}
                    </span>
                  )}
                </motion.div>

                {/* Step Label */}
                <motion.span
                  className={cn(
                    'mt-2 text-xs text-center whitespace-nowrap max-w-[80px]',
                    {
                      'font-semibold text-foreground': isCurrent,
                      'font-medium text-muted-foreground': !isCurrent,
                    }
                  )}
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {label}
                </motion.span>
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 mb-6">
                  <div className="h-0.5 bg-gray-300 rounded-full overflow-hidden relative">
                    <motion.div
                      className="h-full bg-green-500 absolute top-0 left-0"
                      initial={{ width: '0%' }}
                      animate={{
                        width: isCompleted ? '100%' : '0%',
                      }}
                      transition={{
                        duration: ANIMATION_DURATION.slowest / 1000,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile View: Dots with Progress Bar */}
      <div className="md:hidden w-full" role="navigation" aria-label="Onboarding progress">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep} of {steps.length}</span>
            <span>{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: '0%' }}
              animate={{
                width: `${(currentStep / steps.length) * 100}%`,
              }}
              transition={{
                duration: ANIMATION_DURATION.slowest / 1000,
                ease: [0.4, 0, 0.2, 1],
              }}
            />
          </div>
        </div>

        {/* Current Step Label */}
        <div className="text-center mb-4">
          <p className="text-lg font-semibold text-foreground">
            {steps[currentStep - 1]}
          </p>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center items-center gap-2">
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <motion.div
                key={stepNumber}
                className={cn(
                  'rounded-full transition-all duration-300',
                  {
                    'w-3 h-3 bg-green-500': isCompleted,
                    'w-4 h-4 bg-blue-500': isCurrent,
                    'w-2 h-2 bg-gray-300': !isCompleted && !isCurrent,
                  }
                )}
                animate={isCurrent && !shouldReduceMotion ? {
                  scale: [1, 1.2, 1],
                } : {
                  scale: 1,
                }}
                transition={{
                  repeat: isCurrent && !shouldReduceMotion ? Infinity : 0,
                  duration: 2,
                  ease: 'easeInOut',
                }}
                aria-label={`Step ${stepNumber}: ${label}`}
                aria-current={isCurrent ? 'step' : undefined}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
