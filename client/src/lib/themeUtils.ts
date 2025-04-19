/**
 * Theme Utils - 2025 Edition
 * 
 * Utility functions for working with themes and design tokens.
 */

import { GlobalTokens } from '@/providers/GlobalThemeContext';

/**
 * Generates CSS variables from a theme tokens object
 * @param tokens Theme tokens object
 * @returns CSS variables string
 */
export function generateCSSVariables(tokens: GlobalTokens | Record<string, any>): string {
  const lines: string[] = [];
  
  // Process the object recursively
  const processObject = (obj: Record<string, any>, path: string = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const varName = path ? `--${path}-${key}` : `--${key}`;
      
      if (typeof value === 'object' && value !== null) {
        // Recursively process nested objects
        processObject(value, path ? `${path}-${key}` : key);
      } else {
        // Add the CSS variable
        lines.push(`  ${varName}: ${value};`);
      }
    }
  };
  
  processObject(tokens);
  return lines.join('\n');
}

/**
 * Converts a theme to CSS variables
 * @param theme Theme object
 * @returns CSS string
 */
export function themeToCSS(theme: GlobalTokens | Record<string, any> | null): string {
  if (!theme) return '';
  return `:root {\n${generateCSSVariables(theme)}\n}`;
}

/**
 * Get a CSS variable value
 * @param name Variable name
 * @param fallback Fallback value
 * @returns CSS var() function string
 */
export function cssVar(name: string, fallback?: string): string {
  if (fallback) {
    return `var(--${name}, ${fallback})`;
  }
  return `var(--${name})`;
}

/**
 * Generates a theme class with scoped CSS variables
 * @param theme Theme object
 * @param className Class name for scoping
 * @returns CSS string
 */
export function generateThemeClass(theme: GlobalTokens | Record<string, any> | null, className: string): string {
  if (!theme) return '';
  return `.${className} {\n${generateCSSVariables(theme)}\n}`;
}

/**
 * Determines if a color is light or dark
 * @param color Hex color
 * @returns Boolean (true if color is light)
 */
export function isLightColor(color: string): boolean {
  // Remove hash if present
  color = color.replace(/^#/, '');
  
  // Parse hex color
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  
  // Calculate brightness using luminance formula
  // Perceived brightness = (0.299*R + 0.587*G + 0.114*B) / 255
  const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if the color is light (brightness > 0.5)
  return brightness > 0.5;
}

/**
 * Calculates the contrast ratio between two colors
 * @param foreground Foreground hex color
 * @param background Background hex color
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(foreground: string, background: string): number {
  // Helper to convert hex to RGB
  const hexToRgb = (hex: string) => {
    hex = hex.replace(/^#/, '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b];
  };
  
  // Helper to calculate luminance
  const luminance = (rgb: number[]) => {
    const a = rgb.map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };
  
  const rgbForeground = hexToRgb(foreground);
  const rgbBackground = hexToRgb(background);
  
  const l1 = luminance(rgbForeground);
  const l2 = luminance(rgbBackground);
  
  // Return contrast ratio
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * Check if a color passes accessibility contrast guidelines
 * @param foreground Foreground hex color
 * @param background Background hex color
 * @param level 'AA' or 'AAA'
 * @param type 'large' or 'normal'
 * @returns Boolean (true if passes)
 */
export function checkAccessibility(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  type: 'large' | 'normal' = 'normal'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  
  // WCAG 2.0 contrast requirements
  if (level === 'AA') {
    return type === 'large' ? ratio >= 3 : ratio >= 4.5;
  } else {
    return type === 'large' ? ratio >= 4.5 : ratio >= 7;
  }
}

export default {
  generateCSSVariables,
  themeToCSS,
  cssVar,
  generateThemeClass,
  isLightColor,
  getContrastRatio,
  checkAccessibility
};