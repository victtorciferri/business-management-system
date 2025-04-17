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
  
  const value = {
    theme,
    updateTheme,
    saveTheme,
    resetTheme,
    hasUnsavedChanges,
    isSaving,
    isPreviewMode,
    setPreviewMode: setIsPreviewMode,
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