/**
 * GlobalThemeContext - 2025 Edition
 * 
 * This defines the context and types for the global theme system.
 */

import { createContext } from 'react';

// Types for the global theme tokens structure
export interface GlobalTokens {
  colors: {
    background: {
      base: string;
      foreground: string;
    };
    card: {
      base: string;
      foreground: string;
    };
    popover: {
      base: string;
      foreground: string;
    };
    primary: {
      base: string;
      foreground: string;
      hover: string;
    };
    secondary: {
      base: string;
      foreground: string;
      hover: string;
    };
    muted: {
      base: string;
      foreground: string;
    };
    accent: {
      base: string;
      foreground: string;
    };
    destructive: {
      base: string;
      foreground: string;
      hover: string;
    };
    success: {
      base: string;
      foreground: string;
    };
    warning: {
      base: string;
      foreground: string;
    };
    info: {
      base: string;
      foreground: string;
    };
    border: string;
    input: string;
    ring: string;
  };
  typography: {
    fontFamilies: {
      base: string;
      heading: string;
      mono: string;
    };
    fontSizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
    };
    fontWeights: {
      light: string;
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
    lineHeights: {
      none: string;
      tight: string;
      snug: string;
      normal: string;
      relaxed: string;
      loose: string;
    };
  };
  spacing: number;
  borderRadius: number;
}

// Context type definition
export interface GlobalThemeContextType {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  systemPreference: 'light' | 'dark' | null;
  appearance: 'light' | 'dark' | 'system';
  setAppearance: (appearance: 'light' | 'dark' | 'system') => void;
  radius: number;
  setRadius: (radius: number) => void;
  globalTokens: GlobalTokens;
}

// Default light theme configuration
export const defaultGlobalTheme: GlobalTokens = {
  colors: {
    background: {
      base: '#ffffff',
      foreground: '#09090b',
    },
    card: {
      base: '#ffffff',
      foreground: '#09090b',
    },
    popover: {
      base: '#ffffff',
      foreground: '#09090b',
    },
    primary: {
      base: '#0070f3',
      foreground: '#ffffff',
      hover: '#0060df',
    },
    secondary: {
      base: '#f1f5f9',
      foreground: '#0f172a',
      hover: '#e2e8f0',
    },
    muted: {
      base: '#f1f5f9',
      foreground: '#71717a',
    },
    accent: {
      base: '#f1f5f9',
      foreground: '#0f172a',
    },
    destructive: {
      base: '#ef4444',
      foreground: '#ffffff',
      hover: '#dc2626',
    },
    success: {
      base: '#22c55e',
      foreground: '#ffffff',
    },
    warning: {
      base: '#f59e0b',
      foreground: '#ffffff',
    },
    info: {
      base: '#0ea5e9',
      foreground: '#ffffff',
    },
    border: '#e2e8f0',
    input: '#e2e8f0',
    ring: '#0070f3',
  },
  typography: {
    fontFamilies: {
      base: 'system-ui, sans-serif',
      heading: 'system-ui, sans-serif',
      mono: 'monospace',
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeights: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },
  spacing: 16,
  borderRadius: 8,
};

// Create the context with default values
export const GlobalThemeContext = createContext<GlobalThemeContextType>({
  darkMode: false,
  setDarkMode: () => {},
  systemPreference: null,
  appearance: 'system',
  setAppearance: () => {},
  radius: 8,
  setRadius: () => {},
  globalTokens: defaultGlobalTheme,
});