/**
 * CSS Variable Generator - 2025 Edition
 * 
 * A powerful utility for converting design tokens to CSS variables
 * and injecting them into the DOM for theme application.
 */

import { DesignTokens, Theme } from '../../../shared/designTokens';
import { tokensToCSSVariables, generateCSSFromVariables } from '../../../shared/tokenUtils';

/**
 * Options for the CSS variable generation
 */
export interface CSSVariableOptions {
  /** CSS selector to scope variables to (default: ':root') */
  selector?: string;
  
  /** Generate both light and dark mode variables (default: false) */
  withColorModes?: boolean;
  
  /** Add !important to all variable declarations (default: false) */
  important?: boolean;
  
  /** Custom variable prefix (default: '--') */
  prefix?: string;
  
  /** Custom data attributes to add to the style element */
  dataAttributes?: Record<string, string>;
}

/**
 * Generate a CSS string from theme tokens
 * 
 * @param theme The theme object containing tokens
 * @param options Options for CSS variable generation
 * @returns CSS string with variable declarations
 */
export function generateThemeCSS(
  theme: Theme,
  options: CSSVariableOptions = {}
): string {
  const {
    selector = ':root',
    withColorModes = false,
    important = false,
    prefix = '--',
  } = options;
  
  // Convert tokens to CSS variables
  const variables = tokensToCSSVariables(theme.tokens, { prefix });
  
  // Add !important if requested
  if (important) {
    Object.keys(variables).forEach(key => {
      variables[key] = `${variables[key]} !important`;
    });
  }
  
  // Generate the CSS string
  let css = generateCSSFromVariables(variables, selector);
  
  // Add color mode variants if requested
  if (withColorModes) {
    // Add light mode variables
    const lightSelector = `${selector}.light-mode, ${selector}:not(.dark-mode)`;
    const lightVariables = tokensToCSSVariables(
      { colors: theme.tokens.colors }, // Only include color tokens for light/dark
      { prefix }
    );
    css += generateCSSFromVariables(lightVariables, lightSelector);
    
    // Add dark mode variables - typically these would be transformed
    // In a real implementation, we'd have proper dark mode tokens
    const darkSelector = `${selector}.dark-mode`;
    // This is simplified - in reality, you'd use a proper transformation
    const darkColors = transformToDarkMode(theme.tokens.colors);
    const darkVariables = tokensToCSSVariables(
      { colors: darkColors }, 
      { prefix }
    );
    css += generateCSSFromVariables(darkVariables, darkSelector);
  }
  
  // Add CSS variable usage info as a comment
  css = `/**
 * Theme: ${theme.metadata.name}
 * Generated CSS Variables
 * 
 * Usage in CSS:  var(--colors-primary)
 * Usage in HTML: style="color: var(--colors-primary)"
 * Usage in JSX:  style={{ color: 'var(--colors-primary)' }}
 */\n\n` + css;
  
  return css;
}

/**
 * Simple transformation of colors for dark mode
 * This is a placeholder - a real implementation would be more sophisticated
 */
function transformToDarkMode(colors: any): any {
  // In a real implementation, this would transform the colors properly
  // For now, we'll just return a copy
  return { ...colors };
}

/**
 * Inject theme CSS variables into the DOM
 * 
 * @param theme The theme object containing tokens
 * @param options Options for CSS variable generation and injection
 * @returns The created/updated style element
 */
export function injectThemeVariables(
  theme: Theme,
  options: CSSVariableOptions = {}
): HTMLStyleElement | null {
  // Server-side safety check
  if (typeof document === 'undefined') {
    console.warn('injectThemeVariables can only be used in browser environments');
    return null;
  }
  
  const {
    selector = ':root',
    dataAttributes = {},
  } = options;
  
  // Generate the CSS
  const css = generateThemeCSS(theme, options);
  
  // Create a unique ID for the style element based on theme id
  const styleId = `theme-${theme.metadata.id}`;
  
  // Find existing element or create new one
  let styleElement = document.getElementById(styleId) as HTMLStyleElement;
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    
    // Add metadata as data attributes
    styleElement.setAttribute('data-theme-name', theme.metadata.name);
    styleElement.setAttribute('data-theme-id', theme.metadata.id);
    
    // Add any custom data attributes
    for (const [key, value] of Object.entries(dataAttributes)) {
      styleElement.setAttribute(`data-${key}`, value);
    }
    
    document.head.appendChild(styleElement);
  }
  
  // Update style content
  styleElement.textContent = css;
  
  return styleElement;
}

/**
 * Remove theme CSS variables from the DOM
 * 
 * @param themeId The ID of the theme to remove
 * @returns boolean indicating if the removal was successful
 */
export function removeThemeVariables(themeId: string): boolean {
  // Server-side safety check
  if (typeof document === 'undefined') {
    console.warn('removeThemeVariables can only be used in browser environments');
    return false;
  }
  
  // Find the style element
  const styleId = `theme-${themeId}`;
  const styleElement = document.getElementById(styleId);
  
  if (styleElement) {
    styleElement.remove();
    return true;
  }
  
  return false;
}

/**
 * Get a CSS variable reference to use in styles
 * 
 * @param path The token path (e.g., 'colors.primary')
 * @param fallback Optional fallback value
 * @returns CSS var() function with the path
 * 
 * @example
 * // Returns: var(--colors-primary, #5E5EFF)
 * getCSSVariable('colors.primary', '#5E5EFF')
 */
export function getCSSVariable(path: string, fallback?: string): string {
  const cssPath = path.replace(/\./g, '-');
  return fallback !== undefined
    ? `var(--${cssPath}, ${fallback})`
    : `var(--${cssPath})`;
}

/**
 * Create a style object with CSS variables for React components
 * 
 * @param tokens Record of token paths and their optional fallback values
 * @returns Style object with CSS variables
 * 
 * @example
 * // Returns: { color: 'var(--colors-primary)', backgroundColor: 'var(--colors-background)' }
 * createStyleWithCSSVariables({
 *   color: 'colors.primary',
 *   backgroundColor: 'colors.background'
 * })
 */
export function createStyleWithCSSVariables(
  tokens: Record<string, string | [string, string]>
): Record<string, string> {
  const style: Record<string, string> = {};
  
  for (const [cssProperty, token] of Object.entries(tokens)) {
    if (typeof token === 'string') {
      style[cssProperty] = getCSSVariable(token);
    } else {
      // Handle [tokenPath, fallback] format
      const [tokenPath, fallback] = token;
      style[cssProperty] = getCSSVariable(tokenPath, fallback);
    }
  }
  
  return style;
}

/**
 * Generate a complete set of CSS variables for a theme
 * This is useful for server-side rendering
 * 
 * @param theme The theme to generate variables for
 * @param options Options for CSS generation
 * @returns CSS string with all theme variables
 */
export function generateCompleteThemeCSS(
  theme: Theme,
  options: CSSVariableOptions = {}
): string {
  // Base theme CSS
  let css = generateThemeCSS(theme, options);
  
  // Add animation keyframes based on the theme's animation tokens
  if (theme.tokens.animation && theme.tokens.animation.preset) {
    css += generateAnimationKeyframes(theme.tokens.animation.preset);
  }
  
  // Add utility classes that use the theme variables
  css += generateUtilityClasses(theme);
  
  return css;
}

/**
 * Generate CSS keyframes for animations
 */
function generateAnimationKeyframes(animationPresets: Record<string, string>): string {
  let css = '\n/* Animation Keyframes */\n';
  
  // Define standard keyframes for common animations
  css += `@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes scale-out {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0.95); opacity: 0; }
}

@keyframes slide-in-from-top {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slide-in-from-right {
  from { transform: translateX(10px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-in-from-bottom {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slide-in-from-left {
  from { transform: translateX(-10px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-out-to-top {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(-10px); opacity: 0; }
}

@keyframes slide-out-to-right {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(10px); opacity: 0; }
}

@keyframes slide-out-to-bottom {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(10px); opacity: 0; }
}

@keyframes slide-out-to-left {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-10px); opacity: 0; }
}
`;

  return css;
}

/**
 * Generate utility classes that use theme variables
 */
function generateUtilityClasses(theme: Theme): string {
  let css = '\n/* Theme Utility Classes */\n';
  
  // Text colors
  css += `.text-primary { color: var(--colors-primary-DEFAULT); }
.text-secondary { color: var(--colors-secondary-DEFAULT); }
.text-accent { color: var(--colors-accent-DEFAULT); }
.text-default { color: var(--colors-text-DEFAULT); }
.text-muted { color: var(--colors-text-secondary); }

/* Background colors */
.bg-primary { background-color: var(--colors-primary-DEFAULT); }
.bg-secondary { background-color: var(--colors-secondary-DEFAULT); }
.bg-accent { background-color: var(--colors-accent-DEFAULT); }
.bg-default { background-color: var(--colors-background-DEFAULT); }
.bg-surface { background-color: var(--colors-background-surface); }

/* Border colors */
.border-primary { border-color: var(--colors-primary-DEFAULT); }
.border-secondary { border-color: var(--colors-secondary-DEFAULT); }
.border-accent { border-color: var(--colors-accent-DEFAULT); }
.border-default { border-color: var(--colors-border-DEFAULT); }

/* Typography classes */
.font-heading { font-family: var(--typography-fontFamily-heading); }
.font-body { font-family: var(--typography-fontFamily-body); }
.font-mono { font-family: var(--typography-fontFamily-mono); }

/* Animation classes */
.animate-fade-in { animation: var(--animation-preset-fadeIn); }
.animate-scale-in { animation: var(--animation-preset-scaleIn); }
`;

  return css;
}

/**
 * Get all current CSS variables from the DOM
 * Useful for debugging and theme extraction
 * 
 * @returns Record of all CSS variables and their computed values
 */
export function getAllCSSVariables(): Record<string, string> {
  // Server-side safety check
  if (typeof document === 'undefined') {
    console.warn('getAllCSSVariables can only be used in browser environments');
    return {};
  }
  
  const variables: Record<string, string> = {};
  const styles = getComputedStyle(document.documentElement);
  
  for (let i = 0; i < styles.length; i++) {
    const prop = styles[i];
    if (prop.startsWith('--')) {
      variables[prop] = styles.getPropertyValue(prop).trim();
    }
  }
  
  return variables;
}

/**
 * Set a single CSS variable in the DOM
 * 
 * @param name The CSS variable name (with or without --)
 * @param value The value to set
 * @param element The element to set the variable on (default: :root)
 */
export function setCSSVariable(
  name: string,
  value: string,
  element: HTMLElement = document.documentElement
): void {
  // Server-side safety check
  if (typeof document === 'undefined') {
    console.warn('setCSSVariable can only be used in browser environments');
    return;
  }
  
  const varName = name.startsWith('--') ? name : `--${name}`;
  element.style.setProperty(varName, value);
}

/**
 * Get a CSS variable value from the DOM
 * 
 * @param name The CSS variable name (with or without --)
 * @param element The element to get the variable from (default: :root)
 * @returns The computed value of the CSS variable
 */
export function getCSSVariableValue(
  name: string,
  element: HTMLElement = document.documentElement
): string {
  // Server-side safety check
  if (typeof document === 'undefined') {
    console.warn('getCSSVariableValue can only be used in browser environments');
    return '';
  }
  
  const varName = name.startsWith('--') ? name : `--${name}`;
  return getComputedStyle(element).getPropertyValue(varName).trim();
}

/**
 * Set multiple CSS variables at once in the DOM
 * 
 * @param variables Record of variable names and values
 * @param element The element to set the variables on (default: :root)
 */
export function setCSSVariables(
  variables: Record<string, string>,
  element: HTMLElement = document.documentElement
): void {
  // Server-side safety check
  if (typeof document === 'undefined') {
    console.warn('setCSSVariables can only be used in browser environments');
    return;
  }
  
  for (const [name, value] of Object.entries(variables)) {
    setCSSVariable(name, value, element);
  }
}

/**
 * Apply a theme directly to the root element
 * A simplified version of injectThemeVariables that modifies
 * the :root element directly rather than creating a style element
 * 
 * @param theme The theme to apply
 */
export function applyThemeToRoot(theme: Theme): void {
  // Server-side safety check
  if (typeof document === 'undefined') {
    console.warn('applyThemeToRoot can only be used in browser environments');
    return;
  }
  
  const variables = tokensToCSSVariables(theme.tokens);
  setCSSVariables(variables);
  
  // Set theme metadata as data attributes on the html element
  document.documentElement.setAttribute('data-theme-name', theme.metadata.name);
  document.documentElement.setAttribute('data-theme-id', theme.metadata.id);
}

/**
 * Create a stylesheet URL for a theme
 * This is useful when you want to dynamically load themes
 * 
 * @param theme The theme object
 * @param options Options for CSS generation
 * @returns A Blob URL containing the theme CSS
 */
export function createThemeStylesheetURL(
  theme: Theme,
  options: CSSVariableOptions = {}
): string {
  // Server-side safety check
  if (typeof URL === 'undefined' || typeof Blob === 'undefined') {
    console.warn('createThemeStylesheetURL can only be used in browser environments');
    return '';
  }
  
  const css = generateCompleteThemeCSS(theme, options);
  const blob = new Blob([css], { type: 'text/css' });
  return URL.createObjectURL(blob);
}

/**
 * Load a theme dynamically via a link element
 * 
 * @param theme The theme to load
 * @param options Options for CSS generation
 * @returns The created link element
 */
export function loadThemeStylesheet(
  theme: Theme,
  options: CSSVariableOptions = {}
): HTMLLinkElement | null {
  // Server-side safety check
  if (typeof document === 'undefined') {
    console.warn('loadThemeStylesheet can only be used in browser environments');
    return null;
  }
  
  // Create a unique ID for the link element
  const linkId = `theme-stylesheet-${theme.metadata.id}`;
  
  // Remove any existing link with this ID
  const existingLink = document.getElementById(linkId) as HTMLLinkElement;
  if (existingLink) {
    existingLink.remove();
  }
  
  // Create the stylesheet URL
  const stylesheetURL = createThemeStylesheetURL(theme, options);
  
  // Create and append the link element
  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = stylesheetURL;
  link.setAttribute('data-theme-name', theme.metadata.name);
  link.setAttribute('data-theme-id', theme.metadata.id);
  
  document.head.appendChild(link);
  
  return link;
}

/**
 * Get the current effective theme from CSS variables in the DOM
 * This is useful for debugging and theme extraction
 * 
 * @returns A partial theme object reconstructed from CSS variables
 */
export function extractCurrentTheme(): Partial<Theme> {
  // Server-side safety check
  if (typeof document === 'undefined') {
    console.warn('extractCurrentTheme can only be used in browser environments');
    return {
      metadata: {
        id: 'unknown',
        name: 'Unknown Theme',
        description: 'Could not extract theme (server-side context)',
        author: 'System',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        featured: false,
      },
      tokens: {} as DesignTokens,
    };
  }
  
  // Get all CSS variables
  const allVariables = getAllCSSVariables();
  
  // Extract metadata from data attributes
  const themeId = document.documentElement.getAttribute('data-theme-id') || 'extracted-theme';
  const themeName = document.documentElement.getAttribute('data-theme-name') || 'Extracted Theme';
  
  // Reconstruct the theme object
  const theme: Partial<Theme> = {
    metadata: {
      id: themeId,
      name: themeName,
      description: 'Theme extracted from CSS variables',
      author: 'System',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['extracted'],
      featured: false,
    },
    tokens: {} as DesignTokens,
  };
  
  // Convert CSS variables back to a token object
  // This is a simplified version - a real implementation would be more robust
  const tokens: Record<string, any> = {};
  
  for (const [name, value] of Object.entries(allVariables)) {
    if (name.startsWith('--')) {
      // Strip the -- prefix
      const path = name.substring(2).split('-');
      
      // Build the nested object structure
      let current = tokens;
      for (let i = 0; i < path.length - 1; i++) {
        const segment = path[i];
        if (!current[segment]) {
          current[segment] = {};
        }
        current = current[segment];
      }
      
      // Set the value at the leaf
      const lastSegment = path[path.length - 1];
      current[lastSegment] = value;
    }
  }
  
  theme.tokens = tokens as unknown as DesignTokens;
  
  return theme;
}