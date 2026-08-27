import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { videoApi } from '../api/video.api';
import { Button } from '../components/common/Button';
import { Input, Textarea } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Skeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { formatDuration, formatViews, formatRelativeTime } from '../utils/formatters';
import { encodeId } from '../utils/idEncoder';
import { 
  PlaySquare, 
  Plus, 
  Edit3, 
  Image as ImageIcon, 
  Trash2, 
  Eye, 
  ExternalLink,
  Film,
  Tag,
  X
} from 'lucide-react';

const PRESET_TAGS = ['Coding', 'Music', 'Gaming', 'Tech', 'Podcasts', 'Tutorials', 'Entertainment', 'News'];

export const MyVideosPage = () => {
  const { isAuthenticated } = useAuth();
  const { openUploadModal } = useUI();

  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit details modal state
  const [editingVideo, setEditingVideo] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editTags, setEditTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isSavingDetails, setIsSavingDetails] = useState(false);

  // Edit thumbnail modal state
  const [thumbVideo, setThumbVideo] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState('');
  const [isSavingThumb, setIsSavingThumb] = useState(false);

  // Delete modal state
  const [deletingVideo, setDeletingVideo] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMyVideos = async () => {
    setIsLoading(true);
    try {
      const res = await videoApi.getUploadedVideos();
      if (res.success && res.data) {
        setVideos(res.data);
      }
    } catch (err) {
      console.error('Failed to load my videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyVideos();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const handleOpenEdit = (vid) => {
    setEditingVideo(vid);
    setEditTitle(vid.title);
    setEditDesc(vid.description);
    setEditTags(vid.tags || []);
    setTagInput('');
  };

  const handleAddTag = (tagToAdd) => {
    const clean = tagToAdd.trim().replace(/^#/, '');
    if (clean && !editTags.includes(clean)) {
      setEditTags((prev) => [...prev, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setEditTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingVideo || !editTitle.trim()) return;

    setIsSavingDetails(true);
    try {
      const res = await videoApi.updateVideoDetails(editingVideo._id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        tags: editTags,
      });
      if (res.success && res.data) {
        setVideos((prev) =>
          prev.map((v) => (v._id === editingVideo._id ? { ...v, ...res.data } : v))
        );
        setEditingVideo(null);
      }
    } catch (err) {
      console.error('Failed to update details:', err);
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleOpenThumb = (vid) => {
    setThumbVideo(vid);
    setThumbFile(null);
    setThumbPreview('');
  };

  const handleSaveThumb = async (e) => {
    e.preventDefault();
    if (!thumbVideo || !thumbFile) return;

    setIsSavingThumb(true);
    const formData = new FormData();
    formData.append('thumbnail', thumbFile);

    try {
      const res = await videoApi.updateVideoThumbnail(thumbVideo._id, formData);
      if (res.success && res.data) {
        setVideos((prev) =>
          prev.map((v) => (v._id === thumbVideo._id ? { ...v, thumbnail: res.data.thumbnail } : v))
        );
        setThumbVideo(null);
      }
    } catch (err) {
      console.error('Failed to update thumbnail:', err);
    } finally {
      setIsSavingThumb(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!deletingVideo) return;

    setIsDeleting(true);
    try {
      const res = await videoApi.deleteVideo(deletingVideo._id);
      if (res.success) {
        setVideos((prev) => prev.filter((v) => v._id !== deletingVideo._id));
        setDeletingVideo(null);
      }
    } catch (err) {
      console.error('Failed to delete video:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4 gap-4">
        <div className="p-4 bg-amber-500/10 text-amber-400 rounded-full">
          <PlaySquare className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-white">NoAdTube Creator Studio</h2>
        <p className="text-sm text-[#aaaaaa]">
          Sign in to manage, edit, and upload videos to your channel.
        </p>
        <Link to="/login">
          <Button variant="youtube" size="md">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#272727]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
            <PlaySquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Channel Content</h1>
            <p className="text-xs text-[#aaaaaa]">
              Manage and edit videos you've published on NoAdTube
            </p>
          </div>
        </div>

        <Button
          variant="youtube"
          size="sm"
          icon={Plus}
          onClick={openUploadModal}
        >
          Upload New Video
        </Button>
      </div>

      {/* Video List */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-4 p-4 bg-[#181818] rounded-2xl">
              <Skeleton className="w-full sm:w-56 aspect-video rounded-xl" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4 mt-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length > 0 ? (
        <div className="flex flex-col gap-4">
          {videos.map((vid) => (
            <div
              key={vid._id}
              className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-[#181818] border border-[#272727] hover:border-[#383838] rounded-2xl transition-colors group"
            >
              {/* Left: Thumbnail & Details */}
              <div className="flex flex-col sm:flex-row gap-4 min-w-0 flex-1">
                <div className="relative aspect-video w-full sm:w-52 flex-shrink-0 rounded-xl overflow-hidden bg-[#121212]">
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="w-full h-full object-cover"
                  />
                  {vid.duration > 0 && (
                    <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                      {formatDuration(vid.duration)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col min-w-0 justify-between py-1 flex-1">
                  <div>
                    <h3 className="text-base font-semibold text-white truncate group-hover:text-red-400 transition-colors">
                      {vid.title}
                    </h3>
                    <p className="text-xs text-[#aaaaaa] line-clamp-2 mt-1">
                      {vid.description}
                    </p>
                  </div>

                  {/* Tags badge */}
                  {vid.tags && vid.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {vid.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-[#252525] text-red-300 rounded text-[10px] font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-[#717171] mt-2">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {formatViews(vid.views)}
                    </span>
                    <span>•</span>
                    <span>Uploaded {formatRelativeTime(vid.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[#272727]">
                <Link
                  to={`/watch/${encodeId(vid._id)}`}
                  target="_blank"
                  className="p-2 text-[#aaaaaa] hover:text-white hover:bg-[#272727] rounded-xl transition-colors"
                  title="Watch Video"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={Edit3}
                  onClick={() => handleOpenEdit(vid)}
                >
                  Edit Info
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={ImageIcon}
                  onClick={() => handleOpenOpenThumb(vid)}
                >
                  Thumbnail
                </Button>

                <button
                  type="button"
                  onClick={() => setDeletingVideo(vid)}
                  className="p-2 text-[#aaaaaa] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  title="Delete Video"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3 bg-[#181818] border border-[#272727] rounded-2xl p-8">
          <Film className="w-10 h-10 text-[#aaaaaa]" />
          <h3 className="text-base font-semibold text-white">No videos uploaded yet</h3>
          <p className="text-xs text-[#aaaaaa] max-w-sm">
            Share your story, gameplay, or tutorial with the NoAdTube community.
          </p>
          <Button variant="youtube" size="sm" icon={Plus} onClick={openUploadModal}>
            Upload Video
          </Button>
        </div>
      )}

      {/* Edit Details Modal */}
      <Modal
        isOpen={!!editingVideo}
        onClose={() => setEditingVideo(null)}
        title="Edit Video Details"
      >
        <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
          <Input
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            required
          />
          <Textarea
            label="Description"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            rows={4}
            required
          />

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#aaaaaa] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {editTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-600/20 border border-red-500/40 text-red-300 rounded-lg text-xs font-medium"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tag and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                className="flex-1 bg-[#121212] border border-[#303030] rounded-xl px-3 py-2 text-xs text-white placeholder-[#717171] focus:outline-none focus:border-red-500"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleAddTag(tagInput)}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="text-[11px] text-[#717171]">Popular:</span>
              {PRESET_TAGS.map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => (editTags.includes(pt) ? handleRemoveTag(pt) : handleAddTag(pt))}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                    editTags.includes(pt)
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-[#1e1e1e] text-[#aaaaaa] border-[#333333]'
                  }`}
                >
                  +{pt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditingVideo(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="youtube"
              size="sm"
              isLoading={isSavingDetails}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Thumbnail Modal */}
      <Modal
        isOpen={!!thumbVideo}
        onClose={() => setThumbVideo(null)}
        title="Update Video Thumbnail"
      >
        <form onSubmit={handleSaveThumb} className="flex flex-col gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setThumbFile(file);
                setThumbPreview(URL.createObjectURL(file));
              }
            }}
            className="text-sm text-[#aaaaaa] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#272727] file:text-white hover:file:bg-[#3f3f3f]"
          />

          {thumbPreview ? (
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-[#303030]">
              <img
                src={thumbPreview}
                alt="New thumbnail preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            thumbVideo && (
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-[#303030]">
                <img
                  src={thumbVideo.thumbnail}
                  alt="Current thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            )
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setThumbVideo(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="youtube"
              size="sm"
              isLoading={isSavingThumb}
              disabled={!thumbFile}
            >
              Update Thumbnail
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingVideo}
        onClose={() => setDeletingVideo(null)}
        title="Delete Video"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[#aaaaaa]">
            Are you sure you want to delete <span className="font-semibold text-white">"{deletingVideo?.title}"</span>? This action cannot be undone and will remove the video file and its comments permanently.
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
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
