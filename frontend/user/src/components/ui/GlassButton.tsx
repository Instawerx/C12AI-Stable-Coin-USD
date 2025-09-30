import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = `
    relative inline-flex items-center justify-center
    font-medium transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
    backdrop-blur-md border rounded-lg
    group overflow-hidden
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500/30
      hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105
      active:scale-95 focus:ring-blue-500/20
    `,
    secondary: `
      bg-white/25 backdrop-blur-md text-gray-900 border-white/30
      hover:bg-white/40 hover:scale-105 hover:text-blue-700
      active:scale-95 focus:ring-blue-500/20
    `,
    ghost: `
      bg-transparent text-gray-600 border-transparent
      hover:bg-white/20 hover:text-gray-900
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-red-600 text-white border-red-500/30
      hover:shadow-lg hover:shadow-red-500/25 hover:scale-105
      active:scale-95 focus:ring-red-500/20
    `,
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
    xl: 'px-8 py-4 text-xl gap-3',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  };

  const classes = [baseClasses, variantClasses[variant], sizeClasses[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {/* Glass shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] skew-x-12 group-hover:animate-pulse" />

      {/* Content */}
      <span className="relative flex items-center justify-center gap-inherit">
        {loading ? (
          <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${iconSizes[size]}`} />
        ) : (
          leftIcon && <span className={iconSizes[size]}>{leftIcon}</span>
        )}

        {children}

        {!loading && rightIcon && <span className={iconSizes[size]}>{rightIcon}</span>}
      </span>
    </button>
  );
};

export default GlassButton;