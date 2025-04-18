import { Theme, defaultTheme } from "./config";

/**
 * Theme Preset Interface
 * Defines structure for industry-specific presets
 */
export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  category?: string;
  preview?: string;
  theme: Theme;
}

/**
 * Collection of industry-specific theme presets
 * These provide starting points for different business types
 */
export const themePresets: ThemePreset[] = [
  // Default preset that matches the current site appearance
  {
    id: 'default',
    name: 'Default',
    description: 'The default system appearance with modern gradient elements',
    category: 'general',
    theme: {
      ...defaultTheme,
      name: "Default",
      variant: "professional",
      primaryColor: "#4f46e5", // Indigo-600
      secondaryColor: "#9333EA", // Purple-600
      accentColor: "#f59e0b", // Amber-500
      backgroundColor: "#ffffff",
      textColor: "#111827", // Gray-900
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: 8,
      spacing: 16,
      buttonStyle: "default",
      cardStyle: "bordered",
      appearance: "system",
    }
  },
  // Salon & Beauty
  {
    id: 'elegant-spa',
    name: 'Elegant Spa',
    description: 'A sophisticated and calming theme for salons and spas',
    category: 'beauty',
    theme: {
      ...defaultTheme,
      name: "Elegant Spa",
      variant: "professional",
      primaryColor: "#9D7E79",
      secondaryColor: "#694E4E",
      accentColor: "#D4B2A7",
      backgroundColor: "#FAF6F6",
      textColor: "#362F2F",
      fontFamily: "Playfair Display, serif",
      borderRadius: 8,
      spacing: 16,
      buttonStyle: "rounded",
      cardStyle: "elevated",
      appearance: "light",
    }
  },
  {
    id: 'modern-salon',
    name: 'Modern Salon',
    description: 'A bold and contemporary look for modern salons',
    category: 'beauty',
    theme: {
      ...defaultTheme,
      name: "Modern Salon",
      variant: "vibrant",
      primaryColor: "#FF5A5F",
      secondaryColor: "#484848",
      accentColor: "#FFB400",
      backgroundColor: "#FFFFFF",
      textColor: "#2D2D2D",
      fontFamily: "Poppins, sans-serif",
      borderRadius: 12,
      spacing: 18,
      buttonStyle: "pill",
      cardStyle: "default",
      appearance: "light",
    }
  },
  
  // Healthcare & Medical
  {
    id: 'medical-professional',
    name: 'Medical Professional',
    description: 'A clean and trustworthy theme for medical services',
    category: 'healthcare',
    theme: {
      ...defaultTheme,
      name: "Medical Professional",
      variant: "professional",
      primaryColor: "#0077B6",
      secondaryColor: "#023E8A",
      accentColor: "#48CAE4",
      backgroundColor: "#F8F9FA",
      textColor: "#212529",
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: 6,
      spacing: 14,
      buttonStyle: "default",
      cardStyle: "bordered",
      appearance: "light",
    }
  },
  {
    id: 'wellness-center',
    name: 'Wellness Center',
    description: 'A calming theme for holistic health and wellness',
    category: 'healthcare',
    theme: {
      ...defaultTheme,
      name: "Wellness Center",
      variant: "tint",
      primaryColor: "#4CAF50",
      secondaryColor: "#2E7D32",
      accentColor: "#8BC34A",
      backgroundColor: "#F1F8E9",
      textColor: "#33691E",
      fontFamily: "Nunito, sans-serif",
      borderRadius: 16,
      spacing: 20,
      buttonStyle: "rounded",
      cardStyle: "elevated",
      appearance: "light",
    }
  },
  
  // Fitness & Sports
  {
    id: 'fitness-studio',
    name: 'Fitness Studio',
    description: 'An energetic theme for fitness and training services',
    category: 'fitness',
    theme: {
      ...defaultTheme,
      name: "Fitness Studio",
      variant: "vibrant",
      primaryColor: "#FF3D00",
      secondaryColor: "#212121",
      accentColor: "#FFC107",
      backgroundColor: "#FAFAFA",
      textColor: "#212121",
      fontFamily: "Montserrat, sans-serif",
      borderRadius: 4,
      spacing: 16,
      buttonStyle: "square",
      cardStyle: "default",
      appearance: "light",
    }
  },
  {
    id: 'yoga-studio',
    name: 'Yoga Studio',
    description: 'A serene theme for yoga and mindfulness practices',
    category: 'fitness',
    theme: {
      ...defaultTheme,
      name: "Yoga Studio",
      variant: "tint",
      primaryColor: "#9C27B0",
      secondaryColor: "#6A1B9A",
      accentColor: "#E1BEE7",
      backgroundColor: "#F3E5F5",
      textColor: "#4A148C",
      fontFamily: "Lato, sans-serif",
      borderRadius: 24,
      spacing: 22,
      buttonStyle: "pill",
      cardStyle: "flat",
      appearance: "light",
    }
  },
  
  // Professional Services
  {
    id: 'corporate-consulting',
    name: 'Corporate Consulting',
    description: 'A professional theme for business and consulting services',
    category: 'professional',
    theme: {
      ...defaultTheme,
      name: "Corporate Consulting",
      variant: "professional",
      primaryColor: "#1E3A8A",
      secondaryColor: "#111827",
      accentColor: "#3B82F6",
      backgroundColor: "#FFFFFF",
      textColor: "#111827",
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: 6,
      spacing: 16,
      buttonStyle: "default",
      cardStyle: "bordered",
      appearance: "light",
    }
  },
  {
    id: 'creative-agency',
    name: 'Creative Agency',
    description: 'A bold theme for creative and design services',
    category: 'professional',
    theme: {
      ...defaultTheme,
      name: "Creative Agency",
      variant: "vibrant",
      primaryColor: "#6D28D9",
      secondaryColor: "#4C1D95",
      accentColor: "#A78BFA",
      backgroundColor: "#F5F3FF",
      textColor: "#1F2937",
      fontFamily: "Manrope, sans-serif",
      borderRadius: 12,
      spacing: 20,
      buttonStyle: "rounded",
      cardStyle: "elevated",
      appearance: "light",
    }
  },
  
  // Dark Mode Themes
  {
    id: 'dark-professional',
    name: 'Dark Professional',
    description: 'A sleek dark theme for professional services',
    category: 'dark',
    theme: {
      ...defaultTheme,
      name: "Dark Professional",
      variant: "professional",
      primaryColor: "#60A5FA",
      secondaryColor: "#A78BFA",
      accentColor: "#F472B6",
      backgroundColor: "#111827",
      textColor: "#F9FAFB",
      fontFamily: "Inter, system-ui, sans-serif",
      borderRadius: 8,
      spacing: 16,
      buttonStyle: "default",
      cardStyle: "bordered",
      appearance: "dark",
    }
  },
  {
    id: 'dark-creative',
    name: 'Dark Creative',
    description: 'A bold dark theme for creative industries',
    category: 'dark',
    theme: {
      ...defaultTheme,
      name: "Dark Creative",
      variant: "vibrant",
      primaryColor: "#F472B6",
      secondaryColor: "#EC4899",
      accentColor: "#FB923C",
      backgroundColor: "#18181B",
      textColor: "#F4F4F5",
      fontFamily: "Plus Jakarta Sans, sans-serif",
      borderRadius: 16,
      spacing: 20,
      buttonStyle: "pill",
      cardStyle: "elevated",
      appearance: "dark",
    }
  },
];

/**
 * Get theme presets by category
 * @param category The category to filter by
 * @returns Array of theme presets matching the category
 */
export const getPresetsByCategory = (category?: string): ThemePreset[] => {
  if (!category) return themePresets;
  return themePresets.filter(preset => preset.category === category);
};

/**
 * Get a theme preset by ID
 * @param id The ID of the preset to retrieve
 * @returns The theme preset if found, undefined otherwise
 */
export const getPresetById = (id: string): ThemePreset | undefined => {
  return themePresets.find(preset => preset.id === id);
};

/**
 * Get all unique categories from presets
 * @returns Array of unique categories
 */
export const getPresetCategories = (): string[] => {
  const categories = new Set<string>();
  themePresets.forEach(preset => {
    if (preset.category) {
      categories.add(preset.category);
    }
  });
  return Array.from(categories);
};