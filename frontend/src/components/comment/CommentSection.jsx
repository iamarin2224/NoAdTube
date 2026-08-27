import React, { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { commentApi } from '../../api/comment.api';
import { CommentItem } from './CommentItem';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const CommentSection = ({ type = 'video', id }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const fetchComments = async () => {
    if (!id) return;
    try {
      const res = await commentApi.getComments(type, id);
      if (res.success && res.data) {
        setComments(res.data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [type, id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (type === 'video') {
        await commentApi.addCommentToVideo(id, newComment.trim());
      } else {
        await commentApi.addCommentToTweet(id, newComment.trim());
      }
      setNewComment('');
      setIsFocused(false);
      await fetchComments();
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId, content) => {
    try {
      await commentApi.editComment(commentId, content);
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, content } : c))
      );
    } catch (err) {
      console.error('Failed to edit comment:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentApi.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6 mt-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-bold text-white">
          {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
        </h3>
      </div>

      {/* Add Comment Input */}
      <div className="flex gap-4 items-start">
        <Avatar
          src={user?.avatar}
          alt={user?.fullname || user?.username}
          size="md"
        />

        <form onSubmit={handleAddComment} className="flex-1 flex flex-col gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={isAuthenticated ? 'Add a comment...' : 'Sign in to add a comment...'}
            rows={isFocused ? 3 : 1}
            className="w-full bg-transparent border-b border-[#303030] focus:border-white focus:outline-none text-sm text-white placeholder-[#717171] py-1 transition-all resize-none"
          />

          {isFocused && (
            <div className="flex justify-end gap-2 mt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setNewComment('');
                  setIsFocused(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!newComment.trim() || isSubmitting}
                isLoading={isSubmitting}
              >
                Comment
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Comments List */}
      <div className="flex flex-col gap-5 mt-2">
        {comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            onEdit={handleEditComment}
            onDelete={handleDeleteComment}
          />
        ))}

        {!isLoading && comments.length === 0 && (
          <p className="text-sm text-[#aaaaaa] italic text-center py-6">
            No comments yet. Be the first to start the conversation!
          </p>
        )}
      </div>
    </div>
  );
};
