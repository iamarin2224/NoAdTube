import React, { useEffect, useState } from 'react';
import { tweetApi } from '../api/tweet.api';
import { CreateTweet } from '../components/tweet/CreateTweet';
import { TweetCard } from '../components/tweet/TweetCard';
import { Skeleton } from '../components/common/Skeleton';
import { MessageSquare, Flame } from 'lucide-react';

export const TweetsPage = () => {
  const [tweets, setTweets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTweets = async () => {
    setIsLoading(true);
    try {
      const res = await tweetApi.getAllTweets();
      if (res.success && res.data) {
        setTweets(res.data);
      }
    } catch (err) {
      console.error('Failed to load tweets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  const handleTweetCreated = (newTweet) => {
    setTweets((prev) => [newTweet, ...prev]);
    fetchTweets();
  };

  const handleTweetUpdated = (updatedTweet) => {
    setTweets((prev) =>
      prev.map((t) => (t._id === updatedTweet._id ? { ...t, ...updatedTweet } : t))
    );
  };

  const handleTweetDeleted = (deletedTweetId) => {
    setTweets((prev) => prev.filter((t) => t._id !== deletedTweetId));
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#272727]">
        <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Community Posts & Tweets</h1>
          <p className="text-xs text-[#aaaaaa]">
            Stay updated with short thoughts, announcements, and polls from creators
          </p>
        </div>
      </div>

      {/* Tweet Composer */}
      <CreateTweet onTweetCreated={handleTweetCreated} />

      {/* Tweets Feed */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#181818] border border-[#272727] rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex flex-col gap-1.5 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/5" />
                </div>
              </div>
              <Skeleton className="h-16 w-full rounded-xl" />
              <div className="flex gap-4 pt-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))
        ) : tweets.length > 0 ? (
          tweets.map((tweet) => (
            <TweetCard
              key={tweet._id}
              tweet={tweet}
              onTweetUpdated={handleTweetUpdated}
              onTweetDeleted={handleTweetDeleted}
            />
          ))
        ) : (
          <div className="bg-[#181818] border border-[#272727] rounded-2xl p-12 text-center flex flex-col items-center gap-3">
            <MessageSquare className="w-10 h-10 text-[#717171]" />
            <h3 className="text-base font-semibold text-white">No posts yet</h3>
            <p className="text-xs text-[#aaaaaa]">
              Be the first creator to share an update with the NoAdTube community!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
