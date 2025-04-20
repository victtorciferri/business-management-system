import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { ThemeEntity } from '@shared/schema';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { getAllThemes, getActiveTheme, createTheme, updateTheme, activateTheme, deleteTheme } from '@/lib/themeApi';
import { applyTheme } from '@/lib/themeUtils';

interface ThemeContextType {
  theme: Partial<ThemeEntity>;
  setTheme: (theme: Partial<ThemeEntity>) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  themes: ThemeEntity[];
  loadingThemes: boolean;
  applyTheme: (themeId: number) => Promise<void>;
  saveTheme: (theme: Partial<ThemeEntity>) => Promise<ThemeEntity | null>;
  deleteTheme: (themeId: number) => Promise<boolean>;
  createNewTheme: (theme: Partial<ThemeEntity>) => Promise<ThemeEntity | null>;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  businessId?: number;
  businessSlug?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  businessId,
  businessSlug
}) => {
  // State for the active theme
  const [theme, setThemeState] = useState<Partial<ThemeEntity>>({});
  const [themes, setThemes] = useState<ThemeEntity[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(true);
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useLocalStorage('darkMode', false);
  
  // Fetch themes on mount
  useEffect(() => {
    const fetchThemes = async () => {
      setLoadingThemes(true);
      try {
        let fetchedThemes: ThemeEntity[] = [];
        
        // Fetch business themes if id/slug provided, otherwise fetch all themes
        if (businessId || businessSlug) {
          const businessThemesPromise = businessId
            ? getAllThemes() // Replace with proper business themes API call when available
            : getAllThemes(); // Replace with proper business themes API call when available
          fetchedThemes = await businessThemesPromise;
        } else {
          fetchedThemes = await getAllThemes();
        }
        
        setThemes(fetchedThemes);
        
        // Get active theme
        const active = await getActiveTheme(businessId, businessSlug);
        if (active) {
          setThemeState(active);
          
          // Apply to document
          applyTheme(active);
        } else if (fetchedThemes.length > 0) {
          // Use first theme if no active theme
          setThemeState(fetchedThemes[0]);
          applyTheme(fetchedThemes[0]);
        }
      } catch (error) {
        console.error('Failed to load themes:', error);
      } finally {
        setLoadingThemes(false);
      }
    };
    
    fetchThemes();
  }, [businessId, businessSlug]);
  
  // Update the theme
  const setTheme = (newTheme: Partial<ThemeEntity>) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    
    // Apply dark mode class to document
    document.documentElement.classList.toggle('dark', !isDarkMode);
    
    // Update theme
    setTheme({
      ...theme,
      appearance: !isDarkMode ? 'dark' : 'light'
    });
  };
  
  // Apply a theme by ID
  const applyThemeById = async (themeId: number) => {
    const themeToApply = themes.find(t => t.id === themeId);
    if (themeToApply) {
      setTheme(themeToApply);
      
      // Activate on server if in a business context
      if (businessId) {
        try {
          await activateTheme(themeId);
        } catch (error) {
          console.error('Failed to activate theme on server:', error);
        }
      }
    }
  };
  
  // Save theme changes
  const saveTheme = async (updatedTheme: Partial<ThemeEntity>): Promise<ThemeEntity | null> => {
    if (!updatedTheme.id) {
      return null;
    }
    
    try {
      const saved = await updateTheme(updatedTheme.id, updatedTheme);
      
      if (saved) {
        // Update themes list
        setThemes(prevThemes => prevThemes.map(t => 
          t.id === saved.id ? { ...t, ...saved } : t
        ));
        
        // Update current theme if it's the active one
        if (theme.id === saved.id) {
          setTheme(saved);
        }
        
        return saved;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to save theme:', error);
      return null;
    }
  };
  
  // Delete a theme
  const removeTheme = async (themeId: number): Promise<boolean> => {
    try {
      const success = await deleteTheme(themeId);
      
      if (success) {
        // Remove from themes list
        setThemes(prevThemes => prevThemes.filter(t => t.id !== themeId));
        
        // If active theme was deleted, switch to first available theme
        if (theme.id === themeId && themes.length > 1) {
          const newActiveTheme = themes.find(t => t.id !== themeId);
          if (newActiveTheme) {
            setTheme(newActiveTheme);
          }
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to delete theme:', error);
      return false;
    }
  };
  
  // Create a new theme
  const createNewTheme = async (newTheme: Partial<ThemeEntity>): Promise<ThemeEntity | null> => {
    try {
      const created = await createTheme(newTheme);
      
      if (created) {
        // Add to themes list
        setThemes(prevThemes => [...prevThemes, created]);
        return created;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to create theme:', error);
      return null;
    }
  };
  
  const value = {
    theme,
    setTheme,
    isDarkMode,
    toggleDarkMode,
    themes,
    loadingThemes,
    applyTheme: applyThemeById,
    saveTheme,
    deleteTheme: removeTheme,
    createNewTheme
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use the theme context
 * 
 * @returns Theme context
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}