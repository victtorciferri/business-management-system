/**
 * ThemeAwareButton Component - 2025 Edition
 * 
 * A button component that uses design tokens from the current theme.
 * This demonstrates how components can consume theme tokens via CSS variables
 * rather than hardcoded values.
 */

import React, { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useBusinessTheme } from "@/providers/MultiTenantThemeProvider";

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ThemeAwareButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const ThemeAwareButton = React.forwardRef<HTMLButtonElement, ThemeAwareButtonProps>(
  ({ className, variant = "primary", size = "default", asChild = false, children, disabled, loading, icon, ...props }, ref) => {
    const { theme } = useBusinessTheme();
    
    // Base styles that apply to all variants
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    // Variant-specific styles that use CSS variables for colors
    const variantStyles = {
      primary: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)]",
      secondary: "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] hover:bg-[var(--color-secondary-hover)]",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      link: "text-primary underline-offset-4 hover:underline"
    };
    
    // Size-specific styles
    const sizeStyles = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10"
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          loading && "opacity-70",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        
        {icon && !loading && (
          <span className="mr-2">{icon}</span>
        )}
        
        {children}
      </button>
    );
  }
);

ThemeAwareButton.displayName = "ThemeAwareButton";