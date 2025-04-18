/**
 * Theme Creator - 2025 Edition
 * 
 * Utilities for creating, manipulating, and rendering themes
 */

import { Theme, DesignTokens, ThemeMetadata, ThemeSettings } from './designTokens';
import { adjustColorLightness, hexToRgb, rgbToHex, isColorDark } from './tokenUtils';

/**
 * Generates a color palette from a primary color
 * 
 * @param primaryColor The base color to generate from
 * @returns A palette object with color variants
 */
export function generateColorPalette(primaryColor: string): Record<string, string> {
  // Generate shades and tints
  return {
    '50': adjustColorLightness(primaryColor, 85),
    '100': adjustColorLightness(primaryColor, 70),
    '200': adjustColorLightness(primaryColor, 50),
    '300': adjustColorLightness(primaryColor, 30),
    '400': adjustColorLightness(primaryColor, 15),
    '500': primaryColor, // Base color
    '600': adjustColorLightness(primaryColor, -15),
    '700': adjustColorLightness(primaryColor, -30),
    '800': adjustColorLightness(primaryColor, -45),
    '900': adjustColorLightness(primaryColor, -60),
    'light': adjustColorLightness(primaryColor, 90),
    'dark': adjustColorLightness(primaryColor, -45),
    'DEFAULT': primaryColor,
    'foreground': isColorDark(primaryColor) ? '#ffffff' : '#000000',
    'hover': adjustColorLightness(primaryColor, -10)
  };
}

/**
 * Converts a color mode string to actual color scheme
 */
export function getInitialColorScheme(mode: ThemeSettings['mode']): string {
  if (mode === 'light' || mode === 'dark') {
    return mode;
  }
  
  // For 'system', check user's preference
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  
  // Default to light if we can't determine
  return 'light';
}

/**
 * Generates a complete theme from a primary color and options
 * 
 * @param primaryColor The primary color
 * @param options Theme creation options
 * @returns A complete theme object
 */
export function createThemeFromColor(
  primaryColor: string,
  options: {
    name?: string;
    description?: string;
    variant?: 'professional' | 'vibrant' | 'muted';
    industry?: string;
    seasonal?: boolean;
    isAccessible?: boolean;
    backgroundColor?: string;
    secondaryColor?: string;
  } = {}
): Theme {
  const {
    name = 'Custom Theme',
    description = 'A custom theme',
    variant = 'professional',
    industry,
    seasonal = false,
    isAccessible = false,
    backgroundColor = '#ffffff',
    secondaryColor
  } = options;
  
  // Generate primary color palette
  const primaryPalette = generateColorPalette(primaryColor);
  
  // Generate secondary color palette if provided
  const secondaryPalette = secondaryColor
    ? generateColorPalette(secondaryColor)
    : generateColorPalette(adjustColorLightness(primaryColor, variant === 'vibrant' ? 60 : 30));
    
  // Generate grayscale palette based on background color
  const grayscalePalette = generateGrayscale(backgroundColor, variant);
  
  // Base tokens
  const baseTokens: DesignTokens = {
    colors: {
      primary: primaryPalette,
      secondary: secondaryPalette,
      background: {
        DEFAULT: backgroundColor,
        surface: variant === 'professional' ? backgroundColor : adjustColorLightness(backgroundColor, 3),
        elevated: adjustColorLightness(backgroundColor, 5),
        sunken: adjustColorLightness(backgroundColor, -3),
      },
      foreground: {
        DEFAULT: grayscalePalette['900'],
        muted: grayscalePalette['700'],
        subtle: grayscalePalette['500'],
      },
      border: grayscalePalette['200'],
      focus: `${primaryPalette['500']}80`, // With transparency
      destructive: {
        DEFAULT: '#ef4444',
        foreground: '#ffffff',
        light: '#fee2e2',
      },
      success: {
        DEFAULT: '#10b981',
        foreground: '#ffffff',
        light: '#ecfdf5',
      },
      warning: {
        DEFAULT: '#f59e0b',
        foreground: '#ffffff',
        light: '#fffbeb',
      },
      info: {
        DEFAULT: '#3b82f6',
        foreground: '#ffffff',
        light: '#eff6ff',
      }
    },
    typography: {
      fontFamily: {
        sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
        mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        heading: variant === 'vibrant' ? '"Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' : '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        display: variant === 'vibrant' ? '"Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' : '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        DEFAULT: '1rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem',
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        DEFAULT: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
      },
      lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        DEFAULT: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        DEFAULT: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      DEFAULT: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '2.5rem',
      '3xl': '3rem',
      '4xl': '4rem',
      '5xl': '6rem',
      '6xl': '8rem',
    },
    borders: {
      radius: {
        none: '0',
        sm: '0.125rem',
        DEFAULT: variant === 'professional' ? '0.25rem' : variant === 'vibrant' ? '0.5rem' : '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      width: {
        DEFAULT: '1px',
        0: '0px',
        2: '2px',
        4: '4px',
        8: '8px',
      },
      focus: {
        width: '2px',
        style: 'solid',
      },
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    },
    effects: {
      transition: {
        fast: '100ms ease-in-out',
        DEFAULT: '150ms ease-in-out',
        normal: '150ms ease-in-out',
        slow: '300ms ease-in-out',
      },
      opacity: {
        0: '0',
        25: '0.25',
        50: '0.5',
        75: '0.75',
        100: '1',
        disabled: '0.5',
        hover: '0.8',
      },
    },
    components: {
      // Component-specific tokens can be added here
    }
  };
  
  // Create the metadata object
  const metadata: ThemeMetadata = {
    id: generateThemeId(name),
    name,
    description,
    variant,
    industry,
    seasonal,
    isAccessible,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    primaryColor,
    baseColor: backgroundColor,
    secondaryColor: secondaryColor || '',
    version: '2.0.0',
    isDefault: false
  };
  
  // Return the full theme object
  return {
    tokens: baseTokens,
    metadata,
  };
}

/**
 * Creates a unique theme ID based on the name
 */
function generateThemeId(name: string): string {
  return `theme_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;
}

/**
 * Generates a grayscale palette suitable for the theme's style
 */
function generateGrayscale(baseColor: string, variant: string): Record<string, string> {
  // For professional, use pure grays
  if (variant === 'professional') {
    return {
      '50': '#f9fafb',
      '100': '#f3f4f6',
      '200': '#e5e7eb',
      '300': '#d1d5db',
      '400': '#9ca3af',
      '500': '#6b7280',
      '600': '#4b5563',
      '700': '#374151',
      '800': '#1f2937',
      '900': '#111827',
      'DEFAULT': '#6b7280',
    };
  }
  
  // For vibrant or muted, tint the grays with the base color
  const rgb = hexToRgb(baseColor) || { r: 255, g: 255, b: 255 };
  
  // Extract hue from the base color to tint grays
  const intensity = variant === 'vibrant' ? 0.08 : 0.04; // Stronger tint for vibrant
  
  return {
    '50': rgbToHex(252 + (rgb.r - 252) * intensity, 252 + (rgb.g - 252) * intensity, 252 + (rgb.b - 252) * intensity),
    '100': rgbToHex(245 + (rgb.r - 245) * intensity, 245 + (rgb.g - 245) * intensity, 245 + (rgb.b - 245) * intensity),
    '200': rgbToHex(229 + (rgb.r - 229) * intensity, 229 + (rgb.g - 229) * intensity, 229 + (rgb.b - 229) * intensity),
    '300': rgbToHex(212 + (rgb.r - 212) * intensity, 212 + (rgb.g - 212) * intensity, 212 + (rgb.b - 212) * intensity),
    '400': rgbToHex(156 + (rgb.r - 156) * intensity, 156 + (rgb.g - 156) * intensity, 156 + (rgb.b - 156) * intensity),
    '500': rgbToHex(107 + (rgb.r - 107) * intensity, 107 + (rgb.g - 107) * intensity, 107 + (rgb.b - 107) * intensity),
    '600': rgbToHex(75 + (rgb.r - 75) * intensity, 75 + (rgb.g - 75) * intensity, 75 + (rgb.b - 75) * intensity),
    '700': rgbToHex(55 + (rgb.r - 55) * intensity, 55 + (rgb.g - 55) * intensity, 55 + (rgb.b - 55) * intensity),
    '800': rgbToHex(31 + (rgb.r - 31) * intensity, 31 + (rgb.g - 31) * intensity, 31 + (rgb.b - 31) * intensity),
    '900': rgbToHex(17 + (rgb.r - 17) * intensity, 17 + (rgb.g - 17) * intensity, 17 + (rgb.b - 17) * intensity),
    'DEFAULT': rgbToHex(107 + (rgb.r - 107) * intensity, 107 + (rgb.g - 107) * intensity, 107 + (rgb.b - 107) * intensity),
  };
}

/**
 * Converts a theme to CSS variables
 * 
 * @param theme The theme to convert
 * @returns CSS string with variable declarations
 */
export function convertThemeToCSS(theme: Theme): string {
  let css = ':root {\n';
  
  const addVariable = (key: string, value: any) => {
    if (typeof value === 'string') {
      css += `  --${key}: ${value};\n`;
    }
  };
  
  // Helper function to process nested objects recursively
  const processObject = (obj: any, prefix: string = '') => {
    if (!obj || typeof obj !== 'object') return;
    
    Object.entries(obj).forEach(([key, value]) => {
      const variableKey = prefix ? `${prefix}-${key}` : key;
      
      if (value && typeof value === 'object') {
        // Add default values
        if ('DEFAULT' in value) {
          addVariable(variableKey, value.DEFAULT);
        }
        
        // Process nested objects
        processObject(value, variableKey);
      } else {
        addVariable(variableKey, value);
      }
    });
  };
  
  // Process each token category
  processObject(theme.tokens.colors, 'colors');
  processObject(theme.tokens.typography, 'typography');
  processObject(theme.tokens.spacing, 'spacing');
  processObject(theme.tokens.borders, 'borders');
  processObject(theme.tokens.shadows, 'shadows');
  processObject(theme.tokens.effects, 'effects');
  
  css += '}\n';
  return css;
}