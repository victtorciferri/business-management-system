import React from 'react';
import { Input, InputProps } from '@/components/ui/input';
import { useThemeVars } from '@/hooks/use-theme-variables';
import { cn } from '@/lib/utils';
import { InputVariant, InputSize } from '@/lib/componentVariants';

export interface VariantAwareInputProps extends Omit<InputProps, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
}

/**
 * An input component that adapts to the current theme variant and settings
 */
export function VariantAwareInput({
  variant = 'default',
  size = 'md',
  className,
  ...props
}: VariantAwareInputProps) {
  const themeVars = useThemeVars();
  
  // Variant-specific styles
  const variantStyles = {
    default: 'border border-input bg-background',
    filled: 'border border-input bg-secondary/10',
    outlined: 'border-2 border-input bg-transparent',
    simple: 'border-b border-input bg-transparent px-1 rounded-none',
    underlined: 'border-b-2 border-input bg-transparent px-1 rounded-none'
  };
  
  // Size-specific styles
  const sizeStyles = {
    sm: 'h-8 text-xs px-2',
    md: 'h-10 text-sm px-3',
    lg: 'h-12 text-base px-4'
  };
  
  // Theme variant-specific styles
  const themeVariantStyles = {
    professional: {
      default: 'rounded-md',
      filled: 'rounded-md',
      outlined: 'rounded-md',
      simple: '',
      underlined: ''
    },
    vibrant: {
      default: 'rounded-lg border-2',
      filled: 'rounded-lg shadow-inner',
      outlined: 'rounded-lg border-2 border-primary/30',
      simple: 'border-b border-primary/30',
      underlined: 'border-b-2 border-primary/50'
    },
    elegant: {
      default: 'rounded-sm font-serif',
      filled: 'rounded-sm font-serif',
      outlined: 'rounded-sm font-serif',
      simple: 'font-serif',
      underlined: 'font-serif'
    },
    minimal: {
      default: 'rounded-none',
      filled: 'rounded-none',
      outlined: 'rounded-none',
      simple: '',
      underlined: ''
    }
  };
  
  // Focus state styles
  const focusStyles = {
    professional: 'focus:ring-2 focus:ring-primary focus:border-primary',
    vibrant: 'focus:ring-2 focus:ring-primary/50 focus:border-primary',
    elegant: 'focus:border-primary focus:ring-0',
    minimal: 'focus:border-primary focus:ring-0'
  };
  
  const currentThemeVariant = themeVars?.variant || 'professional';
  
  return (
    <Input
      className={cn(
        // Variant-specific styles
        variantStyles[variant],
        
        // Size-specific styles
        sizeStyles[size],
        
        // Theme variant-specific styles
        themeVariantStyles[currentThemeVariant as keyof typeof themeVariantStyles]?.[variant],
        
        // Focus state based on theme variant
        focusStyles[currentThemeVariant as keyof typeof focusStyles],
        
        // Accessibility adjustments
        themeVars?.highContrast && 'border-[1.5px]',
        themeVars?.reducedMotion && 'transition-none',
        
        // Custom classnames
        className
      )}
      {...props}
    />
  );
}