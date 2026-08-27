import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ThumbsUp, 
  Share2, 
  Check, 
  Bookmark, 
  BellRing,
  Download
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { SaveToPlaylistModal } from '../playlist/SaveToPlaylistModal';
import { useAuth } from '../../context/AuthContext';
import { likeApi } from '../../api/like.api';
import { subscriptionApi } from '../../api/subscription.api';
import { formatSubscribers } from '../../utils/formatters';

export const VideoActions = ({ video }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  const [isSubscribed, setIsSubscribed] = useState(video?.owner?.isSubscribed || false);
  const [subscribersCount, setSubscribersCount] = useState(video?.owner?.subscribersCount || 0);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const [copied, setCopied] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const videoId = video?._id;
  const owner = video?.owner || {};
  const isOwner = user?._id && owner?._id && user._id === owner._id;

  useEffect(() => {
    if (videoId) {
      likeApi.getLikesCount('video', videoId)
        .then(res => {
          if (res.success) setLikesCount(res.data);
        })
        .catch(() => {});

      if (isAuthenticated) {
        likeApi.getLikeStatus('video', videoId)
          .then(res => {
            if (res.success) setIsLiked(res.data?.isLiked || res.data === true);
          })
          .catch(() => {});
      }
    }

    if (owner?.isSubscribed !== undefined) {
      setIsSubscribed(owner.isSubscribed);
    }
    if (owner?.subscribersCount !== undefined) {
      setSubscribersCount(owner.subscribersCount);
    }
  }, [videoId, isAuthenticated, owner]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isLiking) return;

    setIsLiking(true);
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await likeApi.toggleLike('video', videoId);
      if (res.success && res.data) {
        setIsLiked(res.data.isLiked);
        if (res.data.count !== undefined) {
          setLikesCount(res.data.count);
        }
      }
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleToggleSubscribe = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isSubscribing || !owner.username) return;

    setIsSubscribing(true);
    const prevSubscribed = isSubscribed;
    const prevCount = subscribersCount;
    setIsSubscribed(!prevSubscribed);
    setSubscribersCount(prevSubscribed ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await subscriptionApi.toggleSubscription(owner.username);
      if (res.success && res.data) {
        setIsSubscribed(res.data.isSubscribed);
        if (res.data.subscribersCount !== undefined) {
          setSubscribersCount(res.data.subscribersCount);
        }
      }
    } catch (err) {
      setIsSubscribed(prevSubscribed);
      setSubscribersCount(prevCount);
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

  const handleDownload = () => {
    if (video?.videoFile) {
      window.open(video.videoFile, '_blank');
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-[#272727]">
        {/* Channel info & Subscribe */}
        <div className="flex items-center gap-3">
          <Link to={`/channel/${owner.username}`}>
            <Avatar
              src={owner.avatar}
              alt={owner.fullname || owner.username}
              size="md"
            />
          </Link>
          <div className="flex flex-col min-w-0">
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

          {!isOwner && (
            <Button
              variant={isSubscribed ? 'subscribed' : 'primary'}
              size="sm"
              onClick={handleToggleSubscribe}
              isLoading={isSubscribing}
              className="ml-2 px-5 py-2 font-semibold"
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

        {/* Actions: Like, Share, Save, Download */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
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

          {/* Download */}
          {video?.videoFile && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              icon={Download}
              title="Download video"
            >
              Download
            </Button>
          )}
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
