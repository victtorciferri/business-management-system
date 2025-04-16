import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * DarkModeInitializer is a component that ensures dark mode gets properly
 * applied across the entire application when the theme settings change.
 * It's designed to be included at the top level of the application.
 */
export default function DarkModeInitializer() {
  const { theme } = useTheme();

  // Apply dark mode class to document.documentElement based on theme settings
  useEffect(() => {
    console.log('DarkModeInitializer: Appearance setting is', theme.appearance);
    
    if (!theme.appearance) {
      console.log('No appearance setting found, defaulting to system preference');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return;
    }
    
    switch (theme.appearance) {
      case 'dark':
        console.log('DarkModeInitializer: Setting dark mode');
        document.documentElement.classList.add('dark');
        break;
      case 'light':
        console.log('DarkModeInitializer: Setting light mode');
        document.documentElement.classList.remove('dark');
        break;
      case 'system':
        console.log('DarkModeInitializer: Using system preference');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        break;
    }
  }, [theme.appearance]);

  return null; // This component doesn't render anything
}