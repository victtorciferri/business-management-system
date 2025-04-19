/**
 * Theme API Client - 2025 Edition
 * 
 * Provides client-side API utilities for interacting with the theme API endpoints.
 */

import { ThemeEntity } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

// Helper function to make API requests
async function apiRequest<T>({ 
  url, 
  method, 
  data 
}: { 
  url: string; 
  method: string; 
  data?: any 
}): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  return response.json();
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
  let endpoint = '/api/themes';
  
  if (businessId) {
    endpoint += `/business/${businessId}`;
  } else if (businessSlug) {
    endpoint += `/business/slug/${businessSlug}`;
  }
  
  return apiRequest<ThemeEntity[]>({
    url: endpoint,
    method: 'GET',
  });
}

/**
 * Get a specific theme by ID
 * @param themeId The theme ID
 * @returns Theme entity or null if not found
 */
export async function getThemeById(themeId: number): Promise<ThemeEntity | null> {
  try {
    return await apiRequest<ThemeEntity>({
      url: `/api/themes/${themeId}`,
      method: 'GET',
    });
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
  let endpoint = '/api/themes/active';
  
  if (businessId) {
    endpoint += `/business/${businessId}`;
  } else if (businessSlug) {
    endpoint += `/business/slug/${businessSlug}`;
  }
  
  try {
    return await apiRequest<ThemeEntity>({
      url: endpoint,
      method: 'GET',
    });
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
  return apiRequest<ThemeEntity>({
    url: '/api/themes',
    method: 'POST',
    data: theme,
  });
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
  return apiRequest<ThemeEntity>({
    url: `/api/themes/${themeId}`,
    method: 'PATCH',
    data: theme,
  });
}

/**
 * Delete a theme
 * @param themeId Theme ID to delete
 * @returns Success status
 */
export async function deleteTheme(themeId: number): Promise<boolean> {
  await apiRequest({
    url: `/api/themes/${themeId}`,
    method: 'DELETE',
  });
  return true;
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
  let endpoint = `/api/themes/${themeId}/activate`;
  
  if (businessId) {
    endpoint += `?businessId=${businessId}`;
  }
  
  return apiRequest<ThemeEntity>({
    url: endpoint,
    method: 'POST',
  });
}