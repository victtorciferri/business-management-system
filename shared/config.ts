/**
 * Theme interface for business colors
 * This is the core interface used by the API endpoints and UI
 */
export interface Theme {
  name: string;        // Name of the theme or preset
  primary: string;     // Primary brand color
  secondary: string;   // Secondary/accent color
  background: string;  // Background color
  text: string;        // Main text color
  appearance?: "light" | "dark" | "system"; // Color scheme preference
  font?: string;       // Font family
  borderRadius?: string; // Border radius for UI elements
  spacing?: string;    // Base spacing unit
}

/**
 * Default theme values
 * Used as a fallback and for new business creation
 */
export const defaultTheme: Theme = {
  name: "Default",
  primary: "#1E3A8A",    // Indigo-600 equivalent
  secondary: "#9333EA",  // Purple-600 equivalent
  background: "#FFFFFF", // White
  text: "#111827",       // Gray-900 equivalent
  appearance: "system",  // Default to system preference
  font: "Inter",         // Default font family
  borderRadius: "0.375rem", // Default border radius
  spacing: "1rem",       // Default spacing unit
};