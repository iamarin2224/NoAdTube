import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatViews, formatRelativeTime } from '../../utils/formatters';
import { useUI } from '../../context/UIContext';

export const VideoDescription = ({ video }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { setActiveTab } = useUI();
  const navigate = useNavigate();

  if (!video) return null;

  const { views = 0, createdAt, description = '', tags = [] } = video;

  const handleTagClick = (e, tag) => {
    e.stopPropagation();
    setActiveTab(tag);
    navigate('/');
  };

  return (
    <div
      onClick={() => setIsExpanded((prev) => !prev)}
      className="mt-4 p-3.5 bg-[#272727]/70 hover:bg-[#272727] rounded-2xl text-sm transition-colors cursor-pointer select-none"
    >
      <div className="flex items-center gap-2 font-semibold text-white mb-2 text-xs">
        <span>{formatViews(views)}</span>
        <span>•</span>
        <span>{formatRelativeTime(createdAt)}</span>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex items-center gap-1.5 ml-2 overflow-x-auto">
            {tags.map((tag) => (
              <span
                key={tag}
                onClick={(e) => handleTagClick(e, tag)}
                className="text-blue-400 hover:text-blue-300 font-medium hover:underline text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        className={`text-[#f1f1f1] whitespace-pre-line leading-relaxed text-xs sm:text-sm ${
          isExpanded ? '' : 'line-clamp-3'
        }`}
      >
        {description}
      </div>

      <button
        type="button"
        className="mt-2 text-xs font-bold text-[#aaaaaa] hover:text-white"
      >
        {isExpanded ? 'Show less' : '...more'}
      </button>
    </div>
  );
};
