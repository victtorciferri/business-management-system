import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useBusinessContext } from "./BusinessContext";
import { Theme as ThemeConfig, defaultTheme } from "@shared/config";
import { useQuery } from "@tanstack/react-query";
import { applyTheme, resetTheme } from "../utils/applyTheme";

// For backward compatibility, re-export ThemeConfig
export type Theme = ThemeConfig;

// Define theme settings interface for legacy theme settings
export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: "rounded" | "square" | "pill";
  cardStyle: "elevated" | "flat" | "bordered";
  appearance?: "light" | "dark" | "system";
  // Add more theme properties as needed
}

// Legacy interface type just for reference - we use the shared Theme interface from @shared/config

// Default theme values (this is just a fallback, actual defaults come from API)
const defaultThemeSettings: ThemeSettings = {
  primaryColor: "indigo-600",
  secondaryColor: "gray-200",
  accentColor: "amber-500",
  textColor: "gray-800",
  backgroundColor: "white",
  fontFamily: "sans-serif",
  borderRadius: "rounded-md",
  buttonStyle: "rounded",
  cardStyle: "elevated",
  appearance: "system",
};

// Default business theme with hex colors
const defaultBusinessTheme: ThemeConfig = {
  name: "Default",
  primary: "#1E3A8A",    // Indigo-600 equivalent
  secondary: "#9333EA",  // Purple-600 equivalent
  background: "#FFFFFF", // White
  text: "#111827",       // Gray-900 equivalent
  appearance: "system",
  font: "Inter",
  borderRadius: "0.375rem",
  spacing: "1rem"
};

// Context interface
interface ThemeContextType {
  theme: ThemeSettings;
  businessTheme: ThemeConfig;
  updateTheme: (newTheme: Partial<ThemeSettings>) => void;
  updateBusinessTheme: (newTheme: Partial<ThemeConfig>) => void;
  // CSS variable getters
  getPrimaryColor: () => string;
  getSecondaryColor: () => string;
  getAccentColor: () => string;
  getTextColor: () => string;
  getBackgroundColor: () => string;
  getBorderRadius: () => string;
  getButtonClass: () => string;
  getCardClass: () => string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: defaultThemeSettings,
  businessTheme: defaultBusinessTheme,
  updateTheme: () => {},
  updateBusinessTheme: () => {},
  getPrimaryColor: () => "text-indigo-600",
  getSecondaryColor: () => "bg-gray-200",
  getAccentColor: () => "text-amber-500",
  getTextColor: () => "text-gray-800",
  getBackgroundColor: () => "bg-white",
  getBorderRadius: () => "rounded-md",
  getButtonClass: () => "rounded-md",
  getCardClass: () => "shadow-md",
  isDarkMode: false,
  toggleDarkMode: () => {},
});

// Helper to detect system dark mode preference
const getSystemPreference = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

// Provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { business, config } = useBusinessContext();
  const [theme, setTheme] = useState<ThemeSettings>(defaultThemeSettings);
  const [businessTheme, setBusinessTheme] = useState<ThemeConfig>(defaultBusinessTheme);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Define the expected response type
  interface ThemeResponse {
    theme: ThemeConfig;
  }
  
  // Fetch the default theme on startup
  const { data: defaultThemeData } = useQuery<ThemeResponse>({
    queryKey: ['/api/default-theme'],
    enabled: true,
    staleTime: Infinity, // Default theme shouldn't change during a session
  });
  
  // Fetch business theme when business context is available
  const { data: businessThemeData } = useQuery<ThemeResponse>({
    queryKey: ['/api/business/theme'],
    enabled: !!business?.id, // Only run query when business ID is available
  });
  
  // Function to set dark mode class on document
  const applyDarkMode = (isDark: boolean) => {
    console.log('applyDarkMode called with isDark:', isDark);
    
    if (typeof document !== 'undefined') {
      try {
        if (isDark) {
          console.log('Adding dark class to HTML document');
          document.documentElement.classList.add('dark');
          
          // Force a style recalculation
          document.body.classList.add('dark-mode-enabled');
          setTimeout(() => {
            document.body.classList.remove('dark-mode-enabled');
          }, 50);
        } else {
          console.log('Removing dark class from HTML document');
          document.documentElement.classList.remove('dark');
        }
        setIsDarkMode(isDark);
      } catch (error) {
        console.error('Error applying dark mode:', error);
      }
    } else {
      console.warn('Document is not available for dark mode application');
    }
  };

  // Use default theme data when available
  useEffect(() => {
    if (defaultThemeData?.theme) {
      console.log('Default theme loaded from API:', defaultThemeData.theme);
      setBusinessTheme(defaultThemeData.theme);
      
      // Apply the theme using CSS variables
      applyTheme(defaultThemeData.theme);
    }
  }, [defaultThemeData]);
  
  // Use business theme data when available
  useEffect(() => {
    if (businessThemeData?.theme) {
      console.log('Business theme loaded from API:', businessThemeData.theme);
      setBusinessTheme(businessThemeData.theme);
      
      // Apply the theme using CSS variables
      applyTheme(businessThemeData.theme);
      
      // Apply appearance setting if it exists
      if (businessThemeData.theme.appearance) {
        switch (businessThemeData.theme.appearance) {
          case 'dark':
            console.log('Applying dark mode from business theme');
            applyDarkMode(true);
            break;
          case 'light':
            console.log('Applying light mode from business theme');
            applyDarkMode(false);
            break;
          case 'system':
          default:
            const systemIsDark = getSystemPreference();
            console.log('Applying system preference:', systemIsDark ? 'dark' : 'light');
            applyDarkMode(systemIsDark);
            break;
        }
      }
    }
  }, [businessThemeData]);
  
  // Legacy: Update theme when business config changes (for backward compatibility)
  useEffect(() => {
    if (config && config.themeSettings) {
      // Use the theme from business config 
      setTheme(config.themeSettings);
      
      // Apply appearance setting if it exists
      if (config.themeSettings.appearance) {
        switch (config.themeSettings.appearance) {
          case 'dark':
            console.log('Applying dark mode from theme settings');
            applyDarkMode(true);
            break;
          case 'light':
            console.log('Applying light mode from theme settings');
            applyDarkMode(false);
            break;
          case 'system':
          default:
            const systemIsDark = getSystemPreference();
            console.log('Applying system preference:', systemIsDark ? 'dark' : 'light');
            applyDarkMode(systemIsDark);
            break;
        }
      }
    } else {
      // Fallback to default theme if config is not available
      setTheme(defaultThemeSettings);
      applyDarkMode(getSystemPreference());
    }
  }, [config]);
  
  // Listen for system preference changes when in "system" mode
  useEffect(() => {
    if (theme.appearance !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      applyDarkMode(e.matches);
    };
    
    // Apply initial system preference
    applyDarkMode(mediaQuery.matches);
    
    // Add listener for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme.appearance]);
  
  // Update theme function
  const updateTheme = (newTheme: Partial<ThemeSettings>) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      ...newTheme
    }));
    
    // If appearance is updated, apply it immediately
    if (newTheme.appearance) {
      switch (newTheme.appearance) {
        case 'dark':
          applyDarkMode(true);
          break;
        case 'light':
          applyDarkMode(false);
          break;
        case 'system':
          applyDarkMode(getSystemPreference());
          break;
      }
    }
  };
  
  // Update business theme function for the new API
  const updateBusinessTheme = (newTheme: Partial<ThemeConfig>) => {
    // Create a new theme by merging the previous theme with the new changes
    const updatedTheme = {
      ...businessTheme,
      ...newTheme
    };
    
    // Update the state with the new theme
    setBusinessTheme(updatedTheme);
    
    // Apply theme CSS variables to the document
    applyTheme(updatedTheme);
    
    // If appearance is updated, apply it immediately
    if (newTheme.appearance) {
      switch (newTheme.appearance) {
        case 'dark':
          applyDarkMode(true);
          break;
        case 'light':
          applyDarkMode(false);
          break;
        case 'system':
          applyDarkMode(getSystemPreference());
          break;
      }
    }
    
    // Update theme via API if we have a business context
    if (business && business.id) {
      try {
        console.log('Saving theme to API:', updatedTheme);
        fetch('/api/business/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            theme: updatedTheme
          }),
        });
      } catch (error) {
        console.error('Failed to update business theme:', error);
      }
    }
  };
  
  // Helper functions to get appropriate classes based on theme settings
  const getPrimaryColor = () => `text-${theme.primaryColor}`;
  const getSecondaryColor = () => `bg-${theme.secondaryColor}`;
  const getAccentColor = () => `text-${theme.accentColor}`;
  const getTextColor = () => `text-${theme.textColor}`;
  const getBackgroundColor = () => `bg-${theme.backgroundColor}`;
  const getBorderRadius = () => theme.borderRadius;
  
  // Get composite classes for components
  const getButtonClass = () => {
    switch (theme.buttonStyle) {
      case "pill": return "rounded-full";
      case "square": return "rounded-none";
      default: return theme.borderRadius;
    }
  };
  
  const getCardClass = () => {
    switch (theme.cardStyle) {
      case "flat": return "border border-gray-200";
      case "bordered": return "border-2 border-primary";
      default: return "shadow-md";
    }
  };
  
  // Toggle dark mode function
  const toggleDarkMode = () => {
    console.log('Toggle dark mode called, current isDarkMode:', isDarkMode);
    const newAppearance = !isDarkMode ? 'dark' : 'light';
    console.log('Setting new appearance:', newAppearance);
    
    // Update the theme settings with the new appearance
    updateTheme({ appearance: newAppearance as ThemeSettings['appearance'] });
    
    // Update the business theme settings via API if this is a business site
    if (business && business.id) {
      // We should persist this preference for the business
      try {
        // New API - update business theme with appearance
        fetch('/api/business/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            theme: { 
              ...businessTheme, 
              appearance: newAppearance 
            } 
          }),
        });
        
        // Legacy API - keep for backward compatibility
        fetch('/api/business/theme-settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            themeSettings: { 
              ...theme, 
              appearance: newAppearance 
            } 
          }),
        });
      } catch (error) {
        console.error('Failed to persist dark mode preference:', error);
      }
    }
  };
  
  const value = {
    theme,
    businessTheme,
    updateTheme,
    updateBusinessTheme,
    getPrimaryColor,
    getSecondaryColor,
    getAccentColor,
    getTextColor,
    getBackgroundColor,
    getBorderRadius,
    getButtonClass,
    getCardClass,
    isDarkMode,
    toggleDarkMode,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for using theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}