'use client';

import React from 'react';
import Link from 'next/link';

interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

interface GlassNavbarProps {
  items: NavItem[];
  logo?: React.ReactNode;
  logoHref?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const GlassNavbar: React.FC<GlassNavbarProps> = ({
  items,
  logo,
  logoHref = '/',
  actions,
  className = '',
}) => {
  const baseClasses = `
    w-full bg-white/25 backdrop-blur-xl border-b border-white/30
    transition-all duration-300 ease-out z-50
  `;

  const classes = [baseClasses, className].filter(Boolean).join(' ');

  return (
    <nav className={classes}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            {logo && (
              <Link
                href={logoHref}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200"
              >
                {logo}
              </Link>
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
    ? 'bg-blue-500/10 text-blue-700 border border-blue-500/20'
    : 'text-gray-600 hover:text-gray-900 hover:bg-white/20';

  const classes = [baseClasses, activeClasses].filter(Boolean).join(' ');

  const handleClick = () => {
    if (item.onClick) {
      item.onClick();
    }
  };

  const content = (
    <>
      {/* Icon */}
      {item.icon && (
        <span className="w-4 h-4 flex items-center justify-center">
          {item.icon}
        </span>
      )}
      {/* Label */}
      <span>{item.label}</span>
      {/* Active indicator */}
      {item.active && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
      )}
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} className={classes} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={handleClick} className={classes}>
      {content}
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
        className="bg-white/25 backdrop-blur-md p-2 rounded-lg text-gray-900 hover:bg-white/40 transition-all duration-200"
      >
        <svg
          className={`w-6 h-6 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
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
          <div className="absolute top-full right-0 mt-2 w-64 bg-white/85 backdrop-blur-xl border border-white/30 rounded-xl shadow-2xl z-50">
            <div className="p-2">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.onClick) item.onClick();
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200
                    ${item.active
                      ? 'bg-blue-500/10 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/20'
                    }
                  `}
                >
                  {item.icon && (
                    <span className="w-5 h-5 flex items-center justify-center">
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1">{item.label}</span>
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