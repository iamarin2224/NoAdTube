import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MoreVertical, Edit2, Trash2, Check, X } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime } from '../../utils/formatters';

export const CommentItem = ({ comment, onEdit, onDelete, onLike }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = user?._id && comment?.owner?._id && user._id === comment.owner._id;

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editContent.trim() === comment.content) {
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await onEdit(comment._id, editContent.trim());
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-4 group">
      <Link to={`/channel/${comment.owner?.username}`}>
        <Avatar
          src={comment.owner?.avatar}
          alt={comment.owner?.fullname || comment.owner?.username}
          size="sm"
        />
      </Link>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Author Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              to={`/channel/${comment.owner?.username}`}
              className="text-xs font-semibold text-white hover:underline"
            >
              @{comment.owner?.username || 'user'}
            </Link>
            <span className="text-xs text-[#aaaaaa]">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>

          {/* Owner Menu */}
          {isOwner && !isEditing && (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="opacity-0 group-hover:opacity-100 p-1 text-[#aaaaaa] hover:text-white rounded-full hover:bg-[#272727] transition-all"
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
                      if (window.confirm('Delete this comment?')) {
                        onDelete(comment._id);
                      }
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

        {/* Content or Edit Form */}
        {isEditing ? (
          <div className="mt-2 flex flex-col gap-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={2}
              className="w-full bg-[#121212] border border-[#303030] rounded-xl p-2.5 text-sm text-[#f1f1f1] focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditContent(comment.content);
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
          <p className="text-sm text-[#f1f1f1] mt-1 whitespace-pre-wrap leading-relaxed">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  );
};
