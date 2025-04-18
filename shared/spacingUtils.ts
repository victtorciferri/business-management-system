/**
 * Spacing Utility Functions for the Theme Editor
 * Provides functionality for working with spacing systems including:
 * - Spacing scale generation
 * - Layout spacing presets
 * - Grid system configuration
 */

// Type definitions
export interface SpacingScale {
  unit: 'px' | 'rem' | 'em';
  base: number;
  ratio: number;
  values: Record<string, string>;
}

export interface GridSystem {
  columns: number;
  columnWidth: string;
  gutter: string;
  margins: string;
  breakpoints: Record<string, number>;
}

export interface LayoutSpacing {
  contentWidth: string;
  maxWidth: string;
  gridSystem: GridSystem;
  containerPadding: Record<string, string>;
  sectionSpacing: Record<string, string>;
  componentSpacing: Record<string, string>;
}

export interface SpacingSettings {
  scale: SpacingScale;
  layout: LayoutSpacing;
}

// Spacing presets
export const spacingPresets: { name: string, description: string, settings: SpacingSettings }[] = [
  {
    name: 'Compact',
    description: 'Tighter spacing for dense UIs',
    settings: {
      scale: {
        unit: 'rem',
        base: 0.25,
        ratio: 2,
        values: generateSpacingScale(0.25, 'rem', 2),
      },
      layout: {
        contentWidth: '1200px',
        maxWidth: '1600px',
        gridSystem: {
          columns: 12,
          columnWidth: 'minmax(0, 1fr)',
          gutter: '1rem',
          margins: '1rem',
          breakpoints: {
            xs: 0,
            sm: 576,
            md: 768,
            lg: 992,
            xl: 1200,
            xxl: 1400,
          },
        },
        containerPadding: {
          base: '1rem',
          sm: '1.5rem',
          lg: '2rem',
        },
        sectionSpacing: {
          base: '2rem',
          sm: '3rem',
          lg: '4rem',
        },
        componentSpacing: {
          xs: '0.5rem',
          sm: '0.75rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        },
      },
    },
  },
  {
    name: 'Balanced',
    description: 'A well-balanced spacing system for general use',
    settings: {
      scale: {
        unit: 'rem',
        base: 0.25,
        ratio: 2,
        values: generateSpacingScale(0.25, 'rem', 2),
      },
      layout: {
        contentWidth: '1280px',
        maxWidth: '1920px',
        gridSystem: {
          columns: 12,
          columnWidth: 'minmax(0, 1fr)',
          gutter: '1.5rem',
          margins: '1.5rem',
          breakpoints: {
            xs: 0,
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1280,
            xxl: 1536,
          },
        },
        containerPadding: {
          base: '1.5rem',
          sm: '2rem',
          lg: '3rem',
        },
        sectionSpacing: {
          base: '3rem',
          sm: '4rem',
          lg: '6rem',
        },
        componentSpacing: {
          xs: '0.5rem',
          sm: '1rem',
          md: '1.5rem',
          lg: '2rem',
          xl: '3rem',
        },
      },
    },
  },
  {
    name: 'Spacious',
    description: 'More generous spacing for a premium, open feel',
    settings: {
      scale: {
        unit: 'rem',
        base: 0.5,
        ratio: 1.5,
        values: generateSpacingScale(0.5, 'rem', 1.5),
      },
      layout: {
        contentWidth: '1440px',
        maxWidth: '2560px',
        gridSystem: {
          columns: 12,
          columnWidth: 'minmax(0, 1fr)',
          gutter: '2rem',
          margins: '2rem',
          breakpoints: {
            xs: 0,
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1440,
            xxl: 1920,
          },
        },
        containerPadding: {
          base: '2rem',
          sm: '3rem',
          lg: '4rem',
        },
        sectionSpacing: {
          base: '4rem',
          sm: '6rem',
          lg: '8rem',
        },
        componentSpacing: {
          xs: '1rem',
          sm: '1.5rem',
          md: '2rem',
          lg: '3rem',
          xl: '4rem',
        },
      },
    },
  },
];

// Default spacing settings
export const defaultSpacingSettings: SpacingSettings = spacingPresets[1].settings;

/**
 * Generate a spacing scale based on a base size, unit, and ratio
 */
export function generateSpacingScale(
  baseSize: number, 
  unit: 'px' | 'rem' | 'em' = 'rem', 
  ratio: number = 2
): Record<string, string> {
  const scale: Record<string, string> = {};
  
  // Generate the scale values
  scale['0'] = '0';
  scale['px'] = '1px';
  scale['0.5'] = `${baseSize * 0.5}${unit}`;
  scale['1'] = `${baseSize}${unit}`;
  scale['1.5'] = `${baseSize * 1.5}${unit}`;
  scale['2'] = `${baseSize * 2}${unit}`;
  scale['2.5'] = `${baseSize * 2.5}${unit}`;
  scale['3'] = `${baseSize * 3}${unit}`;
  scale['3.5'] = `${baseSize * 3.5}${unit}`;
  scale['4'] = `${baseSize * 4}${unit}`;
  scale['5'] = `${baseSize * 5}${unit}`;
  scale['6'] = `${baseSize * 6}${unit}`;
  scale['7'] = `${baseSize * 7}${unit}`;
  scale['8'] = `${baseSize * 8}${unit}`;
  scale['9'] = `${baseSize * 9}${unit}`;
  scale['10'] = `${baseSize * 10}${unit}`;
  scale['11'] = `${baseSize * 11}${unit}`;
  scale['12'] = `${baseSize * 12}${unit}`;
  scale['14'] = `${baseSize * 14}${unit}`;
  scale['16'] = `${baseSize * 16}${unit}`;
  scale['20'] = `${baseSize * 20}${unit}`;
  scale['24'] = `${baseSize * 24}${unit}`;
  scale['28'] = `${baseSize * 28}${unit}`;
  scale['32'] = `${baseSize * 32}${unit}`;
  scale['36'] = `${baseSize * 36}${unit}`;
  scale['40'] = `${baseSize * 40}${unit}`;
  scale['44'] = `${baseSize * 44}${unit}`;
  scale['48'] = `${baseSize * 48}${unit}`;
  scale['52'] = `${baseSize * 52}${unit}`;
  scale['56'] = `${baseSize * 56}${unit}`;
  scale['60'] = `${baseSize * 60}${unit}`;
  scale['64'] = `${baseSize * 64}${unit}`;
  scale['72'] = `${baseSize * 72}${unit}`;
  scale['80'] = `${baseSize * 80}${unit}`;
  scale['96'] = `${baseSize * 96}${unit}`;
  
  return scale;
}

/**
 * Generate an alternative geometric spacing scale with a consistent ratio between steps
 */
export function generateGeometricScale(
  baseSize: number, 
  unit: 'px' | 'rem' | 'em' = 'rem', 
  ratio: number = 1.5,
  steps: number = 12
): Record<string, string> {
  const scale: Record<string, string> = {};
  
  // Add base values
  scale['0'] = '0';
  scale['px'] = '1px';
  
  // Generate the scale values
  for (let i = 0; i <= steps; i++) {
    const value = baseSize * Math.pow(ratio, i);
    const roundedValue = Math.round(value * 100) / 100; // Round to 2 decimal places
    
    if (i === 0) {
      scale['1'] = `${roundedValue}${unit}`;
    } else {
      scale[`${i + 1}`] = `${roundedValue}${unit}`;
    }
  }
  
  return scale;
}

/**
 * Generate CSS variables for spacing settings
 */
export function generateSpacingCssVariables(settings: SpacingSettings): Record<string, string> {
  const variables: Record<string, string> = {};
  
  // Add spacing scale variables
  Object.entries(settings.scale.values).forEach(([key, value]) => {
    variables[`--space-${key}`] = value;
  });
  
  // Add layout variables
  variables['--content-width'] = settings.layout.contentWidth;
  variables['--max-width'] = settings.layout.maxWidth;
  
  // Add grid system variables
  variables['--grid-columns'] = settings.layout.gridSystem.columns.toString();
  variables['--grid-column-width'] = settings.layout.gridSystem.columnWidth;
  variables['--grid-gutter'] = settings.layout.gridSystem.gutter;
  variables['--grid-margins'] = settings.layout.gridSystem.margins;
  
  // Add breakpoint variables
  Object.entries(settings.layout.gridSystem.breakpoints).forEach(([name, value]) => {
    variables[`--breakpoint-${name}`] = `${value}px`;
  });
  
  // Add container padding variables
  Object.entries(settings.layout.containerPadding).forEach(([size, value]) => {
    variables[`--container-padding-${size}`] = value;
  });
  
  // Add section spacing variables
  Object.entries(settings.layout.sectionSpacing).forEach(([size, value]) => {
    variables[`--section-spacing-${size}`] = value;
  });
  
  // Add component spacing variables
  Object.entries(settings.layout.componentSpacing).forEach(([size, value]) => {
    variables[`--component-spacing-${size}`] = value;
  });
  
  return variables;
}

/**
 * Generate a grid system layout based on specified parameters
 */
export function generateGridSystem(
  columns: number, 
  maxWidth: string, 
  gutter: string
): GridSystem {
  return {
    columns,
    columnWidth: 'minmax(0, 1fr)',
    gutter,
    margins: gutter,
    breakpoints: {
      xs: 0,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      xxl: 1400,
    },
  };
}

/**
 * Convert pixel values to rem values based on a root font size
 */
export function pxToRem(px: number, rootFontSize: number = 16): string {
  return `${px / rootFontSize}rem`;
}

/**
 * Convert rem values to pixel values based on a root font size
 */
export function remToPx(rem: number, rootFontSize: number = 16): string {
  return `${rem * rootFontSize}px`;
}