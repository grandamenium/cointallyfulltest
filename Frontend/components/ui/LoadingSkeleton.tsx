'use client';

interface LoadingSkeletonProps {
  variant: 'text' | 'card' | 'circle' | 'stat' | 'table-row';
  count?: number;
  className?: string;
}

export function LoadingSkeleton({
  variant,
  count = 1,
  className = ''
}: LoadingSkeletonProps) {
  const shimmerClass = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]';

  const variants = {
    text: (
      <div className={`h-4 ${shimmerClass} rounded ${className}`} />
    ),
    card: (
      <div className={`rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className={`h-6 w-1/3 ${shimmerClass} rounded mb-4`} />
        <div className={`h-4 w-full ${shimmerClass} rounded mb-2`} />
        <div className={`h-4 w-5/6 ${shimmerClass} rounded`} />
      </div>
    ),
    circle: (
      <div className={`w-12 h-12 rounded-full ${shimmerClass} ${className}`} />
    ),
    stat: (
      <div className={`rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className={`h-4 w-24 ${shimmerClass} rounded mb-3`} />
        <div className={`h-8 w-32 ${shimmerClass} rounded mb-2`} />
        <div className={`h-3 w-20 ${shimmerClass} rounded`} />
      </div>
    ),
    'table-row': (
      <div className={`flex gap-4 py-3 ${className}`}>
        <div className={`h-4 w-1/4 ${shimmerClass} rounded`} />
        <div className={`h-4 w-1/4 ${shimmerClass} rounded`} />
        <div className={`h-4 w-1/4 ${shimmerClass} rounded`} />
        <div className={`h-4 w-1/4 ${shimmerClass} rounded`} />
      </div>
    )
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="mb-2">
          {variants[variant]}
        </div>
      ))}
    </>
  );
}
