import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../common/Avatar';
import { formatDuration, formatViews, formatRelativeTime } from '../../utils/formatters';
import { VideoActionMenu } from './VideoActionMenu';
import { encodeId } from '../../utils/idEncoder';

export const VideoCard = ({ video, horizontal = false, hideChannel = false, isCompact = false }) => {
  if (!video) return null;

  const {
    _id,
    title,
    thumbnail,
    duration,
    views = 0,
    createdAt,
    owner = {},
  } = video;

  const encodedVideoId = encodeId(_id);

  // Strictly truncate description for preview cards (max 120 chars)
  const previewDescription = video.description
    ? video.description.length > 120
      ? `${video.description.slice(0, 120)}...`
      : video.description
    : '';

  if (horizontal) {
    return (
      <div className="flex flex-col sm:flex-row items-start gap-4 group cursor-pointer w-full relative">
        {/* Fixed Aspect Ratio Thumbnail (Never stretches vertically) */}
        <Link
          to={`/watch/${encodedVideoId}`}
          className={`relative flex-shrink-0 self-start bg-[#1f1f1f] rounded-2xl overflow-hidden shadow-sm aspect-video ${
            isCompact ? 'w-40 sm:w-40' : 'w-full sm:w-64 md:w-72'
          }`}
        >
          <img
            src={thumbnail}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {duration > 0 && (
            <div className="absolute bottom-1.5 right-1.5 bg-black/85 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow">
              {formatDuration(duration)}
            </div>
          )}
        </Link>

        {/* Details Column */}
        <div className="flex flex-col min-w-0 flex-1 justify-start py-0.5 w-full">
          <div className="flex justify-between items-start gap-2">
            <Link to={`/watch/${encodedVideoId}`} className="flex-1 min-w-0">
              <h3 className={`font-semibold text-[#f1f1f1] group-hover:text-white line-clamp-2 leading-snug ${
                isCompact ? 'text-xs' : 'text-sm sm:text-base'
              }`}>
                {title}
              </h3>
            </Link>

            <VideoActionMenu
              video={video}
              className="flex-shrink-0 -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>

          <div className="text-xs text-[#aaaaaa] flex items-center gap-1.5 mt-1">
            <span>{formatViews(views)}</span>
            <span>•</span>
            <span>{formatRelativeTime(createdAt)}</span>
          </div>

          {!hideChannel && owner?.username && (
            <Link
              to={`/channel/${owner.username}`}
              className="flex items-center gap-2 mt-2 group/author w-fit"
            >
              <Avatar
                src={owner.avatar}
                alt={owner.fullname || owner.username}
                size="xs"
              />
              <span className="text-xs text-[#aaaaaa] group-hover/author:text-[#f1f1f1] font-medium truncate">
                {owner.fullname || owner.username}
              </span>
            </Link>
          )}

          {!isCompact && previewDescription && (
            <p className="text-xs text-[#888888] line-clamp-2 leading-relaxed mt-2 hidden sm:block">
              {previewDescription}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 group relative">
      {/* Grid Thumbnail */}
      <Link
        to={`/watch/${encodedVideoId}`}
        className="relative aspect-video w-full bg-[#181818] rounded-2xl overflow-hidden shadow-sm"
      >
        <img
          src={thumbnail}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        {duration > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/85 backdrop-blur-xs text-white text-xs font-semibold px-1.5 py-0.5 rounded shadow">
            {formatDuration(duration)}
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex gap-3 items-start">
        {!hideChannel && owner?.username && (
          <Link to={`/channel/${owner.username}`} className="flex-shrink-0 mt-0.5">
            <Avatar
              src={owner.avatar}
              alt={owner.fullname || owner.username}
              size="sm"
            />
          </Link>
        )}

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex justify-between items-start gap-1">
            <Link to={`/watch/${encodedVideoId}`} className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-[#f1f1f1] group-hover:text-white line-clamp-2 leading-snug">
                {title}
              </h3>
            </Link>

            <VideoActionMenu
              video={video}
              className="flex-shrink-0 -mt-1 -mr-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>

          {!hideChannel && owner?.username && (
            <Link
              to={`/channel/${owner.username}`}
              className="text-xs text-[#aaaaaa] hover:text-white transition-colors mt-1 truncate"
            >
              {owner.fullname || owner.username}
            </Link>
          )}

          <div className="text-xs text-[#aaaaaa] flex items-center gap-1.5 mt-0.5">
            <span>{formatViews(views)}</span>
            <span>•</span>
            <span>{formatRelativeTime(createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
