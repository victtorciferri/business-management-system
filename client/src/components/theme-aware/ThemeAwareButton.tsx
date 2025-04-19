import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useThemeVars } from '@/hooks/use-theme-variables';
import { cn } from '@/lib/utils';

export interface ThemeAwareButtonProps extends ButtonProps {
  themeVariant?: 'primary' | 'secondary' | 'accent' | 'neutral';
}

export function ThemeAwareButton({
  children,
  themeVariant = 'primary',
  className,
  variant,
  ...props
}: ThemeAwareButtonProps) {
  const themeVars = useThemeVars();
  
  // Map theme variants to button variants
  const variantMap = {
    primary: variant || 'default',
    secondary: variant || 'secondary',
    accent: variant || 'outline',
    neutral: variant || 'ghost'
  };
  
  return (
    <Button
      className={cn(
        // Theme-specific styles can be added here
        themeVars?.highContrast && 'font-semibold',
        themeVars?.reducedMotion && 'transition-none',
        className
      )}
      variant={variantMap[themeVariant]}
      {...props}
    >
      {children}
    </Button>
  );
}