/**
 * Create Theme Hook Factory
 * 
 * This utility helps create specialized theme hooks for components
 * that need specific theme token values. It provides type-safety and
 * optimized access to theme tokens.
 */

import { useTheme } from '../providers/ThemeProvider';
import { useMemo } from 'react';
import { DesignTokens } from '../../shared/designTokens';

/**
 * Options for creating a theme hook
 */
interface CreateThemeHookOptions<T> {
  /**
   * Default values to use when tokens are missing
   */
  defaults?: Partial<T>;
  
  /**
   * Transform function to convert raw token values
   */
  transform?: (tokens: DesignTokens) => T;
}

/**
 * Creates a specialized theme hook for component theming
 * 
 * @param tokenGenerator Function that gets token values from the theme
 * @param options Configuration options
 * @returns A custom React hook
 */
export function createThemeHook<T extends Record<string, any>>(
  tokenGenerator: (theme: DesignTokens) => T,
  options: CreateThemeHookOptions<T> = {}
) {
  // Create and return the custom hook
  return function useComponentTheme(): T {
    const { theme } = useTheme();
    
    // Generate the component-specific tokens
    const componentTokens = useMemo(() => {
      try {
        // First try using the token generator
        const tokens = tokenGenerator(theme.tokens);
        
        // Apply any transformation if provided
        if (options.transform) {
          return options.transform(theme.tokens);
        }
        
        // Apply defaults for any missing values
        if (options.defaults) {
          return { ...options.defaults, ...tokens };
        }
        
        return tokens;
      } catch (error) {
        console.error('Error generating component theme tokens:', error);
        
        // Return defaults if available, otherwise empty object
        return options.defaults || ({} as T);
      }
    }, [theme.tokens]);
    
    return componentTokens;
  };
}

/**
 * Creates a specialized theme hook that can access CSS variables
 * 
 * @param variableMap Map of property names to CSS variable paths
 * @param options Configuration options
 * @returns A custom React hook that returns styles and variables
 */
export function createCssVariableHook<T extends Record<string, string>>(
  variableMap: T,
  options: { scope?: string; defaults?: Partial<Record<keyof T, string>> } = {}
) {
  // Return the hook
  return function useCssVariables() {
    const { getVariable, getVariableRef, generateStylesWithVariables } = useTheme();
    
    // Create an object of CSS variable values
    const variables = useMemo(() => {
      const result: Record<string, string> = {};
      
      for (const [key, path] of Object.entries(variableMap)) {
        const defaultValue = options.defaults?.[key as keyof T];
        result[key] = getVariable(path, defaultValue);
      }
      
      return result as Record<keyof T, string>;
    }, [getVariable, variableMap]);
    
    // Generate a style object with CSS variable references
    const styles = useMemo(() => {
      const cssProperties: Record<string, string> = {};
      
      for (const [cssProperty, path] of Object.entries(variableMap)) {
        const defaultValue = options.defaults?.[cssProperty as keyof T];
        cssProperties[cssProperty] = getVariableRef(path, defaultValue);
      }
      
      return cssProperties as React.CSSProperties;
    }, [getVariableRef, variableMap]);
    
    return { variables, styles };
  };
}