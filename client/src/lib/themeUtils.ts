/**
 * Theme Utilities - 2025 Edition
 * 
 * Utility functions for working with themes, including:
 * - Converting theme objects to CSS variables
 * - Generating CSS classes for theme tokens
 * - Token manipulation and transformation
 */

import { GlobalTokens } from '@/providers/GlobalThemeContext';
import tinycolor from 'tinycolor2';

/**
 * Converts a theme tokens object to CSS variables
 * @param tokens The theme tokens object
 * @param scope Optional scope identifier for the CSS variables
 * @returns CSS string with all variables
 */
export function themeToCSS(tokens: GlobalTokens | any, scope?: string): string {
  if (!tokens) return '';
  
  // Initialize CSS variable string
  let css = ':root {\n';
  
  // Process the tokens object recursively
  const processTokens = (obj: any, prefix = '--') => {
    for (const key in obj) {
      const value = obj[key];
      
      // For nested objects, recursively process with updated prefix
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        processTokens(value, `${prefix}${key}-`);
      } else {
        // For primitive values, create CSS variable
        css += `  ${prefix}${key}: ${value};\n`;
      }
    }
  };
  
  // Process the tokens object
  processTokens(tokens);
  
  // Close the CSS block
  css += '}\n';
  
  // If a scope is provided, wrap the CSS variables in a scoped selector
  if (scope) {
    return css.replace(':root', `.theme-${scope}`);
  }
  
  return css;
}

/**
 * Extracts color variables from a theme tokens object
 * @param tokens The theme tokens object
 * @returns Object containing only the color-related tokens
 */
export function extractColorTokens(tokens: GlobalTokens): Record<string, string> {
  const colors: Record<string, string> = {};
  
  // Extract color tokens recursively
  const extractColors = (obj: any, prefix = '') => {
    for (const key in obj) {
      const value = obj[key];
      
      // For nested objects, recursively process
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        extractColors(value, prefix ? `${prefix}-${key}` : key);
      } else if (typeof value === 'string' && isColorValue(value)) {
        // If it's a color value, add to the colors object
        const tokenKey = prefix ? `${prefix}-${key}` : key;
        colors[tokenKey] = value;
      }
    }
  };
  
  // Process the color tokens in the theme
  extractColors(tokens.colors);
  
  return colors;
}

/**
 * Checks if a value is a valid CSS color
 * @param value The value to check
 * @returns True if the value is a valid color
 */
function isColorValue(value: string): boolean {
  // Use tinycolor to validate if the string is a color
  const tc = tinycolor(value) as any;
  return tc && tc.isValid && tc.isValid();
}

/**
 * Generates CSS variable access syntax for a token
 * @param path The token path (e.g., 'colors.primary.base')
 * @returns CSS variable access syntax (e.g., 'var(--colors-primary-base)')
 */
export function tokenToVar(path: string): string {
  // Convert the dot notation to kebab case for CSS variable
  const varName = path.replace(/\./g, '-');
  return `var(--${varName})`;
}

/**
 * Alias for tokenToVar for backward compatibility
 * @param path CSS variable path
 * @returns CSS variable string
 */
export function cssVar(path: string): string {
  return tokenToVar(path);
}

/**
 * Generate a dark mode version of a theme
 * @param theme The light theme tokens
 * @returns Dark theme tokens
 */
export function generateDarkTheme(theme: GlobalTokens): GlobalTokens {
  // Create a deep copy of the theme
  const darkTheme = JSON.parse(JSON.stringify(theme)) as GlobalTokens;
  
  // Transform color values to dark mode equivalents
  darkTheme.colors = {
    ...darkTheme.colors,
    
    // Invert background and foreground colors
    background: {
      base: '#18181b',          // Zinc 900
      foreground: '#f8fafc',    // Slate 50
      subtle: '#27272a',        // Zinc 800
      muted: '#3f3f46',         // Zinc 700
      elevated: '#18181b',      // Zinc 900
    },
    
    card: {
      base: '#27272a',          // Zinc 800
      foreground: '#f8fafc',    // Slate 50
      hover: '#3f3f46',         // Zinc 700
      elevated: '#3f3f46',      // Zinc 700
    },
    
    popover: {
      base: '#27272a',          // Zinc 800
      foreground: '#f8fafc',    // Slate 50
    },
    
    muted: {
      base: '#3f3f46',          // Zinc 700
      foreground: '#a1a1aa',    // Zinc 400
    },
    
    // Borders are darker in dark mode
    border: '#3f3f46',          // Zinc 700
    input: '#3f3f46',           // Zinc 700
  };
  
  return darkTheme;
}

/**
 * Generate CSS variables for both light and dark themes
 * with proper media queries for system preference
 * @param lightTheme The light theme tokens
 * @param darkTheme The dark theme tokens
 * @returns CSS string with media queries for light and dark themes
 */
export function generateThemeWithColorSchemes(
  lightTheme: GlobalTokens,
  darkTheme: GlobalTokens
): string {
  // Generate CSS for light theme
  const lightCSS = themeToCSS(lightTheme);
  
  // Generate CSS for dark theme, but with a media query
  let darkCSS = themeToCSS(darkTheme);
  darkCSS = darkCSS.replace(':root {', '@media (prefers-color-scheme: dark) {\n  :root {');
  darkCSS = darkCSS.replace('}\n', '  }\n}\n');
  
  // Combine the light and dark themes
  return lightCSS + '\n' + darkCSS;
}

/**
 * Get the appropriate theme based on the current color mode
 * @param lightTheme The light theme tokens
 * @param darkTheme The dark theme tokens 
 * @param isDarkMode Whether dark mode is active
 * @returns The appropriate theme tokens
 */
export function getThemeForColorMode(
  lightTheme: GlobalTokens,
  darkTheme: GlobalTokens,
  isDarkMode: boolean
): GlobalTokens {
  return isDarkMode ? darkTheme : lightTheme;
}

/**
 * Check if a color is light or dark
 * @param color The color to check (any valid CSS color string)
 * @returns True if the color is dark
 */
export function isColorDark(color: string): boolean {
  return tinycolor(color).isDark();
}

/**
 * Ensure a color has sufficient contrast against a background
 * @param color The foreground color
 * @param backgroundColor The background color
 * @param minContrastRatio The minimum contrast ratio (WCAG AA: 4.5:1, AAA: 7:1)
 * @returns A modified color with sufficient contrast
 */
export function ensureContrast(
  color: string,
  backgroundColor: string,
  minContrastRatio = 4.5
): string {
  const tColor = tinycolor(color);
  const tBgColor = tinycolor(backgroundColor);
  
  // Calculate the contrast ratio
  const contrast = tinycolor.readability(tColor, tBgColor);
  
  // If contrast is sufficient, return the original color
  if (contrast >= minContrastRatio) {
    return tColor.toHexString();
  }
  
  // Modify the color to increase contrast
  const isDark = tBgColor.isDark();
  
  // Adjust color in the right direction (lighten on dark backgrounds, darken on light)
  let adjustedColor = tColor;
  
  if (isDark) {
    // On dark backgrounds, lighten for better contrast
    for (let i = 0; i < 10; i++) {
      adjustedColor = adjustedColor.lighten(5);
      const newContrast = tinycolor.readability(adjustedColor, tBgColor);
      if (newContrast >= minContrastRatio) {
        break;
      }
    }
  } else {
    // On light backgrounds, darken for better contrast
    for (let i = 0; i < 10; i++) {
      adjustedColor = adjustedColor.darken(5);
      const newContrast = tinycolor.readability(adjustedColor, tBgColor);
      if (newContrast >= minContrastRatio) {
        break;
      }
    }
  }
  
  return adjustedColor.toHexString();
}