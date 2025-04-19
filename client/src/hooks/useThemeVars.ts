/**
 * useThemeVars Hook - 2025 Edition
 *
 * A hook that provides access to theme CSS variables with proper fallback handling
 */

import { cssVar } from '@/lib/themeUtils';
import { useBusinessTheme } from '@/providers/MultiTenantThemeProvider';
import { useGlobalTokens } from './useGlobalTheme';

/**
 * Get a CSS variable value from the current theme
 * If a CSS variable isn't found, it falls back to a default value or null
 */
export function useThemeVars() {
  const { themeClasses } = useBusinessTheme();
  const globalTokens = useGlobalTokens();
  
  /**
   * Get a CSS variable with proper scoping based on the current theme
   * @param varName The name of the CSS variable (without the --)
   * @param fallback Optional fallback value if the CSS variable doesn't exist
   * @returns CSS variable reference for use in styles
   */
  function getCssVar(varName: string): string {
    // Use the cssVar utility from themeUtils
    return cssVar(varName);
  }
  
  /**
   * Get the actual value of a CSS variable from the DOM
   * @param varName The name of the CSS variable (without the --)
   * @param elementScope Optional element to scope the lookup
   * @param fallback Optional fallback value
   * @returns The computed value of the CSS variable
   */
  function getCssVarValue(
    varName: string, 
    elementScope?: HTMLElement,
    fallback?: string
  ): string {
    // Format the CSS variable name
    const formattedVarName = `--${varName.replace(/\./g, '-')}`;
    
    // Default to document element if no scope provided
    const element = elementScope || document.documentElement;
    
    // Try to get the variable from the business theme
    let element2Check = document.querySelector(`.${themeClasses}`);
    
    if (!element2Check) {
      // Fallback to document root if no business theme element found
      element2Check = document.documentElement;
    }
    
    // Get the computed value
    const value = getComputedStyle(element2Check).getPropertyValue(formattedVarName).trim();
    
    // Return the value or fallback
    return value || fallback || '';
  }
  
  return {
    getCssVar,
    getCssVarValue,
    themeClass: themeClasses
  };
}

export default useThemeVars;