import { useContext } from 'react';
import { useGlobalTheme as useGlobalThemeProvider } from '@/providers/GlobalThemeProvider';

/**
 * Hook to access the global theme context
 * This is a wrapper around the GlobalThemeProvider's useGlobalTheme hook
 * to maintain backward compatibility with existing code.
 */
export function useGlobalTheme() {
  try {
    // Use the GlobalThemeProvider's useGlobalTheme hook
    const globalTheme = useGlobalThemeProvider();
    
    // Map the GlobalThemeProvider interface to our custom interface
    return {
      darkMode: globalTheme.resolvedColorMode === 'dark',
      appearance: globalTheme.colorMode,
      setAppearance: globalTheme.setColorMode,
      systemPreference: globalTheme.prefersDarkMode ? 'dark' : 'light'
    };
  } catch (e) {
    console.error('Failed to use GlobalThemeProvider:', e);
    throw new Error('Theme provider not properly configured');
  }
}