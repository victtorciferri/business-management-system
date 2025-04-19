/**
 * Theme API - 2025 Edition
 * 
 * Client-side API functions for managing themes.
 */

import { ThemeEntity } from '@shared/schema';

// Interface for theme request data
export interface ThemeRequest {
  id?: number;
  name?: string;
  primary?: string;
  primaryColor?: string;
  secondary?: string;
  secondaryColor?: string;
  background?: string;
  backgroundColor?: string;
  text?: string;
  textColor?: string;
  accent?: string;
  accentColor?: string;
  fontFamily?: string;
  variant?: string;
  fontSize?: number;
  highContrast?: boolean;
  reducedMotion?: boolean;
  borderRadius?: number;
  isActive?: boolean;
  isDefault?: boolean;
  logoImageUrl?: string;
  tokens?: any;
  [key: string]: any;
}

/**
 * Fetch all themes
 * @returns Array of themes
 */
export async function getAllThemes(): Promise<ThemeEntity[]> {
  try {
    const response = await fetch('/api/themes');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch all themes: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching all themes:', error);
    return [];
  }
}

/**
 * Fetch all themes for a business
 * @param businessId Optional business ID
 * @param businessSlug Optional business slug
 * @returns Array of themes
 */
export async function getBusinessThemes(
  businessId?: number,
  businessSlug?: string
): Promise<ThemeEntity[]> {
  try {
    let url = '/api/themes';
    
    if (businessId) {
      url += `/business/${businessId}`;
    } else if (businessSlug) {
      url += `/business-slug/${businessSlug}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch themes: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    return [];
  }
}

/**
 * Fetch themes by business slug
 * @param slug Business slug
 * @returns Array of themes
 */
export async function getThemesByBusinessSlug(slug: string): Promise<ThemeEntity[]> {
  return getBusinessThemes(undefined, slug);
}

/**
 * Get the active theme for a business
 * @param businessId Optional business ID
 * @param businessSlug Optional business slug
 * @returns Active theme or null
 */
export async function getActiveTheme(
  businessId?: number,
  businessSlug?: string
): Promise<ThemeEntity | null> {
  try {
    let url = '/api/themes/active';
    
    if (businessId) {
      url += `?businessId=${businessId}`;
    } else if (businessSlug) {
      url += `?businessSlug=${businessSlug}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch active theme: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching active theme:', error);
    return null;
  }
}

/**
 * Get a specific theme by ID
 * @param id Theme ID
 * @returns Theme or null
 */
export async function getThemeById(id: number): Promise<ThemeEntity | null> {
  try {
    const response = await fetch(`/api/themes/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch theme: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching theme:', error);
    return null;
  }
}

/**
 * Create a new theme
 * @param theme Theme data
 * @returns Created theme
 */
export async function createTheme(theme: Partial<ThemeEntity>): Promise<ThemeEntity | null> {
  try {
    const response = await fetch('/api/themes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(theme),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create theme: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating theme:', error);
    return null;
  }
}

/**
 * Update an existing theme
 * @param id Theme ID
 * @param theme Updated theme data
 * @returns Updated theme
 */
export async function updateTheme(
  id: number,
  theme: Partial<ThemeEntity>
): Promise<ThemeEntity | null> {
  try {
    const response = await fetch(`/api/themes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(theme),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update theme: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating theme:', error);
    return null;
  }
}

/**
 * Delete a theme
 * @param id Theme ID
 * @returns Success indicator
 */
export async function deleteTheme(id: number): Promise<boolean> {
  try {
    const response = await fetch(`/api/themes/${id}`, {
      method: 'DELETE',
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error deleting theme:', error);
    return false;
  }
}

/**
 * Activate a theme as the current active theme
 * @param id Theme ID
 * @returns Activated theme
 */
export async function activateTheme(id: number): Promise<ThemeEntity | null> {
  try {
    const response = await fetch(`/api/themes/${id}/activate`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to activate theme: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error activating theme:', error);
    return null;
  }
}