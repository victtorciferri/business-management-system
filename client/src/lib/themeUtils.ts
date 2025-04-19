/**
 * Theme Utilities - 2025 Edition
 * 
 * Utility functions for manipulating and applying themes.
 */

import { DesignTokens } from "@shared/designTokens";
import { ThemeEntity } from "@shared/schema";

/**
 * Generate CSS variables from design tokens
 * @param tokens Design tokens
 * @returns CSS variables string
 */
export function generateCssVariables(tokens: DesignTokens): string {
  let cssVars = '';

  // Process colors
  if (tokens.colors) {
    // Process primary colors
    if (tokens.colors.primary) {
      cssVars += `--color-primary: ${tokens.colors.primary.DEFAULT};\n`;
      cssVars += `--color-primary-foreground: ${tokens.colors.primary.foreground || '#ffffff'};\n`;
      cssVars += `--color-primary-light: ${tokens.colors.primary.light || lightenColor(tokens.colors.primary.DEFAULT, 15)};\n`;
      cssVars += `--color-primary-dark: ${tokens.colors.primary.dark || darkenColor(tokens.colors.primary.DEFAULT, 15)};\n`;
      cssVars += `--color-primary-hover: ${tokens.colors.primary.hover || darkenColor(tokens.colors.primary.DEFAULT, 10)};\n`;
    }

    // Process secondary colors
    if (tokens.colors.secondary) {
      cssVars += `--color-secondary: ${tokens.colors.secondary.DEFAULT};\n`;
      cssVars += `--color-secondary-foreground: ${tokens.colors.secondary.foreground || '#ffffff'};\n`;
      cssVars += `--color-secondary-light: ${tokens.colors.secondary.light || lightenColor(tokens.colors.secondary.DEFAULT, 15)};\n`;
      cssVars += `--color-secondary-dark: ${tokens.colors.secondary.dark || darkenColor(tokens.colors.secondary.DEFAULT, 15)};\n`;
      cssVars += `--color-secondary-hover: ${tokens.colors.secondary.hover || darkenColor(tokens.colors.secondary.DEFAULT, 10)};\n`;
    }

    // Process background colors
    if (tokens.colors.background) {
      cssVars += `--color-background: ${tokens.colors.background.DEFAULT};\n`;
      cssVars += `--color-background-surface: ${tokens.colors.background.surface || lightenColor(tokens.colors.background.DEFAULT, 2)};\n`;
      cssVars += `--color-background-elevated: ${tokens.colors.background.elevated || '#ffffff'};\n`;
      cssVars += `--color-background-sunken: ${tokens.colors.background.sunken || darkenColor(tokens.colors.background.DEFAULT, 5)};\n`;
    }

    // Process foreground colors
    if (tokens.colors.foreground) {
      cssVars += `--color-foreground: ${tokens.colors.foreground.DEFAULT};\n`;
      cssVars += `--color-foreground-muted: ${tokens.colors.foreground.muted || lightenColor(tokens.colors.foreground.DEFAULT, 30)};\n`;
      cssVars += `--color-foreground-subtle: ${tokens.colors.foreground.subtle || lightenColor(tokens.colors.foreground.DEFAULT, 40)};\n`;
    }

    // Process utility colors
    cssVars += `--color-border: ${tokens.colors.border || '#e5e7eb'};\n`;
    cssVars += `--color-focus: ${tokens.colors.focus || tokens.colors.primary?.DEFAULT || '#3b82f6'};\n`;

    // Process status colors
    if (tokens.colors.destructive) {
      cssVars += `--color-destructive: ${tokens.colors.destructive.DEFAULT};\n`;
      cssVars += `--color-destructive-foreground: ${tokens.colors.destructive.foreground || '#ffffff'};\n`;
      cssVars += `--color-destructive-light: ${tokens.colors.destructive.light || lightenColor(tokens.colors.destructive.DEFAULT, 30)};\n`;
    }

    if (tokens.colors.success) {
      cssVars += `--color-success: ${tokens.colors.success.DEFAULT};\n`;
      cssVars += `--color-success-foreground: ${tokens.colors.success.foreground || '#ffffff'};\n`;
      cssVars += `--color-success-light: ${tokens.colors.success.light || lightenColor(tokens.colors.success.DEFAULT, 30)};\n`;
    }

    if (tokens.colors.warning) {
      cssVars += `--color-warning: ${tokens.colors.warning.DEFAULT};\n`;
      cssVars += `--color-warning-foreground: ${tokens.colors.warning.foreground || '#ffffff'};\n`;
      cssVars += `--color-warning-light: ${tokens.colors.warning.light || lightenColor(tokens.colors.warning.DEFAULT, 30)};\n`;
    }

    if (tokens.colors.info) {
      cssVars += `--color-info: ${tokens.colors.info.DEFAULT};\n`;
      cssVars += `--color-info-foreground: ${tokens.colors.info.foreground || '#ffffff'};\n`;
      cssVars += `--color-info-light: ${tokens.colors.info.light || lightenColor(tokens.colors.info.DEFAULT, 30)};\n`;
    }
  }

  // Process typography
  if (tokens.typography) {
    // Font family
    if (tokens.typography.fontFamily) {
      cssVars += `--font-family-sans: ${tokens.typography.fontFamily.sans || "system-ui, sans-serif"};\n`;
      cssVars += `--font-family-serif: ${tokens.typography.fontFamily.serif || "Georgia, serif"};\n`;
      cssVars += `--font-family-mono: ${tokens.typography.fontFamily.mono || "monospace"};\n`;
      cssVars += `--font-family-body: ${tokens.typography.fontFamily.body || tokens.typography.fontFamily.sans || "system-ui, sans-serif"};\n`;
      cssVars += `--font-family-heading: ${tokens.typography.fontFamily.heading || tokens.typography.fontFamily.sans || "system-ui, sans-serif"};\n`;
      cssVars += `--font-family-display: ${tokens.typography.fontFamily.display || tokens.typography.fontFamily.sans || "system-ui, sans-serif"};\n`;
    }

    // Font sizes
    if (tokens.typography.fontSize) {
      cssVars += `--font-size-xs: ${tokens.typography.fontSize.xs || '0.75rem'};\n`;
      cssVars += `--font-size-sm: ${tokens.typography.fontSize.sm || '0.875rem'};\n`;
      cssVars += `--font-size-base: ${tokens.typography.fontSize.base || '1rem'};\n`;
      cssVars += `--font-size-md: ${tokens.typography.fontSize.md || '1rem'};\n`;
      cssVars += `--font-size-lg: ${tokens.typography.fontSize.lg || '1.125rem'};\n`;
      cssVars += `--font-size-xl: ${tokens.typography.fontSize.xl || '1.25rem'};\n`;
      cssVars += `--font-size-2xl: ${tokens.typography.fontSize['2xl'] || '1.5rem'};\n`;
      cssVars += `--font-size-3xl: ${tokens.typography.fontSize['3xl'] || '1.875rem'};\n`;
      cssVars += `--font-size-4xl: ${tokens.typography.fontSize['4xl'] || '2.25rem'};\n`;
      cssVars += `--font-size-5xl: ${tokens.typography.fontSize['5xl'] || '3rem'};\n`;
      cssVars += `--font-size-6xl: ${tokens.typography.fontSize['6xl'] || '3.75rem'};\n`;
      cssVars += `--font-size-7xl: ${tokens.typography.fontSize['7xl'] || '4.5rem'};\n`;
      cssVars += `--font-size-8xl: ${tokens.typography.fontSize['8xl'] || '6rem'};\n`;
      cssVars += `--font-size-9xl: ${tokens.typography.fontSize['9xl'] || '8rem'};\n`;
    }

    // Font weights
    if (tokens.typography.fontWeight) {
      cssVars += `--font-weight-thin: ${tokens.typography.fontWeight.thin || '100'};\n`;
      cssVars += `--font-weight-extralight: ${tokens.typography.fontWeight.extralight || '200'};\n`;
      cssVars += `--font-weight-light: ${tokens.typography.fontWeight.light || '300'};\n`;
      cssVars += `--font-weight-normal: ${tokens.typography.fontWeight.normal || '400'};\n`;
      cssVars += `--font-weight-medium: ${tokens.typography.fontWeight.medium || '500'};\n`;
      cssVars += `--font-weight-semibold: ${tokens.typography.fontWeight.semibold || '600'};\n`;
      cssVars += `--font-weight-bold: ${tokens.typography.fontWeight.bold || '700'};\n`;
      cssVars += `--font-weight-extrabold: ${tokens.typography.fontWeight.extrabold || '800'};\n`;
      cssVars += `--font-weight-black: ${tokens.typography.fontWeight.black || '900'};\n`;
    }

    // Line heights
    if (tokens.typography.lineHeight) {
      cssVars += `--line-height-none: ${tokens.typography.lineHeight.none || '1'};\n`;
      cssVars += `--line-height-tight: ${tokens.typography.lineHeight.tight || '1.25'};\n`;
      cssVars += `--line-height-snug: ${tokens.typography.lineHeight.snug || '1.375'};\n`;
      cssVars += `--line-height-normal: ${tokens.typography.lineHeight.normal || '1.5'};\n`;
      cssVars += `--line-height-relaxed: ${tokens.typography.lineHeight.relaxed || '1.625'};\n`;
      cssVars += `--line-height-loose: ${tokens.typography.lineHeight.loose || '2'};\n`;
    }

    // Letter spacing
    if (tokens.typography.letterSpacing) {
      cssVars += `--letter-spacing-tighter: ${tokens.typography.letterSpacing.tighter || '-0.05em'};\n`;
      cssVars += `--letter-spacing-tight: ${tokens.typography.letterSpacing.tight || '-0.025em'};\n`;
      cssVars += `--letter-spacing-normal: ${tokens.typography.letterSpacing.normal || '0em'};\n`;
      cssVars += `--letter-spacing-wide: ${tokens.typography.letterSpacing.wide || '0.025em'};\n`;
      cssVars += `--letter-spacing-wider: ${tokens.typography.letterSpacing.wider || '0.05em'};\n`;
      cssVars += `--letter-spacing-widest: ${tokens.typography.letterSpacing.widest || '0.1em'};\n`;
    }
  }

  // Process spacing
  if (tokens.spacing) {
    cssVars += `--spacing-xs: ${tokens.spacing.xs || '0.25rem'};\n`;
    cssVars += `--spacing-sm: ${tokens.spacing.sm || '0.5rem'};\n`;
    cssVars += `--spacing-md: ${tokens.spacing.md || '1rem'};\n`;
    cssVars += `--spacing-lg: ${tokens.spacing.lg || '1.5rem'};\n`;
    cssVars += `--spacing-xl: ${tokens.spacing.xl || '2rem'};\n`;
    cssVars += `--spacing-2xl: ${tokens.spacing['2xl'] || '2.5rem'};\n`;
    cssVars += `--spacing-3xl: ${tokens.spacing['3xl'] || '3rem'};\n`;
    cssVars += `--spacing-4xl: ${tokens.spacing['4xl'] || '4rem'};\n`;
    cssVars += `--spacing-5xl: ${tokens.spacing['5xl'] || '6rem'};\n`;
    cssVars += `--spacing-6xl: ${tokens.spacing['6xl'] || '8rem'};\n`;
    cssVars += `--spacing-base: ${tokens.spacing.DEFAULT || '1rem'};\n`;
  }

  // Process borders
  if (tokens.borders) {
    // Border radius
    if (tokens.borders.radius) {
      cssVars += `--radius-none: ${tokens.borders.radius.none || '0'};\n`;
      cssVars += `--radius-sm: ${tokens.borders.radius.sm || '0.125rem'};\n`;
      cssVars += `--radius-md: ${tokens.borders.radius.md || '0.25rem'};\n`;
      cssVars += `--radius-lg: ${tokens.borders.radius.lg || '0.5rem'};\n`;
      cssVars += `--radius-xl: ${tokens.borders.radius.xl || '1rem'};\n`;
      cssVars += `--radius-2xl: ${tokens.borders.radius['2xl'] || '1.5rem'};\n`;
      cssVars += `--radius-3xl: ${tokens.borders.radius['3xl'] || '2rem'};\n`;
      cssVars += `--radius-full: ${tokens.borders.radius.full || '9999px'};\n`;
      cssVars += `--radius-base: ${tokens.borders.radius.DEFAULT || '0.5rem'};\n`;
    }

    // Border width
    if (tokens.borders.width) {
      cssVars += `--border-width-none: ${tokens.borders.width.none || '0'};\n`;
      cssVars += `--border-width-thin: ${tokens.borders.width.thin || '1px'};\n`;
      cssVars += `--border-width-thick: ${tokens.borders.width.thick || '2px'};\n`;
      cssVars += `--border-width-heavy: ${tokens.borders.width.heavy || '4px'};\n`;
      cssVars += `--border-width-base: ${tokens.borders.width.DEFAULT || '1px'};\n`;
    }
  }

  // Process shadows
  if (tokens.shadows) {
    cssVars += `--shadow-none: ${tokens.shadows.none || 'none'};\n`;
    cssVars += `--shadow-sm: ${tokens.shadows.sm || '0 1px 2px 0 rgba(0, 0, 0, 0.05)'};\n`;
    cssVars += `--shadow-md: ${tokens.shadows.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'};\n`;
    cssVars += `--shadow-lg: ${tokens.shadows.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'};\n`;
    cssVars += `--shadow-xl: ${tokens.shadows.xl || '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'};\n`;
    cssVars += `--shadow-2xl: ${tokens.shadows['2xl'] || '0 25px 50px -12px rgba(0, 0, 0, 0.25)'};\n`;
    cssVars += `--shadow-3xl: ${tokens.shadows['3xl'] || '0 35px 60px -15px rgba(0, 0, 0, 0.3)'};\n`;
    cssVars += `--shadow-inner: ${tokens.shadows.inner || 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'};\n`;
    cssVars += `--shadow-base: ${tokens.shadows.DEFAULT || '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'};\n`;
    cssVars += `--shadow-colored: ${tokens.shadows.colored || '0 4px 14px 0 rgba(0, 0, 0, 0.1)'};\n`;
  }

  // Process effects
  if (tokens.effects) {
    // Transitions
    if (tokens.effects.transition) {
      cssVars += `--transition-fast: ${tokens.effects.transition.fast || '100ms ease-in-out'};\n`;
      cssVars += `--transition-normal: ${tokens.effects.transition.normal || '200ms ease-in-out'};\n`;
      cssVars += `--transition-slow: ${tokens.effects.transition.slow || '300ms ease-in-out'};\n`;
      cssVars += `--transition-base: ${tokens.effects.transition.DEFAULT || '200ms ease-in-out'};\n`;
    }

    // Opacity
    if (tokens.effects.opacity) {
      cssVars += `--opacity-0: ${tokens.effects.opacity['0'] || '0'};\n`;
      cssVars += `--opacity-25: ${tokens.effects.opacity['25'] || '0.25'};\n`;
      cssVars += `--opacity-50: ${tokens.effects.opacity['50'] || '0.5'};\n`;
      cssVars += `--opacity-75: ${tokens.effects.opacity['75'] || '0.75'};\n`;
      cssVars += `--opacity-100: ${tokens.effects.opacity['100'] || '1'};\n`;
      cssVars += `--opacity-disabled: ${tokens.effects.opacity.disabled || '0.5'};\n`;
      cssVars += `--opacity-hover: ${tokens.effects.opacity.hover || '0.8'};\n`;
    }
  }

  // Add shadcn/ui compatibility variables
  cssVars += generateShadcnCompatVars(tokens);

  return cssVars;
}

/**
 * Generate shadcn/ui compatibility variables
 * Maps our design tokens to the variables expected by shadcn/ui
 */
function generateShadcnCompatVars(tokens: DesignTokens): string {
  let cssVars = '';

  // Map our tokens to shadcn variables
  if (tokens.colors) {
    // Background
    cssVars += `--background: ${tokens.colors.background?.DEFAULT || '#ffffff'};\n`;
    cssVars += `--foreground: ${tokens.colors.foreground?.DEFAULT || '#111827'};\n`;
    
    // Card
    cssVars += `--card: ${tokens.colors.background?.surface || '#f9fafb'};\n`;
    cssVars += `--card-foreground: ${tokens.colors.foreground?.DEFAULT || '#111827'};\n`;
    
    // Popover
    cssVars += `--popover: ${tokens.colors.background?.elevated || '#ffffff'};\n`;
    cssVars += `--popover-foreground: ${tokens.colors.foreground?.DEFAULT || '#111827'};\n`;
    
    // Primary
    cssVars += `--primary: ${tokens.colors.primary?.DEFAULT || '#4f46e5'};\n`;
    cssVars += `--primary-foreground: ${tokens.colors.primary?.foreground || '#ffffff'};\n`;
    
    // Secondary
    cssVars += `--secondary: ${tokens.colors.secondary?.DEFAULT || '#06b6d4'};\n`;
    cssVars += `--secondary-foreground: ${tokens.colors.secondary?.foreground || '#ffffff'};\n`;
    
    // Muted
    cssVars += `--muted: ${tokens.colors.background?.sunken || '#f3f4f6'};\n`;
    cssVars += `--muted-foreground: ${tokens.colors.foreground?.muted || '#6b7280'};\n`;
    
    // Accent
    cssVars += `--accent: ${tokens.colors.primary?.light || '#818cf8'};\n`;
    cssVars += `--accent-foreground: ${tokens.colors.primary?.foreground || '#ffffff'};\n`;
    
    // Destructive
    cssVars += `--destructive: ${tokens.colors.destructive?.DEFAULT || '#ef4444'};\n`;
    cssVars += `--destructive-foreground: ${tokens.colors.destructive?.foreground || '#ffffff'};\n`;
    
    // Border
    cssVars += `--border: ${tokens.colors.border || '#e5e7eb'};\n`;
    cssVars += `--input: ${tokens.colors.border || '#e5e7eb'};\n`;
    
    // Ring
    cssVars += `--ring: ${tokens.colors.focus || tokens.colors.primary?.DEFAULT || '#3b82f6'};\n`;
  }

  // Radius
  if (tokens.borders?.radius) {
    cssVars += `--radius: ${tokens.borders.radius.DEFAULT || '0.5rem'};\n`;
  }

  return cssVars;
}

/**
 * Apply a theme to the document
 * @param theme Theme to apply
 * @param businessSlug Business slug
 */
export function applyTheme(theme: ThemeEntity, businessSlug: string): void {
  // Generate CSS class name from business slug
  const themeClass = `theme-${businessSlug.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;

  // Generate CSS variables
  let css = '';
  
  if (theme.tokens) {
    const cssVars = generateCssVariables(theme.tokens);
    css = `.${themeClass} {\n${cssVars}}\n`;
  } else {
    // Fallback to legacy theme format if tokens are not available
    css = `.${themeClass} {
      --color-primary: ${theme.primaryColor};
      --color-secondary: ${theme.secondaryColor || '#06b6d4'};
      --color-accent: ${theme.accentColor || '#f59e0b'};
      --color-background: ${theme.backgroundColor || '#ffffff'};
      --color-foreground: ${theme.textColor || '#111827'};
      --font-family-body: ${theme.fontFamily || 'Inter, sans-serif'};
      --radius-base: ${theme.borderRadius ? `${theme.borderRadius / 16}rem` : '0.5rem'};
      --spacing-base: ${theme.spacing ? `${theme.spacing / 16}rem` : '1rem'};
      
      /* shadcn compatibility */
      --background: ${theme.backgroundColor || '#ffffff'};
      --foreground: ${theme.textColor || '#111827'};
      --primary: ${theme.primaryColor};
      --primary-foreground: #ffffff;
      --secondary: ${theme.secondaryColor || '#06b6d4'};
      --secondary-foreground: #ffffff;
      --accent: ${theme.accentColor || '#f59e0b'};
      --accent-foreground: #ffffff;
      --radius: ${theme.borderRadius ? `${theme.borderRadius / 16}rem` : '0.5rem'};
    }`;
  }

  // Check if a style element already exists for this theme
  const styleId = `theme-${businessSlug}-style`;
  let styleEl = document.getElementById(styleId) as HTMLStyleElement;

  if (!styleEl) {
    // Create a new style element if it doesn't exist
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }

  // Set the CSS content
  styleEl.innerHTML = css;
}

/**
 * Helper function to lighten a color
 * @param color Hex color
 * @param amount Amount to lighten (0-100)
 * @returns Lightened hex color
 */
export function lightenColor(color: string, amount: number): string {
  return adjustColorLightness(color, amount);
}

/**
 * Helper function to darken a color
 * @param color Hex color
 * @param amount Amount to darken (0-100)
 * @returns Darkened hex color
 */
export function darkenColor(color: string, amount: number): string {
  return adjustColorLightness(color, -amount);
}

/**
 * Adjust the lightness of a color
 * @param hexColor Hex color
 * @param percent Percent to adjust lightness (-100 to 100)
 * @returns Adjusted hex color
 */
export function adjustColorLightness(hexColor: string, percent: number): string {
  // Parse hex color
  let r = parseInt(hexColor.substring(1, 3), 16);
  let g = parseInt(hexColor.substring(3, 5), 16);
  let b = parseInt(hexColor.substring(5, 7), 16);

  // Convert to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }

  // Adjust lightness
  l = Math.max(0, Math.min(1, l + percent / 100));

  // Convert back to RGB
  let r1, g1, b1;

  if (s === 0) {
    r1 = g1 = b1 = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r1 = hue2rgb(p, q, h + 1/3);
    g1 = hue2rgb(p, q, h);
    b1 = hue2rgb(p, q, h - 1/3);
  }

  // Convert back to hex
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
}

/**
 * Convert a hex color to RGBA
 * @param hex Hex color
 * @param alpha Alpha value (0-1)
 * @returns RGBA color string
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}