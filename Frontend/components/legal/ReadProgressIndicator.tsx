'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ReadProgressIndicator() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, scrollProgress)));
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="sticky top-0 z-50 h-1 w-full bg-muted">
      <div
        className={cn(
          "h-full bg-gradient-primary transition-all duration-150 ease-out"
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
