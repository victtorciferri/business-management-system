/**
 * Theme interface
 * Defines the properties of a business theme
 */
export interface Theme {
  // Basic information
  name: string;
  
  // Core colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  
  // Optional color palette (for extracted colors)
  colorPalette?: string[];
  
  // Typography and layout
  fontFamily: string;
  borderRadius: number;
  spacing: number;
  
  // Styling variants
  buttonStyle: 'default' | 'rounded' | 'square' | 'pill';
  cardStyle: 'default' | 'elevated' | 'flat' | 'bordered';
  
  // Appearance settings
  appearance: 'light' | 'dark' | 'system';
  variant: 'professional' | 'tint' | 'vibrant' | 'custom';
  
  // Advanced customization
  customCSS?: string;
}

/**
 * Default theme
 * Used as a fallback when no theme is specified
 */
export const defaultTheme: Theme = {
  name: 'Default Theme',
  primaryColor: '#0077B6',
  secondaryColor: '#023E8A',
  accentColor: '#48CAE4',
  backgroundColor: '#FFFFFF',
  textColor: '#111827',
  fontFamily: 'Inter, system-ui, sans-serif',
  borderRadius: 8,
  spacing: 16,
  buttonStyle: 'default',
  cardStyle: 'default',
  appearance: 'light',
  variant: 'professional',
  colorPalette: [],
};

/**
 * Validates a theme object
 * @param theme The theme to validate
 * @returns True if the theme is valid, false otherwise
 */
export function validateTheme(theme: Partial<Theme>): boolean {
  // Validate required color fields
  const requiredColors = ['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'textColor'];
  for (const colorField of requiredColors) {
    if (!theme[colorField as keyof Theme] || 
        typeof theme[colorField as keyof Theme] !== 'string' || 
        !/^#[0-9A-F]{6}$/i.test(theme[colorField as keyof Theme] as string)) {
      return false;
    }
  }
  
  // Validate font family
  if (!theme.fontFamily || typeof theme.fontFamily !== 'string') {
    return false;
  }
  
  // Validate numeric values
  if (typeof theme.borderRadius !== 'number' || theme.borderRadius < 0 || theme.borderRadius > 50) {
    return false;
  }
  
  if (typeof theme.spacing !== 'number' || theme.spacing < 0 || theme.spacing > 50) {
    return false;
  }
  
  // Check enum values
  const validButtonStyles = ['default', 'rounded', 'square', 'pill'];
  if (theme.buttonStyle && !validButtonStyles.includes(theme.buttonStyle)) {
    return false;
  }
  
  const validCardStyles = ['default', 'elevated', 'flat', 'bordered'];
  if (theme.cardStyle && !validCardStyles.includes(theme.cardStyle)) {
    return false;
  }
  
  const validAppearances = ['light', 'dark', 'system'];
  if (theme.appearance && !validAppearances.includes(theme.appearance)) {
    return false;
  }
  
  const validVariants = ['professional', 'tint', 'vibrant', 'custom'];
  if (theme.variant && !validVariants.includes(theme.variant)) {
    return false;
  }
  
  return true;
}

/**
 * Merges a partial theme with the default theme
 * @param theme The partial theme to merge
 * @returns A complete theme object
 */
export function mergeWithDefaults(theme: Partial<Theme>): Theme {
  return {
    ...defaultTheme,
    ...theme,
  };
}

/**
 * Converts legacy theme format to current format
 * @param legacyTheme The legacy theme object
 * @returns A current format theme object
 */
export function convertLegacyTheme(legacyTheme: any): Partial<Theme> {
  if (!legacyTheme) return {};
  
  return {
    primaryColor: legacyTheme.primary || defaultTheme.primaryColor,
    secondaryColor: legacyTheme.secondary || defaultTheme.secondaryColor,
    accentColor: legacyTheme.accent || defaultTheme.accentColor,
    backgroundColor: legacyTheme.background || defaultTheme.backgroundColor,
    textColor: legacyTheme.text || defaultTheme.textColor,
    fontFamily: legacyTheme.fontFamily || defaultTheme.fontFamily,
    borderRadius: legacyTheme.borderRadius !== undefined 
      ? Number(legacyTheme.borderRadius) 
      : defaultTheme.borderRadius,
    spacing: legacyTheme.spacing !== undefined 
      ? Number(legacyTheme.spacing) 
      : defaultTheme.spacing,
    buttonStyle: legacyTheme.buttonStyle || defaultTheme.buttonStyle,
    cardStyle: legacyTheme.cardStyle || defaultTheme.cardStyle,
    appearance: legacyTheme.appearance || defaultTheme.appearance,
    variant: legacyTheme.variant || defaultTheme.variant,
  };
}