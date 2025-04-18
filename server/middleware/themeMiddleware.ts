import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { db } from '../db';
import { getThemeForBusiness, updateThemeForBusiness, convertLegacyThemeToTheme, convertThemeToLegacyTheme } from '../utils/themeUtils';
import { Theme, defaultTheme } from '@shared/config';

/**
 * Middleware to handle theme operations
 * This middleware adds theme-specific methods to the request object
 */
export const themeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Add theme operations to the request object
  (req as any).themeOperations = {
    /**
     * Get theme for a business by ID
     */
    async getTheme(businessId: number): Promise<Theme | null> {
      try {
        return await getThemeForBusiness(businessId, db, storage);
      } catch (error) {
        console.error('Error getting theme in middleware:', error);
        return null;
      }
    },
    
    /**
     * Update theme for a business by ID
     */
    async updateTheme(businessId: number, theme: Theme): Promise<boolean> {
      try {
        await updateThemeForBusiness(businessId, theme, db);
        return true;
      } catch (error) {
        console.error('Error updating theme in middleware:', error);
        return false;
      }
    }
  };
  
  next();
};

// Special endpoint handler for public theme updates
// This can be used directly in routes without authentication
export const handlePublicThemeUpdate = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const { theme } = req.body;
    
    if (!businessId || isNaN(parseInt(businessId, 10))) {
      return res.status(400).json({ message: "Invalid business ID" });
    }
    
    if (!theme || typeof theme !== 'object') {
      return res.status(400).json({ message: "Theme data is required" });
    }
    
    // Basic validation for theme properties - accept either legacy or new format
    // The new format uses primaryColor, secondaryColor, etc.
    // The old format used primary, secondary, etc.
    const hasNewFormat = theme.primaryColor !== undefined && 
                         theme.secondaryColor !== undefined && 
                         theme.backgroundColor !== undefined && 
                         theme.textColor !== undefined;
                         
    const hasOldFormat = theme.primary !== undefined && 
                         theme.secondary !== undefined && 
                         theme.background !== undefined && 
                         theme.text !== undefined;
    
    if (!hasNewFormat && !hasOldFormat) {
      return res.status(400).json({ 
        message: `Invalid theme format. Theme must include color properties.`
      });
    }
    
    // Convert between formats if needed to ensure compatibility
    let themeToSave = theme;
    
    // Convert formats using utility functions for consistency
    if (hasOldFormat && !hasNewFormat) {
      // We have old format (primary, secondary), convert to new format (primaryColor, etc)
      themeToSave = convertLegacyThemeToTheme(theme);
    } else if (hasNewFormat && !hasOldFormat) {
      // We have new format (primaryColor, etc), convert to old format (primary, etc)
      themeToSave = convertThemeToLegacyTheme(theme);
    }
    
    console.log(`Processing theme save via public API for business ${businessId}:`, themeToSave);
    
    // Check if the business exists
    const business = await storage.getUser(parseInt(businessId, 10));
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Update the theme in the database using the utility function
    await updateThemeForBusiness(parseInt(businessId, 10), themeToSave, db);
    
    // Log the action for audit purposes
    console.log(`Public API updated theme for business ID ${businessId}`);
    
    return res.json({ 
      message: "Theme updated successfully via public API",
      theme: themeToSave
    });
  } catch (error) {
    console.error('Error updating theme via public API:', error);
    return res.status(500).json({ message: "Failed to update business theme" });
  }
};