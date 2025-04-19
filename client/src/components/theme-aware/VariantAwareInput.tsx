/**
 * VariantAwareInput Component - 2025 Edition
 *
 * A flexible input component that adapts to theme changes and supports
 * multiple variants and sizes using the component variant system.
 */

import React, { forwardRef } from 'react';
import { 
  createInputVariants, 
  createVariantStyles 
} from '@/lib/componentVariants';
import { cn } from '@/lib/utils';

// Define the available input variants and sizes for TypeScript
export type InputVariant = 'default' | 'filled' | 'outline' | 'underlined';
export type InputSize = 'sm' | 'md' | 'lg';

// Input props interface
// Create a base interface for input props without size
type BaseInputAttributes = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>;

// Define our component props, extending the base interface
export interface VariantAwareInputProps extends BaseInputAttributes {
  variant?: InputVariant;
  size?: InputSize;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  error?: boolean;
  errorMessage?: string;
  fullWidth?: boolean;
}

// Load input variants once on component initialization
const inputVariants = createInputVariants();

// Input component with forwardRef for ref passing
export const VariantAwareInput = forwardRef<HTMLInputElement, VariantAwareInputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      leftAddon,
      rightAddon,
      error = false,
      errorMessage,
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    // Get variant styles
    const variantStyles = createVariantStyles(
      inputVariants, 
      { variant, size, className }
    );
    
    const inputStyles: React.CSSProperties = {
      ...(variantStyles.style || {}),
      ...(error ? { borderColor: 'var(--colors-error-base)' } : {}),
    };
    
    const inputElement = (
      <div className={cn(
        'relative',
        fullWidth && 'w-full',
      )}>
        {leftAddon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            {leftAddon}
          </div>
        )}
        
        <input
          ref={ref}
          className={cn(
            variantStyles.className,
            leftAddon && 'pl-10',
            rightAddon && 'pr-10',
            error && 'border-error focus:border-error',
            fullWidth && 'w-full',
            className
          )}
          style={inputStyles}
          {...props}
        />
        
        {rightAddon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
            {rightAddon}
          </div>
        )}
      </div>
    );
    
    return (
      <div className={cn("flex flex-col", fullWidth && "w-full")}>
        {inputElement}
        
        {error && errorMessage && (
          <p className="mt-1 text-xs text-error">{errorMessage}</p>
        )}
      </div>
    );
  }
);

VariantAwareInput.displayName = 'VariantAwareInput';