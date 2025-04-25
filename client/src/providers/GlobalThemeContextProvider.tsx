import React, { useState, useEffect } from 'react';
import { GlobalThemeContext, GlobalTokens, defaultGlobalTheme } from './GlobalThemeContext';

interface GlobalThemeContextProviderProps {
  children: React.ReactNode;
}

/**
 * GlobalThemeContextProvider - 2025 Edition
 * 
 * Provider component for global theme context that properly manages:
 * - Dark mode state and system preference detection
 * - Theme appearance (light, dark, or system)
 * - Border radius customization
 * - Global design tokens
 */
export function GlobalThemeContextProvider({ children }: GlobalThemeContextProviderProps) {
  // Check system preference for dark mode
  const prefersDarkQuery: MediaQueryList | { matches: boolean } = typeof window !== 'undefined' && 'matchMedia' in window
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : { matches: false };
  
  // State for system preference
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark' | null>(
    prefersDarkQuery.matches ? 'dark' : 'light'
  );
  
  // State for the user's selected appearance
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'system'>(
    () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme-appearance');
        return (saved as 'light' | 'dark' | 'system') || 'system';
      }
      return 'system';
    }
  );
  
  // Calculated dark mode based on appearance setting and system preference
  const isDarkMode = appearance === 'system' 
    ? systemPreference === 'dark'
    : appearance === 'dark';
  
  // State for border radius
  const [radius, setRadius] = useState<number>(
    () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme-radius');
        return saved ? parseInt(saved, 10) : 8;
      }
      return 8;
    }
  );
  
  // Global tokens state (using default tokens for now)
  const globalTokens: GlobalTokens = defaultGlobalTheme;
  
  // Listen for changes in system preference
  useEffect(() => {
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      const handleChange = (e: MediaQueryListEvent) => {
        setSystemPreference(e.matches ? 'dark' : 'light');
      };
      
      // Modern browsers use addEventListener
      if ('addEventListener' in prefersDarkQuery) {
        prefersDarkQuery.addEventListener('change', handleChange);
        return () => prefersDarkQuery.removeEventListener('change', handleChange);
      }
      // Older browsers use addListener
      else if ('addListener' in prefersDarkQuery) {
        // @ts-ignore - For compatibility with older browsers
        prefersDarkQuery.addListener(handleChange);
        return () => {
          // @ts-ignore - For compatibility with older browsers
          prefersDarkQuery.removeListener(handleChange);
        };
      }
    }
  }, [prefersDarkQuery]);
  
  // Save appearance to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-appearance', appearance);
    }
  }, [appearance]);
  
  // Save radius to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-radius', radius.toString());
    }
  }, [radius]);
  
  // Apply dark mode to the HTML document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Log for debugging
      console.log(`Theme changed: ${isDarkMode ? 'dark' : 'light'} mode applied`);
    }
  }, [isDarkMode]);
  
  // Provide the context
  return (
    <GlobalThemeContext.Provider
      value={{
        darkMode: isDarkMode,
        setDarkMode: (value) => {
          if (typeof value === 'function') {
            const newValue = value(isDarkMode);
            setAppearance(newValue ? 'dark' : 'light');
          } else {
            setAppearance(value ? 'dark' : 'light');
          }
        },
        systemPreference,
        appearance,
        setAppearance,
        radius,
        setRadius,
        globalTokens
      }}
    >
      {children}
    </GlobalThemeContext.Provider>
  );
}

export default GlobalThemeContextProvider;