/**
 * Theme API - 2025 Edition
 * 
 * API functions for managing themes in the application
 */

import { ThemeEntity } from '@shared/schema';

// Generic API request function with enhanced error handling and logging
async function apiRequest(options: {
  url: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  data?: any;
}) {
  const { url, method, data } = options;
  
  try {
    console.log(`API Request: ${method} ${url}`, data ? { dataSize: JSON.stringify(data).length } : 'No data');
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    
    // Log response status
    console.log(`API Response status: ${response.status} ${response.statusText} for ${method} ${url}`);
    
    if (!response.ok) {
      // Try to get error details from response if available
      let errorDetails = null;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorDetails = await response.json();
        }
      } catch (parseError) {
        console.warn('Failed to parse error response as JSON:', parseError);
      }
      
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}${
          errorDetails ? ` - ${JSON.stringify(errorDetails)}` : ''
        }`
      );
    }
    
    // Check for empty response (204 No Content)
    if (response.status === 204) {
      return true; // Return true for successful empty responses
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const jsonData = await response.json();
      console.log(`API Response data for ${method} ${url}:`, 
        jsonData ? { dataAvailable: true, keys: Object.keys(jsonData) } : 'Empty JSON');
      return jsonData;
    }
    
    console.log(`API Response for ${method} ${url} is not JSON`);
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
    console.log('Client - Creating theme with data:', JSON.stringify(theme, null, 2));
    
    // First try our debug endpoint to diagnose any issues
    console.log('Client - Using debug endpoint first to validate theme data');
    try {
      const debugResponse = await apiRequest({
        url: '/api/debug/add-theme-fields',
        method: 'POST',
        data: { theme },
      });
      
      console.log('Client - Debug endpoint response:', debugResponse ? JSON.stringify(debugResponse, null, 2) : 'No response data');
      
      if (debugResponse?.success) {
        console.log('Client - Debug endpoint successfully created theme, returning it');
        return debugResponse.theme;
      } else {
        console.warn('Client - Debug endpoint failed to create theme, falling back to regular endpoint');
      }
    } catch (debugError) {
      console.warn('Client - Debug endpoint error:', debugError);
      console.warn('Client - Falling back to regular endpoint...');
    }
    
    // If debug endpoint failed, try regular endpoint
    const response = await apiRequest({
      url: '/api/themes',
      method: 'POST',
      data: theme,
    });
    
    console.log('Client - API Response from theme creation:', response ? JSON.stringify(response, null, 2) : 'No response data');
    
    if (!response) {
      console.error('Client - Theme creation API returned empty response');
      throw new Error('Empty response from server when creating theme');
    }
    
    // Validate that we have a proper theme entity with at least an ID
    if (!response.id) {
      console.error('Client - Theme creation returned invalid data (missing ID):', response);
      throw new Error('Invalid theme data returned from server (missing ID)');
    }
    
    return response;
  } catch (error) {
    console.error('Client - Failed to create theme:', error);
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