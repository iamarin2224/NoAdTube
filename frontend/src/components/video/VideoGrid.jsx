import React from 'react';
import { VideoCard } from './VideoCard';
import { VideoCardSkeleton } from '../common/Skeleton';
import { Film } from 'lucide-react';

export const VideoGrid = ({ videos = [], isLoading = false, emptyMessage = 'No videos found.' }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <VideoCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <div className="p-4 bg-[#1f1f1f] rounded-full text-[#aaaaaa]">
          <Film className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-semibold text-[#f1f1f1]">{emptyMessage}</h3>
        <p className="text-sm text-[#aaaaaa] max-w-md">
          Explore trending topics, subscribe to creators, or upload your own video to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
};
