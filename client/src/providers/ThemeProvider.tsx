/**
 * Theme Provider - 2025 Edition
 * 
 * A React context provider that makes theme functionality available throughout the app.
 * This provider handles theme loading, application, and changing.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { Theme, ThemeSettings, DesignTokens, ThemeMode, ThemeVariant } from '../../../shared/designTokens';
import { useThemeVariables, getThemeCssUrl, applyThemeById } from '../hooks/use-theme-variables';
import { defaultThemes, systemDefaultTheme } from '../../../shared/defaultThemes';
import { deepMerge } from '../../../shared/tokenUtils';

/**
 * Theme context interface
 */
interface ThemeContextType {
  // Current theme state
  theme: Theme;
  isLoading: boolean;
  error: string | null;
  
  // Theme settings
  settings: ThemeSettings;
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
  
  // Theme mode
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  
  // Theme operations
  updateTheme: (updates: Partial<DesignTokens>) => void;
  resetTheme: () => void;
  changeTheme: (themeId: string) => Promise<void>;
  saveTheme: () => Promise<{ success: boolean; error?: string }>;
  saveThemeForBusiness: (businessId: number, theme: Theme) => Promise<{ success: boolean; error?: string }>;
  
  // Multi-tenant theme operations
  setBusinessTheme: (businessId: number | string) => Promise<void>;
  
  // Theme variables
  getVariable: (path: string, defaultValue?: string) => string;
  getVariableRef: (path: string, fallback?: string) => string;
  setVariable: (path: string, value: string) => void;
  generateStylesWithVariables: (tokenPaths: Record<string, string>) => React.CSSProperties;
  
  // Preview mode (for theme editor)
  isPreviewMode: boolean;
  setPreviewMode: (preview: boolean) => void;
  
  // Customization state
  hasUnsavedChanges: boolean;
  isSaving: boolean;
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType>({
  theme: systemDefaultTheme,
  isLoading: false,
  error: null,
  
  settings: {
    mode: 'system',
    variant: 'professional',
    animations: 'full',
    contrast: 'normal',
    fontSize: 1,
    reducedTransparency: false,
  },
  updateSettings: () => {},
  
  mode: 'system',
  setMode: () => {},
  toggleMode: () => {},
  
  updateTheme: () => {},
  resetTheme: () => {},
  changeTheme: async () => {},
  saveTheme: async () => ({ success: false, error: 'Not implemented' }),
  saveThemeForBusiness: async () => ({ success: false, error: 'Not implemented' }),
  
  setBusinessTheme: async () => {},
  
  getVariable: () => '',
  getVariableRef: () => '',
  setVariable: () => {},
  generateStylesWithVariables: () => ({}),
  
  isPreviewMode: false,
  setPreviewMode: () => {},
  
  hasUnsavedChanges: false,
  isSaving: false,
});

/**
 * Theme provider props
 */
interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Theme;
  initialSettings?: Partial<ThemeSettings>;
  useServerGeneratedCSS?: boolean;
  businessId?: number | string;
  storageKey?: string;
}

/**
 * Theme provider component
 */
export function ThemeProvider({
  children,
  initialTheme = systemDefaultTheme,
  initialSettings = {},
  useServerGeneratedCSS = false,
  businessId,
  storageKey = 'app-theme-settings',
}: ThemeProviderProps) {
  // Theme state
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [originalTheme, setOriginalTheme] = useState<Theme>(initialTheme);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Theme settings state
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    // Load settings from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const savedSettings = localStorage.getItem(storageKey);
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          return {
            mode: 'system',
            variant: 'professional',
            animations: 'full',
            contrast: 'normal',
            fontSize: 1,
            reducedTransparency: false,
            ...parsedSettings,
          };
        }
      } catch (err) {
        console.error('Error loading theme settings from localStorage:', err);
      }
    }
    
    // Fall back to default settings
    return {
      mode: 'system',
      variant: 'professional',
      animations: 'full',
      contrast: 'normal',
      fontSize: 1,
      reducedTransparency: false,
      ...initialSettings,
    };
  });
  
  // Preview mode for theme editor
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(theme) !== JSON.stringify(originalTheme);
  }, [theme, originalTheme]);
  
  // Use theme variables hook for CSS variable management
  const {
    getVariable,
    getVariableRef,
    setVariable,
    updateTheme: updateThemeVariables,
    generateStylesWithVariables,
  } = useThemeVariables(theme, {
    themeSettings: settings,
    useServerGeneratedCSS,
    themeId: theme.metadata.id,
    businessId,
  });
  
  // Update theme settings
  const updateSettings = useCallback((newSettings: Partial<ThemeSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
      
      return updated;
    });
  }, [storageKey]);
  
  // Set theme mode (light/dark/system)
  const setMode = useCallback((mode: ThemeMode) => {
    updateSettings({ mode });
    
    // Apply mode class to the root element
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('light-mode', 'dark-mode');
      if (mode !== 'system') {
        document.documentElement.classList.add(`${mode}-mode`);
      }
    }
  }, [updateSettings]);
  
  // Toggle between light/dark modes
  const toggleMode = useCallback(() => {
    setMode(settings.mode === 'dark' ? 'light' : 'dark');
  }, [settings.mode, setMode]);
  
  // Update theme tokens
  const updateTheme = useCallback((updates: Partial<DesignTokens>) => {
    setTheme(prev => ({
      ...prev,
      tokens: deepMerge(prev.tokens, updates),
    }));
    
    // Also update CSS variables
    updateThemeVariables(updates);
  }, [updateThemeVariables]);
  
  // Reset theme to original state
  const resetTheme = useCallback(() => {
    setTheme(originalTheme);
  }, [originalTheme]);
  
  // Change to a different theme
  const changeTheme = useCallback(async (themeId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Find the theme in default themes
      const newTheme = defaultThemes[themeId] || 
        Object.values(defaultThemes).find(t => t.metadata.id === themeId);
      
      if (!newTheme) {
        // If not found in defaults, try to load from API
        try {
          const response = await fetch(`/api/themes/defaults/${themeId}`);
          if (response.ok) {
            const data = await response.json();
            setTheme(data);
            setOriginalTheme(data);
          } else {
            throw new Error(`Theme ${themeId} not found`);
          }
        } catch (err) {
          console.error('Error loading theme:', err);
          setError(err instanceof Error ? err.message : 'Failed to load theme');
        }
      } else {
        // Use default theme
        setTheme(newTheme);
        setOriginalTheme(newTheme);
      }
    } catch (err) {
      console.error('Error changing theme:', err);
      setError(err instanceof Error ? err.message : 'Unknown error changing theme');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Save the current theme
  const saveTheme = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsSaving(true);
      
      // In a real app, this would save to the database
      // For now, we'll just update the original theme reference
      setOriginalTheme(theme);
      
      // Save to localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('saved-theme', JSON.stringify(theme));
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    } catch (err) {
      console.error('Error saving theme:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error saving theme' 
      };
    } finally {
      setIsSaving(false);
    }
  }, [theme]);
  
  // Save a theme for a specific business
  const saveThemeForBusiness = useCallback(async (
    businessId: number,
    businessTheme: Theme
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsSaving(true);
      
      // Make API request to save the theme
      const response = await fetch('/api/themes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          theme: businessTheme,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save theme: ${response.statusText}`);
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error saving business theme:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error saving theme' 
      };
    } finally {
      setIsSaving(false);
    }
  }, []);
  
  // Set theme for a specific business
  const setBusinessTheme = useCallback(async (businessId: number | string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (useServerGeneratedCSS) {
        // Apply using a link element referring to the API
        await applyThemeById(businessId, 'business');
      } else {
        // Fetch the theme data and apply it with useThemeVariables
        const response = await fetch(`/api/themes/business/${businessId}`);
        if (response.ok) {
          const data = await response.json();
          setTheme(data);
          setOriginalTheme(data);
        } else {
          throw new Error(`Failed to load theme for business ${businessId}`);
        }
      }
    } catch (err) {
      console.error('Error setting business theme:', err);
      setError(err instanceof Error ? err.message : 'Unknown error setting business theme');
    } finally {
      setIsLoading(false);
    }
  }, [useServerGeneratedCSS]);
  
  // Load saved theme on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('saved-theme');
        if (savedTheme) {
          const parsedTheme = JSON.parse(savedTheme);
          setTheme(parsedTheme);
          setOriginalTheme(parsedTheme);
        }
      } catch (err) {
        console.error('Error loading saved theme:', err);
      }
    }
  }, []);
  
  // Load business theme if business ID is provided
  useEffect(() => {
    if (businessId) {
      setBusinessTheme(businessId);
    }
  }, [businessId, setBusinessTheme]);
  
  // Context value
  const contextValue = useMemo<ThemeContextType>(() => ({
    theme,
    isLoading,
    error,
    
    settings,
    updateSettings,
    
    mode: settings.mode,
    setMode,
    toggleMode,
    
    updateTheme,
    resetTheme,
    changeTheme,
    saveTheme,
    saveThemeForBusiness,
    
    setBusinessTheme,
    
    getVariable,
    getVariableRef,
    setVariable,
    generateStylesWithVariables,
    
    isPreviewMode,
    setPreviewMode: setIsPreviewMode,
    
    hasUnsavedChanges,
    isSaving,
  }), [
    theme,
    isLoading,
    error,
    settings,
    updateSettings,
    setMode,
    toggleMode,
    updateTheme,
    resetTheme,
    changeTheme,
    saveTheme,
    saveThemeForBusiness,
    setBusinessTheme,
    getVariable,
    getVariableRef,
    setVariable,
    generateStylesWithVariables,
    isPreviewMode,
    setIsPreviewMode,
    hasUnsavedChanges,
    isSaving,
  ]);
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use the theme context
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

/**
 * A component that applies the current theme settings to its children
 * This is useful when you want to scope a theme to a specific part of the app
 */
export function ThemedSection({ 
  children,
  theme,
  scope,
}: { 
  children: React.ReactNode;
  theme?: Theme;
  scope?: string;
}) {
  // Get the theme from context if not provided
  const { theme: contextTheme } = useTheme();
  const themeToUse = theme || contextTheme;
  
  // Create a unique scope selector if not provided
  const scopeSelector = scope || `themed-section-${themeToUse.metadata.id}`;
  const scopeClass = scopeSelector.startsWith('.') ? scopeSelector.substring(1) : scopeSelector;
  
  // Apply the theme to this section
  useThemeVariables(themeToUse, {
    scope: `.${scopeClass}`,
  });
  
  return (
    <div className={scopeClass}>
      {children}
    </div>
  );
}

/**
 * Component to apply a specific theme only for its children
 * Useful for previewing a theme
 */
export function ThemePreview({ 
  children,
  theme,
  className,
}: { 
  children: React.ReactNode;
  theme: Theme;
  className?: string;
}) {
  // Generate a unique class name for this preview
  const previewClass = `theme-preview-${theme.metadata.id}`;
  
  // Apply the theme to this preview section
  useThemeVariables(theme, {
    scope: `.${previewClass}`,
  });
  
  return (
    <div className={`${previewClass} ${className || ''}`}>
      {children}
    </div>
  );
}