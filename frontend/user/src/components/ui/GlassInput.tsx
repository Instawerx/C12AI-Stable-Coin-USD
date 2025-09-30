import React from 'react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled';
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses = `
    w-full px-4 py-3 text-base transition-all duration-300 ease-out
    bg-white/20 backdrop-blur-md border border-white/30 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50
    placeholder:text-gray-500/70 text-gray-900
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantClasses = {
    default: 'hover:bg-white/30',
    filled: 'bg-white/40 hover:bg-white/50',
  };

  const errorClasses = error ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20' : '';

  const iconPadding = {
    left: leftIcon ? 'pl-12' : '',
    right: rightIcon ? 'pr-12' : '',
  };

  const inputClasses = [
    baseClasses,
    variantClasses[variant],
    errorClasses,
    iconPadding.left,
    iconPadding.right,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500/70 pointer-events-none">
            {leftIcon}
          </div>
        )}

        {/* Input */}
        <input
          id={inputId}
          className={inputClasses}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {rightIcon}
          </div>
        )}

        {/* Glass shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] skew-x-12 pointer-events-none opacity-0 transition-opacity duration-300 hover:opacity-100 rounded-lg" />
      </div>

      {/* Helper Text or Error */}
      {(error || helperText) && (
        <div className={`text-sm ${error ? 'text-red-500' : 'text-gray-500/70'}`}>
          {error || helperText}
        </div>
      )}
    </div>
  );
};

export default GlassInput;