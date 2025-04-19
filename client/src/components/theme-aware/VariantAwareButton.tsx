/**
 * VariantAwareButton Component - 2025 Edition
 *
 * A flexible button component that adapts to theme changes and supports
 * multiple variants and sizes using the component variant system.
 */

import React, { forwardRef } from 'react';
import { 
  createButtonVariants, 
  createVariantStyles 
} from '@/lib/componentVariants';
import { cn } from '@/lib/utils';

// Define the available button variants and sizes for TypeScript
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

// Button props interface
export interface VariantAwareButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// Load button variants once on component initialization
const buttonVariants = createButtonVariants();

// Button component with forwardRef for ref passing
export const VariantAwareButton = forwardRef<HTMLButtonElement, VariantAwareButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Get variant styles
    const variantStyles = createVariantStyles(
      buttonVariants, 
      { variant, size, className }
    );
    
    // Determine if button should be disabled
    const isDisabled = disabled || isLoading;
    
    return (
      <button
        ref={ref}
        className={cn(
          variantStyles.className,
          isLoading && 'opacity-70 cursor-progress',
          fullWidth && 'w-full',
          className
        )}
        style={variantStyles.style}
        disabled={isDisabled}
        {...props}
      >
        {isLoading && (
          <span className="mr-2 inline-block animate-spin">
            <svg
              className="h-4 w-4"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
        )}
        
        {!isLoading && leftIcon && (
          <span className="mr-2 inline-flex items-center">{leftIcon}</span>
        )}
        
        {children}
        
        {!isLoading && rightIcon && (
          <span className="ml-2 inline-flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

VariantAwareButton.displayName = 'VariantAwareButton';