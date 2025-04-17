import { z } from "zod";
import { Theme as BaseTheme } from "./config";

/**
 * Extended theme schema with validation using Zod
 * This schema enforces a consistent structure for themes across the application
 * 
 * Required fields:
 * - name: A unique identifier for the theme preset
 * - primary: Main brand color (hex format)
 * - secondary: Accent color (hex format)
 * - background: Page background color (hex format)
 * - text: Main content text color (hex format)
 * 
 * Optional fields:
 * - appearance: Color scheme preference (light/dark/system)
 * - font: Font family name
 * - borderRadius: Border radius for UI elements (with CSS unit)
 * - spacing: Base spacing unit (with CSS unit)
 */
export const themeSchema = z.object({
  // Required fields
  name: z.string()
    .min(2, { message: "Theme name must be at least 2 characters" })
    .max(50, { message: "Theme name cannot exceed 50 characters" }),
  
  primary: z.string()
    .startsWith("#", { message: "Primary color must be a valid hex code starting with #" })
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { 
      message: "Primary color must be a valid hex code (e.g., #1E3A8A)" 
    }),
  
  secondary: z.string()
    .startsWith("#", { message: "Secondary color must be a valid hex code starting with #" })
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { 
      message: "Secondary color must be a valid hex code (e.g., #9333EA)" 
    }),
  
  background: z.string()
    .startsWith("#", { message: "Background color must be a valid hex code starting with #" })
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { 
      message: "Background color must be a valid hex code (e.g., #FFFFFF)" 
    }),
  
  text: z.string()
    .startsWith("#", { message: "Text color must be a valid hex code starting with #" })
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { 
      message: "Text color must be a valid hex code (e.g., #111827)" 
    }),
  
  // Optional fields
  appearance: z.enum(["light", "dark", "system"], {
    errorMap: () => ({ message: "Appearance must be one of: light, dark, system" })
  }).optional().default("system"),
  
  font: z.string()
    .min(1, { message: "Font name cannot be empty" })
    .max(50, { message: "Font name is too long" })
    .optional(),
  
  borderRadius: z.string()
    .regex(/^([0-9]*\.?[0-9]+(px|rem|em|%|vh|vw)?)$/, {
      message: "Border radius must be a valid CSS value (e.g., 0.5rem, 8px)"
    })
    .optional(),
  
  spacing: z.string()
    .regex(/^([0-9]*\.?[0-9]+(px|rem|em|%|vh|vw)?)$/, {
      message: "Spacing must be a valid CSS value (e.g., 1rem, 16px)"
    })
    .optional(),
});

/**
 * Create a function to validate a theme against the schema
 * Returns the valid theme or throws an error with validation details
 */
export const validateThemeWithErrors = (theme: unknown): BaseTheme => {
  return themeSchema.parse(theme);
};

// Extend the base Theme type with additional properties
export type ExtendedTheme = z.infer<typeof themeSchema>;

// Create a merged type that maintains compatibility with the original Theme
export type Theme = BaseTheme & Omit<ExtendedTheme, keyof BaseTheme>;