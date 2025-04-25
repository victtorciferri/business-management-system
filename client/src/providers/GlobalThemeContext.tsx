import { createContext } from 'react';
import { defaultGlobalTheme, GlobalTokens } from '@/lib/theme';

/**
 * Global theme context that provides theme state and functions
 * for the entire application.
 */
export interface GlobalThemeContextType {
  // Is dark mode enabled?
  darkMode: boolean;
  // Function to toggle dark mode
  setDarkMode: (value: boolean | ((prev: boolean) => boolean)) => void;
  // System preference for dark mode
  systemPreference: 'light' | 'dark' | null;
  // User's selected appearance
  appearance: 'light' | 'dark' | 'system';
  // Set appearance
  setAppearance: (appearance: 'light' | 'dark' | 'system') => void;
  // Border radius
  radius: number;
  // Set border radius
  setRadius: (radius: number) => void;
  // Global tokens
  globalTokens: GlobalTokens;
}

/**
 * Create the context with a default value that will be overridden
 * by the provider.
 */
export const GlobalThemeContext = createContext<GlobalThemeContextType>({
  darkMode: false,
  setDarkMode: () => {},
  systemPreference: null,
  appearance: 'system',
  setAppearance: () => {},
  radius: 8,
  setRadius: () => {},
  globalTokens: defaultGlobalTheme,
});