import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { VideoCard } from '../components/video/VideoCard';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';
import { History, Trash2, Film } from 'lucide-react';

export const HistoryPage = () => {
  const { isAuthenticated } = useAuth();
  const [historyVideos, setHistoryVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    authApi
      .getWatchHistory()
      .then((res) => {
        if (res.success && res.data) {
          // Filter out null or missing video entries (backend returns latest clicked first)
          const validVideos = res.data.filter((v) => v && v._id);
          setHistoryVideos(validVideos);
        }
      })
      .catch((err) => {
        console.error('Failed to load watch history:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4 max-w-md mx-auto p-4">
        <div className="p-4 bg-red-500/10 text-red-500 rounded-full">
          <History className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-white">Keep track of what you watch</h2>
        <p className="text-sm text-[#aaaaaa]">
          Watch history isn't viewable when signed out. Sign in to see your history.
        </p>
        <Link to="/login">
          <Button variant="youtube" size="md">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#272727]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Watch History</h1>
            <p className="text-xs text-[#aaaaaa]">
              Videos you've previously viewed on NoAdTube
            </p>
          </div>
        </div>
      </div>

      {/* Videos List */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-60 aspect-video rounded-xl" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : historyVideos.length > 0 ? (
        <div className="flex flex-col gap-6">
          {historyVideos.map((video) => (
            <VideoCard key={video._id} video={video} horizontal={true} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="p-4 bg-[#1f1f1f] rounded-full text-[#aaaaaa]">
            <Film className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-semibold text-white">No watch history yet</h3>
          <p className="text-sm text-[#aaaaaa] max-w-md">
            Videos that you watch will appear here so you can easily revisit them.
          </p>
          <Link
            to="/"
            className="mt-2 px-5 py-2 bg-[#272727] hover:bg-[#3f3f3f] text-white rounded-full text-sm font-medium transition-colors"
          >
            Start Watching
          </Link>
        </div>
      )}
    </div>
  );
};
