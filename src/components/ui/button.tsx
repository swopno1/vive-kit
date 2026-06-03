/**
 * Button Component
 *
 * Reusable button with Emil Kowalski design polish:
 * - Scale(0.97) press feedback
 * - Custom easing curves from animations.css
 * - Accessibility-first with focus indicators
 * - Touch device support (no hover animations)
 * - Disabled state handling
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant style
   * - primary: Blue background, white text (main actions)
   * - secondary: Gray background (secondary actions)
   * - ghost: No background, text-only (minimal style)
   * - danger: Red background (destructive actions)
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';

  /**
   * Button size
   * - sm: Small, compact button
   * - md: Medium, standard button
   * - lg: Large, prominent button
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Loading state - shows spinner, disables interaction
   */
  isLoading?: boolean;

  /**
   * Loading text to show when isLoading is true
   */
  loadingText?: string;

  /**
   * Show as full width
   */
  fullWidth?: boolean;
}

const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  ghost: 'text-gray-700 hover:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizeStyles = {
  sm: 'px-3 py-2 text-sm rounded',
  md: 'px-4 py-2 text-base rounded-md',
  lg: 'px-6 py-3 text-lg rounded-lg',
};

/**
 * Button Component with Emil Kowalski polish
 *
 * Features:
 * - Custom easing: transform and box-shadow transitions use --ease-out
 * - Press feedback: scale(0.97) on :active for tactile response
 * - Loading state: Shows spinner and loading text when isLoading=true
 * - Accessibility: Focus indicators, disabled state, aria-busy
 * - Touch-safe: No hover animations on touch devices
 *
 * @example
 * // Primary button
 * <Button variant="primary">Generate Response</Button>
 *
 * // Loading state
 * <Button isLoading loadingText="Generating...">Generate</Button>
 *
 * // Danger button
 * <Button variant="danger" onClick={handleDelete}>Delete Account</Button>
 */
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  fullWidth = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        // Base styles - transition defined in animations.css
        'inline-flex items-center justify-center gap-2',
        'font-medium transition-[transform,box-shadow] duration-100 ease-out',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Variant and size
        variantStyles[variant],
        sizeStyles[size],
        // Full width option
        fullWidth && 'w-full',
        // Custom class
        className
      )}
      aria-busy={isLoading}
      {...props}
    >
      {/* Spinner when loading */}
      {isLoading && (
        <svg
          className="spinner spinner--with-pulse w-4 h-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Content - show loading text or children */}
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
}

/**
 * IconButton - Button variant for icon-only buttons
 *
 * @example
 * <IconButton aria-label="Close" onClick={handleClose}>
 *   <XIcon />
 * </IconButton>
 */
export function IconButton({
  size = 'md',
  ...props
}: Omit<ButtonProps, 'size'> & { size?: 'sm' | 'md' | 'lg' }) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <button
      className={cn(
        'flex items-center justify-center rounded-lg',
        'transition-[background-color,box-shadow] duration-100 ease-out',
        'hover:bg-gray-100',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeMap[size],
        props.className
      )}
      {...props}
    />
  );
}

export default Button;
