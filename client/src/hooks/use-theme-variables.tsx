import { useState, useEffect, useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import { Theme } from '@shared/designTokens';
import { useLocalStorage } from './use-local-storage';
import { useMediaQuery } from './use-media-query';

/**
 * Theme variables used throughout the application
 */
export interface ThemeVars {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: number;
  variant: 'professional' | 'vibrant' | 'elegant' | 'minimal';
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
}

/**
 * Hook to access the current dark mode state and toggle it
 */
export function useDarkMode() {
  const prefersDarkScheme = useMediaQuery('(prefers-color-scheme: dark)');
  const [colorMode, setColorMode] = useLocalStorage('color-mode', 'system');
  const [isDarkMode, setIsDarkMode] = useState(
    colorMode === 'system' ? prefersDarkScheme : colorMode === 'dark'
  );

  useEffect(() => {
    // Set dark mode based on preference and system
    const newIsDarkMode = colorMode === 'system' ? prefersDarkScheme : colorMode === 'dark';
    setIsDarkMode(newIsDarkMode);
    
    // Apply dark mode class to document
    if (newIsDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [colorMode, prefersDarkScheme]);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      setColorMode('light');
    } else {
      setColorMode('dark');
    }
  };

  const setDarkMode = (isDark: boolean) => {
    setColorMode(isDark ? 'dark' : 'light');
  };

  return { isDarkMode, toggleDarkMode, setDarkMode, colorMode, setColorMode };
}

/**
 * Hook to access theme variables
 */
export function useThemeVars(): ThemeVars | null {
  const themeContext = useContext(ThemeContext);
  
  // Return default theme variables if no context is available
  if (!themeContext) {
    return {
      primaryColor: '#4f46e5',
      secondaryColor: '#9333EA',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      fontFamily: 'Inter, system-ui, sans-serif',
      borderRadius: 8,
      variant: 'professional',
      fontSize: 1,
      highContrast: false,
      reducedMotion: false
    };
  }
  
  const {
    theme,
  } = themeContext;
  
  // Constructed theme variables from the theme context
  return {
    primaryColor: theme.primaryColor || '#4f46e5',
    secondaryColor: theme.secondaryColor || '#9333EA',
    accentColor: theme.accentColor || '#f59e0b',
    backgroundColor: theme.backgroundColor || '#ffffff',
    textColor: theme.textColor || '#111827',
    fontFamily: theme.fontFamily || 'Inter, system-ui, sans-serif',
    borderRadius: theme.borderRadius || 8,
    variant: (theme.variant as any) || 'professional',
    fontSize: theme.fontSize || 1,
    highContrast: theme.highContrast || false,
    reducedMotion: theme.reducedMotion || false
  };
}

/**
 * Hook for accessing media query helpers
 */
export function useMediaQueries() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const prefersHighContrast = useMediaQuery('(prefers-contrast: more)');
  
  return {
    prefersReducedMotion,
    prefersHighContrast
  };
}