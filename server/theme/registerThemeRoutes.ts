/**
 * Register Theme Routes - 2025 Edition
 * 
 * Utility to register theme-related API routes with Express.
 */

import { Express } from 'express';
import themeRoutes from '../routes/themeRoutes';
import { defaultThemes, getThemeById } from '../../shared/defaultThemes';
import { getThemeCSS } from './cssVariableServer';

/**
 * Register theme routes with an Express application
 * 
 * @param app Express application instance
 */
export function registerThemeRoutes(app: Express): void {
  // Mount the theme API routes
  app.use('/api/themes', themeRoutes);
  
  // Add fallback route for legacy theme endpoints
  app.get('/api/theme/:themeId', (req, res) => {
    const { themeId } = req.params;
    const theme = getThemeById(themeId);
    
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    res.json(theme);
  });
  
  // Add route for retrieving all available themes
  app.get('/api/themes', (_req, res) => {
    const themes = Object.values(defaultThemes).map(theme => ({
      id: theme.metadata.id,
      name: theme.metadata.name,
      description: theme.metadata.description,
      author: theme.metadata.author,
      version: theme.metadata.version,
      thumbnail: theme.metadata.thumbnail,
      tags: theme.metadata.tags,
      industry: theme.metadata.industry,
      featured: theme.metadata.featured,
    }));
    
    res.json(themes);
  });
  
  // Add route for serving theme CSS directly
  app.get('/theme/:themeId.css', (req, res) => {
    const { themeId } = req.params;
    const theme = getThemeById(themeId);
    
    if (!theme) {
      return res.status(404).send('/* Theme not found */');
    }
    
    const css = getThemeCSS(themeId, getThemeById);
    
    if (!css) {
      return res.status(500).send('/* Error generating theme CSS */');
    }
    
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(css);
  });
  
  console.log('✅ Theme routes registered');
}