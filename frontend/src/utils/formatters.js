import { formatDistanceToNowStrict, parseISO } from 'date-fns';

/**
 * Format video duration in seconds to standard MM:SS or HH:MM:SS format
 * @param {number} durationInSeconds 
 * @returns {string}
 */
export function formatDuration(durationInSeconds) {
  if (!durationInSeconds || isNaN(durationInSeconds)) return '0:00';
  const totalSeconds = Math.floor(durationInSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;

  if (hours > 0) {
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${minutes}:${paddedSeconds}`;
}

/**
 * Format view count to human readable format (e.g. 1.2K, 3.4M, 1B)
 * @param {number} count 
 * @returns {string}
 */
export function formatViews(count) {
  if (!count && count !== 0) return '0 views';
  const num = Number(count);
  if (isNaN(num)) return '0 views';

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B views`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M views`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K views`;
  }
  if (num === 1) return '1 view';
  return `${num} views`;
}

/**
 * Format relative date (e.g. "2 hours ago", "3 days ago")
 * @param {string|Date} dateStr 
 * @returns {string}
 */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    return `${formatDistanceToNowStrict(date, { addSuffix: true })}`;
  } catch (err) {
    return '';
  }
}

/**
 * Format subscriber count
 * @param {number} count 
 * @returns {string}
 */
export function formatSubscribers(count) {
  if (!count && count !== 0) return '0 subscribers';
  const num = Number(count);
  if (isNaN(num)) return '0 subscribers';

  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M subscribers`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K subscribers`;
  }
  if (num === 1) return '1 subscriber';
  return `${num} subscribers`;
}
