/**
 * GlobalThemeProvider - 2025 Edition
 *
 * Provides global theme context with dark/light mode support
 * and system preference detection.
 */

import React, { useState, useEffect, useRef } from 'react';
import { GlobalThemeContext, defaultGlobalTheme, GlobalTokens } from './GlobalThemeContext';
import { themeToCSS } from '@/lib/themeUtils';
import '../lib/colorModeTransition.css'; // Transitions for color mode changes

// Theme for dark mode with accessible colors
const darkModeTheme: GlobalTokens = {
  colors: {
    background: {
      base: '#09090b',
      foreground: '#fafafa',
    },
    card: {
      base: '#1a1a1a',
      foreground: '#fafafa',
    },
    popover: {
      base: '#1a1a1a',
      foreground: '#fafafa',
    },
    primary: {
      base: '#0091ff',
      foreground: '#ffffff',
      hover: '#0081e5',
    },
    secondary: {
      base: '#27272a',
      foreground: '#fafafa',
      hover: '#3f3f46',
    },
    muted: {
      base: '#27272a',
      foreground: '#a1a1aa',
    },
    accent: {
      base: '#1e293b',
      foreground: '#fafafa',
    },
    destructive: {
      base: '#ef4444',
      foreground: '#fafafa',
      hover: '#dc2626',
    },
    success: {
      base: '#22c55e',
      foreground: '#fafafa',
    },
    warning: {
      base: '#f59e0b',
      foreground: '#fafafa',
    },
    info: {
      base: '#0ea5e9',
      foreground: '#fafafa',
    },
    border: '#27272a',
    input: '#27272a',
    ring: '#0091ff',
  },
  typography: {
    ...defaultGlobalTheme.typography,
  },
  spacing: defaultGlobalTheme.spacing,
  borderRadius: defaultGlobalTheme.borderRadius,
};

interface GlobalThemeProviderProps {
  children: React.ReactNode;
}

export const GlobalThemeProvider: React.FC<GlobalThemeProviderProps> = ({ children }) => {
  // State for dark mode
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  // State for system preference detection
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark' | null>(null);
  
  // User's appearance preference (system, light, or dark)
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'system'>(
    () => (localStorage.getItem('appearance') as 'light' | 'dark' | 'system') || 'system'
  );
  
  // Border radius preference
  const [radius, setRadius] = useState<number>(
    () => parseInt(localStorage.getItem('borderRadius') || '8', 10)
  );
  
  // Refs for style elements
  const lightStyleRef = useRef<HTMLStyleElement | null>(null);
  const darkStyleRef = useRef<HTMLStyleElement | null>(null);
  
  // Generate CSS based on color mode theme
  useEffect(() => {
    // Create style elements if they don't exist
    if (!lightStyleRef.current) {
      lightStyleRef.current = document.createElement('style');
      lightStyleRef.current.setAttribute('id', 'global-light-theme');
      document.head.appendChild(lightStyleRef.current);
    }
    
    if (!darkStyleRef.current) {
      darkStyleRef.current = document.createElement('style');
      darkStyleRef.current.setAttribute('id', 'global-dark-theme');
      document.head.appendChild(darkStyleRef.current);
    }
    
    // Generate CSS for each theme
    const lightThemeCSS = themeToCSS({
      ...defaultGlobalTheme,
      borderRadius: radius,
    });
    
    const darkThemeCSS = themeToCSS({
      ...darkModeTheme,
      borderRadius: radius,
    });
    
    // Apply CSS
    if (lightStyleRef.current) {
      lightStyleRef.current.textContent = lightThemeCSS;
    }
    
    if (darkStyleRef.current) {
      darkStyleRef.current.textContent = darkThemeCSS;
    }
    
    return () => {
      // Cleanup function
      if (lightStyleRef.current && document.head.contains(lightStyleRef.current)) {
        document.head.removeChild(lightStyleRef.current);
        lightStyleRef.current = null;
      }
      
      if (darkStyleRef.current && document.head.contains(darkStyleRef.current)) {
        document.head.removeChild(darkStyleRef.current);
        darkStyleRef.current = null;
      }
    };
  }, [radius]);
  
  // Detect system color scheme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial value
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');
    
    // Update when system preference changes
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  // Apply dark mode based on appearance setting and system preference
  useEffect(() => {
    let shouldUseDarkMode = false;
    
    if (appearance === 'system') {
      shouldUseDarkMode = systemPreference === 'dark';
    } else {
      shouldUseDarkMode = appearance === 'dark';
    }
    
    setDarkMode(shouldUseDarkMode);
    localStorage.setItem('appearance', appearance);
    
    // Add/remove dark class on document for tailwind
    if (shouldUseDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appearance, systemPreference]);
  
  // Store border radius preference
  useEffect(() => {
    localStorage.setItem('borderRadius', radius.toString());
  }, [radius]);
  
  // Get current theme based on mode
  const currentTheme = darkMode ? darkModeTheme : defaultGlobalTheme;
  
  // Provide the context
  return (
    <GlobalThemeContext.Provider
      value={{
        darkMode,
        setDarkMode: (dark) => setAppearance(dark ? 'dark' : 'light'),
        systemPreference,
        appearance,
        setAppearance,
        radius,
        setRadius,
        globalTokens: {
          ...currentTheme,
          borderRadius: radius,
        },
      }}
    >
      {children}
    </GlobalThemeContext.Provider>
  );
};