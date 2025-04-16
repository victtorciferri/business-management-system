import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocation } from 'wouter';
import { useBusinessContext } from '@/contexts/BusinessContext';

/**
 * DarkModeInitializer is a component that ensures dark mode gets properly
 * applied across the entire application when the theme settings change.
 * It's designed to be included at the top level of the application.
 */
export default function DarkModeInitializer() {
  const { theme, isDarkMode } = useTheme();
  const [location] = useLocation();
  const { business } = useBusinessContext();
  
  // Determine if this is a business portal page or admin page
  const isBusinessPortalPage = business?.businessSlug && location.includes(`/${business.businessSlug}`);
  const isAdminPage = location.includes('/admin') || location.includes('/platform-admin');

  // Apply dark mode class to document.documentElement based on theme settings
  useEffect(() => {
    // Skip dark mode application for business portal pages - these should
    // use their own theme settings and not the global dark mode
    if (isBusinessPortalPage && business?.themeSettings?.appearance) {
      console.log('Business portal page detected, respecting business appearance settings');
      return;
    }
    
    console.log('DarkModeInitializer: Appearance setting is', theme.appearance);
    
    // Special case for salonelegante
    if (location.includes('/salonelegante')) {
      console.log('DarkModeInitializer: Found salonelegante path, applying dark mode');
      document.documentElement.classList.add('dark');
      return;
    }
    
    if (!theme.appearance) {
      console.log('No appearance setting found, defaulting to system preference');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        console.log('Applying system preference:', 'dark');
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
        
        // Force a style recalculation
        document.body.classList.add('dark-mode-active');
        setTimeout(() => {
          document.body.classList.remove('dark-mode-active');
        }, 10);
        break;
        
      case 'light':
        console.log('DarkModeInitializer: Setting light mode');
        document.documentElement.classList.remove('dark');
        break;
        
      case 'system':
        console.log('DarkModeInitializer: Using system preference');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          console.log('Applying system preference:', 'dark');
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        break;
    }
  }, [theme.appearance, location, business, isBusinessPortalPage]);

  // Add debug info for dark mode status
  useEffect(() => {
    console.log('DarkModeInitializer current dark mode state:', isDarkMode);
    console.log('HTML classList contains dark:', document.documentElement.classList.contains('dark'));
  }, [isDarkMode]);

  return null; // This component doesn't render anything
}