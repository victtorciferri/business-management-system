/**
 * Global Theme Provider - 2025 Edition
 * 
 * This provider manages global theme settings and coordinates between
 * the multi-tenant business themes and the global application theme.
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ThemeEntity } from "@shared/schema";
import { getActiveTheme } from "@/lib/themeApi";
import { applyTheme } from "@/lib/themeUtils";
import { MultiTenantThemeProvider } from "./MultiTenantThemeProvider";

type ThemeMode = 'light' | 'dark' | 'system';

interface GlobalThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  systemPreference: 'light' | 'dark';
  effectiveMode: 'light' | 'dark';
  globalTheme: ThemeEntity | null;
  isLoading: boolean;
}

const GlobalThemeContext = createContext<GlobalThemeContextType>({
  mode: 'system',
  setMode: () => {},
  systemPreference: 'light',
  effectiveMode: 'light',
  globalTheme: null,
  isLoading: true,
});

export const useGlobalTheme = () => useContext(GlobalThemeContext);

interface GlobalThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
  businessId?: number;
  businessSlug?: string;
}

export function GlobalThemeProvider({ 
  children, 
  initialMode = 'system',
  businessId,
  businessSlug
}: GlobalThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>(
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  );

  // Fetch the global theme (only when no business context is available)
  const { 
    data: globalTheme, 
    isLoading 
  } = useQuery({
    queryKey: ['/api/themes/global'],
    queryFn: () => getActiveTheme(),
    enabled: !businessId && !businessSlug,
  });

  // Update the system preference when it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Compute the effective mode based on the selected mode and system preference
  const effectiveMode = mode === 'system' ? systemPreference : mode;

  // Update the data-theme attribute when the effective mode changes
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', effectiveMode);
    document.documentElement.classList.toggle('dark', effectiveMode === 'dark');
    document.documentElement.classList.toggle('light', effectiveMode === 'light');

    // Store the mode preference in localStorage
    localStorage.setItem('theme-mode', mode);
  }, [effectiveMode, mode]);

  // Apply the global theme when it changes
  useEffect(() => {
    if (globalTheme && !businessId && !businessSlug) {
      applyTheme(globalTheme, 'global');
    }
  }, [globalTheme, businessId, businessSlug]);

  // If we have a business context, use the MultiTenantThemeProvider
  if (businessId || businessSlug) {
    return (
      <GlobalThemeContext.Provider
        value={{
          mode,
          setMode,
          systemPreference,
          effectiveMode,
          globalTheme: null,
          isLoading: false,
        }}
      >
        <MultiTenantThemeProvider businessId={businessId} businessSlug={businessSlug}>
          {children}
        </MultiTenantThemeProvider>
      </GlobalThemeContext.Provider>
    );
  }

  // Otherwise, use the global theme
  return (
    <GlobalThemeContext.Provider
      value={{
        mode,
        setMode,
        systemPreference,
        effectiveMode,
        globalTheme: globalTheme || null,
        isLoading,
      }}
    >
      <div className="theme-global">
        {children}
      </div>
    </GlobalThemeContext.Provider>
  );
}