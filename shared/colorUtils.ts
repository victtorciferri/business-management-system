/**
 * Color Utility Functions for the Theme Editor
 * Provides advanced functionality for working with colors including:
 * - Color format conversions (HEX, RGB, HSL)
 * - Palette generation
 * - Color relationship calculations (complementary, analogous, etc.)
 * - Contrast ratio calculations for accessibility
 */

import tinycolor from 'tinycolor2';

// Types
export interface ColorShade {
  value: string;
  name: string;
  contrastRatio: number;
  isAccessible: boolean;
}

export interface ColorPalette {
  base: string;
  shades: Record<number, ColorShade>;
  complements: string[];
  analogous: string[];
  triadic: string[];
  tetradic: string[];
  monochromatic: string[];
}

/**
 * Generate a complete color palette from a base color
 * Includes shades and color relationships
 */
export function generateColorPalette(baseColor: string): ColorPalette {
  const color = tinycolor(baseColor);
  
  if (!color.isValid()) {
    throw new Error(`Invalid color value: ${baseColor}`);
  }
  
  return {
    base: color.toHexString(),
    shades: generateShades(color),
    complements: [color.complement().toHexString()],
    analogous: color.analogous(3).map(c => c.toHexString()),
    triadic: color.triad().map(c => c.toHexString()),
    tetradic: color.tetrad().map(c => c.toHexString()),
    monochromatic: color.monochromatic(5).map(c => c.toHexString()),
  };
}

/**
 * Generate numbered shades of a color (50-950)
 * Similar to Tailwind's color scale
 */
export function generateShades(color: tinycolor.Instance): Record<number, ColorShade> {
  const shades: Record<number, ColorShade> = {};
  
  // Standard shade levels used in design systems
  const levels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  
  // Base brightness and saturation
  const baseBrightness = color.getBrightness();
  const baseSaturation = color.toHsl().s;
  
  levels.forEach(level => {
    // Calculate how light/dark this shade should be
    let lightness: number;
    
    if (level < 500) {
      // Lighter shades (reduce saturation slightly)
      const factor = 1 - (level / 500) * 0.7;
      lightness = 0.95 - (level / 800);
      
      const adjustedColor = tinycolor(color.toString());
      adjustedColor.lighten((100 - level) / 8);
      if (level < 200) adjustedColor.desaturate(10);
      
      const colorValue = adjustedColor.toHexString();
      const contrastRatio = calculateContrastRatio(colorValue, '#000000');
      
      shades[level] = {
        value: colorValue,
        name: `${level}`,
        contrastRatio,
        isAccessible: contrastRatio >= 4.5,
      };
    } else if (level === 500) {
      // Base color
      const colorValue = color.toHexString();
      const contrastRatio = calculateContrastRatio(colorValue, '#000000');
      
      shades[level] = {
        value: colorValue,
        name: `${level}`,
        contrastRatio,
        isAccessible: contrastRatio >= 4.5,
      };
    } else {
      // Darker shades
      const adjustedColor = tinycolor(color.toString());
      adjustedColor.darken((level - 500) / 8);
      
      const colorValue = adjustedColor.toHexString();
      const contrastRatio = calculateContrastRatio(colorValue, '#FFFFFF');
      
      shades[level] = {
        value: colorValue,
        name: `${level}`,
        contrastRatio,
        isAccessible: contrastRatio >= 4.5,
      };
    }
  });
  
  return shades;
}

/**
 * Calculate contrast ratio between two colors (WCAG 2.0)
 * Returns a value between 1 and 21
 * - 1:1 means no contrast (same color)
 * - 21:1 is the maximum contrast (black vs white)
 * 
 * WCAG 2.0 requires:
 * - At least 4.5:1 for normal text
 * - At least 3:1 for large text
 * - At least 7:1 for enhanced contrast
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const c1 = tinycolor(color1);
  const c2 = tinycolor(color2);
  
  if (!c1.isValid() || !c2.isValid()) {
    throw new Error('Invalid color value');
  }
  
  const l1 = getRelativeLuminance(c1);
  const l2 = getRelativeLuminance(c2);
  
  if (l1 > l2) {
    return (l1 + 0.05) / (l2 + 0.05);
  }
  
  return (l2 + 0.05) / (l1 + 0.05);
}

/**
 * Get relative luminance of a color (WCAG 2.0 formula)
 * Used for calculating contrast ratios
 */
function getRelativeLuminance(color: tinycolor.Instance): number {
  const rgb = color.toRgb();
  
  const rsrgb = rgb.r / 255;
  const gsrgb = rgb.g / 255;
  const bsrgb = rgb.b / 255;
  
  const r = rsrgb <= 0.03928 ? rsrgb / 12.92 : Math.pow((rsrgb + 0.055) / 1.055, 2.4);
  const g = gsrgb <= 0.03928 ? gsrgb / 12.92 : Math.pow((gsrgb + 0.055) / 1.055, 2.4);
  const b = bsrgb <= 0.03928 ? bsrgb / 12.92 : Math.pow((bsrgb + 0.055) / 1.055, 2.4);
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Determine if text would be readable on a given background color
 * Returns 'light' or 'dark' for the recommended text color
 */
export function determineTextColor(backgroundColor: string): 'light' | 'dark' {
  const color = tinycolor(backgroundColor);
  
  // Use YIQ formula to determine brightness
  // This is a common formula that weights RGB channels based on human perception
  const yiq = ((color.toRgb().r * 299) + (color.toRgb().g * 587) + (color.toRgb().b * 114)) / 1000;
  
  // Traditional threshold is 128, but we use 150 for better readability
  return yiq >= 150 ? 'dark' : 'light';
}

/**
 * Generate a semantic color palette with set names
 * (primary, secondary, accent, neutral, success, warning, error, info)
 */
export function generateSemanticPalette(primaryColor: string): Record<string, string> {
  const primary = tinycolor(primaryColor);
  
  if (!primary.isValid()) {
    throw new Error(`Invalid primary color: ${primaryColor}`);
  }
  
  const hsl = primary.toHsl();
  
  // Create semantic variations based on the primary color
  const secondary = tinycolor({ h: (hsl.h + 30) % 360, s: hsl.s * 0.8, l: hsl.l });
  const accent = tinycolor({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l });
  const neutral = tinycolor({ h: hsl.h, s: hsl.s * 0.2, l: hsl.l * 1.05 });
  
  // Set fixed colors for status indicators with slight hue adjustments
  const success = tinycolor({ h: 142, s: 0.7, l: 0.45 });
  const warning = tinycolor({ h: 40, s: 0.95, l: 0.5 });
  const error = tinycolor({ h: 0, s: 0.9, l: 0.5 });
  const info = tinycolor({ h: 210, s: 0.8, l: 0.55 });
  
  return {
    primary: primary.toHexString(),
    secondary: secondary.toHexString(),
    accent: accent.toHexString(),
    neutral: neutral.toHexString(),
    success: success.toHexString(),
    warning: warning.toHexString(),
    error: error.toHexString(),
    info: info.toHexString()
  };
}

/**
 * Check if a color meets WCAG accessibility guidelines for text
 * Returns an object with the test results
 */
export function checkAccessibility(textColor: string, backgroundColor: string): {
  normalText: boolean,
  largeText: boolean,
  enhanced: boolean,
  contrastRatio: number
} {
  const contrast = calculateContrastRatio(textColor, backgroundColor);
  
  return {
    normalText: contrast >= 4.5,
    largeText: contrast >= 3,
    enhanced: contrast >= 7,
    contrastRatio: contrast
  };
}

/**
 * Convert a color to all common formats
 */
export function getColorFormats(color: string): {
  hex: string,
  rgb: string,
  hsl: string,
  hsv: string
} {
  const c = tinycolor(color);
  
  if (!c.isValid()) {
    throw new Error(`Invalid color: ${color}`);
  }
  
  const rgb = c.toRgb();
  const hsl = c.toHsl();
  const hsv = c.toHsv();
  
  return {
    hex: c.toHexString(),
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`,
    hsv: `hsv(${Math.round(hsv.h)}, ${Math.round(hsv.s * 100)}%, ${Math.round(hsv.v * 100)}%)`
  };
}

/**
 * Generate CSS variables for a color palette
 */
export function generateCssVariables(baseName: string, palette: Record<number, ColorShade>): Record<string, string> {
  const variables: Record<string, string> = {};
  
  Object.entries(palette).forEach(([level, shade]) => {
    variables[`--${baseName}-${level}`] = shade.value;
  });
  
  return variables;
}