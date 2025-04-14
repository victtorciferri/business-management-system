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
  // Add more theme properties as needed
}

// Default theme values
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
});

// Provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { business } = useBusinessContext();
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  
  // Update theme when business data changes
  useEffect(() => {
    if (business?.themeSettings) {
      // Apply business-specific theme if available
      setTheme(prevTheme => ({
        ...prevTheme,
        ...(business.themeSettings as Partial<ThemeSettings>)
      }));
    } else {
      // Reset to default theme if no business theme is available
      setTheme(defaultTheme);
    }
  }, [business]);
  
  // Update theme function
  const updateTheme = (newTheme: Partial<ThemeSettings>) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      ...newTheme
    }));
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