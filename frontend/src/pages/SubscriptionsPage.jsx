import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { subscriptionApi } from '../api/subscription.api';
import { videoApi } from '../api/video.api';
import { VideoGrid } from '../components/video/VideoGrid';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { Tv, UserPlus, Users } from 'lucide-react';
import { formatSubscribers } from '../utils/formatters';

export const SubscriptionsPage = () => {
  const { isAuthenticated } = useAuth();
  const [channels, setChannels] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    Promise.all([
      subscriptionApi.getSubscribedChannels(),
      videoApi.getAllVideos({ subscribed: 'true' }),
    ])
      .then(([chanRes, vidRes]) => {
        if (chanRes.success && chanRes.data) {
          setChannels(chanRes.data);
        }
        if (vidRes.success && vidRes.data) {
          setVideos(vidRes.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load subscriptions:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4 max-w-md mx-auto p-4">
        <div className="p-4 bg-red-500/10 text-red-500 rounded-full">
          <Tv className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-white">Don’t miss new videos</h2>
        <p className="text-sm text-[#aaaaaa]">
          Sign in to see updates from your favorite YouTube and NoAdTube channels.
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Subscribed Channels Avatar Carousel */}
      {channels.length > 0 && (
        <div className="flex flex-col gap-3 pb-6 border-b border-[#272727]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-red-500" />
              Subscribed Channels ({channels.length})
            </h2>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
            {channels.map((sub) => {
              const channel = sub.channel;
              if (!channel) return null;
              return (
                <Link
                  key={sub._id}
                  to={`/channel/${channel.username}`}
                  className="flex flex-col items-center gap-2 min-w-[80px] group"
                >
                  <div className="relative p-0.5 rounded-full ring-2 ring-transparent group-hover:ring-red-500 transition-all">
                    <Avatar
                      src={channel.avatar}
                      alt={channel.fullname || channel.username}
                      size="lg"
                    />
                  </div>
                  <span className="text-xs text-[#f1f1f1] group-hover:text-white font-medium text-center truncate max-w-[84px]">
                    {channel.fullname || channel.username}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Latest Feed from Subscribed Channels */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white">Latest Videos from Subscriptions</h2>
        <VideoGrid
          videos={videos}
          isLoading={isLoading}
          emptyMessage="No videos uploaded yet by your subscribed channels."
        />
      </div>
    </div>
  );
};
