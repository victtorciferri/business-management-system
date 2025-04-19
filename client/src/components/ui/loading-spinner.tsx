/**
 * LoadingSpinner Component - 2025 Edition
 *
 * A reusable loading spinner component with customizable size and color.
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'accent' | 'foreground';
}

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className,
  ...props
}: LoadingSpinnerProps) {
  // Map sizes to actual dimensions
  const sizeMap = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
    xl: 'h-12 w-12 border-4',
  };
  
  // Map colors to Tailwind classes
  const colorMap = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    accent: 'border-accent',
    foreground: 'border-foreground',
  };
  
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-solid border-t-transparent',
        sizeMap[size],
        colorMap[color],
        className
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}