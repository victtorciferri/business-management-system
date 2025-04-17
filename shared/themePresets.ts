/**
 * Theme Presets
 * A collection of predefined themes for different business categories
 * Each theme is organized by industry category for easy selection
 */

import { Theme } from './config';

export interface ThemePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  theme: Theme;
}

/**
 * Salon and Beauty themes
 * Sophisticated, elegant designs for beauty-related businesses
 */
const salonThemes: ThemePreset[] = [
  {
    id: 'salon-elegant',
    name: 'Salon Elegante',
    category: 'salon',
    description: 'Sophisticated and luxurious theme for upscale salons',
    theme: {
      name: 'Salon Elegante',
      primary: '#A16B56',
      secondary: '#D4B89E',
      background: '#FDFBF9',
      text: '#2D2A26',
      appearance: 'light',
      font: 'Playfair Display',
      borderRadius: '0.25rem',
      spacing: '1.25rem'
    }
  },
  {
    id: 'salon-modern',
    name: 'Modern Stylist',
    category: 'salon',
    description: 'Clean, minimalist design for contemporary salons',
    theme: {
      name: 'Modern Stylist',
      primary: '#FF5A5F',
      secondary: '#00A699',
      background: '#FFFFFF',
      text: '#484848',
      appearance: 'light',
      font: 'Poppins',
      borderRadius: '0.5rem',
      spacing: '1rem'
    }
  },
  {
    id: 'salon-bold',
    name: 'Bold Beauty',
    category: 'salon',
    description: 'Vibrant, eye-catching design for trendy salons',
    theme: {
      name: 'Bold Beauty',
      primary: '#FF3366',
      secondary: '#9013FE',
      background: '#F8F9FA',
      text: '#212529',
      appearance: 'light',
      font: 'Montserrat',
      borderRadius: '0.75rem',
      spacing: '1rem'
    }
  }
];

/**
 * Fitness and Wellness themes
 * Energetic, motivational designs for fitness businesses
 */
const fitnessThemes: ThemePreset[] = [
  {
    id: 'fitness-energetic',
    name: 'Energetic Fitness',
    category: 'fitness',
    description: 'Dynamic, high-energy theme for gyms and fitness centers',
    theme: {
      name: 'Energetic Fitness',
      primary: '#FF4500',
      secondary: '#FFB900',
      background: '#F7F9FC',
      text: '#1A1A1A',
      appearance: 'light',
      font: 'Roboto',
      borderRadius: '0.5rem',
      spacing: '1rem'
    }
  },
  {
    id: 'fitness-minimal',
    name: 'Minimal Strength',
    category: 'fitness',
    description: 'Clean, focused design for strength training and performance gyms',
    theme: {
      name: 'Minimal Strength',
      primary: '#121212',
      secondary: '#505050',
      background: '#FFFFFF',
      text: '#333333',
      appearance: 'light',
      font: 'Oswald',
      borderRadius: '0.25rem',
      spacing: '1.125rem'
    }
  },
  {
    id: 'wellness-calm',
    name: 'Wellness Calm',
    category: 'fitness',
    description: 'Serene, balanced design for yoga and wellness studios',
    theme: {
      name: 'Wellness Calm',
      primary: '#57B894',
      secondary: '#87CEEB',
      background: '#FCFCFC',
      text: '#333333',
      appearance: 'light',
      font: 'Lato',
      borderRadius: '1rem',
      spacing: '1.25rem'
    }
  }
];

/**
 * Medical and Healthcare themes
 * Professional, trustworthy designs for healthcare providers
 */
const medicalThemes: ThemePreset[] = [
  {
    id: 'medical-professional',
    name: 'Medical Professional',
    category: 'medical',
    description: 'Trustworthy, clean design for medical practices',
    theme: {
      name: 'Medical Professional',
      primary: '#0077B6',
      secondary: '#90E0EF',
      background: '#FFFFFF',
      text: '#333333',
      appearance: 'light',
      font: 'Nunito Sans',
      borderRadius: '0.375rem',
      spacing: '1rem'
    }
  },
  {
    id: 'dental-bright',
    name: 'Dental Bright',
    category: 'medical',
    description: 'Bright, friendly design for dental practices',
    theme: {
      name: 'Dental Bright',
      primary: '#4CC9F0',
      secondary: '#F72585',
      background: '#F8F9FA',
      text: '#212529',
      appearance: 'light',
      font: 'Quicksand',
      borderRadius: '0.5rem',
      spacing: '1rem'
    }
  },
  {
    id: 'therapy-calm',
    name: 'Therapy Calm',
    category: 'medical',
    description: 'Calming, reassuring design for therapy and mental health practices',
    theme: {
      name: 'Therapy Calm',
      primary: '#7209B7',
      secondary: '#3A0CA3',
      background: '#F7F7FC',
      text: '#2B2D42',
      appearance: 'light',
      font: 'Raleway',
      borderRadius: '0.5rem',
      spacing: '1.25rem'
    }
  }
];

/**
 * Professional Services themes
 * Professional, business-oriented designs for service providers
 */
const professionalThemes: ThemePreset[] = [
  {
    id: 'consulting-premium',
    name: 'Consulting Premium',
    category: 'professional',
    description: 'Sophisticated, premium design for consulting firms',
    theme: {
      name: 'Consulting Premium',
      primary: '#2C3E50',
      secondary: '#E67E22',
      background: '#FFFFFF',
      text: '#333333',
      appearance: 'light',
      font: 'Montserrat',
      borderRadius: '0.25rem',
      spacing: '1rem'
    }
  },
  {
    id: 'legal-traditional',
    name: 'Legal Traditional',
    category: 'professional',
    description: 'Classic, authoritative design for legal practices',
    theme: {
      name: 'Legal Traditional',
      primary: '#1E3A8A',
      secondary: '#9333EA',
      background: '#FFFFFF',
      text: '#333333',
      appearance: 'light',
      font: 'Libre Baskerville',
      borderRadius: '0.25rem',
      spacing: '1rem'
    }
  },
  {
    id: 'tech-modern',
    name: 'Tech Modern',
    category: 'professional',
    description: 'Modern, innovative design for tech companies',
    theme: {
      name: 'Tech Modern',
      primary: '#6200EA',
      secondary: '#03DAC6',
      background: '#FAFAFA',
      text: '#1D1D1D',
      appearance: 'light',
      font: 'Inter',
      borderRadius: '0.75rem',
      spacing: '1rem'
    }
  }
];

/**
 * Dark Mode Variants
 * Dark versions of selected themes for businesses preferring dark mode
 */
const darkThemes: ThemePreset[] = [
  {
    id: 'dark-professional',
    name: 'Dark Professional',
    category: 'dark',
    description: 'Sleek dark theme for a professional appearance',
    theme: {
      name: 'Dark Professional',
      primary: '#BB86FC',
      secondary: '#03DAC6',
      background: '#121212',
      text: '#E1E1E1',
      appearance: 'dark',
      font: 'Inter',
      borderRadius: '0.5rem',
      spacing: '1rem'
    }
  },
  {
    id: 'dark-luxury',
    name: 'Dark Luxury',
    category: 'dark',
    description: 'Premium dark theme with gold accents',
    theme: {
      name: 'Dark Luxury',
      primary: '#FFD700',
      secondary: '#C0C0C0',
      background: '#1A1A1A',
      text: '#FFFFFF',
      appearance: 'dark',
      font: 'Playfair Display',
      borderRadius: '0.25rem',
      spacing: '1.25rem'
    }
  },
  {
    id: 'dark-minimal',
    name: 'Dark Minimal',
    category: 'dark',
    description: 'Minimalist dark theme for a clean, modern look',
    theme: {
      name: 'Dark Minimal',
      primary: '#64FFDA',
      secondary: '#FF7597',
      background: '#0A0A0A',
      text: '#F5F5F5',
      appearance: 'dark',
      font: 'Poppins',
      borderRadius: '0.75rem',
      spacing: '1rem'
    }
  }
];

/**
 * Combined list of all theme presets
 */
export const allThemePresets: ThemePreset[] = [
  ...salonThemes,
  ...fitnessThemes,
  ...medicalThemes,
  ...professionalThemes,
  ...darkThemes
];

/**
 * Function to get theme presets by category
 * @param category The category to filter by
 * @returns Array of theme presets in the specified category
 */
export function getThemePresetsByCategory(category: string): ThemePreset[] {
  return allThemePresets.filter(preset => preset.category === category);
}

/**
 * Function to get a theme preset by ID
 * @param id The ID of the theme preset to find
 * @returns The theme preset or undefined if not found
 */
export function getThemePresetById(id: string): ThemePreset | undefined {
  return allThemePresets.find(preset => preset.id === id);
}

/**
 * Get all available theme categories
 * @returns Array of unique theme categories
 */
export function getAllThemeCategories(): string[] {
  return Array.from(new Set(allThemePresets.map(preset => preset.category)));
}