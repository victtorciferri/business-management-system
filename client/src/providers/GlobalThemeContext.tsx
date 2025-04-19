/**
 * GlobalThemeContext - 2025 Edition
 *
 * Defines the context for global theme settings including:
 * - Dark mode state and controls
 * - System color scheme preference detection
 * - Appearance preference management (light/dark/system)
 * - Border radius customization
 * - Global design tokens
 */

import { createContext } from 'react';

/**
 * Global design tokens interface
 * These tokens represent the base design system values
 */
export interface GlobalTokens {
  // Border radius settings
  borderRadius: number;
  
  // Color system
  colors: {
    // Primary brand colors
    primary: {
      base: string;
      foreground: string;
      hover: string;
      active: string;
      focus: string;
      subtle: string;
    };
    
    // Secondary accent colors
    secondary: {
      base: string;
      foreground: string;
      hover: string;
      active: string;
      focus: string;
      subtle: string;
    };
    
    // Background elements
    background: {
      base: string;
      foreground: string;
      subtle: string;
      muted: string;
      elevated: string;
    };
    
    // Card elements
    card: {
      base: string;
      foreground: string;
      hover: string;
      elevated: string;
    };
    
    // Popover and dropdown elements
    popover: {
      base: string;
      foreground: string;
    };
    
    // Accent elements (used for highlighting)
    accent: {
      base: string;
      foreground: string;
      subtle: string;
      emphasized: string;
    };
    
    // Muted elements (subdued UI elements)
    muted: {
      base: string;
      foreground: string;
    };
    
    // Border and divider colors
    border: string;
    
    // Input element colors
    input: string;
    
    // Various functional colors
    destructive: string;
    success: string;
    warning: string;
    info: string;
  };
  
  // Typography settings
  typography: {
    fontFamily: {
      base: string;
      heading: string;
      mono: string;
    };
    fontSize: {
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
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
      loose: number;
    };
    letterSpacing: {
      tighter: string;
      tight: string;
      normal: string;
      wide: string;
      wider: string;
    };
  };
  
  // Spacing system
  spacing: {
    px: string;
    0: string;
    0.5: string;
    1: string;
    1.5: string;
    2: string;
    2.5: string;
    3: string;
    3.5: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
    11: string;
    12: string;
    14: string;
    16: string;
    20: string;
    24: string;
    28: string;
    32: string;
    36: string;
    40: string;
    44: string;
    48: string;
    52: string;
    56: string;
    60: string;
    64: string;
    72: string;
    80: string;
    96: string;
  };
  
  // Shadows system
  shadows: {
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    inner: string;
    focus: string;
  };
  
  // Motion and animation
  motion: {
    transition: {
      fast: string;
      normal: string;
      slow: string;
    };
    animation: {
      spin: string;
      ping: string;
      pulse: string;
      bounce: string;
    };
  };
}

// Define default global theme tokens
export const defaultGlobalTheme: GlobalTokens = {
  borderRadius: 8,
  
  colors: {
    primary: {
      base: '#2563eb',      // Blue 600
      foreground: '#ffffff', // White
      hover: '#1d4ed8',     // Blue 700
      active: '#1e40af',    // Blue 800
      focus: '#3b82f6',     // Blue 500
      subtle: '#dbeafe',    // Blue 100
    },
    secondary: {
      base: '#4f46e5',      // Indigo 600
      foreground: '#ffffff', // White
      hover: '#4338ca',     // Indigo 700
      active: '#3730a3',    // Indigo 800
      focus: '#6366f1',     // Indigo 500
      subtle: '#e0e7ff',    // Indigo 100
    },
    background: {
      base: '#ffffff',      // White
      foreground: '#18181b', // Zinc 900
      subtle: '#f8fafc',    // Slate 50
      muted: '#f1f5f9',     // Slate 100
      elevated: '#ffffff',  // White
    },
    card: {
      base: '#ffffff',      // White
      foreground: '#18181b', // Zinc 900
      hover: '#f8fafc',     // Slate 50
      elevated: '#ffffff',  // White with shadow
    },
    popover: {
      base: '#ffffff',      // White
      foreground: '#18181b', // Zinc 900
    },
    accent: {
      base: '#8b5cf6',      // Violet 500
      foreground: '#ffffff', // White
      subtle: '#f5f3ff',    // Violet 50
      emphasized: '#7c3aed', // Violet 600
    },
    muted: {
      base: '#f1f5f9',      // Slate 100
      foreground: '#64748b', // Slate 500
    },
    border: '#e2e8f0',      // Slate 200
    input: '#e2e8f0',       // Slate 200
    destructive: '#ef4444', // Red 500
    success: '#22c55e',     // Green 500
    warning: '#f59e0b',     // Amber 500
    info: '#3b82f6',        // Blue 500
  },
  
  typography: {
    fontFamily: {
      base: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSize: {
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
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
    },
  },
  
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    focus: '0 0 0 3px rgba(66, 153, 225, 0.5)',
  },
  
  motion: {
    transition: {
      fast: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
      normal: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      slow: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    animation: {
      spin: 'spin 1s linear infinite',
      ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
      pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      bounce: 'bounce 1s infinite',
    },
  },
};

export interface GlobalThemeContextProps {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  systemPreference: 'light' | 'dark' | null;
  appearance: 'light' | 'dark' | 'system';
  setAppearance: React.Dispatch<React.SetStateAction<'light' | 'dark' | 'system'>>;
  radius: number;
  setRadius: React.Dispatch<React.SetStateAction<number>>;
  globalTokens: GlobalTokens;
}

// Create the context with default values
export const GlobalThemeContext = createContext<GlobalThemeContextProps>({
  darkMode: false,
  setDarkMode: () => {},
  systemPreference: null,
  appearance: 'system',
  setAppearance: () => {},
  radius: 8,
  setRadius: () => {},
  globalTokens: defaultGlobalTheme,
});