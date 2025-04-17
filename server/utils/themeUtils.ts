import { db } from "../db";
import { Theme, defaultTheme } from "@shared/config";
import { sql } from "drizzle-orm";

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
      return result.rows[0].theme as Theme;
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
    await db.execute(sql`
      UPDATE users
      SET theme = ${JSON.stringify(theme)}::jsonb
      WHERE id = ${businessId}
    `);
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
      const themeSettings = result.rows[0].theme_settings;
      
      // Map from legacy format to new format
      const theme: Theme = {
        primary: themeSettings.primaryColor || defaultTheme.primary,
        secondary: themeSettings.secondaryColor || defaultTheme.secondary,
        background: themeSettings.backgroundColor || defaultTheme.background,
        text: themeSettings.textColor || defaultTheme.text,
        appearance: themeSettings.appearance || defaultTheme.appearance
      };
      
      // Update the theme column
      await updateThemeForBusiness(businessId, theme);
    }
  } catch (error) {
    console.error("Error migrating theme settings:", error);
  }
}