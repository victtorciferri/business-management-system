/**
 * Multi-Tenant Theme Provider - 2025 Edition
 * 
 * This provider is responsible for managing business-specific themes.
 * It handles:
 * 1. Loading themes specific to a business
 * 2. Providing theme selection and customization
 * 3. Applying business-specific themes with CSS isolation
 * 4. Creating and managing theme-specific CSS variables
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ThemeEntity } from "@shared/schema";
import { getBusinessThemes, getActiveTheme } from "@/lib/themeApi";
import { applyTheme } from "@/lib/themeUtils";
import { useGlobalTheme } from "./GlobalThemeProvider";

// Interface for the business theme context
interface BusinessThemeContextType {
  themes: ThemeEntity[];
  activeTheme: ThemeEntity | null;
  isLoading: boolean;
  themeClass: string;
  setActiveTheme: (themeId: number) => void;
}

// Default context values
const defaultBusinessThemeContext: BusinessThemeContextType = {
  themes: [],
  activeTheme: null,
  isLoading: true,
  themeClass: "",
  setActiveTheme: () => {},
};

// Create the context
const BusinessThemeContext = createContext<BusinessThemeContextType>(defaultBusinessThemeContext);

// Hook to use business theme in components
export const useBusinessTheme = () => useContext(BusinessThemeContext);

// Props for the MultiTenantThemeProvider
interface MultiTenantThemeProviderProps {
  children: React.ReactNode;
  businessId?: number;
  businessSlug?: string;
}

export function MultiTenantThemeProvider({
  children,
  businessId,
  businessSlug,
}: MultiTenantThemeProviderProps) {
  const [activeThemeId, setActiveThemeId] = useState<number | null>(null);
  const globalTheme = useGlobalTheme();
  
  // Generate a unique theme class for CSS isolation
  const businessIdentifier = businessSlug 
    ? businessSlug 
    : businessId 
      ? `business-${businessId}` 
      : 'default';
  const themeClass = `theme-${businessIdentifier}`;
  
  // Fetch all themes for this business
  const { 
    data: themes = [], 
    isLoading: isLoadingThemes,
  } = useQuery({
    queryKey: ['/api/themes', businessId || businessSlug],
    queryFn: () => businessId 
      ? getBusinessThemes(businessId) 
      : (businessSlug ? getBusinessThemes(undefined, businessSlug) : Promise.resolve([])),
    enabled: !!businessId || !!businessSlug,
  });
  
  // Fetch the active theme
  const {
    data: initialActiveTheme,
    isLoading: isLoadingActiveTheme,
  } = useQuery({
    queryKey: ['/api/themes/active', businessId || businessSlug],
    queryFn: () => businessId 
      ? getActiveTheme(businessId)
      : (businessSlug ? getActiveTheme(undefined, businessSlug) : Promise.resolve(null)),
    enabled: !!businessId || !!businessSlug,
  });
  
  // Set the initial active theme when it loads
  useEffect(() => {
    if (initialActiveTheme && !activeThemeId) {
      setActiveThemeId(initialActiveTheme.id);
    }
  }, [initialActiveTheme, activeThemeId]);
  
  // Find the current active theme
  const activeTheme = themes.find((theme: ThemeEntity) => theme.id === activeThemeId) || initialActiveTheme || null;
  
  // Apply the active theme when it changes
  useEffect(() => {
    if (activeTheme && (businessId || businessSlug)) {
      applyTheme(activeTheme, businessIdentifier);
    }
  }, [activeTheme, businessId, businessSlug, businessIdentifier]);
  
  // Function to set a new active theme
  const handleSetActiveTheme = (themeId: number) => {
    setActiveThemeId(themeId);
  };
  
  // Check if we're still loading themes
  const isLoading = isLoadingThemes || isLoadingActiveTheme;
  
  return (
    <BusinessThemeContext.Provider
      value={{
        themes,
        activeTheme,
        isLoading,
        themeClass,
        setActiveTheme: handleSetActiveTheme,
      }}
    >
      <div className={themeClass}>
        {children}
      </div>
    </BusinessThemeContext.Provider>
  );
}