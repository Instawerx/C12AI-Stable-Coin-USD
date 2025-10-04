import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
}

/**
 * GlassInput - Apple Glass styled input component
 *
 * Features floating labels, glass effects, and smooth focus animations
 * with support for icons, error states, and multiple variants.
 */
export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({
    label,
    error,
    leftIcon,
    rightIcon,
    variant = 'default',
    className,
    type = 'text',
    ...props
  }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue);

    const inputRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => inputRef.current!);

    const baseClasses = `
      w-full transition-all duration-300 ease-out
      bg-transparent text-text-primary dark:text-text-dark-primary
      placeholder-transparent peer
    `;

    const variantClasses = {
      default: `
        glass-card px-4 py-3 text-base
        focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary
      `,
      filled: `
        bg-surface-glass px-4 py-3 text-base border border-border-light
        focus:bg-surface-elevated focus:border-brand-primary
      `,
      outlined: `
        border-2 border-border-medium px-4 py-3 text-base
        focus:border-brand-primary focus:bg-surface-glass/50
      `,
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      setHasValue(!!e.target.value);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const isLabelFloating = focused || hasValue;

    return (
      <div className="relative">
        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary dark:text-text-dark-secondary z-10">
              <span className="w-5 h-5 flex items-center justify-center">
                {leftIcon}
              </span>
            </div>
          )}

          {/* Input */}
          <input
            ref={inputRef}
            type={type}
            className={cn(
              baseClasses,
              variantClasses[variant],
              leftIcon ? 'pl-12' : '',
              rightIcon ? 'pr-12' : '',
              error ? 'border-brand-error focus:border-brand-error focus:ring-brand-error/20' : '',
              className
            )}
            placeholder={label}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />

          {/* Floating Label */}
          {label && (
            <label
              className={cn(
                'absolute left-4 transition-all duration-300 ease-out pointer-events-none',
                'text-text-secondary dark:text-text-dark-secondary',
                leftIcon ? 'left-12' : '',
                isLabelFloating
                  ? 'top-2 text-xs text-brand-primary scale-90 origin-left'
                  : 'top-1/2 text-base transform -translate-y-1/2'
              )}
            >
              {label}
            </label>
          )}

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary dark:text-text-dark-secondary z-10">
              <span className="w-5 h-5 flex items-center justify-center">
                {rightIcon}
              </span>
            </div>
          )}

          {/* Focus Ring */}
          <div
            className={cn(
              'absolute inset-0 rounded-lg transition-all duration-300',
              'bg-gradient-to-r from-brand-primary/20 via-brand-secondary/20 to-brand-primary/20',
              'opacity-0 blur-sm scale-95 pointer-events-none',
              focused && 'opacity-100 blur-0 scale-100'
            )}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 text-sm text-brand-error animate-fade-in">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </span>
          </div>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
export default GlassInput;