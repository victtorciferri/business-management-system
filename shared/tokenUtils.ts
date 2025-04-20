/**
 * Token Utilities - 2025 Edition
 * 
 * Utilities for working with the design token system
 */

import { Theme, DesignTokens, ThemeMetadata } from './designTokens';
import { ThemeEntity } from './schema';

/**
 * Interface for CSS Variables
 */
export interface CSSVariables {
  [key: string]: string;
}

/**
 * Converts ThemeEntity to CSS Variables
 * 
 * @param theme The theme entity to convert
 * @returns Object containing CSS variables
 */
export function themeToCssVariables(theme: Partial<ThemeEntity>): Record<string, string> {
  const variables: Record<string, string> = {};
  
  // Set legacy variables for backward compatibility
  if (theme.primaryColor) variables['--primary-color'] = theme.primaryColor;
  if (theme.secondaryColor) variables['--secondary-color'] = theme.secondaryColor;
  if (theme.accentColor) variables['--accent-color'] = theme.accentColor;
  if (theme.backgroundColor) variables['--background-color'] = theme.backgroundColor;
  if (theme.textColor) variables['--text-color'] = theme.textColor;
  if (theme.fontFamily) variables['--font-family'] = theme.fontFamily;
  if (theme.borderRadius) variables['--border-radius'] = `${theme.borderRadius}px`;
  
  // Set design token variables if available
  if (theme.tokens) {
    const tokens = theme.tokens as DesignTokens;
    
    // Colors
    if (tokens.colors) {
      for (const [colorName, colorValue] of Object.entries(tokens.colors)) {
        if (typeof colorValue === 'string') {
          variables[`--color-${colorName}`] = colorValue;
        } else if (typeof colorValue === 'object') {
          for (const [shade, shadeValue] of Object.entries(colorValue)) {
            if (shade === 'DEFAULT') {
              variables[`--color-${colorName}`] = shadeValue;
            } else {
              variables[`--color-${colorName}-${shade}`] = shadeValue;
            }
          }
        }
      }
    }
    
    // Typography
    if (tokens.typography) {
      for (const [typeName, typeValue] of Object.entries(tokens.typography)) {
        if (typeof typeValue === 'string' || typeof typeValue === 'number') {
          variables[`--typography-${typeName}`] = String(typeValue);
        } else if (typeof typeValue === 'object') {
          for (const [variant, variantValue] of Object.entries(typeValue)) {
            if (variant === 'DEFAULT') {
              variables[`--typography-${typeName}`] = String(variantValue);
            } else {
              variables[`--typography-${typeName}-${variant}`] = String(variantValue);
            }
          }
        }
      }
    }
    
    // Spacing
    if (tokens.spacing) {
      for (const [spaceName, spaceValue] of Object.entries(tokens.spacing)) {
        if (spaceName === 'DEFAULT') {
          variables['--spacing'] = spaceValue;
        } else {
          variables[`--spacing-${spaceName}`] = spaceValue;
        }
      }
    }
    
    // Borders
    if (tokens.borders) {
      for (const [borderName, borderValue] of Object.entries(tokens.borders)) {
        if (typeof borderValue === 'string') {
          variables[`--border-${borderName}`] = borderValue;
        } else if (typeof borderValue === 'object') {
          for (const [variant, variantValue] of Object.entries(borderValue)) {
            if (variant === 'DEFAULT') {
              variables[`--border-${borderName}`] = String(variantValue);
            } else {
              variables[`--border-${borderName}-${variant}`] = String(variantValue);
            }
          }
        }
      }
    }
    
    // Shadows
    if (tokens.shadows) {
      for (const [shadowName, shadowValue] of Object.entries(tokens.shadows)) {
        if (shadowName === 'DEFAULT') {
          variables['--shadow'] = shadowValue;
        } else {
          variables[`--shadow-${shadowName}`] = shadowValue;
        }
      }
    }
    
    // Effects
    if (tokens.effects) {
      for (const [effectName, effectValue] of Object.entries(tokens.effects)) {
        if (typeof effectValue === 'string') {
          variables[`--effect-${effectName}`] = effectValue;
        } else if (typeof effectValue === 'object') {
          for (const [variant, variantValue] of Object.entries(effectValue)) {
            if (variant === 'DEFAULT') {
              variables[`--effect-${effectName}`] = String(variantValue);
            } else {
              variables[`--effect-${effectName}-${variant}`] = String(variantValue);
            }
          }
        }
      }
    }
    
    // Component tokens
    if (tokens.components) {
      for (const [componentName, componentValue] of Object.entries(tokens.components)) {
        if (typeof componentValue === 'object') {
          for (const [propName, propValue] of Object.entries(componentValue)) {
            if (typeof propValue === 'string' || typeof propValue === 'number') {
              variables[`--component-${componentName}-${propName}`] = String(propValue);
            }
          }
        }
      }
    }
  }
  
  return variables;
}

/**
 * Applies theme settings to the document
 * 
 * @param theme The theme entity to apply
 * @param targetElement The element to apply the theme to (defaults to document.documentElement)
 */
export function applyThemeSettings(theme: Partial<ThemeEntity>, targetElement: HTMLElement = document.documentElement): void {
  const variables = themeToCssVariables(theme);
  
  // Apply CSS variables
  for (const [key, value] of Object.entries(variables)) {
    targetElement.style.setProperty(key, value);
  }
  
  // Apply theme variant class
  if (theme.variant) {
    const variantClasses = ['theme-professional', 'theme-vibrant', 'theme-elegant', 'theme-minimal'];
    variantClasses.forEach(cls => targetElement.classList.remove(cls));
    targetElement.classList.add(`theme-${theme.variant}`);
  }
  
  // Apply theme mode (light/dark)
  if (theme.appearance) {
    if (theme.appearance === 'dark') {
      targetElement.classList.add('dark');
    } else if (theme.appearance === 'light') {
      targetElement.classList.remove('dark');
    }
    // 'system' is handled by the useDarkMode hook
  }
}

/**
 * Creates a complete theme object from a partial theme entity
 * Useful for creating new themes with all required fields
 */
export function createCompleteTheme(partialTheme: Partial<ThemeEntity>): Theme {
  // Default metadata
  const metadata: ThemeMetadata = {
    id: partialTheme.id?.toString() || `theme_${Date.now().toString(36)}`,
    name: partialTheme.name || 'New Theme',
    description: partialTheme.description || '',
    variant: (partialTheme.variant as any) || 'professional',
    primaryColor: partialTheme.primaryColor || '#4f46e5',
    baseColor: partialTheme.primaryColor || '#4f46e5',
    secondaryColor: partialTheme.secondaryColor || '#06b6d4',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
    isDefault: partialTheme.isDefault || false
  };
  
  // Generate tokens from theme properties if not provided
  const tokens: DesignTokens = partialTheme.tokens || {
    colors: {
      primary: {
        DEFAULT: partialTheme.primaryColor || '#4f46e5',
        light: shiftColor(partialTheme.primaryColor || '#4f46e5', 0.2),
        dark: shiftColor(partialTheme.primaryColor || '#4f46e5', -0.2),
        foreground: getContrastColor(partialTheme.primaryColor || '#4f46e5')
      },
      secondary: {
        DEFAULT: partialTheme.secondaryColor || '#06b6d4',
        light: shiftColor(partialTheme.secondaryColor || '#06b6d4', 0.2),
        dark: shiftColor(partialTheme.secondaryColor || '#06b6d4', -0.2),
        foreground: getContrastColor(partialTheme.secondaryColor || '#06b6d4')
      },
      background: {
        DEFAULT: partialTheme.backgroundColor || '#ffffff',
        surface: shiftColor(partialTheme.backgroundColor || '#ffffff', 0.05),
        elevated: shiftColor(partialTheme.backgroundColor || '#ffffff', 0.1)
      },
      foreground: {
        DEFAULT: partialTheme.textColor || '#111827',
        muted: shiftColor(partialTheme.textColor || '#111827', 0.3)
      }
    },
    typography: {
      fontFamily: {
        body: partialTheme.fontFamily || 'Inter, system-ui, sans-serif',
        heading: partialTheme.fontFamily || 'Inter, system-ui, sans-serif',
        sans: 'Inter, system-ui, sans-serif',
        serif: 'Georgia, serif',
        mono: 'Menlo, monospace'
      },
      fontSize: {
        base: '16px',
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      }
    },
    spacing: {
      DEFAULT: '16px',
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    },
    borders: {
      radius: {
        DEFAULT: `${partialTheme.borderRadius || 8}px`,
        sm: `${Math.max(2, (partialTheme.borderRadius || 8) / 2)}px`,
        lg: `${(partialTheme.borderRadius || 8) * 1.5}px`,
        full: '9999px'
      }
    },
    shadows: {
      DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.1)',
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.1)'
    },
    effects: {
      transition: {
        DEFAULT: '150ms ease',
        fast: '100ms ease',
        slow: '300ms ease'
      }
    },
    components: {}
  };
  
  return {
    metadata,
    tokens
  };
}

/**
 * Helper to shift a color's luminance by a percentage
 * Positive amount brightens, negative amount darkens
 */
export function shiftColor(color: string, amount: number): string {
  // Simple implementation - in real application, use a color library
  try {
    // Parse hex to rgb
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);
    
    // Shift values
    r = Math.max(0, Math.min(255, r + Math.round(r * amount)));
    g = Math.max(0, Math.min(255, g + Math.round(g * amount)));
    b = Math.max(0, Math.min(255, b + Math.round(b * amount)));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } catch (e) {
    console.error('Failed to shift color:', e);
    return color;
  }
}

/**
 * Helper to get contrasting text color (black or white) for a background
 */
export function getContrastColor(backgroundColor: string): string {
  try {
    // Parse hex to rgb
    const r = parseInt(backgroundColor.substring(1, 3), 16);
    const g = parseInt(backgroundColor.substring(3, 5), 16);
    const b = parseInt(backgroundColor.substring(5, 7), 16);
    
    // Calculate luminance - simplified formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black for bright backgrounds, white for dark backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
  } catch (e) {
    console.error('Failed to calculate contrast color:', e);
    return '#ffffff';
  }
}

/**
 * Helper to check if a color is dark
 */
export function isColorDark(color: string): boolean {
  try {
    // Parse hex to rgb
    const r = parseInt(color.substring(1, 3), 16);
    const g = parseInt(color.substring(3, 5), 16);
    const b = parseInt(color.substring(5, 7), 16);
    
    // Calculate luminance - simplified formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return true if color is dark (luminance < 0.5)
    return luminance < 0.5;
  } catch (e) {
    console.error('Failed to determine if color is dark:', e);
    return false;
  }
}

/**
 * Adjusts color lightness by percentage
 * Positive amount makes lighter, negative makes darker
 */
export function adjustColorLightness(color: string, amount: number): string {
  return shiftColor(color, amount / 100);
}

/**
 * Convert hex color to RGB object
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
 * Convert RGB values to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`;
}

/**
 * Convert RGB values to an rgba string
 */
export function rgbaToString(r: number, g: number, b: number, a: number): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Calculate the luminance of a color (for WCAG contrast calculations)
 * Returns a value between 0 (black) and 1 (white)
 */
export function calculateLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  // Convert RGB to linear values
  const linearize = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  // Calculate luminance using WCAG formula
  const r = linearize(rgb.r);
  const g = linearize(rgb.g);
  const b = linearize(rgb.b);
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert tokens to CSS variables with the proper naming convention
 * 
 * @param tokens DesignTokens object
 * @returns Object mapping CSS variable names to values
 */
export function tokensToCSSVariables(tokens: DesignTokens): CSSVariables {
  const variables: CSSVariables = {};
  
  // Process colors
  if (tokens.colors) {
    processTokenSection(tokens.colors, 'colors', variables);
  }
  
  // Process typography
  if (tokens.typography) {
    processTokenSection(tokens.typography, 'typography', variables);
  }
  
  // Process spacing
  if (tokens.spacing) {
    processTokenSection(tokens.spacing, 'spacing', variables);
  }
  
  // Process borders
  if (tokens.borders) {
    processTokenSection(tokens.borders, 'borders', variables);
  }
  
  // Process shadows
  if (tokens.shadows) {
    processTokenSection(tokens.shadows, 'shadows', variables);
  }
  
  // Process effects
  if (tokens.effects) {
    processTokenSection(tokens.effects, 'effects', variables);
  }
  
  // Process component tokens
  if (tokens.components) {
    // Components have a special structure
    Object.entries(tokens.components).forEach(([componentName, componentTokens]) => {
      Object.entries(componentTokens).forEach(([tokenName, tokenValue]) => {
        if (typeof tokenValue === 'string' || typeof tokenValue === 'number') {
          variables[`--components-${componentName}-${tokenName}`] = String(tokenValue);
        } else if (tokenValue && typeof tokenValue === 'object') {
          // Handle nested component tokens
          Object.entries(tokenValue as Record<string, string>).forEach(([subKey, subValue]) => {
            variables[`--components-${componentName}-${tokenName}-${subKey}`] = String(subValue);
          });
        }
      });
    });
  }
  
  return variables;
}

/**
 * Process a section of the token object and add to variables
 */
function processTokenSection(
  section: Record<string, any>,
  prefix: string,
  variables: CSSVariables
): void {
  Object.entries(section).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      // Handle simple values
      variables[`--${prefix}-${key}`] = String(value);
    } else if (value && typeof value === 'object') {
      // Handle nested objects
      Object.entries(value).forEach(([subKey, subValue]) => {
        if (subKey === 'DEFAULT') {
          variables[`--${prefix}-${key}`] = String(subValue);
        } else {
          variables[`--${prefix}-${key}-${subKey}`] = String(subValue);
        }
      });
    }
  });
}

/**
 * Generate CSS from a variables object
 * 
 * @param variables CSS variable key-value pairs
 * @param selector CSS selector to scope variables to
 * @returns CSS string with variable declarations
 */
export function generateCSSFromVariables(
  variables: CSSVariables,
  selector: string = ':root'
): string {
  // Start the CSS block
  let css = `${selector} {\n`;
  
  // Add each variable
  Object.entries(variables).forEach(([key, value]) => {
    css += `  ${key}: ${value};\n`;
  });
  
  // Close the CSS block
  css += '}\n';
  
  return css;
}