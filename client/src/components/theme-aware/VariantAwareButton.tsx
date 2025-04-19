import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useThemeVars } from '@/hooks/use-theme-variables';
import { cn } from '@/lib/utils';

export type VariantButtonSize = 'sm' | 'md' | 'lg';
export type VariantButtonType = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success';

export interface VariantAwareButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  variant?: VariantButtonType;
  size?: VariantButtonSize;
}

/**
 * A button component that adapts to the current theme variant and settings
 */
export function VariantAwareButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: VariantAwareButtonProps) {
  const themeVars = useThemeVars();
  
  // Map our custom variants to shadcn button variants
  const buttonVariantMap: Record<VariantButtonType, ButtonProps['variant']> = {
    primary: 'default',
    secondary: 'secondary',
    tertiary: 'outline',
    danger: 'destructive',
    success: 'default'
  };
  
  // Map our size variants to specific styles
  const sizeStyles = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg'
  };
  
  // Apply theme variant-specific styles
  const themeVariantStyles = {
    professional: {
      primary: 'shadow-sm',
      secondary: 'shadow-sm',
      tertiary: '',
      danger: 'shadow-sm',
      success: 'shadow-sm bg-green-600 hover:bg-green-700'
    },
    vibrant: {
      primary: 'shadow-md border-b-2 border-primary-900',
      secondary: 'shadow-md border-b-2 border-secondary-900',
      tertiary: 'border-2',
      danger: 'shadow-md border-b-2 border-red-900',
      success: 'shadow-md border-b-2 border-green-900 bg-green-500 hover:bg-green-600'
    },
    elegant: {
      primary: 'font-serif shadow-sm',
      secondary: 'font-serif shadow-sm',
      tertiary: 'font-serif',
      danger: 'font-serif shadow-sm',
      success: 'font-serif shadow-sm bg-emerald-600 hover:bg-emerald-700'
    },
    minimal: {
      primary: 'shadow-none',
      secondary: 'shadow-none',
      tertiary: 'shadow-none',
      danger: 'shadow-none',
      success: 'shadow-none bg-green-600 hover:bg-green-700'
    }
  };
  
  // Apply accessibility settings
  const accessibilityStyles = {
    highContrast: 'font-semibold',
    reducedMotion: 'transition-none',
    largeText: 'text-base'
  };
  
  const currentVariant = themeVars?.variant || 'professional';
  
  return (
    <Button
      // Map our variant to shadcn button variant
      variant={buttonVariantMap[variant]}
      
      // Combine all styles based on theme settings
      className={cn(
        // Apply size-specific styles
        sizeStyles[size],
        
        // Apply theme variant-specific styles if available
        themeVariantStyles[currentVariant as keyof typeof themeVariantStyles]?.[variant],
        
        // Apply accessibility styles based on user preferences
        themeVars?.highContrast && accessibilityStyles.highContrast,
        themeVars?.reducedMotion && accessibilityStyles.reducedMotion,
        themeVars?.fontSize && themeVars.fontSize > 1.1 && accessibilityStyles.largeText,
        
        // Apply custom class names
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}