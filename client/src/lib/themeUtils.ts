/**
 * Theme Utilities - 2025 Edition
 * 
 * Utility functions for manipulating and applying themes.
 */

import { ThemeEntity } from "@shared/schema";
import { DesignTokens } from "@shared/designTokens";

/**
 * Generate CSS variables from design tokens
 * @param tokens Design tokens
 * @returns CSS variables string
 */
export function generateCssVariables(tokens: DesignTokens): string {
  if (!tokens) return '';
  
  let cssVars = '';
  
  // Colors
  if (tokens.colors) {
    Object.entries(tokens.colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        cssVars += `--color-${key}: ${value};\n`;
      } else if (typeof value === 'object') {
        Object.entries(value).forEach(([shade, color]) => {
          cssVars += `--color-${key}-${shade}: ${color};\n`;
        });
      }
    });
  }
  
  // Typography
  if (tokens.typography) {
    // Font families
    if (tokens.typography.fontFamilies) {
      Object.entries(tokens.typography.fontFamilies).forEach(([key, value]) => {
        cssVars += `--font-family-${key}: ${value};\n`;
      });
    }
    
    // Font sizes
    if (tokens.typography.fontSizes) {
      Object.entries(tokens.typography.fontSizes).forEach(([key, value]) => {
        cssVars += `--font-size-${key}: ${value};\n`;
      });
    }
    
    // Font weights
    if (tokens.typography.fontWeights) {
      Object.entries(tokens.typography.fontWeights).forEach(([key, value]) => {
        cssVars += `--font-weight-${key}: ${value};\n`;
      });
    }
    
    // Line heights
    if (tokens.typography.lineHeights) {
      Object.entries(tokens.typography.lineHeights).forEach(([key, value]) => {
        cssVars += `--line-height-${key}: ${value};\n`;
      });
    }
    
    // Letter spacing
    if (tokens.typography.letterSpacing) {
      Object.entries(tokens.typography.letterSpacing).forEach(([key, value]) => {
        cssVars += `--letter-spacing-${key}: ${value};\n`;
      });
    }
  }
  
  // Spacing
  if (tokens.spacing) {
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      cssVars += `--spacing-${key}: ${value};\n`;
    });
  }
  
  // Borders
  if (tokens.borders) {
    // Border widths
    if (tokens.borders.borderWidths) {
      Object.entries(tokens.borders.borderWidths).forEach(([key, value]) => {
        cssVars += `--border-width-${key}: ${value};\n`;
      });
    }
    
    // Border radii
    if (tokens.borders.borderRadii) {
      Object.entries(tokens.borders.borderRadii).forEach(([key, value]) => {
        cssVars += `--border-radius-${key}: ${value};\n`;
      });
    }
  }
  
  // Add shadcn/ui compatibility variables
  cssVars += generateShadcnCompatVars(tokens);
  
  return cssVars;
}

/**
 * Generate shadcn/ui compatibility variables
 * Maps our design tokens to the variables expected by shadcn/ui
 */
function generateShadcnCompatVars(tokens: DesignTokens): string {
  if (!tokens || !tokens.colors) return '';
  
  const { colors } = tokens;
  let cssVars = '';
  
  // shadcn/ui uses these specific variable names
  const mappings: Record<string, string> = {
    'background': typeof colors.background === 'string' ? colors.background : (colors.background?.base || '#ffffff'),
    'foreground': typeof colors.foreground === 'string' ? colors.foreground : (colors.foreground?.base || '#000000'),
    'primary': typeof colors.primary === 'string' ? colors.primary : (colors.primary?.base || '#0070f3'),
    'primary-foreground': typeof colors.primary === 'string' ? '#ffffff' : (colors.primary?.foreground || '#ffffff'),
    'secondary': typeof colors.secondary === 'string' ? colors.secondary : (colors.secondary?.base || '#f5f5f5'),
    'secondary-foreground': typeof colors.secondary === 'string' ? '#000000' : (colors.secondary?.foreground || '#000000'),
    'accent': typeof colors.accent === 'string' ? colors.accent : (colors.accent?.base || '#f5f5f5'),
    'accent-foreground': typeof colors.accent === 'string' ? '#000000' : (colors.accent?.foreground || '#000000'),
    'muted': typeof colors.muted === 'string' ? colors.muted : (colors.muted?.base || '#f5f5f5'),
    'muted-foreground': typeof colors.muted === 'string' ? '#6b7280' : (colors.muted?.foreground || '#6b7280'),
    'card': typeof colors.card === 'string' ? colors.card : (colors.card?.base || '#ffffff'),
    'card-foreground': typeof colors.card === 'string' ? '#000000' : (colors.card?.foreground || '#000000'),
    'popover': typeof colors.popover === 'string' ? colors.popover : (colors.popover?.base || '#ffffff'),
    'popover-foreground': typeof colors.popover === 'string' ? '#000000' : (colors.popover?.foreground || '#000000'),
    'border': typeof colors.border === 'string' ? colors.border : (colors.border?.base || '#e5e7eb'),
    'input': typeof colors.input === 'string' ? colors.input : (colors.input?.base || '#e5e7eb'),
    'ring': typeof colors.ring === 'string' ? colors.ring : (colors.ring?.base || '#0070f3'),
    'destructive': typeof colors.destructive === 'string' ? colors.destructive : (colors.destructive?.base || '#ff0000'),
    'destructive-foreground': typeof colors.destructive === 'string' ? '#ffffff' : (colors.destructive?.foreground || '#ffffff'),
  };
  
  Object.entries(mappings).forEach(([key, value]) => {
    cssVars += `--${key}: ${value};\n`;
  });
  
  return cssVars;
}

/**
 * Apply a theme to the document
 * @param theme Theme to apply
 * @param businessSlug Business slug
 */
export function applyTheme(theme: ThemeEntity, businessIdentifier: string): void {
  if (!theme || !theme.tokens) {
    console.warn('Attempted to apply theme with no tokens:', theme);
    return;
  }
  
  const themeClass = `theme-${businessIdentifier}`;
  const cssVars = generateCssVariables(theme.tokens);
  
  // Add or update the style element for this theme
  let styleEl = document.getElementById(`theme-style-${businessIdentifier}`);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = `theme-style-${businessIdentifier}`;
    document.head.appendChild(styleEl);
  }
  
  // Apply the CSS variables to the theme class
  styleEl.textContent = `.${themeClass} {\n${cssVars}}\n`;
  
  // Set theme metadata
  document.documentElement.setAttribute(`data-theme-${businessIdentifier}`, theme.name);
  
  console.log(`Applied theme "${theme.name}" to .${themeClass}`);
}

/**
 * Helper function to lighten a color
 * @param color Hex color
 * @param amount Amount to lighten (0-100)
 * @returns Lightened hex color
 */
export function lightenColor(color: string, amount: number): string {
  return adjustColorLightness(color, amount);
}

/**
 * Helper function to darken a color
 * @param color Hex color
 * @param amount Amount to darken (0-100)
 * @returns Darkened hex color
 */
export function darkenColor(color: string, amount: number): string {
  return adjustColorLightness(color, -amount);
}

/**
 * Adjust the lightness of a color
 * @param hexColor Hex color
 * @param percent Percent to adjust lightness (-100 to 100)
 * @returns Adjusted hex color
 */
export function adjustColorLightness(hexColor: string, percent: number): string {
  // Remove the hash
  let hex = hexColor.replace('#', '');
  
  // Convert to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Convert to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    
    h /= 6;
  }
  
  // Adjust lightness
  l = Math.max(0, Math.min(1, l + percent / 100));
  
  // Convert back to RGB
  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h * 6) % 2 - 1));
  let m = l - c / 2;
  
  let r1, g1, b1;
  
  if (h < 1/6) {
    [r1, g1, b1] = [c, x, 0];
  } else if (h < 2/6) {
    [r1, g1, b1] = [x, c, 0];
  } else if (h < 3/6) {
    [r1, g1, b1] = [0, c, x];
  } else if (h < 4/6) {
    [r1, g1, b1] = [0, x, c];
  } else if (h < 5/6) {
    [r1, g1, b1] = [x, 0, c];
  } else {
    [r1, g1, b1] = [c, 0, x];
  }
  
  r = Math.round((r1 + m) * 255);
  g = Math.round((g1 + m) * 255);
  b = Math.round((b1 + m) * 255);
  
  // Convert to hex
  const toHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert a hex color to RGBA
 * @param hex Hex color
 * @param alpha Alpha value (0-1)
 * @returns RGBA color string
 */
export function hexToRgba(hex: string, alpha: number): string {
  // Remove the hash
  const cleanHex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // Return RGBA
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}