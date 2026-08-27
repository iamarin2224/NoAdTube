import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-[#f1f1f1] text-[#0f0f0f] hover:bg-white active:bg-gray-200 shadow-sm font-semibold',
    secondary: 'bg-[#272727] text-white hover:bg-[#3f3f3f] active:bg-[#4f4f4f]',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    outline: 'border border-[#303030] text-[#f1f1f1] hover:bg-[#272727] hover:border-transparent',
    ghost: 'text-[#f1f1f1] hover:bg-[#272727] active:bg-[#3f3f3f]',
    youtube: 'bg-[#cc0000] text-white hover:bg-red-600 font-semibold',
    subscribed: 'bg-[#272727] text-[#aaaaaa] hover:bg-[#3f3f3f] hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-2.5 text-base gap-2.5',
    icon: 'p-2.5 rounded-full aspect-square',
    'icon-sm': 'p-1.5 rounded-full aspect-square',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className={size === 'sm' || size === 'icon-sm' ? 'w-4 h-4' : 'w-5 h-5'} />
      ) : null}
      {children}
    </button>
  );
};
