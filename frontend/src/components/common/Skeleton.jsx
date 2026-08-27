import React from 'react';

export const Skeleton = ({ className = '', rounded = 'rounded-md' }) => {
  return <div className={`skeleton ${rounded} ${className}`} />;
};

export const VideoCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-3">
      {/* Thumbnail Skeleton */}
      <Skeleton className="w-full aspect-video rounded-xl" />
      {/* Meta Skeleton */}
      <div className="flex gap-3">
        <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    </div>
  );
};
