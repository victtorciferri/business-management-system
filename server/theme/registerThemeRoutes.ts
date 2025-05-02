import { storage } from '../storage';
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
  app.get('/api/themes', async (req, res) => {
    try {
      const { businessId, businessSlug } = req.query;
      let themes;

      if (businessId) {
        const parsedBusinessId = parseInt(businessId as string, 10);
        if (isNaN(parsedBusinessId)) {
          return res.status(400).json({ error: 'Invalid businessId' });
        }
        themes = await storage.getThemesByUserId(parsedBusinessId);
      } else if (businessSlug) {
        const business = await storage.getBusinessBySlug(businessSlug as string);
        if (!business) {
          return res.status(404).json({ error: 'Business not found for the given slug' });
        }
        themes = await storage.getThemesByUserId(business.id);
      } else {
        themes = await storage.getAllThemes();
      }
    
      res.json(themes);
    } catch (error) {
      console.error('Error fetching themes:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
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