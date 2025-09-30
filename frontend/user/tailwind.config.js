/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Import Apple Glass theme from shared design system
      colors: {
        // Glass colors
        glass: {
          white: 'rgba(255, 255, 255, 0.1)',
          black: 'rgba(0, 0, 0, 0.1)',
          gray: 'rgba(128, 128, 128, 0.1)',
          blue: 'rgba(0, 122, 255, 0.1)',
        },

        // Background layers
        background: {
          primary: 'rgba(248, 249, 250, 0.95)',
          secondary: 'rgba(255, 255, 255, 0.8)',
          tertiary: 'rgba(255, 255, 255, 0.6)',
          dark: {
            primary: 'rgba(28, 28, 30, 0.95)',
            secondary: 'rgba(44, 44, 46, 0.8)',
            tertiary: 'rgba(58, 58, 60, 0.6)',
          }
        },

        // Text colors
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

        // Brand colors
        brand: {
          primary: '#007AFF',
          secondary: '#5856D6',
          success: '#34C759',
          warning: '#FF9500',
          error: '#FF3B30',
          info: '#5AC8FA',
        },

        // Surface colors
        surface: {
          glass: 'rgba(255, 255, 255, 0.25)',
          glassDark: 'rgba(0, 0, 0, 0.25)',
          elevated: 'rgba(255, 255, 255, 0.4)',
          card: 'rgba(255, 255, 255, 0.3)',
          modal: 'rgba(255, 255, 255, 0.85)',
        },

        // Border colors
        border: {
          light: 'rgba(255, 255, 255, 0.3)',
          medium: 'rgba(255, 255, 255, 0.2)',
          dark: 'rgba(0, 0, 0, 0.1)',
          accent: 'rgba(0, 122, 255, 0.3)',
        }
      },

      // Typography
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['SF Mono', 'Consolas', 'Monaco', 'monospace'],
      },

      // Backdrop blur
      backdropBlur: {
        xs: 'blur(2px)',
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
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
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
        'scale-in': 'scale-in 0.2s ease-out',
        'glass-shimmer': 'glass-shimmer 2s infinite',
        'pulse-glow': 'pulse-glow 2s infinite',
      },

      // Background images
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
        'brand-gradient': 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
        'success-gradient': 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
        'warning-gradient': 'linear-gradient(135deg, #FF9500 0%, #FF9F0A 100%)',
        'error-gradient': 'linear-gradient(135deg, #FF3B30 0%, #FF453A 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),

    // Custom glass utilities
    function({ addUtilities, theme }) {
      const glassUtilities = {
        '.glass': {
          background: theme('colors.surface.glass'),
          backdropFilter: 'blur(8px)',
          border: `1px solid ${theme('colors.border.light')}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(255, 255, 255, 0.5) inset',
        },
        '.glass-card': {
          background: theme('colors.surface.card'),
          backdropFilter: 'blur(12px)',
          border: `1px solid ${theme('colors.border.light')}`,
          borderRadius: theme('borderRadius.lg'),
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
        },
        '.glass-elevated': {
          background: theme('colors.surface.elevated'),
          backdropFilter: 'blur(16px)',
          border: `1px solid ${theme('colors.border.light')}`,
          borderRadius: theme('borderRadius.xl'),
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        },
        '.glass-modal': {
          background: theme('colors.surface.modal'),
          backdropFilter: 'blur(24px)',
          border: `1px solid ${theme('colors.border.light')}`,
          borderRadius: theme('borderRadius.2xl'),
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15), 0 12px 25px rgba(0, 0, 0, 0.1)',
        },
        '.hover-glass': {
          '&:hover': {
            background: theme('colors.surface.elevated'),
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      };

      addUtilities(glassUtilities);
    },
  ],
};