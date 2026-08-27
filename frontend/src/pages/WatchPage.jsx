import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { videoApi } from '../api/video.api';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { VideoActions } from '../components/video/VideoActions';
import { VideoDescription } from '../components/video/VideoDescription';
import { RelatedVideos } from '../components/video/RelatedVideos';
import { CommentSection } from '../components/comment/CommentSection';
import { Skeleton } from '../components/common/Skeleton';
import { useQueue } from '../context/QueueContext';
import { decodeId } from '../utils/idEncoder';
import { AlertCircle } from 'lucide-react';

export const WatchPage = () => {
  const { videoId: paramVideoId } = useParams();
  const rawVideoId = decodeId(paramVideoId);

  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { playNextInQueue } = useQueue();

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(true);
    setError('');

    videoApi
      .getVideoById(rawVideoId)
      .then((res) => {
        if (res.success && res.data) {
          setVideo(res.data);
        } else {
          setError('Video not found or has been removed.');
        }
      })
      .catch((err) => {
        console.error('Error fetching video:', err);
        setError('Failed to load video details.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [rawVideoId]);

  const handleVideoEnded = () => {
    playNextInQueue(rawVideoId, relatedVideos);
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Skeleton className="w-full aspect-video rounded-2xl" />
          <Skeleton className="h-6 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/6" />
            </div>
          </div>
          <Skeleton className="h-28 w-full rounded-xl mt-4" />
        </div>
        <div className="hidden lg:flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-40 h-24 rounded-xl flex-shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4 max-w-md mx-auto p-4">
        <div className="p-4 bg-red-500/10 text-red-400 rounded-full">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-white">Video Unavailable</h2>
        <p className="text-sm text-[#aaaaaa]">
          {error || 'This video does not exist or may have been deleted.'}
        </p>
        <Link
          to="/"
          className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-semibold transition-colors mt-2"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Player, Video Meta, Comments */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Video Player with Autoplay / Queue progression */}
          <VideoPlayer
            videoFile={video.videoFile}
            thumbnail={video.thumbnail}
            videoId={video._id}
            onEnded={handleVideoEnded}
          />

          {/* Video Title */}
          <h1 className="text-xl md:text-2xl font-bold text-white mt-4 leading-tight">
            {video.title}
          </h1>

          {/* Action Bar (Channel info, Subscribe, Like, Share, Save to Playlist, Queue) */}
          <VideoActions video={video} onVideoUpdate={setVideo} />

          {/* Expandable Description with Tags */}
          <VideoDescription video={video} />

          {/* Comments Thread */}
          <CommentSection type="video" id={video._id} />
        </div>

        {/* Right Column: Up Next / Related Videos */}
        <div className="flex flex-col">
          <RelatedVideos 
            currentVideoId={video._id} 
            onRelatedLoaded={setRelatedVideos}
          />
        </div>
      </div>
    </div>
  );
};
