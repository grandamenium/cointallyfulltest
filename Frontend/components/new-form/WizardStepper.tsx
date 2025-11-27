'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardStepperProps {
  currentStep: number; // 1-7 (1-indexed for user display)
  steps: { id: number; label: string }[];
}

export function WizardStepper({ currentStep, steps }: WizardStepperProps) {
  const shouldReduceMotion = useReducedMotion();

  // Convert 1-indexed currentStep to 0-indexed for logic
  const currentIndex = currentStep - 1;

  return (
    <>
      {/* Desktop View - Horizontal Stepper */}
      <div className="hidden md:flex items-center justify-center gap-2 mb-8">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <motion.div
                  className={cn(
                    'relative flex items-center justify-center w-10 h-10 rounded-full transition-colors',
                    isCompleted && 'bg-green-500',
                    isActive && 'bg-blue-500',
                    isFuture && 'bg-gray-300'
                  )}
                  animate={
                    !shouldReduceMotion && isActive
                      ? {
                          scale: [1, 1.05, 1],
                        }
                      : {}
                  }
                  transition={
                    !shouldReduceMotion && isActive
                      ? {
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }
                      : {}
                  }
                >
                  {/* Pulsing border for active step */}
                  {isActive && !shouldReduceMotion && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-blue-400"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.8, 0.3, 0.8],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}

                  {/* Content - Checkmark or Number */}
                  {isCompleted ? (
                    <motion.div
                      initial={!shouldReduceMotion ? { scale: 0.8, opacity: 0 } : false}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={
                        !shouldReduceMotion
                          ? {
                              duration: 0.4,
                              ease: [0.34, 1.56, 0.64, 1], // bounce easing
                            }
                          : {}
                      }
                    >
                      <Check className="h-5 w-5 text-white" />
                    </motion.div>
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isActive && 'text-white',
                        isFuture && 'text-gray-500'
                      )}
                    >
                      {step.id}
                    </span>
                  )}
                </motion.div>

                {/* Step Label */}
                <span
                  className={cn(
                    'text-xs mt-2 transition-all',
                    isActive && 'font-medium text-foreground',
                    !isActive && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="relative w-12 h-0.5 mb-6 bg-gray-300 overflow-hidden">
                  <motion.div
                    className={cn(
                      'absolute inset-0 h-full',
                      index < currentIndex ? 'bg-green-500' : 'bg-gray-300'
                    )}
                    initial={!shouldReduceMotion ? { width: '0%' } : { width: '100%' }}
                    animate={{
                      width: index < currentIndex ? '100%' : '0%',
                    }}
                    transition={
                      !shouldReduceMotion
                        ? {
                            duration: 0.4,
                            ease: [0.4, 0, 0.2, 1],
                          }
                        : { duration: 0 }
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile View - Simplified Progress */}
      <div className="flex md:hidden flex-col items-center mb-8 space-y-4">
        {/* Current Step Display */}
        <div className="flex items-center gap-3">
          <motion.div
            className="relative flex items-center justify-center w-12 h-12 rounded-full bg-blue-500"
            animate={
              !shouldReduceMotion
                ? {
                    scale: [1, 1.05, 1],
                  }
                : {}
            }
            transition={
              !shouldReduceMotion
                ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
                : {}
            }
          >
            {/* Pulsing border */}
            {!shouldReduceMotion && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-blue-400"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.8, 0.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
            <span className="text-base font-semibold text-white relative z-10">
              {currentStep}
            </span>
          </motion.div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {steps[currentIndex]?.label}
            </span>
            <span className="text-xs text-muted-foreground">
              Step {currentStep} of {steps.length}
            </span>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-2">
          {steps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;

            return (
              <motion.div
                key={step.id}
                className={cn(
                  'rounded-full transition-all',
                  isCompleted && 'w-2 h-2 bg-green-500',
                  isActive && 'w-3 h-3 bg-blue-500',
                  !isCompleted && !isActive && 'w-2 h-2 bg-gray-300'
                )}
                initial={!shouldReduceMotion ? { scale: 0 } : false}
                animate={{ scale: 1 }}
                transition={
                  !shouldReduceMotion
                    ? {
                        duration: 0.3,
                        delay: index * 0.05,
                      }
                    : {}
                }
              />
            );
          })}
        </div>

        {/* Progress Percentage */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-muted-foreground">Progress</span>
            <span className="text-xs font-semibold text-foreground">
              {Math.round((currentIndex / (steps.length - 1)) * 100)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              initial={!shouldReduceMotion ? { width: '0%' } : false}
              animate={{
                width: `${(currentIndex / (steps.length - 1)) * 100}%`,
              }}
              transition={
                !shouldReduceMotion
                  ? {
                      duration: 0.5,
                      ease: [0.4, 0, 0.2, 1],
                    }
                  : { duration: 0 }
              }
            />
          </div>
        </div>
      </div>
    </>
  );
}
