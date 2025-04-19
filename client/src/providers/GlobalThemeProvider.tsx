import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the context type
export interface GlobalThemeContextType {
  prefersDarkMode: boolean;
  colorMode: 'light' | 'dark' | 'system';
  setColorMode: (mode: 'light' | 'dark' | 'system') => void;
  resolvedColorMode: 'light' | 'dark';
}

// Create the context with a default value
const GlobalThemeContext = createContext<GlobalThemeContextType>({
  prefersDarkMode: false,
  colorMode: 'system',
  setColorMode: () => {},
  resolvedColorMode: 'light'
});

// Provider component
const GlobalThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check system preference
  const prefersDarkQuery = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-color-scheme: dark)') 
    : { matches: false };
  
  const [prefersDarkMode, setPrefersDarkMode] = useState<boolean>(prefersDarkQuery.matches);
  const [colorMode, setColorMode] = useState<'light' | 'dark' | 'system'>(
    () => {
      // Get from localStorage if available
      if (typeof window !== 'undefined') {
        const savedMode = localStorage.getItem('color-mode');
        return (savedMode as 'light' | 'dark' | 'system') || 'system';
      }
      return 'system';
    }
  );
  
  // Calculate the resolved color mode based on preference and settings
  const resolvedColorMode = colorMode === 'system' 
    ? prefersDarkMode ? 'dark' : 'light'
    : colorMode;

  // Save color mode preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('color-mode', colorMode);
    }
  }, [colorMode]);
  
  // Listen for changes in system preference
  useEffect(() => {
    const mqListener = (e: MediaQueryListEvent) => {
      setPrefersDarkMode(e.matches);
    };
    
    if (typeof window !== 'undefined') {
      prefersDarkQuery.addEventListener('change', mqListener);
      return () => prefersDarkQuery.removeEventListener('change', mqListener);
    }
  }, [prefersDarkQuery]);

  // Set the color mode on the document element for global CSS
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    if (resolvedColorMode === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [resolvedColorMode]);

  // Change color mode handler
  const handleColorModeChange = (mode: 'light' | 'dark' | 'system') => {
    setColorMode(mode);
  };

  // Provide the context value
  const contextValue = {
    prefersDarkMode,
    colorMode,
    setColorMode: handleColorModeChange,
    resolvedColorMode
  };

  return (
    <GlobalThemeContext.Provider value={contextValue}>
      {children}
    </GlobalThemeContext.Provider>
  );
};

// Custom hook to use the context
export const useGlobalTheme = () => useContext(GlobalThemeContext);

export default GlobalThemeProvider;