import express, { Router, Request, Response } from 'express';
import { db } from '../db';
import { users, themes } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { storage } from '../storage';
import { convertLegacyThemeToTheme, convertThemeToLegacyTheme } from '../utils/themeUtils';
import { defaultTheme } from '@shared/config';

// Create a router instance
const router = Router();

/**
 * GET /api/business/theme
 * Get the current theme for the authenticated business
 */
router.get('/theme', async (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Get the business ID from the session
    const businessId = req.session.user.id;

    // First try to get an active theme from the themes table
    let themeResult;
    try {
      themeResult = await db.select().from(themes)
        .where(eq(themes.businessId, businessId))
        .where(eq(themes.isActive, true))
        .orderBy(desc(themes.updatedAt))
        .limit(1);
    } catch (error) {
      console.error('Error fetching theme from database:', error);
      // If themes table doesn't exist yet or other DB error, fall back to the user's theme setting
    }

    if (themeResult && themeResult.length > 0) {
      // Return the active theme from the themes table
      res.json({ theme: themeResult[0] });
    } else {
      // Get the user's theme settings from the users table
      const user = await storage.getUser(businessId);
      if (!user) {
        return res.status(404).json({ message: 'Business not found' });
      }

      // Return the user's theme settings from the legacy format if available,
      // otherwise return the new theme format, or default theme as fallback
      if (user.themeSettings) {
        // Convert legacy theme settings to new theme format
        const theme = convertLegacyThemeToTheme(user.themeSettings);
        res.json({ theme });
      } else if (user.theme) {
        res.json({ theme: user.theme });
      } else {
        res.json({ theme: defaultTheme });
      }
    }
  } catch (error) {
    console.error('Error getting theme:', error);
    res.status(500).json({ message: 'Failed to get theme' });
  }
});

/**
 * POST /api/business/theme
 * Update the theme for the authenticated business
 */
router.post('/theme', async (req: Request, res: Response) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Get the business ID from the session
    const businessId = req.session.user.id;
    const theme = req.body.theme;

    if (!theme) {
      return res.status(400).json({ message: 'Theme data is required' });
    }

    // Update both new theme format and legacy theme settings for backward compatibility
    const legacyThemeSettings = convertThemeToLegacyTheme(theme);

    try {
      // Update or insert theme into themes table
      const existingTheme = await db.select().from(themes)
        .where(eq(themes.businessId, businessId))
        .where(eq(themes.isActive, true))
        .limit(1);

      if (existingTheme && existingTheme.length > 0) {
        // Update existing theme
        await db.update(themes)
          .set({
            ...theme,
            updatedAt: new Date()
          })
          .where(eq(themes.id, existingTheme[0].id));
      } else {
        // Insert new theme
        await db.insert(themes).values({
          businessId,
          businessSlug: req.session.user.businessSlug || '',
          ...theme,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } catch (dbError) {
      console.error('Error updating themes table:', dbError);
      // Continue to update legacy theme settings even if themes table update fails
    }

    // Always update the legacy theme settings in the users table for backward compatibility
    await db.update(users)
      .set({
        themeSettings: legacyThemeSettings,
        theme: theme
      })
      .where(eq(users.id, businessId));

    // Return the updated theme
    res.json({ 
      theme,
      message: 'Theme updated successfully' 
    });
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ message: 'Failed to update theme' });
  }
});

/**
 * GET /api/business/theme-presets
 * Get a list of theme presets for different industries
 */
router.get('/theme-presets', (_req: Request, res: Response) => {
  try {
    // Import theme presets from the shared module
    const { themePresets, industryPresets } = require('../../shared/themePresets');
    
    // Return theme presets
    res.json({ 
      themePresets,
      industryPresets
    });
  } catch (error) {
    console.error('Error loading theme presets:', error);
    res.status(500).json({ 
      error: 'Failed to load theme presets',
      message: 'An error occurred while loading theme presets.' 
    });
  }
});

export default router;