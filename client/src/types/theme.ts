/**
 * Theme interface representing all customizable aspects of a business theme
 */
export interface Theme {
  // Basic info
  id?: number;
  businessId?: number;
  name: string;
  
  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  
  // Typography
  fontFamily: string;
  headingFontFamily?: string;
  fontSize?: string;
  lineHeight?: string;
  
  // Layout
  borderRadius: string;
  spacing: string;
  
  // Meta
  variant: 'professional' | 'tint' | 'vibrant' | 'custom';
  appearance: 'light' | 'dark' | 'system';
  
  // Additional customizations - for future expansion
  customCSS?: string;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Legacy theme settings format for backward compatibility
 */
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

/**
 * Theme preset definitions for quick application
 */
export interface ThemePreset {
  id: string;
  name: string;
  category: string;
  description?: string;
  theme: Partial<Theme>;
  preview?: {
    colors: string[];
    background?: string;
  };
}

/**
 * Default theme when no theme is specified
 */
export const defaultTheme: Theme = {
  name: 'Default Theme',
  primaryColor: '#0f766e',     // Teal/blue
  secondaryColor: '#9333ea',   // Purple
  accentColor: '#eab308',      // Yellow/gold
  backgroundColor: '#ffffff',  // White
  textColor: '#171717',        // Near black
  fontFamily: 'Inter, system-ui, sans-serif',
  borderRadius: '0.5rem',
  spacing: '1rem',
  variant: 'professional',
  appearance: 'light'
};

/**
 * Convert legacy theme settings to new Theme format
 */
export function convertLegacyThemeSettings(settings: ThemeSettings): Theme {
  return {
    name: 'Converted Theme',
    primaryColor: settings.primaryColor,
    secondaryColor: settings.secondaryColor,
    accentColor: settings.accentColor,
    backgroundColor: settings.backgroundColor,
    textColor: settings.textColor,
    fontFamily: settings.fontFamily || 'Inter, system-ui, sans-serif',
    borderRadius: settings.borderRadius || '0.5rem',
    spacing: settings.spacing || '1rem',
    variant: settings.variant as any || 'professional',
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