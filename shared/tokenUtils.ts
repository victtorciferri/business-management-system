/**
 * Token Utilities - 2025 Edition
 * 
 * Utility functions for working with design tokens
 */

import { DesignTokens, ColorTokens, TypographyTokens, SpacingTokens, BorderTokens, ShadowTokens } from './designTokens';

/**
 * Converts a hex color to RGB values
 * 
 * @param hex The hex color string (#RRGGBB)
 * @returns An object with r, g, b values
 */
export function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Converts RGB values to a hex color string
 * 
 * @param r Red value (0-255)
 * @param g Green value (0-255)
 * @param b Blue value (0-255)
 * @returns A hex color string (#RRGGBB)
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b]
    .map(x => Math.round(x).toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Determines if a given color is "dark" (needs white text) or "light" (needs dark text)
 * 
 * @param hex The hex color string
 * @returns true if the color is dark
 */
export function isColorDark(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  
  // Calculate perceived brightness using the luminance formula
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness < 128; // If less than 128, color is considered dark
}

/**
 * Adjusts the brightness of a color
 * 
 * @param hex The hex color string
 * @param amount Amount to adjust (-100 to 100, negative for darker)
 * @returns A new hex color string
 */
export function adjustColorBrightness(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  // Adjust each RGB component
  const r = Math.max(0, Math.min(255, rgb.r + amount));
  const g = Math.max(0, Math.min(255, rgb.g + amount));
  const b = Math.max(0, Math.min(255, rgb.b + amount));
  
  return rgbToHex(r, g, b);
}

/**
 * Adjusts the lightness of a color using HSL conversions
 * 
 * @param hex The hex color string
 * @param percent Percentage to adjust (can be negative for darker, positive for lighter)
 * @returns A new hex color string
 */
export function adjustColorLightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  // Convert RGB to HSL
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    
    h /= 6;
  }
  
  // Adjust lightness
  l = Math.max(0, Math.min(1, l * (1 + percent / 100)));
  
  // Convert back to RGB
  let r1 = 0, g1 = 0, b1 = 0;
  
  if (s === 0) {
    r1 = g1 = b1 = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r1 = hue2rgb(p, q, h + 1/3);
    g1 = hue2rgb(p, q, h);
    b1 = hue2rgb(p, q, h - 1/3);
  }
  
  return rgbToHex(r1 * 255, g1 * 255, b1 * 255);
}

/**
 * Generates a complete set of CSS variables from design tokens
 * This transforms our token structure into flat CSS variable name/value pairs
 * 
 * @param tokens The design tokens object
 * @returns A flat object with CSS variable names (including '--') as keys and values
 */
export function generateThemeVariables(tokens: DesignTokens): Record<string, string> {
  const variables: Record<string, string> = {};
  
  // Helper function to recursively process token objects
  const processTokens = (obj: any, prefix: string = '') => {
    if (!obj || typeof obj !== 'object') return;
    
    Object.entries(obj).forEach(([key, value]) => {
      const varName = prefix ? `--${prefix}-${key}` : `--${key}`;
      
      if (value && typeof value === 'object') {
        // Recurse for nested objects
        processTokens(value, prefix ? `${prefix}-${key}` : key);
        
        // Add the object's DEFAULT value if it exists
        if ('DEFAULT' in value && typeof value.DEFAULT === 'string') {
          variables[varName] = value.DEFAULT;
        }
      } else if (typeof value === 'string' || typeof value === 'number') {
        // Add leaf node values directly
        variables[varName] = String(value);
      }
    });
  };
  
  // Process each token category
  processTokens(tokens.colors, 'colors');
  processTokens(tokens.typography, 'typography');
  processTokens(tokens.spacing, 'spacing');
  processTokens(tokens.borders, 'borders');
  processTokens(tokens.shadows, 'shadows');
  processTokens(tokens.effects, 'effects');
  processTokens(tokens.components, 'components');
  
  return variables;
}

/**
 * Convert design tokens to CSS variables
 * This is an alias for generateThemeVariables, kept for backward compatibility
 * 
 * @param tokens The design tokens object
 * @returns A flat object with CSS variable names (including '--') as keys and values
 */
export function tokensToCSSVariables(tokens: DesignTokens): Record<string, string> {
  return generateThemeVariables(tokens);
}

/**
 * Generates CSS variable declarations from a variables object
 * 
 * @param variables Object of CSS variables
 * @param selector CSS selector to scope the variables to
 * @returns CSS string with variable declarations
 */
export function generateCSSFromVariables(
  variables: Record<string, string>,
  selector: string = ':root'
): string {
  let css = `${selector} {\n`;
  
  Object.entries(variables).forEach(([name, value]) => {
    css += `  ${name}: ${value};\n`;
  });
  
  css += '}\n';
  return css;
}