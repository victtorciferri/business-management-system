/**
 * Default theme tokens for the application
 */

export type GlobalTokens = {
  colors: {
    primary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    body: string;
    heading: string;
  };
  spacing: {
    base: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
};

export const defaultGlobalTheme: GlobalTokens = {
  colors: {
    primary: '#4f46e5', // Indigo 600
    accent: '#8b5cf6', // Violet 500
    background: '#ffffff', // White
    text: '#111827', // Gray 900
  },
  fonts: {
    body: 'Inter, system-ui, sans-serif',
    heading: 'Inter, system-ui, sans-serif',
  },
  spacing: {
    base: 4,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};