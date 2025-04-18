/**
 * Root Theme Provider - 2025 Edition
 *
 * This is the root component that initializes the theme system.
 * It handles:
 * 1. Loading the initial theme
 * 2. Setting up the new theme provider
 * 3. Providing backward compatibility with the old theme system
 * 4. Detecting and applying business-specific themes
 */

import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '../../../providers/ThemeProvider';
import { LegacyThemeAdapter } from './LegacyThemeAdapter';
import { systemDefaultTheme } from '../../../../shared/defaultThemes';
import { Theme } from '../../../../shared/designTokens';
import { defaultTheme as legacyDefaultTheme } from '@shared/config';
import { convertToNewTheme } from './themeConverter';

// Define the props for the provider
interface RootThemeProviderProps {
  children: React.ReactNode;
  initialLegacyTheme?: any; // Type from old system
  businessId?: number | string;
}

export function RootThemeProvider({
  children,
  initialLegacyTheme,
  businessId,
}: RootThemeProviderProps) {
  // State for the theme
  const [initialTheme, setInitialTheme] = useState<Theme>(systemDefaultTheme);
  const [isLoading, setIsLoading] = useState<boolean>(!!businessId);

  // Handle initialization of theme
  useEffect(() => {
    const loadInitialTheme = async () => {
      try {
        // First, check if this is a business-specific view
        if (businessId) {
          try {
            // Try to load the business theme from the API
            const response = await fetch(`/api/themes/business/${businessId}`);
            if (response.ok) {
              const businessTheme = await response.json();
              setInitialTheme(businessTheme);
              return;
            }
          } catch (error) {
            console.error('Error loading business theme:', error);
            // Continue to fallbacks if business theme fails to load
          }
        }

        // Second, check if a legacy theme was provided
        if (initialLegacyTheme) {
          // Convert legacy theme to new format
          const convertedTheme = convertToNewTheme(
            initialLegacyTheme,
            systemDefaultTheme
          );
          setInitialTheme(convertedTheme);
          return;
        }

        // Third, try to load theme from localStorage
        const savedTheme = localStorage.getItem('theme-2025');
        if (savedTheme) {
          try {
            const parsedTheme = JSON.parse(savedTheme);
            setInitialTheme(parsedTheme);
            return;
          } catch (err) {
            console.error('Error parsing saved theme:', err);
            // Fall through to default
          }
        }

        // Finally, use the default theme
        setInitialTheme(systemDefaultTheme);
      } catch (error) {
        console.error('Error in theme initialization:', error);
        // Use default theme in case of any errors
        setInitialTheme(systemDefaultTheme);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialTheme();
  }, [businessId, initialLegacyTheme]);

  // Display a simple loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Loading theme...
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider initialTheme={initialTheme} businessId={businessId}>
      <LegacyThemeAdapter>{children}</LegacyThemeAdapter>
    </ThemeProvider>
  );
}

/**
 * Higher-order component to wrap any component with the root theme provider
 */
export function withRootTheme<T extends {}>(
  Component: React.ComponentType<T>,
  options?: Omit<RootThemeProviderProps, 'children'>
) {
  return function WithRootTheme(props: T) {
    return (
      <RootThemeProvider {...options}>
        <Component {...props} />
      </RootThemeProvider>
    );
  };
}