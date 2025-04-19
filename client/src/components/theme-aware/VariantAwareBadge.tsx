/**
 * VariantAwareBadge Component - 2025 Edition
 *
 * A flexible badge component that adapts to theme changes and supports
 * multiple variants and sizes using the component variant system.
 */

import React, { forwardRef } from 'react';
import { 
  createBadgeVariants, 
  createVariantStyles 
} from '@/lib/componentVariants';
import { cn } from '@/lib/utils';

// Define the available badge variants and sizes for TypeScript
export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

// Badge props interface
export interface VariantAwareBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

// Load badge variants once on component initialization
const badgeVariants = createBadgeVariants();

// Badge component with forwardRef for ref passing
export const VariantAwareBadge = forwardRef<HTMLSpanElement, VariantAwareBadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      icon,
      removable = false,
      onRemove,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Get variant styles
    const variantStyles = createVariantStyles(
      badgeVariants, 
      { variant, size, className }
    );
    
    return (
      <span
        ref={ref}
        className={cn(
          variantStyles.className,
          className
        )}
        style={variantStyles.style}
        {...props}
      >
        {icon && (
          <span className="mr-1 inline-flex items-center">
            {icon}
          </span>
        )}
        
        {children}
        
        {removable && (
          <button
            type="button"
            className="ml-1 -mr-1 h-3.5 w-3.5 rounded-full inline-flex items-center justify-center hover:bg-muted/50"
            onClick={e => {
              e.stopPropagation();
              onRemove?.();
            }}
            aria-hidden="true"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 16 16" 
              fill="currentColor" 
              className="h-3 w-3"
            >
              <path d="M12.72 3.293a1 1 0 00-1.415 0L8.012 6.586 4.72 3.293a1 1 0 00-1.414 1.414L6.598 8l-3.293 3.293a1 1 0 101.414 1.414l3.293-3.293 3.293 3.293a1 1 0 001.414-1.414L9.426 8l3.293-3.293a1 1 0 000-1.414z" />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

VariantAwareBadge.displayName = 'VariantAwareBadge';