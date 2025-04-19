/**
 * GlobalThemeProvider - 2025 Edition
 * 
 * This provider manages application-wide theme settings including
 * dark mode, theme preferences, and global theme token defaults.
 */

import React, { useEffect, useState } from 'react';
import { themeToCSS } from '@/lib/themeUtils';
import { GlobalThemeContext, GlobalThemeContextType } from './GlobalThemeContext';

// Provider props
interface GlobalThemeProviderProps {
  children: React.ReactNode;
}

export function GlobalThemeProvider({ children }: GlobalThemeProviderProps) {
  // Detect system dark mode preference
  const getSystemPreference = (): 'light' | 'dark' | null => {
    if (typeof window === 'undefined') return null;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  
  // Get initial system preference
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark' | null>(getSystemPreference());
  
  // Load saved appearance preference from localStorage or default to system
  const getSavedAppearance = (): 'light' | 'dark' | 'system' => {
    if (typeof window === 'undefined') return 'system';
    
    const savedTheme = localStorage.getItem('color-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return 'system';
  };
  
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'system'>(getSavedAppearance());
  
  // Determine dark mode based on appearance and system preference
  const [darkMode, setDarkMode] = useState(
    appearance === 'dark' || (appearance === 'system' && systemPreference === 'dark')
  );
  const [radius, setRadius] = useState(8);
  const [styleElement, setStyleElement] = useState<HTMLStyleElement | null>(null);
  
  // Default global tokens
  const globalTokens = {
    colors: {
      background: {
        base: darkMode ? '#09090b' : '#ffffff',
        foreground: darkMode ? '#ffffff' : '#09090b',
      },
      card: {
        base: darkMode ? '#1c1c1f' : '#ffffff',
        foreground: darkMode ? '#ffffff' : '#09090b',
      },
      popover: {
        base: darkMode ? '#1c1c1f' : '#ffffff',
        foreground: darkMode ? '#ffffff' : '#09090b',
      },
      primary: {
        base: '#0070f3',
        foreground: '#ffffff',
        hover: '#0060df',
      },
      secondary: {
        base: darkMode ? '#2e2e35' : '#f1f5f9',
        foreground: darkMode ? '#ffffff' : '#0f172a',
        hover: darkMode ? '#3e3e45' : '#e2e8f0',
      },
      muted: {
        base: darkMode ? '#2e2e35' : '#f1f5f9',
        foreground: darkMode ? '#a1a1aa' : '#71717a',
      },
      accent: {
        base: darkMode ? '#1c1c1f' : '#f1f5f9',
        foreground: darkMode ? '#ffffff' : '#0f172a',
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
      border: darkMode ? '#2e2e35' : '#e2e8f0',
      input: darkMode ? '#2e2e35' : '#e2e8f0',
      ring: darkMode ? '#0070f3' : '#0070f3',
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
    borderRadius: radius,
  };
  
  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newPreference = e.matches ? 'dark' : 'light';
      setSystemPreference(newPreference);
      if (appearance === 'system') {
        setDarkMode(newPreference === 'dark');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [appearance]);
  
  // Update darkMode when appearance changes
  useEffect(() => {
    if (appearance === 'system') {
      setDarkMode(systemPreference === 'dark');
    } else {
      setDarkMode(appearance === 'dark');
    }
  }, [appearance, systemPreference]);
  
  // Apply dark mode class to document with improved metadata
  useEffect(() => {
    // Update the document class
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-color-scheme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-color-scheme', 'light');
    }
    
    // Update the meta theme-color tag for mobile browsers
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    
    // Set appropriate color for the browser UI
    metaThemeColor.setAttribute(
      'content', 
      darkMode ? globalTokens.colors.background.base : globalTokens.colors.background.base
    );
    
    // Store preference in localStorage if not using system preference
    if (appearance !== 'system') {
      localStorage.setItem('color-theme', appearance);
    } else {
      localStorage.removeItem('color-theme');
    }
  }, [darkMode, appearance, globalTokens]);
  
  // Generate and inject CSS variables
  useEffect(() => {
    const css = themeToCSS(globalTokens);
    
    if (!styleElement) {
      const style = document.createElement('style');
      style.id = 'global-theme-style';
      document.head.appendChild(style);
      setStyleElement(style);
    }
    
    if (styleElement) {
      styleElement.textContent = css;
    }
    
    return () => {
      if (styleElement && document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, [globalTokens, styleElement]);
  
  // Provide theme context
  const context: GlobalThemeContextType = {
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