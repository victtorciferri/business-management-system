/**
 * Theme Routes - 2025 Edition
 * 
 * API routes for theme management and serving dynamic theme CSS.
 */

import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { defaultThemes, getThemeById } from '../../shared/defaultThemes';
import { getThemeCSS } from '../theme/cssVariableServer';
import { Theme } from '../../shared/designTokens';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { themes } from '../../shared/schema';

const router = Router();

/**
 * Get theme CSS by theme ID
 * 
 * GET /api/themes/:themeId/css
 */
router.get('/:themeId/css', async (req: Request, res: Response) => {
  const { themeId } = req.params;
  
  try {
    // First check if it's a default theme
    let theme = getThemeById(themeId);
    
    // If not found in defaults, try to find in the database
    if (!theme) {
      const [dbTheme] = await db.select().from(themes).where(eq(themes.id, parseInt(themeId)));
      
      if (dbTheme) {
        // Convert DB theme to our Theme structure
        theme = {
          metadata: {
            id: String(dbTheme.id),
            name: dbTheme.name,
            description: dbTheme.description || 'Custom theme',
            author: 'User',
            version: '1.0.0',
            createdAt: dbTheme.createdAt.toISOString(),
            updatedAt: dbTheme.updatedAt.toISOString(),
            tags: [],
            featured: false,
          },
          tokens: dbTheme.tokens as any,
        };
      }
    }
    
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    // Generate and serve the CSS
    const css = getThemeCSS(themeId, id => {
      // This callback is the function to get a theme by ID
      // We already have the theme, so we just need to check if the ID matches
      return theme && theme.metadata.id === id ? theme : undefined;
    });
    
    if (!css) {
      return res.status(500).json({ message: 'Failed to generate theme CSS' });
    }
    
    // Set headers for caching
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(css);
  } catch (err) {
    console.error('Error serving theme CSS:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get theme CSS for a business
 * 
 * GET /api/themes/business/:businessId/css
 */
router.get('/business/:businessId/css', async (req: Request, res: Response) => {
  const { businessId } = req.params;
  
  try {
    // Find the business and its theme
    const businessIdNum = parseInt(businessId, 10);
    
    if (isNaN(businessIdNum)) {
      return res.status(400).json({ message: 'Invalid business ID' });
    }
    
    // Get the business's themes
    const [businessTheme] = await db
      .select()
      .from(themes)
      .where(eq(themes.businessId, businessIdNum))
      .orderBy(theme => ({ id: 'desc' })) // Get the most recent theme
      .limit(1);
    
    if (!businessTheme) {
      // No custom theme found, use the default business theme
      const defaultTheme = defaultThemes.modernBusiness;
      
      // Generate and serve the CSS
      const css = getThemeCSS(defaultTheme.metadata.id, id => {
        return id === defaultTheme.metadata.id ? defaultTheme : undefined;
      });
      
      if (!css) {
        return res.status(500).json({ message: 'Failed to generate theme CSS' });
      }
      
      // Set headers for caching
      res.setHeader('Content-Type', 'text/css');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      res.send(css);
      return;
    }
    
    // Convert DB theme to our Theme structure
    const theme: Theme = {
      metadata: {
        id: String(businessTheme.id),
        name: businessTheme.name,
        description: businessTheme.description || 'Business theme',
        author: 'User',
        version: '1.0.0',
        createdAt: businessTheme.createdAt.toISOString(),
        updatedAt: businessTheme.updatedAt.toISOString(),
        tags: [],
        featured: false,
      },
      tokens: businessTheme.tokens as any,
    };
    
    // Generate and serve the CSS
    const css = getThemeCSS(theme.metadata.id, id => {
      return id === theme.metadata.id ? theme : undefined;
    });
    
    if (!css) {
      return res.status(500).json({ message: 'Failed to generate theme CSS' });
    }
    
    // Set headers for caching
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(css);
  } catch (err) {
    console.error('Error serving business theme CSS:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get theme by slug
 * This is useful for customer-facing portals with vanity URLs
 * 
 * GET /api/themes/slug/:slug/css
 */
router.get('/slug/:slug/css', async (req: Request, res: Response) => {
  const { slug } = req.params;
  
  try {
    // Find the business by slug
    const business = await storage.getUserByBusinessSlug(slug);
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    // Get the business's themes
    const [businessTheme] = await db
      .select()
      .from(themes)
      .where(eq(themes.businessId, business.id))
      .orderBy(theme => ({ id: 'desc' })) // Get the most recent theme
      .limit(1);
    
    if (!businessTheme) {
      // If they don't have a custom theme, use a default based on industry
      let defaultTheme: Theme;
      
      switch (business.industryType) {
        case 'beauty':
          defaultTheme = defaultThemes.salonElegante;
          break;
        case 'creative':
          defaultTheme = defaultThemes.creativeStudio;
          break;
        case 'tech':
          defaultTheme = defaultThemes.techStartup;
          break;
        case 'food':
          defaultTheme = defaultThemes.culinary;
          break;
        case 'health':
          defaultTheme = defaultThemes.wellness;
          break;
        case 'retail':
          defaultTheme = defaultThemes.retail;
          break;
        case 'education':
          defaultTheme = defaultThemes.education;
          break;
        default:
          defaultTheme = defaultThemes.modernBusiness;
      }
      
      // Generate and serve the CSS
      const css = getThemeCSS(defaultTheme.metadata.id, id => {
        return id === defaultTheme.metadata.id ? defaultTheme : undefined;
      });
      
      if (!css) {
        return res.status(500).json({ message: 'Failed to generate theme CSS' });
      }
      
      // Set headers for caching
      res.setHeader('Content-Type', 'text/css');
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      res.send(css);
      return;
    }
    
    // Convert DB theme to our Theme structure
    const theme: Theme = {
      metadata: {
        id: String(businessTheme.id),
        name: businessTheme.name,
        description: businessTheme.description || 'Business theme',
        author: 'User',
        version: '1.0.0',
        createdAt: businessTheme.createdAt.toISOString(),
        updatedAt: businessTheme.updatedAt.toISOString(),
        tags: [],
        featured: false,
      },
      tokens: businessTheme.tokens as any,
    };
    
    // Generate and serve the CSS
    const css = getThemeCSS(theme.metadata.id, id => {
      return id === theme.metadata.id ? theme : undefined;
    });
    
    if (!css) {
      return res.status(500).json({ message: 'Failed to generate theme CSS' });
    }
    
    // Set headers for caching
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(css);
  } catch (err) {
    console.error('Error serving business theme CSS by slug:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get all default themes
 * 
 * GET /api/themes/defaults
 */
router.get('/defaults', (_req: Request, res: Response) => {
  const themes = Object.values(defaultThemes);
  
  // Remove tokens to keep the response light
  const themesMeta = themes.map(theme => {
    const { metadata } = theme;
    return {
      id: metadata.id,
      name: metadata.name,
      description: metadata.description,
      author: metadata.author,
      version: metadata.version,
      thumbnail: metadata.thumbnail,
      tags: metadata.tags,
      industry: metadata.industry,
      featured: metadata.featured,
    };
  });
  
  res.json(themesMeta);
});

/**
 * Get default theme details
 * 
 * GET /api/themes/defaults/:themeId
 */
router.get('/defaults/:themeId', (req: Request, res: Response) => {
  const { themeId } = req.params;
  
  const theme = getThemeById(themeId);
  
  if (!theme) {
    return res.status(404).json({ message: 'Theme not found' });
  }
  
  res.json(theme);
});

export default router;