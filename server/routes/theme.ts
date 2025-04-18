import { Request, Response, Router } from 'express';
import { db } from '../db';
import { users, themes, insertThemeSchema } from '../../shared/schema';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { ThemeEntity } from '../../shared/schema';
import { DesignTokens } from '../../shared/designTokens';
import { ColorPalette } from '../../shared/colorUtils';
import { TypographySettings } from '../../shared/typographyUtils';
import { SpacingSettings } from '../../shared/spacingUtils';

const router = Router();

/**
 * Combine color, typography, and spacing settings into design tokens
 */
function combineIntoDesignTokens(
  colorPalette: ColorPalette | null, 
  typographySettings: TypographySettings,
  spacingSettings: SpacingSettings
): DesignTokens {
  // Create a basic design tokens structure
  return {
    colors: {
      primary: colorPalette?.shades || {},
      secondary: {},
      accent: {},
      neutral: {},
      success: {},
      warning: {},
      danger: {},
      info: {},
      background: {},
      surface: {},
      text: {},
      border: {},
    },
    typography: {
      fontFamily: {
        heading: typographySettings.headingFont.name,
        body: typographySettings.bodyFont.name,
        mono: typographySettings.monoFont.name,
      },
      fontSize: {
        // Convert type scale values to the design token structure
        ...Object.entries(typographySettings.scale.values).reduce((acc, [key, value]) => {
          acc[key] = value.size;
          return acc;
        }, {} as Record<string, string>),
      },
      fontWeight: typographySettings.fontWeights,
      lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      // Additional typography tokens
      textStyles: typographySettings.textStyles,
    },
    spacing: {
      // Convert spacing values to design token structure
      ...Object.entries(spacingSettings.scale.values).reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>),
      // Additional spacing tokens
      layout: {
        contentWidth: spacingSettings.layout.contentWidth,
        maxWidth: spacingSettings.layout.maxWidth,
        containerPadding: spacingSettings.layout.containerPadding,
        sectionSpacing: spacingSettings.layout.sectionSpacing,
        componentSpacing: spacingSettings.layout.componentSpacing,
      },
      grid: {
        columns: spacingSettings.layout.gridSystem.columns,
        gutter: spacingSettings.layout.gridSystem.gutter,
        margins: spacingSettings.layout.gridSystem.margins,
        columnWidth: spacingSettings.layout.gridSystem.columnWidth,
        breakpoints: spacingSettings.layout.gridSystem.breakpoints,
      },
    },
    borders: {
      width: {
        none: '0',
        thin: '1px',
        thick: '2px',
        heavy: '4px',
      },
      radius: {
        none: '0',
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.5rem',
        xl: '1rem',
        full: '9999px',
      },
      style: {
        solid: 'solid',
        dashed: 'dashed',
        dotted: 'dotted',
      },
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    },
    effects: {
      opacity: {
        0: '0',
        25: '0.25',
        50: '0.5',
        75: '0.75',
        100: '1',
      },
      blur: {
        none: '0',
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
      },
      transition: {
        slow: '0.3s ease-in-out',
        medium: '0.2s ease-in-out',
        fast: '0.1s ease-in-out',
      },
    },
    components: {
      button: {
        variants: {
          primary: {},
          secondary: {},
          outline: {},
          ghost: {},
          link: {},
        },
        sizes: {
          xs: {},
          sm: {},
          md: {},
          lg: {},
          xl: {},
        },
      },
      input: {
        variants: {
          default: {},
          filled: {},
          outlined: {},
        },
        sizes: {
          sm: {},
          md: {},
          lg: {},
        },
      },
      card: {
        variants: {
          default: {},
          elevated: {},
          outlined: {},
        },
      },
      modal: {
        sizes: {
          sm: {},
          md: {},
          lg: {},
          xl: {},
          full: {},
        },
      },
      tabs: {
        variants: {
          default: {},
          outline: {},
          underline: {},
        },
      },
      tooltip: {
        sizes: {
          sm: {},
          md: {},
          lg: {},
        },
      },
    },
  };
}

/**
 * Get all themes for a business
 */
router.get('/api/themes', async (req: Request, res: Response) => {
  const { businessId, businessSlug } = req.query;
  
  if (!businessId && !businessSlug) {
    return res.status(400).json({ message: 'businessId or businessSlug is required' });
  }
  
  try {
    let themeResults;
    
    if (businessId) {
      themeResults = await db.select().from(themes)
        .where(eq(themes.businessId, Number(businessId)))
        .orderBy(desc(themes.updatedAt));
    } else {
      themeResults = await db.select().from(themes)
        .where(eq(themes.businessSlug, String(businessSlug)))
        .orderBy(desc(themes.updatedAt));
    }
    
    return res.status(200).json(themeResults);
  } catch (error) {
    console.error('Error fetching themes:', error);
    return res.status(500).json({ message: 'Failed to fetch themes' });
  }
});

/**
 * Get active theme for a business
 */
router.get('/api/themes/active', async (req: Request, res: Response) => {
  const { businessId, businessSlug } = req.query;
  
  if (!businessId && !businessSlug) {
    return res.status(400).json({ message: 'businessId or businessSlug is required' });
  }
  
  try {
    let themeResult;
    
    if (businessId) {
      const [theme] = await db.select().from(themes)
        .where(and(
          eq(themes.businessId, Number(businessId)),
          eq(themes.isActive, true)
        ))
        .limit(1);
        
      themeResult = theme;
    } else {
      const [theme] = await db.select().from(themes)
        .where(and(
          eq(themes.businessSlug, String(businessSlug)),
          eq(themes.isActive, true)
        ))
        .limit(1);
        
      themeResult = theme;
    }
    
    if (!themeResult) {
      // If no active theme found, try to get the default theme
      if (businessId) {
        const [defaultTheme] = await db.select().from(themes)
          .where(and(
            eq(themes.businessId, Number(businessId)),
            eq(themes.isDefault, true)
          ))
          .limit(1);
          
        themeResult = defaultTheme;
      } else {
        const [defaultTheme] = await db.select().from(themes)
          .where(and(
            eq(themes.businessSlug, String(businessSlug)),
            eq(themes.isDefault, true)
          ))
          .limit(1);
          
        themeResult = defaultTheme;
      }
      
      // If still no theme found, return 404
      if (!themeResult) {
        return res.status(404).json({ message: 'No active theme found' });
      }
    }
    
    return res.status(200).json(themeResult);
  } catch (error) {
    console.error('Error fetching active theme:', error);
    return res.status(500).json({ message: 'Failed to fetch active theme' });
  }
});

/**
 * Get a specific theme by ID
 */
router.get('/api/themes/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const [theme] = await db.select().from(themes)
      .where(eq(themes.id, Number(id)))
      .limit(1);
      
    if (!theme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    return res.status(200).json(theme);
  } catch (error) {
    console.error('Error fetching theme:', error);
    return res.status(500).json({ message: 'Failed to fetch theme' });
  }
});

/**
 * Create a new theme
 */
router.post('/api/themes', async (req: Request, res: Response) => {
  const {
    businessId,
    businessSlug,
    name,
    description,
    primaryColor,
    colorPalette,
    typographySettings,
    spacingSettings,
    isDefault,
    isActive
  } = req.body;
  
  if (!businessId || !businessSlug) {
    return res.status(400).json({ message: 'businessId and businessSlug are required' });
  }
  
  try {
    // Verify the business exists
    const [business] = await db.select().from(users)
      .where(eq(users.id, businessId))
      .limit(1);
      
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    // If this is the active theme, deactivate all other themes
    if (isActive) {
      await db.update(themes)
        .set({ isActive: false })
        .where(eq(themes.businessId, businessId));
    }
    
    // If this is the default theme, update the existing default theme
    if (isDefault) {
      await db.update(themes)
        .set({ isDefault: false })
        .where(and(
          eq(themes.businessId, businessId),
          eq(themes.isDefault, true)
        ));
    }
    
    // Convert the color palette, typography, and spacing settings into design tokens
    const designTokens = combineIntoDesignTokens(
      colorPalette,
      typographySettings,
      spacingSettings
    );
    
    // Create the theme
    const [newTheme] = await db.insert(themes)
      .values({
        businessId,
        businessSlug,
        name: name || 'Custom Theme',
        description: description || 'Custom theme created in Theme Editor',
        primaryColor: primaryColor || '#4f46e5',
        isActive: isActive || false,
        isDefault: isDefault || false,
        tokens: designTokens,
        category: 'custom',
        tags: ['custom', 'theme-editor']
      })
      .returning();
      
    return res.status(201).json(newTheme);
  } catch (error) {
    console.error('Error creating theme:', error);
    return res.status(500).json({ message: 'Failed to create theme' });
  }
});

/**
 * Update an existing theme
 */
router.put('/api/themes/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    description,
    primaryColor,
    colorPalette,
    typographySettings,
    spacingSettings,
    isDefault,
    isActive
  } = req.body;
  
  try {
    // Check if the theme exists and get the businessId
    const [existingTheme] = await db.select().from(themes)
      .where(eq(themes.id, Number(id)))
      .limit(1);
      
    if (!existingTheme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    // If this is being set as the active theme, deactivate all other themes
    if (isActive && !existingTheme.isActive) {
      await db.update(themes)
        .set({ isActive: false })
        .where(eq(themes.businessId, existingTheme.businessId));
    }
    
    // If this is being set as the default theme, update the existing default theme
    if (isDefault && !existingTheme.isDefault) {
      await db.update(themes)
        .set({ isDefault: false })
        .where(and(
          eq(themes.businessId, existingTheme.businessId),
          eq(themes.isDefault, true)
        ));
    }
    
    // Convert the color palette, typography, and spacing settings into design tokens
    let designTokens = existingTheme.tokens as DesignTokens;
    
    if (colorPalette || typographySettings || spacingSettings) {
      designTokens = combineIntoDesignTokens(
        colorPalette || null,
        typographySettings || designTokens.typography as any,
        spacingSettings || designTokens.spacing as any
      );
    }
    
    // Update the theme
    const [updatedTheme] = await db.update(themes)
      .set({
        name: name || existingTheme.name,
        description: description || existingTheme.description,
        primaryColor: primaryColor || existingTheme.primaryColor,
        isActive: isActive !== undefined ? isActive : existingTheme.isActive,
        isDefault: isDefault !== undefined ? isDefault : existingTheme.isDefault,
        tokens: designTokens,
        updatedAt: new Date()
      })
      .where(eq(themes.id, Number(id)))
      .returning();
      
    return res.status(200).json(updatedTheme);
  } catch (error) {
    console.error('Error updating theme:', error);
    return res.status(500).json({ message: 'Failed to update theme' });
  }
});

/**
 * Delete a theme
 */
router.delete('/api/themes/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    // Check if the theme exists
    const [existingTheme] = await db.select().from(themes)
      .where(eq(themes.id, Number(id)))
      .limit(1);
      
    if (!existingTheme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    // Cannot delete the default theme
    if (existingTheme.isDefault) {
      return res.status(400).json({ message: 'Cannot delete the default theme' });
    }
    
    // Delete the theme
    await db.delete(themes)
      .where(eq(themes.id, Number(id)));
      
    return res.status(200).json({ message: 'Theme deleted successfully' });
  } catch (error) {
    console.error('Error deleting theme:', error);
    return res.status(500).json({ message: 'Failed to delete theme' });
  }
});

/**
 * Set a theme as active
 */
router.post('/api/themes/:id/activate', async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    // Check if the theme exists and get the businessId
    const [existingTheme] = await db.select().from(themes)
      .where(eq(themes.id, Number(id)))
      .limit(1);
      
    if (!existingTheme) {
      return res.status(404).json({ message: 'Theme not found' });
    }
    
    // Deactivate all other themes for this business
    await db.update(themes)
      .set({ isActive: false })
      .where(eq(themes.businessId, existingTheme.businessId));
    
    // Activate this theme
    const [updatedTheme] = await db.update(themes)
      .set({
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(themes.id, Number(id)))
      .returning();
      
    return res.status(200).json(updatedTheme);
  } catch (error) {
    console.error('Error activating theme:', error);
    return res.status(500).json({ message: 'Failed to activate theme' });
  }
});

export default router;