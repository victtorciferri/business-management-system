import { Router } from 'express';
import { Theme, defaultTheme } from '@shared/config';
import { getThemeForBusiness, updateThemeForBusiness } from '../utils/themeUtils';

const router = Router();

/**
 * GET /api/default-theme
 * Returns the default theme for new businesses
 */
router.get('/default-theme', (req, res) => {
  res.json({
    theme: defaultTheme
  });
});

/**
 * GET /api/business/theme
 * Returns the current theme for the authenticated business
 * Requires authentication and business context
 */
router.get('/business/theme', (req, res) => {
  // Check if we have a business context
  const businessId = req.business?.id;
  if (!businessId) {
    return res.status(404).json({ message: "Business not found" });
  }
  
  // Get the theme for this business
  getThemeForBusiness(businessId)
    .then(theme => {
      res.json({
        theme
      });
    })
    .catch(error => {
      console.error("Error getting business theme:", error);
      res.status(500).json({ message: "Failed to retrieve theme" });
    });
});

/**
 * POST /api/business/theme
 * Updates the theme for the authenticated business
 * Requires authentication and business context
 */
router.post('/business/theme', (req, res) => {
  // Check if we have a business context
  const businessId = req.business?.id;
  if (!businessId) {
    return res.status(404).json({ message: "Business not found" });
  }
  
  // Validate theme data
  const themeData = req.body.theme as Partial<Theme>;
  if (!themeData) {
    return res.status(400).json({ message: "Missing theme data" });
  }
  
  // Get current theme to merge with updates
  getThemeForBusiness(businessId)
    .then(currentTheme => {
      // Merge current theme with updates
      const updatedTheme: Theme = {
        ...currentTheme,
        ...themeData
      };
      
      // Update the theme
      return updateThemeForBusiness(businessId, updatedTheme);
    })
    .then(() => {
      res.json({ 
        success: true,
        message: "Theme updated successfully" 
      });
    })
    .catch(error => {
      console.error("Error updating business theme:", error);
      res.status(500).json({ message: "Failed to update theme" });
    });
});

export default router;