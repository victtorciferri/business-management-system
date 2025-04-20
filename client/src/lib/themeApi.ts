/**
 * Theme API - 2025 Edition
 * 
 * API functions for managing themes in the application
 */

import { ThemeEntity } from '@shared/schema';

// Generic API request function
async function apiRequest(options: {
  url: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  data?: any;
}) {
  const { url, method, data } = options;
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return null; // For non-JSON responses
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * Fetch all themes from the API
 * 
 * @returns List of themes
 */
export async function getAllThemes(): Promise<ThemeEntity[]> {
  try {
    const response = await apiRequest({
      url: '/api/themes',
      method: 'GET',
    });
    return response || [];
  } catch (error) {
    console.error('Failed to fetch themes:', error);
    return [];
  }
}

/**
 * Get a theme by its ID from the API
 * 
 * @param id Theme ID to fetch
 * @returns The theme or null if not found
 */
export async function getThemeById(id: number): Promise<ThemeEntity | null> {
  try {
    const response = await apiRequest({
      url: `/api/themes/${id}`,
      method: 'GET',
    });
    return response || null;
  } catch (error) {
    console.error(`Failed to fetch theme with ID ${id}:`, error);
    return null;
  }
}

/**
 * Get the active theme for a business
 * 
 * @param businessId Business ID (optional)
 * @param businessSlug Business slug (optional)
 * @returns The active theme or null if not found
 */
export async function getActiveTheme(
  businessId?: number,
  businessSlug?: string
): Promise<ThemeEntity | null> {
  try {
    let url = '/api/themes/active';
    
    // Add query params if provided
    if (businessId) {
      url += `?businessId=${businessId}`;
    } else if (businessSlug) {
      url += `?businessSlug=${businessSlug}`;
    }
    
    const response = await apiRequest({
      url,
      method: 'GET',
    });
    return response || null;
  } catch (error) {
    console.error('Failed to fetch active theme:', error);
    return null;
  }
}

/**
 * Create a new theme in the API
 * 
 * @param theme Theme data to create
 * @returns The created theme or null if failed
 */
export async function createTheme(theme: Partial<ThemeEntity>): Promise<ThemeEntity | null> {
  try {
    const response = await apiRequest({
      url: '/api/themes',
      method: 'POST',
      data: theme,
    });
    return response || null;
  } catch (error) {
    console.error('Failed to create theme:', error);
    return null;
  }
}

/**
 * Update an existing theme in the API
 * 
 * @param id Theme ID to update
 * @param theme Updated theme data
 * @returns The updated theme or null if failed
 */
export async function updateTheme(
  id: number,
  theme: Partial<ThemeEntity>
): Promise<ThemeEntity | null> {
  try {
    const response = await apiRequest({
      url: `/api/themes/${id}`,
      method: 'PATCH',
      data: theme,
    });
    return response || null;
  } catch (error) {
    console.error(`Failed to update theme with ID ${id}:`, error);
    return null;
  }
}

/**
 * Delete a theme from the API
 * 
 * @param id Theme ID to delete
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteTheme(id: number): Promise<boolean> {
  try {
    await apiRequest({
      url: `/api/themes/${id}`,
      method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error(`Failed to delete theme with ID ${id}:`, error);
    return false;
  }
}

/**
 * Set a theme as active for a business
 * 
 * @param id Theme ID to activate
 * @returns The activated theme or null if failed
 */
export async function activateTheme(id: number): Promise<ThemeEntity | null> {
  try {
    const response = await apiRequest({
      url: `/api/themes/${id}/activate`,
      method: 'POST',
    });
    return response || null;
  } catch (error) {
    console.error(`Failed to activate theme with ID ${id}:`, error);
    return null;
  }
}

/**
 * Duplicate a theme
 * 
 * @param id Theme ID to duplicate
 * @param name New theme name (optional)
 * @returns The duplicated theme or null if failed
 */
export async function duplicateTheme(
  id: number,
  name?: string
): Promise<ThemeEntity | null> {
  try {
    const response = await apiRequest({
      url: `/api/themes/${id}/duplicate`,
      method: 'POST',
      data: name ? { name } : undefined,
    });
    return response || null;
  } catch (error) {
    console.error(`Failed to duplicate theme with ID ${id}:`, error);
    return null;
  }
}

/**
 * Apply a theme to a business
 * 
 * @param id Theme ID to apply
 * @param businessId Business ID to apply theme to (optional)
 * @returns True if application was successful, false otherwise
 */
export async function applyThemeToBusinessAccount(
  id: number,
  businessId?: number
): Promise<boolean> {
  try {
    await apiRequest({
      url: `/api/themes/${id}/apply${businessId ? `?businessId=${businessId}` : ''}`,
      method: 'POST',
    });
    return true;
  } catch (error) {
    console.error(`Failed to apply theme with ID ${id} to business:`, error);
    return false;
  }
}

/**
 * Get the CSS for a theme
 * 
 * @param id Theme ID to get CSS for
 * @returns CSS string or null if failed
 */
export async function getThemeCSS(id: number): Promise<string | null> {
  try {
    const response = await apiRequest({
      url: `/api/themes/${id}/css`,
      method: 'GET',
    });
    return response?.css || null;
  } catch (error) {
    console.error(`Failed to get CSS for theme with ID ${id}:`, error);
    return null;
  }
}

/**
 * Get themes from the marketplace
 * 
 * @param category Category to filter by (optional)
 * @param limit Maximum number of themes to return (optional)
 * @returns List of marketplace themes
 */
export async function getMarketplaceThemes(
  category?: string,
  limit?: number
): Promise<ThemeEntity[]> {
  try {
    let url = '/api/themes/marketplace';
    
    // Add query params if provided
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (limit) params.append('limit', limit.toString());
    
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
    
    const response = await apiRequest({
      url,
      method: 'GET',
    });
    return response || [];
  } catch (error) {
    console.error('Failed to fetch marketplace themes:', error);
    return [];
  }
}