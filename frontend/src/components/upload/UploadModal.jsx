import React, { useState, useRef, useEffect } from 'react';
import { useUI } from '../../context/UIContext';
import { videoApi } from '../../api/video.api';
import { Modal } from '../common/Modal';
import { Input, Textarea } from '../common/Input';
import { Button } from '../common/Button';
import { encodeId } from '../../utils/idEncoder';
import { 
  Upload, 
  Film, 
  Image, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Tag,
  HardDrive,
  Sparkles,
  Loader2
} from 'lucide-react';

const PRESET_TAGS = ['Coding', 'Music', 'Gaming', 'Tech', 'Podcasts', 'Tutorials', 'Entertainment', 'News'];
const MAX_STORAGE_BYTES = 1024 * 1024 * 1024; // 1 GB

// Extract 1st-second frame from video using in-memory HTML5 video + canvas
const extractFirstSecondThumbnail = (file) => {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      const handleLoadedMetadata = () => {
        // Target 1.0s or mid-point if video is shorter than 1 second
        const targetTime = Math.min(1.0, video.duration > 0 ? video.duration / 2 : 0.5);
        video.currentTime = targetTime;
      };

      const handleSeeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            URL.revokeObjectURL(objectUrl);
            if (blob) {
              const autoThumbnailFile = new File([blob], 'thumbnail_auto.jpg', { type: 'image/jpeg' });
              const previewUrl = URL.createObjectURL(blob);
              resolve({ file: autoThumbnailFile, preview: previewUrl });
            } else {
              resolve(null);
            }
          }, 'image/jpeg', 0.85);
        } catch (err) {
          URL.revokeObjectURL(objectUrl);
          resolve(null);
        }
      };

      const handleError = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      video.addEventListener('seeked', handleSeeked, { once: true });
      video.addEventListener('error', handleError, { once: true });
    } catch (e) {
      resolve(null);
    }
  });
};

export const UploadModal = () => {
  const { isUploadModalOpen, closeUploadModal } = useUI();

  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isAutoThumbnail, setIsAutoThumbnail] = useState(false);
  const [isCustomThumbnail, setIsCustomThumbnail] = useState(false);
  const [isExtractingThumbnail, setIsExtractingThumbnail] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  
  const [storageUsage, setStorageUsage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [successVideo, setSuccessVideo] = useState(null);

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const fetchStorage = async () => {
    try {
      const res = await videoApi.getStorageUsage();
      if (res.success && res.data) {
        setStorageUsage(res.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (isUploadModalOpen) {
      fetchStorage();
    }
  }, [isUploadModalOpen]);

  const resetForm = () => {
    setVideoFile(null);
    setThumbnailFile(null);
    setThumbnailPreview('');
    setIsAutoThumbnail(false);
    setIsCustomThumbnail(false);
    setIsExtractingThumbnail(false);
    setTitle('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setUploadProgress(0);
    setIsUploading(false);
    setError('');
    setSuccessVideo(null);
  };

  const handleClose = () => {
    if (isUploading) {
      if (window.confirm('Upload is currently in progress. Are you sure you want to cancel?')) {
        resetForm();
        closeUploadModal();
      }
    } else {
      resetForm();
      closeUploadModal();
    }
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file.');
        return;
      }

      // Check storage limits for standard accounts (bypassed for unlimited accounts)
      if (!storageUsage?.isUnlimited) {
        if (file.size > MAX_STORAGE_BYTES) {
          setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the total 1 GB account limit.`);
          return;
        }

        const currentUsed = storageUsage?.usedBytes || 0;
        if (currentUsed + file.size > MAX_STORAGE_BYTES) {
          const remainingMB = Math.max(0, (MAX_STORAGE_BYTES - currentUsed) / (1024 * 1024)).toFixed(1);
          setError(`This video (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds your remaining storage quota of ${remainingMB} MB.`);
          return;
        }
      }

      setVideoFile(file);
      setError('');
      if (!title) {
        // Auto populate title from file name without extension
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitle(cleanName);
      }

      // Auto-extract 1st second clip as thumbnail if no custom thumbnail has been selected
      if (!isCustomThumbnail) {
        setIsExtractingThumbnail(true);
        extractFirstSecondThumbnail(file).then((result) => {
          setIsExtractingThumbnail(false);
          if (result) {
            setThumbnailFile(result.file);
            setThumbnailPreview(result.preview);
            setIsAutoThumbnail(true);
          }
        });
      }
    }
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file for the thumbnail.');
        return;
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setIsAutoThumbnail(false);
      setIsCustomThumbnail(true);
      setError('');
    }
  };

  const handleAddTag = (tagToAdd) => {
    const clean = tagToAdd.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags((prev) => [...prev, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isUploading) return;

    if (!videoFile) {
      setError('Please select a video file to upload.');
      return;
    }
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }

    // Double check account storage quota
    const currentUsed = storageUsage?.usedBytes || 0;
    if (currentUsed + videoFile.size > MAX_STORAGE_BYTES) {
      setError('Upload exceeds your 1 GB account storage quota.');
      return;
    }

    setError('');
    setIsUploading(true);
    setUploadProgress(0);

    let finalThumbnailFile = thumbnailFile;
    // If thumbnailFile is still missing, attempt one quick extraction from video
    if (!finalThumbnailFile) {
      const extracted = await extractFirstSecondThumbnail(videoFile);
      if (extracted) {
        finalThumbnailFile = extracted.file;
      }
    }

    const formData = new FormData();
    formData.append('videoFile', videoFile);
    if (finalThumbnailFile) {
      formData.append('thumbnail', finalThumbnailFile);
    }
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    if (tags.length > 0) {
      formData.append('tags', tags.join(','));
    }

    try {
      const res = await videoApi.uploadVideo(formData, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      });

      if (res.success && res.data) {
        setSuccessVideo(res.data);
        fetchStorage();
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isUploadModalOpen}
      onClose={handleClose}
      title={successVideo ? 'Upload Complete' : 'Upload Video to NoAdTube'}
      maxWidth="max-w-3xl"
    >
      {successVideo ? (
        <div className="flex flex-col items-center text-center py-6 gap-4">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full">
            <CheckCircle className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold text-white">Video Published Successfully!</h3>
          <p className="text-sm text-[#aaaaaa] max-w-md">
            Your video is now live on NoAdTube and can be viewed across the platform.
          </p>

          <div className="w-full bg-[#1e1e1e] p-4 rounded-xl flex items-center gap-4 text-left mt-2">
            <img
              src={successVideo.thumbnail}
              alt={successVideo.title}
              className="w-28 aspect-video object-cover rounded-lg bg-[#272727]"
            />
            <div className="flex flex-col min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate">
                {successVideo.title}
              </h4>
              <p className="text-xs text-[#aaaaaa] line-clamp-1 mt-0.5">
                {successVideo.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <a
                  href={`/watch/${encodeId(successVideo._id)}`}
                  className="text-xs font-semibold text-red-500 hover:text-red-400"
                >
                  Watch Video →
                </a>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button variant="secondary" onClick={resetForm}>
              Upload Another
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                resetForm();
                closeUploadModal();
              }}
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Storage Quota Header */}
          {storageUsage && (
            <div className="p-3 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <HardDrive className="w-4 h-4 text-red-500" />
                  <span>Account Video Storage</span>
                  {storageUsage.isUnlimited && (
                    <span className="px-2 py-0.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-md text-[10px] uppercase font-bold">
                      Unlimited Quota
                    </span>
                  )}
                </div>
                {!storageUsage.isUnlimited && (
                  <span className="text-[#aaaaaa]">
                    <strong className="text-white">{storageUsage.usedMB} MB</strong> / {storageUsage.limitMB} MB ({storageUsage.percentage}%)
                  </span>
                )}
              </div>

              {!storageUsage.isUnlimited && (
                <div className="w-full bg-[#2a2a2a] rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      storageUsage.percentage > 90
                        ? 'bg-red-500'
                        : storageUsage.percentage > 70
                        ? 'bg-amber-500'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${Math.min(100, storageUsage.percentage)}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Media Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Video File Picker */}
            <div
              onClick={() => !isUploading && videoInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-colors ${
                videoFile
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-[#3f3f3f] hover:border-red-500 bg-[#121212]'
              }`}
            >
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
              <div className={`p-3 rounded-full ${videoFile ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#272727] text-white'}`}>
                {videoFile ? <CheckCircle className="w-6 h-6" /> : <Film className="w-6 h-6" />}
              </div>
              <div className="flex flex-col min-w-0 max-w-full">
                <span className="text-sm font-semibold text-[#f1f1f1] truncate">
                  {videoFile ? videoFile.name : 'Select Video File'}
                </span>
                <span className="text-xs text-[#aaaaaa]">
                  {videoFile
                    ? `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB`
                    : 'MP4, WebM, MKV'}
                </span>
              </div>
            </div>

            {/* Thumbnail Picker */}
            <div
              onClick={() => !isUploading && thumbnailInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-colors ${
                thumbnailPreview
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-[#3f3f3f] hover:border-red-500 bg-[#121212]'
              }`}
            >
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailSelect}
                className="hidden"
              />
              {isExtractingThumbnail ? (
                <div className="flex flex-col items-center justify-center py-4 gap-2 text-white">
                  <Loader2 className="w-6 h-6 animate-spin text-red-500" />
                  <span className="text-xs text-[#aaaaaa]">Capturing 1st-second frame...</span>
                </div>
              ) : thumbnailPreview ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                  {isAutoThumbnail && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-xs text-amber-300 border border-amber-500/40 rounded-md text-[10px] font-semibold flex items-center gap-1 shadow">
                      <Sparkles className="w-3 h-3" />
                      Auto 1s Frame
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-white font-semibold bg-black/75 px-3 py-1.5 rounded-full shadow">
                      Change Custom Thumbnail
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-[#272727] rounded-full text-white">
                    <Image className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-[#f1f1f1]">
                    Custom Thumbnail (Optional)
                  </span>
                  <span className="text-xs text-[#aaaaaa]">
                    1st second clip will auto-capture if omitted
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <Input
              label="Video Title"
              placeholder="Give your video a catchy title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isUploading}
            />

            <Textarea
              label="Description"
              placeholder="Tell viewers what your video is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              disabled={isUploading}
            />

            {/* Tags Input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#aaaaaa] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Tags (Categorize your video)
              </label>

              {/* Active Tags Chips */}
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
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

              {/* Tag Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a tag and press Enter (e.g. Coding, Music, Gaming)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  disabled={isUploading}
                  className="flex-1 bg-[#121212] border border-[#303030] rounded-xl px-3 py-2 text-xs text-white placeholder-[#717171] focus:outline-none focus:border-red-500"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAddTag(tagInput)}
                  disabled={!tagInput.trim() || isUploading}
                >
                  Add
                </Button>
              </div>

              {/* Preset quick tags */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="text-[11px] text-[#717171]">Popular:</span>
                {PRESET_TAGS.map((pt) => {
                  const isSelected = tags.includes(pt);
                  return (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => (isSelected ? handleRemoveTag(pt) : handleAddTag(pt))}
                      className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                        isSelected
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-[#1e1e1e] text-[#aaaaaa] border-[#333333] hover:border-white'
                      }`}
                    >
                      +{pt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs text-[#aaaaaa]">
                <span>Uploading files to Cloudinary...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-[#272727] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-red-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#272727]">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="youtube"
              isLoading={isUploading}
              disabled={!videoFile || !title.trim() || !description.trim()}
              icon={Upload}
            >
              {isUploading ? `Uploading (${uploadProgress}%)` : 'Publish Video'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
