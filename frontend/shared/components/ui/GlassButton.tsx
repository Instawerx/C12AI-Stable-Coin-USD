import React from 'react';
import { cn } from '../../utils/cn';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * GlassButton - Apple Glass styled button component
 *
 * Features translucent backgrounds, depth effects, and smooth animations
 * with support for icons, loading states, and multiple variants.
 */
export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  ...props
}) => {
  const baseClasses = `
    relative inline-flex items-center justify-center
    font-medium transition-all duration-300 ease-out
    focus-glass disabled:opacity-50 disabled:cursor-not-allowed
    backdrop-blur-md border rounded-lg
    group overflow-hidden
  `;

  const variantClasses = {
    primary: `
      bg-brand-gradient text-white border-brand-primary/30
      hover:shadow-elevation3 hover:scale-[1.02] hover:border-brand-primary/50
      active:scale-[0.98] shadow-elevation2
    `,
    secondary: `
      glass-card text-text-primary dark:text-text-dark-primary
      hover:glass-elevated hover:scale-[1.02] hover:text-brand-primary
      active:scale-[0.98]
    `,
    ghost: `
      bg-transparent text-text-secondary dark:text-text-dark-secondary
      border-transparent hover:bg-surface-glass hover:text-text-primary
      hover:border-border-light dark:hover:text-text-dark-primary
    `,
    danger: `
      bg-error-gradient text-white border-brand-error/30
      hover:shadow-elevation3 hover:scale-[1.02] hover:border-brand-error/50
      active:scale-[0.98] shadow-elevation2
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

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {/* Glass shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] skew-x-12 group-hover:animate-glass-shimmer" />

      {/* Content */}
      <span className="relative flex items-center justify-center gap-inherit">
        {loading ? (
          <div className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', iconSizes[size])} />
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