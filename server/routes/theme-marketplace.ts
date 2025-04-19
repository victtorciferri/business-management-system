/**
 * Theme Marketplace API Routes - 2025 Edition
 *
 * Endpoints for theme marketplace functionality, including
 * listing, previewing, and applying themes.
 */

import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertThemeSchema } from '@shared/schema';
import { marketplaceThemes, getThemeById } from '@shared/marketplaceThemes';

const router = Router();

// Get all marketplace themes
router.get('/marketplace', async (req: Request, res: Response) => {
  try {
    res.json(marketplaceThemes);
  } catch (error) {
    console.error('Error fetching marketplace themes:', error);
    res.status(500).json({ message: 'Error fetching marketplace themes' });
  }
});

// Get a specific marketplace theme by ID
router.get('/marketplace/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const theme = getThemeById(id);
    
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    res.json(theme);
  } catch (error) {
    console.error('Error fetching marketplace theme:', error);
    res.status(500).json({ message: 'Error fetching marketplace theme' });
  }
});

// Apply a marketplace theme to a business
router.post('/marketplace/apply', async (req: Request, res: Response) => {
  try {
    // Validate the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get the business ID from the user
    const businessId = req.user.id;
    
    // Validate the theme data with Zod
    const themeDataSchema = insertThemeSchema
      .omit({ id: true, createdAt: true, updatedAt: true })
      .extend({
        themeId: z.string(),
      });
    
    const validationResult = themeDataSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid theme data', 
        errors: validationResult.error.errors 
      });
    }
    
    const themeData = validationResult.data;
    
    // Check if the referenced marketplace theme exists
    const marketplaceTheme = getThemeById(themeData.themeId);
    
    if (!marketplaceTheme) {
      return res.status(404).json({ message: 'Marketplace theme not found' });
    }
    
    // Deactivate the current active theme
    const activeTheme = await storage.getActiveTheme(businessId);
    
    if (activeTheme && activeTheme.isActive) {
      await storage.updateTheme(activeTheme.id, { isActive: false });
    }
    
    // Create a new theme based on the marketplace theme
    const newTheme = {
      name: themeData.name,
      primaryColor: themeData.primaryColor,
      secondaryColor: themeData.secondaryColor,
      accentColor: themeData.accentColor || marketplaceTheme.accentColor,
      fontFamily: themeData.fontFamily || marketplaceTheme.fontPrimary,
      headingFontFamily: themeData.headingFontFamily || marketplaceTheme.fontHeading,
      borderRadius: themeData.borderRadius || marketplaceTheme.borderRadius,
      businessId,
      isActive: true,
      isDefault: false,
      settings: {},
    };
    
    // Create the new theme
    const createdTheme = await storage.createTheme(newTheme);
    
    res.status(201).json(createdTheme);
  } catch (error) {
    console.error('Error applying marketplace theme:', error);
    res.status(500).json({ message: 'Error applying marketplace theme' });
  }
});

export default router;