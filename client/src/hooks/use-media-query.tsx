/**
 * Media Query Hook - 2025 Edition
 * 
 * A custom React hook for tracking media query states.
 * This is useful for responsive design, detecting user preferences, etc.
 */

import { useState, useEffect } from 'react';

/**
 * Hook to track the state of a media query
 * 
 * @param query CSS media query to check
 * @returns Boolean indicating if the media query matches
 * 
 * @example
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 * const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 */
export function useMediaQuery(query: string): boolean {
  // Safety check for server-side rendering
  const getMatches = (query: string): boolean => {
    // Return false on the server to avoid hydration mismatches
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  };
  
  const [matches, setMatches] = useState<boolean>(getMatches(query));
  
  // Update matches when the media query changes or the component mounts
  useEffect(() => {
    // Get the current match state
    const mediaQuery = window.matchMedia(query);
    
    // Update the state initially
    setMatches(mediaQuery.matches);
    
    // Define a handler for media query changes
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add the event listener
    mediaQuery.addEventListener('change', handler);
    
    // Clean up the event listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);
  
  return matches;
}

/**
 * Hook to track common device breakpoints
 * 
 * @returns Object with boolean flags for different breakpoints
 */
export function useBreakpoints() {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isWidescreen = useMediaQuery('(min-width: 1280px)');
  
  return { isMobile, isTablet, isDesktop, isWidescreen };
}

/**
 * Hook to track user preference media queries
 * 
 * @returns Object with boolean flags for user preferences
 */
export function useUserPreferences() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersLightMode = useMediaQuery('(prefers-color-scheme: light)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const prefersReducedData = useMediaQuery('(prefers-reduced-data: reduce)');
  const prefersReducedTransparency = useMediaQuery('(prefers-reduced-transparency: reduce)');
  const prefersContrast = useMediaQuery('(prefers-contrast: more)');
  const prefersHighContrast = useMediaQuery('(prefers-contrast: high)');
  
  return {
    prefersDarkMode,
    prefersLightMode,
    prefersReducedMotion,
    prefersReducedData,
    prefersReducedTransparency,
    prefersContrast,
    prefersHighContrast,
  };
}

/**
 * Hook to track device orientation
 * 
 * @returns Object with boolean flags for orientation
 */
export function useOrientation() {
  const isPortrait = useMediaQuery('(orientation: portrait)');
  const isLandscape = useMediaQuery('(orientation: landscape)');
  
  return { isPortrait, isLandscape };
}

/**
 * Hook to track high-density displays (retina, etc.)
 * 
 * @returns Boolean indicating if the display is high-density
 */
export function useHighDensityDisplay() {
  // This will match displays with 2x pixel density or higher
  return useMediaQuery('(min-resolution: 2dppx)');
}

/**
 * Hook to track hover capability
 * This helps distinguish between touch-only and hover-capable devices
 * 
 * @returns Boolean indicating if the device supports hovering
 */
export function useHoverCapability() {
  // Check if hover is available as primary input mechanism
  const canHover = useMediaQuery('(hover: hover)');
  const cannotHover = useMediaQuery('(hover: none)');
  
  // Check if pointer is fine (mouse, stylus) or coarse (touch)
  const hasFinePointer = useMediaQuery('(pointer: fine)');
  const hasCoarsePointer = useMediaQuery('(pointer: coarse)');
  
  return {
    canHover,
    cannotHover,
    hasFinePointer,
    hasCoarsePointer,
    // A practical flag for hover-based UI decisions
    shouldShowHoverEffects: canHover && hasFinePointer,
  };
}