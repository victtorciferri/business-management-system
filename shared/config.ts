/**
 * Theme interface for business colors
 * This is the core interface used by the API endpoints and UI
 */
export interface Theme {
  primary: string;     // Primary brand color
  secondary: string;   // Secondary/accent color
  background: string;  // Background color
  text: string;        // Main text color
  appearance?: "light" | "dark" | "system"; // Color scheme preference
}

/**
 * Default theme values
 * Used as a fallback and for new business creation
 */
export const defaultTheme: Theme = {
  primary: "#1E3A8A",    // Indigo-600 equivalent
  secondary: "#9333EA",  // Purple-600 equivalent
  background: "#FFFFFF", // White
  text: "#111827",       // Gray-900 equivalent
  appearance: "system",  // Default to system preference
};