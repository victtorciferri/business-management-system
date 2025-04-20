/**
 * Theme Seed Script - 2025 Edition
 * 
 * This script seeds the database with default themes for the application.
 * It creates a set of professionally designed themes that serve as starting points.
 */

import { db } from './db';
import { themes, users } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { DesignTokens } from '@shared/designTokens';
import { createCompleteTheme } from '@shared/tokenUtils';

// Sample design tokens for a modern theme
const modernTokens: DesignTokens = {
  colors: {
    primary: {
      base: '#4f46e5',
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      950: '#1e1b4b',
      foreground: '#ffffff'
    },
    secondary: {
      base: '#06b6d4',
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      950: '#083344',
      foreground: '#ffffff'
    },
    background: {
      base: '#ffffff',
      foreground: '#111827',
      muted: '#f3f4f6',
      'muted-foreground': '#6b7280',
      subtle: '#f9fafb'
    },
    destructive: {
      base: '#ef4444',
      foreground: '#ffffff'
    },
    success: {
      base: '#22c55e',
      foreground: '#ffffff'
    },
    warning: {
      base: '#f59e0b',
      foreground: '#ffffff'
    },
    info: {
      base: '#3b82f6',
      foreground: '#ffffff'
    }
  },
  typography: {
    fontFamily: {
      base: 'Inter, system-ui, sans-serif',
      heading: 'Inter, system-ui, sans-serif',
      mono: 'Menlo, monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
      loose: '2'
    }
  },
  spacing: {
    px: '1px',
    '0': '0',
    '0.5': '0.125rem',
    '1': '0.25rem',
    '1.5': '0.375rem',
    '2': '0.5rem',
    '2.5': '0.625rem',
    '3': '0.75rem',
    '3.5': '0.875rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '8': '2rem',
    '10': '2.5rem',
    '12': '3rem',
    '16': '4rem',
    '20': '5rem',
    '24': '6rem',
    '32': '8rem'
  },
  borders: {
    width: {
      none: '0',
      thin: '1px',
      medium: '2px',
      thick: '4px'
    },
    radius: {
      none: '0',
      sm: '0.125rem',
      DEFAULT: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px'
    }
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
  },
  effects: {
    transition: {
      DEFAULT: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
      slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)'
    },
    opacity: {
      0: '0',
      5: '0.05',
      10: '0.1',
      20: '0.2',
      25: '0.25',
      30: '0.3',
      40: '0.4',
      50: '0.5',
      60: '0.6',
      70: '0.7',
      75: '0.75',
      80: '0.8',
      90: '0.9',
      95: '0.95',
      100: '1'
    }
  },
  components: {
    button: {
      borderRadius: 'var(--borders-radius)',
      fontWeight: 'var(--typography-fontWeight-medium)',
      padding: 'var(--spacing-2) var(--spacing-4)',
      transition: 'var(--effects-transition)',
      primary: {
        backgroundColor: 'var(--colors-primary-base)',
        color: 'var(--colors-primary-foreground)',
        hoverBackgroundColor: 'var(--colors-primary-700)'
      },
      secondary: {
        backgroundColor: 'var(--colors-secondary-base)',
        color: 'var(--colors-secondary-foreground)',
        hoverBackgroundColor: 'var(--colors-secondary-700)'
      }
    },
    card: {
      borderRadius: 'var(--borders-radius-lg)',
      backgroundColor: 'var(--colors-background-base)',
      padding: 'var(--spacing-6)',
      shadow: 'var(--shadows-DEFAULT)'
    }
  }
};

// Theme blueprints for different styles
const themeBlueprints = [
  {
    name: 'Modern Indigo',
    description: 'A sleek and professional theme with indigo accents',
    primaryColor: '#4f46e5',
    secondaryColor: '#06b6d4',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: 8,
    variant: 'professional',
    appearance: 'system',
    category: 'professional',
    tags: ['modern', 'professional', 'sleek'],
    tokens: modernTokens
  },
  {
    name: 'Bold Crimson',
    description: 'A bold theme with vibrant red accents',
    primaryColor: '#dc2626',
    secondaryColor: '#2563eb',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: 4,
    variant: 'vibrant',
    appearance: 'system',
    category: 'vibrant',
    tags: ['bold', 'vibrant', 'modern'],
    tokens: {
      ...modernTokens,
      colors: {
        ...modernTokens.colors,
        primary: {
          base: '#dc2626',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
          foreground: '#ffffff'
        }
      }
    }
  },
  {
    name: 'Elegant Emerald',
    description: 'An elegant theme with emerald green tones',
    primaryColor: '#047857',
    secondaryColor: '#7c3aed',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    fontFamily: 'Georgia, serif',
    borderRadius: 12,
    variant: 'elegant',
    appearance: 'system',
    category: 'elegant',
    tags: ['elegant', 'luxury', 'sophisticated'],
    tokens: {
      ...modernTokens,
      colors: {
        ...modernTokens.colors,
        primary: {
          base: '#047857',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
          foreground: '#ffffff'
        }
      },
      typography: {
        ...modernTokens.typography,
        fontFamily: {
          base: 'Georgia, serif',
          heading: 'Georgia, serif',
          mono: 'Menlo, monospace'
        }
      }
    }
  },
  {
    name: 'Minimal Slate',
    description: 'A minimalist theme with slate gray accents',
    primaryColor: '#475569',
    secondaryColor: '#94a3b8',
    accentColor: '#f59e0b',
    backgroundColor: '#f8fafc',
    textColor: '#1e293b',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: 2,
    variant: 'minimal',
    appearance: 'system',
    category: 'minimal',
    tags: ['minimal', 'clean', 'modern'],
    tokens: {
      ...modernTokens,
      colors: {
        ...modernTokens.colors,
        primary: {
          base: '#475569',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
          foreground: '#ffffff'
        },
        background: {
          base: '#f8fafc',
          foreground: '#1e293b',
          muted: '#e2e8f0',
          'muted-foreground': '#64748b',
          subtle: '#f1f5f9'
        }
      }
    }
  },
  {
    name: 'Vibrant Fuchsia',
    description: 'A vibrant and energetic theme with fuchsia accents',
    primaryColor: '#d946ef',
    secondaryColor: '#8b5cf6',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: 16,
    variant: 'vibrant',
    appearance: 'system',
    category: 'vibrant',
    tags: ['vibrant', 'energetic', 'modern'],
    tokens: {
      ...modernTokens,
      colors: {
        ...modernTokens.colors,
        primary: {
          base: '#d946ef',
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
          foreground: '#ffffff'
        }
      }
    }
  }
];

/**
 * Seed the database with default themes
 */
export async function seedThemes() {
  try {
    console.log('Seeding themes...');
    
    // Get all businesses (users with role 'business')
    const businesses = await db.select().from(users).where(eq(users.role, 'business'));
    
    if (businesses.length === 0) {
      console.log('No businesses found, seeding system-wide default themes only');
      
      // Create system-wide default themes
      for (const blueprint of themeBlueprints) {
        // Check if theme already exists by name (using and)
        const existingTheme = await db.select().from(themes)
          .where(sql`${themes.name} = ${blueprint.name} AND ${themes.businessId} = 0`)
          
        if (existingTheme.length === 0) {
          // Create a theme for each blueprint
          await db.insert(themes).values({
            ...blueprint,
            businessId: 0, // 0 means system-wide theme
            businessSlug: 'system',
            isActive: blueprint.name === 'Modern Indigo', // Make the first one active
            isDefault: blueprint.name === 'Modern Indigo', // Make the first one default
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          
          console.log(`Created system theme: ${blueprint.name}`);
        } else {
          console.log(`System theme already exists: ${blueprint.name}`);
        }
      }
    } else {
      console.log(`Found ${businesses.length} businesses, seeding business-specific themes`);
      
      // For each business, create a set of themes
      for (const business of businesses) {
        // Create a theme for each blueprint
        for (const blueprint of themeBlueprints) {
          // Check if theme already exists for this business
          const existingTheme = await db.select().from(themes)
            .where(sql`${themes.name} = ${blueprint.name} AND ${themes.businessId} = ${business.id}`);
            
          if (existingTheme.length === 0) {
            // Create a theme for each blueprint
            await db.insert(themes).values({
              ...blueprint,
              businessId: business.id,
              businessSlug: business.businessSlug || 'default',
              isActive: blueprint.name === 'Modern Indigo', // Make the first one active
              isDefault: blueprint.name === 'Modern Indigo', // Make the first one default
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            
            console.log(`Created theme for business ${business.businessName}: ${blueprint.name}`);
          } else {
            console.log(`Theme already exists for business ${business.businessName}: ${blueprint.name}`);
          }
        }
      }
    }
    
    console.log('Themes seeded successfully');
  } catch (error) {
    console.error('Error seeding themes:', error);
  }
}

// Direct execution is only used when running this file directly
// For ES modules we'll rely on the imported function being called in seed.ts
// ESM doesn't have require.main === module equivalent