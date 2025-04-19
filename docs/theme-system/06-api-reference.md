# Theme System API Reference

## Overview

This document provides a detailed reference for the theme system's API endpoints, frontend utility functions, and hooks. It serves as a technical reference for developers working with the theme system.

## Backend API Endpoints

### Themes API

#### `GET /api/themes/active`

Returns the currently active theme for the business.

**Request Parameters:**
- None (determines business from context)

**Response:**
```json
{
  "id": 123,
  "businessId": 456,
  "businessSlug": "example-business",
  "name": "Modern Blue",
  "description": "A professional blue theme",
  "isActive": true,
  "isDefault": false,
  "tokens": {
    "colors": { ... },
    "typography": { ... },
    "spacing": { ... },
    "borders": { ... },
    "shadows": { ... },
    "effects": { ... },
    "components": { ... }
  },
  "baseThemeId": "professional-blue",
  "category": "professional",
  "tags": ["blue", "professional", "modern"],
  "preview": "https://example.com/theme-preview.jpg",
  "thumbnail": "https://example.com/theme-thumbnail.jpg",
  "popularity": 42,
  "logoImageUrl": "https://example.com/logo.png",
  "createdAt": "2025-01-15T12:00:00Z",
  "updatedAt": "2025-04-01T14:30:00Z"
}
```

#### `GET /api/themes/:id`

Retrieves a specific theme by ID.

**Request Parameters:**
- `id` - Theme ID (path parameter)

**Response:**
Same structure as `/api/themes/active`

#### `GET /api/themes`

Lists all themes for the current business.

**Request Parameters:**
- `businessId` - Business ID (query parameter, optional if in business context)

**Response:**
```json
{
  "themes": [
    {
      "id": 123,
      "businessId": 456,
      "businessSlug": "example-business",
      "name": "Modern Blue",
      "isActive": true,
      "isDefault": false,
      "tokens": { ... },
      "createdAt": "2025-01-15T12:00:00Z",
      "updatedAt": "2025-04-01T14:30:00Z"
    },
    {
      // Additional themes...
    }
  ]
}
```

#### `POST /api/themes`

Creates a new theme.

**Request Body:**
```json
{
  "businessId": 456,
  "businessSlug": "example-business",
  "name": "New Theme",
  "description": "A new custom theme",
  "isActive": true,
  "isDefault": false,
  "tokens": {
    "colors": { ... },
    "typography": { ... },
    "spacing": { ... },
    "borders": { ... },
    "shadows": { ... },
    "effects": { ... },
    "components": { ... }
  },
  "baseThemeId": "professional-blue",
  "category": "custom",
  "tags": ["custom", "blue"]
}
```

**Response:**
The created theme object.

#### `PUT /api/themes/:id`

Updates an existing theme.

**Request Parameters:**
- `id` - Theme ID (path parameter)

**Request Body:**
Partial theme object with fields to update:
```json
{
  "name": "Renamed Theme",
  "tokens": {
    "colors": {
      "primary": {
        "DEFAULT": "#3b82f6"
      }
    }
  }
}
```

**Response:**
The updated theme object.

#### `DELETE /api/themes/:id`

Deletes a theme.

**Request Parameters:**
- `id` - Theme ID (path parameter)

**Response:**
```json
{
  "success": true
}
```

#### `PUT /api/themes/:id/activate`

Activates a theme (and deactivates all others for the business).

**Request Parameters:**
- `id` - Theme ID (path parameter)

**Response:**
The activated theme object.

### Theme Marketplace API

#### `GET /api/marketplace/themes`

Lists available marketplace themes.

**Request Parameters:**
- `category` - Filter by category (query parameter, optional)
- `query` - Search term (query parameter, optional)
- `sort` - Sort order (query parameter, optional) - Options: "popularity", "newest", "name"

**Response:**
```json
{
  "themes": [
    {
      "id": "professional-blue",
      "name": "Professional Blue",
      "description": "A professional blue theme for service businesses",
      "category": "professional",
      "tags": ["blue", "professional", "business"],
      "previewImageUrl": "https://example.com/preview.jpg",
      "thumbnailImageUrl": "https://example.com/thumbnail.jpg",
      "popularity": 100,
      "isNew": false,
      "isAccessible": true,
      "industry": "professional services",
      "seasonal": false,
      "version": "1.0.0",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    },
    {
      // Additional themes...
    }
  ]
}
```

#### `GET /api/marketplace/themes/:id`

Retrieves a specific marketplace theme.

**Request Parameters:**
- `id` - Marketplace theme ID (path parameter)

**Response:**
Single marketplace theme object with full theme tokens data.

#### `POST /api/themes/apply-marketplace`

Applies a marketplace theme to the business.

**Request Body:**
```json
{
  "marketplaceThemeId": "professional-blue",
  "businessId": 456
}
```

**Response:**
The newly created theme object based on the marketplace theme.

## Frontend Utility Functions

### Theme API Client

```typescript
// themeApi.ts
import { DesignTokens, ThemeSettings } from '@shared/designTokens';
import { ThemeEntity, InsertThemeEntity } from '@shared/schema';

export const themeApi = {
  /**
   * Get the active theme for a business
   */
  getActiveTheme: async (businessId: number): Promise<ThemeEntity> => {
    const response = await fetch('/api/themes/active', {
      headers: {
        'Content-Type': 'application/json',
        'X-Business-ID': businessId.toString()
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch active theme: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Get a theme by ID
   */
  getThemeById: async (id: number): Promise<ThemeEntity> => {
    const response = await fetch(`/api/themes/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch theme: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Get all themes for a business
   */
  getThemes: async (businessId: number): Promise<ThemeEntity[]> => {
    const response = await fetch(`/api/themes?businessId=${businessId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch themes: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.themes;
  },
  
  /**
   * Create a new theme
   */
  createTheme: async (theme: InsertThemeEntity): Promise<ThemeEntity> => {
    const response = await fetch('/api/themes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(theme)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create theme: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Update an existing theme
   */
  updateTheme: async (id: number, theme: Partial<InsertThemeEntity>): Promise<ThemeEntity> => {
    const response = await fetch(`/api/themes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(theme)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update theme: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Update the active theme for a business
   */
  updateActiveTheme: async (businessId: number, theme: Partial<InsertThemeEntity>): Promise<ThemeEntity> => {
    // First get the active theme
    const activeTheme = await themeApi.getActiveTheme(businessId);
    
    // Then update it
    return themeApi.updateTheme(activeTheme.id, theme);
  },
  
  /**
   * Delete a theme
   */
  deleteTheme: async (id: number): Promise<{ success: boolean }> => {
    const response = await fetch(`/api/themes/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete theme: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Activate a theme
   */
  activateTheme: async (id: number): Promise<ThemeEntity> => {
    const response = await fetch(`/api/themes/${id}/activate`, {
      method: 'PUT'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to activate theme: ${response.statusText}`);
    }
    
    return response.json();
  },
  
  /**
   * Apply a marketplace theme to a business
   */
  applyMarketplaceTheme: async (marketplaceThemeId: string, businessId: number): Promise<ThemeEntity> => {
    const response = await fetch('/api/themes/apply-marketplace', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ marketplaceThemeId, businessId })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to apply marketplace theme: ${response.statusText}`);
    }
    
    return response.json();
  }
};
```

### Theme Utilities

```typescript
// themeUtils.ts
import { DesignTokens, Theme, ThemeSettings } from '@shared/designTokens';

/**
 * Generates CSS variables from a theme's tokens
 */
export function generateCssVariables(tokens: DesignTokens): Record<string, string> {
  const variables: Record<string, string> = {};
  
  // Process each token category
  processTokenCategory(variables, 'colors', tokens.colors);
  processTokenCategory(variables, 'typography', tokens.typography);
  processTokenCategory(variables, 'spacing', tokens.spacing);
  processTokenCategory(variables, 'borders', tokens.borders);
  processTokenCategory(variables, 'shadows', tokens.shadows);
  processTokenCategory(variables, 'effects', tokens.effects);
  processTokenCategory(variables, 'components', tokens.components);
  
  return variables;
}

/**
 * Recursively processes token categories and generates CSS variable names
 */
function processTokenCategory(
  variables: Record<string, string>, 
  prefix: string, 
  tokens: Record<string, any>
) {
  for (const [key, value] of Object.entries(tokens)) {
    const variableName = `--theme-${prefix}-${key}`;
    
    if (typeof value === 'object' && value !== null) {
      // Recursively process nested objects
      processTokenCategory(variables, `${prefix}-${key}`, value);
    } else {
      // Set the CSS variable value
      variables[variableName] = value;
    }
  }
}

/**
 * Applies CSS variables to a target element
 */
export function applyCssVariables(
  element: HTMLElement,
  variables: Record<string, string>
) {
  for (const [name, value] of Object.entries(variables)) {
    element.style.setProperty(name, value);
  }
}

/**
 * Generates a darker shade of a color
 */
export function generateDarkerShade(color: string, amount: number = 0.2): string {
  // Implementation details omitted for brevity
  return darkerColor;
}

/**
 * Generates a lighter shade of a color
 */
export function generateLighterShade(color: string, amount: number = 0.2): string {
  // Implementation details omitted for brevity
  return lighterColor;
}

/**
 * Checks if a color is light or dark
 */
export function isLightColor(color: string): boolean {
  // Implementation details omitted for brevity
  return isLight;
}

/**
 * Generates an accessible text color based on background color
 */
export function generateAccessibleTextColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#000000' : '#ffffff';
}

/**
 * Serializes a theme to localStorage
 */
export function serializeTheme(theme: Theme): string {
  return JSON.stringify(theme);
}

/**
 * Deserializes a theme from localStorage
 */
export function deserializeTheme(themeStr: string): Theme | null {
  try {
    return JSON.parse(themeStr) as Theme;
  } catch (e) {
    console.error('Failed to deserialize theme:', e);
    return null;
  }
}
```

## React Hooks

### `useBusinessTheme`

```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import { Theme, ThemeMetadata, DesignTokens } from '@shared/designTokens';
import { themeApi } from '@/lib/themeApi';
import { useBusinessContext } from '@/hooks/useBusinessContext';

interface BusinessThemeContextValue {
  theme: Theme;
  isLoading: boolean;
  error: Error | null;
  businessId: number | null;
  businessSlug: string | null;
  refetch: () => void;
}

const BusinessThemeContext = createContext<BusinessThemeContextValue>({
  theme: { tokens: {} as DesignTokens, metadata: {} as ThemeMetadata },
  isLoading: true,
  error: null,
  businessId: null,
  businessSlug: null,
  refetch: () => {}
});

export function BusinessThemeProvider({ children }: { children: React.ReactNode }) {
  const { businessId, businessSlug } = useBusinessContext();
  const [theme, setTheme] = useState<Theme>({ 
    tokens: {} as DesignTokens, 
    metadata: {} as ThemeMetadata 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchTheme = async () => {
    if (!businessId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const themeData = await themeApi.getActiveTheme(businessId);
      
      // Transform the theme data into the expected format
      const formattedTheme: Theme = {
        tokens: themeData.tokens || {},
        metadata: {
          id: themeData.id.toString(),
          name: themeData.name,
          description: themeData.description || '',
          primaryColor: themeData.tokens?.colors?.primary?.DEFAULT || '#000000',
          baseColor: themeData.tokens?.colors?.background?.DEFAULT || '#ffffff',
          createdAt: themeData.createdAt.toString(),
          updatedAt: themeData.updatedAt.toString(),
          version: '1.0.0',
          isDefault: themeData.isDefault,
        }
      };
      
      setTheme(formattedTheme);
    } catch (err) {
      console.error('Error fetching business theme:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTheme();
  }, [businessId]);
  
  return (
    <BusinessThemeContext.Provider 
      value={{ 
        theme, 
        isLoading, 
        error, 
        businessId, 
        businessSlug,
        refetch: fetchTheme 
      }}
    >
      {children}
    </BusinessThemeContext.Provider>
  );
}

export function useBusinessTheme() {
  return useContext(BusinessThemeContext);
}
```

### `useGlobalTheme`

```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import { Theme, ThemeSettings } from '@shared/designTokens';
import { defaultTheme } from '@shared/defaultThemes';
import { serializeTheme, deserializeTheme } from '@/lib/themeUtils';

interface GlobalThemeContextValue {
  theme: Theme;
  settings: ThemeSettings;
  setSettings: (settings: ThemeSettings) => void;
  setTheme: (theme: Theme) => void;
}

const defaultSettings: ThemeSettings = {
  mode: 'system',
  variant: 'professional',
  animations: 'full',
  contrast: 'normal',
  fontSize: 1,
  reducedTransparency: false
};

const GlobalThemeContext = createContext<GlobalThemeContextValue>({
  theme: defaultTheme,
  settings: defaultSettings,
  setSettings: () => {},
  setTheme: () => {}
});

export function GlobalThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [settings, setSettingsState] = useState<ThemeSettings>(defaultSettings);
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const storedSettings = localStorage.getItem('themeSettings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings) as ThemeSettings;
        setSettingsState(parsedSettings);
      } catch (e) {
        console.error('Failed to parse stored theme settings:', e);
      }
    }
    
    const storedTheme = localStorage.getItem('globalTheme');
    if (storedTheme) {
      const parsedTheme = deserializeTheme(storedTheme);
      if (parsedTheme) {
        setThemeState(parsedTheme);
      }
    }
  }, []);
  
  // Update localStorage when settings change
  const setSettings = (newSettings: ThemeSettings) => {
    setSettingsState(newSettings);
    localStorage.setItem('themeSettings', JSON.stringify(newSettings));
  };
  
  // Update localStorage when theme changes
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('globalTheme', serializeTheme(newTheme));
  };
  
  return (
    <GlobalThemeContext.Provider 
      value={{ 
        theme, 
        settings, 
        setSettings, 
        setTheme 
      }}
    >
      {children}
    </GlobalThemeContext.Provider>
  );
}

export function useGlobalTheme() {
  return useContext(GlobalThemeContext);
}
```

### `useColorMode`

```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import { useGlobalTheme } from './useGlobalTheme';

type ColorMode = 'light' | 'dark' | 'system';

interface ColorModeContextValue {
  colorMode: 'light' | 'dark';
  preferredMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextValue>({
  colorMode: 'light',
  preferredMode: 'system',
  setColorMode: () => {},
  toggleColorMode: () => {}
});

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const { settings, setSettings } = useGlobalTheme();
  const [colorMode, setColorModeState] = useState<'light' | 'dark'>('light');
  
  // Determine the color mode based on settings and system preference
  const updateColorMode = () => {
    const mode = settings.mode;
    
    if (mode === 'system') {
      const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setColorModeState(systemDarkMode ? 'dark' : 'light');
    } else {
      setColorModeState(mode);
    }
  };
  
  // Update color mode when settings change
  useEffect(() => {
    updateColorMode();
  }, [settings.mode]);
  
  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (settings.mode === 'system') {
        updateColorMode();
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.mode]);
  
  // Set color mode in body class
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(colorMode);
  }, [colorMode]);
  
  // Set color mode
  const setColorMode = (mode: ColorMode) => {
    setSettings({
      ...settings,
      mode
    });
  };
  
  // Toggle color mode
  const toggleColorMode = () => {
    if (settings.mode === 'system') {
      // If current mode is system, toggle to explicit light/dark
      setColorMode(colorMode === 'light' ? 'dark' : 'light');
    } else {
      // Otherwise toggle between light and dark
      setColorMode(settings.mode === 'light' ? 'dark' : 'light');
    }
  };
  
  return (
    <ColorModeContext.Provider 
      value={{ 
        colorMode, 
        preferredMode: settings.mode,
        setColorMode, 
        toggleColorMode 
      }}
    >
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  return useContext(ColorModeContext);
}
```

### `useThemeVar`

```typescript
import { useBusinessTheme } from './useBusinessTheme';
import { get } from 'lodash';

/**
 * Hook to access a specific theme token value
 */
export function useThemeVar(path: string, fallback?: string): string {
  const { theme } = useBusinessTheme();
  const value = get(theme.tokens, path, fallback || '');
  return value;
}
```

## Component Examples

Refer to the [Component Integration Guide](./03-component-integration.md) for examples of how to use these APIs in components.