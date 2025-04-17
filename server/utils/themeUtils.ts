import { Theme } from "@shared/config";

/**
 * Convert legacy theme settings to new Theme format
 * This handles backward compatibility with older theme settings structure
 */
export function convertLegacyThemeToTheme(legacyTheme: any): Theme {
  return {
    name: "Converted Theme",
    variant: legacyTheme.variant || "professional",
    primaryColor: legacyTheme.primaryColor || "#4f46e5",
    secondaryColor: legacyTheme.secondaryColor || "#06b6d4",
    accentColor: legacyTheme.accentColor || "#f59e0b",
    textColor: legacyTheme.textColor || "#111827",
    backgroundColor: legacyTheme.backgroundColor || "#ffffff",
    fontFamily: legacyTheme.fontFamily || "Inter, sans-serif",
    borderRadius: typeof legacyTheme.borderRadius === 'number' ? legacyTheme.borderRadius : 8,
    spacing: 16, // Default spacing
    buttonStyle: legacyTheme.buttonStyle || "default",
    cardStyle: legacyTheme.cardStyle || "default",
    appearance: legacyTheme.appearance || "system",
  };
}

/**
 * Convert new Theme format to legacy theme settings
 * This handles backward compatibility with older theme settings structure
 */
export function convertThemeToLegacyTheme(theme: Theme): any {
  return {
    variant: theme.variant || "professional",
    primaryColor: theme.primaryColor || "#4f46e5",
    secondaryColor: theme.secondaryColor || "#06b6d4",
    accentColor: theme.accentColor || "#f59e0b",
    textColor: theme.textColor || "#111827",
    backgroundColor: theme.backgroundColor || "#ffffff",
    fontFamily: theme.fontFamily || "Inter, sans-serif",
    borderRadius: theme.borderRadius || 8,
    buttonStyle: theme.buttonStyle || "default",
    cardStyle: theme.cardStyle || "default",
    appearance: theme.appearance || "system",
  };
}

/**
 * Get the theme for a business by ID
 * First attempts to get from the themes table, falls back to user.theme or legacy themeSettings
 */
export async function getThemeForBusiness(businessId: number, db: any, storage: any): Promise<Theme> {
  try {
    // Try to get from the themes table first (when implemented)
    // For now, fall back to the user's theme or themeSettings

    const user = await storage.getUser(businessId);
    if (!user) {
      throw new Error('Business not found');
    }

    // Return the theme in order of preference: 
    // 1. New theme format (user.theme)
    // 2. Converted legacy theme (user.themeSettings)
    // 3. Default theme (fallback)
    if (user.theme) {
      return user.theme;
    } else if (user.themeSettings) {
      return convertLegacyThemeToTheme(user.themeSettings);
    } else {
      // Return default theme as defined in config
      const { defaultTheme } = require('../../shared/config');
      return defaultTheme;
    }
  } catch (error) {
    console.error('Error getting theme for business:', error);
    // Return default theme as fallback
    const { defaultTheme } = require('../../shared/config');
    return defaultTheme;
  }
}

/**
 * Update the theme for a business
 * Updates both the new theme format and legacy themeSettings for backward compatibility
 */
export async function updateThemeForBusiness(businessId: number, theme: Theme, db: any): Promise<void> {
  try {
    // Convert the new theme format to legacy theme settings
    const legacyThemeSettings = convertThemeToLegacyTheme(theme);

    // Update the users table with both formats
    const { users } = require('../../shared/schema');
    const { eq } = require('drizzle-orm');
    
    await db.update(users)
      .set({
        themeSettings: legacyThemeSettings,
        theme: theme
      })
      .where(eq(users.id, businessId));
      
    // Future: Also update the themes table when implemented
  } catch (error) {
    console.error('Error updating theme for business:', error);
    throw new Error('Failed to update theme');
  }
}