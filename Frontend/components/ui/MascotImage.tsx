'use client';

import Image from 'next/image';
import { useState } from 'react';

interface MascotImageProps {
  mascot: string;
  alt: string;
  size?: number;
  className?: string;
  priority?: boolean;
}

export function MascotImage({
  mascot,
  alt,
  size = 200,
  className = '',
  priority = false
}: MascotImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Determine which optimized size to use based on requested size
  const optimizedSize = size <= 150 ? 150 : size <= 200 ? 200 : 300;

  // Remove .png extension and add size suffix
  const baseName = mascot.replace('.png', '');
  const imagePath = `/mascot/optimized/${baseName}-${optimizedSize}.webp`;

  return (
    <div className={`relative ${className}`} style={{ width: `${size}px`, height: `${size}px` }}>
      <Image
        src={imagePath}
        alt={alt}
        width={size}
        height={size}
        loading={priority ? 'eager' : 'lazy'}
        onLoadingComplete={() => setIsLoading(false)}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}
    </div>
  );
}
