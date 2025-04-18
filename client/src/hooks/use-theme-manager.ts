/**
 * Theme Manager Hook - 2025 Edition
 * 
 * React hook for managing themes in the application
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  getAllThemes, 
  getActiveTheme, 
  getThemeById, 
  createTheme, 
  updateTheme, 
  deleteTheme, 
  activateTheme, 
  getThemesByBusinessSlug,
  ThemeRequest
} from '@/lib/themeApi';
import { DesignTokens } from '@shared/designTokens';
import { ThemeEntity } from '@shared/schema';
import { useCallback } from 'react';

export function useThemeManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for fetching all themes
  const {
    data: themes,
    isLoading: isLoadingThemes,
    isError: isThemesError,
    error: themesError,
    refetch: refetchThemes
  } = useQuery({
    queryKey: ['/api/themes'],
    queryFn: getAllThemes,
  });

  // Query for fetching the active theme
  const {
    data: activeTheme,
    isLoading: isLoadingActiveTheme,
    isError: isActiveThemeError,
    error: activeThemeError,
    refetch: refetchActiveTheme
  } = useQuery({
    queryKey: ['/api/themes/active'],
    queryFn: getActiveTheme,
  });

  // Function to fetch a theme by ID
  const fetchThemeById = useCallback((id: number) => {
    return getThemeById(id);
  }, []);

  // Mutation for creating a new theme
  const {
    mutate: createThemeMutation,
    isPending: isCreatingTheme,
    isError: isCreateThemeError,
    error: createThemeError
  } = useMutation({
    mutationFn: (themeData: ThemeRequest) => createTheme(themeData),
    onSuccess: (newTheme) => {
      // Invalidate themes query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/themes'] });
      toast({
        title: 'Theme created',
        description: `Theme "${newTheme.name}" has been created successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating theme',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  // Mutation for updating a theme
  const {
    mutate: updateThemeMutation,
    isPending: isUpdatingTheme,
    isError: isUpdateThemeError,
    error: updateThemeError
  } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ThemeRequest> }) => updateTheme(id, data),
    onSuccess: (updatedTheme) => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/themes'] });
      queryClient.invalidateQueries({ queryKey: [`/api/themes/${updatedTheme.id}`] });
      
      if (updatedTheme.isActive) {
        queryClient.invalidateQueries({ queryKey: ['/api/themes/active'] });
      }
      
      toast({
        title: 'Theme updated',
        description: `Theme "${updatedTheme.name}" has been updated successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating theme',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  // Mutation for deleting a theme
  const {
    mutate: deleteThemeMutation,
    isPending: isDeletingTheme,
    isError: isDeleteThemeError,
    error: deleteThemeError
  } = useMutation({
    mutationFn: (id: number) => deleteTheme(id),
    onSuccess: () => {
      // Invalidate themes query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/themes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/themes/active'] });
      
      toast({
        title: 'Theme deleted',
        description: 'The theme has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting theme',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  // Mutation for activating a theme
  const {
    mutate: activateThemeMutation,
    isPending: isActivatingTheme,
    isError: isActivateThemeError,
    error: activateThemeError
  } = useMutation({
    mutationFn: (id: number) => activateTheme(id),
    onSuccess: (activatedTheme) => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/themes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/themes/active'] });
      
      toast({
        title: 'Theme activated',
        description: `Theme "${activatedTheme.name}" is now active.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error activating theme',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  // Function to create a theme
  const createNewTheme = useCallback((themeData: ThemeRequest) => {
    createThemeMutation(themeData);
  }, [createThemeMutation]);

  // Function to update a theme
  const updateExistingTheme = useCallback((id: number, data: Partial<ThemeRequest>) => {
    updateThemeMutation({ id, data });
  }, [updateThemeMutation]);

  // Function to delete a theme
  const deleteExistingTheme = useCallback((id: number) => {
    deleteThemeMutation(id);
  }, [deleteThemeMutation]);

  // Function to activate a theme
  const activateExistingTheme = useCallback((id: number) => {
    activateThemeMutation(id);
  }, [activateThemeMutation]);

  // Function to fully update theme tokens
  const updateThemeTokens = useCallback((id: number, tokens: DesignTokens) => {
    updateThemeMutation({ id, data: { tokens } });
  }, [updateThemeMutation]);

  // Function to create/apply a quick theme from basic settings
  const applyQuickTheme = useCallback((theme: ThemeRequest) => {
    if (activeTheme) {
      // Update the active theme with the new settings
      updateThemeMutation({ 
        id: activeTheme.id, 
        data: {
          ...theme,
          isActive: true
        } 
      });
    } else {
      // Create a new theme and make it active
      createThemeMutation({
        ...theme,
        isActive: true,
        isDefault: themes?.length === 0 // Make it default if it's the only theme
      });
    }
  }, [activeTheme, themes, createThemeMutation, updateThemeMutation]);

  return {
    // Queries
    themes,
    isLoadingThemes,
    isThemesError,
    themesError,
    refetchThemes,
    activeTheme,
    isLoadingActiveTheme,
    isActiveThemeError,
    activeThemeError,
    refetchActiveTheme,
    fetchThemeById,

    // Mutations
    createTheme: createNewTheme,
    isCreatingTheme,
    isCreateThemeError,
    createThemeError,
    
    updateTheme: updateExistingTheme,
    isUpdatingTheme,
    isUpdateThemeError,
    updateThemeError,
    
    deleteTheme: deleteExistingTheme,
    isDeletingTheme,
    isDeleteThemeError,
    deleteThemeError,
    
    activateTheme: activateExistingTheme,
    isActivatingTheme,
    isActivateThemeError,
    activateThemeError,

    // Utility functions
    updateThemeTokens,
    applyQuickTheme,
  };
}