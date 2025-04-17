// A simple test file to verify our theme validation logic works

// Import the theme schema and validation
import { themeSchema } from './shared/themeSchema.js';

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