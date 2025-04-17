import React, { createContext, useState, useContext, useEffect } from 'react';
import type { Theme } from '../types/theme';
import { defaultTheme } from '../types/theme';
import { applyTheme } from '../utils/applyTheme';

interface ThemeContextType {
  theme: Theme;
  updateTheme: (newTheme: Partial<Theme>) => void;
  resetTheme: () => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  updateTheme: () => {},
  resetTheme: () => {}
});

// Provider component
export function ThemeProvider({ 
  children,
  initialTheme
}: { 
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme || defaultTheme);
  
  // Apply theme when it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
  
  // Apply initial theme
  useEffect(() => {
    if (initialTheme) {
      setTheme(initialTheme);
    }
  }, [initialTheme]);
  
  // Update theme with partial changes
  const updateTheme = (newTheme: Partial<Theme>) => {
    setTheme((prevTheme) => ({
      ...prevTheme,
      ...newTheme
    }));
  };
  
  // Reset to default theme
  const resetTheme = () => {
    setTheme(initialTheme || defaultTheme);
  };
  
  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        updateTheme,
        resetTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}