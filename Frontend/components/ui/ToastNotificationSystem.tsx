'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, ReactNode } from 'react';
import { MascotImage } from './MascotImage';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  mascot?: string;
  duration?: number;
  position?: 'top-right' | 'bottom-right' | 'top-center';
}

const toastColors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
};

const toastIcons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
};

interface ToastNotificationProps extends ToastProps {
  onDismiss: (id: string) => void;
}

function Toast({ id, message, type, mascot, duration = 5000, onDismiss }: ToastNotificationProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onDismiss(id);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [id, duration, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
      className={`relative flex items-start gap-3 rounded-lg border p-4 shadow-lg ${toastColors[type]} mb-3`}
    >
      {mascot && (
        <MascotImage mascot={mascot} alt="Notification mascot" size={48} />
      )}
      {!mascot && (
        <span className="text-xl">{toastIcons[type]}</span>
      )}
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
        <motion.div
          className="h-full bg-current"
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}

export function ToastNotificationSystem({ toasts, position = 'top-right' }: {
  toasts: ToastProps[];
  position?: 'top-right' | 'bottom-right' | 'top-center';
}) {
  const [activeToasts, setActiveToasts] = useState<ToastProps[]>(toasts);

  useEffect(() => {
    setActiveToasts(toasts);
  }, [toasts]);

  const handleDismiss = (id: string) => {
    setActiveToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 max-w-md`}>
      <AnimatePresence>
        {activeToasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={handleDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
