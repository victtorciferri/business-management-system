/**
 * App Theme Provider
 * 
 * This component wraps the whole application with the theme provider
 * to make theme functionality available throughout all components.
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '../../../providers/ThemeProvider';
import { defaultThemes, systemDefaultTheme } from '../../../../shared/defaultThemes';
import { Theme } from '../../../../shared/designTokens';

interface AppThemeProviderProps {
  children: React.ReactNode;
  initialThemeId?: string;
  businessId?: number | string;
}

export function AppThemeProvider({ 
  children,
  initialThemeId,
  businessId,
}: AppThemeProviderProps) {
  const [initialTheme, setInitialTheme] = useState<Theme>(systemDefaultTheme);
  const [isLoading, setIsLoading] = useState<boolean>(!!initialThemeId || !!businessId);
  
  // Load initial theme
  useEffect(() => {
    const loadInitialTheme = async () => {
      try {
        if (businessId) {
          // If business ID is provided, try to load the business theme
          const response = await fetch(`/api/themes/business/${businessId}`);
          if (response.ok) {
            const theme = await response.json();
            setInitialTheme(theme);
          } else {
            // Fall back to default theme if business theme fails to load
            console.error(`Failed to load business theme: ${response.statusText}`);
            // Try to load from localStorage
            const savedTheme = localStorage.getItem('app-theme');
            if (savedTheme) {
              try {
                setInitialTheme(JSON.parse(savedTheme));
              } catch (e) {
                console.error('Failed to parse saved theme', e);
              }
            }
          }
        } else if (initialThemeId) {
          // If theme ID is provided, try to load it
          if (defaultThemes[initialThemeId]) {
            setInitialTheme(defaultThemes[initialThemeId]);
          } else {
            const response = await fetch(`/api/themes/${initialThemeId}`);
            if (response.ok) {
              const theme = await response.json();
              setInitialTheme(theme);
            } else {
              console.error(`Failed to load theme: ${response.statusText}`);
              // Try to load from localStorage
              const savedTheme = localStorage.getItem('app-theme');
              if (savedTheme) {
                try {
                  setInitialTheme(JSON.parse(savedTheme));
                } catch (e) {
                  console.error('Failed to parse saved theme', e);
                }
              }
            }
          }
        } else {
          // Check localStorage for saved theme
          const savedTheme = localStorage.getItem('app-theme');
          if (savedTheme) {
            try {
              setInitialTheme(JSON.parse(savedTheme));
            } catch (e) {
              console.error('Failed to parse saved theme', e);
            }
          }
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialTheme();
  }, [initialThemeId, businessId]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-lg">Loading theme...</div>
      </div>
    );
  }
  
  return (
    <ThemeProvider 
      initialTheme={initialTheme}
      businessId={businessId}
      useServerGeneratedCSS={false}
    >
      {children}
    </ThemeProvider>
  );
}

/**
 * Higher-order component to wrap any component with the theme provider
 */
export function withTheme<T extends {}>(
  Component: React.ComponentType<T>,
  options?: Omit<AppThemeProviderProps, 'children'>
) {
  return function WithTheme(props: T) {
    return (
      <AppThemeProvider {...options}>
        <Component {...props} />
      </AppThemeProvider>
    );
  };
}