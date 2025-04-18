/**
 * Theme System - 2025 Edition
 * 
 * Main entry point for the theme system. Import this file to access all theming functionality.
 */

// Reexport the types and interfaces
export * from '../designTokens';

// Reexport the theme utilities
export * from '../tokenUtils';

// Reexport the theme creator functions
export * from '../themeCreator';

// Reexport the default themes
export * from '../defaultThemes';

// Reexport the seasonal themes
export * from '../seasonalThemes';

// Export the theme manager
export * from '../themeManager';

// Provide a simple API for common operations
import {
  findThemeById,
  getDefaultTheme,
  getDarkVariant,
  getLightVariant,
  getCurrentSeasonalThemes,
  getRecommendedThemeForIndustry
} from '../themeManager';

/**
 * Get a theme by its ID
 */
export const getTheme = findThemeById;

/**
 * Get the default theme, taking into account dark mode preferences
 */
export const getSystemTheme = getDefaultTheme;

/**
 * Get the dark variant of a theme
 */
export const getDarkTheme = getDarkVariant;

/**
 * Get the light variant of a theme
 */
export const getLightTheme = getLightVariant;

/**
 * Get seasonal themes for the current time of year
 */
export const getSeasonalThemes = getCurrentSeasonalThemes;

/**
 * Get the recommended theme for a specific industry
 */
export const getIndustryTheme = getRecommendedThemeForIndustry;