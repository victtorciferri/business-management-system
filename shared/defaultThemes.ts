/**
 * Default Themes - 2025 Edition
 * 
 * Collection of built-in themes for the application
 */

import { Theme } from './designTokens';
import { createThemeFromColor } from './themeCreator';

/**
 * System Default Theme
 * 
 * This is the base theme used when no theme is specified
 */
export const systemDefaultTheme: Theme = createThemeFromColor('#4f46e5', {
  name: 'System Default',
  description: 'The default system theme with a professional design for general usage',
  variant: 'professional',
  isDefault: true
});

/**
 * Get a theme by its ID
 * 
 * @param id The theme ID
 * @returns The theme or undefined if not found
 */
export function getThemeById(id: string): Theme | undefined {
  return allThemes.find(theme => theme.metadata.id === id) || undefined;
}

/**
 * Export default themes collection
 */
export const defaultThemes = {
  system: systemDefaultTheme,
};

/**
 * Business vertical-specific themes
 */
export const businessThemes: Record<string, Theme> = {
  salon: createThemeFromColor('#ec4899', {
    name: 'Salon & Beauty',
    description: 'A vibrant theme for beauty and salon businesses',
    variant: 'vibrant',
    industry: 'beauty',
  }),
  
  spa: createThemeFromColor('#06b6d4', {
    name: 'Spa & Wellness',
    description: 'A calming theme for spa and wellness businesses',
    variant: 'muted',
    industry: 'wellness',
    secondaryColor: '#0d9488',
  }),
  
  healthcare: createThemeFromColor('#0ea5e9', {
    name: 'Healthcare',
    description: 'A professional theme for healthcare providers',
    variant: 'professional',
    industry: 'healthcare',
    isAccessible: true,
  }),
  
  fitness: createThemeFromColor('#16a34a', {
    name: 'Fitness & Training',
    description: 'An energetic theme for fitness and training businesses',
    variant: 'vibrant',
    industry: 'fitness',
    secondaryColor: '#65a30d',
  }),
  
  restaurant: createThemeFromColor('#ea580c', {
    name: 'Restaurant & Cafe',
    description: 'A warm theme for food service businesses',
    variant: 'vibrant',
    industry: 'food',
    secondaryColor: '#b91c1c',
  }),
  
  legal: createThemeFromColor('#1e40af', {
    name: 'Legal & Professional',
    description: 'A sophisticated theme for legal and professional services',
    variant: 'professional',
    industry: 'legal',
    backgroundColor: '#f8fafc',
  }),
  
  education: createThemeFromColor('#7c3aed', {
    name: 'Education & Coaching',
    description: 'An inviting theme for educational institutions and coaches',
    variant: 'professional',
    industry: 'education',
    secondaryColor: '#4f46e5',
  }),
  
  construction: createThemeFromColor('#f59e0b', {
    name: 'Construction & Trades',
    description: 'A solid theme for construction and trades businesses',
    variant: 'professional',
    industry: 'construction',
    secondaryColor: '#0284c7',
  }),
};

/**
 * Accessibility-focused themes
 */
export const accessibilityThemes: Record<string, Theme> = {
  highContrast: createThemeFromColor('#000000', {
    name: 'High Contrast',
    description: 'A high contrast theme for better visibility',
    variant: 'professional',
    isAccessible: true,
    backgroundColor: '#ffffff',
    secondaryColor: '#ffffff',
  }),
  
  dyslexiaFriendly: createThemeFromColor('#0ea5e9', {
    name: 'Dyslexia Friendly',
    description: 'A theme with improved readability for dyslexic users',
    variant: 'muted',
    isAccessible: true,
    backgroundColor: '#f8f9fa',
  }),
  
  colorBlindFriendly: createThemeFromColor('#0369a1', {
    name: 'Color Blind Friendly',
    description: 'A theme with colors optimized for color blindness',
    variant: 'professional',
    isAccessible: true,
    secondaryColor: '#b45309',
  }),
  
  reducedMotion: createThemeFromColor('#4f46e5', {
    name: 'Reduced Motion',
    description: 'A theme with minimal animations and transitions',
    variant: 'professional',
    isAccessible: true,
  }),
};

/**
 * Seasonal themes for special occasions and times of year
 */
export const seasonalThemes: Record<string, Theme> = {
  winter: createThemeFromColor('#0891b2', {
    name: 'Winter',
    description: 'A cool, snowy winter theme',
    variant: 'muted',
    seasonal: true,
    backgroundColor: '#f8fafc',
    secondaryColor: '#0f172a',
  }),
  
  spring: createThemeFromColor('#65a30d', {
    name: 'Spring',
    description: 'A fresh, bright spring theme',
    variant: 'vibrant',
    seasonal: true,
    backgroundColor: '#f9fafb',
    secondaryColor: '#f472b6',
  }),
  
  summer: createThemeFromColor('#f59e0b', {
    name: 'Summer',
    description: 'A warm, sunny summer theme',
    variant: 'vibrant',
    seasonal: true,
    backgroundColor: '#ffffff',
    secondaryColor: '#0ea5e9',
  }),
  
  autumn: createThemeFromColor('#b45309', {
    name: 'Autumn',
    description: 'A rich, warm autumn theme',
    variant: 'muted',
    seasonal: true,
    backgroundColor: '#fffbeb',
    secondaryColor: '#78350f',
  }),
  
  holiday: createThemeFromColor('#b91c1c', {
    name: 'Holiday',
    description: 'A festive holiday theme with seasonal colors',
    variant: 'vibrant',
    seasonal: true,
    backgroundColor: '#ffffff',
    secondaryColor: '#166534',
  }),
};

/**
 * All available preset themes
 */
export const allThemes: Theme[] = [
  systemDefaultTheme,
  ...Object.values(businessThemes),
  ...Object.values(accessibilityThemes),
  ...Object.values(seasonalThemes),
];