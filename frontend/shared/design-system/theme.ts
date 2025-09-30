/**
 * Apple Glass Design System Theme Configuration
 *
 * Inspired by Apple's design philosophy with glassmorphism, depth, and sophistication
 * Features: Translucent surfaces, depth-based layering, refined typography
 */

export const appleGlassTheme = {
  // Color Palette - Apple Glass inspired
  colors: {
    // Primary Glass Colors
    glass: {
      white: 'rgba(255, 255, 255, 0.1)',
      black: 'rgba(0, 0, 0, 0.1)',
      gray: 'rgba(128, 128, 128, 0.1)',
      blue: 'rgba(0, 122, 255, 0.1)',
    },

    // Background Layers
    background: {
      primary: 'rgba(248, 249, 250, 0.95)', // Light mode base
      secondary: 'rgba(255, 255, 255, 0.8)',
      tertiary: 'rgba(255, 255, 255, 0.6)',
      dark: {
        primary: 'rgba(28, 28, 30, 0.95)', // Dark mode base
        secondary: 'rgba(44, 44, 46, 0.8)',
        tertiary: 'rgba(58, 58, 60, 0.6)',
      }
    },

    // Text Colors
    text: {
      primary: 'rgba(0, 0, 0, 0.9)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      tertiary: 'rgba(0, 0, 0, 0.4)',
      inverse: 'rgba(255, 255, 255, 0.9)',
      dark: {
        primary: 'rgba(255, 255, 255, 0.9)',
        secondary: 'rgba(255, 255, 255, 0.6)',
        tertiary: 'rgba(255, 255, 255, 0.4)',
      }
    },

    // Brand Colors
    brand: {
      primary: '#007AFF', // Apple Blue
      secondary: '#5856D6', // Apple Purple
      success: '#34C759', // Apple Green
      warning: '#FF9500', // Apple Orange
      error: '#FF3B30', // Apple Red
      info: '#5AC8FA', // Apple Light Blue
    },

    // Surface Colors with Glass Effect
    surface: {
      glass: 'rgba(255, 255, 255, 0.25)',
      glassDark: 'rgba(0, 0, 0, 0.25)',
      elevated: 'rgba(255, 255, 255, 0.4)',
      card: 'rgba(255, 255, 255, 0.3)',
      modal: 'rgba(255, 255, 255, 0.85)',
    },

    // Border Colors
    border: {
      light: 'rgba(255, 255, 255, 0.3)',
      medium: 'rgba(255, 255, 255, 0.2)',
      dark: 'rgba(0, 0, 0, 0.1)',
      accent: 'rgba(0, 122, 255, 0.3)',
    }
  },

  // Typography - SF Pro inspired
  typography: {
    fontFamily: {
      primary: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['SF Mono', 'Consolas', 'Monaco', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem', // 60px
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      black: '900',
    },
    lineHeight: {
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    }
  },

  // Spacing System - 8px base grid
  spacing: {
    0: '0',
    1: '0.25rem',  // 4px
    2: '0.5rem',   // 8px
    3: '0.75rem',  // 12px
    4: '1rem',     // 16px
    5: '1.25rem',  // 20px
    6: '1.5rem',   // 24px
    8: '2rem',     // 32px
    10: '2.5rem',  // 40px
    12: '3rem',    // 48px
    16: '4rem',    // 64px
    20: '5rem',    // 80px
    24: '6rem',    // 96px
    32: '8rem',    // 128px
  },

  // Border Radius - Apple's refined corners
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.5rem',  // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
    full: '9999px',
  },

  // Shadows - Depth and layering
  shadows: {
    glass: '0 8px 32px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(255, 255, 255, 0.5) inset',
    glassDark: '0 8px 32px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.1) inset',
    elevation1: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    elevation2: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    elevation3: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    elevation4: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
    floating: '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 25px rgba(0, 0, 0, 0.1)',
  },

  // Backdrop Blur - Key to glass effect
  backdropBlur: {
    none: 'none',
    sm: 'blur(4px)',
    base: 'blur(8px)',
    md: 'blur(12px)',
    lg: 'blur(16px)',
    xl: 'blur(24px)',
    '2xl': 'blur(40px)',
  },

  // Animation Timings - Fluid and responsive
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '750ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    }
  },

  // Z-Index System
  zIndex: {
    base: 0,
    raised: 10,
    dropdown: 100,
    sticky: 200,
    overlay: 300,
    modal: 400,
    popover: 500,
    toast: 600,
    tooltip: 700,
    maximum: 999,
  },

  // Breakpoints - Responsive design
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  }
};

// Type definitions for TypeScript
export type AppleGlassTheme = typeof appleGlassTheme;
export type ThemeColors = typeof appleGlassTheme.colors;
export type ThemeSpacing = typeof appleGlassTheme.spacing;
export type ThemeTypography = typeof appleGlassTheme.typography;