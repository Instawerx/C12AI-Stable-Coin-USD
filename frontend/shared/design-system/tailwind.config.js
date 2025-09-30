const { appleGlassTheme } = require('./theme.ts');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    '../user/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../admin/src/**/*.{js,ts,jsx,tsx,mdx}',
    '../shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Colors from Apple Glass theme
      colors: {
        // Glass colors
        glass: appleGlassTheme.colors.glass,

        // Background layers
        background: appleGlassTheme.colors.background,

        // Text colors
        text: appleGlassTheme.colors.text,

        // Brand colors
        brand: appleGlassTheme.colors.brand,

        // Surface colors
        surface: appleGlassTheme.colors.surface,

        // Border colors
        border: appleGlassTheme.colors.border,
      },

      // Typography
      fontFamily: appleGlassTheme.typography.fontFamily,
      fontSize: appleGlassTheme.typography.fontSize,
      fontWeight: appleGlassTheme.typography.fontWeight,
      lineHeight: appleGlassTheme.typography.lineHeight,
      letterSpacing: appleGlassTheme.typography.letterSpacing,

      // Spacing
      spacing: appleGlassTheme.spacing,

      // Border radius
      borderRadius: appleGlassTheme.borderRadius,

      // Box shadows
      boxShadow: appleGlassTheme.shadows,

      // Backdrop blur
      backdropBlur: appleGlassTheme.backdropBlur,

      // Animation
      transitionDuration: appleGlassTheme.animation.duration,
      transitionTimingFunction: appleGlassTheme.animation.easing,

      // Z-index
      zIndex: appleGlassTheme.zIndex,

      // Breakpoints
      screens: appleGlassTheme.breakpoints,

      // Custom utilities for glass effects
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
        'glass-gradient-dark': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'brand-gradient': 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
        'success-gradient': 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
        'warning-gradient': 'linear-gradient(135deg, #FF9500 0%, #FF9F0A 100%)',
        'error-gradient': 'linear-gradient(135deg, #FF3B30 0%, #FF453A 100%)',
      },

      // Custom animations
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'scale-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        'glass-shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 122, 255, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 122, 255, 0.6)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-in',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-out-right': 'slide-out-right 0.3s ease-in',
        'scale-in': 'scale-in 0.2s ease-out',
        'scale-out': 'scale-out 0.2s ease-in',
        'glass-shimmer': 'glass-shimmer 2s infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),

    // Custom plugin for glass utilities
    function({ addUtilities, theme }) {
      const glassUtilities = {
        '.glass': {
          background: theme('colors.surface.glass'),
          backdropFilter: theme('backdropBlur.base'),
          border: `1px solid ${theme('colors.border.light')}`,
          boxShadow: theme('boxShadow.glass'),
        },
        '.glass-dark': {
          background: theme('colors.surface.glassDark'),
          backdropFilter: theme('backdropBlur.base'),
          border: `1px solid ${theme('colors.border.medium')}`,
          boxShadow: theme('boxShadow.glassDark'),
        },
        '.glass-card': {
          background: theme('colors.surface.card'),
          backdropFilter: theme('backdropBlur.md'),
          border: `1px solid ${theme('colors.border.light')}`,
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.elevation2'),
        },
        '.glass-elevated': {
          background: theme('colors.surface.elevated'),
          backdropFilter: theme('backdropBlur.lg'),
          border: `1px solid ${theme('colors.border.light')}`,
          borderRadius: theme('borderRadius.xl'),
          boxShadow: theme('boxShadow.elevation3'),
        },
        '.glass-modal': {
          background: theme('colors.surface.modal'),
          backdropFilter: theme('backdropBlur.xl'),
          border: `1px solid ${theme('colors.border.light')}`,
          borderRadius: theme('borderRadius.2xl'),
          boxShadow: theme('boxShadow.floating'),
        },
        '.text-glass': {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        },
        '.border-glass': {
          border: `1px solid ${theme('colors.border.light')}`,
          borderImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%) 1',
        },
        '.hover-glass': {
          '&:hover': {
            background: theme('colors.surface.elevated'),
            transform: 'translateY(-2px)',
            boxShadow: theme('boxShadow.elevation3'),
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
        '.focus-glass': {
          '&:focus': {
            outline: 'none',
            border: `2px solid ${theme('colors.brand.primary')}`,
            boxShadow: `0 0 0 4px rgba(0, 122, 255, 0.1), ${theme('boxShadow.glass')}`,
          },
        },
      };

      addUtilities(glassUtilities);
    },
  ],
};