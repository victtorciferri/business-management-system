/**
 * Theme API Client - 2025 Edition
 * 
 * Client-side utility functions for interacting with the theme API
 */

import { DesignTokens } from '@shared/designTokens';
import { ThemeEntity } from '@shared/schema';
import { apiRequest } from '@lib/queryClient';

/**
 * Interface for theme creation/update requests
 */
export interface ThemeRequest {
  name: string;
  description?: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  textColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  borderRadius?: number;
  spacing?: number;
  isDefault?: boolean;
  isActive?: boolean;
  category?: string;
  tags?: string[];
  tokens?: DesignTokens;
}

/**
 * Fetch all themes for the authenticated business
 */
export async function getAllThemes(): Promise<ThemeEntity[]> {
  const response = await apiRequest('/api/themes');
  return response.themes;
}

/**
 * Fetch the active theme for the authenticated business
 */
export async function getActiveTheme(): Promise<ThemeEntity> {
  const response = await apiRequest('/api/themes/active');
  return response.theme;
}

/**
 * Fetch a specific theme by ID
 */
export async function getThemeById(id: number): Promise<ThemeEntity> {
  const response = await apiRequest(`/api/themes/${id}`);
  return response.theme;
}

/**
 * Create a new theme for the authenticated business
 */
export async function createTheme(themeData: ThemeRequest): Promise<ThemeEntity> {
  const response = await apiRequest('/api/themes', {
    method: 'POST',
    body: JSON.stringify(themeData),
  });
  return response.theme;
}

/**
 * Update an existing theme
 */
export async function updateTheme(id: number, themeData: Partial<ThemeRequest>): Promise<ThemeEntity> {
  const response = await apiRequest(`/api/themes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(themeData),
  });
  return response.theme;
}

/**
 * Delete a theme
 */
export async function deleteTheme(id: number): Promise<{ message: string }> {
  return await apiRequest(`/api/themes/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Activate a theme (set it as the active theme)
 */
export async function activateTheme(id: number): Promise<ThemeEntity> {
  const response = await apiRequest(`/api/themes/${id}/activate`, {
    method: 'POST',
  });
  return response.theme;
}

/**
 * Fetch themes for a specific business by slug (for public access)
 */
export async function getThemesByBusinessSlug(slug: string): Promise<ThemeEntity[]> {
  const response = await apiRequest(`/api/themes/business/${slug}`);
  return response.themes;
}

/**
 * Fetch themes from a specific business for preview in the theme gallery
 * Doesn't require authentication
 */
export async function getPublicThemes(businessSlug: string): Promise<ThemeEntity[]> {
  try {
    const response = await fetch(`/api/public/themes/${businessSlug}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch public themes: ${response.status}`);
    }
    const data = await response.json();
    return data.themes;
  } catch (error) {
    console.error('Error fetching public themes:', error);
    throw error;
  }
}

/**
 * Function to convert legacy theme format to new design tokens format
 */
export function convertLegacyThemeToTokens(legacyTheme: any): DesignTokens {
  // Default tokens structure
  const tokens: DesignTokens = {
    colors: {
      primary: {
        DEFAULT: legacyTheme.primaryColor || '#4f46e5',
        foreground: '#ffffff',
        light: adjustColorLightness(legacyTheme.primaryColor || '#4f46e5', 15),
        dark: adjustColorLightness(legacyTheme.primaryColor || '#4f46e5', -15),
        hover: adjustColorLightness(legacyTheme.primaryColor || '#4f46e5', -10),
      },
      secondary: {
        DEFAULT: legacyTheme.secondaryColor || '#06b6d4',
        foreground: '#ffffff',
        light: adjustColorLightness(legacyTheme.secondaryColor || '#06b6d4', 15),
        dark: adjustColorLightness(legacyTheme.secondaryColor || '#06b6d4', -15),
        hover: adjustColorLightness(legacyTheme.secondaryColor || '#06b6d4', -10),
      },
      background: {
        DEFAULT: legacyTheme.backgroundColor || '#ffffff',
        surface: adjustColorLightness(legacyTheme.backgroundColor || '#ffffff', -2),
        elevated: '#ffffff',
        sunken: adjustColorLightness(legacyTheme.backgroundColor || '#ffffff', -5),
      },
      foreground: {
        DEFAULT: legacyTheme.textColor || '#111827',
        muted: adjustColorLightness(legacyTheme.textColor || '#111827', 30),
        subtle: adjustColorLightness(legacyTheme.textColor || '#111827', 40),
      },
      border: adjustColorLightness(legacyTheme.backgroundColor || '#ffffff', -10),
      focus: legacyTheme.primaryColor || '#4f46e5',
      destructive: {
        DEFAULT: '#ef4444',
        foreground: '#ffffff',
        light: '#fecaca',
      },
      success: {
        DEFAULT: '#22c55e',
        foreground: '#ffffff',
        light: '#bbf7d0',
      },
      warning: {
        DEFAULT: legacyTheme.accentColor || '#f59e0b',
        foreground: '#ffffff',
        light: '#fef3c7',
      },
      info: {
        DEFAULT: '#3b82f6',
        foreground: '#ffffff',
        light: '#dbeafe',
      }
    },
    typography: {
      fontFamily: {
        sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        serif: "Georgia, Cambria, 'Times New Roman', Times, serif",
        mono: "Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
        body: legacyTheme.fontFamily || "Inter, sans-serif",
        heading: legacyTheme.fontFamily || "Inter, sans-serif",
        display: legacyTheme.fontFamily || "Inter, sans-serif",
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
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
        DEFAULT: '1rem',
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
        DEFAULT: '400',
      },
      lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
        DEFAULT: '1.5',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
        DEFAULT: '0em',
      },
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '2.5rem',
      '3xl': '3rem',
      '4xl': '4rem',
      '5xl': '6rem',
      '6xl': '8rem',
      DEFAULT: `${(legacyTheme.spacing || 16) / 16}rem`,
    },
    borders: {
      radius: {
        none: '0',
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.5rem',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        full: '9999px',
        DEFAULT: `${(legacyTheme.borderRadius || 8) / 16}rem`,
      },
      width: {
        DEFAULT: '1px',
        none: '0',
        thin: '1px',
        thick: '2px',
        heavy: '4px',
      },
      focus: {
        width: '2px',
        style: 'solid',
      },
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      colored: `0 4px 14px 0 ${hexToRgba(legacyTheme.primaryColor || '#4f46e5', 0.2)}`,
    },
    effects: {
      transition: {
        fast: '100ms ease-in-out',
        normal: '200ms ease-in-out',
        slow: '300ms ease-in-out',
        DEFAULT: '200ms ease-in-out',
      },
      opacity: {
        '0': '0',
        '25': '0.25',
        '50': '0.5',
        '75': '0.75',
        '100': '1',
        disabled: '0.5',
        hover: '0.8',
      },
    },
    components: {
      button: {},
      input: {},
      card: {},
      modal: {},
      toast: {},
      avatar: {},
    }
  };

  return tokens;
}

/**
 * Helper function to adjust color lightness
 */
function adjustColorLightness(hexColor: string, percent: number): string {
  // Parse hex color
  let r = parseInt(hexColor.substring(1, 3), 16);
  let g = parseInt(hexColor.substring(3, 5), 16);
  let b = parseInt(hexColor.substring(5, 7), 16);

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
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }

  // Adjust lightness
  l = Math.max(0, Math.min(1, l + percent / 100));

  // Convert back to RGB
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h * 6) % 2 - 1));
  const m = l - c / 2;
  
  let r1, g1, b1;
  
  if (0 <= h && h < 1/6) {
    [r1, g1, b1] = [c, x, 0];
  } else if (1/6 <= h && h < 2/6) {
    [r1, g1, b1] = [x, c, 0];
  } else if (2/6 <= h && h < 3/6) {
    [r1, g1, b1] = [0, c, x];
  } else if (3/6 <= h && h < 4/6) {
    [r1, g1, b1] = [0, x, c];
  } else if (4/6 <= h && h < 5/6) {
    [r1, g1, b1] = [x, 0, c];
  } else {
    [r1, g1, b1] = [c, 0, x];
  }
  
  r = Math.round((r1 + m) * 255);
  g = Math.round((g1 + m) * 255);
  b = Math.round((b1 + m) * 255);

  // Convert back to hex
  return `#${(r < 16 ? '0' : '') + r.toString(16)}${(g < 16 ? '0' : '') + g.toString(16)}${(b < 16 ? '0' : '') + b.toString(16)}`;
}

/**
 * Helper function to convert hex to rgba
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}