/**
 * Theme Manager - 2025 Edition
 * 
 * A centralized system for managing all themes, including defaults, industry-specific,
 * and seasonal themes. Provides utilities for finding, filtering, and organizing themes.
 */

import { Theme, ThemeCategory } from './designTokens';
import { defaultThemes, themeCategories, systemDefaultTheme } from './defaultThemes';
import { seasonalThemes, seasonalThemeCategories } from './seasonalThemes';
import { createDarkVariantOf, createLightVariantOf } from './defaultThemes';

/**
 * All themes combined for easy access
 */
export const allThemes: Record<string, Theme> = {
  ...defaultThemes,
  ...seasonalThemes,
};

/**
 * All theme categories combined
 */
export const allThemeCategories = [...themeCategories, ...seasonalThemeCategories];

/**
 * Find a theme by ID
 */
export function findThemeById(id: string): Theme | undefined {
  return allThemes[id] || Object.values(allThemes).find(theme => theme.metadata.id === id);
}

/**
 * Find themes by industry
 */
export function findThemesByIndustry(industry: string): Theme[] {
  return Object.values(allThemes).filter(theme => theme.metadata.industry === industry);
}

/**
 * Find themes by tag
 */
export function findThemesByTag(tag: string): Theme[] {
  return Object.values(allThemes).filter(theme => theme.metadata.tags.includes(tag));
}

/**
 * Get seasonal themes for the current month
 */
export function getCurrentSeasonalThemes(): Theme[] {
  const month = new Date().getMonth(); // 0-11
  
  if (month === 11 || month === 0 || month === 1) {
    // Winter: December, January, February
    return findThemesByTag('winter');
  } else if (month >= 2 && month <= 4) {
    // Spring: March, April, May
    return findThemesByTag('spring');
  } else if (month >= 5 && month <= 7) {
    // Summer: June, July, August
    return findThemesByTag('summer');
  } else {
    // Fall: September, October, November
    return findThemesByTag('fall');
  }
}

/**
 * Get themes for a specific holiday
 */
export function getHolidayThemes(holiday: string): Theme[] {
  return findThemesByTag(holiday);
}

/**
 * Get featured themes
 */
export function getFeaturedThemes(): Theme[] {
  return Object.values(allThemes).filter(theme => theme.metadata.featured);
}

/**
 * Get a dark variant of any theme
 */
export function getDarkVariant(themeId: string): Theme | undefined {
  const theme = findThemeById(themeId);
  if (!theme) return undefined;
  
  // Check if a dark variant already exists
  const darkId = `${themeId}-dark`;
  const existingDark = findThemeById(darkId);
  if (existingDark) return existingDark;
  
  // Create a new dark variant
  return createDarkVariantOf(theme);
}

/**
 * Get a light variant of any theme
 */
export function getLightVariant(themeId: string): Theme | undefined {
  const theme = findThemeById(themeId);
  if (!theme) return undefined;
  
  // Check if it's already a dark theme
  if (!theme.metadata.id.includes('dark')) return theme;
  
  // Check if a light variant already exists
  const lightId = theme.metadata.id.replace('-dark', '-light');
  const existingLight = findThemeById(lightId);
  if (existingLight) return existingLight;
  
  // Create a new light variant
  return createLightVariantOf(theme);
}

/**
 * Get the theme that should be used by default (with system preferences taken into account)
 */
export function getDefaultTheme(options: { prefersDarkMode?: boolean } = {}): Theme {
  // If the user prefers dark mode, return the dark version of our default
  if (options.prefersDarkMode) {
    // Check if we have a dark variant of the system default
    const darkSystemDefault = getDarkVariant(systemDefaultTheme.metadata.id);
    if (darkSystemDefault) return darkSystemDefault;
    
    // If no specific dark variant, return our standard dark theme
    return allThemes.standardDark || allThemes.dark || systemDefaultTheme;
  }
  
  // Otherwise return the default light theme
  return systemDefaultTheme;
}

/**
 * Get the best recommended theme for a specific industry
 */
export function getRecommendedThemeForIndustry(industry: string, options: { prefersDarkMode?: boolean } = {}): Theme {
  // Get all themes for this industry
  const industryThemes = findThemesByIndustry(industry);
  
  // If no industry-specific themes, return default
  if (industryThemes.length === 0) {
    return getDefaultTheme(options);
  }
  
  // Find a featured theme for this industry
  const featuredIndustryTheme = industryThemes.find(theme => theme.metadata.featured);
  
  // Find most suitable theme based on dark mode preference
  if (options.prefersDarkMode) {
    // Find a dark theme for this industry
    const darkIndustryTheme = industryThemes.find(theme => 
      theme.metadata.id.includes('dark') || theme.metadata.tags.includes('dark')
    );
    
    if (darkIndustryTheme) return darkIndustryTheme;
    
    // Or create a dark variant of a featured/first theme
    const baseTheme = featuredIndustryTheme || industryThemes[0];
    const darkVariant = getDarkVariant(baseTheme.metadata.id);
    if (darkVariant) return darkVariant;
  }
  
  // Return a featured theme or the first available
  return featuredIndustryTheme || industryThemes[0];
}

/**
 * Create a simple theme selection user interface (object format)
 * This can be used to build a theme selector UI in any framework
 */
export function getThemeSelectionInterface() {
  // Get all theme categories
  const categories = allThemeCategories.map(category => ({
    id: category.id,
    name: category.name,
    description: category.description,
    themes: category.themes.map(theme => ({
      id: theme.metadata.id,
      name: theme.metadata.name,
      description: theme.metadata.description,
      thumbnail: theme.metadata.thumbnail,
      tags: theme.metadata.tags,
      variant: theme.metadata.variant,
      hasDarkVariant: !!getDarkVariant(theme.metadata.id) && theme.metadata.id !== getDarkVariant(theme.metadata.id)?.metadata.id,
    }))
  }));
  
  // Get other useful theme lists
  const featured = getFeaturedThemes().map(theme => theme.metadata.id);
  const seasonal = getCurrentSeasonalThemes().map(theme => theme.metadata.id);
  const industries = [...new Set(Object.values(allThemes).map(theme => theme.metadata.industry))];
  
  return {
    categories,
    featured,
    seasonal,
    industries,
    systemDefault: systemDefaultTheme.metadata.id,
  };
}