import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'modal';
  hover?: boolean;
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'default',
  hover = false,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'relative transition-all duration-300 ease-out';

  const variantClasses = {
    default: 'bg-white/25 backdrop-blur-md border border-white/30 rounded-lg shadow-lg',
    elevated: 'bg-white/40 backdrop-blur-lg border border-white/30 rounded-xl shadow-xl',
    modal: 'bg-white/85 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl',
  };

  const hoverClasses = hover ? 'hover:bg-white/40 hover:-translate-y-1 hover:shadow-xl cursor-pointer' : '';

  const classes = [baseClasses, variantClasses[variant], hoverClasses, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {/* Glass shimmer effect overlay */}
      <div className="absolute inset-0 overflow-hidden rounded-inherit">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] skew-x-12 hover:animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;