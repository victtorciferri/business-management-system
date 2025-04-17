// We're using a relative import here since the path alias isn't working
import type { Theme } from "../types/theme";

/**
 * Apply theme settings to a root element (usually :root or a specific container for preview)
 */
export function applyTheme(theme: Theme): void {
  // Get the document root element
  const root = document.documentElement;
  
  // Apply the theme CSS variables
  applyThemeToElement(theme, root);
}

/**
 * Apply theme settings to a specific element (useful for previews)
 */
export function applyThemeToPreview(theme: Theme, element: HTMLElement): void {
  // Apply the theme CSS variables to the specified element
  applyThemeToElement(theme, element);
}

/**
 * Apply theme settings to a DOM element by setting CSS variables
 */
function applyThemeToElement(theme: Theme, element: HTMLElement): void {
  // Colors
  if (theme.primaryColor) {
    element.style.setProperty('--primary', hslToHsla(hexToHSL(theme.primaryColor)));
    element.style.setProperty('--primary-foreground', getContrastColor(theme.primaryColor));
  }
  
  if (theme.secondaryColor) {
    element.style.setProperty('--secondary', hslToHsla(hexToHSL(theme.secondaryColor)));
    element.style.setProperty('--secondary-foreground', getContrastColor(theme.secondaryColor));
  }
  
  if (theme.accentColor) {
    element.style.setProperty('--accent', hslToHsla(hexToHSL(theme.accentColor)));
    element.style.setProperty('--accent-foreground', getContrastColor(theme.accentColor));
  }
  
  if (theme.backgroundColor) {
    element.style.setProperty('--background', hslToHsla(hexToHSL(theme.backgroundColor)));
    element.style.setProperty('--foreground', getContrastColor(theme.backgroundColor));
  }
  
  // Font
  if (theme.fontFamily) {
    element.style.setProperty('--font-sans', theme.fontFamily);
  }
  
  // Border radius
  if (theme.borderRadius) {
    element.style.setProperty('--radius', theme.borderRadius);
  }
  
  // Spacing
  if (theme.spacing) {
    element.style.setProperty('--spacing', theme.spacing);
  }
}

/**
 * Convert a HEX color to HSL format
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  // Remove the # if present
  hex = hex.replace(/^#/, '');
  
  // Parse the r, g, b values
  let r = 0, g = 0, b = 0;
  
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16) / 255;
    g = parseInt(hex[1] + hex[1], 16) / 255;
    b = parseInt(hex[2] + hex[2], 16) / 255;
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16) / 255;
    g = parseInt(hex.substring(2, 4), 16) / 255;
    b = parseInt(hex.substring(4, 6), 16) / 255;
  }
  
  // Find min and max values of r, g, b
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  // Calculate lightness
  let l = (max + min) / 2;
  
  // Calculate saturation
  let s = 0;
  
  if (max !== min) {
    s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
  }
  
  // Calculate hue
  let h = 0;
  
  if (max !== min) {
    if (max === r) {
      h = (g - b) / (max - min) + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / (max - min) + 2;
    } else if (max === b) {
      h = (r - g) / (max - min) + 4;
    }
    
    h /= 6;
  }
  
  // Convert to degrees
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return { h, s, l };
}

/**
 * Convert HSL object to HSLA string
 */
function hslToHsla(hsl: { h: number; s: number; l: number }, alpha = 1): string {
  return `hsl(${hsl.h} ${hsl.s}% ${hsl.l}% / ${alpha})`;
}

/**
 * Get a contrasting color (black or white) for the given background color
 */
function getContrastColor(hexColor: string): string {
  // Convert hex to HSL
  const hsl = hexToHSL(hexColor);
  
  // Determine if the color is light or dark
  // For more sophisticated approaches, you could use the WCAG contrast formula
  return hsl.l > 50 ? 'hsl(0 0% 0%)' : 'hsl(0 0% 100%)';
}