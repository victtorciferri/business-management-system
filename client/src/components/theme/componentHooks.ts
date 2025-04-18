/**
 * Component Theme Hooks
 * 
 * Collection of specialized theme hooks for different components.
 * These hooks extract specific token values needed by each component.
 */

import { createThemeHook, createCssVariableHook } from '../../hooks/createThemeHook';
import { DesignTokens } from '../../../shared/designTokens';

/**
 * Hook for button component styling
 */
export const useButtonTheme = createThemeHook(
  (tokens: DesignTokens) => ({
    // Base button styles
    background: tokens.colors?.primary?.DEFAULT || '#4f46e5',
    foreground: tokens.colors?.primary?.foreground || '#ffffff',
    hoverBackground: tokens.colors?.primary?.hover || '#4338ca',
    
    // Size variations
    borderRadius: tokens.borders?.radius?.DEFAULT || '0.25rem',
    paddingX: tokens.spacing?.md || '1rem',
    paddingY: tokens.spacing?.sm || '0.5rem',
    
    // State variations
    focusRingColor: tokens.colors?.focus || 'rgba(79, 70, 229, 0.4)',
    focusRingWidth: tokens.borders?.focus?.width || '2px',
    disabledOpacity: tokens.opacity?.disabled || '0.5',
    
    // Variants
    secondary: {
      background: tokens.colors?.secondary?.DEFAULT || '#f3f4f6',
      foreground: tokens.colors?.secondary?.foreground || '#1f2937',
      hoverBackground: tokens.colors?.secondary?.hover || '#e5e7eb',
    },
    outline: {
      borderColor: tokens.colors?.border || '#e5e7eb',
      borderWidth: tokens.borders?.width?.DEFAULT || '1px',
    },
    ghost: {
      hoverBackground: tokens.colors?.primary?.light || 'rgba(79, 70, 229, 0.1)',
    },
  }),
  {
    defaults: {
      // Fallback values if tokens are missing
      background: '#4f46e5', // Indigo-600
      foreground: '#ffffff',
      hoverBackground: '#4338ca', // Indigo-700
      borderRadius: '0.25rem',
      paddingX: '1rem',
      paddingY: '0.5rem',
      focusRingColor: 'rgba(79, 70, 229, 0.4)',
      focusRingWidth: '2px',
      disabledOpacity: '0.5',
      secondary: {
        background: '#f3f4f6', // Gray-100
        foreground: '#1f2937', // Gray-800
        hoverBackground: '#e5e7eb', // Gray-200
      },
      outline: {
        borderColor: '#e5e7eb', // Gray-200
        borderWidth: '1px',
      },
      ghost: {
        hoverBackground: 'rgba(79, 70, 229, 0.1)',
      },
    },
  }
);

/**
 * Hook for card component styling
 */
export const useCardTheme = createThemeHook(
  (tokens: DesignTokens) => ({
    background: tokens.colors?.card || tokens.colors?.background?.surface || '#ffffff',
    foreground: tokens.colors?.card?.foreground || tokens.colors?.foreground?.DEFAULT || '#1f2937',
    borderColor: tokens.colors?.border || '#e5e7eb',
    borderWidth: tokens.borders?.width?.DEFAULT || '1px',
    borderRadius: tokens.borders?.radius?.DEFAULT || '0.25rem',
    padding: tokens.spacing?.lg || '1.5rem',
    shadow: tokens.shadows?.sm || '0 1px 3px rgba(0, 0, 0, 0.1)',
    hoverShadow: tokens.shadows?.md || '0 4px 6px rgba(0, 0, 0, 0.1)',
  }),
  {
    defaults: {
      background: '#ffffff',
      foreground: '#1f2937',
      borderColor: '#e5e7eb',
      borderWidth: '1px',
      borderRadius: '0.25rem',
      padding: '1.5rem',
      shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      hoverShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
  }
);

/**
 * Hook for form element styling
 */
export const useFormTheme = createThemeHook(
  (tokens: DesignTokens) => ({
    // Input field styles
    input: {
      background: tokens.colors?.background?.DEFAULT || '#ffffff',
      foreground: tokens.colors?.foreground?.DEFAULT || '#1f2937',
      borderColor: tokens.colors?.border || '#d1d5db',
      borderRadius: tokens.borders?.radius?.DEFAULT || '0.25rem',
      borderWidth: tokens.borders?.width?.DEFAULT || '1px',
      padding: tokens.spacing?.md || '0.5rem 0.75rem',
      focusBorderColor: tokens.colors?.primary?.DEFAULT || '#4f46e5',
      focusRingColor: tokens.colors?.focus || 'rgba(79, 70, 229, 0.2)',
      placeholderColor: tokens.colors?.foreground?.muted || '#9ca3af',
      shadow: tokens.shadows?.sm || 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
    },
    
    // Label styles
    label: {
      foreground: tokens.colors?.foreground?.DEFAULT || '#1f2937',
      fontWeight: tokens.typography?.fontWeight?.medium || '500',
      fontSize: tokens.typography?.fontSize?.sm || '0.875rem',
      marginBottom: tokens.spacing?.xs || '0.25rem',
    },
    
    // Error styles
    error: {
      foreground: tokens.colors?.destructive?.DEFAULT || '#ef4444',
      borderColor: tokens.colors?.destructive?.DEFAULT || '#ef4444',
      background: tokens.colors?.destructive?.light || 'rgba(239, 68, 68, 0.1)',
    },
  }),
  {
    defaults: {
      input: {
        background: '#ffffff',
        foreground: '#1f2937',
        borderColor: '#d1d5db',
        borderRadius: '0.25rem',
        borderWidth: '1px',
        padding: '0.5rem 0.75rem',
        focusBorderColor: '#4f46e5',
        focusRingColor: 'rgba(79, 70, 229, 0.2)',
        placeholderColor: '#9ca3af',
        shadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
      },
      label: {
        foreground: '#1f2937',
        fontWeight: '500',
        fontSize: '0.875rem',
        marginBottom: '0.25rem',
      },
      error: {
        foreground: '#ef4444',
        borderColor: '#ef4444',
        background: 'rgba(239, 68, 68, 0.1)',
      },
    },
  }
);

/**
 * Hook for avatar component styling using CSS variables
 */
export const useAvatarStyles = createCssVariableHook({
  backgroundColor: 'colors.primary.light',
  color: 'colors.primary.foreground',
  borderRadius: 'borders.radius.full',
  fontFamily: 'typography.fontFamily.body',
  fontWeight: 'typography.fontWeight.medium',
  boxShadow: 'shadows.sm',
});

/**
 * Hook for tooltip component styling using CSS variables
 */
export const useTooltipStyles = createCssVariableHook({
  backgroundColor: 'colors.foreground.DEFAULT',
  color: 'colors.background.DEFAULT',
  borderRadius: 'borders.radius.sm',
  fontSize: 'typography.fontSize.xs',
  padding: 'spacing.sm',
  maxWidth: 'sizes.xs',
  zIndex: 'layers.tooltip',
});

/**
 * Hook for alert component styling using CSS variables
 */
export const useAlertStyles = createCssVariableHook({
  backgroundColor: 'colors.background.surface',
  color: 'colors.foreground.DEFAULT',
  borderRadius: 'borders.radius.DEFAULT',
  borderWidth: 'borders.width.DEFAULT',
  borderColor: 'colors.border',
  padding: 'spacing.md',
  marginBottom: 'spacing.md',
});

/**
 * Hook for toast component styling
 */
export const useToastTheme = createThemeHook(
  (tokens: DesignTokens) => ({
    background: tokens.colors?.background?.elevated || tokens.colors?.background?.surface || '#ffffff',
    foreground: tokens.colors?.foreground?.DEFAULT || '#1f2937',
    borderColor: tokens.colors?.border || '#e5e7eb',
    borderRadius: tokens.borders?.radius?.DEFAULT || '0.25rem',
    shadow: tokens.shadows?.md || '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    
    // Variants
    success: {
      background: tokens.colors?.success?.light || '#ecfdf5',
      foreground: tokens.colors?.success?.foreground || '#047857',
      borderColor: tokens.colors?.success?.DEFAULT || '#10b981',
      icon: tokens.colors?.success?.DEFAULT || '#10b981',
    },
    error: {
      background: tokens.colors?.destructive?.light || '#fef2f2',
      foreground: tokens.colors?.destructive?.foreground || '#b91c1c',
      borderColor: tokens.colors?.destructive?.DEFAULT || '#ef4444',
      icon: tokens.colors?.destructive?.DEFAULT || '#ef4444',
    },
    warning: {
      background: tokens.colors?.warning?.light || '#fffbeb',
      foreground: tokens.colors?.warning?.foreground || '#b45309',
      borderColor: tokens.colors?.warning?.DEFAULT || '#f59e0b',
      icon: tokens.colors?.warning?.DEFAULT || '#f59e0b',
    },
    info: {
      background: tokens.colors?.info?.light || '#eff6ff',
      foreground: tokens.colors?.info?.foreground || '#1d4ed8',
      borderColor: tokens.colors?.info?.DEFAULT || '#3b82f6',
      icon: tokens.colors?.info?.DEFAULT || '#3b82f6',
    },
  })
);