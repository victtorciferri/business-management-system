import express, { Request, Response } from 'express';
import { allThemePresets } from '@shared/themePresets';
import { defaultTheme } from '@shared/config';
import { getThemeForBusiness, updateThemeForBusiness, validateTheme } from '../utils/themeUtils';

const router = express.Router();

/**
 * GET /api/default-theme
 * Returns the default theme configuration
 */
router.get('/default-theme', (req: Request, res: Response) => {
  res.json({ theme: defaultTheme });
});

/**
 * GET /api/themes/presets
 * Returns all available theme presets
 */
router.get('/themes/presets', (req: Request, res: Response) => {
  res.json({ presets: allThemePresets });
});

/**
 * GET /api/business/theme
 * Returns the theme for the current business (based on context)
 * Requires business context
 */
router.get('/business/theme', async (req: Request, res: Response) => {
  // Get business from request (set by businessExtractor middleware)
  const business = req.business;
  
  if (!business) {
    return res.status(404).json({ message: 'No business context found' });
  }
  
  try {
    const theme = await getThemeForBusiness(business.id);
    res.json({ theme });
  } catch (error) {
    console.error('Error fetching business theme:', error);
    res.status(500).json({ message: 'Failed to retrieve theme' });
  }
});

/**
 * POST /api/business/theme
 * Updates the theme for the current business
 * Requires business context and authentication
 */
router.post('/business/theme', async (req: Request, res: Response) => {
  // Ensure user is authenticated
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Get business from request (set by businessExtractor middleware)
  const business = req.business;
  
  if (!business) {
    return res.status(404).json({ message: 'No business context found' });
  }
  
  // Ensure the authenticated user owns this business
  if (req.session.user.id !== business.id) {
    return res.status(403).json({ message: 'Not authorized to modify this business theme' });
  }
  
  try {
    // Validate the theme object from the request
    const themeData = req.body;
    const validatedTheme = validateTheme(themeData);
    
    if (!validatedTheme) {
      return res.status(400).json({ message: 'Invalid theme format' });
    }
    
    // Update the theme in the database
    await updateThemeForBusiness(business.id, validatedTheme);
    
    // Return the updated theme
    const updatedTheme = await getThemeForBusiness(business.id);
    
    res.json({ 
      theme: updatedTheme,
      message: 'Theme updated successfully'
    });
  } catch (error) {
    console.error('Error updating business theme:', error);
    res.status(500).json({ message: 'Failed to update theme' });
  }
});

/**
 * GET /api/business/default-theme
 * Resets the theme to the default for the current business
 * Requires business context and authentication
 */
router.get('/business/default-theme', async (req: Request, res: Response) => {
  // Ensure user is authenticated
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Get business from request (set by businessExtractor middleware)
  const business = req.business;
  
  if (!business) {
    return res.status(404).json({ message: 'No business context found' });
  }
  
  // Ensure the authenticated user owns this business
  if (req.session.user.id !== business.id) {
    return res.status(403).json({ message: 'Not authorized to modify this business theme' });
  }
  
  try {
    // Update the theme to the default
    await updateThemeForBusiness(business.id, defaultTheme);
    
    res.json({ 
      theme: defaultTheme,
      message: 'Theme reset to default successfully'
    });
  } catch (error) {
    console.error('Error resetting business theme:', error);
    res.status(500).json({ message: 'Failed to reset theme' });
  }
});

/**
 * Admin routes for managing themes of any business
 */

/**
 * GET /api/admin/business/:id/theme
 * Get the theme for a specific business (admin only)
 */
router.get('/admin/business/:id/theme', async (req: Request, res: Response) => {
  // Ensure user is authenticated
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Ensure the user is an admin
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  const businessId = parseInt(req.params.id);
  
  if (isNaN(businessId)) {
    return res.status(400).json({ message: 'Invalid business ID' });
  }
  
  try {
    const theme = await getThemeForBusiness(businessId);
    res.json({ theme });
  } catch (error) {
    console.error('Error fetching business theme:', error);
    res.status(500).json({ message: 'Failed to retrieve theme' });
  }
});

/**
 * POST /api/admin/business/:id/theme
 * Update the theme for a specific business (admin only)
 */
router.post('/admin/business/:id/theme', async (req: Request, res: Response) => {
  // Ensure user is authenticated
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Ensure the user is an admin
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  const businessId = parseInt(req.params.id);
  
  if (isNaN(businessId)) {
    return res.status(400).json({ message: 'Invalid business ID' });
  }
  
  try {
    // Validate the theme object from the request
    const themeData = req.body;
    const validatedTheme = validateTheme(themeData);
    
    if (!validatedTheme) {
      return res.status(400).json({ message: 'Invalid theme format' });
    }
    
    // Update the theme in the database
    await updateThemeForBusiness(businessId, validatedTheme);
    
    // Return the updated theme
    const updatedTheme = await getThemeForBusiness(businessId);
    
    res.json({ 
      theme: updatedTheme,
      message: 'Theme updated successfully'
    });
  } catch (error) {
    console.error('Error updating business theme:', error);
    res.status(500).json({ message: 'Failed to update theme' });
  }
});

export default router;