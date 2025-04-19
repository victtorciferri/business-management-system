import { db } from '../db';
import { users, themes } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { defaultTheme } from '@shared/config';
import { PgDatabase } from 'drizzle-orm/pg-core';

/**
 * Convert legacy theme settings (from themeSettings column) to the new Theme format
 */
export function convertLegacyThemeToTheme(legacyTheme: any): any {
  if (!legacyTheme) return defaultTheme;

  // Handle case where it's already in the new format with either naming convention
  if (legacyTheme.primary !== undefined || legacyTheme.primaryColor !== undefined) {
    // Normalize property names to ensure both naming conventions are available
    return {
      name: legacyTheme.name || "Custom Theme",
      // Support both naming conventions
      primary: legacyTheme.primary || legacyTheme.primaryColor || defaultTheme.primary,
      primaryColor: legacyTheme.primaryColor || legacyTheme.primary || defaultTheme.primary,
      secondary: legacyTheme.secondary || legacyTheme.secondaryColor || defaultTheme.secondary,
      secondaryColor: legacyTheme.secondaryColor || legacyTheme.secondary || defaultTheme.secondary,
      background: legacyTheme.background || legacyTheme.backgroundColor || defaultTheme.background,
      backgroundColor: legacyTheme.backgroundColor || legacyTheme.background || defaultTheme.background,
      text: legacyTheme.text || legacyTheme.textColor || defaultTheme.text,
      textColor: legacyTheme.textColor || legacyTheme.text || defaultTheme.text,
      accent: legacyTheme.accent || legacyTheme.accentColor || defaultTheme.accent,
      accentColor: legacyTheme.accentColor || legacyTheme.accent || defaultTheme.accent,
      borderRadius: typeof legacyTheme.borderRadius === 'number' 
        ? legacyTheme.borderRadius  
        : (legacyTheme.borderRadius || defaultTheme.borderRadius),
      spacing: typeof legacyTheme.spacing === 'number'
        ? legacyTheme.spacing
        : (legacyTheme.spacing || defaultTheme.spacing),
      appearance: legacyTheme.appearance || defaultTheme.appearance,
      fontFamily: legacyTheme.fontFamily || legacyTheme.font || defaultTheme.fontFamily,
      font: legacyTheme.font || legacyTheme.fontFamily || defaultTheme.fontFamily,
      buttonStyle: legacyTheme.buttonStyle || 'default',
      cardStyle: legacyTheme.cardStyle || 'default',
      variant: legacyTheme.variant || 'professional'
    };
  }

  // Convert from very legacy format to new format with both naming conventions
  return {
    name: legacyTheme.name || "Custom Theme",
    // Include both naming conventions for maximum compatibility
    primary: legacyTheme.primaryColor || defaultTheme.primary,
    primaryColor: legacyTheme.primaryColor || defaultTheme.primary,
    secondary: legacyTheme.secondaryColor || defaultTheme.secondary,
    secondaryColor: legacyTheme.secondaryColor || defaultTheme.secondary,
    background: legacyTheme.backgroundColor || defaultTheme.background,
    backgroundColor: legacyTheme.backgroundColor || defaultTheme.background,
    text: legacyTheme.textColor || defaultTheme.text,
    textColor: legacyTheme.textColor || defaultTheme.text,
    accent: legacyTheme.accentColor || defaultTheme.accent,
    accentColor: legacyTheme.accentColor || defaultTheme.accent,
    borderRadius: typeof legacyTheme.borderRadius === 'number' 
      ? legacyTheme.borderRadius 
      : (legacyTheme.borderRadius || defaultTheme.borderRadius),
    spacing: typeof legacyTheme.spacing === 'number'
      ? legacyTheme.spacing
      : (legacyTheme.spacing || defaultTheme.spacing),
    appearance: legacyTheme.appearance || defaultTheme.appearance,
    fontFamily: legacyTheme.fontFamily || defaultTheme.fontFamily,
    font: legacyTheme.fontFamily || defaultTheme.fontFamily,
    buttonStyle: legacyTheme.buttonStyle || 'default',
    cardStyle: legacyTheme.cardStyle || 'default',
    variant: legacyTheme.variant || 'professional'
  };
}

/**
 * Convert new Theme format to legacy theme settings (for themeSettings column)
 */
export function convertThemeToLegacyTheme(theme: any): any {
  if (!theme) return null;

  // Handle case where it's already in legacy format with primaryColor
  if (theme.primaryColor !== undefined && !theme.primary) {
    // Already in the legacy format, but normalize to ensure all properties are present
    return {
      name: theme.name || "Custom Theme",
      primaryColor: theme.primaryColor || defaultTheme.primary,
      secondaryColor: theme.secondaryColor || defaultTheme.secondary,
      backgroundColor: theme.backgroundColor || defaultTheme.background,
      textColor: theme.textColor || defaultTheme.text,
      accentColor: theme.accentColor || defaultTheme.accent,
      borderRadius: typeof theme.borderRadius === 'number' ? theme.borderRadius : 8,
      spacing: typeof theme.spacing === 'number' ? theme.spacing : 16,
      appearance: theme.appearance || defaultTheme.appearance,
      fontFamily: theme.fontFamily || theme.font || defaultTheme.fontFamily,
      buttonStyle: theme.buttonStyle || 'default',
      cardStyle: theme.cardStyle || 'default',
      variant: theme.variant || 'professional',
      
      // Also add old format properties for backwards compatibility
      primary: theme.primaryColor || defaultTheme.primary,
      secondary: theme.secondaryColor || defaultTheme.secondary,
      background: theme.backgroundColor || defaultTheme.background,
      text: theme.textColor || defaultTheme.text,
      accent: theme.accentColor || defaultTheme.accent,
      font: theme.fontFamily || theme.font || defaultTheme.fontFamily
    };
  }

  // Extract numeric value from string with units (like "8px" -> 8)
  const extractNumeric = (value: string | number): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const match = value.match(/(\d+)/);
      return match ? parseInt(match[1], 10) : 8;
    }
    return 8; // default
  };

  // Convert from old format to legacy format with both naming conventions
  return {
    name: theme.name || "Custom Theme",
    // Include both naming conventions for maximum compatibility
    primaryColor: theme.primaryColor || theme.primary || defaultTheme.primary,
    secondaryColor: theme.secondaryColor || theme.secondary || defaultTheme.secondary,
    backgroundColor: theme.backgroundColor || theme.background || defaultTheme.background,
    textColor: theme.textColor || theme.text || defaultTheme.text,
    accentColor: theme.accentColor || theme.accent || defaultTheme.accent,
    borderRadius: extractNumeric(theme.borderRadius || defaultTheme.borderRadius),
    spacing: extractNumeric(theme.spacing || defaultTheme.spacing),
    appearance: theme.appearance || defaultTheme.appearance,
    fontFamily: theme.fontFamily || theme.font || defaultTheme.fontFamily,
    buttonStyle: theme.buttonStyle || 'default',
    cardStyle: theme.cardStyle || 'default',
    variant: theme.variant || 'professional',
    
    // Also include old format properties for backwards compatibility
    primary: theme.primary || theme.primaryColor || defaultTheme.primary,
    secondary: theme.secondary || theme.secondaryColor || defaultTheme.secondary,
    background: theme.background || theme.backgroundColor || defaultTheme.background,
    text: theme.text || theme.textColor || defaultTheme.text,
    accent: theme.accent || theme.accentColor || defaultTheme.accent,
    font: theme.font || theme.fontFamily || defaultTheme.fontFamily
  };
}

/**
 * Update theme for a business in the database
 * This handles updating both the new theme column and the legacy themeSettings column
 */
export async function updateThemeForBusiness(
  businessId: number, 
  theme: any,
  dbInstance?: PgDatabase<any>
): Promise<boolean> {
  try {
    const dbToUse = dbInstance || db;
    console.log(`Updating theme for business ID ${businessId}`);
    
    // Convert between formats for consistency
    const legacyThemeSettings = convertThemeToLegacyTheme(theme);
    
    // First try to update the themes table if it exists
    try {
      const existingTheme = await dbToUse.select()
        .from(themes)
        .where(eq(themes.businessId, businessId))
        .where(eq(themes.isActive, true))
        .limit(1);
      
      if (existingTheme && existingTheme.length > 0) {
        // Update existing theme
        await dbToUse.update(themes)
          .set({
            ...theme,
            updatedAt: new Date()
          })
          .where(eq(themes.id, existingTheme[0].id));
          
        console.log(`Updated existing theme record for business ID ${businessId}`);
      } else {
        // Get the business slug for the new theme record
        const business = await dbToUse.select()
          .from(users)
          .where(eq(users.id, businessId))
          .limit(1);
          
        if (business && business.length > 0) {
          // Insert new theme
          await dbToUse.insert(themes).values({
            businessId,
            businessSlug: business[0].businessSlug || '',
            ...theme,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          console.log(`Created new theme record for business ID ${businessId}`);
        }
      }
    } catch (themeError) {
      console.error('Error updating themes table:', themeError);
      // Continue to update users table even if themes table update fails
    }
    
    // Always update the user record for backward compatibility
    await dbToUse.update(users)
      .set({
        themeSettings: legacyThemeSettings,
        theme: theme,
        updatedAt: new Date()
      })
      .where(eq(users.id, businessId));
    
    console.log(`Updated user record with theme for business ID ${businessId}`);
    return true;
  } catch (error) {
    console.error('Error in updateThemeForBusiness:', error);
    return false;
  }
}

/**
 * Get theme for a business from the database
 * This handles retrieving from either the themes table or the users table
 */
export async function getThemeForBusiness(
  businessId: number,
  dbInstance?: PgDatabase<any>,
  storageInstance?: any
): Promise<any> {
  try {
    const dbToUse = dbInstance || db;
    
    // First try to get from themes table
    try {
      const themeResult = await dbToUse.select()
        .from(themes)
        .where(eq(themes.businessId, businessId))
        .where(eq(themes.isActive, true))
        .limit(1);
      
      if (themeResult && themeResult.length > 0) {
        return themeResult[0];
      }
    } catch (themeError) {
      console.error('Error fetching from themes table:', themeError);
      // Fall through to try users table
    }
    
    // If not found in themes table, try users table
    try {
      const userResult = await dbToUse.select()
        .from(users)
        .where(eq(users.id, businessId))
        .limit(1);
      
      if (userResult && userResult.length > 0) {
        if (userResult[0].theme) {
          return userResult[0].theme;
        } else if (userResult[0].themeSettings) {
          return convertLegacyThemeToTheme(userResult[0].themeSettings);
        }
      }
    } catch (userError) {
      console.error('Error fetching from users table:', userError);
    }
    
    // Return default theme if nothing found
    return defaultTheme;
  } catch (error) {
    console.error('Error in getThemeForBusiness:', error);
    return defaultTheme;
  }
}