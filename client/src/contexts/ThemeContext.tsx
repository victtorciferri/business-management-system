import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Theme, defaultTheme, mergeWithDefaults } from '@shared/config';
import { useToast } from '@/hooks/use-toast';

interface ThemeContextType {
  theme: Theme;
  updateTheme: (updates: Partial<Theme>) => void;
  saveTheme: () => Promise<void>;
  resetTheme: () => void;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isPreviewMode: boolean;
  setPreviewMode: (mode: boolean) => void;
  
  // Theme utility functions
  getPrimaryColor: () => string;
  getTextColor: () => string;
  getBackgroundColor: () => string;
  getButtonClass: () => string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  initialTheme?: Partial<Theme>;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  initialTheme, 
  children 
}) => {
  const { toast } = useToast();
  
  // Convert partial theme to full theme with defaults
  const fullInitialTheme = initialTheme 
    ? mergeWithDefaults(initialTheme) 
    : defaultTheme;
  
  const [theme, setTheme] = useState<Theme>(fullInitialTheme);
  const [originalTheme, setOriginalTheme] = useState<Theme>(fullInitialTheme);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Detect system preference for dark mode on initial load
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedMode = localStorage.getItem('theme-mode');
    if (storedMode) {
      setIsDarkMode(storedMode === 'dark');
    } else {
      setIsDarkMode(prefersDark);
    }
  }, []);
  
  // Update theme when initialTheme changes
  useEffect(() => {
    if (initialTheme) {
      const newTheme = mergeWithDefaults(initialTheme);
      setTheme(newTheme);
      setOriginalTheme(newTheme);
    }
  }, [initialTheme]);
  
  // Update theme with partial changes
  const updateTheme = useCallback((updates: Partial<Theme>) => {
    setTheme(prevTheme => ({ ...prevTheme, ...updates }));
  }, []);
  
  // Reset theme to original state
  const resetTheme = useCallback(() => {
    setTheme(originalTheme);
    toast({
      title: "Theme reset",
      description: "Your changes have been discarded and the theme has been reset.",
    });
  }, [originalTheme, toast]);
  
  // Save theme changes
  const saveTheme = useCallback(async () => {
    try {
      setIsSaving(true);
      
      // Simulate network delay
      // You would replace this with an actual API call to save the theme
      const response = await fetch('/api/business/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save theme');
      }
      
      // Update the original theme to match the current theme
      setOriginalTheme(theme);
      
      toast({
        title: "Theme saved",
        description: "Your theme has been saved successfully.",
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error saving theme:', error);
      toast({
        title: "Error saving theme",
        description: "There was a problem saving your theme. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [theme, toast]);
  
  // Track if there are unsaved changes
  const hasUnsavedChanges = JSON.stringify(theme) !== JSON.stringify(originalTheme);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('theme-mode', newMode ? 'dark' : 'light');
      return newMode;
    });
  }, []);

  // Theme utility functions
  const getPrimaryColor = useCallback(() => {
    return `text-${theme.primaryColor}-600`;
  }, [theme.primaryColor]);

  const getTextColor = useCallback(() => {
    return 'text-gray-800';
  }, []);

  const getBackgroundColor = useCallback(() => {
    return `bg-${theme.backgroundColor || 'white'}`;
  }, [theme.backgroundColor]);

  const getButtonClass = useCallback(() => {
    return `bg-${theme.primaryColor}-600 hover:bg-${theme.primaryColor}-700 text-white`;
  }, [theme.primaryColor]);
  
  const value = {
    theme,
    updateTheme,
    saveTheme,
    resetTheme,
    hasUnsavedChanges,
    isSaving,
    isPreviewMode,
    setPreviewMode: setIsPreviewMode,
    
    // Theme utility functions
    getPrimaryColor,
    getTextColor,
    getBackgroundColor,
    getButtonClass,
    isDarkMode,
    toggleDarkMode
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};