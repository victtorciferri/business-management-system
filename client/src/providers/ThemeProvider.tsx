import React from 'react';
import { MultiTenantThemeProvider } from './MultiTenantThemeProvider';

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <MultiTenantThemeProvider>
      {children}
    </MultiTenantThemeProvider>
  );
};