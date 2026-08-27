import React from 'react';
import { useQueue } from '../../context/QueueContext';
import { 
  ListMusic, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  X, 
  Play, 
  PlaySquare, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

export const QueueDrawer = () => {
  const { 
    queue, 
    isQueueOpen, 
    setIsQueueOpen, 
    isAutoplay, 
    toggleAutoplay, 
    removeFromQueue, 
    clearQueue, 
    playQueueItem, 
    toastMessage 
  } = useQueue();

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#282828] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#3f3f3f] flex items-center gap-3 text-sm animate-in fade-in slide-in-from-bottom-3 duration-200">
          <ListMusic className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Queue Controller */}
      {queue.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40 w-80 sm:w-96 bg-[#1f1f1f] border border-[#383838] rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300">
          {/* Header */}
          <div 
            onClick={() => setIsQueueOpen((prev) => !prev)}
            className="flex items-center justify-between px-4 py-3 bg-[#282828] hover:bg-[#303030] cursor-pointer transition-colors border-b border-[#383838]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ListMusic className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Queue
                </span>
                <span className="text-[11px] text-[#aaaaaa] truncate">
                  {queue.length} {queue.length === 1 ? 'video' : 'videos'} remaining
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAutoplay();
                }}
                title={isAutoplay ? 'Autoplay is On' : 'Autoplay is Off'}
                className="flex items-center gap-1 px-2 py-1 bg-[#181818] rounded-lg text-[10px] text-[#aaaaaa] hover:text-white"
              >
                <span>Autoplay</span>
                {isAutoplay ? (
                  <ToggleRight className="w-4 h-4 text-red-500" />
                ) : (
                  <ToggleLeft className="w-4 h-4 text-[#717171]" />
                )}
              </button>
              <button
                type="button"
                className="p-1 text-[#aaaaaa] hover:text-white rounded-lg"
              >
                {isQueueOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Expanded List */}
          {isQueueOpen && (
            <div className="flex flex-col max-h-80 overflow-y-auto divide-y divide-[#282828]">
              {queue.map((video, idx) => (
                <div
                  key={`${video._id}-${idx}`}
                  className="flex items-center justify-between p-2.5 hover:bg-[#282828] transition-colors group gap-2"
                >
                  <div 
                    onClick={() => playQueueItem(idx)}
                    className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                  >
                    <span className="text-xs font-mono text-[#717171] w-4 text-center">
                      {idx + 1}
                    </span>
                    <div className="relative w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#121212]">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      {video.duration > 0 && (
                        <span className="absolute bottom-0.5 right-0.5 bg-black/80 text-white text-[9px] px-1 rounded">
                          {formatDuration(video.duration)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-medium text-white truncate group-hover:text-red-400">
                        {video.title}
                      </span>
                      <span className="text-[10px] text-[#aaaaaa] truncate">
                        {video.owner?.fullname || video.owner?.username || 'Creator'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => playQueueItem(idx)}
                      title="Play now"
                      className="p-1.5 text-[#aaaaaa] hover:text-white hover:bg-[#383838] rounded-lg"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromQueue(idx)}
                      title="Remove from queue"
                      className="p-1.5 text-[#aaaaaa] hover:text-red-400 hover:bg-[#383838] rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="p-2 bg-[#181818] flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={clearQueue}
                  className="flex items-center gap-1 text-[#aaaaaa] hover:text-red-400 transition-colors px-2 py-1 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Queue
                </button>
                <button
                  type="button"
                  onClick={() => playQueueItem(0)}
                  className="flex items-center gap-1 text-white hover:text-red-400 font-semibold px-2 py-1 rounded"
                >
                  <PlaySquare className="w-3.5 h-3.5" />
                  Play All
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
