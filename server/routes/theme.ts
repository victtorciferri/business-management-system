/**
 * Theme Routes - 2025 Edition
 * 
 * API routes for theme management and customization.
 */

import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { db } from '../db';
import { themes } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { DesignTokens } from '../../shared/designTokens';

const router = Router();

// Validation schemas for theme operations
const createThemeSchema = z.object({
  name: z.string().min(1, "Theme name is required"),
  description: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Primary color must be a valid hex color"),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Secondary color must be a valid hex color").optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Accent color must be a valid hex color").optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Text color must be a valid hex color").optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Background color must be a valid hex color").optional(),
  fontFamily: z.string().optional(),
  borderRadius: z.number().optional(),
  spacing: z.number().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  tokens: z.record(z.any()).optional(),
});

const updateThemeSchema = createThemeSchema.partial();

/**
 * GET /api/themes
 * Get all themes for the authenticated business
 */
router.get('/themes', async (req: Request, res: Response) => {
  try {
    // Check if we have a business context from the business extractor middleware
    if (!req.business) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const businessId = req.business.id;
    
    // Get all themes for this business
    const allThemes = await storage.getThemesByBusinessId(businessId);
    
    return res.status(200).json({ themes: allThemes });
  } catch (error) {
    console.error('Error fetching themes:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch themes',
      error: String(error)
    });
  }
});

/**
 * GET /api/themes/active
 * Get the active theme for the authenticated business
 */
router.get('/themes/active', async (req: Request, res: Response) => {
  try {
    // Check if we have a business context from the business extractor middleware
    if (!req.business) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const businessId = req.business.id;
    
    // Get the active theme for this business
    const activeTheme = await storage.getActiveTheme(businessId);
    
    if (!activeTheme) {
      // If no active theme, try to get the default theme
      const defaultTheme = await storage.getDefaultTheme(businessId);
      
      if (!defaultTheme) {
        return res.status(404).json({ message: 'No active theme found' });
      }
      
      return res.status(200).json({ theme: defaultTheme });
    }
    
    return res.status(200).json({ theme: activeTheme });
  } catch (error) {
    console.error('Error fetching active theme:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch active theme',
      error: String(error)
    });
  }
});

/**
 * GET /api/themes/:id
 * Get a specific theme by ID
 */
router.get('/themes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if we have a business context from the business extractor middleware
    if (!req.business) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Parse the ID as an integer
    const themeId = parseInt(id, 10);
    if (isNaN(themeId)) {
      return res.status(400).json({ message: 'Invalid theme ID' });
    }
    
    // Get the theme
    const theme = await storage.getThemeById(themeId);
    
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    // Make sure the theme belongs to this business
    if (theme.businessId !== req.business.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    return res.status(200).json({ theme });
  } catch (error) {
    console.error('Error fetching theme:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch theme',
      error: String(error)
    });
  }
});

/**
 * POST /api/themes
 * Create a new theme for the authenticated business
 */
router.post('/themes', async (req: Request, res: Response) => {
  try {
    // Check if we have a business context from the business extractor middleware
    if (!req.business) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const businessId = req.business.id;
    const businessSlug = req.business.businessSlug;
    
    if (!businessSlug) {
      return res.status(400).json({ message: 'Business slug is required' });
    }

    // Validate the request body
    const validationResult = createThemeSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid theme data',
        errors: validationResult.error.errors
      });
    }
    
    const themeData = validationResult.data;
    
    // If isActive is true, update all other themes to be inactive
    if (themeData.isActive) {
      const businessThemes = await db.select().from(themes).where(eq(themes.businessId, businessId));
      
      for (const theme of businessThemes) {
        await db.update(themes)
          .set({ isActive: false })
          .where(eq(themes.id, theme.id));
      }
    }
    
    // If isDefault is true, update all other themes to not be default
    if (themeData.isDefault) {
      const businessThemes = await db.select().from(themes).where(eq(themes.businessId, businessId));
      
      for (const theme of businessThemes) {
        await db.update(themes)
          .set({ isDefault: false })
          .where(eq(themes.id, theme.id));
      }
    }
    
    // Create the new theme
    const newTheme = await storage.createTheme({
      businessId,
      businessSlug,
      name: themeData.name,
      description: themeData.description || '',
      primaryColor: themeData.primaryColor,
      secondaryColor: themeData.secondaryColor || '#06b6d4',
      accentColor: themeData.accentColor || '#f59e0b',
      textColor: themeData.textColor || '#111827',
      backgroundColor: themeData.backgroundColor || '#ffffff',
      fontFamily: themeData.fontFamily || 'Inter, sans-serif',
      borderRadius: themeData.borderRadius || 8,
      spacing: themeData.spacing || 16,
      isDefault: themeData.isDefault || false,
      isActive: themeData.isActive || false,
      category: themeData.category || 'custom',
      tags: themeData.tags || ['custom'],
      tokens: themeData.tokens || {} as DesignTokens,
    });
    
    return res.status(201).json({ 
      message: 'Theme created successfully',
      theme: newTheme
    });
  } catch (error) {
    console.error('Error creating theme:', error);
    return res.status(500).json({ 
      message: 'Failed to create theme',
      error: String(error)
    });
  }
});

/**
 * PUT /api/themes/:id
 * Update an existing theme
 */
router.put('/themes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if we have a business context from the business extractor middleware
    if (!req.business) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Parse the ID as an integer
    const themeId = parseInt(id, 10);
    if (isNaN(themeId)) {
      return res.status(400).json({ message: 'Invalid theme ID' });
    }
    
    // Get the theme to update
    const existingTheme = await storage.getThemeById(themeId);
    
    if (!existingTheme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    // Make sure the theme belongs to this business
    if (existingTheme.businessId !== req.business.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Validate the request body
    const validationResult = updateThemeSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid theme data',
        errors: validationResult.error.errors
      });
    }
    
    const themeData = validationResult.data;
    
    // If isActive is being set to true, update all other themes to be inactive
    if (themeData.isActive) {
      const businessThemes = await db.select().from(themes).where(eq(themes.businessId, req.business.id));
      
      for (const theme of businessThemes) {
        if (theme.id !== themeId) {
          await db.update(themes)
            .set({ isActive: false })
            .where(eq(themes.id, theme.id));
        }
      }
    }
    
    // If isDefault is being set to true, update all other themes to not be default
    if (themeData.isDefault) {
      const businessThemes = await db.select().from(themes).where(eq(themes.businessId, req.business.id));
      
      for (const theme of businessThemes) {
        if (theme.id !== themeId) {
          await db.update(themes)
            .set({ isDefault: false })
            .where(eq(themes.id, theme.id));
        }
      }
    }
    
    // Update the theme
    const updatedTheme = await storage.updateTheme(themeId, themeData);
    
    return res.status(200).json({ 
      message: 'Theme updated successfully',
      theme: updatedTheme
    });
  } catch (error) {
    console.error('Error updating theme:', error);
    return res.status(500).json({ 
      message: 'Failed to update theme',
      error: String(error)
    });
  }
});

/**
 * DELETE /api/themes/:id
 * Delete a theme
 */
router.delete('/themes/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if we have a business context from the business extractor middleware
    if (!req.business) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Parse the ID as an integer
    const themeId = parseInt(id, 10);
    if (isNaN(themeId)) {
      return res.status(400).json({ message: 'Invalid theme ID' });
    }
    
    // Get the theme to delete
    const existingTheme = await storage.getThemeById(themeId);
    
    if (!existingTheme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    // Make sure the theme belongs to this business
    if (existingTheme.businessId !== req.business.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check if this is the only theme or if it's the default theme
    const businessThemes = await db.select().from(themes).where(eq(themes.businessId, req.business.id));
    
    if (businessThemes.length === 1) {
      return res.status(400).json({ message: 'Cannot delete the only theme for a business' });
    }
    
    if (existingTheme.isDefault) {
      return res.status(400).json({ message: 'Cannot delete the default theme' });
    }
    
    // Delete the theme
    const deleted = await storage.deleteTheme(themeId);
    
    if (deleted) {
      return res.status(200).json({ message: 'Theme deleted successfully' });
    } else {
      return res.status(500).json({ message: 'Failed to delete theme' });
    }
  } catch (error) {
    console.error('Error deleting theme:', error);
    return res.status(500).json({ 
      message: 'Failed to delete theme',
      error: String(error)
    });
  }
});

/**
 * POST /api/themes/:id/activate
 * Activate a theme (set it as the active theme)
 */
router.post('/themes/:id/activate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if we have a business context from the business extractor middleware
    if (!req.business) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Parse the ID as an integer
    const themeId = parseInt(id, 10);
    if (isNaN(themeId)) {
      return res.status(400).json({ message: 'Invalid theme ID' });
    }
    
    // Get the theme to activate
    const existingTheme = await storage.getThemeById(themeId);
    
    if (!existingTheme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    // Make sure the theme belongs to this business
    if (existingTheme.businessId !== req.business.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Activate the theme
    const activatedTheme = await storage.activateTheme(themeId);
    
    return res.status(200).json({ 
      message: 'Theme activated successfully',
      theme: activatedTheme
    });
  } catch (error) {
    console.error('Error activating theme:', error);
    return res.status(500).json({ 
      message: 'Failed to activate theme',
      error: String(error)
    });
  }
});

/**
 * GET /api/themes/business/:slug
 * Get themes for a specific business by slug (for public access)
 */
router.get('/themes/business/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    // Get themes for this business
    const businessThemes = await storage.getThemesByBusinessSlug(slug);
    
    if (businessThemes.length === 0) {
      return res.status(404).json({ message: 'No themes found for this business' });
    }
    
    return res.status(200).json({ themes: businessThemes });
  } catch (error) {
    console.error('Error fetching business themes:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch business themes',
      error: String(error)
    });
  }
});

export default router;