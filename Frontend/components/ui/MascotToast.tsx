'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { MascotImage } from './MascotImage';
import { Button } from './button';

export interface MascotToastProps {
  mascotImage: string;
  message: string;
  buttonText?: string;
  buttonAction?: () => void;
  onClose: () => void;
  variant?: 'info' | 'success' | 'warning' | 'error';
  position?: 'top-right' | 'bottom-right' | 'top-center';
  autoClose?: boolean;
  duration?: number;
}

export function MascotToast({
  mascotImage,
  message,
  buttonText,
  buttonAction,
  onClose,
  variant = 'info',
  position = 'top-right',
  autoClose = true,
  duration = 5000,
}: MascotToastProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
  };

  const variantStyles = {
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
    success: 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800',
  };

  // Auto-close effect
  if (autoClose && duration) {
    setTimeout(() => {
      onClose();
    }, duration);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: position.includes('right') ? 100 : 0, y: position.includes('top') ? -20 : 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: position.includes('right') ? 100 : 0 }}
      transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
      className={`fixed ${positionClasses[position]} z-50 flex max-w-md items-start gap-3 rounded-lg border-2 p-4 shadow-lg ${variantStyles[variant]}`}
    >
      <MascotImage
        mascot={mascotImage}
        alt="CoinTally Mascot"
        size={60}
        className="shrink-0"
      />
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
        {buttonText && buttonAction && (
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => {
              buttonAction();
              onClose();
            }}
          >
            {buttonText}
          </Button>
        )}
      </div>
      <button
        onClick={onClose}
        className="shrink-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </motion.div>
  );
}
