import { useContext } from 'react';
import { GlobalThemeContext } from '@/providers/GlobalThemeContext';

/**
 * Hook to access the global theme context
 */
export function useGlobalTheme() {
  const context = useContext(GlobalThemeContext);
  
  if (!context) {
    throw new Error('useGlobalTheme must be used within a GlobalThemeContextProvider');
  }
  
  return context;
}