// A simple test file to verify our theme validation logic works

// Import the schema directly for testing
const z = require('zod');

// Define the validation schema exactly like we have in the real code for testing
const themeSchema = z.object({
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

// Test cases - mix of valid and invalid themes
const testThemes = [
  // Valid themes
  {
    name: "Valid Theme 1",
    primary: "#1E3A8A",
    secondary: "#9333EA",
    background: "#FFFFFF", 
    text: "#111827",
    appearance: "system",
    font: "Inter",
    borderRadius: "0.375rem",
    spacing: "1rem",
  },
  {
    name: "Valid Theme 2",
    primary: "#111",
    secondary: "#222",
    background: "#FFF",
    text: "#000",
  },
  
  // Invalid themes (missing required fields)
  {
    name: "Invalid Theme - Missing Colors",
    primary: "#1E3A8A",
    // Missing secondary
    background: "#FFFFFF",
    // Missing text
  },
  
  // Invalid format
  {
    name: "Invalid Theme - Bad Hex",
    primary: "1E3A8A", // Missing # prefix
    secondary: "#9333EA",
    background: "#FFFFFF",
    text: "#111827",
  },
  
  // Invalid format for optional fields
  {
    name: "Invalid Theme - Bad Optional Fields",
    primary: "#1E3A8A",
    secondary: "#9333EA",
    background: "#FFFFFF",
    text: "#111827",
    appearance: "invalid", // Invalid enum value
    borderRadius: "5xx", // Invalid CSS unit
  },
];

// Test each theme
console.log("Testing theme validation:");
console.log("=======================\n");

testThemes.forEach((theme, index) => {
  console.log(`Test case ${index + 1}: ${theme.name}`);
  try {
    const validatedTheme = themeSchema.parse(theme);
    console.log("✅ Valid theme!");
    console.log("Validated result:", validatedTheme);
  } catch (error) {
    console.log("❌ Invalid theme!");
    console.log("Validation errors:", error.errors);
  }
  console.log("\n-------------------\n");
});