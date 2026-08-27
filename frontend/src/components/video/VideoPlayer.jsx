import React, { useRef, useEffect } from 'react';
import { videoApi } from '../../api/video.api';

export const VideoPlayer = ({ videoFile, thumbnail, videoId, onEnded }) => {
  const videoRef = useRef(null);
  const hasViewedRef = useRef(false);

  useEffect(() => {
    hasViewedRef.current = false;
  }, [videoId]);

  const handleTimeUpdate = () => {
    // Record view when user has watched at least 3 seconds
    if (
      videoRef.current &&
      videoRef.current.currentTime >= 3 &&
      !hasViewedRef.current &&
      videoId
    ) {
      hasViewedRef.current = true;
      videoApi.viewVideo(videoId).catch(() => {});
    }
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
      <video
        ref={videoRef}
        src={videoFile}
        poster={thumbnail}
        controls
        autoPlay
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={onEnded}
        className="w-full h-full object-contain focus:outline-none"
      />
    </div>
  );
};
