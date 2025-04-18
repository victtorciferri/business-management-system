/**
 * Seasonal Themes - 2025 Edition
 * 
 * A collection of specialized themes for seasonal events and holidays.
 * These themes can be used for temporary promotions or seasonal branding.
 */

import { Theme } from './designTokens';
import { createThemeFromPalette, fontStacks } from './themeCreator';

/**
 * Winter Holiday
 * A festive winter holiday theme with red, green, and gold
 */
export const winterHoliday: Theme = createThemeFromPalette(
  {
    primary: '#dc2626',   // Red 600
    secondary: '#16a34a', // Green 600
    accent: '#fbbf24',    // Amber 400
    background: '#ffffff',
    text: '#111827',      // Gray 900
  },
  {
    id: 'winter-holiday',
    name: 'Winter Holiday',
    description: 'A festive winter holiday theme with traditional colors, perfect for end-of-year promotions.',
    author: 'System',
    version: '1.0.0',
    tags: ['holiday', 'winter', 'festive', 'seasonal'],
    industry: 'retail',
    featured: false,
    seasonal: true,
  },
  {
    variant: 'vibrant',
    borderRadius: 8,
    fontFamily: {
      heading: fontStacks.display,
      body: fontStacks.sans,
    },
    shadowIntensity: 'medium',
  }
);

/**
 * Valentine's Day
 * A romantic theme with pinks and reds
 */
export const valentinesDay: Theme = createThemeFromPalette(
  {
    primary: '#be185d',   // Pink 800
    secondary: '#ec4899', // Pink 500
    accent: '#f43f5e',    // Rose 500
    background: '#fff1f2', // Rose 50
    text: '#881337',      // Rose 900
  },
  {
    id: 'valentines',
    name: "Valentine's Day",
    description: 'A romantic theme with soft pinks and bold reds, perfect for Valentine\'s promotions.',
    author: 'System',
    version: '1.0.0',
    tags: ['valentine', 'love', 'romantic', 'seasonal'],
    industry: 'retail',
    featured: false,
    seasonal: true,
  },
  {
    variant: 'elegant',
    borderRadius: 12,
    fontFamily: {
      heading: fontStacks.elegant,
      body: fontStacks.sans,
    },
    shadowIntensity: 'soft',
  }
);

/**
 * Spring Theme
 * A fresh, vibrant theme with spring colors
 */
export const spring: Theme = createThemeFromPalette(
  {
    primary: '#10b981',   // Emerald 500
    secondary: '#8b5cf6', // Violet 500
    accent: '#fbbf24',    // Amber 400
    background: '#f0fdf4', // Green 50
    text: '#064e3b',      // Emerald 900
  },
  {
    id: 'spring',
    name: 'Spring',
    description: 'A fresh and vibrant theme with spring colors, perfect for springtime promotions.',
    author: 'System',
    version: '1.0.0',
    tags: ['spring', 'fresh', 'vibrant', 'seasonal'],
    industry: 'general',
    featured: false,
    seasonal: true,
  },
  {
    variant: 'vibrant',
    borderRadius: 8,
    fontFamily: {
      heading: fontStacks.display,
      body: fontStacks.sans,
    },
    shadowIntensity: 'soft',
  }
);

/**
 * Summer Theme
 * A bright, sunny theme with summer colors
 */
export const summer: Theme = createThemeFromPalette(
  {
    primary: '#0ea5e9',   // Sky 500
    secondary: '#fbbf24', // Amber 400
    accent: '#f43f5e',    // Rose 500
    background: '#ffffff',
    text: '#0c4a6e',      // Sky 900
  },
  {
    id: 'summer',
    name: 'Summer',
    description: 'A bright and sunny theme with summer colors, perfect for summer promotions.',
    author: 'System',
    version: '1.0.0',
    tags: ['summer', 'bright', 'sunny', 'seasonal'],
    industry: 'general',
    featured: false,
    seasonal: true,
  },
  {
    variant: 'vibrant',
    borderRadius: 8,
    fontFamily: {
      heading: fontStacks.display,
      body: fontStacks.sans,
    },
    shadowIntensity: 'medium',
  }
);

/**
 * Fall/Autumn Theme
 * A warm, earthy theme with autumn colors
 */
export const fall: Theme = createThemeFromPalette(
  {
    primary: '#d97706',   // Amber 600
    secondary: '#b45309', // Amber 700
    accent: '#65a30d',    // Lime 600
    background: '#fffbeb', // Amber 50
    text: '#713f12',      // Stone 800
  },
  {
    id: 'fall',
    name: 'Fall/Autumn',
    description: 'A warm and earthy theme with autumn colors, perfect for fall promotions.',
    author: 'System',
    version: '1.0.0',
    tags: ['fall', 'autumn', 'warm', 'seasonal'],
    industry: 'general',
    featured: false,
    seasonal: true,
  },
  {
    variant: 'professional',
    borderRadius: 6,
    fontFamily: {
      heading: fontStacks.serif,
      body: fontStacks.sans,
    },
    shadowIntensity: 'medium',
  }
);

/**
 * Halloween Theme
 * A spooky theme with orange and purple
 */
export const halloween: Theme = createThemeFromPalette(
  {
    primary: '#f97316',   // Orange 500
    secondary: '#7c3aed', // Violet 600
    accent: '#84cc16',    // Lime 500
    background: '#18181b', // Zinc 900
    text: '#f97316',      // Orange 500
  },
  {
    id: 'halloween',
    name: 'Halloween',
    description: 'A spooky theme with Halloween colors, perfect for Halloween promotions.',
    author: 'System',
    version: '1.0.0',
    tags: ['halloween', 'spooky', 'dark', 'seasonal'],
    industry: 'retail',
    featured: false,
    seasonal: true,
  },
  {
    variant: 'vibrant',
    borderRadius: 4,
    fontFamily: {
      heading: fontStacks.display,
      body: fontStacks.sans,
    },
    shadowIntensity: 'sharp',
  }
);

/**
 * Black Friday
 * A bold theme for Black Friday sales
 */
export const blackFriday: Theme = createThemeFromPalette(
  {
    primary: '#ef4444',   // Red 500
    secondary: '#18181b', // Zinc 900
    accent: '#fbbf24',    // Amber 400
    background: '#18181b', // Zinc 900
    text: '#f4f4f5',      // Zinc 100
  },
  {
    id: 'black-friday',
    name: 'Black Friday',
    description: 'A bold theme with high contrast, perfect for Black Friday sales and promotions.',
    author: 'System',
    version: '1.0.0',
    tags: ['black-friday', 'sales', 'retail', 'seasonal'],
    industry: 'retail',
    featured: false,
    seasonal: true,
  },
  {
    variant: 'vibrant',
    borderRadius: 0,
    fontFamily: {
      heading: fontStacks.display,
      body: fontStacks.sans,
    },
    shadowIntensity: 'sharp',
  }
);

/**
 * Collection of all seasonal themes
 */
export const seasonalThemes: Record<string, Theme> = {
  winterHoliday,
  valentinesDay,
  spring,
  summer,
  fall,
  halloween,
  blackFriday,
};

/**
 * Seasonal theme categories
 */
export const seasonalThemeCategories = [
  {
    id: 'winter',
    name: 'Winter Themes',
    description: 'Themes for winter holidays and events',
    themes: [winterHoliday, blackFriday],
  },
  {
    id: 'spring',
    name: 'Spring Themes',
    description: 'Themes for spring holidays and events',
    themes: [spring, valentinesDay],
  },
  {
    id: 'summer',
    name: 'Summer Themes',
    description: 'Themes for summer holidays and events',
    themes: [summer],
  },
  {
    id: 'fall',
    name: 'Fall Themes',
    description: 'Themes for fall holidays and events',
    themes: [fall, halloween],
  },
];