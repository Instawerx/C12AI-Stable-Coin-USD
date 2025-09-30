'use client';

import React from 'react';
import { cn } from '../../utils/cn';

interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: number;
  active?: boolean;
  onClick?: () => void;
}

interface GlassNavbarProps {
  items: NavItem[];
  logo?: React.ReactNode;
  logoHref?: string;
  actions?: React.ReactNode;
  className?: string;
  variant?: 'fixed' | 'sticky' | 'static';
}

/**
 * GlassNavbar - Apple Glass styled navigation bar
 *
 * Features translucent glass effects, backdrop blur, and smooth animations
 * Perfect for both admin and user interfaces with responsive design.
 */
export const GlassNavbar: React.FC<GlassNavbarProps> = ({
  items,
  logo,
  logoHref = '/',
  actions,
  className,
  variant = 'sticky',
}) => {
  const baseClasses = `
    w-full glass-elevated border-b border-border-light
    backdrop-blur-xl transition-all duration-300 ease-out
    z-50
  `;

  const variantClasses = {
    fixed: 'fixed top-0 left-0 right-0',
    sticky: 'sticky top-0',
    static: 'relative',
  };

  return (
    <nav className={cn(baseClasses, variantClasses[variant], className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            {logo && (
              <a
                href={logoHref}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200"
              >
                {logo}
              </a>
            )}
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {items.map((item) => (
              <NavBarItem key={item.id} item={item} />
            ))}
          </div>

          {/* Actions Section */}
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <MobileMenuButton items={items} />
          </div>
        </div>
      </div>
    </nav>
  );
};

// Individual Navigation Item Component
const NavBarItem: React.FC<{ item: NavItem }> = ({ item }) => {
  const baseClasses = `
    relative px-3 py-2 rounded-lg text-sm font-medium
    transition-all duration-200 ease-out
    flex items-center gap-2
  `;

  const activeClasses = item.active
    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
    : 'text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary hover:bg-surface-glass';

  const handleClick = () => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      window.location.href = item.href;
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(baseClasses, activeClasses)}
    >
      {/* Icon */}
      {item.icon && (
        <span className="w-4 h-4 flex items-center justify-center">
          {item.icon}
        </span>
      )}

      {/* Label */}
      <span>{item.label}</span>

      {/* Badge */}
      {item.badge && item.badge > 0 && (
        <span className="bg-brand-error text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}

      {/* Active indicator */}
      {item.active && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-brand-primary rounded-full" />
      )}
    </button>
  );
};

// Mobile Menu Component
const MobileMenuButton: React.FC<{ items: NavItem[] }> = ({ items }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-card p-2 rounded-lg text-text-primary dark:text-text-dark-primary hover:bg-surface-elevated transition-all duration-200"
      >
        <svg
          className={cn('w-6 h-6 transition-transform duration-200', isOpen && 'rotate-90')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
          />
        </svg>
      </button>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full right-0 mt-2 w-64 glass-modal border border-border-light rounded-xl shadow-floating z-50 animate-scale-in">
            <div className="p-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.onClick) item.onClick();
                    else if (item.href) window.location.href = item.href;
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200',
                    item.active
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary hover:bg-surface-glass'
                  )}
                >
                  {item.icon && (
                    <span className="w-5 h-5 flex items-center justify-center">
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-brand-error text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GlassNavbar;