/**
 * useGlobalTheme Hook - 2025 Edition
 * 
 * A custom hook that provides access to the global theme context.
 * This hook makes it easy to access and update theme settings from any component.
 */

import { useContext } from 'react';
import { GlobalThemeContext, GlobalThemeContextType, GlobalTokens } from '@/providers/GlobalThemeContext';

/**
 * Hook to access the global theme context
 * 
 * @returns GlobalThemeContextType - The global theme context
 * @throws Error if used outside of a GlobalThemeProvider
 */
export function useGlobalTheme(): GlobalThemeContextType {
  const context = useContext(GlobalThemeContext);
  
  if (context === undefined) {
    throw new Error('useGlobalTheme must be used within a GlobalThemeProvider');
  }
  
  return context;
}

/**
 * Hook to access CSS variable references for theme tokens
 * 
 * @returns An object with CSS variable references for all theme tokens
 */
export function useThemeVars() {
  // Access the tokens from context
  const { globalTokens } = useGlobalTheme();
  
  // Build an object of CSS variable references
  const buildVarRefs = <T extends Record<string, any>>(tokens: T, path: string = ''): Record<string, any> => {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(tokens)) {
      const currentPath = path ? `${path}-${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        // Recursively process nested objects
        result[key] = buildVarRefs(value as Record<string, any>, currentPath);
      } else {
        // Create a CSS variable reference
        const varName = path 
          ? `--${path.replace(/\./g, '-')}-${key}`
          : `--${key}`;
        result[key] = `var(${varName})`;
      }
    }
    
    return result;
  };
  
  return {
    color: buildVarRefs(globalTokens.colors),
    typo: buildVarRefs(globalTokens.typography),
    radius: buildVarRefs({ base: globalTokens.borderRadius }),
    spacing: buildVarRefs({ base: globalTokens.spacing })
  };
}

export default useGlobalTheme;