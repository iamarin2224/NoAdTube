import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { videoApi } from '../api/video.api';
import { VideoCard } from '../components/video/VideoCard';
import { Skeleton } from '../components/common/Skeleton';
import { Search, Film } from 'lucide-react';

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search_query') || '';

  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsLoading(true);
      videoApi
        .getAllVideos({ query: searchQuery.trim() })
        .then((res) => {
          if (res.success && res.data) {
            setVideos(res.data);
          }
        })
        .catch((err) => {
          console.error('Search query error:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setVideos([]);
      setIsLoading(false);
    }
  }, [searchQuery]);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto flex flex-col gap-6">
      {/* Search Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-[#272727]">
        <Search className="w-5 h-5 text-red-500" />
        <h2 className="text-lg font-semibold text-white">
          Results for <span className="text-red-400">"{searchQuery}"</span>
        </h2>
        <span className="text-xs text-[#aaaaaa] ml-auto">
          {videos.length} {videos.length === 1 ? 'match' : 'matches'}
        </span>
      </div>

      {/* Results List */}
      {isLoading ? (
        <div className="flex flex-col gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="w-full sm:w-64 aspect-video rounded-xl flex-shrink-0" />
              <div className="flex flex-col gap-2.5 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
                <div className="flex items-center gap-2 mt-2">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-10 w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className="flex flex-col gap-6">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} horizontal={true} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="p-4 bg-[#1f1f1f] rounded-full text-[#aaaaaa]">
            <Film className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-semibold text-white">No results found</h3>
          <p className="text-sm text-[#aaaaaa] max-w-md">
            Try different keywords or check for spelling errors. You can also browse trending content on the Home page.
          </p>
          <Link
            to="/"
            className="mt-2 px-5 py-2 bg-[#272727] hover:bg-[#3f3f3f] text-white rounded-full text-sm font-medium transition-colors"
          >
            Explore Home Feed
          </Link>
        </div>
      )}
    </div>
  );
};
