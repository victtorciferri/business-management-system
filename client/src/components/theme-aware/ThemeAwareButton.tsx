/**
 * ThemeAwareButton - 2025 Edition
 * 
 * This component demonstrates how to create theme-aware components
 * that can consume theme tokens from the context.
 */

import React from 'react';
import { useBusinessTheme } from '@/providers/MultiTenantThemeProvider';
import { cssVar } from '@/lib/themeUtils';

interface ThemeAwareButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export function ThemeAwareButton({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
}: ThemeAwareButtonProps) {
  // Get theme tokens from context
  const { theme } = useBusinessTheme();
  
  // Base styles
  const baseStyles = 'rounded-md font-medium transition-colors inline-flex items-center justify-center';
  
  // Size styles
  const sizeStyles = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg',
  };
  
  // Dynamic styles based on theme and variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return `
          background-color: ${cssVar('color-primary-base', '#0070f3')};
          color: ${cssVar('color-primary-foreground', '#ffffff')};
          &:hover {
            background-color: ${cssVar('color-primary-hover', '#0060df')};
          }
        `;
      case 'secondary':
        return `
          background-color: ${cssVar('color-secondary-base', '#f1f5f9')};
          color: ${cssVar('color-secondary-foreground', '#0f172a')};
          &:hover {
            background-color: ${cssVar('color-secondary-hover', '#e2e8f0')};
          }
        `;
      case 'outline':
        return `
          background-color: transparent;
          color: ${cssVar('color-primary-base', '#0070f3')};
          border: 1px solid ${cssVar('color-primary-base', '#0070f3')};
          &:hover {
            background-color: ${cssVar('color-primary-base', '#0070f3')}20;
          }
        `;
      case 'ghost':
        return `
          background-color: transparent;
          color: ${cssVar('color-primary-base', '#0070f3')};
          &:hover {
            background-color: ${cssVar('color-primary-base', '#0070f3')}10;
          }
        `;
      default:
        return '';
    }
  };
  
  // Create inline styles
  const inlineStyles = {
    backgroundColor: variant === 'primary' 
      ? `var(--color-primary-base, #0070f3)` 
      : variant === 'secondary'
        ? `var(--color-secondary-base, #f1f5f9)`
        : 'transparent',
    color: variant === 'primary'
      ? `var(--color-primary-foreground, #ffffff)`
      : variant === 'secondary'
        ? `var(--color-secondary-foreground, #0f172a)`
        : `var(--color-primary-base, #0070f3)`,
    border: variant === 'outline'
      ? `1px solid var(--color-primary-base, #0070f3)`
      : 'none',
  };
  
  // Generate dynamic hover styles using JavaScript and CSS custom properties
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    if (variant === 'primary') {
      target.style.backgroundColor = `var(--color-primary-hover, #0060df)`;
    } else if (variant === 'secondary') {
      target.style.backgroundColor = `var(--color-secondary-hover, #e2e8f0)`;
    } else if (variant === 'outline') {
      target.style.backgroundColor = `var(--color-primary-base, #0070f3)20`;
    } else if (variant === 'ghost') {
      target.style.backgroundColor = `var(--color-primary-base, #0070f3)10`;
    }
  };
  
  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    if (variant === 'primary') {
      target.style.backgroundColor = `var(--color-primary-base, #0070f3)`;
    } else if (variant === 'secondary') {
      target.style.backgroundColor = `var(--color-secondary-base, #f1f5f9)`;
    } else if (variant === 'outline' || variant === 'ghost') {
      target.style.backgroundColor = 'transparent';
    }
  };
  
  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${className}`}
      style={inlineStyles}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
}