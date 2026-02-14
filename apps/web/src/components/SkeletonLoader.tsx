import { cn } from '../lib/utils';

export function SkeletonLoader() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6 max-w-6xl mx-auto p-4">
      {/* Chessboard Skeleton */}
      <div className="flex items-center justify-center">
        <div className="frosted-glass p-4 md:p-6 space-y-4 w-full max-w-[600px]">
          <div className="aspect-square w-full bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse">
            {/* 8x8 Grid Shimmer */}
            <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'border border-gray-300/20 dark:border-gray-600/20',
                    (Math.floor(i / 8) + (i % 8)) % 2 === 0
                      ? 'bg-white/10 dark:bg-white/5'
                      : 'bg-black/5 dark:bg-black/10'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Game Info Skeleton */}
      <div className="space-y-4">
        <div className="frosted-glass p-6 space-y-4">
          {/* Player Color */}
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>

          {/* Turn Indicator */}
          <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>

          {/* Share Link */}
          <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>

        {/* Move History Skeleton */}
        <div className="frosted-glass p-4 space-y-2 hidden lg:block">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
