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
  
  // Dynamic styles based on theme and variant - not used directly in this component
  // But kept as a reference for how to create dynamic style templates
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return `
          background-color: ${cssVar('colors.primary.base')};
          color: ${cssVar('colors.primary.foreground')};
          &:hover {
            background-color: ${cssVar('colors.primary.hover')};
          }
        `;
      case 'secondary':
        return `
          background-color: ${cssVar('colors.secondary.base')};
          color: ${cssVar('colors.secondary.foreground')};
          &:hover {
            background-color: ${cssVar('colors.secondary.hover')};
          }
        `;
      case 'outline':
        return `
          background-color: transparent;
          color: ${cssVar('colors.primary.base')};
          border: 1px solid ${cssVar('colors.primary.base')};
          &:hover {
            background-color: ${cssVar('colors.primary.subtle')};
          }
        `;
      case 'ghost':
        return `
          background-color: transparent;
          color: ${cssVar('colors.primary.base')};
          &:hover {
            background-color: ${cssVar('colors.primary.subtle')};
          }
        `;
      default:
        return '';
    }
  };
  
  // Create inline styles using the new theme token structure
  const inlineStyles = {
    backgroundColor: variant === 'primary' 
      ? `var(--colors-primary-base, #2563eb)` 
      : variant === 'secondary'
        ? `var(--colors-secondary-base, #4f46e5)`
        : 'transparent',
    color: variant === 'primary'
      ? `var(--colors-primary-foreground, #ffffff)`
      : variant === 'secondary'
        ? `var(--colors-secondary-foreground, #ffffff)`
        : `var(--colors-primary-base, #2563eb)`,
    border: variant === 'outline'
      ? `1px solid var(--colors-primary-base, #2563eb)`
      : 'none',
  };
  
  // Generate dynamic hover styles using JavaScript and CSS custom properties
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    if (variant === 'primary') {
      target.style.backgroundColor = `var(--colors-primary-hover, #1d4ed8)`;
    } else if (variant === 'secondary') {
      target.style.backgroundColor = `var(--colors-secondary-hover, #4338ca)`;
    } else if (variant === 'outline') {
      target.style.backgroundColor = `var(--colors-primary-subtle, #dbeafe)`;
    } else if (variant === 'ghost') {
      target.style.backgroundColor = `var(--colors-primary-subtle, #dbeafe)`;
    }
  };
  
  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    if (variant === 'primary') {
      target.style.backgroundColor = `var(--colors-primary-base, #2563eb)`;
    } else if (variant === 'secondary') {
      target.style.backgroundColor = `var(--colors-secondary-base, #4f46e5)`;
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