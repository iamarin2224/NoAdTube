import React from 'react';

export const Input = ({
  label,
  error,
  icon: Icon,
  className = '',
  wrapperClassName = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label className="text-sm font-medium text-[#aaaaaa]">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-[#aaaaaa] pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          className={`w-full bg-[#121212] border border-[#303030] rounded-xl px-4 py-2.5 text-sm text-[#f1f1f1] placeholder-[#717171] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${
            Icon ? 'pl-11' : ''
          } ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
};

export const Textarea = ({
  label,
  error,
  className = '',
  wrapperClassName = '',
  rows = 3,
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label className="text-sm font-medium text-[#aaaaaa]">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`w-full bg-[#121212] border border-[#303030] rounded-xl px-4 py-2.5 text-sm text-[#f1f1f1] placeholder-[#717171] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-y ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
};
