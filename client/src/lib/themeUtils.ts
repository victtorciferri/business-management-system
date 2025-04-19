/**
 * Theme Utils - 2025 Edition
 * 
 * Utility functions for working with themes and design tokens.
 */

/**
 * Generates CSS variables from a theme tokens object
 * @param tokens Theme tokens object
 * @returns CSS variables string
 */
export function generateCSSVariables(tokens: any): string {
  if (!tokens) return '';
  
  let cssVars: string[] = [];
  
  // Process color tokens
  if (tokens.colors) {
    Object.entries(tokens.colors).forEach(([colorName, colorValue]) => {
      if (typeof colorValue === 'string') {
        // Handle flat color value
        cssVars.push(`--color-${colorName}: ${colorValue};`);
      } else if (typeof colorValue === 'object' && colorValue !== null) {
        // Handle object with color variants
        Object.entries(colorValue).forEach(([variant, color]) => {
          cssVars.push(`--color-${colorName}-${variant}: ${color};`);
        });
        
        // Add base as the default if it exists
        if (colorValue.base) {
          cssVars.push(`--color-${colorName}: ${colorValue.base};`);
        }
      }
    });
  }
  
  // Process typography tokens
  if (tokens.typography) {
    // Font families
    if (tokens.typography.fontFamilies) {
      Object.entries(tokens.typography.fontFamilies).forEach(([name, value]) => {
        cssVars.push(`--font-family-${name}: ${value};`);
      });
    }
    
    // Font sizes
    if (tokens.typography.fontSizes) {
      Object.entries(tokens.typography.fontSizes).forEach(([name, value]) => {
        cssVars.push(`--font-size-${name}: ${value};`);
      });
    }
    
    // Font weights
    if (tokens.typography.fontWeights) {
      Object.entries(tokens.typography.fontWeights).forEach(([name, value]) => {
        cssVars.push(`--font-weight-${name}: ${value};`);
      });
    }
    
    // Line heights
    if (tokens.typography.lineHeights) {
      Object.entries(tokens.typography.lineHeights).forEach(([name, value]) => {
        cssVars.push(`--line-height-${name}: ${value};`);
      });
    }
  }
  
  // Process spacing tokens
  if (tokens.spacing) {
    if (typeof tokens.spacing === 'object') {
      Object.entries(tokens.spacing).forEach(([name, value]) => {
        cssVars.push(`--spacing-${name}: ${value};`);
      });
    } else if (typeof tokens.spacing === 'number') {
      // Base spacing value
      cssVars.push(`--spacing-base: ${tokens.spacing}px;`);
      
      // Generate derived spacing values
      const spacingScales = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24];
      spacingScales.forEach(scale => {
        const value = scale * tokens.spacing;
        const name = scale.toString().replace('.', '-');
        cssVars.push(`--spacing-${name}: ${value}px;`);
      });
    }
  }
  
  // Process border radius tokens
  if (tokens.borderRadius) {
    if (typeof tokens.borderRadius === 'object') {
      Object.entries(tokens.borderRadius).forEach(([name, value]) => {
        cssVars.push(`--radius-${name}: ${value};`);
      });
    } else if (typeof tokens.borderRadius === 'number') {
      // Base radius value
      cssVars.push(`--radius-base: ${tokens.borderRadius}px;`);
      
      // Generate derived radius values
      const radiusScales = {
        sm: 0.5,
        md: 1,
        lg: 1.5,
        xl: 2,
        '2xl': 3,
        '3xl': 5,
        full: 9999
      };
      
      Object.entries(radiusScales).forEach(([name, scale]) => {
        let value: string;
        if (name === 'full') {
          value = '9999px';
        } else {
          value = `${scale * tokens.borderRadius}px`;
        }
        cssVars.push(`--radius-${name}: ${value};`);
      });
    }
  }
  
  // Handle any other token categories
  const processedCategories = ['colors', 'typography', 'spacing', 'borderRadius'];
  Object.entries(tokens).forEach(([category, values]) => {
    if (!processedCategories.includes(category) && typeof values === 'object') {
      Object.entries(values as object).forEach(([name, value]) => {
        if (typeof value === 'string' || typeof value === 'number') {
          cssVars.push(`--${category}-${name}: ${value};`);
        }
      });
    }
  });
  
  return cssVars.join('\n');
}

/**
 * Converts a theme to CSS variables
 * @param theme Theme object
 * @returns CSS string
 */
export function themeToCSS(theme: any): string {
  if (!theme) return '';
  
  // Extract tokens from the theme
  const tokens = theme.tokens || theme;
  
  // Generate CSS variables
  const cssVariables = generateCSSVariables(tokens);
  
  // Create a CSS block with the variables
  return `:root {\n${cssVariables}\n}`;
}

/**
 * Get a CSS variable value
 * @param name Variable name
 * @param fallback Fallback value
 * @returns CSS var() function string
 */
export function cssVar(name: string, fallback?: string): string {
  return fallback 
    ? `var(--${name}, ${fallback})` 
    : `var(--${name})`;
}

/**
 * Generates a theme class with scoped CSS variables
 * @param theme Theme object
 * @param className Class name for scoping
 * @returns CSS string
 */
export function generateThemeClass(theme: any, className: string): string {
  if (!theme || !className) return '';
  
  // Extract tokens from the theme
  const tokens = theme.tokens || theme;
  
  // Generate CSS variables
  const cssVariables = generateCSSVariables(tokens);
  
  // Create a CSS block with the variables scoped to the class
  return `.${className} {\n${cssVariables}\n}`;
}