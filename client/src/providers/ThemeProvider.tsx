/**
 * Theme Provider - 2025 Edition
 * 
 * Main entry point for the theming system.
 * It detects the current business context and initializes the appropriate
 * theme provider (GlobalThemeProvider or MultiTenantThemeProvider).
 */

import React, { useEffect, useState } from "react";
import { GlobalThemeProvider } from "./GlobalThemeProvider";

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}

export function ThemeProvider({ children, initialMode = 'system' }: ThemeProviderProps) {
  const [businessId, setBusinessId] = useState<number | undefined>(undefined);
  const [businessSlug, setBusinessSlug] = useState<string | undefined>(undefined);

  // Extract business info from window.BUSINESS_DATA if available
  useEffect(() => {
    if (typeof window !== 'undefined' && window.BUSINESS_DATA) {
      const { business } = window.BUSINESS_DATA;
      if (business) {
        setBusinessId(business.id);
        setBusinessSlug(business.businessSlug || undefined);
      }
    }
  }, []);

  // Load the mode preference from localStorage if available
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('theme-mode') as ThemeMode | null;
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setMode(savedMode);
      }
    }
  }, []);

  // Return the GlobalThemeProvider with the detected business context
  return (
    <GlobalThemeProvider 
      initialMode={mode} 
      businessId={businessId} 
      businessSlug={businessSlug}
    >
      {children}
    </GlobalThemeProvider>
  );
}

// Define the window.BUSINESS_DATA interface for TypeScript
declare global {
  interface Window {
    BUSINESS_DATA?: {
      business?: {
        id: number;
        businessName: string;
        businessSlug?: string;
        [key: string]: any;
      };
      services?: any[];
      subPath?: string;
      [key: string]: any;
    };
  }
}