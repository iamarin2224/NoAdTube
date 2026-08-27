import React, { useState, useRef, useEffect } from 'react';
import { 
  MoreVertical, 
  ListMusic, 
  Bookmark, 
  Share2, 
  Download, 
  Check 
} from 'lucide-react';
import { useQueue } from '../../context/QueueContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SaveToPlaylistModal } from '../playlist/SaveToPlaylistModal';
import { encodeId } from '../../utils/idEncoder';

export const VideoActionMenu = ({ video, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  const { addToQueue } = useQueue();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleAddToQueue = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    addToQueue(video);
  };

  const handleSaveToPlaylist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsSaveModalOpen(true);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/watch/${encodeId(video._id)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 1500);
  };

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    if (video.videoFile) {
      window.open(video.videoFile, '_blank');
    }
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        type="button"
        onClick={handleToggle}
        title="More actions"
        className="p-1.5 text-[#aaaaaa] hover:text-white hover:bg-[#2e2e2e] rounded-full transition-colors focus:outline-none"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-[#282828] border border-[#3f3f3f] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in duration-100 text-xs font-medium">
          <button
            type="button"
            onClick={handleAddToQueue}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[#f1f1f1] hover:bg-[#383838] transition-colors text-left"
          >
            <ListMusic className="w-4 h-4 text-[#aaaaaa]" />
            Add to queue
          </button>

          <button
            type="button"
            onClick={handleSaveToPlaylist}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[#f1f1f1] hover:bg-[#383838] transition-colors text-left"
          >
            <Bookmark className="w-4 h-4 text-[#aaaaaa]" />
            Save to playlist
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[#f1f1f1] hover:bg-[#383838] transition-colors text-left"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[#aaaaaa]" />
                Share
              </>
            )}
          </button>

          {video.videoFile && (
            <button
              type="button"
              onClick={handleDownload}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[#f1f1f1] hover:bg-[#383838] transition-colors text-left"
            >
              <Download className="w-4 h-4 text-[#aaaaaa]" />
              Download
            </button>
          )}
        </div>
      )}

      <SaveToPlaylistModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        videoId={video._id}
        videoTitle={video.title}
      />
    </div>
  );
};
