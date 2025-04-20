/**
 * Component Variants System - 2025 Edition
 * 
 * This module defines variants for theme-aware components
 * based on the design system tokens
 */

import { ThemeEntity } from '@shared/schema';
import { hexToRgb } from '@shared/tokenUtils';

/**
 * Button Variants
 */
export type ButtonVariant = 
  | 'default' 
  | 'primary' 
  | 'secondary'
  | 'accent'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'success'
  | 'warning'
  | 'info'
  | 'contrast'
  | 'link';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';

/**
 * Card Variants
 */
export type CardVariant = 
  | 'default'
  | 'elevated'
  | 'outlined'
  | 'filled'
  | 'accent'
  | 'primary'
  | 'secondary'
  | 'interactive'
  | 'glass';

export type CardSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Input Variants
 */
export type InputVariant = 
  | 'default'
  | 'outlined'
  | 'filled'
  | 'underlined'
  | 'unstyled'
  | 'primary'
  | 'secondary';

export type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Badge Variants
 */
export type BadgeVariant = 
  | 'default'
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'destructive'
  | 'success'
  | 'warning'
  | 'info';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Navigation Variants
 */
export type NavigationVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'minimal'
  | 'full'
  | 'transparent';

/**
 * Get button styles for a specific variant
 * 
 * @param variant Button variant
 * @param theme Current theme
 * @returns Style object with button styles
 */
export function getButtonStyles(
  variant: ButtonVariant = 'default',
  theme: Partial<ThemeEntity>
): React.CSSProperties {
  // Default button styles
  const styles: React.CSSProperties = {
    fontFamily: theme.fontFamily || 'Inter, system-ui, sans-serif',
    borderRadius: `${theme.borderRadius || 8}px`,
    transition: 'all 200ms ease',
  };

  // Apply variant-specific styles
  switch (variant) {
    case 'primary':
      styles.backgroundColor = theme.primaryColor || '#4f46e5';
      styles.color = '#ffffff';
      styles.border = 'none';
      break;
    case 'secondary':
      styles.backgroundColor = theme.secondaryColor || '#06b6d4';
      styles.color = '#ffffff';
      styles.border = 'none';
      break;
    case 'accent':
      styles.backgroundColor = theme.accentColor || '#8b5cf6';
      styles.color = '#ffffff';
      styles.border = 'none';
      break;
    case 'outline':
      styles.backgroundColor = 'transparent';
      styles.color = theme.primaryColor || '#4f46e5';
      styles.border = `1px solid ${theme.primaryColor || '#4f46e5'}`;
      break;
    case 'ghost':
      styles.backgroundColor = 'transparent';
      styles.color = theme.textColor || '#111827';
      styles.border = 'none';
      break;
    case 'destructive':
      styles.backgroundColor = theme.tokens?.colors?.destructive || '#ef4444';
      styles.color = '#ffffff';
      styles.border = 'none';
      break;
    case 'success':
      styles.backgroundColor = theme.tokens?.colors?.success || '#22c55e';
      styles.color = '#ffffff';
      styles.border = 'none';
      break;
    case 'warning':
      styles.backgroundColor = theme.tokens?.colors?.warning || '#f59e0b';
      styles.color = '#ffffff';
      styles.border = 'none';
      break;
    case 'info':
      styles.backgroundColor = theme.tokens?.colors?.info || '#3b82f6';
      styles.color = '#ffffff';
      styles.border = 'none';
      break;
    case 'contrast':
      // High contrast button for accessibility
      styles.backgroundColor = '#000000';
      styles.color = '#ffffff';
      styles.border = '2px solid #ffffff';
      break;
    case 'link':
      styles.backgroundColor = 'transparent';
      styles.color = theme.primaryColor || '#4f46e5';
      styles.border = 'none';
      styles.textDecoration = 'underline';
      break;
    case 'default':
    default:
      styles.backgroundColor = theme.backgroundColor ? lightenColor(theme.backgroundColor, 0.1) : '#f9fafb';
      styles.color = theme.textColor || '#111827';
      styles.border = `1px solid ${theme.backgroundColor ? darkenColor(theme.backgroundColor, 0.1) : '#e5e7eb'}`;
      break;
  }

  return styles;
}

/**
 * Get card styles for a specific variant
 * 
 * @param variant Card variant
 * @param theme Current theme
 * @returns Style object with card styles
 */
export function getCardStyles(
  variant: CardVariant = 'default',
  theme: Partial<ThemeEntity>
): React.CSSProperties {
  // Default card styles
  const styles: React.CSSProperties = {
    borderRadius: `${theme.borderRadius || 8}px`,
    overflow: 'hidden',
    transition: 'all 200ms ease',
  };

  // Apply variant-specific styles
  switch (variant) {
    case 'elevated':
      styles.backgroundColor = theme.backgroundColor || '#ffffff';
      styles.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      styles.border = 'none';
      break;
    case 'outlined':
      styles.backgroundColor = 'transparent';
      styles.border = `1px solid ${theme.backgroundColor ? darkenColor(theme.backgroundColor, 0.1) : '#e5e7eb'}`;
      break;
    case 'filled':
      styles.backgroundColor = theme.backgroundColor ? darkenColor(theme.backgroundColor, 0.05) : '#f3f4f6';
      styles.border = 'none';
      break;
    case 'accent':
      styles.backgroundColor = theme.accentColor ? withOpacity(theme.accentColor, 0.1) : '#f5f3ff';
      styles.border = `1px solid ${theme.accentColor || '#8b5cf6'}`;
      break;
    case 'primary':
      styles.backgroundColor = theme.primaryColor ? withOpacity(theme.primaryColor, 0.1) : '#eff6ff';
      styles.border = `1px solid ${theme.primaryColor || '#4f46e5'}`;
      break;
    case 'secondary':
      styles.backgroundColor = theme.secondaryColor ? withOpacity(theme.secondaryColor, 0.1) : '#ecfeff';
      styles.border = `1px solid ${theme.secondaryColor || '#06b6d4'}`;
      break;
    case 'interactive':
      styles.backgroundColor = theme.backgroundColor || '#ffffff';
      styles.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      styles.cursor = 'pointer';
      styles.border = 'none';
      // Add hover state in the component
      break;
    case 'glass':
      styles.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      styles.backdropFilter = 'blur(8px)';
      styles.border = '1px solid rgba(255, 255, 255, 0.4)';
      break;
    case 'default':
    default:
      styles.backgroundColor = theme.backgroundColor || '#ffffff';
      styles.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      styles.border = 'none';
      break;
  }

  return styles;
}

/**
 * Get input styles for a specific variant
 * 
 * @param variant Input variant
 * @param theme Current theme
 * @returns Style object with input styles
 */
export function getInputStyles(
  variant: InputVariant = 'default',
  theme: Partial<ThemeEntity>
): React.CSSProperties {
  // Default input styles
  const styles: React.CSSProperties = {
    fontFamily: theme.fontFamily || 'Inter, system-ui, sans-serif',
    borderRadius: `${theme.borderRadius || 8}px`,
    transition: 'all 200ms ease',
    backgroundColor: theme.backgroundColor || '#ffffff',
    color: theme.textColor || '#111827',
  };

  // Apply variant-specific styles
  switch (variant) {
    case 'outlined':
      styles.backgroundColor = 'transparent';
      styles.border = `1px solid ${theme.backgroundColor ? darkenColor(theme.backgroundColor, 0.2) : '#d1d5db'}`;
      break;
    case 'filled':
      styles.backgroundColor = theme.backgroundColor ? darkenColor(theme.backgroundColor, 0.05) : '#f3f4f6';
      styles.border = `1px solid transparent`;
      break;
    case 'underlined':
      styles.backgroundColor = 'transparent';
      styles.borderRadius = '0';
      styles.borderTop = 'none';
      styles.borderLeft = 'none';
      styles.borderRight = 'none';
      styles.borderBottom = `1px solid ${theme.backgroundColor ? darkenColor(theme.backgroundColor, 0.2) : '#d1d5db'}`;
      break;
    case 'unstyled':
      styles.backgroundColor = 'transparent';
      styles.border = 'none';
      break;
    case 'primary':
      styles.backgroundColor = 'transparent';
      styles.border = `1px solid ${theme.primaryColor || '#4f46e5'}`;
      break;
    case 'secondary':
      styles.backgroundColor = 'transparent';
      styles.border = `1px solid ${theme.secondaryColor || '#06b6d4'}`;
      break;
    case 'default':
    default:
      styles.backgroundColor = theme.backgroundColor || '#ffffff';
      styles.border = `1px solid ${theme.backgroundColor ? darkenColor(theme.backgroundColor, 0.1) : '#e5e7eb'}`;
      break;
  }

  return styles;
}

/**
 * Get badge styles for a specific variant
 * 
 * @param variant Badge variant
 * @param theme Current theme
 * @returns Style object with badge styles
 */
export function getBadgeStyles(
  variant: BadgeVariant = 'default',
  theme: Partial<ThemeEntity>
): React.CSSProperties {
  // Default badge styles
  const styles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: theme.fontFamily || 'Inter, system-ui, sans-serif',
    fontWeight: 500,
    fontSize: '0.75rem',
    lineHeight: 1,
    borderRadius: '9999px',
    whiteSpace: 'nowrap',
    transition: 'all 200ms ease',
    padding: '0.25rem 0.75rem',
  };

  // Apply variant-specific styles
  switch (variant) {
    case 'primary':
      styles.backgroundColor = theme.primaryColor || '#4f46e5';
      styles.color = '#ffffff';
      break;
    case 'secondary':
      styles.backgroundColor = theme.secondaryColor || '#06b6d4';
      styles.color = '#ffffff';
      break;
    case 'outline':
      styles.backgroundColor = 'transparent';
      styles.color = theme.textColor || '#111827';
      styles.border = `1px solid ${theme.backgroundColor ? darkenColor(theme.backgroundColor, 0.2) : '#d1d5db'}`;
      break;
    case 'destructive':
      styles.backgroundColor = theme.tokens?.colors?.destructive || '#ef4444';
      styles.color = '#ffffff';
      break;
    case 'success':
      styles.backgroundColor = theme.tokens?.colors?.success || '#22c55e';
      styles.color = '#ffffff';
      break;
    case 'warning':
      styles.backgroundColor = theme.tokens?.colors?.warning || '#f59e0b';
      styles.color = '#ffffff';
      break;
    case 'info':
      styles.backgroundColor = theme.tokens?.colors?.info || '#3b82f6';
      styles.color = '#ffffff';
      break;
    case 'default':
    default:
      styles.backgroundColor = theme.backgroundColor ? darkenColor(theme.backgroundColor, 0.05) : '#f3f4f6';
      styles.color = theme.textColor || '#111827';
      break;
  }

  return styles;
}

// Helper functions for color manipulation

/**
 * Lighten a color by a percentage
 */
function lightenColor(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount));
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount));
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Darken a color by a percentage
 */
function darkenColor(color: string, amount: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  const r = Math.max(0, Math.round(rgb.r * (1 - amount)));
  const g = Math.max(0, Math.round(rgb.g * (1 - amount)));
  const b = Math.max(0, Math.round(rgb.b * (1 - amount)));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Get a color with opacity
 */
function withOpacity(color: string, opacity: number): string {
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  return rgbaToString(rgb.r, rgb.g, rgb.b, opacity);
}

/**
 * Convert rgba values to string
 */
function rgbaToString(r: number, g: number, b: number, a: number): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}