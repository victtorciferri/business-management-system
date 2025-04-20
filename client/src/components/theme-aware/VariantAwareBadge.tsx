/**
 * Variant-Aware Badge - 2025 Edition
 * 
 * A badge component that adapts its styling based on the current theme
 */

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { BadgeVariant, BadgeSize, getBadgeStyles } from '@/lib/componentVariants';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export interface VariantAwareBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  label?: string;
  children?: React.ReactNode;
}

export function VariantAwareBadge({
  variant = 'default',
  size = 'md',
  label,
  children,
  className,
  ...props
}: VariantAwareBadgeProps) {
  const { theme } = useTheme();
  
  // Generate styles based on variant and theme
  const variantStyles = getBadgeStyles(variant, theme);
  
  // Size class mapping
  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1'
  };
  
  return (
    <Badge
      className={cn(
        'transition-all duration-200',
        sizeClasses[size],
        className
      )}
      style={variantStyles}
      {...props}
    >
      {children || label}
    </Badge>
  );
}

export default VariantAwareBadge;