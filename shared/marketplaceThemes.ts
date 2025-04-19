/**
 * Marketplace Themes Module - 2025 Edition
 * 
 * Defines a collection of professionally designed themes that can be
 * applied to businesses with a click. These themes include color schemes,
 * typography, border radius, and other design tokens.
 */

export type ThemeCategory = 
  | 'business' 
  | 'creative' 
  | 'modern' 
  | 'elegant' 
  | 'playful' 
  | 'minimalist'
  | 'professional'
  | 'bold';

export type ThemePreview = {
  primaryImage?: string;
  thumbnailImage?: string;
  additionalImages?: string[];
};

// Define the structure of a marketplace theme
export interface MarketplaceTheme {
  id: string;
  name: string;
  description: string;
  author: string;
  category: ThemeCategory;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontPrimary: string;
  fontHeading: string;
  borderRadius: number;
  tags: string[];
  popularity: number;
  isNew: boolean;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
  price: string | 'free';
  preview: ThemePreview;
}

/**
 * Collection of marketplace themes
 */
export const marketplaceThemes: MarketplaceTheme[] = [
  {
    id: 'modern-business',
    name: 'Modern Business',
    description: 'A clean, professional theme perfect for service-based businesses and consultants.',
    author: 'Design Team',
    category: 'business',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    accentColor: '#f97316',
    fontPrimary: 'Inter, system-ui, sans-serif',
    fontHeading: 'Inter, system-ui, sans-serif',
    borderRadius: 8,
    tags: ['professional', 'business', 'clean', 'featured'],
    popularity: 95,
    isNew: false,
    createdAt: '2024-12-10',
    updatedAt: '2025-01-15',
    price: 'free',
    preview: {
      primaryImage: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
    }
  },
  {
    id: 'elegant-spa',
    name: 'Elegant Spa',
    description: 'A soothing, sophisticated theme with a warm color palette ideal for spas and wellness businesses.',
    author: 'Wellness Studio',
    category: 'elegant',
    primaryColor: '#9d8977',
    secondaryColor: '#6b5d4c',
    accentColor: '#d6c1b0',
    fontPrimary: 'Montserrat, sans-serif',
    fontHeading: 'Playfair Display, serif',
    borderRadius: 12,
    tags: ['spa', 'wellness', 'calm', 'elegant'],
    popularity: 87,
    isNew: false,
    createdAt: '2024-11-22',
    updatedAt: '2025-02-01',
    price: '29',
    preview: {
      primaryImage: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
    }
  },
  {
    id: 'vibrant-creative',
    name: 'Vibrant Creative',
    description: 'A bold, colorful theme that makes a statement for creative professionals and agencies.',
    author: 'Creative Studio',
    category: 'creative',
    primaryColor: '#ec4899',
    secondaryColor: '#8b5cf6',
    accentColor: '#fbbf24',
    fontPrimary: 'Poppins, sans-serif',
    fontHeading: 'Poppins, sans-serif',
    borderRadius: 16,
    tags: ['creative', 'bold', 'colorful', 'featured'],
    popularity: 92,
    isNew: true,
    createdAt: '2025-03-01',
    updatedAt: '2025-03-10',
    price: '39',
    preview: {
      primaryImage: 'https://images.unsplash.com/photo-1547119957-637f8679db1e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80'
    }
  },
  {
    id: 'minimal-mono',
    name: 'Minimal Mono',
    description: 'A clean, monochromatic theme with an emphasis on typography and whitespace.',
    author: 'Minimal Design Co',
    category: 'minimalist',
    primaryColor: '#171717',
    secondaryColor: '#404040',
    accentColor: '#737373',
    fontPrimary: 'IBM Plex Sans, sans-serif',
    fontHeading: 'IBM Plex Sans, sans-serif',
    borderRadius: 4,
    tags: ['minimal', 'monochrome', 'modern', 'clean'],
    popularity: 85,
    isNew: false,
    createdAt: '2024-10-15',
    updatedAt: '2025-01-20',
    price: 'free',
    preview: {
      primaryImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=755&q=80'
    }
  },
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    description: 'A modern, sleek theme designed for tech startups and digital products.',
    author: 'TechThemes',
    category: 'modern',
    primaryColor: '#2563eb',
    secondaryColor: '#7c3aed',
    accentColor: '#06b6d4',
    fontPrimary: 'Inter, system-ui, sans-serif',
    fontHeading: 'Manrope, sans-serif',
    borderRadius: 8,
    tags: ['tech', 'startup', 'modern', 'digital'],
    popularity: 90,
    isNew: true,
    createdAt: '2025-02-15',
    updatedAt: '2025-03-05',
    price: '49',
    preview: {
      primaryImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
    }
  },
  {
    id: 'playful-boutique',
    name: 'Playful Boutique',
    description: 'A fun, whimsical theme that adds personality to boutique businesses and small shops.',
    author: 'Boutique Studio',
    category: 'playful',
    primaryColor: '#f472b6',
    secondaryColor: '#c084fc',
    accentColor: '#a3e635',
    fontPrimary: 'Quicksand, sans-serif',
    fontHeading: 'Pacifico, cursive',
    borderRadius: 20,
    tags: ['boutique', 'playful', 'fun', 'colorful'],
    popularity: 82,
    isNew: false,
    createdAt: '2024-09-20',
    updatedAt: '2025-01-10',
    price: '29',
    preview: {
      primaryImage: 'https://images.unsplash.com/photo-1604176424472-19ac7084321a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80'
    }
  },
  {
    id: 'professional-law',
    name: 'Professional Law',
    description: 'A sophisticated, traditional theme suitable for law firms and professional services.',
    author: 'Legal Design Co',
    category: 'professional',
    primaryColor: '#334155',
    secondaryColor: '#0f172a',
    accentColor: '#854d0e',
    fontPrimary: 'Merriweather, serif',
    fontHeading: 'Merriweather, serif',
    borderRadius: 4,
    tags: ['legal', 'professional', 'traditional', 'formal'],
    popularity: 75,
    isNew: false,
    createdAt: '2024-08-15',
    updatedAt: '2024-12-05',
    price: '39',
    preview: {
      primaryImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1112&q=80'
    }
  },
  {
    id: 'bold-restaurant',
    name: 'Bold Restaurant',
    description: 'A striking theme with bold typography and rich colors for restaurants and food services.',
    author: 'Food & Bev Design',
    category: 'bold',
    primaryColor: '#dc2626',
    secondaryColor: '#7f1d1d',
    accentColor: '#fbbf24',
    fontPrimary: 'Source Sans Pro, sans-serif',
    fontHeading: 'Oswald, sans-serif',
    borderRadius: 8,
    tags: ['restaurant', 'food', 'bold', 'striking'],
    popularity: 88,
    isNew: true,
    createdAt: '2025-03-10',
    updatedAt: '2025-03-15',
    price: 'free',
    preview: {
      primaryImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
    }
  },
  {
    id: 'modern-healthcare',
    name: 'Modern Healthcare',
    description: 'A clean, professional theme for healthcare providers, clinics, and medical services.',
    author: 'MedThemes',
    category: 'professional',
    primaryColor: '#0284c7',
    secondaryColor: '#075985',
    accentColor: '#2dd4bf',
    fontPrimary: 'Nunito Sans, sans-serif',
    fontHeading: 'Nunito Sans, sans-serif',
    borderRadius: 8,
    tags: ['healthcare', 'medical', 'clean', 'professional'],
    popularity: 86,
    isNew: false,
    createdAt: '2024-11-10',
    updatedAt: '2025-02-05',
    price: '45',
    preview: {
      primaryImage: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
    }
  },
  {
    id: 'nature-retreat',
    name: 'Nature Retreat',
    description: 'An organic, earthy theme inspired by nature, perfect for eco-friendly businesses and retreats.',
    author: 'Eco Designs',
    category: 'elegant',
    primaryColor: '#4d7c0f',
    secondaryColor: '#3f6212',
    accentColor: '#facc15',
    fontPrimary: 'Lato, sans-serif',
    fontHeading: 'Libre Baskerville, serif',
    borderRadius: 12,
    tags: ['nature', 'organic', 'eco-friendly', 'retreat'],
    popularity: 78,
    isNew: false,
    createdAt: '2024-07-20',
    updatedAt: '2024-12-10',
    price: '29',
    preview: {
      primaryImage: 'https://images.unsplash.com/photo-1501183007986-d0d080b147f9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
    }
  },
  {
    id: 'fitness-energy',
    name: 'Fitness Energy',
    description: 'A dynamic, energetic theme for fitness studios, gyms, and personal trainers.',
    author: 'Fitness Studio',
    category: 'bold',
    primaryColor: '#0ea5e9',
    secondaryColor: '#0369a1',
    accentColor: '#22d3ee',
    fontPrimary: 'Roboto, sans-serif',
    fontHeading: 'Montserrat, sans-serif',
    borderRadius: 8,
    tags: ['fitness', 'gym', 'energetic', 'active'],
    popularity: 84,
    isNew: false,
    createdAt: '2024-10-05',
    updatedAt: '2025-01-15',
    price: 'free',
    preview: {
      primaryImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
    }
  },
  {
    id: 'modern-education',
    name: 'Modern Education',
    description: 'A practical, user-friendly theme for educational institutions and online learning platforms.',
    author: 'EduThemes',
    category: 'modern',
    primaryColor: '#8b5cf6',
    secondaryColor: '#6d28d9',
    accentColor: '#a3e635',
    fontPrimary: 'Open Sans, sans-serif',
    fontHeading: 'Poppins, sans-serif',
    borderRadius: 8,
    tags: ['education', 'learning', 'school', 'online'],
    popularity: 83,
    isNew: true,
    createdAt: '2025-01-20',
    updatedAt: '2025-03-01',
    price: '39',
    preview: {
      primaryImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
    }
  }
];

/**
 * Get a theme by its ID
 */
export function getThemeById(id: string): MarketplaceTheme | undefined {
  return marketplaceThemes.find(theme => theme.id === id);
}

/**
 * Get themes by category
 */
export function getThemesByCategory(category: ThemeCategory): MarketplaceTheme[] {
  return marketplaceThemes.filter(theme => theme.category === category);
}

/**
 * Get popular themes, limited by count
 */
export function getPopularThemes(count: number = 4): MarketplaceTheme[] {
  return [...marketplaceThemes]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, count);
}

/**
 * Get new themes, limited by count
 */
export function getNewThemes(count: number = 4): MarketplaceTheme[] {
  return marketplaceThemes
    .filter(theme => theme.isNew)
    .slice(0, count);
}

/**
 * Get themes by price type
 * @param isFree - If true, returns free themes; if false, returns paid themes
 */
export function getThemesByPriceType(isFree: boolean): MarketplaceTheme[] {
  return marketplaceThemes.filter(theme => 
    isFree ? theme.price === 'free' : theme.price !== 'free'
  );
}

/**
 * Search themes by name, description, or tags
 */
export function searchThemes(query: string): MarketplaceTheme[] {
  if (!query || query.trim() === '') {
    return marketplaceThemes;
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return marketplaceThemes.filter(theme => 
    theme.name.toLowerCase().includes(normalizedQuery) ||
    theme.description.toLowerCase().includes(normalizedQuery) ||
    theme.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)) ||
    theme.category.toLowerCase().includes(normalizedQuery)
  );
}