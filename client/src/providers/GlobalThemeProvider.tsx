/**
 * GlobalThemeProvider - 2025 Edition
 *
 * Provider component that manages global theme state including:
 * - Dark mode detection and toggles
 * - System preference detection
 * - Appearance preference management
 * - Border radius customization
 * - Global design tokens
 */

import React, { useState, useEffect } from 'react';
import { GlobalThemeContext, defaultGlobalTheme, GlobalTokens } from './GlobalThemeContext';
import { generateDarkTheme } from '@/lib/themeUtils';
import '../lib/colorModeTransition.css';

interface GlobalThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: GlobalTokens;
}

export default function GlobalThemeProvider({
  children,
  initialTheme = defaultGlobalTheme,
}: GlobalThemeProviderProps) {
  // Initialize dark mode based on system preference or saved value
  const getSavedDarkMode = (): boolean => {
    // Check for saved preference
    const savedAppearance = localStorage.getItem('theme-appearance');

    if (savedAppearance === 'dark') return true;
    if (savedAppearance === 'light') return false;

    // Check for system preference (default to system if not saved)
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  // State for dark mode
  const [darkMode, setDarkMode] = useState(getSavedDarkMode);

  // State for border radius
  const [radius, setRadius] = useState<number>(() => {
    const savedRadius = localStorage.getItem('theme-radius');
    return savedRadius ? parseInt(savedRadius, 10) : 8;
  });

  // State for appearance preference (light, dark, system)
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('theme-appearance') as 'light' | 'dark' | 'system') || 'system';
  });

  // State for system color scheme preference
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark' | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Generate a dark version of the theme
  const darkTheme = generateDarkTheme(initialTheme);

  // Theme tokens based on current mode
  const globalTokens = darkMode ? darkTheme : initialTheme;

  // Apply early dark mode before React hydration to prevent flash
  useEffect(() => {
    // Apply theme-loaded class to body for transition handling
    document.body.classList.add('theme-loaded');

    // Add script to document head
    const script = document.createElement('script');
    script.textContent = `
      (function() {
        try {
          // Detect saved preference or system preference
          const savedAppearance = localStorage.getItem('theme-appearance');
          const isDark = savedAppearance === 'dark' || 
            (savedAppearance !== 'light' && 
             window.matchMedia('(prefers-color-scheme: dark)').matches);
          
          // Apply dark or light class immediately
          if (isDark) {
            document.documentElement.classList.add('dark');
            console.log('Dark mode applied early in index.html for system preference');
          } else {
            document.documentElement.classList.remove('dark');
          }
        } catch (e) {
          console.error('Error in early dark mode detection:', e);
        }
      })();
    `;
    script.id = 'theme-early-detection';
    const existingScript = document.getElementById('theme-early-detection');
    if (!existingScript) {
      document.head.appendChild(script);
    }

    return () => {
      document.body.classList.remove('theme-loaded');
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
      
      // Update dark mode if appearance is set to 'system'
      if (appearance === 'system') {
        setDarkMode(e.matches);
      }
    };
    
    // Add event listener (with appropriate method based on browser support)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }
    
    // Set initial system preference
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');
    
    // Clean up
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [appearance]);

  // Sync dark mode with HTML classes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sync appearance changes with localStorage and dark mode
  useEffect(() => {
    // Save appearance preference
    localStorage.setItem('theme-appearance', appearance);
    
    // Update dark mode based on appearance setting
    if (appearance === 'dark') {
      setDarkMode(true);
    } else if (appearance === 'light') {
      setDarkMode(false);
    } else if (appearance === 'system') {
      setDarkMode(systemPreference === 'dark');
    }
  }, [appearance, systemPreference]);

  // Sync radius with localStorage
  useEffect(() => {
    localStorage.setItem('theme-radius', radius.toString());
    
    // Update CSS variable for radius
    document.documentElement.style.setProperty('--radius', `${radius}px`);
  }, [radius]);

  // Create an updated setAppearance that works with React's setState
  const handleSetAppearance = (value: React.SetStateAction<'light' | 'dark' | 'system'>) => {
    if (typeof value === 'function') {
      setAppearance(prev => value(prev));
    } else {
      setAppearance(value);
    }
  };

  return (
    <GlobalThemeContext.Provider
      value={{
        darkMode,
        setDarkMode,
        systemPreference,
        appearance,
        setAppearance: handleSetAppearance,
        radius,
        setRadius,
        globalTokens,
      }}
    >
      {children}
    </GlobalThemeContext.Provider>
  );
}