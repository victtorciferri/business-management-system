/**
 * Shared configuration for the application
 * This file contains types and defaults used across the client and server
 */

/**
 * Theme configuration
 * Defines the structure for business theme customization
 */
export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  text: string;
  appearance?: "light" | "dark" | "system";
  font?: string;
  borderRadius?: string;
  spacing?: string;
}

/**
 * Default theme values
 * Used as a fallback when no custom theme is specified
 */
export const defaultTheme: Theme = {
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

/**
 * Theme validation
 * Ensures theme values are in the correct format
 */
export const validateTheme = (theme: Partial<Theme>): Partial<Theme> => {
  const validatedTheme: Partial<Theme> = { ...theme };
  
  // Validate colors are hex format
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  
  if (theme.primary && !hexColorRegex.test(theme.primary)) {
    validatedTheme.primary = defaultTheme.primary;
  }
  
  if (theme.secondary && !hexColorRegex.test(theme.secondary)) {
    validatedTheme.secondary = defaultTheme.secondary;
  }
  
  if (theme.background && !hexColorRegex.test(theme.background)) {
    validatedTheme.background = defaultTheme.background;
  }
  
  if (theme.text && !hexColorRegex.test(theme.text)) {
    validatedTheme.text = defaultTheme.text;
  }
  
  // Validate appearance is one of the allowed values
  if (theme.appearance && !["light", "dark", "system"].includes(theme.appearance)) {
    validatedTheme.appearance = defaultTheme.appearance;
  }
  
  return validatedTheme;
};

/**
 * Merge theme with defaults
 * Ensures a complete theme object by filling missing properties with defaults
 */
export const mergeWithDefaults = (theme: Partial<Theme>): Theme => {
  return {
    ...defaultTheme,
    ...validateTheme(theme)
  };
};