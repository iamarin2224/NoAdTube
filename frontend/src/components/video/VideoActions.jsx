import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ThumbsUp, 
  Share2, 
  Bookmark, 
  Check, 
  BellRing
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { likeApi } from '../../api/like.api';
import { subscriptionApi } from '../../api/subscription.api';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { SaveToPlaylistModal } from '../playlist/SaveToPlaylistModal';
import { formatSubscribers } from '../../utils/formatters';

export const VideoActions = ({
  video,
  isLiked: initialIsLiked = false,
  likesCount: initialLikesCount = 0,
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isSubscribed, setIsSubscribed] = useState(video?.owner?.isSubscribed || false);
  const [subscribersCount, setSubscribersCount] = useState(video?.owner?.subscribersCount || 0);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const videoId = video?._id;
  const owner = video?.owner || {};
  const isOwner = user?._id === owner?._id;

  // Fetch initial like count and like status
  useEffect(() => {
    if (videoId) {
      likeApi
        .getLikesCount('video', videoId)
        .then((res) => {
          if (res.success && typeof res.data === 'number') {
            setLikesCount(res.data);
          }
        })
        .catch(() => {});

      if (isAuthenticated) {
        likeApi
          .getLikeStatus('video', videoId)
          .then((res) => {
            if (res.success && res.data) {
              setIsLiked(!!res.data.isLiked);
            }
          })
          .catch(() => {});
      } else {
        setIsLiked(false);
      }
    }
  }, [videoId, isAuthenticated]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isLiking) return;

    // Optimistic UI update
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);
    setIsLiking(true);

    try {
      const res = await likeApi.toggleVideoLike(videoId);
      if (res.success && res.data) {
        setIsLiked(res.data.isLiked);
        if (typeof res.data.count === 'number') {
          setLikesCount(res.data.count);
        }
      }
    } catch (err) {
      // Rollback
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      console.error('Error toggling like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleToggleSubscribe = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isSubscribing || isOwner) return;

    const prevSubscribed = isSubscribed;
    const prevCount = subscribersCount;
    setIsSubscribed(!prevSubscribed);
    setSubscribersCount(prevSubscribed ? Math.max(0, prevCount - 1) : prevCount + 1);
    setIsSubscribing(true);

    try {
      const res = await subscriptionApi.toggleSubscription(owner.username);
      if (res.success && res.data) {
        setIsSubscribed(res.data.isSubscribed);
      }
    } catch (err) {
      // Rollback
      setIsSubscribed(prevSubscribed);
      setSubscribersCount(prevCount);
      console.error('Error toggling subscription:', err);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsSaveModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-[#272727]">
        {/* Channel info & Right-Aligned Subscribe Button */}
        <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-3 min-w-0">
            <Link to={`/channel/${owner.username}`}>
              <Avatar
                src={owner.avatar}
                alt={owner.fullname || owner.username}
                size="md"
              />
            </Link>
            <div className="flex flex-col min-w-0 mr-2">
              <Link
                to={`/channel/${owner.username}`}
                className="text-base font-bold text-white hover:text-stone-300 truncate"
              >
                {owner.fullname || owner.username}
              </Link>
              <span className="text-xs text-[#aaaaaa]">
                {formatSubscribers(subscribersCount)}
              </span>
            </div>
          </div>

          {!isOwner && (
            <Button
              variant={isSubscribed ? 'subscribed' : 'primary'}
              size="sm"
              onClick={handleToggleSubscribe}
              isLoading={isSubscribing}
              className="ml-auto sm:ml-6 px-5 py-2 font-semibold flex-shrink-0"
            >
              {isSubscribed ? (
                <span className="flex items-center gap-1.5">
                  <BellRing className="w-4 h-4 text-white" /> Subscribed
                </span>
              ) : (
                'Subscribe'
              )}
            </Button>
          )}
        </div>

        {/* Actions: Like, Share, Save */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {/* Like */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleToggleLike}
            className={`gap-2 ${isLiked ? 'bg-[#3f3f3f] text-white font-semibold' : ''}`}
          >
            <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-white text-white' : 'text-[#f1f1f1]'}`} />
            <span>{likesCount}</span>
          </Button>

          {/* Share */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleShare}
            icon={copied ? Check : Share2}
            className={copied ? 'text-emerald-400' : ''}
          >
            {copied ? 'Copied Link' : 'Share'}
          </Button>

          {/* Save to Playlist */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSaveClick}
            icon={Bookmark}
          >
            Save
          </Button>
        </div>
      </div>

      {/* Save to Playlist Modal */}
      <SaveToPlaylistModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        videoId={videoId}
        videoTitle={video?.title}
      />
    </>
  );
};
