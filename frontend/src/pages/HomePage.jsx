import React, { useState, useEffect } from 'react';
import { videoApi } from '../api/video.api';
import { VideoGrid } from '../components/video/VideoGrid';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { Sparkles, Tv, Flame, Tag } from 'lucide-react';

export const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { activeTab, setActiveTab } = useUI();
  const [videos, setVideos] = useState([]);
  const [dynamicTags, setDynamicTags] = useState(['All', 'Subscribed', 'Trending']);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch available tags from backend
  useEffect(() => {
    videoApi.getAllTags()
      .then((res) => {
        if (res.success && res.data) {
          setDynamicTags(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const fetchFeedVideos = async (filterId) => {
    setIsLoading(true);
    try {
      const params = {};

      if (filterId === 'Subscribed') {
        params.subscribed = 'true';
      } else if (filterId === 'Trending') {
        params.sortBy = 'views';
        params.sortType = 'desc';
      } else if (filterId !== 'All') {
        params.tag = filterId;
      }

      const res = await videoApi.getAllVideos(params);
      if (res.success && res.data) {
        setVideos(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch home videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedVideos(activeTab);
  }, [activeTab, isAuthenticated]);

  const handleChipClick = (chipId) => {
    setActiveTab(chipId);
  };

  const getChipIcon = (tag) => {
    if (tag === 'All') return Sparkles;
    if (tag === 'Subscribed') return Tv;
    if (tag === 'Trending') return Flame;
    return null;
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Filter Chips Bar */}
      <div className="sticky top-14 z-20 bg-[#0f0f0f]/95 backdrop-blur-sm -mx-4 px-4 md:-mx-6 md:px-6 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#272727]/50">
        {dynamicTags.map((tag) => {
          if (tag === 'Subscribed' && !isAuthenticated) return null;
          const Icon = getChipIcon(tag);
          const isActive = activeTab === tag;

          return (
            <button
              key={tag}
              onClick={() => handleChipClick(tag)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-[#272727] text-[#f1f1f1] hover:bg-[#3f3f3f]'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tag}</span>
            </button>
          );
        })}
      </div>

      {/* Main Video Feed */}
      <VideoGrid
        videos={videos}
        isLoading={isLoading}
        emptyMessage={
          activeTab === 'Subscribed'
            ? "No videos from your subscribed channels yet. Try subscribing to more creators!"
            : `No videos found under tag "${activeTab}".`
        }
      />
    </div>
  );
};
