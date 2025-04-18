/**
 * Theme Variables Hook - 2025 Edition
 * 
 * A custom React hook for handling theme variables and their injection into the DOM.
 * This hook allows components to use and modify theme tokens easily.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { Theme, ThemeSettings, DesignTokens } from '../../../shared/designTokens';
import {
  injectThemeVariables,
  setCSSVariable,
  setCSSVariables,
  getCSSVariableValue,
  generateThemeCSS,
  getCSSVariable,
  applyThemeToRoot,
  extractCurrentTheme
} from '../utils/cssVariableGenerator';
import { deepMerge, applyThemeSettings } from '../../../shared/tokenUtils';
import { useMediaQuery } from './use-media-query';

export interface ThemeVariablesOptions {
  /** Scope selector to limit where theme variables are applied */
  scope?: string;
  
  /** Apply theme directly to the DOM instead of using a style tag */
  applyDirectly?: boolean;
  
  /** Auto-detect and apply dark mode based on system preference */
  respectSystemPreference?: boolean;
  
  /** Smooth transition durations between theme changes */
  transitionDuration?: string;
  
  /** User preferences/overrides for the theme */
  themeSettings?: Partial<ThemeSettings>;
  
  /** If true, loads the theme CSS from a server endpoint instead of generating it client-side */
  useServerGeneratedCSS?: boolean;
  
  /** The ID of the theme (used with useServerGeneratedCSS) */
  themeId?: string;
  
  /** Business ID for multi-tenant applications */
  businessId?: number | string;
}

/**
 * Custom hook for using theme variables in components
 * 
 * @param theme The theme object containing tokens
 * @param options Configuration for the hook
 * @returns Methods and state for working with the theme
 */
export function useThemeVariables(
  theme: Theme,
  options: ThemeVariablesOptions = {}
) {
  const {
    scope = ':root',
    applyDirectly = false,
    respectSystemPreference = true,
    transitionDuration = '0.3s',
    themeSettings,
    useServerGeneratedCSS = false,
    themeId,
    businessId,
  } = options;
  
  // Track whether theme has been applied to avoid multiple injections
  const [isThemeApplied, setIsThemeApplied] = useState(false);
  // Track any errors applying the theme
  const [error, setError] = useState<string | null>(null);
  // Reference to the style element (if created)
  const styleElementRef = useRef<HTMLStyleElement | null>(null);
  // Current applied theme reference
  const currentThemeRef = useRef(theme);
  
  // Detect system color preference if enabled
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  
  // Apply the theme to the DOM on mount and when the theme changes
  useEffect(() => {
    // Skip if the theme is already applied and hasn't changed
    if (isThemeApplied && theme === currentThemeRef.current) {
      return;
    }
    
    try {
      if (useServerGeneratedCSS) {
        // When using server-generated CSS, load it from the API
        loadServerGeneratedCSS();
      } else {
        // Apply the theme using client-side generation
        applyTheme();
      }
      
      // Update refs and state
      currentThemeRef.current = theme;
      setIsThemeApplied(true);
      setError(null);
    } catch (err) {
      console.error('Error applying theme:', err);
      setError(err instanceof Error ? err.message : 'Unknown error applying theme');
    }
  }, [theme, scope, applyDirectly, prefersDarkMode, themeSettings]);
  
  // Load CSS from the server endpoint
  const loadServerGeneratedCSS = useCallback(async () => {
    try {
      // Determine which endpoint to use based on provided options
      let url: string;
      
      if (themeId) {
        url = `/api/themes/${themeId}/css`;
      } else if (businessId) {
        url = `/api/themes/business/${businessId}/css`;
      } else {
        throw new Error('Either themeId or businessId must be provided when using server-generated CSS');
      }
      
      // Add cache-busting query param to avoid stale CSS
      const cacheBust = new Date().getTime();
      url = `${url}?_=${cacheBust}`;
      
      // Create or find link element
      const linkId = `theme-${themeId || businessId}`;
      let linkElement = document.getElementById(linkId) as HTMLLinkElement;
      
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.id = linkId;
        linkElement.rel = 'stylesheet';
        document.head.appendChild(linkElement);
      }
      
      // Set the href to load the CSS
      linkElement.href = url;
      
      // Add data attributes for debugging
      linkElement.setAttribute('data-theme-name', theme.metadata.name);
      
      // Set up a load listener to handle success
      return new Promise<void>((resolve, reject) => {
        linkElement.onload = () => {
          // Apply any client-side settings that can't be handled by the server
          applyClientSideSettings();
          resolve();
        };
        linkElement.onerror = () => reject(new Error('Failed to load theme CSS'));
      });
    } catch (err) {
      console.error('Error loading theme CSS from server:', err);
      throw err;
    }
  }, [themeId, businessId, theme.metadata.name]);
  
  // Apply the theme using client-side CSS generation
  const applyTheme = useCallback(() => {
    // Apply CSS transition for smooth theme changes
    if (transitionDuration && typeof document !== 'undefined') {
      const element = scope === ':root' 
        ? document.documentElement 
        : document.querySelector(scope) as HTMLElement | null;
        
      if (element && element instanceof HTMLElement) {
        element.style.transition = `background-color ${transitionDuration}, color ${transitionDuration}, border-color ${transitionDuration}, box-shadow ${transitionDuration}`;
        
        // Remove transition after it completes to avoid affecting other animations
        const timeoutId = setTimeout(() => {
          element.style.transition = '';
        }, parseFloat(transitionDuration) * 1000 + 50); // Add 50ms buffer
        
        return () => clearTimeout(timeoutId);
      }
    }
    
    // Apply theme settings if provided
    let themeToApply = theme;
    
    // Apply system preferences if enabled
    if (respectSystemPreference) {
      const systemSettings: Partial<ThemeSettings> = {
        mode: prefersDarkMode ? 'dark' : 'light',
        animations: prefersReducedMotion ? 'reduced' : 'full',
      };
      
      // Merge system preferences with user preferences
      const mergedSettings = {
        ...systemSettings,
        ...themeSettings,
      };
      
      // Apply settings to theme
      themeToApply = applyThemeSettings(theme, mergedSettings as ThemeSettings);
    } else if (themeSettings) {
      // Just apply user settings if system preferences are disabled
      themeToApply = applyThemeSettings(theme, themeSettings as ThemeSettings);
    }
    
    if (applyDirectly) {
      // Apply directly to DOM element style properties
      applyThemeToRoot(themeToApply);
    } else {
      // Apply via style element
      styleElementRef.current = injectThemeVariables(themeToApply, {
        selector: scope,
        dataAttributes: {
          'theme-id': themeToApply.metadata.id,
          'theme-name': themeToApply.metadata.name,
        },
      });
    }
  }, [theme, scope, applyDirectly, transitionDuration, prefersDarkMode, themeSettings, prefersReducedMotion]);
  
  // Apply any client-side settings that can't be handled by server-generated CSS
  const applyClientSideSettings = useCallback(() => {
    // Handle appearance mode
    if (themeSettings?.mode && themeSettings.mode !== 'system') {
      document.documentElement.classList.remove('light-mode', 'dark-mode');
      document.documentElement.classList.add(`${themeSettings.mode}-mode`);
    } else if (respectSystemPreference) {
      document.documentElement.classList.remove('light-mode', 'dark-mode');
      document.documentElement.classList.add(prefersDarkMode ? 'dark-mode' : 'light-mode');
    }
    
    // Handle reduced motion
    if (themeSettings?.animations === 'reduced' || prefersReducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
    
    // Handle contrast
    if (themeSettings?.contrast) {
      document.documentElement.classList.remove('contrast-high', 'contrast-maximum');
      if (themeSettings.contrast !== 'normal') {
        document.documentElement.classList.add(`contrast-${themeSettings.contrast}`);
      }
    }
  }, [themeSettings, prefersDarkMode, prefersReducedMotion, respectSystemPreference]);
  
  // Get the value of a CSS variable
  const getVariable = useCallback((path: string, defaultValue?: string): string => {
    return getCSSVariableValue(path.replace(/\./g, '-'));
  }, []);
  
  // Get a CSS variable reference to use in styles
  const getVariableRef = useCallback((path: string, fallback?: string): string => {
    return getCSSVariable(path, fallback);
  }, []);
  
  // Set a CSS variable value
  const setVariable = useCallback((path: string, value: string): void => {
    setCSSVariable(path.replace(/\./g, '-'), value);
  }, []);
  
  // Set multiple CSS variables at once
  const setVariables = useCallback((variables: Record<string, string>): void => {
    setCSSVariables(variables);
  }, []);
  
  // Update part of the theme (re-injects the theme with new values)
  const updateTheme = useCallback((updates: Partial<DesignTokens>): void => {
    const updatedTokens = deepMerge(theme.tokens, updates);
    const updatedTheme: Theme = {
      ...theme,
      tokens: updatedTokens,
    };
    
    // Re-apply theme
    try {
      if (applyDirectly) {
        applyThemeToRoot(updatedTheme);
      } else {
        injectThemeVariables(updatedTheme, { selector: scope });
      }
      currentThemeRef.current = updatedTheme;
    } catch (err) {
      console.error('Error updating theme:', err);
      setError(err instanceof Error ? err.message : 'Unknown error updating theme');
    }
  }, [theme, scope, applyDirectly]);
  
  // Generate a style object with variables for inline styles
  const generateStylesWithVariables = useCallback(
    (tokenPaths: Record<string, string>): React.CSSProperties => {
      const styles: Record<string, string> = {};
      
      for (const [cssProperty, tokenPath] of Object.entries(tokenPaths)) {
        styles[cssProperty] = getVariableRef(tokenPath);
      }
      
      return styles as React.CSSProperties;
    },
    [getVariableRef]
  );
  
  // Clean up theme elements on unmount
  useEffect(() => {
    return () => {
      if (styleElementRef.current && !applyDirectly) {
        // Only remove if this is the last instance using the theme
        // In a real app, you might want to use a ref counter
        styleElementRef.current.remove();
      }
    };
  }, [applyDirectly]);
  
  return {
    isThemeApplied,
    error,
    theme: currentThemeRef.current,
    getVariable,
    getVariableRef,
    setVariable,
    setVariables,
    updateTheme,
    generateStylesWithVariables,
    prefersDarkMode,
    prefersReducedMotion,
  };
}

/**
 * Hook to get the dark mode state and toggle functions
 * This is a convenience wrapper around useThemeVariables
 */
export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from system preference or saved state
    if (typeof window === 'undefined') return false;
    
    // Check for explicit class
    if (document.documentElement.classList.contains('dark-mode')) return true;
    if (document.documentElement.classList.contains('light-mode')) return false;
    
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('light-mode', 'dark-mode');
        document.documentElement.classList.add(newMode ? 'dark-mode' : 'light-mode');
        
        // Save preference to localStorage
        localStorage.setItem('theme-mode', newMode ? 'dark' : 'light');
      }
      return newMode;
    });
  }, []);
  
  // Set specific dark mode state
  const setDarkMode = useCallback((dark: boolean) => {
    setIsDarkMode(dark);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('light-mode', 'dark-mode');
      document.documentElement.classList.add(dark ? 'dark-mode' : 'light-mode');
      
      // Save preference to localStorage
      localStorage.setItem('theme-mode', dark ? 'dark' : 'light');
    }
  }, []);
  
  // Check system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Get stored preference
    const storedPreference = localStorage.getItem('theme-mode');
    
    // If there's a stored preference, use that instead of system
    if (storedPreference) {
      setDarkMode(storedPreference === 'dark');
    } else {
      // Otherwise follow system
      setDarkMode(mediaQuery.matches);
    }
    
    // Listen for system changes
    const handler = (e: MediaQueryListEvent) => {
      // Only update if no explicit preference is stored
      if (!localStorage.getItem('theme-mode')) {
        setDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [setDarkMode]);
  
  return { isDarkMode, toggleDarkMode, setDarkMode };
}

/**
 * Get a theme CSS URL for a specific theme
 * This is useful for server-generated CSS
 * 
 * @param themeId Theme ID or business ID
 * @param type 'theme' for theme ID, 'business' for business ID
 * @returns URL to the theme CSS
 */
export function getThemeCssUrl(themeId: string | number, type: 'theme' | 'business' = 'theme'): string {
  const baseUrl = type === 'theme' 
    ? `/api/themes/${themeId}/css` 
    : `/api/themes/business/${themeId}/css`;
  
  // Add cache busting
  return `${baseUrl}?_=${Date.now()}`;
}

/**
 * Apply a theme by ID by adding a link element to the head
 * 
 * @param themeId Theme ID to apply
 * @param type 'theme' for theme ID, 'business' for business ID
 * @returns Promise that resolves when the theme is loaded
 */
export function applyThemeById(themeId: string | number, type: 'theme' | 'business' = 'theme'): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create or find link element
    const linkId = `theme-${themeId}`;
    let linkElement = document.getElementById(linkId) as HTMLLinkElement;
    
    if (!linkElement) {
      linkElement = document.createElement('link');
      linkElement.id = linkId;
      linkElement.rel = 'stylesheet';
      document.head.appendChild(linkElement);
    }
    
    // Set event handlers
    linkElement.onload = () => resolve();
    linkElement.onerror = () => reject(new Error('Failed to load theme CSS'));
    
    // Set the href to trigger load
    linkElement.href = getThemeCssUrl(themeId, type);
  });
}