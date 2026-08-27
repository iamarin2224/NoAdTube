import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Textarea } from '../common/Input';
import { playlistApi } from '../../api/playlist.api';
import { useAuth } from '../../context/AuthContext';
import { ListPlus, Plus, Check, Loader2 } from 'lucide-react';

export const SaveToPlaylistModal = ({ isOpen, onClose, videoId, videoTitle }) => {
  const { isAuthenticated } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchPlaylists = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await playlistApi.getMyPlaylists();
      if (res.success && res.data) {
        setPlaylists(res.data);
      }
    } catch (err) {
      console.error('Error fetching playlists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchPlaylists();
      setIsCreatingNew(false);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setError('');
    }
  }, [isOpen, isAuthenticated]);

  const handleTogglePlaylist = async (playlist) => {
    if (savingId) return;
    setSavingId(playlist._id);
    const hasVideo = playlist.videoList?.some(
      (id) => (typeof id === 'string' ? id : id._id) === videoId
    );

    try {
      if (hasVideo) {
        await playlistApi.removeVideoFromPlaylist(playlist._id, videoId);
      } else {
        await playlistApi.addVideoToPlaylist(playlist._id, videoId);
      }
      await fetchPlaylists();
    } catch (err) {
      console.error('Error modifying playlist:', err);
      setError('Failed to update playlist');
    } finally {
      setSavingId(null);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) {
      setError('Playlist name is required');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const res = await playlistApi.createPlaylist({
        name: newPlaylistName.trim(),
        description: newPlaylistDesc.trim(),
        videoId: videoId, // Automatically add current video
      });

      if (res.success) {
        setIsCreatingNew(false);
        setNewPlaylistName('');
        setNewPlaylistDesc('');
        await fetchPlaylists();
      }
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError(err.response?.data?.message || 'Failed to create playlist');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save video to playlist"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-4">
        {videoTitle && (
          <p className="text-xs text-[#aaaaaa] truncate">
            Saving: <span className="font-semibold text-white">"{videoTitle}"</span>
          </p>
        )}

        {error && (
          <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
          </div>
        ) : playlists.length > 0 ? (
          <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
            {playlists.map((playlist) => {
              const isSaved = playlist.videoList?.some(
                (id) => (typeof id === 'string' ? id : id._id) === videoId
              );
              const isThisSaving = savingId === playlist._id;

              return (
                <label
                  key={playlist._id}
                  onClick={(e) => {
                    e.preventDefault();
                    handleTogglePlaylist(playlist);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#272727] cursor-pointer transition-colors select-none group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        isSaved
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'border-[#4f4f4f] group-hover:border-white'
                      }`}
                    >
                      {isSaved && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-[#f1f1f1] truncate">
                        {playlist.name}
                      </span>
                      <span className="text-[11px] text-[#717171]">
                        {playlist.totalVideos || playlist.videoList?.length || 0} videos
                      </span>
                    </div>
                  </div>

                  {isThisSaving && (
                    <Loader2 className="w-4 h-4 animate-spin text-[#aaaaaa]" />
                  )}
                </label>
              );
            })}
          </div>
        ) : (
          !isCreatingNew && (
            <div className="text-center py-6 text-xs text-[#aaaaaa]">
              You don't have any playlists yet.
            </div>
          )
        )}

        {/* Create new playlist form / button */}
        <div className="pt-3 border-t border-[#272727]">
          {isCreatingNew ? (
            <form onSubmit={handleCreatePlaylist} className="flex flex-col gap-3">
              <Input
                label="Playlist Name"
                placeholder="e.g. My Favorites, Web Dev..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                autoFocus
                required
              />
              <Textarea
                label="Description"
                placeholder="Optional description"
                value={newPlaylistDesc}
                onChange={(e) => setNewPlaylistDesc(e.target.value)}
                rows={2}
              />
              <div className="flex justify-end gap-2 mt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreatingNew(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="youtube"
                  size="sm"
                  isLoading={isCreating}
                >
                  Create & Save
                </Button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreatingNew(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#272727] hover:bg-[#3f3f3f] text-[#f1f1f1] rounded-xl text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create new playlist
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
