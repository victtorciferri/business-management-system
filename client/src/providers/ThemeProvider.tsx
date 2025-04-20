import React, { useState, useEffect, useMemo } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import { ThemeEntity } from '@shared/schema';
import { useDarkMode } from '@/hooks/use-theme-variables';
import { getAllThemes, updateTheme, activateTheme, deleteTheme as deleteThemeApi, createTheme } from '@/lib/themeApi';

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Partial<ThemeEntity>;
  businessId?: number;
  businessSlug?: string;
}

/**
 * Theme provider component for the application
 */
export function ThemeProvider({
  children,
  initialTheme,
  businessId,
  businessSlug
}: ThemeProviderProps): JSX.Element {
  // Dark mode state
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  // Theme state
  const [theme, setTheme] = useState<Partial<ThemeEntity>>(
    initialTheme || {
      name: 'Default Theme',
      primaryColor: '#4f46e5',
      secondaryColor: '#06b6d4',
      accentColor: '#f59e0b',
      textColor: '#111827',
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, system-ui, sans-serif',
      borderRadius: 8,
      appearance: 'system',
      variant: 'professional'
    }
  );
  
  // Available themes
  const [themes, setThemes] = useState<ThemeEntity[]>([]);
  const [loadingThemes, setLoadingThemes] = useState<boolean>(true);
  
  // Load themes on mount
  useEffect(() => {
    async function loadThemes() {
      try {
        setLoadingThemes(true);
        const fetchedThemes = await getAllThemes();
        setThemes(fetchedThemes);
      } catch (error) {
        console.error('Error loading themes:', error);
      } finally {
        setLoadingThemes(false);
      }
    }
    
    loadThemes();
  }, [businessId, businessSlug]);
  
  // Apply theme function
  const applyTheme = (themeId: number) => {
    const selectedTheme = themes.find(t => t.id === themeId);
    if (selectedTheme) {
      setTheme(selectedTheme);
    }
  };
  
  // Save theme function
  const saveTheme = async (updatedTheme: Partial<ThemeEntity>): Promise<ThemeEntity | null> => {
    try {
      if (!updatedTheme.id) {
        return null;
      }
      
      const savedTheme = await updateTheme(updatedTheme.id, updatedTheme);
      
      if (savedTheme) {
        // Update themes array
        setThemes(prevThemes => 
          prevThemes.map(t => (t.id === savedTheme.id ? savedTheme : t))
        );
        
        // If this is the active theme, update current theme
        if (theme.id === savedTheme.id) {
          setTheme(savedTheme);
        }
      }
      
      return savedTheme;
    } catch (error) {
      console.error('Error saving theme:', error);
      return null;
    }
  };
  
  // Delete theme function
  const deleteTheme = async (themeId: number): Promise<boolean> => {
    try {
      const success = await deleteThemeApi(themeId);
      
      if (success) {
        // Remove from themes array
        setThemes(prevThemes => prevThemes.filter(t => t.id !== themeId));
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting theme:', error);
      return false;
    }
  };
  
  // Create new theme function
  const createNewTheme = async (newTheme: Partial<ThemeEntity>): Promise<ThemeEntity | null> => {
    try {
      const createdTheme = await createTheme(newTheme);
      
      if (createdTheme) {
        // Add to themes array
        setThemes(prevThemes => [...prevThemes, createdTheme]);
      }
      
      return createdTheme;
    } catch (error) {
      console.error('Error creating theme:', error);
      return null;
    }
  };
  
  // Activate a theme
  const activateThemeById = async (themeId: number): Promise<void> => {
    try {
      const activatedTheme = await activateTheme(themeId);
      
      if (activatedTheme) {
        // Update theme
        setTheme(activatedTheme);
        
        // Update themes array
        setThemes(prevThemes => 
          prevThemes.map(t => ({
            ...t,
            isActive: t.id === activatedTheme.id
          }))
        );
      }
    } catch (error) {
      console.error('Error activating theme:', error);
    }
  };
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    theme,
    setTheme,
    isDarkMode,
    toggleDarkMode,
    themes,
    loadingThemes,
    applyTheme: activateThemeById,
    saveTheme,
    deleteTheme,
    createNewTheme
  }), [
    theme, 
    isDarkMode, 
    themes, 
    loadingThemes
  ]);
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}