/**
 * Default Themes - 2025 Edition
 * 
 * A collection of beautifully crafted default themes using our design token system.
 * These themes serve as starting points and inspiration for theme customization.
 */

import { Theme, ThemeVariant } from './designTokens';
import { 
  createThemeFromPalette, 
  createThemeFromColor, 
  createThemeFromPredefinedPalette, 
  fontStacks
} from './themeCreator';

/**
 * Modern Business
 * A professional, clean theme with blue accents, suitable for most business types
 */
export const modernBusiness: Theme = createThemeFromPalette(
  {
    primary: '#0ea5e9',   // Sky 500
    secondary: '#3b82f6', // Blue 500
    accent: '#8b5cf6',    // Violet 500
    background: '#ffffff',
    text: '#1e293b',      // Slate 800
  },
  {
    id: 'modern-business',
    name: 'Modern Business',
    description: 'A clean, professional theme with blue accents, perfect for corporate and service businesses.',
    author: 'System',
    version: '1.0.0',
    tags: ['professional', 'business', 'clean', 'modern'],
    industry: 'business',
    featured: true,
  },
  {
    variant: 'professional',
    borderRadius: 6,
    fontFamily: {
      heading: fontStacks.display,
      body: fontStacks.sans,
    },
    shadowIntensity: 'soft',
  }
);

/**
 * Dark Professional
 * A sophisticated dark theme with purple accents
 */
export const darkProfessional: Theme = createThemeFromPalette(
  {
    primary: '#a78bfa',   // Violet 400
    secondary: '#8b5cf6', // Violet 500
    accent: '#f59e0b',    // Amber 500
    background: '#1e1e2f', // Custom dark blue-purple
    text: '#e2e8f0',      // Slate 200
  },
  {
    id: 'dark-professional',
    name: 'Dark Professional',
    description: 'A sophisticated dark theme with purple accents, perfect for creative professionals.',
    author: 'System',
    version: '1.0.0',
    tags: ['dark', 'professional', 'creative', 'modern'],
    industry: 'creative',
    featured: true,
  },
  {
    variant: 'professional',
    borderRadius: 8,
    fontFamily: {
      heading: fontStacks.display,
      body: fontStacks.sans,
    },
    shadowIntensity: 'medium',
  }
);

/**
 * Salon Elegante
 * An elegant, sophisticated theme for salons and spas with luxury aesthetics
 */
export const salonElegante: Theme = createThemeFromPalette(
  {
    primary: '#00CC00',    // Salon Elegante green
    secondary: '#9333EA',  // Purple 600
    accent: '#9333EA',     // Purple 600
    background: '#ffffff',
    text: '#111827',       // Gray 900
  },
  {
    id: 'salon-elegante',
    name: 'Salon Elegante',
    description: 'An elegant theme with sophisticated typography and styling, perfect for salons and spas.',
    author: 'System',
    version: '1.0.0',
    tags: ['elegant', 'luxury', 'salon', 'spa'],
    industry: 'beauty',
    featured: true,
  },
  {
    variant: 'elegant',
    borderRadius: 4,
    fontFamily: {
      heading: fontStacks.serif,
      body: fontStacks.sans,
    },
    shadowIntensity: 'soft',
  }
);

/**
 * Creative Studio
 * A vibrant theme with gradients and expressive colors for creative businesses
 */
export const creativeStudio: Theme = createThemeFromPalette(
  {
    primary: '#ec4899',   // Pink 500
    secondary: '#8b5cf6', // Violet 500
    accent: '#3b82f6',    // Blue 500
    background: '#ffffff',
    text: '#111827',      // Gray 900
  },
  {
    id: 'creative-studio',
    name: 'Creative Studio',
    description: 'A vibrant and expressive theme with bold colors, perfect for creative businesses and studios.',
    author: 'System',
    version: '1.0.0',
    tags: ['creative', 'colorful', 'bold', 'expressive'],
    industry: 'creative',
    featured: true,
  },
  {
    variant: 'vibrant',
    borderRadius: 12,
    fontFamily: {
      heading: fontStacks.display,
      body: fontStacks.sans,
    },
    shadowIntensity: 'sharp',
    animationSpeed: 'fast',
  }
);

/**
 * Tech Startup
 * A modern, minimal theme with clean lines and a tech-focused aesthetic
 */
export const techStartup: Theme = createThemeFromPalette(
  {
    primary: '#06b6d4',   // Cyan 500
    secondary: '#0ea5e9', // Sky 500
    accent: '#14b8a6',    // Teal 500
    background: '#f8fafc', // Slate 50
    text: '#0f172a',      // Slate 900
  },
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    description: 'A clean, modern theme with a tech-focused aesthetic, perfect for startups and tech companies.',
    author: 'System',
    version: '1.0.0',
    tags: ['tech', 'startup', 'modern', 'minimal'],
    industry: 'technology',
    featured: true,
  },
  {
    variant: 'minimal',
    borderRadius: 6,
    fontFamily: {
      heading: fontStacks.sans,
      body: fontStacks.sans,
      mono: fontStacks.mono,
    },
    shadowIntensity: 'medium',
  }
);

/**
 * Wellness & Health
 * A calm, nurturing theme with organic colors for wellness businesses
 */
export const wellness: Theme = createThemeFromPalette(
  {
    primary: '#10b981',   // Emerald 500
    secondary: '#14b8a6', // Teal 500
    accent: '#06b6d4',    // Cyan 500
    background: '#f8fafc', // Slate 50
    text: '#1e293b',      // Slate 800
  },
  {
    id: 'wellness',
    name: 'Wellness & Health',
    description: 'A calm and nurturing theme with organic colors, perfect for wellness, health, and yoga businesses.',
    author: 'System',
    version: '1.0.0',
    tags: ['wellness', 'health', 'calm', 'organic'],
    industry: 'health',
    featured: true,
  },
  {
    variant: 'professional',
    borderRadius: 12,
    fontFamily: {
      heading: fontStacks.display,
      body: fontStacks.sans,
    },
    shadowIntensity: 'soft',
    animationSpeed: 'slow',
  }
);

/**
 * Culinary Experience
 * A warm, inviting theme for restaurants and food services
 */
export const culinary: Theme = createThemeFromPalette(
  {
    primary: '#f97316',   // Orange
    secondary: '#ea580c', // Orange 600
    accent: '#84cc16',    // Lime 500
    background: '#ffffff',
    text: '#44403c',      // Stone 700
  },
  {
    id: 'culinary',
    name: 'Culinary Experience',
    description: 'A warm and inviting theme with appetizing colors, perfect for restaurants and food services.',
    author: 'System',
    version: '1.0.0',
    tags: ['food', 'restaurant', 'culinary', 'warm'],
    industry: 'food',
    featured: true,
  },
  {
    variant: 'vibrant',
    borderRadius: 8,
    fontFamily: {
      heading: fontStacks.serif,
      body: fontStacks.sans,
    },
    shadowIntensity: 'medium',
  }
);

/**
 * Retail & Shopping
 * A clean, commerce-focused theme with strong call-to-actions
 */
export const retail: Theme = createThemeFromPalette(
  {
    primary: '#ef4444',   // Red 500
    secondary: '#f97316', // Orange 500
    accent: '#f59e0b',    // Amber 500
    background: '#ffffff',
    text: '#111827',      // Gray 900
  },
  {
    id: 'retail',
    name: 'Retail & Shopping',
    description: 'A commerce-focused theme with strong call-to-actions, perfect for retail and e-commerce.',
    author: 'System',
    version: '1.0.0',
    tags: ['retail', 'shopping', 'commerce', 'bold'],
    industry: 'retail',
    featured: true,
  },
  {
    variant: 'professional',
    borderRadius: 4,
    fontFamily: {
      heading: fontStacks.sans,
      body: fontStacks.sans,
    },
    shadowIntensity: 'medium',
  }
);

/**
 * Education & Learning
 * A friendly, accessible theme for educational institutions
 */
export const education: Theme = createThemeFromPalette(
  {
    primary: '#3b82f6',   // Blue 500
    secondary: '#4f46e5', // Indigo 600
    accent: '#22c55e',    // Green 500
    background: '#ffffff',
    text: '#1e293b',      // Slate 800
  },
  {
    id: 'education',
    name: 'Education & Learning',
    description: 'A friendly and accessible theme, perfect for schools, universities, and learning platforms.',
    author: 'System',
    version: '1.0.0',
    tags: ['education', 'learning', 'friendly', 'accessible'],
    industry: 'education',
    featured: true,
  },
  {
    variant: 'professional',
    borderRadius: 8,
    fontFamily: {
      heading: fontStacks.display,
      body: fontStacks.sans,
    },
    shadowIntensity: 'soft',
  }
);

/**
 * Minimal Light
 * A clean, minimalist light theme with subtle styling
 */
export const minimalLight: Theme = createThemeFromPalette(
  {
    primary: '#434190',   // Indigo 800
    secondary: '#5a67d8', // Indigo 600
    accent: '#667eea',    // Indigo 500
    background: '#ffffff',
    text: '#1a202c',      // Gray 900
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'A clean, minimalist light theme with subtle styling, perfect for content-focused applications.',
    author: 'System',
    version: '1.0.0',
    tags: ['minimal', 'light', 'clean', 'modern'],
    industry: 'general',
    featured: true,
  },
  {
    variant: 'minimal',
    borderRadius: 4,
    fontFamily: {
      heading: fontStacks.sans,
      body: fontStacks.sans,
    },
    shadowIntensity: 'soft',
  }
);

/**
 * Minimal Dark
 * A clean, minimalist dark theme with subtle styling
 */
export const minimalDark: Theme = createThemeFromPalette(
  {
    primary: '#667eea',   // Indigo 500
    secondary: '#5a67d8', // Indigo 600
    accent: '#7f9cf5',    // Indigo 400
    background: '#1a202c', // Gray 900
    text: '#f7fafc',      // Gray 100
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'A clean, minimalist dark theme with subtle styling, perfect for content-focused applications.',
    author: 'System',
    version: '1.0.0',
    tags: ['minimal', 'dark', 'clean', 'modern'],
    industry: 'general',
    featured: true,
  },
  {
    variant: 'minimal',
    borderRadius: 4,
    fontFamily: {
      heading: fontStacks.sans,
      body: fontStacks.sans,
    },
    shadowIntensity: 'medium',
  }
);

/**
 * Collection of all default themes
 */
export const defaultThemes: Record<string, Theme> = {
  modernBusiness,
  darkProfessional,
  salonElegante,
  creativeStudio,
  techStartup,
  wellness,
  culinary,
  retail,
  education,
  minimalLight,
  minimalDark,
};

/**
 * Default theme categories
 */
export const themeCategories = [
  {
    id: 'featured',
    name: 'Featured',
    description: 'Our selection of standout themes',
    themes: [salonElegante, darkProfessional, modernBusiness, creativeStudio, techStartup],
  },
  {
    id: 'business',
    name: 'Business & Professional',
    description: 'Themes for service-based and professional businesses',
    themes: [modernBusiness, techStartup, retail],
  },
  {
    id: 'creative',
    name: 'Creative & Design',
    description: 'Expressive themes for creative industries',
    themes: [creativeStudio, darkProfessional],
  },
  {
    id: 'minimal',
    name: 'Minimal & Clean',
    description: 'Simple, clean themes that focus on content',
    themes: [minimalLight, minimalDark],
  },
  {
    id: 'industry',
    name: 'Industry-Specific',
    description: 'Themes tailored to specific industries',
    themes: [salonElegante, wellness, culinary, education],
  },
  {
    id: 'dark',
    name: 'Dark Themes',
    description: 'Sophisticated dark mode themes',
    themes: [darkProfessional, minimalDark],
  },
];

/**
 * Get a specific theme by ID
 */
export function getThemeById(id: string): Theme | undefined {
  // Check all themes for matching ID
  for (const theme of Object.values(defaultThemes)) {
    if (theme.metadata.id === id) {
      return theme;
    }
  }
  
  // If not found, return undefined
  return undefined;
}

/**
 * Get themes by category
 */
export function getThemesByCategory(categoryId: string): Theme[] {
  const category = themeCategories.find(cat => cat.id === categoryId);
  return category ? category.themes : [];
}

/**
 * Get themes by industry
 */
export function getThemesByIndustry(industry: string): Theme[] {
  return Object.values(defaultThemes).filter(
    theme => theme.metadata.industry === industry
  );
}

/**
 * Get featured themes
 */
export function getFeaturedThemes(): Theme[] {
  return Object.values(defaultThemes).filter(
    theme => theme.metadata.featured
  );
}

/**
 * Get themes by tag
 */
export function getThemesByTag(tag: string): Theme[] {
  return Object.values(defaultThemes).filter(
    theme => theme.metadata.tags.includes(tag)
  );
}

/**
 * Get the Salon Elegante theme
 * This is a convenience function as this theme is specifically mentioned in the requirements
 */
export function getSalonEleganteTheme(): Theme {
  return salonElegante;
}

/**
 * The system default theme used when no theme is explicitly selected
 */
export const systemDefaultTheme = modernBusiness;