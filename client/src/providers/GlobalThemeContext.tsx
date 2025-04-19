import { createContext } from 'react';

// Global theme context type
export interface GlobalThemeContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  systemPreference: 'light' | 'dark' | null;
  appearance: 'light' | 'dark' | 'system';
  setAppearance: (value: 'light' | 'dark' | 'system') => void;
  radius: number;
  setRadius: (value: number) => void;
  globalTokens: any;
}

// Create the context with default values
export const GlobalThemeContext = createContext<GlobalThemeContextType>({
  darkMode: false,
  setDarkMode: () => {},
  systemPreference: null,
  appearance: 'system',
  setAppearance: () => {},
  radius: 8,
  setRadius: () => {},
  globalTokens: {},
});