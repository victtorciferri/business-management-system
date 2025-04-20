const fs = require('fs');
const path = require('path');

// Read the App.tsx file
const appPath = path.join('client', 'src', 'App.tsx');
let appContent = fs.readFileSync(appPath, 'utf8');

// Remove LegacyThemeProvider from all customer-portal routes, one at a time
const customerPortalRoutes = [
  /(<ThemeProvider>\s*)<LegacyThemeProvider>\s*(.*?)\s*<\/LegacyThemeProvider>(\s*<\/ThemeProvider>)/gs,
];

// For each pattern, replace with the content without LegacyThemeProvider
customerPortalRoutes.forEach(pattern => {
  appContent = appContent.replace(pattern, '$1$2$3');
});

// Write the updated content back to the file
fs.writeFileSync(appPath, appContent, 'utf8');
console.log('App.tsx updated successfully');
