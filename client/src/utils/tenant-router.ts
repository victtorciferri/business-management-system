/**
 * Tenant Router Utility
 * 
 * Handles tenant-specific routing and URL management for multi-tenant implementation.
 */

import { useLocation } from 'wouter';
import { useBusinessContext } from '@/contexts/BusinessContext';

// Reserved paths that shouldn't be treated as business slugs
export const RESERVED_PATHS = [
  'api',
  'auth',
  'admin',
  'checkout',
  'dashboard',
  'settings',
  'src',
  'assets',
  'login',
  'register',
  'logout',
  'profile',
  'theme-editor', // Added theme-editor to reserved paths
];

/**
 * Extract business slug from a URL path
 */
export function extractBusinessSlug(path: string): string | null {
  // Remove leading slash if present
  const trimmedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Get the first segment of the path
  const segments = trimmedPath.split('/');
  const potentialSlug = segments[0];
  
  // If empty or a reserved path, it's not a business slug
  if (!potentialSlug || RESERVED_PATHS.includes(potentialSlug)) {
    return null;
  }
  
  return potentialSlug;
}

/**
 * Check if a given path is a business portal path
 */
export function isBusinessPortalPath(path: string): boolean {
  return !!extractBusinessSlug(path);
}

/**
 * Extract the subpath (after the business slug) from a URL path
 */
export function extractSubpath(path: string): string {
  // Remove leading slash if present
  const trimmedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Split the path into segments
  const segments = trimmedPath.split('/');
  
  // If there's a business slug, return everything after it
  if (segments.length > 1 && !RESERVED_PATHS.includes(segments[0])) {
    return '/' + segments.slice(1).join('/');
  }
  
  // Otherwise, return the original path
  return path;
}

/**
 * Hook to navigate within a business context
 */
export function useBusinessNavigation() {
  const [, setLocation] = useLocation();
  const { business } = useBusinessContext();
  
  return {
    // Navigate to a path within the current business context
    navigateWithinBusiness: (path: string) => {
      if (!business) {
        // No business context, navigate to the path directly
        setLocation(path);
        return;
      }
      
      // If path already starts with business slug, leave it as is
      if (path.startsWith(`/${business.businessSlug}/`)) {
        setLocation(path);
        return;
      }
      
      // Ensure the path starts with a slash but doesn't have a trailing slash
      const normalizedPath = path.startsWith('/') 
        ? path 
        : `/${path}`;
      
      // Create a path within the business context
      setLocation(`/${business.businessSlug}${normalizedPath}`);
    },
    
    // Navigate to any path (could be outside the business context)
    navigate: setLocation,
  };
}

/**
 * Build a URL for a specific business
 */
export function buildBusinessUrl(businessSlug: string, path: string = '/'): string {
  // Ensure path starts with slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `/${businessSlug}${normalizedPath}`;
}