import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * DarkModeInitializer is a simplified component that ensures dark mode gets 
 * properly applied based on system preference. It avoids context dependencies
 * to prevent circular dependencies in the React tree.
 */
export default function DarkModeInitializer() {
  const [location] = useLocation();

  // Apply dark mode class based on system preference
  useEffect(() => {
    // Get stored preference or use system preference
    const storedPreference = localStorage.getItem('theme-mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDarkMode = storedPreference === 'dark' || 
      (storedPreference !== 'light' && prefersDark);
    
    // Apply appropriate class
    if (shouldUseDarkMode) {
      console.log('DarkModeInitializer: Using dark mode based on preference');
      document.documentElement.classList.add('dark');
    } else {
      console.log('DarkModeInitializer: Using light mode based on preference');
      document.documentElement.classList.remove('dark');
    }
    
    // Listen for system preference changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only apply system preference changes if no explicit preference is stored
      if (!localStorage.getItem('theme-mode')) {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleChange);
    };
  }, [location]);

  return null; // This component doesn't render anything
}