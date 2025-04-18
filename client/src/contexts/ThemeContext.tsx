import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Theme, defaultTheme, mergeWithDefaults } from '@shared/config';
import { useToast } from '@/hooks/use-toast';

interface ThemeContextType {
  theme: Theme;
  updateTheme: (updates: Partial<Theme>) => void;
  saveTheme: () => Promise<{success: boolean, error?: string}>;
  resetTheme: () => void;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isPreviewMode: boolean;
  setPreviewMode: (mode: boolean) => void;
  setTheme: (theme: Theme) => void;
  
  // Theme utility functions
  getPrimaryColor: () => string;
  getTextColor: () => string;
  getBackgroundColor: () => string;
  getButtonClass: () => string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Admin-specific functions
  saveThemeForBusiness?: (businessId: number, theme: Theme) => Promise<{success: boolean, error?: string}>;
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
    const shouldUseDarkMode = storedMode === 'dark' || (storedMode !== 'light' && prefersDark);
    
    // Update state
    setIsDarkMode(shouldUseDarkMode);
    
    // Also ensure HTML class is applied
    if (shouldUseDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    console.log('ThemeContext: Initial dark mode set to', shouldUseDarkMode ? 'dark' : 'light');
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
      
      // Make API call to save the theme - try authenticated route first
      let response = await fetch('/api/business/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme }),
        credentials: 'include' // This ensures cookies/session is sent with the request
      });
      
      // If authenticated route fails, try public API for the current business
      if (response.status === 401) {
        console.log('Authentication failed when saving theme, trying public endpoint');
        
        // Try to get business ID from window.BUSINESS_DATA
        let businessId;
        if (window.BUSINESS_DATA && window.BUSINESS_DATA.id) {
          businessId = window.BUSINESS_DATA.id;
        } else {
          // If no business ID is found, we can't proceed
          console.error('No business ID found in window.BUSINESS_DATA');
          throw new Error('Unable to save theme: No business ID found');
        }
        
        // Try public endpoint as fallback
        response = await fetch(`/api/public/theme/${businessId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ theme })
        });
      }
      
      // Get the response text regardless of the status
      const responseText = await response.text();
      let responseData;
      
      try {
        // Try to parse as JSON if possible
        responseData = JSON.parse(responseText);
      } catch (e) {
        // If it's not valid JSON, use the text as is
        responseData = { message: responseText };
      }
      
      if (!response.ok) {
        console.error(`Server error (${response.status}) when saving theme:`, responseData);
        throw new Error(responseData.message || 'Failed to save theme');
      }
      
      // Update the original theme to match the current theme
      setOriginalTheme(theme);
      
      toast({
        title: "Theme saved",
        description: "Your theme has been saved successfully.",
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error saving theme:', error);
      toast({
        title: "Error saving theme",
        description: error.message || "There was a problem saving your theme. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
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
      
      // Apply dark mode class to document
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
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
  
  // Admin-specific function to save a theme for a specific business
  const saveThemeForBusiness = useCallback(async (businessId: number, themeToSave: Theme): Promise<{success: boolean, error?: string}> => {
    try {
      setIsSaving(true);
      
      // First try the admin route with authentication
      let response = await fetch(`/api/admin/business/${businessId}/theme`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: themeToSave }),
        credentials: 'include'
      });
      
      // If admin route fails with 401, try the public endpoint
      if (response.status === 401) {
        console.log('Admin route authentication failed, trying public endpoint');
        response = await fetch(`/api/public/theme/${businessId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ theme: themeToSave })
        });
      }
      
      // Get the response text regardless of the status
      const responseText = await response.text();
      let responseData;
      
      try {
        // Try to parse as JSON if possible
        responseData = JSON.parse(responseText);
      } catch (e) {
        // If it's not valid JSON, use the text as is
        responseData = { message: responseText };
      }
      
      if (!response.ok) {
        console.error(`Server error (${response.status}) when saving theme for business ${businessId}:`, responseData);
        return {
          success: false,
          error: responseData.message || `Failed to save theme for business ${businessId}`
        };
      }
      
      toast({
        title: "Theme saved",
        description: `Business theme has been saved successfully.`,
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error saving theme for business:', error);
      return {
        success: false,
        error: error.message || "There was a problem saving the theme."
      };
    } finally {
      setIsSaving(false);
    }
  }, [toast]);
  
  const value = {
    theme,
    updateTheme,
    saveTheme,
    resetTheme,
    hasUnsavedChanges,
    isSaving,
    isPreviewMode,
    setPreviewMode: setIsPreviewMode,
    setTheme,
    
    // Theme utility functions
    getPrimaryColor,
    getTextColor,
    getBackgroundColor,
    getButtonClass,
    isDarkMode,
    toggleDarkMode,
    
    // Admin functions
    saveThemeForBusiness
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