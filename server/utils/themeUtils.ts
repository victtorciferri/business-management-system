/**
 * Utility functions for converting between different theme formats
 */

// Legacy theme settings format
export interface ThemeSettings {
  variant: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  borderRadius: string;
  fontFamily: string;
  spacing: string;
  appearance: 'light' | 'dark' | 'system';
}

// New theme format
export interface Theme {
  id?: number;
  businessId?: number;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  headingFontFamily?: string;
  fontSize?: string;
  lineHeight?: string;
  borderRadius: string;
  spacing: string;
  variant: 'professional' | 'tint' | 'vibrant' | 'custom';
  appearance: 'light' | 'dark' | 'system';
  customCSS?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Convert legacy theme settings to new Theme format
 */
export function convertLegacyThemeSettings(settings: ThemeSettings, businessId?: number): Theme {
  return {
    businessId,
    name: 'Converted Theme',
    primaryColor: settings.primaryColor,
    secondaryColor: settings.secondaryColor,
    accentColor: settings.accentColor,
    backgroundColor: settings.backgroundColor,
    textColor: settings.textColor,
    fontFamily: settings.fontFamily || 'Inter, system-ui, sans-serif',
    borderRadius: settings.borderRadius || '0.5rem',
    spacing: settings.spacing || '1rem',
    variant: settings.variant as 'professional' | 'tint' | 'vibrant' | 'custom' || 'professional',
    appearance: settings.appearance || 'light'
  };
}

/**
 * Convert new Theme format to legacy theme settings
 */
export function convertToLegacyThemeSettings(theme: Theme): ThemeSettings {
  return {
    variant: theme.variant,
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor, 
    accentColor: theme.accentColor,
    textColor: theme.textColor,
    backgroundColor: theme.backgroundColor,
    borderRadius: theme.borderRadius,
    fontFamily: theme.fontFamily,
    spacing: theme.spacing,
    appearance: theme.appearance
  };
}