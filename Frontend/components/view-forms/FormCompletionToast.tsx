'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FormCompletionToastProps {
  taxYear: number;
  onViewClick: () => void;
  onClose: () => void;
}

export function FormCompletionToast({
  taxYear,
  onViewClick,
  onClose,
}: FormCompletionToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
      className="fixed bottom-4 right-4 z-50 flex max-w-md items-start gap-3 rounded-lg border bg-white p-4 shadow-lg"
    >
      {/* Mascot */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.5, delay: 0.2 }}
      >
        <Image
          src="/mascot/mascot-sitting-on-money.png"
          alt="Success"
          width={64}
          height={64}
          className="flex-shrink-0"
        />
      </motion.div>

      {/* Content */}
      <div className="flex-1">
        <h4 className="mb-1 font-semibold">Your {taxYear} tax forms are ready!</h4>
        <p className="mb-3 text-sm text-muted-foreground">
          Click below to view and download your completed tax forms.
        </p>
        <Button variant="outline" size="sm" onClick={onViewClick}>
          View Now
        </Button>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
