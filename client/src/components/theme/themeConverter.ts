/**
 * Theme Converter Utility
 * 
 * Provides functions to convert between new theme format and legacy theme format.
 * This allows for a gradual migration path while maintaining compatibility.
 */

import { Theme as NewTheme } from '../../../../shared/designTokens';
import { Theme as OldTheme, defaultTheme } from '@shared/config';

/**
 * Utility function to extract hex color from CSS variable reference
 */
function extractColor(variable: string | undefined): string | undefined {
  if (!variable) return undefined;
  
  // If it's a hex value, return it directly
  if (variable.startsWith('#')) {
    // Remove # prefix for legacy theme format
    return variable.slice(1);
  }

  // If it's a CSS variable reference like 'var(--color-primary)', 
  // extract and return the variable name
  const match = /var\(--([^)]+)\)/.exec(variable);
  if (match) {
    // We would need to get the actual value from CSS
    // For now, return a placeholder
    return '4f46e5'; // Default indigo-600
  }
  
  return undefined;
}

/**
 * Converts the new theme format to the legacy theme format
 */
export function convertToLegacyTheme(newTheme: NewTheme): OldTheme {
  // Start with the default theme as a base
  const legacyTheme: OldTheme = { ...defaultTheme };
  
  try {
    // Extract primary color from new theme
    const primaryColor = extractColor(newTheme.tokens.colors?.primary?.DEFAULT);
    if (primaryColor) {
      legacyTheme.primaryColor = primaryColor;
    }
    
    // Extract accent color
    const accentColor = extractColor(newTheme.tokens.colors?.accent?.DEFAULT);
    if (accentColor) {
      legacyTheme.accentColor = accentColor;
    }
    
    // Extract background color
    const backgroundColor = extractColor(newTheme.tokens.colors?.background?.DEFAULT);
    if (backgroundColor) {
      legacyTheme.backgroundColor = backgroundColor;
    }
    
    // Map theme variant
    if (newTheme.metadata.variant === 'modern') {
      legacyTheme.style = 'modern';
    } else if (newTheme.metadata.variant === 'elegant') {
      legacyTheme.style = 'elegant';
    } else if (newTheme.metadata.variant === 'minimal') {
      legacyTheme.style = 'minimal';
    } else {
      legacyTheme.style = 'standard';
    }
    
    // Map font names
    if (newTheme.tokens.typography?.fontFamily) {
      const headingFont = newTheme.tokens.typography.fontFamily.heading;
      const bodyFont = newTheme.tokens.typography.fontFamily.body;
      
      if (headingFont) {
        legacyTheme.headingFont = headingFont.split(',')[0].trim();
      }
      
      if (bodyFont) {
        legacyTheme.bodyFont = bodyFont.split(',')[0].trim();
      }
    }
    
    // Map border radius
    if (newTheme.tokens.borders?.radius?.DEFAULT) {
      const radius = newTheme.tokens.borders.radius.DEFAULT;
      if (radius === '0px') {
        legacyTheme.borderRadius = 'none';
      } else if (radius === '0.125rem' || radius === '2px') {
        legacyTheme.borderRadius = 'sm';
      } else if (radius === '0.25rem' || radius === '4px') {
        legacyTheme.borderRadius = 'md';
      } else if (radius === '0.5rem' || radius === '8px') {
        legacyTheme.borderRadius = 'lg';
      } else if (radius === '9999px') {
        legacyTheme.borderRadius = 'full';
      }
    }
    
    // Map other properties as needed
    
    return legacyTheme;
  } catch (error) {
    console.error('Error converting new theme to legacy format:', error);
    return defaultTheme;
  }
}

/**
 * Converts the legacy theme format to the new theme format
 */
export function convertToNewTheme(oldTheme: OldTheme, baseNewTheme: NewTheme): NewTheme {
  // Create a copy of the base new theme
  const newTheme: NewTheme = JSON.parse(JSON.stringify(baseNewTheme));
  
  try {
    // Map primary color
    if (oldTheme.primaryColor) {
      if (!newTheme.tokens.colors) newTheme.tokens.colors = {};
      if (!newTheme.tokens.colors.primary) newTheme.tokens.colors.primary = { DEFAULT: '' };
      newTheme.tokens.colors.primary.DEFAULT = `#${oldTheme.primaryColor}`;
    }
    
    // Map accent color
    if (oldTheme.accentColor) {
      if (!newTheme.tokens.colors) newTheme.tokens.colors = {};
      if (!newTheme.tokens.colors.accent) newTheme.tokens.colors.accent = { DEFAULT: '' };
      newTheme.tokens.colors.accent.DEFAULT = `#${oldTheme.accentColor}`;
    }
    
    // Map background color
    if (oldTheme.backgroundColor) {
      if (!newTheme.tokens.colors) newTheme.tokens.colors = {};
      if (!newTheme.tokens.colors.background) newTheme.tokens.colors.background = { DEFAULT: '' };
      newTheme.tokens.colors.background.DEFAULT = `#${oldTheme.backgroundColor}`;
    }
    
    // Map theme variant
    if (oldTheme.style === 'modern') {
      newTheme.metadata.variant = 'modern';
    } else if (oldTheme.style === 'elegant') {
      newTheme.metadata.variant = 'elegant';
    } else if (oldTheme.style === 'minimal') {
      newTheme.metadata.variant = 'minimal';
    } else {
      newTheme.metadata.variant = 'standard';
    }
    
    // Map font names
    if (oldTheme.headingFont) {
      if (!newTheme.tokens.typography) newTheme.tokens.typography = {};
      if (!newTheme.tokens.typography.fontFamily) newTheme.tokens.typography.fontFamily = { heading: '', body: '', mono: '', special: '' };
      newTheme.tokens.typography.fontFamily.heading = oldTheme.headingFont;
    }
    
    if (oldTheme.bodyFont) {
      if (!newTheme.tokens.typography) newTheme.tokens.typography = {};
      if (!newTheme.tokens.typography.fontFamily) newTheme.tokens.typography.fontFamily = { heading: '', body: '', mono: '', special: '' };
      newTheme.tokens.typography.fontFamily.body = oldTheme.bodyFont;
    }
    
    // Map border radius
    if (oldTheme.borderRadius) {
      if (!newTheme.tokens.borders) newTheme.tokens.borders = {};
      if (!newTheme.tokens.borders.radius) newTheme.tokens.borders.radius = { DEFAULT: '' };
      
      switch (oldTheme.borderRadius) {
        case 'none':
          newTheme.tokens.borders.radius.DEFAULT = '0px';
          break;
        case 'sm':
          newTheme.tokens.borders.radius.DEFAULT = '0.125rem';
          break;
        case 'md':
          newTheme.tokens.borders.radius.DEFAULT = '0.25rem';
          break;
        case 'lg':
          newTheme.tokens.borders.radius.DEFAULT = '0.5rem';
          break;
        case 'full':
          newTheme.tokens.borders.radius.DEFAULT = '9999px';
          break;
        default:
          newTheme.tokens.borders.radius.DEFAULT = '0.25rem'; // Default to medium
      }
    }
    
    // Map other properties as needed
    
    return newTheme;
  } catch (error) {
    console.error('Error converting legacy theme to new format:', error);
    return baseNewTheme;
  }
}