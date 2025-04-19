/**
 * VariantAwareCard Component - 2025 Edition
 *
 * A flexible card component that adapts to theme changes and supports
 * multiple variants and sizes using the component variant system.
 */

import React, { forwardRef } from 'react';
import { 
  createCardVariants, 
  createVariantStyles 
} from '@/lib/componentVariants';
import { cn } from '@/lib/utils';

// Define the available card variants and sizes for TypeScript
export type CardVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'flat';
export type CardSize = 'sm' | 'md' | 'lg';

// Card props interface
export interface VariantAwareCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  size?: CardSize;
  withHover?: boolean;
  withBorder?: boolean;
  withShadow?: boolean;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
}

// Load card variants once on component initialization
const cardVariants = createCardVariants();

// Card component with forwardRef for ref passing
export const VariantAwareCard = forwardRef<HTMLDivElement, VariantAwareCardProps>(
  (
    {
      variant = 'default',
      size = 'md',
      withHover = false,
      withBorder = true,
      withShadow = true,
      headerContent,
      footerContent,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Get variant styles
    const variantStyles = createVariantStyles(
      cardVariants, 
      { variant, size, className }
    );
    
    return (
      <div
        ref={ref}
        className={cn(
          variantStyles.className,
          withHover && 'hover:shadow-md transition-shadow duration-200',
          !withBorder && 'border-0',
          !withShadow && 'shadow-none',
          className
        )}
        style={variantStyles.style}
        {...props}
      >
        {headerContent && (
          <div className="mb-4">
            {headerContent}
          </div>
        )}
        
        <div>
          {children}
        </div>
        
        {footerContent && (
          <div className="mt-4 pt-3 border-t">
            {footerContent}
          </div>
        )}
      </div>
    );
  }
);

// Card header component
export const VariantAwareCardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mb-4', className)}
      {...props}
    />
  )
);

// Card title component
export const VariantAwareCardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  )
);

// Card description component
export const VariantAwareCardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
);

// Card content component
export const VariantAwareCardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('', className)}
      {...props}
    />
  )
);

// Card footer component
export const VariantAwareCardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-4 pt-3 border-t', className)}
      {...props}
    />
  )
);

VariantAwareCard.displayName = 'VariantAwareCard';
VariantAwareCardHeader.displayName = 'VariantAwareCardHeader';
VariantAwareCardTitle.displayName = 'VariantAwareCardTitle';
VariantAwareCardDescription.displayName = 'VariantAwareCardDescription';
VariantAwareCardContent.displayName = 'VariantAwareCardContent';
VariantAwareCardFooter.displayName = 'VariantAwareCardFooter';