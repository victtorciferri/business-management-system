import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';
import { ThemeEntity } from '@shared/schema';

/**
 * Hook for accessing and managing themes
 */
export function useThemeManager() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useThemeManager must be used within a ThemeProvider');
  }
  
  const {
    theme,
    setTheme,
    isDarkMode,
    toggleDarkMode,
    themes,
    loadingThemes,
    applyTheme,
    saveTheme,
    deleteTheme,
    createNewTheme
  } = context;
  
  /**
   * Get theme by ID
   */
  const getThemeById = (id: number) => {
    return themes.find(t => t.id === id);
  };
  
  /**
   * Get default theme
   */
  const getDefaultTheme = () => {
    return themes.find(t => t.isDefault);
  };
  
  /**
   * Get active theme
   */
  const getActiveTheme = () => {
    return themes.find(t => t.isActive);
  };
  
  /**
   * Apply a theme by object
   */
  const applyThemeObject = (themeObject: Partial<ThemeEntity>) => {
    setTheme(themeObject);
  };
  
  /**
   * Reset to default theme
   */
  const resetToDefaultTheme = () => {
    const defaultTheme = getDefaultTheme();
    if (defaultTheme) {
      setTheme(defaultTheme);
    }
  };
  
  return {
    // Current theme state
    currentTheme: theme,
    setCurrentTheme: setTheme,
    
    // Dark mode
    isDarkMode,
    toggleDarkMode,
    
    // Themes collection
    themes,
    isLoading: loadingThemes,
    
    // Theme operations
    getThemeById,
    getDefaultTheme,
    getActiveTheme,
    applyTheme,
    applyThemeObject,
    resetToDefaultTheme,
    saveTheme,
    deleteTheme,
    createNewTheme
  };
}