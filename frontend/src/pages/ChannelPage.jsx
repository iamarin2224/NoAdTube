import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { videoApi } from '../api/video.api';
import { tweetApi } from '../api/tweet.api';
import { subscriptionApi } from '../api/subscription.api';
import { VideoGrid } from '../components/video/VideoGrid';
import { TweetCard } from '../components/tweet/TweetCard';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';
import { formatSubscribers } from '../utils/formatters';
import { BellRing, Tv, MessageSquare, Info, Film } from 'lucide-react';

export const ChannelPage = () => {
  const { username } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [activeTab, setActiveTab] = useState('videos');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const isOwner = user?.username === username?.toLowerCase();

  useEffect(() => {
    if (!username) return;
    setIsLoading(true);

    authApi
      .getChannelProfile(username)
      .then((res) => {
        if (res.success && res.data) {
          setChannel(res.data);
          // Fetch channel videos and tweets
          return Promise.all([
            videoApi.getAllVideos({ userId: res.data._id }),
            tweetApi.getAllTweets({ userId: res.data._id }),
          ]);
        }
      })
      .then(([vidRes, tweetRes]) => {
        if (vidRes?.success && vidRes.data) setVideos(vidRes.data);
        if (tweetRes?.success && tweetRes.data) setTweets(tweetRes.data);
      })
      .catch((err) => {
        console.error('Failed to load channel details:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [username]);

  const handleToggleSubscribe = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    if (isSubscribing || !channel) return;

    setIsSubscribing(true);
    const prevSub = channel.isSubsribed;
    const prevCount = channel.subscribersCount;

    setChannel((prev) => ({
      ...prev,
      isSubsribed: !prevSub,
      subscribersCount: prevSub ? Math.max(0, prevCount - 1) : prevCount + 1,
    }));

    try {
      const res = await subscriptionApi.toggleSubscription(username);
      if (res.success && res.data) {
        setChannel((prev) => ({
          ...prev,
          isSubsribed: res.data.isSubscribed,
          subscribersCount: res.data.subscribersCount,
        }));
      }
    } catch (err) {
      setChannel((prev) => ({
        ...prev,
        isSubsribed: prevSub,
        subscribersCount: prevCount,
      }));
    } finally {
      setIsSubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4 md:p-6">
        <Skeleton className="w-full h-40 md:h-56 rounded-2xl" />
        <div className="flex gap-6 items-center">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="py-20 text-center text-white">
        <h2 className="text-xl font-bold">Channel not found</h2>
        <p className="text-sm text-[#aaaaaa] mt-2">The user @{username} does not exist.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-7xl mx-auto">
      {/* Channel Cover Banner */}
      {channel.coverImage ? (
        <div className="w-full h-36 md:h-52 bg-[#181818] overflow-hidden">
          <img
            src={channel.coverImage}
            alt="Channel banner"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-28 md:h-36 bg-gradient-to-r from-red-900/40 via-stone-900 to-zinc-900 border-b border-[#272727]" />
      )}

      {/* Channel Header Info */}
      <div className="p-4 md:p-6 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <Avatar
              src={channel.avatar}
              alt={channel.fullname}
              size="2xl"
              className="border-4 border-[#0f0f0f] shadow-lg"
            />

            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                {channel.fullname}
              </h1>
              <div className="text-sm text-[#aaaaaa] flex flex-wrap items-center gap-x-2 mt-1">
                <span>@{channel.username}</span>
                <span>•</span>
                <span>{formatSubscribers(channel.subscribersCount)}</span>
                <span>•</span>
                <span>{videos.length} videos</span>
              </div>
            </div>
          </div>

          {!isOwner && (
            <Button
              variant={channel.isSubsribed ? 'subscribed' : 'primary'}
              size="md"
              onClick={handleToggleSubscribe}
              isLoading={isSubscribing}
              className="px-6 py-2.5 font-bold"
            >
              {channel.isSubsribed ? (
                <span className="flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-white" /> Subscribed
                </span>
              ) : (
                'Subscribe'
              )}
            </Button>
          )}
        </div>

        {/* Channel Navigation Tabs */}
        <div className="flex items-center gap-8 border-b border-[#272727] text-sm font-semibold">
          <button
            onClick={() => setActiveTab('videos')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'videos'
                ? 'border-white text-white'
                : 'border-transparent text-[#aaaaaa] hover:text-[#f1f1f1]'
            }`}
          >
            <Film className="w-4 h-4" />
            Videos ({videos.length})
          </button>

          <button
            onClick={() => setActiveTab('tweets')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'tweets'
                ? 'border-white text-white'
                : 'border-transparent text-[#aaaaaa] hover:text-[#f1f1f1]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Community / Tweets ({tweets.length})
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'about'
                ? 'border-white text-white'
                : 'border-transparent text-[#aaaaaa] hover:text-[#f1f1f1]'
            }`}
          >
            <Info className="w-4 h-4" />
            About
          </button>
        </div>

        {/* Tab Contents */}
        <div className="mt-2">
          {activeTab === 'videos' && (
            <VideoGrid
              videos={videos}
              emptyMessage={`No videos uploaded yet by @${channel.username}.`}
            />
          )}

          {activeTab === 'tweets' && (
            <div className="max-w-2xl mx-auto flex flex-col gap-4">
              {tweets.length > 0 ? (
                tweets.map((tweet) => <TweetCard key={tweet._id} tweet={tweet} />)
              ) : (
                <p className="text-center text-[#aaaaaa] py-12 text-sm italic">
                  No community posts by @{channel.username} yet.
                </p>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="max-w-xl bg-[#181818] border border-[#272727] rounded-2xl p-6 flex flex-col gap-4 text-sm">
              <h3 className="font-bold text-white text-base">Channel Details</h3>
              <div className="flex justify-between py-2 border-b border-[#272727]">
                <span className="text-[#aaaaaa]">Name:</span>
                <span className="text-white font-medium">{channel.fullname}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#272727]">
                <span className="text-[#aaaaaa]">Handle:</span>
                <span className="text-white font-medium">@{channel.username}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#272727]">
                <span className="text-[#aaaaaa]">Subscribers:</span>
                <span className="text-white font-medium">{channel.subscribersCount || 0}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#aaaaaa]">Subscriptions:</span>
                <span className="text-white font-medium">{channel.subscribedChannelsCount || 0} channels</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
