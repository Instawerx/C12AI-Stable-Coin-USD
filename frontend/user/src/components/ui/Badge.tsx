import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center font-medium
    backdrop-blur-md border rounded-full transition-all duration-300 ease-out
    relative overflow-hidden
  `;

  const variantClasses = {
    default: 'bg-gray-100/80 text-gray-800 border-gray-200/50',
    primary: 'bg-blue-100/80 text-blue-800 border-blue-200/50',
    success: 'bg-green-100/80 text-green-800 border-green-200/50',
    error: 'bg-red-100/80 text-red-800 border-red-200/50',
    warning: 'bg-yellow-100/80 text-yellow-800 border-yellow-200/50',
    info: 'bg-blue-100/80 text-blue-800 border-blue-200/50',
    secondary: 'bg-white/25 text-gray-700 border-white/30',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const classes = [baseClasses, variantClasses[variant], sizeClasses[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} {...props}>
      {/* Glass shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] skew-x-12 opacity-0 hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <span className="relative z-10">
        {children}
      </span>
    </span>
  );
};

export default Badge;