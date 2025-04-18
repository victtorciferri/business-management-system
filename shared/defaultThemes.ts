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
// Initial themes export
const initialThemes: Record<string, Theme> = {
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
const initialThemeCategories = [
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
  const category = initialThemeCategories.find(cat => cat.id === categoryId);
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
 * Financial Services
 * A trustworthy, secure theme for financial institutions and services
 */
export const financial: Theme = createThemeFromPalette(
  {
    primary: '#065f46',   // Emerald 800
    secondary: '#047857', // Emerald 700
    accent: '#0891b2',    // Cyan 600
    background: '#ffffff',
    text: '#1e293b',      // Slate 800
  },
  {
    id: 'financial',
    name: 'Financial Services',
    description: 'A trustworthy and secure theme, perfect for financial institutions, banks, and financial services.',
    author: 'System',
    version: '1.0.0',
    tags: ['financial', 'professional', 'secure', 'trustworthy'],
    industry: 'finance',
    featured: false,
  },
  {
    variant: 'professional',
    borderRadius: 4,
    fontFamily: {
      heading: fontStacks.display,
      body: fontStacks.sans,
    },
    shadowIntensity: 'medium',
  }
);

/**
 * Legal Services
 * A professional, authoritative theme for legal services
 */
export const legal: Theme = createThemeFromPalette(
  {
    primary: '#1e40af',   // Blue 800
    secondary: '#1d4ed8', // Blue 700
    accent: '#4f46e5',    // Indigo 600
    background: '#f8fafc', // Slate 50
    text: '#0f172a',      // Slate 900
  },
  {
    id: 'legal',
    name: 'Legal Services',
    description: 'A professional and authoritative theme, perfect for law firms, legal practices, and legal services.',
    author: 'System',
    version: '1.0.0',
    tags: ['legal', 'professional', 'authoritative', 'serious'],
    industry: 'legal',
    featured: false,
  },
  {
    variant: 'professional',
    borderRadius: 4,
    fontFamily: {
      heading: fontStacks.serif,
      body: fontStacks.sans,
    },
    shadowIntensity: 'soft',
  }
);

/**
 * Healthcare
 * A clean, trusted theme for healthcare services
 */
export const healthcare: Theme = createThemeFromPalette(
  {
    primary: '#0891b2',   // Cyan 600
    secondary: '#0e7490', // Cyan 700
    accent: '#14b8a6',    // Teal 500
    background: '#ffffff',
    text: '#1e293b',      // Slate 800
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'A clean and trusted theme, perfect for hospitals, clinics, and healthcare providers.',
    author: 'System',
    version: '1.0.0',
    tags: ['healthcare', 'medical', 'clean', 'professional'],
    industry: 'healthcare',
    featured: false,
  },
  {
    variant: 'professional',
    borderRadius: 8,
    fontFamily: {
      heading: fontStacks.sans,
      body: fontStacks.sans,
    },
    shadowIntensity: 'soft',
  }
);

/**
 * Real Estate
 * A spacious, elegant theme for real estate businesses
 */
export const realEstate: Theme = createThemeFromPalette(
  {
    primary: '#475569',   // Slate 600
    secondary: '#334155', // Slate 700
    accent: '#f59e0b',    // Amber 500
    background: '#ffffff',
    text: '#111827',      // Gray 900
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    description: 'A spacious and elegant theme, perfect for real estate agencies, property management, and realtors.',
    author: 'System',
    version: '1.0.0',
    tags: ['real-estate', 'property', 'elegant', 'professional'],
    industry: 'real-estate',
    featured: false,
  },
  {
    variant: 'elegant',
    borderRadius: 6,
    fontFamily: {
      heading: fontStacks.serif,
      body: fontStacks.sans,
    },
    shadowIntensity: 'medium',
  }
);

/**
 * Fitness
 * An energetic, motivational theme for fitness businesses
 */
export const fitness: Theme = createThemeFromPalette(
  {
    primary: '#dc2626',   // Red 600
    secondary: '#b91c1c', // Red 700
    accent: '#fbbf24',    // Amber 400
    background: '#f9fafb', // Gray 50
    text: '#1f2937',      // Gray 800
  },
  {
    id: 'fitness',
    name: 'Fitness',
    description: 'An energetic and motivational theme, perfect for gyms, fitness studios, and personal trainers.',
    author: 'System',
    version: '1.0.0',
    tags: ['fitness', 'gym', 'energetic', 'bold'],
    industry: 'fitness',
    featured: false,
  },
  {
    variant: 'vibrant',
    borderRadius: 8,
    fontFamily: {
      heading: fontStacks.sans,
      body: fontStacks.sans,
    },
    shadowIntensity: 'sharp',
    animationSpeed: 'fast',
  }
);

/**
 * Wedding & Events
 * A romantic, elegant theme for wedding and event planners
 */
export const wedding: Theme = createThemeFromPalette(
  {
    primary: '#be185d',   // Pink 800
    secondary: '#db2777', // Pink 600
    accent: '#c084fc',    // Purple 400
    background: '#fffbf5', // Custom cream
    text: '#713f12',      // Stone 800
  },
  {
    id: 'wedding',
    name: 'Wedding & Events',
    description: 'A romantic and elegant theme, perfect for wedding planners, event organizers, and venues.',
    author: 'System',
    version: '1.0.0',
    tags: ['wedding', 'events', 'romantic', 'elegant'],
    industry: 'events',
    featured: false,
  },
  {
    variant: 'elegant',
    borderRadius: 12,
    fontFamily: {
      heading: fontStacks.serif,
      body: fontStacks.sans,
    },
    shadowIntensity: 'soft',
    animationSpeed: 'normal',
  }
);

/**
 * Manufacturing
 * A robust, industrial theme for manufacturing and industrial businesses
 */
export const manufacturing: Theme = createThemeFromPalette(
  {
    primary: '#f59e0b',   // Amber 500
    secondary: '#d97706', // Amber 600
    accent: '#404040',    // Gray 700
    background: '#f5f5f5', // Gray 100
    text: '#262626',      // Gray 800
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    description: 'A robust and industrial theme, perfect for manufacturing, construction, and industrial businesses.',
    author: 'System',
    version: '1.0.0',
    tags: ['manufacturing', 'industrial', 'construction', 'robust'],
    industry: 'manufacturing',
    featured: false,
  },
  {
    variant: 'professional',
    borderRadius: 2,
    fontFamily: {
      heading: fontStacks.sans,
      body: fontStacks.sans,
    },
    shadowIntensity: 'sharp',
  }
);

/**
 * High Contrast Light
 * An accessibility-focused light theme with maximum contrast
 */
export const highContrastLight: Theme = createThemeFromPalette(
  {
    primary: '#000000',   // Black
    secondary: '#0000EE', // Bright blue
    accent: '#8B0000',    // Dark red
    background: '#ffffff', // White
    text: '#000000',      // Black
  },
  {
    id: 'high-contrast-light',
    name: 'High Contrast Light',
    description: 'An accessibility-focused light theme with maximum contrast for readability.',
    author: 'System',
    version: '1.0.0',
    tags: ['accessibility', 'high-contrast', 'light', 'readable'],
    industry: 'general',
    featured: false,
  },
  {
    variant: 'minimal',
    borderRadius: 4,
    fontFamily: {
      heading: fontStacks.sansAccessible,
      body: fontStacks.sansAccessible,
    },
    shadowIntensity: 'none',
    contrastLevel: 'maximum',
  }
);

/**
 * High Contrast Dark
 * An accessibility-focused dark theme with maximum contrast
 */
export const highContrastDark: Theme = createThemeFromPalette(
  {
    primary: '#ffffff',   // White
    secondary: '#55FFFF', // Bright cyan
    accent: '#FFD700',    // Gold
    background: '#000000', // Black
    text: '#ffffff',      // White
  },
  {
    id: 'high-contrast-dark',
    name: 'High Contrast Dark',
    description: 'An accessibility-focused dark theme with maximum contrast for readability.',
    author: 'System',
    version: '1.0.0',
    tags: ['accessibility', 'high-contrast', 'dark', 'readable'],
    industry: 'general',
    featured: false,
  },
  {
    variant: 'minimal',
    borderRadius: 4,
    fontFamily: {
      heading: fontStacks.sansAccessible,
      body: fontStacks.sansAccessible,
    },
    shadowIntensity: 'none',
    contrastLevel: 'maximum',
  }
);

/**
 * Monochrome Light
 * A sophisticated black and white light theme
 */
export const monochromeLight: Theme = createThemeFromPalette(
  {
    primary: '#000000',   // Black
    secondary: '#404040', // Gray 700
    accent: '#737373',    // Gray 500
    background: '#ffffff', // White
    text: '#171717',      // Gray 900
  },
  {
    id: 'monochrome-light',
    name: 'Monochrome Light',
    description: 'A sophisticated black and white theme with clean, minimalist aesthetics.',
    author: 'System',
    version: '1.0.0',
    tags: ['monochrome', 'black-and-white', 'light', 'minimal'],
    industry: 'general',
    featured: false,
  },
  {
    variant: 'minimal',
    borderRadius: 0,
    fontFamily: {
      heading: fontStacks.sans,
      body: fontStacks.sans,
      mono: fontStacks.mono,
    },
    shadowIntensity: 'soft',
  }
);

/**
 * Monochrome Dark
 * A sophisticated black and white dark theme
 */
export const monochromeDark: Theme = createThemeFromPalette(
  {
    primary: '#ffffff',   // White
    secondary: '#d4d4d4', // Gray 300
    accent: '#a3a3a3',    // Gray 400
    background: '#171717', // Gray 900
    text: '#fafafa',      // Gray 50
  },
  {
    id: 'monochrome-dark',
    name: 'Monochrome Dark',
    description: 'A sophisticated black and white dark theme with clean, minimalist aesthetics.',
    author: 'System',
    version: '1.0.0',
    tags: ['monochrome', 'black-and-white', 'dark', 'minimal'],
    industry: 'general',
    featured: false,
  },
  {
    variant: 'minimal',
    borderRadius: 0,
    fontFamily: {
      heading: fontStacks.sans,
      body: fontStacks.sans,
      mono: fontStacks.mono,
    },
    shadowIntensity: 'medium',
  }
);

/**
 * Standard Light
 * Our default light theme with balanced aesthetics
 */
export const standardLight: Theme = createThemeFromPalette(
  {
    primary: '#3b82f6',   // Blue 500
    secondary: '#6366f1', // Indigo 500
    accent: '#8b5cf6',    // Violet 500
    background: '#ffffff', // White
    text: '#111827',      // Gray 900
  },
  {
    id: 'standard-light',
    name: 'Standard Light',
    description: 'Our default light theme with balanced aesthetics, suitable for most applications.',
    author: 'System',
    version: '1.0.0',
    tags: ['standard', 'light', 'balanced', 'default'],
    industry: 'general',
    featured: false,
  },
  {
    variant: 'professional',
    borderRadius: 6,
    fontFamily: {
      heading: fontStacks.sans,
      body: fontStacks.sans,
    },
    shadowIntensity: 'medium',
  }
);

/**
 * Standard Dark
 * Our default dark theme with balanced aesthetics
 */
export const standardDark: Theme = createThemeFromPalette(
  {
    primary: '#60a5fa',   // Blue 400
    secondary: '#818cf8', // Indigo 400
    accent: '#a78bfa',    // Violet 400
    background: '#1e1e2e', // Custom dark blue background
    text: '#f9fafb',      // Gray 50
  },
  {
    id: 'standard-dark',
    name: 'Standard Dark',
    description: 'Our default dark theme with balanced aesthetics, suitable for most applications.',
    author: 'System',
    version: '1.0.0',
    tags: ['standard', 'dark', 'balanced', 'default'],
    industry: 'general',
    featured: false,
  },
  {
    variant: 'professional',
    borderRadius: 6,
    fontFamily: {
      heading: fontStacks.sans,
      body: fontStacks.sans,
    },
    shadowIntensity: 'medium',
  }
);

/**
 * Create dark variant of an existing theme
 */
export function createDarkVariantOf(theme: Theme, options: { preserveAccent?: boolean } = {}): Theme {
  // Extract original theme info
  const { metadata, tokens } = theme;
  
  // Create a new metadata object for the dark variant
  const darkMetadata = {
    ...metadata,
    id: `${metadata.id}-dark`,
    name: `${metadata.name} Dark`,
    description: `Dark variant of ${metadata.name} theme.`,
    tags: [...(metadata.tags || []), 'dark'],
  };
  
  // Apply color transformations for dark mode
  const darkTokens = { ...tokens };
  
  // Invert background and text colors
  if (darkTokens.colors) {
    darkTokens.colors = {
      ...darkTokens.colors,
      background: {
        ...(darkTokens.colors.background || {}),
        DEFAULT: '#121212', // Standard dark background
      },
      foreground: {
        ...(darkTokens.colors.foreground || {}),
        DEFAULT: '#f9fafb', // Light text for dark mode
      },
    };
    
    // Adjust primary color to be more visible in dark mode
    if (darkTokens.colors.primary && !options.preserveAccent) {
      darkTokens.colors.primary = {
        ...darkTokens.colors.primary,
        DEFAULT: tokens.colors?.primary?.light || tokens.colors?.primary?.DEFAULT || '#60a5fa',
      };
    }
  }
  
  // Return the new dark theme
  return {
    metadata: darkMetadata,
    tokens: darkTokens,
  };
}

/**
 * Create light variant of an existing theme
 */
export function createLightVariantOf(theme: Theme): Theme {
  // Extract original theme info
  const { metadata, tokens } = theme;
  
  // Skip if the theme is already light
  if (!metadata.id.includes('dark')) {
    return theme;
  }
  
  // Create a new metadata object for the light variant
  const lightMetadata = {
    ...metadata,
    id: metadata.id.replace('-dark', '-light'),
    name: metadata.name.replace('Dark', 'Light'),
    description: `Light variant of ${metadata.name.replace('Dark', '')} theme.`,
    tags: [...(metadata.tags || []).filter(tag => tag !== 'dark'), 'light'],
  };
  
  // Apply color transformations for light mode
  const lightTokens = { ...tokens };
  
  // Invert background and text colors
  if (lightTokens.colors) {
    lightTokens.colors = {
      ...lightTokens.colors,
      background: {
        ...(lightTokens.colors.background || {}),
        DEFAULT: '#ffffff', // Standard light background
      },
      foreground: {
        ...(lightTokens.colors.foreground || {}),
        DEFAULT: '#111827', // Dark text for light mode
      },
    };
    
    // Adjust primary color to be more visible in light mode
    if (lightTokens.colors.primary) {
      lightTokens.colors.primary = {
        ...lightTokens.colors.primary,
        DEFAULT: '#3b82f6', // Blue 500 - standard primary for light
      };
    }
  }
  
  // Return the new light theme
  return {
    metadata: lightMetadata,
    tokens: lightTokens,
  };
}

/**
 * Collection of all default themes
 */
export const allDefaultThemes: Record<string, Theme> = {
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
  financial,
  legal,
  healthcare,
  realEstate,
  fitness,
  wedding,
  manufacturing,
  highContrastLight,
  highContrastDark,
  monochromeLight,
  monochromeDark,
  standardLight,
  standardDark,
  
  // Default theme aliases
  light: standardLight,
  dark: standardDark,
  default: standardLight,
};

// Re-export with the original name for backward compatibility
export const defaultThemes = allDefaultThemes;

/**
 * Default theme categories with our expanded themes
 */
const updatedThemeCategories = [
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
    themes: [modernBusiness, techStartup, financial, legal, retail, realEstate],
  },
  {
    id: 'creative',
    name: 'Creative & Design',
    description: 'Expressive themes for creative industries',
    themes: [creativeStudio, darkProfessional, wedding],
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    description: 'Themes for healthcare and wellness industries',
    themes: [healthcare, wellness, fitness],
  },
  {
    id: 'minimal',
    name: 'Minimal & Clean',
    description: 'Simple, clean themes that focus on content',
    themes: [minimalLight, minimalDark, monochromeLight, monochromeDark],
  },
  {
    id: 'industry',
    name: 'Industry-Specific',
    description: 'Themes tailored to specific industries',
    themes: [salonElegante, culinary, manufacturing, education],
  },
  {
    id: 'dark',
    name: 'Dark Themes',
    description: 'Sophisticated dark mode themes',
    themes: [darkProfessional, minimalDark, standardDark, monochromeDark, highContrastDark],
  },
  {
    id: 'light',
    name: 'Light Themes',
    description: 'Clean light mode themes',
    themes: [standardLight, minimalLight, monochromeLight, highContrastLight],
  },
  {
    id: 'accessibility',
    name: 'Accessibility-Focused',
    description: 'Themes designed for maximum readability and accessibility',
    themes: [highContrastLight, highContrastDark],
  },
];

/**
 * The system default theme used when no theme is explicitly selected
 */
export const systemDefaultTheme = standardLight;

/**
 * Export the combined theme categories
 */
export const themeCategories = updatedThemeCategories;