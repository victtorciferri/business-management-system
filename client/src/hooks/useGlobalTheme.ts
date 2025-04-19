import { useContext } from 'react';
import { GlobalThemeContext } from '@/providers/GlobalThemeContext';

export function useGlobalTheme() {
  const context = useContext(GlobalThemeContext);
  if (context === undefined) {
    throw new Error('useGlobalTheme must be used within a GlobalThemeProvider');
  }
  return context;
}