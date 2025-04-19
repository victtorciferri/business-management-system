/**
 * MultiTenantThemeProvider - 2025 Edition
 * 
 * This provider is responsible for loading and applying business-specific themes.
 * It offers theme context to child components with access to the active theme,
 * available themes, and theme switching functions.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeEntity } from '@shared/schema';
import { getActiveTheme, getBusinessThemes } from '@/lib/themeApi';
import { generateCSSVariables } from '@/lib/themeUtils';

// Business theme context type
export interface BusinessThemeContextType {
  themes: ThemeEntity[];
  activeTheme: ThemeEntity | null;
  isLoading: boolean;
  error: Error | null;
  activeThemeId: number | null;
  themeClasses: string;
  theme: any; // Theme token object for components to consume
  setActiveThemeId: (id: number) => void;
}

// Create the context with default values
const BusinessThemeContext = createContext<BusinessThemeContextType>({
  themes: [],
  activeTheme: null,
  isLoading: true,
  error: null,
  activeThemeId: null,
  themeClasses: '',
  theme: {},
  setActiveThemeId: () => {},
});

// Provider props
interface MultiTenantThemeProviderProps {
  children: React.ReactNode;
  businessId?: number;
  businessSlug?: string;
}

// Hook for consuming the business theme context
export const useBusinessTheme = () => useContext(BusinessThemeContext);

export function MultiTenantThemeProvider({
  children,
  businessId,
  businessSlug,
}: MultiTenantThemeProviderProps) {
  const [themes, setThemes] = useState<ThemeEntity[]>([]);
  const [activeTheme, setActiveTheme] = useState<ThemeEntity | null>(null);
  const [activeThemeId, setActiveThemeId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [styleElement, setStyleElement] = useState<HTMLStyleElement | null>(null);
  
  // Create a CSS class for the theme that includes the business identifier
  // This ensures CSS variable scoping for multi-tenant scenarios
  const businessIdentifier = businessId || businessSlug || 'global';
  const themeClass = `theme-${businessIdentifier}`;
  
  // Create CSS variables for the current theme
  const cssVariables = activeTheme 
    ? generateCSSVariables(activeTheme.tokens) 
    : '';
  
  // Load all available themes for this business
  useEffect(() => {
    const loadThemes = async () => {
      try {
        setIsLoading(true);
        const themes = await getBusinessThemes(businessId, businessSlug);
        setThemes(themes);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading themes:', err);
        setError(err instanceof Error ? err : new Error('Failed to load themes'));
        setIsLoading(false);
      }
    };
    
    loadThemes();
  }, [businessId, businessSlug]);
  
  // Load the active theme
  useEffect(() => {
    const loadActiveTheme = async () => {
      try {
        const theme = await getActiveTheme(businessId, businessSlug);
        setActiveTheme(theme);
        if (theme) {
          setActiveThemeId(theme.id);
        }
      } catch (err) {
        console.error('Error fetching active theme:', err);
      }
    };
    
    loadActiveTheme();
  }, [businessId, businessSlug]);
  
  // When activeThemeId changes, update the active theme
  useEffect(() => {
    if (!activeThemeId || themes.length === 0) return;
    
    const theme = themes.find(t => t.id === activeThemeId);
    if (theme) {
      setActiveTheme(theme);
    }
  }, [activeThemeId, themes]);
  
  // Inject CSS variables into the document when the theme changes
  useEffect(() => {
    if (!cssVariables) return;
    
    // Create a style element if it doesn't exist
    if (!styleElement) {
      const style = document.createElement('style');
      style.id = `theme-${businessIdentifier}-style`;
      document.head.appendChild(style);
      setStyleElement(style);
    }
    
    // Update the style element with the new CSS variables
    if (styleElement) {
      styleElement.textContent = `
        .${themeClass} {
          ${cssVariables}
        }
      `;
    }
    
    // Cleanup function to remove the style element
    return () => {
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, [cssVariables, businessIdentifier, styleElement, themeClass]);
  
  // Create contextual theme values for components to consume
  const themeContext: BusinessThemeContextType = {
    themes,
    activeTheme,
    isLoading,
    error,
    activeThemeId,
    themeClasses: themeClass,
    theme: activeTheme?.tokens || {},
    setActiveThemeId,
  };
  
  return (
    <BusinessThemeContext.Provider value={themeContext}>
      <div className={themeClass}>
        {children}
      </div>
    </BusinessThemeContext.Provider>
  );
}