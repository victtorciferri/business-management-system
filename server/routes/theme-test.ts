/**
 * Theme API Test Route - 2025 Edition
 * 
 * This route is used to test the theme API functionality
 */

import { Router, Request, Response } from 'express';
import { db } from '../db';
import { themes, users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { DesignTokens } from '../../shared/designTokens';

const router = Router();

// Default design tokens for a new theme
const defaultTokens: DesignTokens = {
  colors: {
    primary: {
      DEFAULT: '#4f46e5',
      foreground: '#ffffff',
      light: '#818cf8',
      dark: '#3730a3',
      hover: '#4338ca'
    },
    secondary: {
      DEFAULT: '#06b6d4',
      foreground: '#ffffff',
      light: '#22d3ee',
      dark: '#0e7490',
      hover: '#0891b2'
    },
    background: {
      DEFAULT: '#ffffff',
      surface: '#f9fafb',
      elevated: '#ffffff',
      sunken: '#f3f4f6'
    },
    foreground: {
      DEFAULT: '#111827',
      muted: '#6b7280',
      subtle: '#9ca3af'
    },
    border: '#e5e7eb',
    focus: '#3b82f6',
    destructive: {
      DEFAULT: '#ef4444',
      foreground: '#ffffff',
      light: '#fecaca',
    },
    success: {
      DEFAULT: '#22c55e',
      foreground: '#ffffff',
      light: '#bbf7d0',
    },
    warning: {
      DEFAULT: '#f59e0b',
      foreground: '#ffffff',
      light: '#fef3c7',
    },
    info: {
      DEFAULT: '#3b82f6',
      foreground: '#ffffff',
      light: '#dbeafe',
    }
  },
  typography: {
    fontFamily: {
      sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
      serif: "Georgia, Cambria, 'Times New Roman', Times, serif",
      mono: "Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
      body: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
      heading: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
      display: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
      '8xl': '6rem',
      '9xl': '8rem',
      DEFAULT: '1rem',
    },
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
      DEFAULT: '400',
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
      DEFAULT: '1.5',
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
      DEFAULT: '0em',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
    '4xl': '4rem',
    '5xl': '6rem',
    '6xl': '8rem',
    DEFAULT: '1rem',
  },
  borders: {
    radius: {
      none: '0',
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.5rem',
      xl: '1rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
      full: '9999px',
      DEFAULT: '0.5rem',
    },
    width: {
      DEFAULT: '1px',
      none: '0',
      thin: '1px',
      thick: '2px',
      heavy: '4px',
    },
    focus: {
      width: '2px',
      style: 'solid',
    },
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    colored: '0 4px 14px 0 rgba(79, 70, 229, 0.2)',
  },
  effects: {
    transition: {
      fast: '100ms ease-in-out',
      normal: '200ms ease-in-out',
      slow: '300ms ease-in-out',
      DEFAULT: '200ms ease-in-out',
    },
    opacity: {
      '0': '0',
      '25': '0.25',
      '50': '0.5',
      '75': '0.75',
      '100': '1',
      disabled: '0.5',
      hover: '0.8',
    },
  },
  components: {
    button: {},
    input: {},
    card: {},
    modal: {},
    toast: {},
    avatar: {},
  }
};

/**
 * Test endpoint to create a sample theme for a business
 */
router.post('/api/test-theme-setup/:businessId', async (req: Request, res: Response) => {
  const { businessId } = req.params;
  
  try {
    // Check if the business exists
    const [business] = await db.select().from(users)
      .where(eq(users.id, parseInt(businessId, 10)))
      .limit(1);
      
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    // Create a test theme
    const [newTheme] = await db.insert(themes)
      .values({
        businessId: parseInt(businessId, 10),
        businessSlug: business.businessSlug || 'default',
        name: 'Test Theme',
        description: 'A test theme for development',
        isActive: true,
        isDefault: true,
        primaryColor: '#4f46e5',
        secondaryColor: '#06b6d4',
        accentColor: '#f59e0b',
        textColor: '#111827',
        backgroundColor: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        borderRadius: 8,
        spacing: 16,
        tokens: defaultTokens,
        category: 'test',
        tags: ['test', 'development']
      })
      .returning();
      
    return res.status(201).json({
      message: 'Test theme created successfully',
      theme: newTheme
    });
  } catch (error) {
    console.error('Error creating test theme:', error);
    return res.status(500).json({ 
      message: 'Failed to create test theme',
      error: String(error)
    });
  }
});

/**
 * Get all themes for testing
 */
router.get('/api/test-themes', async (_req: Request, res: Response) => {
  try {
    const allThemes = await db.select().from(themes);
    return res.status(200).json(allThemes);
  } catch (error) {
    console.error('Error fetching test themes:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch test themes',
      error: String(error)
    });
  }
});

export default router;