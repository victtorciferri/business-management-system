import { useEffect } from 'react';
import { useGlobalTheme } from '@/providers/GlobalThemeProvider';

/**
 * A component that initializes dark mode and handles theme transitions.
 * This is mounted at the app level and doesn't render anything visible.
 */
const DarkModeInitializer = () => {
  const { resolvedColorMode } = useGlobalTheme();
  
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    // Apply dark mode
    if (resolvedColorMode === 'dark') {
      console.log('DarkModeInitializer: Using dark mode based on preference');
      htmlElement.classList.add('dark');
    } else {
      console.log('DarkModeInitializer: Using light mode based on preference');
      htmlElement.classList.remove('dark');
    }
    
    // Add a transition blocker class to prevent flashing
    htmlElement.classList.add('theme-transition-ready');
    
    // Remove the transition blocker after a short delay
    const timeout = setTimeout(() => {
      htmlElement.classList.add('theme-transition-active');
    }, 100);
    
    return () => {
      clearTimeout(timeout);
    };
  }, [resolvedColorMode]);
  
  // This component doesn't render anything, it just handles side effects
  return null;
};

export default DarkModeInitializer;