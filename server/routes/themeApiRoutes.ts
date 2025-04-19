/**
 * Theme API Routes - 2025 Edition
 * 
 * This file contains API routes for managing themes.
 */

import { Router } from 'express';
import { storage } from '../storage';
import { themes } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';

const router = Router();

// Get all themes
router.get('/themes', async (req, res) => {
  try {
    const allThemes = await db.select().from(themes);
    return res.json(allThemes);
  } catch (error) {
    console.error('Error fetching themes:', error);
    return res.status(500).json({ message: 'Failed to fetch themes' });
  }
});

// Get themes for a specific business
router.get('/themes/business/:businessId', async (req, res) => {
  try {
    const businessId = parseInt(req.params.businessId, 10);
    if (isNaN(businessId)) {
      return res.status(400).json({ message: 'Invalid business ID' });
    }
    
    const businessThemes = await db.select().from(themes).where(eq(themes.businessId, businessId));
    return res.json(businessThemes);
  } catch (error) {
    console.error('Error fetching business themes:', error);
    return res.status(500).json({ message: 'Failed to fetch business themes' });
  }
});

// Get themes for a business by slug
router.get('/themes/business/slug/:businessSlug', async (req, res) => {
  try {
    const { businessSlug } = req.params;
    if (!businessSlug) {
      return res.status(400).json({ message: 'Invalid business slug' });
    }
    
    // First get the business by slug
    const business = await storage.getUserByBusinessSlug(businessSlug);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    const businessThemes = await db.select().from(themes).where(eq(themes.businessId, business.id));
    return res.json(businessThemes);
  } catch (error) {
    console.error('Error fetching business themes by slug:', error);
    return res.status(500).json({ message: 'Failed to fetch business themes' });
  }
});

// Get a specific theme by ID
router.get('/themes/:themeId', async (req, res) => {
  try {
    const themeId = parseInt(req.params.themeId, 10);
    if (isNaN(themeId)) {
      return res.status(400).json({ message: 'Invalid theme ID' });
    }
    
    const [theme] = await db.select().from(themes).where(eq(themes.id, themeId));
    
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    return res.json(theme);
  } catch (error) {
    console.error('Error fetching theme:', error);
    return res.status(500).json({ message: 'Failed to fetch theme' });
  }
});

// Get the active theme
router.get('/themes/active', async (req, res) => {
  try {
    // Check if we have a business context
    if (req.business) {
      const businessId = req.business.id;
      
      // Get the active theme for this business
      const activeTheme = await storage.getActiveTheme(businessId);
      
      if (!activeTheme) {
        // If no active theme, try to get the default theme
        const defaultTheme = await storage.getDefaultTheme(businessId);
        
        if (!defaultTheme) {
          // If no default theme either, return the global default
          return res.json({
            id: 0,
            name: 'Global Default',
            description: 'Default platform theme',
            businessId: 0, 
            isActive: true,
            isDefault: true,
            tokens: {
              colors: {
                primary: {
                  base: '#0070f3',
                  foreground: '#ffffff',
                },
                secondary: {
                  base: '#f5f5f5',
                  foreground: '#000000',
                },
                background: {
                  base: '#ffffff',
                  foreground: '#000000',
                },
                muted: {
                  base: '#f5f5f5',
                  foreground: '#6b7280',
                },
              },
              typography: {
                fontFamilies: {
                  base: 'system-ui, sans-serif',
                  heading: 'system-ui, sans-serif',
                  mono: 'monospace',
                },
                fontSizes: {
                  xs: '0.75rem',
                  sm: '0.875rem',
                  base: '1rem',
                  lg: '1.125rem',
                  xl: '1.25rem',
                  '2xl': '1.5rem',
                  '3xl': '1.875rem',
                  '4xl': '2.25rem',
                  '5xl': '3rem',
                },
              },
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        
        return res.json(defaultTheme);
      }
      
      return res.json(activeTheme);
    } else {
      // No business context, return the global default theme
      return res.json({
        id: 0,
        name: 'Global Default',
        description: 'Default platform theme',
        businessId: 0, 
        isActive: true,
        isDefault: true,
        tokens: {
          colors: {
            primary: {
              base: '#0070f3',
              foreground: '#ffffff',
            },
            secondary: {
              base: '#f5f5f5',
              foreground: '#000000',
            },
            background: {
              base: '#ffffff',
              foreground: '#000000',
            },
            muted: {
              base: '#f5f5f5',
              foreground: '#6b7280',
            },
          },
          typography: {
            fontFamilies: {
              base: 'system-ui, sans-serif',
              heading: 'system-ui, sans-serif',
              mono: 'monospace',
            },
            fontSizes: {
              xs: '0.75rem',
              sm: '0.875rem',
              base: '1rem',
              lg: '1.125rem',
              xl: '1.25rem',
              '2xl': '1.5rem',
              '3xl': '1.875rem',
              '4xl': '2.25rem',
              '5xl': '3rem',
            },
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error fetching active theme:', error);
    
    // Return a fallback default theme on error
    return res.json({
      id: 0,
      name: 'Global Default (Fallback)',
      description: 'Default platform theme',
      businessId: 0, 
      isActive: true,
      isDefault: true,
      tokens: {
        colors: {
          primary: {
            base: '#0070f3',
            foreground: '#ffffff',
          },
          secondary: {
            base: '#f5f5f5',
            foreground: '#000000',
          },
          background: {
            base: '#ffffff',
            foreground: '#000000',
          },
          muted: {
            base: '#f5f5f5',
            foreground: '#6b7280',
          },
        },
        typography: {
          fontFamilies: {
            base: 'system-ui, sans-serif',
            heading: 'system-ui, sans-serif',
            mono: 'monospace',
          },
          fontSizes: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
            '5xl': '3rem',
          },
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
});

// Get the active theme for a business
router.get('/themes/active/business/:businessId', async (req, res) => {
  try {
    const businessId = parseInt(req.params.businessId, 10);
    if (isNaN(businessId)) {
      return res.status(400).json({ message: 'Invalid business ID' });
    }
    
    const activeThemes = await db.select().from(themes)
      .where(and(
        eq(themes.businessId, businessId),
        eq(themes.isActive, true)
      ));
    const activeTheme = activeThemes[0];
    
    if (!activeTheme) {
      // If no active theme, try to get the default theme
      const defaultThemes = await db.select().from(themes)
        .where(and(
          eq(themes.businessId, businessId),
          eq(themes.isDefault, true)
        ));
      const defaultTheme = defaultThemes[0];
      
      if (!defaultTheme) {
        return res.status(404).json({ message: 'No active or default theme found' });
      }
      
      return res.json(defaultTheme);
    }
    
    return res.json(activeTheme);
  } catch (error) {
    console.error('Error fetching active theme:', error);
    return res.status(500).json({ message: 'Failed to fetch active theme' });
  }
});

// Get the active theme for a business by slug
router.get('/themes/active/business/slug/:businessSlug', async (req, res) => {
  try {
    const { businessSlug } = req.params;
    if (!businessSlug) {
      return res.status(400).json({ message: 'Invalid business slug' });
    }
    
    // First get the business by slug
    const business = await storage.getUserByBusinessSlug(businessSlug);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    const [activeTheme] = await db.select().from(themes)
      .where(eq(themes.businessId, business.id))
      .where(eq(themes.isActive, true));
    
    if (!activeTheme) {
      // If no active theme, try to get the default theme
      const [defaultTheme] = await db.select().from(themes)
        .where(eq(themes.businessId, business.id))
        .where(eq(themes.isDefault, true));
      
      if (!defaultTheme) {
        return res.status(404).json({ message: 'No active or default theme found' });
      }
      
      return res.json(defaultTheme);
    }
    
    return res.json(activeTheme);
  } catch (error) {
    console.error('Error fetching active theme by slug:', error);
    return res.status(500).json({ message: 'Failed to fetch active theme' });
  }
});

// Create a new theme
router.post('/themes', async (req, res) => {
  try {
    const { name, description, businessId, tokens } = req.body;
    
    if (!name || !businessId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newTheme = await db.insert(themes).values({
      name,
      description,
      businessId,
      tokens,
      isActive: false,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    return res.status(201).json(newTheme[0]);
  } catch (error) {
    console.error('Error creating theme:', error);
    return res.status(500).json({ message: 'Failed to create theme' });
  }
});

// Update a theme
router.patch('/themes/:themeId', async (req, res) => {
  try {
    const themeId = parseInt(req.params.themeId, 10);
    if (isNaN(themeId)) {
      return res.status(400).json({ message: 'Invalid theme ID' });
    }
    
    const { name, description, tokens } = req.body;
    
    const [existingTheme] = await db.select().from(themes).where(eq(themes.id, themeId));
    
    if (!existingTheme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    const [updatedTheme] = await db.update(themes)
      .set({
        name: name || existingTheme.name,
        description: description !== undefined ? description : existingTheme.description,
        tokens: tokens || existingTheme.tokens,
        updatedAt: new Date(),
      })
      .where(eq(themes.id, themeId))
      .returning();
    
    return res.json(updatedTheme);
  } catch (error) {
    console.error('Error updating theme:', error);
    return res.status(500).json({ message: 'Failed to update theme' });
  }
});

// Delete a theme
router.delete('/themes/:themeId', async (req, res) => {
  try {
    const themeId = parseInt(req.params.themeId, 10);
    if (isNaN(themeId)) {
      return res.status(400).json({ message: 'Invalid theme ID' });
    }
    
    const [existingTheme] = await db.select().from(themes).where(eq(themes.id, themeId));
    
    if (!existingTheme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    // Check if it's the active or default theme
    if (existingTheme.isActive || existingTheme.isDefault) {
      return res.status(400).json({ 
        message: 'Cannot delete the active or default theme. Set another theme as active/default first.' 
      });
    }
    
    await db.delete(themes).where(eq(themes.id, themeId));
    
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting theme:', error);
    return res.status(500).json({ message: 'Failed to delete theme' });
  }
});

// Activate a theme
router.post('/themes/:themeId/activate', async (req, res) => {
  try {
    const themeId = parseInt(req.params.themeId, 10);
    if (isNaN(themeId)) {
      return res.status(400).json({ message: 'Invalid theme ID' });
    }
    
    const [themeToActivate] = await db.select().from(themes).where(eq(themes.id, themeId));
    
    if (!themeToActivate) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    const businessId = req.query.businessId 
      ? parseInt(req.query.businessId as string, 10) 
      : themeToActivate.businessId;
    
    // First, deactivate the currently active theme for this business
    await db.update(themes)
      .set({ isActive: false })
      .where(eq(themes.businessId, businessId))
      .where(eq(themes.isActive, true));
    
    // Then, activate the requested theme
    const [activatedTheme] = await db.update(themes)
      .set({ 
        isActive: true,
        updatedAt: new Date() 
      })
      .where(eq(themes.id, themeId))
      .returning();
    
    return res.json(activatedTheme);
  } catch (error) {
    console.error('Error activating theme:', error);
    return res.status(500).json({ message: 'Failed to activate theme' });
  }
});

// Set a theme as default
router.post('/themes/:themeId/default', async (req, res) => {
  try {
    const themeId = parseInt(req.params.themeId, 10);
    if (isNaN(themeId)) {
      return res.status(400).json({ message: 'Invalid theme ID' });
    }
    
    const [themeToSetDefault] = await db.select().from(themes).where(eq(themes.id, themeId));
    
    if (!themeToSetDefault) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    // First, unset any existing default themes for this business
    await db.update(themes)
      .set({ isDefault: false })
      .where(eq(themes.businessId, themeToSetDefault.businessId))
      .where(eq(themes.isDefault, true));
    
    // Then, set this theme as default
    const [defaultTheme] = await db.update(themes)
      .set({ 
        isDefault: true,
        updatedAt: new Date() 
      })
      .where(eq(themes.id, themeId))
      .returning();
    
    return res.json(defaultTheme);
  } catch (error) {
    console.error('Error setting default theme:', error);
    return res.status(500).json({ message: 'Failed to set default theme' });
  }
});

// Get the global theme
router.get('/themes/global', (req, res) => {
  // This is a placeholder for a global theme endpoint
  // In a real implementation, this would fetch a platform-wide default theme
  res.json({
    id: 0,
    name: 'Global Default',
    description: 'Default platform theme',
    businessId: 0, 
    isActive: true,
    isDefault: true,
    tokens: {
      colors: {
        primary: {
          base: '#0070f3',
          foreground: '#ffffff',
        },
        secondary: {
          base: '#f5f5f5',
          foreground: '#000000',
        },
        background: {
          base: '#ffffff',
          foreground: '#000000',
        },
        muted: {
          base: '#f5f5f5',
          foreground: '#6b7280',
        },
      },
      typography: {
        fontFamilies: {
          base: 'system-ui, sans-serif',
          heading: 'system-ui, sans-serif',
          mono: 'monospace',
        },
        fontSizes: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem',
        },
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

export default router;