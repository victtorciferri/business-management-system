import { db } from "../db";
import { Theme, defaultTheme } from "@shared/config";
import { themeSchema } from "@shared/themeSchema";
import { sql } from "drizzle-orm";

/**
 * Merges a partial theme with default values to create a complete theme
 * @param storedTheme Partial theme from storage or user input
 * @returns Complete theme with all required properties
 */
export const getEffectiveTheme = (storedTheme?: Partial<Theme>): Theme => ({
  ...defaultTheme,
  ...storedTheme,
});

/**
 * Validates a theme against the schema and returns a valid theme object
 * @param theme Theme data to validate
 * @returns Validated theme or null if invalid
 */
export const validateTheme = (theme: unknown): Theme | null => {
  try {
    // Parse and validate the theme data using the enhanced schema validation
    const validTheme = themeSchema.parse(theme);
    
    // Add any missing fields from defaultTheme that might be needed
    const completedTheme: Theme = {
      ...defaultTheme,  // Provide defaults
      ...validTheme,   // Overwrite with provided values
      // Make sure required properties are always present
      name: validTheme.name || "Custom Theme",
      primary: validTheme.primary || defaultTheme.primary,
      secondary: validTheme.secondary || defaultTheme.secondary,
      background: validTheme.background || defaultTheme.background,
      text: validTheme.text || defaultTheme.text,
    };
    
    return completedTheme;
  } catch (error) {
    console.error("Theme validation error:", error);
    // Provide more detailed error logging
    if (error instanceof Error) {
      console.error(`Error details: ${error.message}`);
    }
    return null;
  }
};

/**
 * Retrieves the theme for a specific business
 * @param businessId The ID of the business
 * @returns The theme object, or the default theme if not found
 */
export async function getThemeForBusiness(businessId: number): Promise<Theme> {
  try {
    // Query the database for the business's theme
    const result = await db.execute(sql`
      SELECT theme
      FROM users
      WHERE id = ${businessId}
    `);

    // Check if we have a result
    if (result.rows.length > 0 && result.rows[0].theme) {
      // Use the effective theme helper to merge with defaults
      return getEffectiveTheme(result.rows[0].theme as Partial<Theme>);
    }

    // If no theme is found, try to migrate from theme_settings
    await migrateThemeSettingsToTheme(businessId);
    
    // Fallback to default theme
    return { ...defaultTheme };
  } catch (error) {
    console.error("Error getting theme for business:", error);
    return { ...defaultTheme };
  }
}

/**
 * Updates the theme for a specific business
 * @param businessId The ID of the business
 * @param theme The new theme object
 */
export async function updateThemeForBusiness(businessId: number, theme: Theme): Promise<void> {
  try {
    // Validate the theme before saving
    const validatedTheme = validateTheme(theme);
    
    if (!validatedTheme) {
      throw new Error("Invalid theme format");
    }
    
    // Ensure we have a complete theme by merging with defaults
    const completeTheme = getEffectiveTheme(validatedTheme);
    
    // Convert new theme format to legacy theme_settings format
    const legacyThemeSettings = {
      variant: 'professional',
      cardStyle: 'default',
      textColor: completeTheme.text,
      appearance: completeTheme.appearance || 'light',
      fontFamily: completeTheme.font ? `${completeTheme.font}, sans-serif` : 'Inter, sans-serif',
      accentColor: completeTheme.secondary, // Use secondary as accent color
      buttonStyle: 'default',
      borderRadius: completeTheme.borderRadius ? parseInt(completeTheme.borderRadius) : 8,
      primaryColor: completeTheme.primary,
      secondaryColor: completeTheme.secondary,
      backgroundColor: completeTheme.background
    };
    
    console.log(`Updating theme for business ${businessId}:`);
    console.log(`New theme format:`, completeTheme);
    console.log(`Legacy theme_settings format:`, legacyThemeSettings);
    
    // Update both theme and theme_settings columns to ensure compatibility
    await db.execute(sql`
      UPDATE users
      SET 
        theme = ${JSON.stringify(completeTheme)}::jsonb,
        theme_settings = ${JSON.stringify(legacyThemeSettings)}::jsonb
      WHERE id = ${businessId}
    `);
    
    console.log(`Successfully updated theme for business ${businessId}`);
  } catch (error) {
    console.error("Error updating theme for business:", error);
    throw new Error("Failed to update theme");
  }
}

/**
 * Migrates legacy theme_settings to the new theme column
 * This is a helper function to support backward compatibility
 * @param businessId The ID of the business
 */
async function migrateThemeSettingsToTheme(businessId: number): Promise<void> {
  try {
    // Get the legacy theme_settings
    const result = await db.execute(sql`
      SELECT theme_settings
      FROM users
      WHERE id = ${businessId}
    `);

    // Check if we have theme_settings to migrate
    if (result.rows.length > 0 && result.rows[0].theme_settings) {
      const themeSettings = result.rows[0].theme_settings as {
        primaryColor?: string;
        secondaryColor?: string;
        backgroundColor?: string;
        textColor?: string;
        appearance?: "light" | "dark" | "system";
      };
      
      // Map from legacy format to new format
      const theme: Theme = {
        name: "Legacy Theme", // Add a name for the migrated theme
        primary: themeSettings.primaryColor || defaultTheme.primary,
        secondary: themeSettings.secondaryColor || defaultTheme.secondary,
        background: themeSettings.backgroundColor || defaultTheme.background,
        text: themeSettings.textColor || defaultTheme.text,
        appearance: themeSettings.appearance || defaultTheme.appearance,
        font: defaultTheme.font,
        borderRadius: defaultTheme.borderRadius,
        spacing: defaultTheme.spacing
      };
      
      // Update the theme column
      await updateThemeForBusiness(businessId, theme);
    }
  } catch (error) {
    console.error("Error migrating theme settings:", error);
  }
}