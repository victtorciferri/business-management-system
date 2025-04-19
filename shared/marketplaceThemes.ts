/**
 * Marketplace Themes - 2025 Edition
 * 
 * Predefined themes available in the marketplace for easy application
 */

import { generateColorPalette } from './colorUtils';

// Type definition for a marketplace theme
export interface MarketplaceTheme {
  id: string;
  name: string;
  description: string;
  category: ThemeCategory;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontPrimary: string;
  fontHeading: string;
  borderRadius: number;
  tags: string[];
  preview: ThemePreview;
  popularity: number;
  isNew: boolean;
  author: string;
  createdAt: string;
  price: number | 'free';
}

// Theme category options
export type ThemeCategory = 
  | 'business'
  | 'creative'
  | 'modern'
  | 'elegant'
  | 'playful'
  | 'minimalist'
  | 'professional'
  | 'bold';

// Theme preview data
export interface ThemePreview {
  primaryImage: string;
  additionalImages: string[];
  thumbnailImage: string;
  previewUrl?: string;
}

// Function to get a shortened preview of a marketplace theme
export function getThemePreview(theme: MarketplaceTheme): any {
  const palette = generateColorPalette(theme.primaryColor);
  
  return {
    id: theme.id,
    name: theme.name,
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    colors: {
      primary: palette.primary,
      background: palette.background
    },
    borderRadius: theme.borderRadius,
    fontPrimary: theme.fontPrimary,
    fontHeading: theme.fontHeading,
  };
}

// Marketplace theme collection
export const marketplaceThemes: MarketplaceTheme[] = [
  {
    id: 'elegant-indigo',
    name: 'Elegant Indigo',
    description: 'A sophisticated theme with deep indigo accents and clean typography perfect for professional services.',
    category: 'elegant',
    primaryColor: '#4F46E5',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    fontPrimary: 'Inter, sans-serif',
    fontHeading: 'Playfair Display, serif',
    borderRadius: 8,
    tags: ['elegant', 'professional', 'modern', 'clean'],
    preview: {
      primaryImage: '/theme-previews/elegant-indigo.png',
      additionalImages: ['/theme-previews/elegant-indigo-2.png', '/theme-previews/elegant-indigo-3.png'],
      thumbnailImage: '/theme-previews/elegant-indigo-thumb.png',
    },
    popularity: 87,
    isNew: false,
    author: 'Design Studio',
    createdAt: '2024-12-01',
    price: 'free',
  },
  {
    id: 'midnight-teal',
    name: 'Midnight Teal',
    description: 'A dark theme with teal accents that creates a striking, modern aesthetic for creative professionals.',
    category: 'creative',
    primaryColor: '#0D9488',
    secondaryColor: '#6366F1',
    accentColor: '#EC4899',
    fontPrimary: 'Plus Jakarta Sans, sans-serif',
    fontHeading: 'Plus Jakarta Sans, sans-serif',
    borderRadius: 12,
    tags: ['dark', 'creative', 'modern', 'bold'],
    preview: {
      primaryImage: '/theme-previews/midnight-teal.png',
      additionalImages: ['/theme-previews/midnight-teal-2.png', '/theme-previews/midnight-teal-3.png'],
      thumbnailImage: '/theme-previews/midnight-teal-thumb.png',
    },
    popularity: 92,
    isNew: true,
    author: 'PixelPerfect',
    createdAt: '2025-01-15',
    price: 29,
  },
  {
    id: 'coral-breeze',
    name: 'Coral Breeze',
    description: 'A warm, inviting theme with coral highlights perfect for service businesses with a friendly approach.',
    category: 'playful',
    primaryColor: '#F97316',
    secondaryColor: '#06B6D4',
    accentColor: '#8B5CF6',
    fontPrimary: 'DM Sans, sans-serif',
    fontHeading: 'Poppins, sans-serif',
    borderRadius: 16,
    tags: ['friendly', 'warm', 'inviting', 'playful'],
    preview: {
      primaryImage: '/theme-previews/coral-breeze.png',
      additionalImages: ['/theme-previews/coral-breeze-2.png', '/theme-previews/coral-breeze-3.png'],
      thumbnailImage: '/theme-previews/coral-breeze-thumb.png',
    },
    popularity: 78,
    isNew: false,
    author: 'Creative Minds',
    createdAt: '2024-11-12',
    price: 'free',
  },
  {
    id: 'minimalist-gray',
    name: 'Minimalist Gray',
    description: 'A clean, minimalist theme with subtle gray tones focused on content and readability.',
    category: 'minimalist',
    primaryColor: '#6B7280',
    secondaryColor: '#3B82F6',
    accentColor: '#EC4899',
    fontPrimary: 'Inter, sans-serif',
    fontHeading: 'Inter, sans-serif',
    borderRadius: 4,
    tags: ['minimalist', 'clean', 'modern', 'professional'],
    preview: {
      primaryImage: '/theme-previews/minimalist-gray.png',
      additionalImages: ['/theme-previews/minimalist-gray-2.png', '/theme-previews/minimalist-gray-3.png'],
      thumbnailImage: '/theme-previews/minimalist-gray-thumb.png',
    },
    popularity: 81,
    isNew: false,
    author: 'Minimalist Designs',
    createdAt: '2024-10-25',
    price: 19,
  },
  {
    id: 'emerald-luxury',
    name: 'Emerald Luxury',
    description: 'A luxurious theme with deep emerald green and gold accents perfect for premium service brands.',
    category: 'elegant',
    primaryColor: '#059669',
    secondaryColor: '#F59E0B',
    accentColor: '#8B5CF6',
    fontPrimary: 'Montserrat, sans-serif',
    fontHeading: 'Cormorant Garamond, serif',
    borderRadius: 6,
    tags: ['luxury', 'premium', 'elegant', 'sophisticated'],
    preview: {
      primaryImage: '/theme-previews/emerald-luxury.png',
      additionalImages: ['/theme-previews/emerald-luxury-2.png', '/theme-previews/emerald-luxury-3.png'],
      thumbnailImage: '/theme-previews/emerald-luxury-thumb.png',
    },
    popularity: 89,
    isNew: true,
    author: 'Luxury Themes',
    createdAt: '2025-02-05',
    price: 39,
  },
  {
    id: 'electric-purple',
    name: 'Electric Purple',
    description: 'A vibrant, attention-grabbing theme with electric purple accents for businesses that want to stand out.',
    category: 'bold',
    primaryColor: '#8B5CF6',
    secondaryColor: '#10B981',
    accentColor: '#F43F5E',
    fontPrimary: 'Outfit, sans-serif',
    fontHeading: 'Outfit, sans-serif',
    borderRadius: 20,
    tags: ['vibrant', 'bold', 'modern', 'attention-grabbing'],
    preview: {
      primaryImage: '/theme-previews/electric-purple.png',
      additionalImages: ['/theme-previews/electric-purple-2.png', '/theme-previews/electric-purple-3.png'],
      thumbnailImage: '/theme-previews/electric-purple-thumb.png',
    },
    popularity: 76,
    isNew: true,
    author: 'Bold Design Co',
    createdAt: '2025-01-30',
    price: 'free',
  },
  {
    id: 'serene-blue',
    name: 'Serene Blue',
    description: 'A calming, professional theme with blue tones perfect for healthcare and wellness businesses.',
    category: 'professional',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F97316',
    fontPrimary: 'Source Sans Pro, sans-serif',
    fontHeading: 'Source Sans Pro, sans-serif',
    borderRadius: 8,
    tags: ['calming', 'professional', 'healthcare', 'wellness'],
    preview: {
      primaryImage: '/theme-previews/serene-blue.png',
      additionalImages: ['/theme-previews/serene-blue-2.png', '/theme-previews/serene-blue-3.png'],
      thumbnailImage: '/theme-previews/serene-blue-thumb.png',
    },
    popularity: 85,
    isNew: false,
    author: 'Health Design Studio',
    createdAt: '2024-11-20',
    price: 29,
  },
  {
    id: 'tech-slate',
    name: 'Tech Slate',
    description: 'A modern, tech-focused theme with slate blue and sharp accent colors for technology businesses.',
    category: 'modern',
    primaryColor: '#475569',
    secondaryColor: '#3B82F6',
    accentColor: '#10B981',
    fontPrimary: 'JetBrains Mono, monospace',
    fontHeading: 'Inter, sans-serif',
    borderRadius: 4,
    tags: ['tech', 'modern', 'professional', 'sleek'],
    preview: {
      primaryImage: '/theme-previews/tech-slate.png',
      additionalImages: ['/theme-previews/tech-slate-2.png', '/theme-previews/tech-slate-3.png'],
      thumbnailImage: '/theme-previews/tech-slate-thumb.png',
    },
    popularity: 90,
    isNew: false,
    author: 'TechDesigns',
    createdAt: '2024-12-15',
    price: 19,
  },
  {
    id: 'sunset-gold',
    name: 'Sunset Gold',
    description: 'A warm, inviting theme with sunset colors perfect for hospitality and food service businesses.',
    category: 'playful',
    primaryColor: '#F59E0B',
    secondaryColor: '#F43F5E',
    accentColor: '#8B5CF6',
    fontPrimary: 'Nunito, sans-serif',
    fontHeading: 'Lora, serif',
    borderRadius: 12,
    tags: ['warm', 'inviting', 'hospitality', 'food'],
    preview: {
      primaryImage: '/theme-previews/sunset-gold.png',
      additionalImages: ['/theme-previews/sunset-gold-2.png', '/theme-previews/sunset-gold-3.png'],
      thumbnailImage: '/theme-previews/sunset-gold-thumb.png',
    },
    popularity: 82,
    isNew: false,
    author: 'Hospitality Designs',
    createdAt: '2024-09-30',
    price: 'free',
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'A professional, corporate theme with classic blue tones suitable for established businesses.',
    category: 'business',
    primaryColor: '#1E40AF',
    secondaryColor: '#6B7280',
    accentColor: '#F97316',
    fontPrimary: 'Open Sans, sans-serif',
    fontHeading: 'Merriweather, serif',
    borderRadius: 6,
    tags: ['corporate', 'professional', 'business', 'classic'],
    preview: {
      primaryImage: '/theme-previews/corporate-blue.png',
      additionalImages: ['/theme-previews/corporate-blue-2.png', '/theme-previews/corporate-blue-3.png'],
      thumbnailImage: '/theme-previews/corporate-blue-thumb.png',
    },
    popularity: 88,
    isNew: false,
    author: 'Corporate Design Co',
    createdAt: '2024-08-15',
    price: 29,
  },
  {
    id: 'neon-future',
    name: 'Neon Future',
    description: 'A futuristic theme with neon accents and dark backgrounds perfect for entertainment and tech startups.',
    category: 'bold',
    primaryColor: '#EC4899',
    secondaryColor: '#8B5CF6',
    accentColor: '#10B981',
    fontPrimary: 'Space Grotesk, sans-serif',
    fontHeading: 'Audiowide, display',
    borderRadius: 16,
    tags: ['futuristic', 'neon', 'tech', 'entertainment'],
    preview: {
      primaryImage: '/theme-previews/neon-future.png',
      additionalImages: ['/theme-previews/neon-future-2.png', '/theme-previews/neon-future-3.png'],
      thumbnailImage: '/theme-previews/neon-future-thumb.png',
    },
    popularity: 79,
    isNew: true,
    author: 'Future Themes',
    createdAt: '2025-01-20',
    price: 39,
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    description: 'A calming, natural theme with forest green tones ideal for environmental and outdoor businesses.',
    category: 'business',
    primaryColor: '#047857',
    secondaryColor: '#F59E0B',
    accentColor: '#3B82F6',
    fontPrimary: 'Atkinson Hyperlegible, sans-serif',
    fontHeading: 'Bitter, serif',
    borderRadius: 8,
    tags: ['nature', 'environmental', 'outdoor', 'natural'],
    preview: {
      primaryImage: '/theme-previews/nature-green.png',
      additionalImages: ['/theme-previews/nature-green-2.png', '/theme-previews/nature-green-3.png'],
      thumbnailImage: '/theme-previews/nature-green-thumb.png',
    },
    popularity: 84,
    isNew: false,
    author: 'Eco Designs',
    createdAt: '2024-10-10',
    price: 'free',
  }
];

// Helper to get theme by ID
export function getThemeById(id: string): MarketplaceTheme | undefined {
  return marketplaceThemes.find(theme => theme.id === id);
}

// Helper to filter themes by category
export function getThemesByCategory(category: ThemeCategory): MarketplaceTheme[] {
  return marketplaceThemes.filter(theme => theme.category === category);
}

// Helper to filter themes by price type (free or paid)
export function getThemesByPriceType(isFree: boolean): MarketplaceTheme[] {
  return marketplaceThemes.filter(theme => isFree ? theme.price === 'free' : theme.price !== 'free');
}

// Helper to get the most popular themes
export function getPopularThemes(limit: number = 6): MarketplaceTheme[] {
  return [...marketplaceThemes]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

// Helper to get the newest themes
export function getNewThemes(limit: number = 6): MarketplaceTheme[] {
  return marketplaceThemes
    .filter(theme => theme.isNew)
    .slice(0, limit);
}

// Helper to search themes by name or description
export function searchThemes(query: string): MarketplaceTheme[] {
  const lowerQuery = query.toLowerCase();
  return marketplaceThemes.filter(theme => 
    theme.name.toLowerCase().includes(lowerQuery) || 
    theme.description.toLowerCase().includes(lowerQuery) ||
    theme.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}