/**
 * ThemeProvider - 2025 Edition
 * 
 * The main theme provider that orchestrates the theme management system.
 * It wraps the GlobalThemeProvider and MultiTenantThemeProvider
 * and provides a unified interface for the theme system.
 */

import React from 'react';
import GlobalThemeProvider from './GlobalThemeProvider';
import { MultiTenantThemeProvider } from './MultiTenantThemeProvider';

interface ThemeProviderProps {
  children: React.ReactNode;
  businessId?: number;
  businessSlug?: string;
}

export function ThemeProvider({ 
  children, 
  businessId, 
  businessSlug 
}: ThemeProviderProps) {
  return (
    <GlobalThemeProvider>
      <MultiTenantThemeProvider 
        businessId={businessId}
        businessSlug={businessSlug}
      >
        {children}
      </MultiTenantThemeProvider>
    </GlobalThemeProvider>
  );
}