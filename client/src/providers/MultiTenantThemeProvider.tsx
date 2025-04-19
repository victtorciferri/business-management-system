import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define the context type
export interface BusinessThemeContextType {
  activeTheme: any | null;
  defaultTheme: any | null;
  businessThemes: any[];
  isLoading: boolean;
  applyTheme: (theme: any) => Promise<void>;
  setActiveTheme: (themeId: number) => Promise<void>;
  setDefaultTheme: (themeId: number) => Promise<void>;
  createTheme: (themeData: any) => Promise<any>;
  updateTheme: (themeId: number, themeData: any) => Promise<any>;
  deleteTheme: (themeId: number) => Promise<void>;
}

// Create the context with a default value
const BusinessThemeContext = createContext<BusinessThemeContextType>({
  activeTheme: null,
  defaultTheme: null,
  businessThemes: [],
  isLoading: true,
  applyTheme: async () => {},
  setActiveTheme: async () => {},
  setDefaultTheme: async () => {},
  createTheme: async () => ({}),
  updateTheme: async () => ({}),
  deleteTheme: async () => {},
});

// Provider component
export const MultiTenantThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTheme, setActiveThemeState] = useState<any | null>(null);
  const [defaultTheme, setDefaultThemeState] = useState<any | null>(null);
  const [businessThemes, setBusinessThemes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load themes for the current business
  useEffect(() => {
    // Fetch active theme from API
    const fetchThemes = async () => {
      try {
        // Fetch the active theme
        const activeThemeResponse = await fetch('/api/themes/active');
        if (!activeThemeResponse.ok) {
          console.error('Error fetching active theme:', activeThemeResponse);
          return;
        }
        const activeThemeData = await activeThemeResponse.json();
        setActiveThemeState(activeThemeData);
        
        // Fetch the default theme
        const defaultThemeResponse = await fetch('/api/themes/default');
        if (!defaultThemeResponse.ok) {
          console.error('Error fetching default theme:', defaultThemeResponse);
          return;
        }
        const defaultThemeData = await defaultThemeResponse.json();
        setDefaultThemeState(defaultThemeData);
        
        // Fetch all business themes
        const businessThemesResponse = await fetch('/api/themes');
        if (!businessThemesResponse.ok) {
          console.error('Error fetching business themes:', businessThemesResponse);
          return;
        }
        const businessThemesData = await businessThemesResponse.json();
        setBusinessThemes(businessThemesData);
      } catch (error) {
        console.error('Error loading themes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThemes();
  }, []);

  // Apply a theme
  const applyTheme = useCallback(async (theme: any) => {
    try {
      // Make API call to apply the theme
      const response = await fetch('/api/themes/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(theme),
      });

      if (!response.ok) {
        throw new Error('Failed to apply theme');
      }

      const updatedTheme = await response.json();
      setActiveThemeState(updatedTheme);
      
      toast({
        title: 'Theme Applied',
        description: 'The theme has been successfully applied.',
      });
    } catch (error) {
      console.error('Error applying theme:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply theme. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  // Set a theme as active
  const setActiveTheme = useCallback(async (themeId: number) => {
    try {
      const response = await fetch(`/api/themes/${themeId}/activate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to set active theme');
      }

      const updatedTheme = await response.json();
      setActiveThemeState(updatedTheme);
      
      toast({
        title: 'Theme Activated',
        description: 'The selected theme is now active.',
      });
    } catch (error) {
      console.error('Error setting active theme:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate theme. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Set a theme as default
  const setDefaultTheme = useCallback(async (themeId: number) => {
    try {
      const response = await fetch(`/api/themes/${themeId}/default`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to set default theme');
      }

      const updatedTheme = await response.json();
      setDefaultThemeState(updatedTheme);
      
      toast({
        title: 'Default Theme Updated',
        description: 'The selected theme is now the default theme.',
      });
    } catch (error) {
      console.error('Error setting default theme:', error);
      toast({
        title: 'Error',
        description: 'Failed to set default theme. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Create a new theme
  const createTheme = useCallback(async (themeData: any) => {
    try {
      const response = await fetch('/api/themes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(themeData),
      });

      if (!response.ok) {
        throw new Error('Failed to create theme');
      }

      const newTheme = await response.json();
      setBusinessThemes(prev => [...prev, newTheme]);
      
      toast({
        title: 'Theme Created',
        description: 'The new theme has been successfully created.',
      });
      
      return newTheme;
    } catch (error) {
      console.error('Error creating theme:', error);
      toast({
        title: 'Error',
        description: 'Failed to create theme. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  // Update a theme
  const updateTheme = useCallback(async (themeId: number, themeData: any) => {
    try {
      const response = await fetch(`/api/themes/${themeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(themeData),
      });

      if (!response.ok) {
        throw new Error('Failed to update theme');
      }

      const updatedTheme = await response.json();
      setBusinessThemes(prev => prev.map(theme => 
        theme.id === themeId ? updatedTheme : theme
      ));
      
      // Update active/default theme if needed
      if (activeTheme?.id === themeId) {
        setActiveThemeState(updatedTheme);
      }
      
      if (defaultTheme?.id === themeId) {
        setDefaultThemeState(updatedTheme);
      }
      
      toast({
        title: 'Theme Updated',
        description: 'The theme has been successfully updated.',
      });
      
      return updatedTheme;
    } catch (error) {
      console.error('Error updating theme:', error);
      toast({
        title: 'Error',
        description: 'Failed to update theme. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  }, [activeTheme, defaultTheme, toast]);

  // Delete a theme
  const deleteTheme = useCallback(async (themeId: number) => {
    try {
      const response = await fetch(`/api/themes/${themeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete theme');
      }

      setBusinessThemes(prev => prev.filter(theme => theme.id !== themeId));
      
      toast({
        title: 'Theme Deleted',
        description: 'The theme has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting theme:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete theme. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Provide the context value
  const contextValue = {
    activeTheme,
    defaultTheme,
    businessThemes,
    isLoading,
    applyTheme,
    setActiveTheme,
    setDefaultTheme,
    createTheme,
    updateTheme,
    deleteTheme,
  };

  return (
    <BusinessThemeContext.Provider value={contextValue}>
      {children}
    </BusinessThemeContext.Provider>
  );
};

// Custom hook to use the context
export const useBusinessTheme = () => useContext(BusinessThemeContext);