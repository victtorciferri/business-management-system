import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users, themes } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { convertLegacyThemeSettings, convertToLegacyThemeSettings } from '../utils/themeUtils';

const router = Router();

// Theme validation schema
const themeSchema = z.object({
  id: z.number().optional(),
  businessId: z.number(),
  name: z.string().min(1).max(100),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  fontFamily: z.string(),
  headingFontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  lineHeight: z.string().optional(),
  borderRadius: z.string(),
  spacing: z.string(),
  variant: z.enum(['professional', 'tint', 'vibrant', 'custom']),
  appearance: z.enum(['light', 'dark', 'system']),
  customCSS: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Get theme by business ID
router.get('/:businessId/theme', async (req: Request, res: Response) => {
  try {
    const businessId = parseInt(req.params.businessId);
    
    if (isNaN(businessId)) {
      return res.status(400).json({ message: 'Invalid business ID' });
    }
    
    // Check if the business exists
    const business = await db.select().from(users).where(eq(users.id, businessId)).limit(1);
    
    if (business.length === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    // Get the theme
    const themeResult = await db.select().from(themes).where(eq(themes.businessId, businessId)).limit(1);
    
    if (themeResult.length === 0) {
      // If no theme is found, check if there are legacy theme settings
      if (business[0].theme_settings) {
        // Convert legacy theme settings to new theme format
        const convertedTheme = convertLegacyThemeSettings(business[0].theme_settings, businessId);
        return res.json(convertedTheme);
      }
      
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    return res.json(themeResult[0]);
  } catch (error) {
    console.error('Error fetching theme:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get theme by business slug
router.get('/slug/:slug/theme', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    // Find the business by slug
    const business = await db.select().from(users).where(eq(users.businessSlug, slug)).limit(1);
    
    if (business.length === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    const businessId = business[0].id;
    
    // Get the theme
    const themeResult = await db.select().from(themes).where(eq(themes.businessId, businessId)).limit(1);
    
    if (themeResult.length === 0) {
      // If no theme is found, check if there are legacy theme settings
      if (business[0].theme_settings) {
        // Convert legacy theme settings to new theme format
        const convertedTheme = convertLegacyThemeSettings(business[0].theme_settings, businessId);
        return res.json(convertedTheme);
      }
      
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    return res.json(themeResult[0]);
  } catch (error) {
    console.error('Error fetching theme by slug:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Save or update theme
router.post('/theme', async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated and has permissions
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    const userId = (req.user as any).id;
    
    // Parse and validate the theme data
    const themeData = themeSchema.parse(req.body);
    
    // Make sure the user can only modify their own theme
    if (themeData.businessId !== userId) {
      return res.status(403).json({ message: 'Not authorized to modify this theme' });
    }
    
    // Check if the theme already exists
    const existingTheme = await db.select().from(themes)
      .where(eq(themes.businessId, themeData.businessId))
      .limit(1);
    
    let savedTheme;
    
    if (existingTheme.length === 0) {
      // Create a new theme
      savedTheme = await db.insert(themes).values({
        ...themeData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
    } else {
      // Update existing theme
      savedTheme = await db.update(themes)
        .set({
          ...themeData,
          updatedAt: new Date(),
        })
        .where(eq(themes.id, existingTheme[0].id))
        .returning();
    }
    
    // Also update the legacy theme_settings field in the users table for backward compatibility
    const legacyThemeSettings = convertToLegacyThemeSettings(themeData);
    
    await db.update(users)
      .set({
        theme_settings: legacyThemeSettings,
      })
      .where(eq(users.id, themeData.businessId));
    
    return res.json(savedTheme[0]);
  } catch (error) {
    console.error('Error saving theme:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid theme data', 
        errors: error.errors 
      });
    }
    
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;