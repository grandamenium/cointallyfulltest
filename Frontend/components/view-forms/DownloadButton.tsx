'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Check, X, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type DownloadState = 'idle' | 'downloading' | 'success' | 'error';
type DownloadFormat = 'PDF' | 'CSV';

interface DownloadButtonProps {
  formId: string;
  fileSize?: string;
  onDownload?: (format: DownloadFormat) => Promise<void>;
  className?: string;
}

export function DownloadButton({
  formId,
  fileSize = '2.3 MB',
  onDownload,
  className,
}: DownloadButtonProps) {
  const [state, setState] = useState<DownloadState>('idle');
  const [progress, setProgress] = useState(0);
  const [format, setFormat] = useState<DownloadFormat>('PDF');
  const [errorMessage, setErrorMessage] = useState('');

  const handleDownload = async (selectedFormat: DownloadFormat) => {
    setFormat(selectedFormat);
    setState('downloading');
    setProgress(0);
    setErrorMessage('');

    try {
      // Simulate download progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      if (onDownload) {
        await onDownload(selectedFormat);
      } else {
        // Default download behavior
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      clearInterval(progressInterval);
      setProgress(100);
      setState('success');

      // Reset to idle after success animation
      setTimeout(() => {
        setState('idle');
        setProgress(0);
      }, 2000);
    } catch (error) {
      setState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Download failed');

      // Reset to idle after error is shown
      setTimeout(() => {
        setState('idle');
        setProgress(0);
        setErrorMessage('');
      }, 3000);
    }
  };

  const getButtonContent = () => {
    switch (state) {
      case 'downloading':
        return (
          <div className="flex items-center gap-2">
            <div className="relative h-4 w-4">
              {/* Background circle */}
              <svg className="h-4 w-4 -rotate-90 transform">
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="opacity-25"
                />
              </svg>
              {/* Progress circle */}
              <svg className="absolute inset-0 h-4 w-4 -rotate-90 transform">
                <motion.circle
                  cx="8"
                  cy="8"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: '0 100' }}
                  animate={{
                    strokeDasharray: `${progress * 0.377} 100`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </svg>
            </div>
            <span className="text-sm">{progress}%</span>
          </div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.5 }}
          >
            <Check className="h-4 w-4 text-green-600" />
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-600">{errorMessage || 'Failed'}</span>
          </motion.div>
        );

      default:
        return (
          <>
            <Download className="h-4 w-4" />
            <span>Download</span>
          </>
        );
    }
  };

  if (state === 'downloading' || state === 'success' || state === 'error') {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className={cn('min-w-[120px]', className)}
      >
        {getButtonContent()}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn('group relative', className)}
            title={`File size: ${fileSize}`}
          >
            <Download className="mr-2 h-4 w-4" />
            <span>Download</span>
            <ChevronDown className="ml-1 h-3 w-3 opacity-50" />

            {/* Hover tooltip */}
            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              {fileSize}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleDownload('PDF')}>
            <Download className="mr-2 h-4 w-4" />
            Download as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownload('CSV')}>
            <Download className="mr-2 h-4 w-4" />
            Download as CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
