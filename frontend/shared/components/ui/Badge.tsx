import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  children: React.ReactNode;
  icon?: React.ReactNode;
  glow?: boolean;
}

/**
 * Badge - Apple Glass styled badge component for DAO membership and achievements
 *
 * Features rarity-based styling, glass effects, and optional glow animations
 * Perfect for displaying user achievements, membership tiers, and status indicators.
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  rarity,
  className,
  children,
  icon,
  glow = false,
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium transition-all duration-300 ease-out
    glass-card relative overflow-hidden
  `;

  const variantClasses = {
    default: 'text-text-primary dark:text-text-dark-primary',
    primary: 'bg-brand-gradient text-white border-brand-primary/30',
    secondary: 'bg-surface-elevated text-brand-secondary border-brand-secondary/30',
    success: 'bg-success-gradient text-white border-brand-success/30',
    warning: 'bg-warning-gradient text-white border-brand-warning/30',
    error: 'bg-error-gradient text-white border-brand-error/30',
    info: 'bg-gradient-to-r from-brand-info/80 to-brand-info text-white border-brand-info/30',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs rounded-md gap-1',
    md: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
    lg: 'px-4 py-2 text-base rounded-xl gap-2',
  };

  const rarityClasses = rarity ? {
    common: 'border-gray-300 dark:border-gray-600',
    uncommon: 'border-green-400 dark:border-green-500',
    rare: 'border-blue-400 dark:border-blue-500',
    epic: 'border-purple-400 dark:border-purple-500',
    legendary: 'border-yellow-400 dark:border-yellow-500 shadow-[0_0_20px_rgba(251,191,36,0.3)]',
  } : {};

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const glowClasses = glow || rarity === 'legendary' ? 'animate-pulse-glow' : '';

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        rarity && rarityClasses[rarity],
        glowClasses,
        className
      )}
      {...props}
    >
      {/* Rarity glow effect */}
      {(glow || rarity === 'legendary') && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-glass-shimmer" />
      )}

      {/* Content */}
      <span className="relative flex items-center gap-inherit">
        {icon && <span className={iconSizes[size]}>{icon}</span>}
        {children}
      </span>

      {/* Rarity indicator */}
      {rarity && (
        <div className="absolute top-0 right-0 w-2 h-2">
          <div
            className={cn(
              'w-full h-full rounded-full',
              rarity === 'common' && 'bg-gray-400',
              rarity === 'uncommon' && 'bg-green-400',
              rarity === 'rare' && 'bg-blue-400',
              rarity === 'epic' && 'bg-purple-400',
              rarity === 'legendary' && 'bg-yellow-400 animate-pulse'
            )}
          />
        </div>
      )}
    </div>
  );
};

export default Badge;