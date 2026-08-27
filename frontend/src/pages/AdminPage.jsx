import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { videoApi } from '../api/video.api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';
import { Skeleton } from '../components/common/Skeleton';
import { Modal } from '../components/common/Modal';
import { encodeId } from '../utils/idEncoder';
import { formatDuration, formatViews, formatRelativeTime } from '../utils/formatters';
import { 
  ShieldAlert, 
  Trash2, 
  Search, 
  ExternalLink, 
  Film, 
  Users, 
  Eye, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export const AdminPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.email?.toLowerCase() === 'noadtube.online@gmail.com';

  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingVideo, setDeletingVideo] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const loadAdminData = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    try {
      const [statsRes, videosRes] = await Promise.all([
        videoApi.getAdminStats(),
        videoApi.getAllVideos({ limit: 100 })
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (videosRes.success && videosRes.data) {
        setVideos(videosRes.data);
      }
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (!isAdmin) {
        navigate('/');
      } else {
        loadAdminData();
      }
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  const handleDeleteVideo = async () => {
    if (!deletingVideo) return;
    setIsDeleting(true);
    try {
      const res = await videoApi.deleteVideo(deletingVideo._id);
      if (res.success) {
        setVideos((prev) => prev.filter((v) => v._id !== deletingVideo._id));
        setActionSuccess(`Video "${deletingVideo.title}" has been deleted by Administrator.`);
        setTimeout(() => setActionSuccess(''), 4000);
        setDeletingVideo(null);
        // Refresh stats
        videoApi.getAdminStats().then((r) => r.success && setStats(r.data));
      }
    } catch (err) {
      console.error('Error deleting video:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4 gap-4">
        <div className="p-4 bg-red-500/10 text-red-500 rounded-full">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-sm text-[#aaaaaa] max-w-sm">
          Administrator privileges are required to access this area.
        </p>
        <Link to="/">
          <Button variant="youtube" size="md">
            Return to Home
          </Button>
        </Link>
      </div>
    );
  }

  const filteredVideos = videos.filter((v) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.title?.toLowerCase().includes(q) ||
      v.owner?.username?.toLowerCase().includes(q) ||
      v.owner?.fullname?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#272727]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-600/20 text-red-500 border border-red-500/30 rounded-2xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">Administrator Control Panel</h1>
              <span className="px-2 py-0.5 bg-red-600 text-white font-mono text-[10px] font-bold rounded uppercase">
                Admin
              </span>
            </div>
            <p className="text-xs text-[#aaaaaa]">
              Manage all platform videos, oversee system storage, and moderate content
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={loadAdminData}
            isLoading={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Platform Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#181818] border border-[#272727] rounded-2xl flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-[#aaaaaa]">
            <span>Total Videos</span>
            <Film className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-2xl font-bold text-white">
            {stats ? stats.totalVideos : '...'}
          </span>
        </div>

        <div className="p-4 bg-[#181818] border border-[#272727] rounded-2xl flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-[#aaaaaa]">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-2xl font-bold text-white">
            {stats ? stats.totalUsers : '...'}
          </span>
        </div>

        <div className="p-4 bg-[#181818] border border-[#272727] rounded-2xl flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-[#aaaaaa]">
            <span>Total Views</span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-bold text-white">
            {stats ? formatViews(stats.totalViews) : '...'}
          </span>
        </div>

        <div className="p-4 bg-[#181818] border border-[#272727] rounded-2xl flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-[#aaaaaa]">
            <span>Platform Storage</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-bold text-white">
            {stats ? `${stats.totalMB} MB` : '...'}
          </span>
        </div>
      </div>

      {/* Video Moderation Table */}
      <div className="flex flex-col gap-4 bg-[#181818] border border-[#272727] rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Platform Content Moderation</h2>
            <span className="text-xs text-[#aaaaaa]">
              ({filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'})
            </span>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#717171] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title or channel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121212] border border-[#303030] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#717171] focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Video List */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-3 bg-[#141414] rounded-2xl">
                <Skeleton className="w-36 aspect-video rounded-xl" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredVideos.length > 0 ? (
          <div className="flex flex-col divide-y divide-[#222222]">
            {filteredVideos.map((vid) => {
              const encodedId = encodeId(vid._id);
              const sizeMB = vid.size ? (vid.size / (1024 * 1024)).toFixed(1) : '< 1';

              return (
                <div
                  key={vid._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3.5 hover:bg-[#1f1f1f]/50 px-2 rounded-2xl transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Link
                      to={`/watch/${encodedId}`}
                      target="_blank"
                      className="relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden flex-shrink-0 bg-[#121212]"
                    >
                      <img
                        src={vid.thumbnail}
                        alt={vid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {vid.duration > 0 && (
                        <span className="absolute bottom-1 right-1 bg-black/85 text-white text-[9px] font-semibold px-1 rounded">
                          {formatDuration(vid.duration)}
                        </span>
                      )}
                    </Link>

                    <div className="flex flex-col min-w-0 flex-1">
                      <Link
                        to={`/watch/${encodedId}`}
                        target="_blank"
                        className="text-sm font-semibold text-[#f1f1f1] hover:text-white truncate"
                      >
                        {vid.title}
                      </Link>

                      {/* Author */}
                      <div className="flex items-center gap-2 mt-1">
                        {vid.owner && (
                          <Link
                            to={`/channel/${vid.owner.username}`}
                            className="flex items-center gap-1.5 text-xs text-[#aaaaaa] hover:text-white truncate"
                          >
                            <Avatar src={vid.owner.avatar} size="xs" />
                            <span>{vid.owner.fullname || vid.owner.username}</span>
                          </Link>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="text-[11px] text-[#717171] flex items-center gap-2 mt-1">
                        <span>{formatViews(vid.views)}</span>
                        <span>•</span>
                        <span>{sizeMB} MB</span>
                        <span>•</span>
                        <span>{formatRelativeTime(vid.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      to={`/watch/${encodedId}`}
                      target="_blank"
                      className="p-2 text-[#aaaaaa] hover:text-white hover:bg-[#272727] rounded-xl transition-colors"
                      title="Preview Video"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      onClick={() => setDeletingVideo(vid)}
                      className="text-xs font-semibold px-3 py-1.5"
                    >
                      Delete (Admin)
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-[#aaaaaa]">
            No videos matching "{searchQuery}".
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingVideo}
        onClose={() => setDeletingVideo(null)}
        title="Admin Content Deletion"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>
              You are about to delete this video as an Administrator. This will permanently delete the media from Cloudinary and the database.
            </span>
          </div>

          <p className="text-sm text-white">
            Delete video: <span className="font-semibold">"{deletingVideo?.title}"</span> uploaded by{' '}
            <span className="font-semibold text-red-400">@{deletingVideo?.owner?.username}</span>?
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDeletingVideo(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteVideo}
            >
              Confirm Admin Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
