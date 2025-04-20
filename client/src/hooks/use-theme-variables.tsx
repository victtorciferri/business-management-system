import { useContext, useMemo } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import { ThemeEntity } from '@shared/schema';
import { useLocalStorage } from './use-local-storage';

/**
 * Hook to access the current theme variables
 * This provides the theme variables for use in components
 */
export function useThemeVars() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useThemeVars must be used within a ThemeProvider');
  }
  
  const { theme } = context;
  
  // Memoize to prevent unnecessary recalculations
  return useMemo(() => {
    if (!theme) return null;
    
    // Convert theme properties to a usable object
    return {
      // Primary
      primary: theme.primaryColor || '#4f46e5',
      primaryColor: theme.primaryColor || '#4f46e5',
      primaryLight: shiftColor(theme.primaryColor || '#4f46e5', 0.2),
      primaryDark: shiftColor(theme.primaryColor || '#4f46e5', -0.2),
      
      // Secondary
      secondary: theme.secondaryColor || '#06b6d4',
      secondaryColor: theme.secondaryColor || '#06b6d4',
      secondaryLight: shiftColor(theme.secondaryColor || '#06b6d4', 0.2),
      secondaryDark: shiftColor(theme.secondaryColor || '#06b6d4', -0.2),
      
      // Background
      background: theme.backgroundColor || '#ffffff',
      backgroundColor: theme.backgroundColor || '#ffffff',
      backgroundLight: shiftColor(theme.backgroundColor || '#ffffff', 0.05),
      backgroundDark: shiftColor(theme.backgroundColor || '#ffffff', -0.05),
      
      // Text
      text: theme.textColor || '#111827',
      textColor: theme.textColor || '#111827',
      textLight: shiftColor(theme.textColor || '#111827', 0.3),
      textDark: shiftColor(theme.textColor || '#111827', -0.3),
      
      // Accent
      accent: theme.accentColor || '#8b5cf6',
      accentColor: theme.accentColor || '#8b5cf6',
      accentLight: shiftColor(theme.accentColor || '#8b5cf6', 0.2),
      accentDark: shiftColor(theme.accentColor || '#8b5cf6', -0.2),
      
      // Other theme properties
      fontFamily: theme.fontFamily || 'Inter, system-ui, sans-serif',
      borderRadius: theme.borderRadius || 8,
      variant: theme.variant || 'professional',
      appearance: theme.appearance || 'light',
      
      // Design tokens (if available)
      tokens: theme.tokens || null,
      
      // Accessibility features
      fontSize: theme.fontSize || 'md',
      highContrast: theme.highContrast || false,
      reducedMotion: theme.reducedMotion || false,
    };
  }, [theme]);
}

/**
 * Hook to access and toggle dark mode
 */
export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useLocalStorage('darkMode', false);
  const [prefersDarkMode, setPrefersDarkMode] = useLocalStorage('prefersDarkMode', 'system');
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    
    // Apply to document
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  const setDarkModePreference = (preference: 'light' | 'dark' | 'system') => {
    setPrefersDarkMode(preference);
    
    if (preference === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (preference === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      // System preference - check user's system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };
  
  return {
    isDarkMode,
    toggleDarkMode,
    preference: prefersDarkMode,
    setPreference: setDarkModePreference
  };
}

/**
 * Helper function to shift a color's luminance
 */
function shiftColor(color: string, amount: number): string {
  try {
    // Parse hex to rgb
    const r = parseInt(color.substring(1, 3), 16);
    const g = parseInt(color.substring(3, 5), 16);
    const b = parseInt(color.substring(5, 7), 16);
    
    // Shift values
    const newR = Math.max(0, Math.min(255, r + Math.round(r * amount)));
    const newG = Math.max(0, Math.min(255, g + Math.round(g * amount)));
    const newB = Math.max(0, Math.min(255, b + Math.round(b * amount)));
    
    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  } catch (e) {
    console.error('Failed to shift color:', e);
    return color;
  }
}