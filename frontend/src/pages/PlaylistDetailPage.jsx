import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { playlistApi } from '../api/playlist.api';
import { useAuth } from '../context/AuthContext';
import { useQueue } from '../context/QueueContext';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';
import { Skeleton } from '../components/common/Skeleton';
import { VideoActionMenu } from '../components/video/VideoActionMenu';
import { encodeId, decodeId } from '../utils/idEncoder';
import { formatDuration, formatViews, formatRelativeTime } from '../utils/formatters';
import { 
  Play, 
  Trash2, 
  Share2, 
  ListMusic, 
  Check, 
  Film,
  AlertCircle,
  Clock
} from 'lucide-react';

export const PlaylistDetailPage = () => {
  const { playlistId: paramId } = useParams();
  const playlistId = decodeId(paramId);

  const { user, isAuthenticated } = useAuth();
  const { addToQueue } = useQueue();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [removingVideoId, setRemovingVideoId] = useState(null);

  const fetchPlaylist = async () => {
    setIsLoading(true);
    try {
      const res = await playlistApi.getPlaylistById(playlistId);
      if (res.success && res.data) {
        setPlaylist(res.data);
      } else {
        setError('Playlist not found');
      }
    } catch (err) {
      console.error('Error loading playlist:', err);
      setError('Failed to load playlist');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  const isOwner = user?._id && playlist?.owner?._id && user._id === playlist.owner._id;

  const handlePlayAll = () => {
    if (!playlist?.videos?.length) return;
    const firstVideo = playlist.videos[0];
    // Queue remaining videos
    playlist.videos.slice(1).forEach((v) => addToQueue(v));
    navigate(`/watch/${encodeId(firstVideo._id)}`);
  };

  const handleRemoveVideo = async (videoId) => {
    if (removingVideoId) return;
    setRemovingVideoId(videoId);
    try {
      const res = await playlistApi.removeVideoFromPlaylist(playlistId, videoId);
      if (res.success) {
        setPlaylist((prev) => ({
          ...prev,
          videos: prev.videos.filter((v) => v._id !== videoId),
          totalVideos: Math.max(0, (prev.totalVideos || prev.videos.length) - 1),
        }));
      }
    } catch (err) {
      console.error('Error removing video:', err);
    } finally {
      setRemovingVideoId(null);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="flex flex-col gap-4">
          <Skeleton className="w-full aspect-video rounded-2xl" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-3 bg-[#181818] rounded-2xl">
              <Skeleton className="w-40 aspect-video rounded-xl" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4 max-w-md mx-auto p-4">
        <div className="p-4 bg-red-500/10 text-red-400 rounded-full">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-white">Playlist Unavailable</h2>
        <p className="text-sm text-[#aaaaaa]">
          {error || 'This playlist does not exist or may have been deleted.'}
        </p>
        <Link to="/playlists" className="mt-2">
          <Button variant="youtube" size="md">
            Go to Playlists
          </Button>
        </Link>
      </div>
    );
  }

  const firstThumb = playlist.videos?.[0]?.thumbnail;
  const total = playlist.videos?.length || 0;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Playlist Details Card */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-20 h-fit bg-gradient-to-b from-[#242424] to-[#161616] p-6 rounded-3xl border border-[#2f2f2f] shadow-xl">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#111111] shadow-md">
            {firstThumb ? (
              <img
                src={firstThumb}
                alt={playlist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#717171] gap-2">
                <Film className="w-10 h-10" />
                <span className="text-xs">No Videos Added</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-extrabold text-white leading-tight">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-xs text-[#aaaaaa] whitespace-pre-line leading-relaxed">
                {playlist.description}
              </p>
            )}
          </div>

          {/* Owner & Stats */}
          <div className="flex items-center gap-3 pt-2 border-t border-[#2f2f2f]">
            {playlist.owner?.username && (
              <Link to={`/channel/${playlist.owner.username}`}>
                <Avatar
                  src={playlist.owner.avatar}
                  alt={playlist.owner.fullname || playlist.owner.username}
                  size="sm"
                />
              </Link>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">
                {playlist.owner?.fullname || playlist.owner?.username || 'Creator'}
              </span>
              <span className="text-[11px] text-[#aaaaaa]">
                {total} {total === 1 ? 'video' : 'videos'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            <Button
              variant="youtube"
              size="md"
              icon={Play}
              onClick={handlePlayAll}
              disabled={total === 0}
              className="flex-1 font-bold"
            >
              Play All
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={copied ? Check : Share2}
              onClick={handleShare}
              className={copied ? 'text-emerald-400' : ''}
            >
              {copied ? 'Copied' : 'Share'}
            </Button>
          </div>
        </div>

        {/* Right Column: Videos List */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {total > 0 ? (
            playlist.videos.map((vid, index) => {
              const encodedVidId = encodeId(vid._id);
              return (
                <div
                  key={vid._id}
                  className="flex items-center justify-between p-3 bg-[#181818] border border-[#272727] hover:border-[#383838] rounded-2xl transition-colors group gap-3"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-mono text-[#717171] w-4 text-center">
                      {index + 1}
                    </span>

                    <Link
                      to={`/watch/${encodedVidId}`}
                      className="relative w-36 sm:w-44 aspect-video rounded-xl overflow-hidden flex-shrink-0 bg-[#121212]"
                    >
                      <img
                        src={vid.thumbnail}
                        alt={vid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {vid.duration > 0 && (
                        <span className="absolute bottom-1 right-1 bg-black/85 text-white text-[9px] px-1 rounded font-semibold">
                          {formatDuration(vid.duration)}
                        </span>
                      )}
                    </Link>

                    <div className="flex flex-col min-w-0 flex-1 justify-center py-0.5">
                      <Link to={`/watch/${encodedVidId}`}>
                        <h3 className="text-sm font-semibold text-[#f1f1f1] group-hover:text-white line-clamp-2 leading-snug">
                          {vid.title}
                        </h3>
                      </Link>

                      {vid.owner?.username && (
                        <Link
                          to={`/channel/${vid.owner.username}`}
                          className="text-xs text-[#aaaaaa] hover:text-white mt-1 truncate"
                        >
                          {vid.owner.fullname || vid.owner.username}
                        </Link>
                      )}

                      <div className="text-[11px] text-[#717171] flex items-center gap-1.5 mt-0.5">
                        <span>{formatViews(vid.views)}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(vid.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <VideoActionMenu video={vid} />
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(vid._id)}
                        disabled={removingVideoId === vid._id}
                        title="Remove from playlist"
                        className="p-2 text-[#aaaaaa] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3 bg-[#181818] border border-[#272727] rounded-2xl p-8">
              <Film className="w-12 h-12 text-[#717171]" />
              <h3 className="text-base font-semibold text-white">This playlist has no videos</h3>
              <p className="text-xs text-[#aaaaaa] max-w-sm">
                Save videos to this playlist by clicking the Save button on any video.
              </p>
              <Link to="/">
                <Button variant="youtube" size="sm">
                  Explore Videos
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
