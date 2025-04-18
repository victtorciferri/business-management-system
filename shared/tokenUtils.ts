/**
 * Design Token Utilities - 2025 Edition
 * 
 * Utility functions for working with design tokens, including:
 * - Converting tokens to CSS variables
 * - Merging token sets
 * - Validating tokens
 * - Generating token references
 */

import { DesignTokens, Theme, ThemeSettings } from './designTokens';

/**
 * Options for converting tokens to CSS variables
 */
interface TokenToCSSOptions {
  /** Prefix for CSS variable names (default: '--') */
  prefix?: string;
  
  /** Whether to flatten nested token objects (default: true) */
  flatten?: boolean;
  
  /** Custom separator for flattened object paths (default: '-') */
  separator?: string;
  
  /** Whether to return with var() wrappers (default: false) */
  withVarFunctions?: boolean;
}

/**
 * Convert a design token object to CSS variables
 * 
 * @param tokens The design tokens object to convert
 * @param options Options for the conversion process
 * @returns An object with CSS variable names and values
 * 
 * Example output:
 * {
 *   '--colors-primary': '#5E5EFF',
 *   '--colors-primary-light': '#8F8FFF',
 *   '--typography-fontFamily-body': 'Inter, sans-serif'
 * }
 */
export function tokensToCSSVariables(
  tokens: Partial<DesignTokens> | Record<string, any>,
  options: TokenToCSSOptions = {}
): Record<string, string> {
  const {
    prefix = '--',
    flatten = true,
    separator = '-',
    withVarFunctions = false
  } = options;
  
  const result: Record<string, string> = {};
  
  /**
   * Recursive function to process nested token objects
   */
  function processTokens(obj: Record<string, any>, path: string[] = []) {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key];
      
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively process nested objects
        processTokens(value, currentPath);
      } else {
        // Create CSS variable name
        const variableName = `${prefix}${currentPath.join(separator)}`;
        
        // Format the value
        let cssValue = formatTokenValue(value);
        
        // Store in result
        result[variableName] = cssValue;
      }
    }
  }
  
  processTokens(tokens);
  
  // If requested, wrap values in var() functions
  if (withVarFunctions) {
    const varResult: Record<string, string> = {};
    for (const [key, value] of Object.entries(result)) {
      varResult[key.replace(prefix, '')] = `var(${key})`;
    }
    return varResult;
  }
  
  return result;
}

/**
 * Format a token value for CSS
 */
function formatTokenValue(value: any): string {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  if (typeof value === 'number') {
    return String(value);
  }
  
  return String(value);
}

/**
 * Generate CSS string from token variables
 * 
 * @param variables CSS variables object from tokensToCSSVariables
 * @param selector CSS selector to attach variables to
 * @returns CSS string with variables
 * 
 * Example:
 * :root {
 *   --colors-primary: #5E5EFF;
 *   --colors-primary-light: #8F8FFF;
 * }
 */
export function generateCSSFromVariables(
  variables: Record<string, string>,
  selector: string = ':root'
): string {
  let css = `${selector} {\n`;
  
  for (const [name, value] of Object.entries(variables)) {
    css += `  ${name}: ${value};\n`;
  }
  
  css += `}\n`;
  return css;
}

/**
 * Generate a scoped selector for multi-tenant theming
 * 
 * @param businessId ID of the business
 * @returns CSS selector for scoping
 */
export function generateScopedSelector(businessId: string | number): string {
  return `.business-theme-${businessId}`;
}

/**
 * Deep merge utility for combining token objects
 * 
 * @param target Target object to merge into
 * @param source Source object to merge from
 * @returns Merged object
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const output = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        source[key] !== null &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        key in target &&
        target[key] !== null &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        // Recursively merge nested objects
        output[key] = deepMerge(target[key], source[key]);
      } else {
        // Simple property assignment
        output[key] = source[key] as any;
      }
    }
  }
  
  return output;
}

/**
 * Create a CSS string for all tokens
 * 
 * @param tokens Design tokens to convert to CSS
 * @param selector CSS selector to attach variables to
 * @returns CSS string with all variables
 */
export function generateTokensCSS(
  tokens: Partial<DesignTokens>,
  selector: string = ':root'
): string {
  const variables = tokensToCSSVariables(tokens);
  return generateCSSFromVariables(variables, selector);
}

/**
 * Get a reference to a token as a CSS variable
 * 
 * @param path Dot-notation path to the token
 * @param prefix Prefix for CSS variables
 * @returns CSS variable reference
 * 
 * Example: getTokenReference('colors.primary') -> 'var(--colors-primary)'
 */
export function getTokenReference(
  path: string,
  prefix: string = '--'
): string {
  const variablePath = path.replace(/\./g, '-');
  return `var(${prefix}${variablePath})`;
}

/**
 * Apply theme mode (light/dark) adjustments to tokens
 * 
 * @param tokens Design tokens
 * @param mode Theme mode
 * @returns Adjusted tokens for the specified mode
 */
export function applyThemeMode(
  tokens: DesignTokens,
  mode: 'light' | 'dark'
): DesignTokens {
  const result = { ...tokens };
  
  // Deep clone to avoid mutations
  const adjustedTokens = JSON.parse(JSON.stringify(tokens));
  
  // Apply mode-specific adjustments
  if (mode === 'dark') {
    // Example adjustments for dark mode
    // This is where you would implement the dark mode transformation logic
    
    // Invert background and text colors
    if (adjustedTokens.colors) {
      // Swap background/foreground colors
      const tempBg = { ...adjustedTokens.colors.background };
      adjustedTokens.colors.background = {
        DEFAULT: adjustedTokens.colors.text.DEFAULT,
        surface: '#2a2a2a', // Dark surface
        elevated: '#3a3a3a', // Slightly lighter
        sunken: '#1a1a1a', // Darker
        highlight: '#4a4a4a', // Highlighted areas
      };
      
      // Ensure text is visible on dark backgrounds
      adjustedTokens.colors.text = {
        DEFAULT: tempBg.DEFAULT,
        secondary: '#aaaaaa',
        tertiary: '#888888',
        onPrimary: '#ffffff',
        onSecondary: '#ffffff',
        onAccent: '#ffffff',
        disabled: '#666666',
      };
      
      // Adjust borders to be more visible on dark
      if (adjustedTokens.colors.border) {
        adjustedTokens.colors.border = {
          ...adjustedTokens.colors.border,
          DEFAULT: '#444444',
          strong: '#666666',
          light: '#333333',
        };
      }
      
      // Adjust shadows for dark mode (often more subtle)
      if (adjustedTokens.shadows) {
        // Example shadow adjustments
        adjustedTokens.shadows = {
          ...adjustedTokens.shadows,
          sm: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
          DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
          md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        };
      }
    }
  }
  
  return adjustedTokens;
}

/**
 * Apply user theme settings to a theme
 * 
 * @param theme The base theme
 * @param settings User's theme settings
 * @returns An updated theme with user settings applied
 */
export function applyThemeSettings(
  theme: Theme,
  settings: ThemeSettings
): Theme {
  // Create a deep clone to avoid mutations
  const adjustedTheme = JSON.parse(JSON.stringify(theme));
  
  // Apply theme mode
  if (settings.mode !== 'system') {
    adjustedTheme.tokens = applyThemeMode(adjustedTheme.tokens, settings.mode);
  }
  
  // Apply custom colors if provided
  if (settings.customColors) {
    adjustedTheme.tokens.colors = deepMerge(
      adjustedTheme.tokens.colors,
      settings.customColors
    );
  }
  
  // Apply font size scaling
  if (settings.fontSize !== 1) {
    const fontSizeAdjustment = settings.fontSize;
    const typography = adjustedTheme.tokens.typography;
    
    if (typography && typography.fontSize) {
      // Scale all font sizes by the adjustment factor
      for (const [key, value] of Object.entries(typography.fontSize)) {
        // Parse rem values and scale them
        const remMatch = String(value).match(/^([\d.]+)rem$/);
        if (remMatch) {
          const originalSize = parseFloat(remMatch[1]);
          const newSize = originalSize * fontSizeAdjustment;
          typography.fontSize[key as keyof typeof typography.fontSize] = `${newSize}rem`;
        }
      }
    }
  }
  
  // Apply contrast preference
  if (settings.contrast !== 'normal') {
    // Enhance contrast for text and UI elements
    const contrastAdjustment = settings.contrast === 'maximum' ? 1.5 : 1.2;
    
    // This is where you would apply contrast adjustments to colors
    // For example, increasing contrast between text and background colors
  }
  
  // Apply reduced transparency if enabled
  if (settings.reducedTransparency) {
    // Replace semi-transparent colors with solid ones
    // This would be implemented with a recursive function that finds
    // color values with alpha channels and replaces them with solid equivalents
  }
  
  return adjustedTheme;
}

/**
 * Validate a theme against the expected structure
 * 
 * @param theme Theme to validate
 * @returns Validation result and error messages
 */
export function validateTheme(theme: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check basic structure
  if (!theme) {
    errors.push('Theme is undefined or null');
    return { valid: false, errors };
  }
  
  if (!theme.metadata) {
    errors.push('Theme is missing metadata');
  } else {
    // Check required metadata fields
    const requiredMetadataFields = ['id', 'name', 'author', 'version'];
    for (const field of requiredMetadataFields) {
      if (!theme.metadata[field]) {
        errors.push(`Theme metadata is missing required field: ${field}`);
      }
    }
  }
  
  if (!theme.tokens) {
    errors.push('Theme is missing tokens');
  } else {
    // Check required token categories
    const requiredTokenCategories = ['colors', 'typography', 'spacing', 'borders'];
    for (const category of requiredTokenCategories) {
      if (!theme.tokens[category]) {
        errors.push(`Theme tokens are missing required category: ${category}`);
      }
    }
    
    // Check core color tokens
    if (theme.tokens.colors) {
      const requiredColorTokens = ['primary', 'background', 'text'];
      for (const token of requiredColorTokens) {
        if (!theme.tokens.colors[token]) {
          errors.push(`Theme color tokens are missing required token: ${token}`);
        }
      }
    }
    
    // Check core typography tokens
    if (theme.tokens.typography) {
      const requiredTypographyTokens = ['fontFamily', 'fontSize', 'fontWeight'];
      for (const token of requiredTypographyTokens) {
        if (!theme.tokens.typography[token]) {
          errors.push(`Theme typography tokens are missing required token: ${token}`);
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if a CSS variable exists in the current document
 * 
 * @param variableName CSS variable name (with or without --)
 * @returns True if the variable exists and has a value
 */
export function cssVariableExists(variableName: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const name = variableName.startsWith('--') ? variableName : `--${variableName}`;
  
  // Get the computed value of the variable from :root
  const computedValue = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
    
  return computedValue !== '';
}

/**
 * Create a light/dark mode variant of a theme
 * 
 * @param theme Base theme
 * @param mode Target mode ('light' or 'dark')
 * @returns A new theme with mode-specific adjustments
 */
export function createThemeModeVariant(
  theme: Theme,
  mode: 'light' | 'dark'
): Theme {
  const variant = JSON.parse(JSON.stringify(theme)) as Theme;
  
  // Update metadata
  variant.metadata = {
    ...variant.metadata,
    id: `${variant.metadata.id}-${mode}`,
    name: `${variant.metadata.name} (${mode.charAt(0).toUpperCase() + mode.slice(1)})`,
    version: variant.metadata.version,
    baseTheme: theme.metadata.id,
  };
  
  // Apply mode-specific token adjustments
  variant.tokens = applyThemeMode(variant.tokens, mode);
  
  return variant;
}

/**
 * Create a high-contrast variant of a theme
 * 
 * @param theme Base theme
 * @returns A new theme with high-contrast adjustments
 */
export function createHighContrastVariant(theme: Theme): Theme {
  const variant = JSON.parse(JSON.stringify(theme)) as Theme;
  
  // Update metadata
  variant.metadata = {
    ...variant.metadata,
    id: `${variant.metadata.id}-high-contrast`,
    name: `${variant.metadata.name} (High Contrast)`,
    version: variant.metadata.version,
    baseTheme: theme.metadata.id,
  };
  
  // Apply high-contrast adjustments
  // This would implement the logic to increase contrast ratios
  // between text and background colors, strengthen borders, etc.
  
  return variant;
}

/**
 * Inject CSS variables into the DOM
 * 
 * @param variables CSS variables object
 * @param selector CSS selector to attach variables to
 * @param id Optional ID for the style element
 * @returns The created/updated style element
 */
export function injectCSSVariables(
  variables: Record<string, string>,
  selector: string = ':root',
  id: string = 'theme-variables'
): HTMLStyleElement {
  if (typeof document === 'undefined') {
    throw new Error('injectCSSVariables can only be used in browser environments');
  }
  
  // Create CSS string
  const css = generateCSSFromVariables(variables, selector);
  
  // Find existing element or create new one
  let styleElement = document.getElementById(id) as HTMLStyleElement;
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = id;
    document.head.appendChild(styleElement);
  }
  
  // Update style content
  styleElement.textContent = css;
  
  return styleElement;
}

/**
 * Get value of a design token from the current theme
 * Works in browser environments by reading computed CSS variables
 * 
 * @param tokenPath Dot-notation path to the token (e.g., 'colors.primary')
 * @param defaultValue Fallback value if token is not found
 * @returns The value of the token
 */
export function getTokenValue(
  tokenPath: string,
  defaultValue: string = ''
): string {
  if (typeof window === 'undefined') return defaultValue;
  
  const variableName = `--${tokenPath.replace(/\./g, '-')}`;
  
  // Read from computed styles
  const computedValue = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
    
  return computedValue || defaultValue;
}