/**
 * CSS Variable Server - 2025 Edition
 * 
 * Server-side utilities for generating CSS from themes.
 * Used for SSR (Server-Side Rendering) and static CSS generation.
 */

import fs from 'fs';
import path from 'path';
import { Theme } from '../../shared/designTokens';
import { generateCSSFromVariables, tokensToCSSVariables } from '../../shared/tokenUtils';

/**
 * Options for server-side CSS generation
 */
interface ServerCSSOptions {
  /** Output file path for generated CSS (optional) */
  outputPath?: string;
  
  /** CSS selector to scope variables to (default: ':root') */
  selector?: string;
  
  /** Include media queries for color modes (light/dark) */
  includeColorModes?: boolean;
  
  /** Add a timestamp comment to the generated CSS */
  addTimestamp?: boolean;
  
  /** Minify the output CSS */
  minify?: boolean;
  
  /** Add keyframe animations from theme.tokens.animation */
  includeAnimations?: boolean;
  
  /** Add utility classes that use the theme variables */
  includeUtilityClasses?: boolean;
}

/**
 * Generate theme CSS on the server
 * 
 * @param theme The theme object containing tokens
 * @param options Options for server-side CSS generation
 * @returns CSS string with variable declarations
 */
export function generateThemeCSSOnServer(
  theme: Theme,
  options: ServerCSSOptions = {}
): string {
  const {
    selector = ':root',
    includeColorModes = false,
    addTimestamp = true,
    minify = false,
    includeAnimations = true,
    includeUtilityClasses = true,
  } = options;
  
  // Convert tokens to CSS variables
  const variables = tokensToCSSVariables(theme.tokens);
  
  // Generate the base CSS
  let css = '';
  
  // Add header comment
  if (!minify) {
    css += `/**
 * Theme: ${theme.metadata.name}
 * ID: ${theme.metadata.id}
 * Author: ${theme.metadata.author}
 * Version: ${theme.metadata.version}
 * Generated: ${addTimestamp ? new Date().toISOString() : '[timestamp disabled]'}
 */\n\n`;
  }
  
  // Add base variables
  css += generateCSSFromVariables(variables, selector);
  
  // Add color mode queries if requested
  if (includeColorModes) {
    // Light mode (use :root as fallback if no preference)
    css += `
/* Light mode variables */
@media (prefers-color-scheme: light) {
  ${selector} {
    /* Light mode variables would be specified here */
    /* In a real implementation, these would be transformed */
  }
}

/* Dark mode variables */
@media (prefers-color-scheme: dark) {
  ${selector} {
    /* Dark mode variables would be specified here */
    /* In a real implementation, these would be transformed */
  }
}
`;
  }
  
  // Add animations if requested
  if (includeAnimations && theme.tokens.animation && theme.tokens.animation.preset) {
    css += generateAnimationKeyframesOnServer();
  }
  
  // Add utility classes if requested
  if (includeUtilityClasses) {
    css += generateUtilityClassesOnServer(theme);
  }
  
  // Minify if requested
  if (minify) {
    css = minifyCSS(css);
  }
  
  // Write to file if output path is specified
  if (options.outputPath) {
    try {
      fs.writeFileSync(options.outputPath, css, 'utf8');
      console.log(`Theme CSS written to: ${options.outputPath}`);
    } catch (error) {
      console.error('Error writing CSS file:', error);
    }
  }
  
  return css;
}

/**
 * Generate animation keyframes for the server
 */
function generateAnimationKeyframesOnServer(): string {
  let css = '\n/* Animation Keyframes */\n';
  
  // Define standard keyframes for common animations
  css += `@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes scale-out {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0.95); opacity: 0; }
}

@keyframes slide-in-from-top {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slide-in-from-right {
  from { transform: translateX(10px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slide-in-from-bottom {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slide-in-from-left {
  from { transform: translateX(-10px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
`;

  return css;
}

/**
 * Generate utility classes that use theme variables for the server
 */
function generateUtilityClassesOnServer(theme: Theme): string {
  let css = '\n/* Theme Utility Classes */\n';
  
  // Text colors
  css += `.text-primary { color: var(--colors-primary-DEFAULT); }
.text-secondary { color: var(--colors-secondary-DEFAULT); }
.text-accent { color: var(--colors-accent-DEFAULT); }
.text-default { color: var(--colors-text-DEFAULT); }
.text-muted { color: var(--colors-text-secondary); }

/* Background colors */
.bg-primary { background-color: var(--colors-primary-DEFAULT); }
.bg-secondary { background-color: var(--colors-secondary-DEFAULT); }
.bg-accent { background-color: var(--colors-accent-DEFAULT); }
.bg-default { background-color: var(--colors-background-DEFAULT); }
.bg-surface { background-color: var(--colors-background-surface); }

/* Border colors */
.border-primary { border-color: var(--colors-primary-DEFAULT); }
.border-secondary { border-color: var(--colors-secondary-DEFAULT); }
.border-accent { border-color: var(--colors-accent-DEFAULT); }
.border-default { border-color: var(--colors-border-DEFAULT); }

/* Typography classes */
.font-heading { font-family: var(--typography-fontFamily-heading); }
.font-body { font-family: var(--typography-fontFamily-body); }
.font-mono { font-family: var(--typography-fontFamily-mono); }

/* Animation classes */
.animate-fade-in { animation: fade-in 0.3s ease-out; }
.animate-scale-in { animation: scale-in 0.2s ease-out; }
`;

  return css;
}

/**
 * Very simple CSS minification
 * In a real implementation, you'd use a proper CSS minifier
 */
function minifyCSS(css: string): string {
  return css
    .replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, '') // Remove comments and whitespace
    .replace(/ {2,}/g, ' ') // Remove extra spaces
    .replace(/ ([{:}]) /g, '$1') // Remove spaces around brackets and colons
    .replace(/([;,]) /g, '$1'); // Remove spaces after semicolons and commas
}

/**
 * Generate CSS files for all themes in a directory
 * 
 * @param themes Array of themes to generate CSS for
 * @param outputDir Directory to write CSS files to
 * @param options Options for CSS generation
 */
export function generateThemeStylesheets(
  themes: Theme[],
  outputDir: string,
  options: ServerCSSOptions = {}
): void {
  // Create the output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate CSS for each theme
  for (const theme of themes) {
    const cssFilename = `${theme.metadata.id}.css`;
    const cssPath = path.join(outputDir, cssFilename);
    
    generateThemeCSSOnServer(theme, {
      ...options,
      outputPath: cssPath,
    });
  }
  
  // Generate an index file that documents all available themes
  generateThemeIndex(themes, outputDir);
}

/**
 * Generate an index HTML file that documents all available themes
 */
function generateThemeIndex(themes: Theme[], outputDir: string): void {
  const indexPath = path.join(outputDir, 'index.html');
  
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Theme Library</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    .theme-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    .theme-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .theme-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    .theme-preview {
      height: 200px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 1rem;
    }
    .theme-info {
      padding: 1.5rem;
      border-top: 1px solid #eee;
      background: #f9f9f9;
    }
    .theme-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
    }
    .theme-description {
      margin: 0 0 1rem 0;
      font-size: 0.875rem;
      color: #666;
    }
    .theme-link {
      display: inline-block;
      text-decoration: none;
      padding: 0.5rem 1rem;
      background: #0070f3;
      color: white;
      border-radius: 4px;
      font-size: 0.875rem;
    }
    .theme-tag {
      display: inline-block;
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      background: #eee;
      border-radius: 4px;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
    }
  </style>
</head>
<body>
  <h1>Theme Library</h1>
  <p>A collection of available themes for the application.</p>
  
  <div class="theme-grid">
`;
  
  // Add a card for each theme
  for (const theme of themes) {
    const { id, name, description, tags } = theme.metadata;
    const cssFilename = `${id}.css`;
    
    html += `    <div class="theme-card">
      <link rel="stylesheet" href="${cssFilename}" id="theme-preview-${id}">
      <div class="theme-preview" data-theme-id="${id}">
        <button class="theme-link">Primary Button</button>
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
          <div class="theme-tag">Tag 1</div>
          <div class="theme-tag">Tag 2</div>
        </div>
      </div>
      <div class="theme-info">
        <h2 class="theme-title">${name}</h2>
        <p class="theme-description">${description}</p>
        <div style="margin-bottom: 1rem;">
          ${tags.map(tag => `<span class="theme-tag">${tag}</span>`).join('')}
        </div>
        <a href="${cssFilename}" class="theme-link" download>Download CSS</a>
      </div>
    </div>
`;
  }
  
  html += `  </div>
  
  <script>
    // Add isolating style to theme previews
    document.querySelectorAll('.theme-preview').forEach(preview => {
      const themeId = preview.getAttribute('data-theme-id');
      preview.style.cssText = \`
        --primary-color: var(--colors-primary-DEFAULT);
        --bg-color: var(--colors-background-DEFAULT);
        --text-color: var(--colors-text-DEFAULT);
        background-color: var(--bg-color);
        color: var(--text-color);
      \`;
    });
  </script>
</body>
</html>`;
  
  // Write the index file
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log(`Theme index written to: ${indexPath}`);
}

/**
 * Generate a theme stylesheet and return its contents
 * 
 * @param theme The theme to generate CSS for
 * @returns The generated CSS
 */
export function getThemeStylesheet(theme: Theme): string {
  return generateThemeCSSOnServer(theme);
}

/**
 * API handler to serve theme CSS
 * This can be used in an API route to dynamically serve theme CSS
 * 
 * @param themeId ID of the theme to serve
 * @param getThemeById Function to retrieve a theme by ID
 * @returns CSS string or null if theme not found
 */
export function getThemeCSS(
  themeId: string,
  getThemeById: (id: string) => Theme | undefined
): string | null {
  const theme = getThemeById(themeId);
  
  if (!theme) {
    return null;
  }
  
  return generateThemeCSSOnServer(theme, {
    minify: true,
    addTimestamp: false,
  });
}