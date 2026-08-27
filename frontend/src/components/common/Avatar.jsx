import React, { useState } from 'react';

export const Avatar = ({ src, alt = 'Avatar', size = 'md', className = '', fallbackText }) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-28 h-28 text-3xl',
  };

  const getInitials = () => {
    if (fallbackText) return fallbackText.charAt(0).toUpperCase();
    if (alt && alt !== 'Avatar') return alt.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-tr from-red-700 to-rose-500 font-semibold text-white select-none ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <span>{getInitials()}</span>
      )}
    </div>
  );
};
