import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Share2, 
  Check 
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { CommentSection } from '../comment/CommentSection';
import { useAuth } from '../../context/AuthContext';
import { tweetApi } from '../../api/tweet.api';
import { likeApi } from '../../api/like.api';
import { formatRelativeTime } from '../../utils/formatters';

export const TweetCard = ({ tweet, onTweetUpdated, onTweetDeleted }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(tweet.likesCount || 0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(tweet.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner = user?._id && tweet?.owner?._id && user._id === tweet.owner._id;

  useEffect(() => {
    if (tweet._id) {
      likeApi.getLikesCount('tweet', tweet._id)
        .then(res => {
          if (res.success) setLikesCount(res.data);
        })
        .catch(() => {});

      if (isAuthenticated) {
        likeApi.getLikeStatus('tweet', tweet._id)
          .then(res => {
            if (res.success) setIsLiked(res.data?.isLiked || res.data === true);
          })
          .catch(() => {});
      }
    }
  }, [tweet._id, isAuthenticated]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await likeApi.toggleLike('tweet', tweet._id);
      if (res.success && res.data) {
        setIsLiked(res.data.isLiked);
        if (res.data.count !== undefined) {
          setLikesCount(res.data.count);
        }
      }
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editContent.trim() === tweet.content) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await tweetApi.editTweet(tweet._id, editContent.trim());
      if (res.success && res.data) {
        setIsEditing(false);
        if (onTweetUpdated) onTweetUpdated(res.data);
      }
    } catch (err) {
      console.error('Failed to edit tweet:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this tweet?')) {
      try {
        await tweetApi.deleteTweet(tweet._id);
        if (onTweetDeleted) onTweetDeleted(tweet._id);
      } catch (err) {
        console.error('Failed to delete tweet:', err);
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/tweets#${tweet._id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id={tweet._id} className="bg-[#181818] border border-[#272727] rounded-2xl p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/channel/${tweet.owner?.username}`}>
            <Avatar
              src={tweet.owner?.avatar}
              alt={tweet.owner?.fullname || tweet.owner?.username}
              size="md"
            />
          </Link>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to={`/channel/${tweet.owner?.username}`}
                className="text-sm font-bold text-white hover:underline truncate"
              >
                {tweet.owner?.fullname || tweet.owner?.username}
              </Link>
              <span className="text-xs text-[#aaaaaa]">
                @{tweet.owner?.username}
              </span>
            </div>
            <span className="text-xs text-[#717171]">
              {formatRelativeTime(tweet.createdAt)}
            </span>
          </div>
        </div>

        {/* Owner Menu */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-1.5 text-[#aaaaaa] hover:text-white rounded-full hover:bg-[#272727] transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-[#282828] border border-[#3f3f3f] rounded-xl shadow-xl py-1 z-20">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsEditing(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#f1f1f1] hover:bg-[#3f3f3f]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleDelete();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-[#3f3f3f]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            className="w-full bg-[#121212] border border-[#303030] rounded-xl p-3 text-sm text-[#f1f1f1] focus:outline-none focus:border-blue-500"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditContent(tweet.content);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveEdit}
              isLoading={isSubmitting}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#f1f1f1] whitespace-pre-wrap leading-relaxed">
          {tweet.content}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-[#272727] text-xs text-[#aaaaaa]">
        <button
          onClick={handleToggleLike}
          className={`flex items-center gap-1.5 hover:text-red-400 transition-colors ${
            isLiked ? 'text-red-500 font-semibold' : ''
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={() => setIsCommentsOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 hover:text-white transition-colors ${
            isCommentsOpen ? 'text-white font-semibold' : ''
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>{tweet.commentsCount || 0} Comments</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 hover:text-white transition-colors ml-auto"
        >
          {copied ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> Copied
            </span>
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Embedded Comments Thread */}
      {isCommentsOpen && (
        <div className="pt-2 border-t border-[#272727]">
          <CommentSection type="tweet" id={tweet._id} />
        </div>
      )}
    </div>
  );
};
