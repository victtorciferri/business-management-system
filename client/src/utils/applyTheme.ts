import { Theme } from '@shared/config';

/**
 * Applies theme settings to CSS variables in the document
 * This function should be called whenever the theme changes
 */
export const applyTheme = (theme: Theme): void => {
  // Skip if not in browser environment
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Apply color variables
  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--secondary', theme.secondary);
  root.style.setProperty('--background', theme.background);
  root.style.setProperty('--text', theme.text);
  
  // Apply optional variables if they exist
  if (theme.font) {
    root.style.setProperty('--font', theme.font);
  }
  
  if (theme.borderRadius) {
    root.style.setProperty('--border-radius', theme.borderRadius);
  }
  
  if (theme.spacing) {
    root.style.setProperty('--spacing', theme.spacing);
  }
  
  // Set light/dark class based on appearance
  if (theme.appearance === 'dark') {
    root.classList.add('dark');
  } else if (theme.appearance === 'light') {
    root.classList.remove('dark');
  }
  
  // Add additional derived color variables
  // These are computed from the main colors for consistent UI
  
  // Generate hover variants (10% darker)
  const darkenColor = (hex: string, percent: number = 10): string => {
    // Remove hash
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
    
    // Make darker
    r = Math.max(0, Math.floor(r * (100 - percent) / 100));
    g = Math.max(0, Math.floor(g * (100 - percent) / 100));
    b = Math.max(0, Math.floor(b * (100 - percent) / 100));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  // Generate lighter variants (10% lighter)
  const lightenColor = (hex: string, percent: number = 10): string => {
    // Remove hash
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
    
    // Make lighter
    r = Math.min(255, Math.floor(r + (255 - r) * percent / 100));
    g = Math.min(255, Math.floor(g + (255 - g) * percent / 100));
    b = Math.min(255, Math.floor(b + (255 - b) * percent / 100));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  // Apply hover states
  root.style.setProperty('--primary-hover', darkenColor(theme.primary));
  root.style.setProperty('--secondary-hover', darkenColor(theme.secondary));
  
  // Apply focus/active states
  root.style.setProperty('--primary-focus', lightenColor(theme.primary, 5));
  root.style.setProperty('--primary-active', darkenColor(theme.primary, 15));
  
  // Apply foreground colors (text on primary/secondary backgrounds)
  // Simple algorithm to determine if text should be white or black based on background color
  const getContrastColor = (hex: string): string => {
    // Convert hex to RGB
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    
    // Calculate perceived brightness using the sRGB formula
    // https://www.w3.org/TR/AERT/#color-contrast
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return white for dark backgrounds, black for light backgrounds
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };
  
  root.style.setProperty('--primary-foreground', getContrastColor(theme.primary));
  root.style.setProperty('--secondary-foreground', getContrastColor(theme.secondary));
  
  // Set additional UI colors
  root.style.setProperty('--card-background', theme.background);
  root.style.setProperty('--card-foreground', theme.text);
  root.style.setProperty('--popover-background', theme.background);
  root.style.setProperty('--popover-foreground', theme.text);
  
  // Force a re-render of the page to apply the changes
  const forceReflow = document.createElement('div');
  document.body.appendChild(forceReflow);
  document.body.removeChild(forceReflow);
};

/**
 * Resets theme to default values by removing CSS variables
 */
export const resetTheme = (): void => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Remove all custom properties
  root.style.removeProperty('--primary');
  root.style.removeProperty('--secondary');
  root.style.removeProperty('--background');
  root.style.removeProperty('--text');
  root.style.removeProperty('--font');
  root.style.removeProperty('--border-radius');
  root.style.removeProperty('--spacing');
  root.style.removeProperty('--primary-hover');
  root.style.removeProperty('--secondary-hover');
  root.style.removeProperty('--primary-focus');
  root.style.removeProperty('--primary-active');
  root.style.removeProperty('--primary-foreground');
  root.style.removeProperty('--secondary-foreground');
  root.style.removeProperty('--card-background');
  root.style.removeProperty('--card-foreground');
  root.style.removeProperty('--popover-background');
  root.style.removeProperty('--popover-foreground');
};