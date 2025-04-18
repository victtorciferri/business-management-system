/**
 * Theme Provider - 2025 Edition
 * 
 * A comprehensive provider for our updated theme system.
 * Serves as the central hub for theme tokens, variables, and utilities.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

// Import a mocked default theme since we're in the initial development phase
const mockSystemDefaultTheme = {
  tokens: {
    colors: {
      primary: {
        DEFAULT: '#4f46e5',
        light: '#e0e7ff',
        dark: '#3730a3',
        foreground: '#ffffff',
        hover: '#4338ca'
      },
      secondary: {
        DEFAULT: '#f3f4f6',
        light: '#f9fafb',
        dark: '#d1d5db',
        foreground: '#1f2937',
        hover: '#e5e7eb'
      },
      background: {
        DEFAULT: '#ffffff',
        surface: '#ffffff',
        elevated: '#f9fafb',
        sunken: '#f3f4f6'
      },
      foreground: {
        DEFAULT: '#1f2937',
        muted: '#6b7280',
        subtle: '#9ca3af'
      },
      border: '#e5e7eb',
      focus: 'rgba(79, 70, 229, 0.4)',
      destructive: {
        DEFAULT: '#ef4444',
        foreground: '#ffffff',
        light: '#fee2e2'
      },
      success: {
        DEFAULT: '#10b981',
        foreground: '#ffffff',
        light: '#ecfdf5'
      },
      warning: {
        DEFAULT: '#f59e0b',
        foreground: '#ffffff',
        light: '#fffbeb'
      },
      info: {
        DEFAULT: '#3b82f6',
        foreground: '#ffffff',
        light: '#eff6ff'
      }
    },
    typography: {
      fontFamily: {
        sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
        mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        display: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem',
        DEFAULT: '1rem'
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
        DEFAULT: '400'
      },
      lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
        DEFAULT: '1.5'
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
        DEFAULT: '0em'
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '2.5rem',
      '3xl': '3rem',
      '4xl': '4rem',
      '5xl': '6rem',
      '6xl': '8rem',
      DEFAULT: '1rem'
    },
    borders: {
      radius: {
        none: '0',
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
        DEFAULT: '0.25rem'
      },
      width: {
        DEFAULT: '1px',
        none: '0',
        thin: '1px',
        thick: '2px',
        heavy: '4px'
      },
      focus: {
        width: '2px',
        style: 'solid'
      }
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      colored: '0 4px 14px 0 var(--shadow-color, rgba(0, 0, 0, 0.1))'
    },
    effects: {
      transition: {
        fast: '100ms ease-in-out',
        normal: '150ms ease-in-out',
        slow: '300ms ease-in-out',
        DEFAULT: '150ms ease-in-out'
      },
      opacity: {
        0: '0',
        25: '0.25',
        50: '0.5',
        75: '0.75',
        100: '1',
        disabled: '0.5',
        hover: '0.8'
      }
    },
    components: {
      button: {},
      input: {},
      card: {},
      modal: {},
      toast: {},
      avatar: {}
    }
  },
  metadata: {
    id: 'theme_system_default',
    name: 'System Default',
    description: 'The default system theme with a professional design for general usage',
    variant: 'professional',
    primaryColor: '#4f46e5',
    baseColor: '#ffffff',
    secondaryColor: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '2.0.0',
    isDefault: true
  }
};

// Simple types for the theme system based on what our components need
interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  variant: 'professional' | 'vibrant' | 'minimal' | 'elegant';
  animations: 'full' | 'reduced' | 'none';
  contrast: 'normal' | 'high' | 'low';
  fontSize: number;
  reducedTransparency: boolean;
}

interface Theme {
  tokens: any;
  metadata: any;
}

// Simple functions for now
function getInitialColorScheme(mode: string): string {
  if (mode === 'light' || mode === 'dark') {
    return mode;
  }
  
  // For 'system', check user's preference
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  
  // Default to light if we can't determine
  return 'light';
}

// Generate CSS variables from a token object
function generateThemeVariables(tokens: any): Record<string, string> {
  const variables: Record<string, string> = {};
  
  // Helper function to recursively process token objects
  const processTokens = (obj: any, prefix: string = '') => {
    if (!obj || typeof obj !== 'object') return;
    
    Object.entries(obj).forEach(([key, value]) => {
      const varName = prefix ? `--${prefix}-${key}` : `--${key}`;
      
      if (value && typeof value === 'object') {
        // Recurse for nested objects
        processTokens(value, prefix ? `${prefix}-${key}` : key);
        
        // Add the object's DEFAULT value if it exists
        if ('DEFAULT' in value && typeof value.DEFAULT === 'string') {
          variables[varName] = value.DEFAULT;
        }
      } else if (typeof value === 'string' || typeof value === 'number') {
        // Add leaf node values directly
        variables[varName] = String(value);
      }
    });
  };
  
  // Process each token category
  for (const category in tokens) {
    processTokens(tokens[category], category);
  }
  
  return variables;
}

/**
 * Interface for the ThemeContext
 */
interface ThemeContextValue {
  // Core theme state
  theme: Theme;
  settings: ThemeSettings;
  
  // Theme change methods
  setTheme: (theme: Theme) => void;
  updateTheme: (updates: Partial<Theme>) => void;
  updateSettings: (updates: Partial<ThemeSettings>) => void;
  
  // Variable access methods
  getVariable: (path: string, fallback?: string) => string;
  getVariableRef: (path: string, fallback?: string) => string;
  generateStylesWithVariables: <T extends Record<string, string>>(mapping: T) => React.CSSProperties;
  
  // Theme API methods
  saveTheme: () => Promise<{success: boolean, error?: string}>;
  resetTheme: () => void;
  
  // Theme state flags
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isPreviewMode: boolean;
  setPreviewMode: (mode: boolean) => void;
}

// Create the context with a default undefined value
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Properties for the ThemeProvider component
 */
interface ThemeProviderProps {
  initialTheme?: Theme;
  initialSettings?: Partial<ThemeSettings>;
  children: React.ReactNode;
}

// Default theme settings
const defaultSettings: ThemeSettings = {
  mode: 'system',
  variant: 'professional',
  animations: 'full',
  contrast: 'normal',
  fontSize: 1,
  reducedTransparency: false,
};

/**
 * Theme Provider Component
 * 
 * Provides access to the theme system throughout the application.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  initialTheme, 
  initialSettings,
  children 
}) => {
  // Initialize theme from props or use our mock system default
  const [theme, setThemeState] = useState<Theme>(initialTheme || mockSystemDefaultTheme);
  const [originalTheme, setOriginalTheme] = useState<Theme>(initialTheme || mockSystemDefaultTheme);
  
  // Initialize settings from props or use defaults
  const [settings, setSettings] = useState<ThemeSettings>({
    ...defaultSettings,
    ...initialSettings
  });
  
  // State flags
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  
  // Generate CSS variables from the theme
  const cssVariables = useMemo(() => {
    return generateThemeVariables(theme.tokens);
  }, [theme.tokens]);
  
  // Apply theme to the document on mount and when theme changes
  useEffect(() => {
    // Get root element to apply CSS variables
    const root = document.documentElement;
    
    // Apply all CSS variables
    Object.entries(cssVariables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Apply color scheme based on settings
    const colorScheme = getInitialColorScheme(settings.mode);
    document.documentElement.dataset.theme = colorScheme;
    
    console.log('ThemeProvider: Applied theme', theme.metadata.name, 'with mode', colorScheme);
  }, [theme, settings.mode, cssVariables]);
  
  // Theme change methods
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);
  
  const updateTheme = useCallback((updates: Partial<Theme>) => {
    setThemeState(prevTheme => ({
      ...prevTheme,
      ...updates,
      // Ensure tokens and metadata are properly merged
      tokens: { ...prevTheme.tokens, ...(updates.tokens || {}) },
      metadata: { ...prevTheme.metadata, ...(updates.metadata || {}) }
    }));
  }, []);
  
  const updateSettings = useCallback((updates: Partial<ThemeSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);
  
  // Variable access methods
  const getVariable = useCallback((path: string, fallback?: string): string => {
    try {
      // Split the path into parts and navigate through the tokens object
      const parts = path.split('.');
      let value: any = theme.tokens;
      
      for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
          value = value[part];
        } else {
          return fallback || '';
        }
      }
      
      return typeof value === 'string' ? value : fallback || '';
    } catch (error) {
      console.error('Error accessing theme variable', path, error);
      return fallback || '';
    }
  }, [theme.tokens]);
  
  const getVariableRef = useCallback((path: string, fallback?: string): string => {
    // Convert token path to CSS variable name
    const cssVarName = `--${path.replace(/\./g, '-')}`;
    return `var(${cssVarName}, ${fallback || ''})`;
  }, []);
  
  const generateStylesWithVariables = useCallback(<T extends Record<string, string>>(
    mapping: T
  ): React.CSSProperties => {
    const styles: Record<string, string> = {};
    
    for (const [cssProperty, path] of Object.entries(mapping)) {
      styles[cssProperty] = getVariableRef(path);
    }
    
    return styles as React.CSSProperties;
  }, [getVariableRef]);
  
  // Theme API methods
  const saveTheme = useCallback(async (): Promise<{success: boolean, error?: string}> => {
    try {
      setIsSaving(true);
      
      // Make API call to save the theme
      const response = await fetch('/api/themes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save theme');
      }
      
      // Update the original theme to match the current theme
      setOriginalTheme(theme);
      
      console.log('Theme saved successfully');
      return { success: true };
    } catch (error: any) {
      console.error('Error saving theme:', error);
      return { success: false, error: error.message };
    } finally {
      setIsSaving(false);
    }
  }, [theme]);
  
  const resetTheme = useCallback(() => {
    setThemeState(originalTheme);
  }, [originalTheme]);
  
  // Track if there are unsaved changes
  const hasUnsavedChanges = JSON.stringify(theme) !== JSON.stringify(originalTheme);
  
  // Create the context value object
  const contextValue = useMemo(() => ({
    theme,
    settings,
    setTheme,
    updateTheme,
    updateSettings,
    getVariable,
    getVariableRef,
    generateStylesWithVariables,
    saveTheme,
    resetTheme,
    hasUnsavedChanges,
    isSaving,
    isPreviewMode,
    setPreviewMode: setIsPreviewMode,
  }), [
    theme, 
    settings,
    setTheme,
    updateTheme, 
    updateSettings,
    getVariable,
    getVariableRef,
    generateStylesWithVariables,
    saveTheme,
    resetTheme,
    hasUnsavedChanges,
    isSaving,
    isPreviewMode,
    setIsPreviewMode
  ]);
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook for accessing the theme context
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * Hook for accessing a specific part of the theme
 */
export const useThemePart = <T,>(selector: (theme: Theme) => T): T => {
  const { theme } = useTheme();
  return useMemo(() => selector(theme), [theme, selector]);
};

/**
 * Hook for accessing specific theme settings
 */
export const useThemeSettings = (): ThemeSettings & { updateSettings: (updates: Partial<ThemeSettings>) => void } => {
  const { settings, updateSettings } = useTheme();
  return { ...settings, updateSettings };
};