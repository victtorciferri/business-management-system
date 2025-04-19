/**
 * useGlobalTheme Hook - 2025 Edition
 *
 * A hook for accessing the global theme context and its values
 */

import { useContext } from 'react';
import { GlobalThemeContext, GlobalTokens } from '@/providers/GlobalThemeContext';

/**
 * Hook to access the global theme context
 * @returns The global theme context values and methods
 */
export function useGlobalTheme() {
  const context = useContext(GlobalThemeContext);
  
  if (!context) {
    throw new Error('useGlobalTheme must be used within a GlobalThemeProvider');
  }
  
  return context;
}

/**
 * Hook to access only the theme tokens from the global theme context
 * @returns The global theme tokens
 */
export function useGlobalTokens(): GlobalTokens {
  const { globalTokens } = useGlobalTheme();
  return globalTokens;
}

/**
 * Hook to access and toggle dark mode
 * @returns Object with darkMode boolean and toggle function
 */
export function useDarkMode() {
  const { darkMode, setDarkMode } = useGlobalTheme();
  
  // Toggle function for ease of use
  const toggleDarkMode = () => setDarkMode(prev => !prev);
  
  return { darkMode, setDarkMode, toggleDarkMode };
}

/**
 * Hook to access and modify appearance preference (light, dark, system)
 * @returns Object with appearance value and setAppearance function
 */
export function useAppearance() {
  const { appearance, setAppearance, systemPreference } = useGlobalTheme();
  
  // Get the effective appearance (if set to system, returns the system preference)
  const effectiveAppearance = appearance === 'system' && systemPreference 
    ? systemPreference 
    : appearance;
  
  return { 
    appearance, 
    setAppearance, 
    systemPreference,
    effectiveAppearance 
  };
}

/**
 * Hook to access and modify border radius
 * @returns Object with radius value and setRadius function
 */
export function useBorderRadius() {
  const { radius, setRadius } = useGlobalTheme();
  
  // Convenience functions for adjustment
  const increaseRadius = (amount = 1) => setRadius(prev => prev + amount);
  const decreaseRadius = (amount = 1) => setRadius(prev => Math.max(0, prev - amount));
  const resetRadius = () => setRadius(8); // Reset to default radius
  
  return { 
    radius, 
    setRadius, 
    increaseRadius, 
    decreaseRadius,
    resetRadius
  };
}