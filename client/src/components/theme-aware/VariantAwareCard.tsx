import React from 'react';
import { Card, CardProps } from '@/components/ui/card';
import { useThemeVars } from '@/hooks/use-theme-variables';
import { cn } from '@/lib/utils';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';

export interface VariantAwareCardProps extends Omit<CardProps, 'variant'> {
  variant?: CardVariant;
}

/**
 * A card component that adapts to the current theme variant and settings
 */
export function VariantAwareCard({
  children,
  variant = 'default',
  className,
  ...props
}: VariantAwareCardProps) {
  const themeVars = useThemeVars();
  
  // Apply variant-specific styles
  const variantStyles = {
    default: '',
    elevated: 'shadow-lg',
    outlined: 'border-2 shadow-none bg-transparent',
    filled: 'bg-secondary/10 border-none'
  };
  
  // Apply theme variant-specific styles
  const themeVariantStyles = {
    professional: {
      default: 'shadow-sm',
      elevated: 'shadow-md',
      outlined: 'border-2 shadow-none',
      filled: 'bg-secondary/10 border-none'
    },
    vibrant: {
      default: 'shadow-md border-b-2 border-primary/30',
      elevated: 'shadow-xl border-b-4 border-primary/30',
      outlined: 'border-2 shadow-none border-primary/50',
      filled: 'bg-secondary/20 border-none shadow-inner'
    },
    elegant: {
      default: 'shadow-md',
      elevated: 'shadow-xl',
      outlined: 'border-[1px] shadow-none',
      filled: 'bg-secondary/5 border-none'
    },
    minimal: {
      default: 'shadow-none border-0',
      elevated: 'shadow-sm',
      outlined: 'border-[1px] shadow-none',
      filled: 'bg-secondary/5 border-none'
    }
  };
  
  const currentThemeVariant = themeVars?.variant || 'professional';
  
  return (
    <Card
      className={cn(
        // Apply general variant styles
        variantStyles[variant],
        
        // Apply theme-specific variant styles
        themeVariantStyles[currentThemeVariant as keyof typeof themeVariantStyles]?.[variant],
        
        // Apply accessibility styles if needed
        themeVars?.highContrast && 'border-[1.5px]',
        
        // Apply custom class names
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}