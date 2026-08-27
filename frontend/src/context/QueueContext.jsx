import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { encodeId } from '../utils/idEncoder';

const QueueContext = createContext(null);

export const QueueProvider = ({ children }) => {
  const [queue, setQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('noadtube_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(() => {
    try {
      const saved = localStorage.getItem('noadtube_autoplay');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    try {
      localStorage.setItem('noadtube_queue', JSON.stringify(queue));
    } catch {}
  }, [queue]);

  useEffect(() => {
    try {
      localStorage.setItem('noadtube_autoplay', JSON.stringify(isAutoplay));
    } catch {}
  }, [isAutoplay]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2800);
  };

  const addToQueue = (video) => {
    if (!video || !video._id) return;
    setQueue((prev) => {
      const exists = prev.some((v) => v._id === video._id);
      if (exists) {
        showToast('Video is already in queue');
        return prev;
      }
      showToast(`Added to queue: "${video.title.slice(0, 30)}..."`);
      return [...prev, video];
    });
  };

  const removeFromQueue = (index) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    setQueue([]);
    showToast('Queue cleared');
  };

  const playQueueItem = (index) => {
    if (index >= 0 && index < queue.length) {
      const videoToPlay = queue[index];
      // Remove all played items up to index
      setQueue((prev) => prev.filter((_, i) => i > index));
      navigate(`/watch/${encodeId(videoToPlay._id)}`);
    }
  };

  const playNextInQueue = (currentVideoId, relatedVideos = []) => {
    if (queue.length > 0) {
      const nextVideo = queue[0];
      setQueue((prev) => prev.slice(1));
      navigate(`/watch/${encodeId(nextVideo._id)}`);
      return true;
    } else if (isAutoplay && relatedVideos.length > 0) {
      const nextUp = relatedVideos.find((v) => v._id !== currentVideoId) || relatedVideos[0];
      if (nextUp) {
        navigate(`/watch/${encodeId(nextUp._id)}`);
        return true;
      }
    }
    return false;
  };

  const toggleAutoplay = () => {
    setIsAutoplay((prev) => !prev);
  };

  return (
    <QueueContext.Provider
      value={{
        queue,
        isQueueOpen,
        setIsQueueOpen,
        isAutoplay,
        toggleAutoplay,
        addToQueue,
        removeFromQueue,
        clearQueue,
        playQueueItem,
        playNextInQueue,
        toastMessage,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};
