/**
 * Theme API Client - 2025 Edition
 * 
 * Provides client-side API utilities for interacting with the theme API endpoints.
 */

import { ThemeEntity } from "@shared/schema";

/**
 * Base API request function for theme API calls
 */
async function apiRequest<T>({ 
  endpoint, 
  method = 'GET', 
  body = undefined,
  headers = {}
}: {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}): Promise<T> {
  try {
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers
    };

    const options: RequestInit = {
      method,
      headers: requestHeaders,
      credentials: 'include'
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    // For DELETE responses with no content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * Get all themes for a business
 * @param businessId The business ID (optional)
 * @param businessSlug The business slug (optional)
 * @returns Array of theme entities
 */
export async function getBusinessThemes(
  businessId?: number,
  businessSlug?: string
): Promise<ThemeEntity[]> {
  try {
    let endpoint = '/api/themes';
    
    if (businessId) {
      endpoint = `/api/themes/business/${businessId}`;
    } else if (businessSlug) {
      endpoint = `/api/themes/business/slug/${businessSlug}`;
    }
    
    return await apiRequest<ThemeEntity[]>({ endpoint });
  } catch (error) {
    console.error('Error fetching business themes:', error);
    return [];
  }
}

/**
 * Get a specific theme by ID
 * @param themeId The theme ID
 * @returns Theme entity or null if not found
 */
export async function getThemeById(themeId: number): Promise<ThemeEntity | null> {
  try {
    const endpoint = `/api/themes/${themeId}`;
    return await apiRequest<ThemeEntity>({ endpoint });
  } catch (error) {
    console.error('Error fetching theme:', error);
    return null;
  }
}

/**
 * Get the active theme for a business
 * @param businessId The business ID (optional)
 * @param businessSlug The business slug (optional)
 * @returns Active theme entity or null if none is active
 */
export async function getActiveTheme(
  businessId?: number,
  businessSlug?: string
): Promise<ThemeEntity | null> {
  try {
    let endpoint = '/api/themes/active';
    
    if (businessId) {
      endpoint = `/api/themes/active/business/${businessId}`;
    } else if (businessSlug) {
      endpoint = `/api/themes/active/business/slug/${businessSlug}`;
    }
    
    return await apiRequest<ThemeEntity>({ endpoint });
  } catch (error) {
    console.error('Error fetching active theme:', error);
    return null;
  }
}

/**
 * Create a new theme
 * @param theme Theme data to create
 * @returns Created theme entity
 */
export async function createTheme(theme: Partial<ThemeEntity>): Promise<ThemeEntity> {
  try {
    const endpoint = '/api/themes';
    return await apiRequest<ThemeEntity>({ 
      endpoint, 
      method: 'POST', 
      body: theme 
    });
  } catch (error) {
    console.error('Error creating theme:', error);
    throw error;
  }
}

/**
 * Update an existing theme
 * @param themeId Theme ID to update
 * @param theme Theme data to update
 * @returns Updated theme entity
 */
export async function updateTheme(
  themeId: number,
  theme: Partial<ThemeEntity>
): Promise<ThemeEntity> {
  try {
    const endpoint = `/api/themes/${themeId}`;
    return await apiRequest<ThemeEntity>({ 
      endpoint, 
      method: 'PATCH', 
      body: theme 
    });
  } catch (error) {
    console.error('Error updating theme:', error);
    throw error;
  }
}

/**
 * Delete a theme
 * @param themeId Theme ID to delete
 * @returns Success status
 */
export async function deleteTheme(themeId: number): Promise<boolean> {
  try {
    const endpoint = `/api/themes/${themeId}`;
    await apiRequest<void>({ endpoint, method: 'DELETE' });
    return true;
  } catch (error) {
    console.error('Error deleting theme:', error);
    return false;
  }
}

/**
 * Activate a theme for a business
 * @param themeId Theme ID to activate
 * @param businessId Business ID (optional)
 * @returns Activated theme entity
 */
export async function activateTheme(
  themeId: number,
  businessId?: number
): Promise<ThemeEntity> {
  try {
    let endpoint = `/api/themes/${themeId}/activate`;
    
    if (businessId) {
      endpoint += `?businessId=${businessId}`;
    }
    
    return await apiRequest<ThemeEntity>({ 
      endpoint, 
      method: 'POST'
    });
  } catch (error) {
    console.error('Error activating theme:', error);
    throw error;
  }
}

/**
 * Set a theme as the default for a business
 * @param themeId Theme ID to set as default
 * @returns Default theme entity
 */
export async function setDefaultTheme(themeId: number): Promise<ThemeEntity> {
  try {
    const endpoint = `/api/themes/${themeId}/default`;
    return await apiRequest<ThemeEntity>({ 
      endpoint, 
      method: 'POST' 
    });
  } catch (error) {
    console.error('Error setting default theme:', error);
    throw error;
  }
}