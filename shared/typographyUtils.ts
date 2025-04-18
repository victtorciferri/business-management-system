/**
 * Typography Utility Functions for the Theme Editor
 * Provides functionality for working with typography including:
 * - Font family management
 * - Type scale generation
 * - Line height and letter spacing calculations
 * - Typography presets
 */

// Type definitions
export interface FontFamily {
  name: string;
  category: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting';
  variants: string[];
  url?: string;
  fallbacks: string[];
}

export interface TypeScale {
  base: number;
  ratio: number;
  values: Record<string, TypeSize>;
}

export interface TypeSize {
  size: string;
  lineHeight: string;
  letterSpacing: string;
  fontWeight?: number;
}

export interface TypographyPreset {
  name: string;
  description: string;
  headingFont: FontFamily;
  bodyFont: FontFamily;
  monoFont: FontFamily;
  scale: TypeScale;
  baseFontSize: number;
  baseLineHeight: number;
}

export interface TypographySettings {
  headingFont: FontFamily;
  bodyFont: FontFamily;
  monoFont: FontFamily;
  scale: TypeScale;
  baseFontSize: number;
  baseLineHeight: number;
  paragraphSpacing: string;
  fontWeights: Record<string, number>;
  textStyles: Record<string, {
    fontFamily: string;
    fontSize: string;
    fontWeight: number;
    lineHeight: string;
    letterSpacing: string;
    textTransform?: string;
  }>;
}

// Popular font pairings
export const popularFontPairings: Array<{ heading: FontFamily, body: FontFamily }> = [
  {
    heading: {
      name: 'Poppins',
      category: 'sans-serif',
      variants: ['300', '400', '500', '600', '700'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    body: {
      name: 'Inter',
      category: 'sans-serif',
      variants: ['300', '400', '500', '600'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  },
  {
    heading: {
      name: 'Playfair Display',
      category: 'serif',
      variants: ['400', '500', '600', '700'],
      fallbacks: ['Georgia', 'serif'],
    },
    body: {
      name: 'Source Sans Pro',
      category: 'sans-serif',
      variants: ['300', '400', '600'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  },
  {
    heading: {
      name: 'Montserrat',
      category: 'sans-serif',
      variants: ['400', '500', '600', '700'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    body: {
      name: 'Open Sans',
      category: 'sans-serif',
      variants: ['300', '400', '600'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  },
  {
    heading: {
      name: 'Roboto Slab',
      category: 'serif',
      variants: ['400', '500', '700'],
      fallbacks: ['Georgia', 'serif'],
    },
    body: {
      name: 'Roboto',
      category: 'sans-serif',
      variants: ['300', '400', '500'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  },
  {
    heading: {
      name: 'Merriweather',
      category: 'serif',
      variants: ['400', '700'],
      fallbacks: ['Georgia', 'serif'],
    },
    body: {
      name: 'Lato',
      category: 'sans-serif',
      variants: ['300', '400', '700'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  },
];

// System fonts
export const systemFonts: Record<string, FontFamily> = {
  system: {
    name: 'System UI',
    category: 'sans-serif',
    variants: ['400', '500', '700'],
    fallbacks: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  },
  serif: {
    name: 'Serif',
    category: 'serif',
    variants: ['400', '700'],
    fallbacks: ['Georgia', 'Times New Roman', 'serif'],
  },
  mono: {
    name: 'Monospace',
    category: 'monospace',
    variants: ['400', '700'],
    fallbacks: ['Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  },
};

// Common monospace fonts
export const monospaceFonts: FontFamily[] = [
  {
    name: 'JetBrains Mono',
    category: 'monospace',
    variants: ['400', '700'],
    fallbacks: ['Consolas', 'monospace'],
  },
  {
    name: 'Fira Code',
    category: 'monospace',
    variants: ['400', '500', '700'],
    fallbacks: ['Consolas', 'monospace'],
  },
  {
    name: 'Source Code Pro',
    category: 'monospace',
    variants: ['400', '500', '700'],
    fallbacks: ['Consolas', 'monospace'],
  },
  systemFonts.mono,
];

// Typography presets
export const typographyPresets: TypographyPreset[] = [
  {
    name: 'Modern Sans',
    description: 'Clean, minimal design with comfortable reading experience',
    headingFont: {
      name: 'Inter',
      category: 'sans-serif',
      variants: ['400', '500', '600', '700'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    bodyFont: {
      name: 'Inter',
      category: 'sans-serif',
      variants: ['400', '500'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    monoFont: monospaceFonts[0],
    scale: {
      base: 16,
      ratio: 1.25, // Major third
      values: generateTypeScale(16, 1.25),
    },
    baseFontSize: 16,
    baseLineHeight: 1.5,
  },
  {
    name: 'Classic Serif',
    description: 'Elegant and traditional typography with excellent readability',
    headingFont: {
      name: 'Playfair Display',
      category: 'serif',
      variants: ['400', '700'],
      fallbacks: ['Georgia', 'serif'],
    },
    bodyFont: {
      name: 'Source Sans Pro',
      category: 'sans-serif',
      variants: ['400', '600'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    monoFont: monospaceFonts[2],
    scale: {
      base: 16,
      ratio: 1.333, // Perfect fourth
      values: generateTypeScale(16, 1.333),
    },
    baseFontSize: 16,
    baseLineHeight: 1.6,
  },
  {
    name: 'Minimalist',
    description: 'Ultra-clean design with modern proportions',
    headingFont: {
      name: 'Montserrat',
      category: 'sans-serif',
      variants: ['400', '500', '700'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    bodyFont: {
      name: 'Work Sans',
      category: 'sans-serif',
      variants: ['300', '400', '500'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    monoFont: monospaceFonts[1],
    scale: {
      base: 16,
      ratio: 1.2, // Minor third
      values: generateTypeScale(16, 1.2),
    },
    baseFontSize: 16,
    baseLineHeight: 1.5,
  },
  {
    name: 'Corporate',
    description: 'Professional typography suitable for business applications',
    headingFont: {
      name: 'Roboto',
      category: 'sans-serif',
      variants: ['400', '500', '700'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    bodyFont: {
      name: 'Roboto',
      category: 'sans-serif',
      variants: ['300', '400', '500'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    monoFont: monospaceFonts[3],
    scale: {
      base: 16,
      ratio: 1.125, // Major second
      values: generateTypeScale(16, 1.125),
    },
    baseFontSize: 16,
    baseLineHeight: 1.5,
  },
  {
    name: 'System',
    description: 'Native system fonts for optimal performance',
    headingFont: systemFonts.system,
    bodyFont: systemFonts.system,
    monoFont: systemFonts.mono,
    scale: {
      base: 16,
      ratio: 1.2,
      values: generateTypeScale(16, 1.2),
    },
    baseFontSize: 16,
    baseLineHeight: 1.5,
  },
];

/**
 * Default typography settings
 */
export const defaultTypographySettings: TypographySettings = {
  headingFont: typographyPresets[0].headingFont,
  bodyFont: typographyPresets[0].bodyFont,
  monoFont: typographyPresets[0].monoFont,
  scale: typographyPresets[0].scale,
  baseFontSize: 16,
  baseLineHeight: 1.5,
  paragraphSpacing: '1.5rem',
  fontWeights: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  textStyles: {
    h1: {
      fontFamily: 'var(--font-heading)',
      fontSize: 'var(--fs-4xl)',
      fontWeight: 700,
      lineHeight: 'var(--lh-tight)',
      letterSpacing: 'var(--ls-tight)',
    },
    h2: {
      fontFamily: 'var(--font-heading)',
      fontSize: 'var(--fs-3xl)',
      fontWeight: 700,
      lineHeight: 'var(--lh-tight)',
      letterSpacing: 'var(--ls-tight)',
    },
    h3: {
      fontFamily: 'var(--font-heading)',
      fontSize: 'var(--fs-2xl)',
      fontWeight: 600,
      lineHeight: 'var(--lh-snug)',
      letterSpacing: 'var(--ls-tight)',
    },
    h4: {
      fontFamily: 'var(--font-heading)',
      fontSize: 'var(--fs-xl)',
      fontWeight: 600,
      lineHeight: 'var(--lh-snug)',
      letterSpacing: 'var(--ls-tight)',
    },
    h5: {
      fontFamily: 'var(--font-heading)',
      fontSize: 'var(--fs-lg)',
      fontWeight: 600,
      lineHeight: 'var(--lh-snug)',
      letterSpacing: 'var(--ls-tight)',
    },
    h6: {
      fontFamily: 'var(--font-heading)',
      fontSize: 'var(--fs-base)',
      fontWeight: 600,
      lineHeight: 'var(--lh-normal)',
      letterSpacing: 'var(--ls-normal)',
    },
    body: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-base)',
      fontWeight: 400,
      lineHeight: 'var(--lh-normal)',
      letterSpacing: 'var(--ls-normal)',
    },
    'body-sm': {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-sm)',
      fontWeight: 400,
      lineHeight: 'var(--lh-normal)',
      letterSpacing: 'var(--ls-normal)',
    },
    'body-xs': {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-xs)',
      fontWeight: 400,
      lineHeight: 'var(--lh-normal)',
      letterSpacing: 'var(--ls-normal)',
    },
    button: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-sm)',
      fontWeight: 500,
      lineHeight: 'var(--lh-none)',
      letterSpacing: 'var(--ls-wide)',
      textTransform: 'uppercase',
    },
    caption: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-xs)',
      fontWeight: 400,
      lineHeight: 'var(--lh-tight)',
      letterSpacing: 'var(--ls-wide)',
    },
    overline: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--fs-xs)',
      fontWeight: 500,
      lineHeight: 'var(--lh-none)',
      letterSpacing: 'var(--ls-wider)',
      textTransform: 'uppercase',
    },
    code: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--fs-sm)',
      fontWeight: 400,
      lineHeight: 'var(--lh-normal)',
      letterSpacing: 'var(--ls-tight)',
    },
  },
};

/**
 * Generate a type scale based on a base size and ratio
 */
export function generateTypeScale(baseSize: number, ratio: number): Record<string, TypeSize> {
  // Define the scale keys in order from smallest to largest
  const keys = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'];
  
  const scale: Record<string, TypeSize> = {};
  
  // Generate sizes for each key
  // The 'base' size will be the baseSize, and others will be calculated according to the ratio
  keys.forEach((key, index) => {
    // Adjust the index to center around 'base'
    const steps = index - keys.indexOf('base');
    
    // Calculate size based on steps from base
    const size = Math.round((baseSize * Math.pow(ratio, steps)) * 100) / 100;
    
    // Calculate line-height (decreases as font size increases)
    let lineHeight;
    if (index <= keys.indexOf('base')) {
      lineHeight = 1.6;  // Larger line height for smaller text
    } else if (index <= keys.indexOf('xl')) {
      lineHeight = 1.5;  // Medium line height for medium text
    } else if (index <= keys.indexOf('3xl')) {
      lineHeight = 1.3;  // Smaller line height for larger text
    } else {
      lineHeight = 1.1;  // Minimal line height for very large text
    }
    
    // Calculate letter spacing (tighter as font size increases)
    let letterSpacing;
    if (index <= keys.indexOf('sm')) {
      letterSpacing = '0.01em';  // Wider for small text
    } else if (index <= keys.indexOf('lg')) {
      letterSpacing = '0em';     // Normal for medium text
    } else {
      letterSpacing = '-0.01em'; // Tighter for large text
    }
    
    scale[key] = {
      size: `${size}px`,
      lineHeight: lineHeight.toString(),
      letterSpacing,
    };
  });
  
  return scale;
}

/**
 * Generate CSS variables for typography settings
 */
export function generateTypographyCssVariables(settings: TypographySettings): Record<string, string> {
  const variables: Record<string, string> = {};
  
  // Font family variables
  variables['--font-heading'] = generateFontFamilyValue(settings.headingFont);
  variables['--font-body'] = generateFontFamilyValue(settings.bodyFont);
  variables['--font-mono'] = generateFontFamilyValue(settings.monoFont);
  
  // Basic typography variables
  variables['--font-size-base'] = `${settings.baseFontSize}px`;
  variables['--line-height-base'] = settings.baseLineHeight.toString();
  
  // Font size variables
  Object.entries(settings.scale.values).forEach(([key, value]) => {
    variables[`--fs-${key}`] = value.size;
  });
  
  // Line height variables
  variables['--lh-none'] = '1';
  variables['--lh-tight'] = '1.25';
  variables['--lh-snug'] = '1.375';
  variables['--lh-normal'] = '1.5';
  variables['--lh-relaxed'] = '1.625';
  variables['--lh-loose'] = '2';
  
  // Letter spacing variables
  variables['--ls-tighter'] = '-0.05em';
  variables['--ls-tight'] = '-0.025em';
  variables['--ls-normal'] = '0em';
  variables['--ls-wide'] = '0.025em';
  variables['--ls-wider'] = '0.05em';
  variables['--ls-widest'] = '0.1em';
  
  // Font weight variables
  Object.entries(settings.fontWeights).forEach(([name, value]) => {
    variables[`--fw-${name}`] = value.toString();
  });
  
  return variables;
}

/**
 * Generate font family CSS value with fallbacks
 */
function generateFontFamilyValue(font: FontFamily): string {
  const fallbacks = font.fallbacks.join(', ');
  return `"${font.name}", ${fallbacks}`;
}

/**
 * Create a CSS @font-face declaration
 */
export function generateFontFaceDeclaration(font: FontFamily): string {
  if (!font.url) return '';
  
  return `
@font-face {
  font-family: '${font.name}';
  src: url('${font.url}');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
  `.trim();
}

/**
 * Create sample text for displaying typography
 */
export function getTypographySample(style: string): string {
  const samples: Record<string, string> = {
    h1: 'Main Heading',
    h2: 'Section Heading',
    h3: 'Subsection Heading',
    h4: 'Fourth Level Heading',
    h5: 'Fifth Level Heading',
    h6: 'Sixth Level Heading',
    body: 'This is a regular paragraph with standard body text. It demonstrates how body copy looks with the current typography settings. Good typography makes content readable and accessible.',
    'body-sm': 'This is smaller body text often used for less important information or when space is limited.',
    'body-xs': 'Very small text for things like footnotes and fine print.',
    button: 'BUTTON TEXT',
    caption: 'Image caption or auxiliary text',
    overline: 'CATEGORY LABEL',
    code: 'function example() { return "Hello, world!"; }',
  };
  
  return samples[style] || 'Typography Sample';
}