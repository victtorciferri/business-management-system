import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useBusinessContext } from "./BusinessContext";

// Define theme settings interface
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

// Default theme values (this is just a fallback, actual defaults come from BusinessConfig)
const defaultTheme: ThemeSettings = {
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

// Context interface
interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (newTheme: Partial<ThemeSettings>) => void;
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
}

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  updateTheme: () => {},
  getPrimaryColor: () => "text-indigo-600",
  getSecondaryColor: () => "bg-gray-200",
  getAccentColor: () => "text-amber-500",
  getTextColor: () => "text-gray-800",
  getBackgroundColor: () => "bg-white",
  getBorderRadius: () => "rounded-md",
  getButtonClass: () => "rounded-md",
  getCardClass: () => "shadow-md",
  isDarkMode: false,
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
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
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

  // Update theme when business config changes
  useEffect(() => {
    if (config && config.themeSettings) {
      // Always use the theme from business config 
      // (it already merges defaults with business settings)
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
      setTheme(defaultTheme);
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
  
  const value = {
    theme,
    updateTheme,
    getPrimaryColor,
    getSecondaryColor,
    getAccentColor,
    getTextColor,
    getBackgroundColor,
    getBorderRadius,
    getButtonClass,
    getCardClass,
    isDarkMode,
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