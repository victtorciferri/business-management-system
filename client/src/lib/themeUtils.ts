/**
 * Theme Utils - 2025 Edition
 * 
 * Client-side utilities for applying themes to the DOM
 */

import { ThemeEntity } from '@shared/schema';
import { DesignTokens, Theme, ColorTokens, TypographyTokens, SpacingTokens, BorderTokens, ShadowTokens, EffectTokens, ComponentTokens } from '@shared/designTokens';
import { themeToCssVariables, createCompleteTheme } from '@shared/tokenUtils';

/**
 * Apply a theme to the document
 * 
 * @param theme Theme to apply
 * @param targetElement Element to apply the theme to (defaults to document.documentElement)
 */
export function applyTheme(
  theme: Partial<ThemeEntity>, 
  targetElement: HTMLElement = document.documentElement
): void {
  // Apply CSS variables
  const variables = themeToCssVariables(theme);
  
  // Apply all variables to the target element
  Object.entries(variables).forEach(([name, value]) => {
    targetElement.style.setProperty(name, value);
  });
  
  // Apply theme classes
  if (theme.variant) {
    const variants = ['professional', 'vibrant', 'elegant', 'minimal', 'muted'];
    variants.forEach(v => targetElement.classList.remove(`theme-${v}`));
    targetElement.classList.add(`theme-${theme.variant}`);
  }
  
  // Apply light/dark mode
  if (theme.appearance === 'dark') {
    targetElement.classList.add('dark');
    targetElement.classList.remove('light');
  } else if (theme.appearance === 'light') {
    targetElement.classList.add('light');
    targetElement.classList.remove('dark');
  }
  
  // Apply data attributes for variant-aware components
  if (theme.variant) {
    targetElement.setAttribute('data-theme-variant', theme.variant);
  }
  
  // Apply business-specific theme class if we have a business id or slug
  if (theme.businessId || theme.businessSlug) {
    const identifier = theme.businessSlug || `business-${theme.businessId}`;
    targetElement.setAttribute('data-business', identifier);
  }
  
  // Set color mode preference
  if (theme.appearance) {
    localStorage.setItem('theme-mode', theme.appearance);
  }
  
  // Dispatch an event so other components can react to the theme change
  window.dispatchEvent(new CustomEvent('theme-changed', { 
    detail: { theme }
  }));
}

/**
 * Generate a style element for a theme
 * 
 * @param theme Theme or partial theme entity
 * @param options Options for style element generation
 * @returns HTMLStyleElement with theme CSS variables
 */
export function generateThemeStyleElement(
  theme: Partial<ThemeEntity>,
  options: {
    id?: string;
    scope?: string;
    media?: string;
  } = {}
): HTMLStyleElement {
  const { id = `theme-${theme.id || 'custom'}`, scope = ':root', media } = options;
  
  // Convert theme properties to CSS variables
  const variables = themeToCssVariables(theme);
  
  // Create style element
  const style = document.createElement('style');
  style.id = id;
  if (media) style.media = media;
  
  // Generate CSS
  let css = `${scope} {\n`;
  Object.entries(variables).forEach(([name, value]) => {
    css += `  ${name}: ${value};\n`;
  });
  css += '}\n';
  
  // Add dark mode specific overrides if needed
  if (theme.appearance === 'dark' || (theme.tokens && theme.tokens.darkMode)) {
    css += '\n@media (prefers-color-scheme: dark) {\n';
    css += `  ${scope} {\n`;
    // Add dark mode specific variables
    css += '    /* Dark mode overrides would go here */\n';
    css += '  }\n';
    css += '}\n';
  }
  
  style.textContent = css;
  return style;
}

/**
 * Convert token overrides to a complete theme
 */
export function createTheme(
  overrides: {
    colors?: Partial<ColorTokens>;
    typography?: Partial<TypographyTokens>;
    spacing?: Partial<SpacingTokens>;
    borders?: Partial<BorderTokens>;
    shadows?: Partial<ShadowTokens>;
    effects?: Partial<EffectTokens>;
    components?: Partial<ComponentTokens>;
  } = {}
): Theme {
  // Create a base theme
  const baseTheme: Partial<ThemeEntity> = {
    name: 'Custom Theme',
    primaryColor: overrides.colors?.primary || '#4f46e5',
    secondaryColor: overrides.colors?.secondary || '#06b6d4',
    backgroundColor: overrides.colors?.background || '#ffffff',
    textColor: overrides.colors?.foreground || '#111827',
    fontFamily: overrides.typography?.fontFamily || 'Inter, system-ui, sans-serif',
    variant: 'professional',
    appearance: 'light',
    borderRadius: 8
  };
  
  return createCompleteTheme(baseTheme);
}

/**
 * Get the current theme from localStorage
 */
export function getCurrentTheme(): Partial<ThemeEntity> | null {
  try {
    const theme = localStorage.getItem('current-theme');
    return theme ? JSON.parse(theme) : null;
  } catch (error) {
    console.error('Failed to parse theme from localStorage:', error);
    return null;
  }
}

/**
 * Save theme to localStorage
 */
export function saveThemeToLocalStorage(theme: Partial<ThemeEntity>): void {
  try {
    localStorage.setItem('current-theme', JSON.stringify(theme));
  } catch (error) {
    console.error('Failed to save theme to localStorage:', error);
  }
}

/**
 * Check if we should use dark mode (based on system preference)
 */
export function shouldUseDarkMode(): boolean {
  // Check localStorage preference first
  const storedPreference = localStorage.getItem('theme-mode');
  
  if (storedPreference === 'dark') return true;
  if (storedPreference === 'light') return false;
  
  // Otherwise use system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Inspect a theme for errors or issues
 */
export function validateTheme(theme: Partial<ThemeEntity>): string[] {
  const errors: string[] = [];
  
  // Check required properties
  if (!theme.name) errors.push('Theme name is required');
  if (!theme.primaryColor) errors.push('Primary color is required');
  
  // Check color formats
  const colorProperties = ['primaryColor', 'secondaryColor', 'backgroundColor', 'textColor', 'accentColor'];
  colorProperties.forEach(prop => {
    const color = theme[prop as keyof ThemeEntity] as string | undefined;
    if (color && !color.match(/^#[0-9A-Fa-f]{6}$/)) {
      errors.push(`Invalid ${prop} format. Must be a valid hex color (e.g. #FF0000)`);
    }
  });
  
  return errors;
}