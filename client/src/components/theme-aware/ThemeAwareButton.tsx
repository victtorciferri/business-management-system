/**
 * Theme-Aware Button Component - 2025 Edition
 * 
 * An example component that uses the theme system to style itself.
 * This demonstrates how components can adapt to the active theme.
 */

import React from "react";
import { useBusinessTheme } from "@/providers/MultiTenantThemeProvider";
import { useGlobalTheme } from "@/providers/GlobalThemeProvider";
import { cn } from "@/lib/utils";

interface ThemeAwareButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeAwareButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ThemeAwareButtonProps) {
  const businessTheme = useBusinessTheme();
  const globalTheme = useGlobalTheme();
  
  // This component works with either business theme or global theme
  const themeClass = businessTheme.themeClass || "theme-global";
  const isDarkMode = globalTheme.effectiveMode === 'dark';
  
  // Base styles that apply to all variants
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  
  // Size variants
  const sizeStyles = {
    sm: "h-9 px-3 text-xs",
    md: "h-10 px-4 py-2",
    lg: "h-11 px-8 py-3 text-lg"
  };
  
  // Variant styles using CSS variables for theming
  const variantStyles = {
    primary: "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-hover)] focus-visible:ring-[var(--color-primary)]",
    secondary: "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] hover:bg-[var(--color-secondary-hover)] focus-visible:ring-[var(--color-secondary)]",
    outline: "border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-background-surface)] text-[var(--color-foreground)]",
    ghost: "bg-transparent hover:bg-[var(--color-background-surface)] text-[var(--color-foreground)]",
    destructive: "bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] hover:bg-[var(--color-destructive-dark)] focus-visible:ring-[var(--color-destructive)]"
  };
  
  return (
    <button
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        `${themeClass}`, // Apply the theme class to ensure CSS variables are scoped correctly
        className
      )}
      data-theme-class={themeClass}
      data-dark-mode={isDarkMode}
      {...props}
    >
      {children}
    </button>
  );
}