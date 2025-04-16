// This script runs immediately when imported to apply dark mode
// before React renders to prevent flickering

// Function to detect if we should use dark mode
function shouldUseDarkMode(): boolean {
  // Check if URL includes a business with dark mode
  const path = window.location.pathname;
  
  // If we're on a business page (salonelegante has dark mode)
  if (path.includes('/salonelegante')) {
    console.log('Detected Salon Elegante - applying dark mode');
    return true;
  }
  
  // Check for system dark mode preference as fallback
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    console.log('System dark mode detected - applying dark mode');
    return true;
  }
  
  return false;
}

// Apply dark mode class to HTML element before React renders
if (shouldUseDarkMode()) {
  document.documentElement.classList.add('dark');
  console.log('Dark mode class applied early by index-dark-mode.ts');
}

export {};