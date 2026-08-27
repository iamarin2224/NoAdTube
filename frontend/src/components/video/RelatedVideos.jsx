import React, { useEffect, useState } from 'react';
import { videoApi } from '../../api/video.api';
import { VideoCard } from './VideoCard';
import { Skeleton } from '../common/Skeleton';

export const RelatedVideos = ({ currentVideoId, onRelatedLoaded }) => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    videoApi
      .getAllVideos({ limit: 15 })
      .then((res) => {
        if (res.success && res.data) {
          const filtered = res.data.filter((v) => v._id !== currentVideoId);
          setVideos(filtered);
          if (onRelatedLoaded) {
            onRelatedLoaded(filtered);
          }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [currentVideoId]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-40 h-24 rounded-xl flex-shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-bold text-white mb-1">Up Next</h3>
      {videos.map((video) => (
        <VideoCard 
          key={video._id} 
          video={video} 
          horizontal 
          isCompact={true}
          hideChannel={false} 
        />
      ))}
    </div>
  );
};
