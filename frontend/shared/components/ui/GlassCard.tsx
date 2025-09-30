import React from 'react';
import { cn } from '../../utils/cn';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'modal';
  hover?: boolean;
  children: React.ReactNode;
}

/**
 * GlassCard - A foundational glass-effect card component
 *
 * Features Apple Glass design with translucent backgrounds,
 * backdrop blur, and subtle depth effects.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'default',
  hover = false,
  className,
  children,
  ...props
}) => {
  const baseClasses = 'relative transition-all duration-300 ease-out';

  const variantClasses = {
    default: 'glass-card',
    elevated: 'glass-elevated',
    modal: 'glass-modal',
  };

  const hoverClasses = hover ? 'hover-glass cursor-pointer' : '';

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        className
      )}
      {...props}
    >
      {/* Glass shimmer effect overlay */}
      <div className="absolute inset-0 overflow-hidden rounded-inherit">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] skew-x-12 animate-glass-shimmer" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;