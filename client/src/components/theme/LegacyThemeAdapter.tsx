/**
 * Legacy Theme Adapter
 * 
 * This component provides compatibility with the old theme system.
 * It adapts our new theme provider to work with existing components
 * that use the old ThemeContext.
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useTheme as useNewTheme } from '../../../providers/ThemeProvider';
import { Theme as OldTheme, defaultTheme, mergeWithDefaults } from '@shared/config';
import { convertToLegacyTheme } from './themeConverter';

// Import the old context type for compatibility
interface ThemeContextType {
  theme: OldTheme;
  updateTheme: (updates: Partial<OldTheme>) => void;
  saveTheme: () => Promise<{success: boolean, error?: string}>;
  resetTheme: () => void;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isPreviewMode: boolean;
  setPreviewMode: (mode: boolean) => void;
  setTheme: (theme: OldTheme) => void;
  
  // Theme utility functions
  getPrimaryColor: () => string;
  getTextColor: () => string;
  getBackgroundColor: () => string;
  getButtonClass: () => string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Admin-specific functions
  saveThemeForBusiness?: (businessId: number, theme: OldTheme) => Promise<{success: boolean, error?: string}>;
}

// Create a new context with the old type
export const LegacyThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface LegacyThemeAdapterProps {
  children: React.ReactNode;
}

/**
 * Component that adapts the new theme system to be compatible with the old one
 */
export function LegacyThemeAdapter({ children }: LegacyThemeAdapterProps) {
  // Get the new theme from the context
  const newTheme = useNewTheme();
  
  // Convert the new theme to the old format
  const legacyTheme = useMemo(() => {
    return convertToLegacyTheme(newTheme.theme);
  }, [newTheme.theme]);
  
  // Map the new theme's mode to isDarkMode
  const isDarkMode = newTheme.mode === 'dark';
  
  // Create an adapter context value that maps new system to old
  const contextValue = useMemo<ThemeContextType>(() => ({
    // Theme state
    theme: legacyTheme,
    hasUnsavedChanges: newTheme.hasUnsavedChanges,
    isSaving: newTheme.isSaving,
    isPreviewMode: newTheme.isPreviewMode,
    
    // Functions that map to the new system
    updateTheme: (updates: Partial<OldTheme>) => {
      // Convert old theme updates to new format and apply them
      // This is simplified - needs real conversion logic
      const primaryColor = updates.primaryColor;
      if (primaryColor) {
        newTheme.updateTheme({
          colors: {
            primary: {
              DEFAULT: `#${primaryColor}`,
            }
          }
        });
      }
      
      // Handle other conversions as needed
    },
    
    saveTheme: async () => {
      return newTheme.saveTheme();
    },
    
    resetTheme: () => {
      newTheme.resetTheme();
    },
    
    setPreviewMode: (mode: boolean) => {
      newTheme.setPreviewMode(mode);
    },
    
    setTheme: (theme: OldTheme) => {
      // This would need a full conversion from old to new theme format
      // For now, just update primary color as an example
      if (theme.primaryColor) {
        newTheme.updateTheme({
          colors: {
            primary: {
              DEFAULT: `#${theme.primaryColor}`,
            }
          }
        });
      }
    },
    
    // Theme utility functions
    getPrimaryColor: () => {
      return `text-${legacyTheme.primaryColor || 'blue'}-600`;
    },
    
    getTextColor: () => {
      return 'text-gray-800';
    },
    
    getBackgroundColor: () => {
      return `bg-${legacyTheme.backgroundColor || 'white'}`;
    },
    
    getButtonClass: () => {
      return `bg-${legacyTheme.primaryColor || 'blue'}-600 hover:bg-${legacyTheme.primaryColor || 'blue'}-700 text-white`;
    },
    
    isDarkMode,
    
    toggleDarkMode: () => {
      newTheme.toggleMode();
    },
    
    // Admin functions
    saveThemeForBusiness: async (businessId: number, theme: OldTheme) => {
      // Convert old theme to new format
      // This is a placeholder - real conversion would be needed
      return newTheme.saveThemeForBusiness(businessId, newTheme.theme);
    }
  }), [newTheme, legacyTheme, isDarkMode]);
  
  return (
    <LegacyThemeContext.Provider value={contextValue}>
      {children}
    </LegacyThemeContext.Provider>
  );
}

// Hook for accessing the legacy theme context
export function useLegacyTheme(): ThemeContextType {
  const context = useContext(LegacyThemeContext);
  
  if (!context) {
    throw new Error('useLegacyTheme must be used within a LegacyThemeAdapter');
  }
  
  return context;
}