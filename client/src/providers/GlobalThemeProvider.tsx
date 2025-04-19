/**
 * GlobalThemeProvider - 2025 Edition
 * 
 * This provider manages application-wide theme settings including
 * dark mode, theme preferences, and global theme token defaults.
 */

import React, { useEffect, useState, useRef } from 'react';
import { GlobalThemeContext, GlobalTokens } from './GlobalThemeContext';
import { generateCSSVariables } from '@/lib/themeUtils';

// Import the transition styles
import '@/lib/colorModeTransition.css';

interface GlobalThemeProviderProps {
  children: React.ReactNode;
}

// Default light mode tokens
const lightTokens: GlobalTokens = {
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

// Default dark mode tokens
const darkTokens: GlobalTokens = {
  colors: {
    background: {
      base: '#09090b',
      foreground: '#f8fafc',
    },
    card: {
      base: '#1c1c1f',
      foreground: '#f8fafc',
    },
    popover: {
      base: '#1c1c1f',
      foreground: '#f8fafc',
    },
    primary: {
      base: '#0ea5e9',
      foreground: '#ffffff',
      hover: '#38bdf8',
    },
    secondary: {
      base: '#292930',
      foreground: '#f8fafc',
      hover: '#3f3f46',
    },
    muted: {
      base: '#26262e',
      foreground: '#a1a1aa',
    },
    accent: {
      base: '#292930',
      foreground: '#f8fafc',
    },
    destructive: {
      base: '#ef4444',
      foreground: '#ffffff',
      hover: '#f87171',
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
    border: '#2e2e38',
    input: '#2e2e38',
    ring: '#0ea5e9',
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

// Local storage keys
const DARK_MODE_KEY = 'app-dark-mode';
const APPEARANCE_KEY = 'app-appearance';
const RADIUS_KEY = 'app-radius';

export function GlobalThemeProvider({ children }: GlobalThemeProviderProps) {
  // Add dark mode for SSR
  if (typeof window !== 'undefined') {
    const systemDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (systemDarkMode) {
      console.log('System dark mode detected - applying dark mode');
    }
  }

  // Try to get saved preferences
  const getSavedAppearance = (): 'light' | 'dark' | 'system' => {
    if (typeof window === 'undefined') return 'system';
    const saved = localStorage.getItem(APPEARANCE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
    return 'system';
  };

  const getSavedRadius = (): number => {
    if (typeof window === 'undefined') return 8;
    const saved = localStorage.getItem(RADIUS_KEY);
    return saved ? parseInt(saved, 10) : 8;
  };

  // State
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark' | null>(null);
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'system'>(getSavedAppearance());
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [radius, setRadius] = useState<number>(getSavedRadius());
  const [globalTokens, setGlobalTokens] = useState<GlobalTokens>(lightTokens);
  
  // Reference to the style element
  const styleElement = useRef<HTMLStyleElement | null>(null);

  // Create a style element for global CSS variables
  useEffect(() => {
    if (typeof document !== 'undefined' && !styleElement.current) {
      const style = document.createElement('style');
      style.setAttribute('id', 'global-theme-variables');
      document.head.appendChild(style);
      styleElement.current = style;
    }
    
    return () => {
      if (styleElement.current && document.head.contains(styleElement.current)) {
        document.head.removeChild(styleElement.current);
      }
    };
  }, []);

  // Detect system preference for dark mode
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    setSystemPreference(mql.matches ? 'dark' : 'light');
    
    try {
      // Modern browsers
      mql.addEventListener('change', handleChange);
      return () => mql.removeEventListener('change', handleChange);
    } catch (e) {
      // Fallback for older browsers
      mql.addListener(handleChange);
      return () => mql.removeListener(handleChange);
    }
  }, []);

  // Update darkMode based on appearance and system preference
  useEffect(() => {
    if (appearance === 'system') {
      setDarkMode(systemPreference === 'dark');
    } else {
      setDarkMode(appearance === 'dark');
    }
  }, [appearance, systemPreference]);

  // Apply dark mode class to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
    }
  }, [darkMode]);

  // Save preferences to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(APPEARANCE_KEY, appearance);
      localStorage.setItem(RADIUS_KEY, radius.toString());
    }
  }, [appearance, radius]);

  // Update tokens based on dark mode
  useEffect(() => {
    // Use the appropriate tokens based on dark mode
    setGlobalTokens(darkMode ? darkTokens : lightTokens);
  }, [darkMode]);

  // Apply CSS variables to the document
  useEffect(() => {
    if (!styleElement.current) return;
    
    // Generate CSS variables
    const css = `:root {\n${generateCSSVariables(globalTokens)}\n}`;
    
    // Update style element
    if (styleElement.current) {
      styleElement.current.textContent = css;
    }
    
    return () => {
      if (styleElement.current && document.head.contains(styleElement.current)) {
        document.head.removeChild(styleElement.current);
      }
    };
  }, [globalTokens, styleElement]);
  
  // Provide theme context
  const context = {
    darkMode,
    setDarkMode,
    systemPreference,
    appearance,
    setAppearance,
    radius,
    setRadius,
    globalTokens,
  };
  
  return (
    <GlobalThemeContext.Provider value={context}>
      {children}
    </GlobalThemeContext.Provider>
  );
}