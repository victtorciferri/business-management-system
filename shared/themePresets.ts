/**
 * Theme presets for different business categories
 * These presets provide starting points for business to customize their themes
 */
import { Theme } from './config';

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  category: string;
  theme: Theme;
}

// Business category for organization and filtering
export type BusinessCategory = 
  | 'salon'
  | 'spa'
  | 'fitness'
  | 'medical'
  | 'restaurant'
  | 'retail'
  | 'professional'
  | 'other';

// Salon and beauty theme presets
const salonPresets: ThemePreset[] = [
  {
    id: 'elegant-salon',
    name: 'Elegant Salon',
    description: 'Sophisticated palette with gold accents for upscale salons',
    category: 'salon',
    theme: {
      name: 'Elegant Salon',
      primary: '#C9A87E', // Gold
      secondary: '#7E3F65', // Plum 
      background: '#FFFFFF', // White
      text: '#2D2D2D', // Dark gray
      appearance: 'light',
      font: 'Playfair Display',
      borderRadius: '0.5rem',
      spacing: '1.25rem'
    }
  },
  {
    id: 'modern-salon',
    name: 'Modern Salon',
    description: 'Clean and contemporary look for modern salons',
    category: 'salon',
    theme: {
      name: 'Modern Salon',
      primary: '#FF5678', // Coral pink
      secondary: '#333F50', // Slate 
      background: '#F8F9FA', // Light gray
      text: '#191C1F', // Near black
      appearance: 'light',
      font: 'Montserrat',
      borderRadius: '0.75rem',
      spacing: '1rem'
    }
  }
];

// Spa and wellness theme presets
const spaPresets: ThemePreset[] = [
  {
    id: 'tranquil-spa',
    name: 'Tranquil Spa',
    description: 'Calming earth tones for wellness and relaxation businesses',
    category: 'spa',
    theme: {
      name: 'Tranquil Spa',
      primary: '#8BAF93', // Sage green
      secondary: '#6B88A0', // Slate blue 
      background: '#F7F3ED', // Soft cream
      text: '#44484A', // Charcoal
      appearance: 'light',
      font: 'Lato',
      borderRadius: '1rem',
      spacing: '1.5rem'
    }
  },
  {
    id: 'luxury-wellness',
    name: 'Luxury Wellness',
    description: 'Rich, luxurious design for high-end wellness centers',
    category: 'spa',
    theme: {
      name: 'Luxury Wellness',
      primary: '#5C7C9D', // Steel blue
      secondary: '#D7B377', // Gold
      background: '#FBFBFB', // Off white
      text: '#333333', // Dark gray
      appearance: 'light',
      font: 'Cormorant Garamond',
      borderRadius: '0.25rem',
      spacing: '1.25rem'
    }
  }
];

// Fitness and gym theme presets
const fitnessPresets: ThemePreset[] = [
  {
    id: 'energetic-fitness',
    name: 'Energetic Fitness',
    description: 'Bold and energetic design for gyms and fitness studios',
    category: 'fitness',
    theme: {
      name: 'Energetic Fitness',
      primary: '#FF4040', // Bright red
      secondary: '#2C2C2C', // Dark gray 
      background: '#F9F9F9', // Light gray
      text: '#1A1A1A', // Near black
      appearance: 'light',
      font: 'Roboto',
      borderRadius: '0.5rem',
      spacing: '1rem'
    }
  },
  {
    id: 'minimal-strength',
    name: 'Minimal Strength',
    description: 'Clean, minimalist design for modern fitness centers',
    category: 'fitness',
    theme: {
      name: 'Minimal Strength',
      primary: '#3D3D3D', // Dark gray
      secondary: '#17A2B8', // Teal 
      background: '#FFFFFF', // White
      text: '#212529', // Dark gray
      appearance: 'light',
      font: 'Inter',
      borderRadius: '0.375rem',
      spacing: '1rem'
    }
  }
];

// Medical and healthcare theme presets
const medicalPresets: ThemePreset[] = [
  {
    id: 'trustworthy-medical',
    name: 'Trustworthy Medical',
    description: 'Professional and reassuring palette for healthcare providers',
    category: 'medical',
    theme: {
      name: 'Trustworthy Medical',
      primary: '#2C6BAC', // Medical blue
      secondary: '#60BB6E', // Healing green 
      background: '#F8FBFD', // Light blue-white
      text: '#333333', // Dark gray
      appearance: 'light',
      font: 'Nunito Sans',
      borderRadius: '0.5rem',
      spacing: '1rem'
    }
  },
  {
    id: 'modern-clinic',
    name: 'Modern Clinic',
    description: 'Clean and modern design for contemporary medical practices',
    category: 'medical',
    theme: {
      name: 'Modern Clinic',
      primary: '#5773C2', // Blueberry
      secondary: '#F3F5F9', // Light lavender 
      background: '#FFFFFF', // White
      text: '#2D3748', // Dark slate
      appearance: 'light',
      font: 'Open Sans',
      borderRadius: '0.75rem',
      spacing: '1.25rem'
    }
  }
];

// Restaurant and food theme presets
const restaurantPresets: ThemePreset[] = [
  {
    id: 'culinary-delight',
    name: 'Culinary Delight',
    description: 'Warm and inviting palette for restaurants and cafés',
    category: 'restaurant',
    theme: {
      name: 'Culinary Delight',
      primary: '#D94E4E', // Rustic red
      secondary: '#2D3A3A', // Deep pine 
      background: '#FFF8F0', // Cream
      text: '#3D3B38', // Rich brown
      appearance: 'light',
      font: 'Merriweather',
      borderRadius: '0.25rem',
      spacing: '1.25rem'
    }
  },
  {
    id: 'bistro-charm',
    name: 'Bistro Charm',
    description: 'Classic bistro-inspired design for eateries',
    category: 'restaurant',
    theme: {
      name: 'Bistro Charm',
      primary: '#9B786F', // Rustic terra
      secondary: '#475657', // Slate 
      background: '#FFFCF7', // Off white
      text: '#332E2C', // Dark brown
      appearance: 'light',
      font: 'Libre Baskerville',
      borderRadius: '0.375rem',
      spacing: '1rem'
    }
  }
];

// Retail and shop theme presets
const retailPresets: ThemePreset[] = [
  {
    id: 'boutique-retail',
    name: 'Boutique Retail',
    description: 'Elegant and fashionable palette for boutique stores',
    category: 'retail',
    theme: {
      name: 'Boutique Retail',
      primary: '#B76E79', // Dusty rose
      secondary: '#2D2F35', // Charcoal 
      background: '#FAFAFA', // Light gray
      text: '#1D1D1D', // Near black
      appearance: 'light',
      font: 'DM Sans',
      borderRadius: '0.75rem',
      spacing: '1rem'
    }
  },
  {
    id: 'modern-marketplace',
    name: 'Modern Marketplace',
    description: 'Contemporary design for diverse retail environments',
    category: 'retail',
    theme: {
      name: 'Modern Marketplace',
      primary: '#4A6FA5', // Steel blue
      secondary: '#95A3B3', // Gray blue 
      background: '#FFFFFF', // White
      text: '#393939', // Dark gray
      appearance: 'light',
      font: 'Poppins',
      borderRadius: '0.5rem',
      spacing: '1.25rem'
    }
  }
];

// Professional services theme presets
const professionalPresets: ThemePreset[] = [
  {
    id: 'corporate-trust',
    name: 'Corporate Trust',
    description: 'Professional and dependable design for business services',
    category: 'professional',
    theme: {
      name: 'Corporate Trust',
      primary: '#1B4965', // Deep navy
      secondary: '#5FA8D3', // Sky blue 
      background: '#FFFFFF', // White
      text: '#333333', // Dark gray
      appearance: 'light',
      font: 'Source Sans Pro',
      borderRadius: '0.25rem',
      spacing: '1rem'
    }
  },
  {
    id: 'creative-agency',
    name: 'Creative Agency',
    description: 'Bold and creative palette for design agencies',
    category: 'professional',
    theme: {
      name: 'Creative Agency',
      primary: '#FF5126', // Vibrant orange
      secondary: '#2F3B54', // Dark slate 
      background: '#FAFAFA', // Light gray
      text: '#222222', // Near black
      appearance: 'light',
      font: 'Work Sans',
      borderRadius: '1rem',
      spacing: '1.5rem'
    }
  }
];

// Other/general theme presets
const otherPresets: ThemePreset[] = [
  {
    id: 'night-mode',
    name: 'Night Mode',
    description: 'Dark theme option for any business type',
    category: 'other',
    theme: {
      name: 'Night Mode',
      primary: '#BB86FC', // Lavender
      secondary: '#03DAC5', // Teal 
      background: '#121212', // Near black
      text: '#E1E1E1', // Light gray
      appearance: 'dark',
      font: 'Roboto',
      borderRadius: '0.5rem',
      spacing: '1rem'
    }
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean and simple design for any business',
    category: 'other',
    theme: {
      name: 'Minimalist',
      primary: '#3E3E3E', // Dark gray
      secondary: '#BBBBBB', // Medium gray 
      background: '#FFFFFF', // White
      text: '#1A1A1A', // Near black
      appearance: 'light',
      font: 'Inter',
      borderRadius: '0.25rem',
      spacing: '1rem'
    }
  }
];

// All presets combined
export const allThemePresets: ThemePreset[] = [
  ...salonPresets,
  ...spaPresets,
  ...fitnessPresets,
  ...medicalPresets,
  ...restaurantPresets,
  ...retailPresets,
  ...professionalPresets,
  ...otherPresets
];

// Get presets by category
export const getPresetsByCategory = (category: BusinessCategory): ThemePreset[] => {
  return allThemePresets.filter(preset => preset.category === category);
};

// Get a preset by ID
export const getPresetById = (id: string): ThemePreset | undefined => {
  return allThemePresets.find(preset => preset.id === id);
};