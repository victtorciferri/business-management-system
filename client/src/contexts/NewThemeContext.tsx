/**
 * New Theme Context Integration
 * 
 * This file integrates the new theme system with the old ThemeContext interface.
 * It allows for a gradual migration without breaking existing components.
 */

import React from 'react';
import { LegacyThemeAdapter, LegacyThemeContext, useLegacyTheme } from '../components/theme/LegacyThemeAdapter';
import { RootThemeProvider } from '../components/theme/RootThemeProvider';
import { Theme as OldTheme } from '@shared/config';

// Re-export the old context and hook for backward compatibility
export const ThemeContext = LegacyThemeContext;
export const useTheme = useLegacyTheme;

// Export the new ThemeProvider with the old interface
export const ThemeProvider: React.FC<{ initialTheme?: Partial<OldTheme>; children: React.ReactNode }> = ({
  initialTheme,
  children,
}) => {
  // Pass the legacy theme to our root provider that handles the conversion
  return (
    <RootThemeProvider initialLegacyTheme={initialTheme}>
      {children}
    </RootThemeProvider>
  );
};

// The following exports are for advanced usage scenarios

/**
 * Modern theme provider without legacy compatibility layer
 * Use this for new components that are built with the new theme system
 */
export const ModernThemeProvider = RootThemeProvider;

/**
 * Component to wrap legacy components with the new theme system
 */
export function WithLegacyCompatibility({ children }: { children: React.ReactNode }) {
  return <LegacyThemeAdapter>{children}</LegacyThemeAdapter>;
}