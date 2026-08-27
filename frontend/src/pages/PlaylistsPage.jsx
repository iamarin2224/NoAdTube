import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { playlistApi } from '../api/playlist.api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { encodeId } from '../utils/idEncoder';
import { 
  ListMusic, 
  Play, 
  Plus, 
  Trash2, 
  Film, 
  FolderHeart 
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { Input, Textarea } from '../components/common/Input';

export const PlaylistsPage = () => {
  const { isAuthenticated } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchPlaylists = async () => {
    setIsLoading(true);
    try {
      const res = await playlistApi.getMyPlaylists();
      if (res.success && res.data) {
        setPlaylists(res.data);
      }
    } catch (err) {
      console.error('Failed to load playlists:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlaylists();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsCreating(true);
    try {
      const res = await playlistApi.createPlaylist({
        name: newTitle.trim(),
        description: newDesc.trim(),
      });
      if (res.success) {
        setIsCreateOpen(false);
        setNewTitle('');
        setNewDesc('');
        fetchPlaylists();
      }
    } catch (err) {
      console.error('Error creating playlist:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (playlistId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;

    setDeletingId(playlistId);
    try {
      const res = await playlistApi.deletePlaylist(playlistId);
      if (res.success) {
        setPlaylists((prev) => prev.filter((p) => p._id !== playlistId));
      }
    } catch (err) {
      console.error('Error deleting playlist:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4 gap-4">
        <div className="p-4 bg-red-500/10 text-red-500 rounded-full">
          <FolderHeart className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-white">Enjoy your favorite playlists</h2>
        <p className="text-sm text-[#aaaaaa]">
          Sign in to create, organize, and view your custom playlists.
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
      <div className="flex items-center justify-between pb-4 border-b border-[#272727]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl">
            <ListMusic className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Playlists</h1>
            <p className="text-xs text-[#aaaaaa]">
              Manage and listen to your curated collections
            </p>
          </div>
        </div>

        <Button
          variant="youtube"
          size="sm"
          icon={Plus}
          onClick={() => setIsCreateOpen(true)}
        >
          New Playlist
        </Button>
      </div>

      {/* Playlists Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="w-full aspect-video rounded-2xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : playlists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {playlists.map((playlist) => {
            const encodedId = encodeId(playlist._id);
            const total = playlist.totalVideos || playlist.videoList?.length || 0;
            const thumb = playlist.firstVideoThumbnail || playlist.videos?.[0]?.thumbnail;

            return (
              <div key={playlist._id} className="flex flex-col gap-2 group relative">
                <Link
                  to={`/playlist/${encodedId}`}
                  className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#1f1f1f] shadow-md block"
                >
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={playlist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#717171] gap-2">
                      <Film className="w-10 h-10" />
                      <span className="text-xs">Empty Playlist</span>
                    </div>
                  )}

                  {/* Playlist Overlay Badge */}
                  <div className="absolute inset-y-0 right-0 w-28 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-1">
                    <ListMusic className="w-6 h-6" />
                    <span className="text-xs font-bold">{total} videos</span>
                  </div>

                  {/* Hover Play All Overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full font-semibold text-xs shadow-lg">
                      <Play className="w-4 h-4 fill-white" />
                      Play All
                    </div>
                  </div>
                </Link>

                <div className="flex justify-between items-start pt-1">
                  <Link to={`/playlist/${encodedId}`} className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-[#f1f1f1] group-hover:text-white truncate">
                      {playlist.name}
                    </h3>
                    <p className="text-xs text-[#aaaaaa] mt-0.5">
                      {total} {total === 1 ? 'video' : 'videos'} • View full playlist
                    </p>
                  </Link>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(playlist._id, e)}
                    disabled={deletingId === playlist._id}
                    title="Delete playlist"
                    className="p-1.5 text-[#aaaaaa] hover:text-red-400 hover:bg-[#282828] rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3 bg-[#181818] border border-[#272727] rounded-2xl p-8">
          <ListMusic className="w-12 h-12 text-[#717171]" />
          <h3 className="text-base font-semibold text-white">No playlists created yet</h3>
          <p className="text-xs text-[#aaaaaa] max-w-sm">
            Organize videos you love into custom playlists to watch and share anytime.
          </p>
          <Button variant="youtube" size="sm" icon={Plus} onClick={() => setIsCreateOpen(true)}>
            Create Playlist
          </Button>
        </div>
      )}

      {/* Create Playlist Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Playlist"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Playlist Title"
            placeholder="e.g. Chill Beats, Tutorials..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            autoFocus
          />
          <Textarea
            label="Description"
            placeholder="Optional playlist description..."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="youtube"
              size="sm"
              isLoading={isCreating}
            >
              Create Playlist
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
