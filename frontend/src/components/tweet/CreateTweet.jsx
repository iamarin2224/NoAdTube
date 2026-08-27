import React, { useState } from 'react';
import { Send, MessageSquarePlus } from 'lucide-react';
import { tweetApi } from '../../api/tweet.api';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export const CreateTweet = ({ onTweetCreated }) => {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="bg-[#181818] border border-[#272727] rounded-2xl p-6 text-center flex flex-col items-center gap-3">
        <p className="text-sm text-[#aaaaaa]">
          Sign in to share updates, thoughts, and connect with the NoAdTube community.
        </p>
        <Link to="/login">
          <Button variant="primary" size="sm">
            Sign In to Post
          </Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await tweetApi.postTweet(content.trim());
      if (res.success && res.data) {
        setContent('');
        if (onTweetCreated) onTweetCreated(res.data);
      }
    } catch (err) {
      console.error('Failed to create tweet:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#181818] border border-[#272727] rounded-2xl p-4 flex gap-4">
      <Avatar
        src={user?.avatar}
        alt={user?.fullname || user?.username}
        size="md"
      />

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening in your channel or community?"
          rows={3}
          maxLength={1000}
          className="w-full bg-transparent border-none text-sm text-white placeholder-[#717171] focus:outline-none resize-none leading-relaxed"
        />

        <div className="flex items-center justify-between pt-2 border-t border-[#272727]">
          <span className="text-xs text-[#717171]">
            {content.length}/1000
          </span>

          <Button
            type="submit"
            variant="youtube"
            size="sm"
            disabled={!content.trim() || isSubmitting}
            isLoading={isSubmitting}
            icon={Send}
          >
            Post
          </Button>
        </div>
      </form>
    </div>
  );
};
