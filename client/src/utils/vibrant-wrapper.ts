/**
 * Wrapper for node-vibrant to handle correct imports and provide a consistent API
 * Avoids the ESM/CJS issues with node-vibrant module
 */

// Use dynamic import with ES module interop
let Vibrant: any;

// Define types for the Vibrant module
export interface Swatch {
  hex: string;
  rgb: number[];
  hsl: number[];
  population: number;
  bodyTextColor: string;
  titleTextColor: string;
  getHex(): string;
}

export interface Palette {
  Vibrant?: Swatch;
  Muted?: Swatch;
  DarkVibrant?: Swatch;
  DarkMuted?: Swatch;
  LightVibrant?: Swatch;
  LightMuted?: Swatch;
  [key: string]: Swatch | undefined;
}

export interface VibrantInstance {
  getPalette(): Promise<Palette>;
}

// Mock palette for when Vibrant fails to load or process
const mockPalette: Palette = {
  Vibrant: {
    hex: '#4285F4',
    rgb: [66, 133, 244],
    hsl: [217, 89, 61],
    population: 0,
    bodyTextColor: '#FFFFFF',
    titleTextColor: '#FFFFFF',
    getHex: () => '#4285F4'
  },
  DarkVibrant: {
    hex: '#0D47A1',
    rgb: [13, 71, 161],
    hsl: [217, 85, 34],
    population: 0,
    bodyTextColor: '#FFFFFF',
    titleTextColor: '#FFFFFF',
    getHex: () => '#0D47A1'
  },
  LightVibrant: {
    hex: '#BBDEFB',
    rgb: [187, 222, 251],
    hsl: [207, 89, 86],
    population: 0,
    bodyTextColor: '#000000',
    titleTextColor: '#000000',
    getHex: () => '#BBDEFB'
  },
  Muted: {
    hex: '#7986CB',
    rgb: [121, 134, 203],
    hsl: [230, 44, 64],
    population: 0,
    bodyTextColor: '#FFFFFF',
    titleTextColor: '#FFFFFF',
    getHex: () => '#7986CB'
  },
  DarkMuted: {
    hex: '#303F9F',
    rgb: [48, 63, 159],
    hsl: [231, 54, 41],
    population: 0,
    bodyTextColor: '#FFFFFF',
    titleTextColor: '#FFFFFF',
    getHex: () => '#303F9F'
  },
  LightMuted: {
    hex: '#C5CAE9',
    rgb: [197, 202, 233],
    hsl: [232, 45, 84],
    population: 0,
    bodyTextColor: '#000000',
    titleTextColor: '#000000',
    getHex: () => '#C5CAE9'
  }
};

// Attempt to load Vibrant dynamically at runtime
async function loadVibrant() {
  if (!Vibrant) {
    try {
      // Direct import using require syntax
      const nodeVibrant = await import('node-vibrant');
      
      // Try different ways to access the 'from' method
      if (nodeVibrant.from) {
        Vibrant = nodeVibrant;
      } else if (nodeVibrant.default && nodeVibrant.default.from) {
        Vibrant = nodeVibrant.default;
      } else if (nodeVibrant.Vibrant && nodeVibrant.Vibrant.from) {
        Vibrant = nodeVibrant.Vibrant;
      } else {
        console.error('Could not find Vibrant.from in imported module');
        return null;
      }
    } catch (error) {
      console.error('Failed to load node-vibrant:', error);
      return null;
    }
  }
  return Vibrant;
}

// Extract colors from an image
export async function extractColors(src: string | Blob): Promise<Palette> {
  try {
    const vibrantModule = await loadVibrant();
    
    if (!vibrantModule) {
      console.warn('Using mock palette as node-vibrant could not be loaded');
      return mockPalette;
    }
    
    const vibrantInstance = vibrantModule.from(src);
    return await vibrantInstance.getPalette();
  } catch (error) {
    console.error('Error extracting colors:', error);
    return mockPalette;
  }
}

// Export the utility functions
export default {
  extractColors
};