import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { likeApi } from '../api/like.api';
import { VideoCard } from '../components/video/VideoCard';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, Play, Film } from 'lucide-react';
import { encodeId } from '../utils/idEncoder';

export const LikedVideosPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [likedList, setLikedList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    likeApi
      .getLikedVideos()
      .then((res) => {
        if (res.success && res.data) {
          setLikedList(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load liked videos:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4 max-w-md mx-auto p-4">
        <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full">
          <ThumbsUp className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-white">Save videos you like</h2>
        <p className="text-sm text-[#aaaaaa]">
          Sign in to access videos you've liked across NoAdTube.
        </p>
        <Link to="/login">
          <Button variant="youtube" size="md">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  const firstVideo = likedList[0]?.video;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Left Playlist Banner (YouTube Style) */}
      <div className="lg:w-80 flex-shrink-0 flex flex-col gap-4 bg-gradient-to-b from-emerald-950/60 to-zinc-900 border border-[#272727] rounded-2xl p-6 h-fit">
        {firstVideo ? (
          <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-lg">
            <img
              src={firstVideo.thumbnail}
              alt="Playlist preview"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video w-full bg-[#1f1f1f] rounded-xl flex items-center justify-center text-emerald-400">
            <ThumbsUp className="w-12 h-12" />
          </div>
        )}

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-white">Liked Videos</h1>
          <p className="text-sm text-[#aaaaaa]">{user?.fullname || user?.username}</p>
          <span className="text-xs text-[#717171] mt-1">
            {likedList.length} {likedList.length === 1 ? 'video' : 'videos'}
          </span>
        </div>

        {firstVideo && (
          <Link to={`/watch/${encodeId(firstVideo._id)}`}>
            <Button variant="primary" size="md" icon={Play} className="w-full mt-2 font-bold">
              Play All
            </Button>
          </Link>
        )}
      </div>

      {/* Right List of Videos */}
      <div className="flex-1 flex flex-col gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-56 aspect-video rounded-xl" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))
        ) : likedList.length > 0 ? (
          likedList.map((item, index) => {
            if (!item.video) return null;
            return (
              <div key={item._id} className="flex items-center gap-3">
                <span className="text-xs text-[#717171] font-semibold w-5 text-right">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <VideoCard video={item.video} horizontal={true} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3 bg-[#181818] border border-[#272727] rounded-2xl p-8">
            <Film className="w-10 h-10 text-[#aaaaaa]" />
            <h3 className="text-base font-semibold text-white">No liked videos yet</h3>
            <p className="text-xs text-[#aaaaaa] max-w-sm">
              Tap the thumbs up button on any video you enjoy to save it to your Liked Videos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
