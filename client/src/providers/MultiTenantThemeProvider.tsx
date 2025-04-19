/**
 * Multi-Tenant Theme Provider - 2025 Edition
 * 
 * This provider loads and applies business-specific themes with proper isolation.
 * It uses CSS variables for proper isolation between different businesses.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ThemeEntity } from "@shared/schema";
import { DesignTokens } from "@shared/designTokens";
import { getThemesByBusinessSlug } from "@/lib/themeApi";
import { applyTheme, generateCssVariables } from "@/lib/themeUtils";

interface BusinessThemeContextType {
  businessId?: number;
  businessSlug?: string;
  activeTheme?: ThemeEntity | null;
  themes: ThemeEntity[];
  isLoading: boolean;
  error: Error | null;
  setActiveTheme: (theme: ThemeEntity) => void;
  cssVariables: string;
  themeClass: string;
}

const BusinessThemeContext = createContext<BusinessThemeContextType>({
  themes: [],
  isLoading: false,
  error: null,
  setActiveTheme: () => {},
  cssVariables: "",
  themeClass: "",
});

export const useBusinessTheme = () => useContext(BusinessThemeContext);

interface MultiTenantThemeProviderProps {
  businessId?: number;
  businessSlug?: string;
  children: React.ReactNode;
}

export function MultiTenantThemeProvider({ 
  businessId, 
  businessSlug, 
  children 
}: MultiTenantThemeProviderProps) {
  const [activeTheme, setActiveTheme] = useState<ThemeEntity | null>(null);
  const [cssVariables, setCssVariables] = useState<string>("");
  const [themeClass, setThemeClass] = useState<string>("");

  // Fetch themes for this business
  const { 
    data: themes = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: businessSlug ? [`/api/themes/business/${businessSlug}`] : [],
    queryFn: () => businessSlug ? getThemesByBusinessSlug(businessSlug) : Promise.resolve([]),
    enabled: !!businessSlug,
  });

  // Utility function to generate a CSS friendly class name from a business slug
  const generateThemeClass = (slug?: string): string => {
    if (!slug) return "theme-default";
    return `theme-${slug.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
  };

  // When themes or businessSlug changes, update the active theme
  useEffect(() => {
    if (!isLoading && themes.length > 0 && !activeTheme) {
      // Find the active theme, or fall back to the default theme or the first theme
      const active = themes.find(t => t.isActive) || 
                     themes.find(t => t.isDefault) || 
                     themes[0];
      
      if (active) {
        setActiveTheme(active);
      }
    }

    // Always update the theme class based on businessSlug
    setThemeClass(generateThemeClass(businessSlug));
  }, [themes, businessSlug, isLoading, activeTheme]);

  // Generate and apply CSS variables when the active theme changes
  useEffect(() => {
    if (activeTheme?.tokens) {
      const variables = generateCssVariables(activeTheme.tokens);
      setCssVariables(variables);

      // Apply the theme to the document
      if (businessSlug) {
        applyTheme(activeTheme, businessSlug);
      }
    }
  }, [activeTheme, businessSlug]);

  // Handle theme changes
  const handleSetActiveTheme = (theme: ThemeEntity) => {
    setActiveTheme(theme);
  };

  // When the theme changes, we need to apply data-theme attribute to allow shadcn to work
  useEffect(() => {
    if (activeTheme) {
      // Determine if this is a light or dark theme
      const isDarkTheme = activeTheme.textColor && 
        isColorDark(activeTheme.backgroundColor) && 
        isColorLight(activeTheme.textColor);
      
      // Set the data-theme attribute on the document element
      document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    }
  }, [activeTheme]);

  return (
    <BusinessThemeContext.Provider
      value={{
        businessId,
        businessSlug,
        activeTheme,
        themes,
        isLoading,
        error: error as Error | null,
        setActiveTheme: handleSetActiveTheme,
        cssVariables,
        themeClass,
      }}
    >
      <div className={themeClass} data-business-id={businessId} data-business-slug={businessSlug}>
        {/* Inject theme CSS variables */}
        {cssVariables && (
          <style dangerouslySetInnerHTML={{ __html: `.${themeClass} { ${cssVariables} }` }} />
        )}
        {children}
      </div>
    </BusinessThemeContext.Provider>
  );
}

// Helper function to determine if a color is dark
function isColorDark(hexColor?: string): boolean {
  if (!hexColor) return false;
  
  // Remove the hash if it exists
  hexColor = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  
  // Calculate brightness (YIQ formula)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return true if the color is dark (brightness < 128)
  return brightness < 128;
}

// Helper function to determine if a color is light
function isColorLight(hexColor?: string): boolean {
  return !isColorDark(hexColor);
}