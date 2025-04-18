/**
 * Design Tokens - 2025 Edition
 * 
 * Core token definitions and interfaces for the theme system
 */

/**
 * Color token definitions
 */
export interface ColorTokens {
  primary: {
    DEFAULT: string;
    light: string;
    dark: string;
    foreground: string;
    hover: string;
    [key: string]: string;
  };
  secondary: {
    DEFAULT: string;
    light: string;
    dark: string;
    foreground: string;
    hover: string;
    [key: string]: string;
  };
  background: {
    DEFAULT: string;
    surface: string;
    elevated: string;
    sunken: string;
    [key: string]: string;
  };
  foreground: {
    DEFAULT: string;
    muted: string;
    subtle: string;
    [key: string]: string;
  };
  border: string;
  focus: string;
  destructive: {
    DEFAULT: string;
    foreground: string;
    light: string;
    [key: string]: string;
  };
  success: {
    DEFAULT: string;
    foreground: string;
    light: string;
    [key: string]: string;
  };
  warning: {
    DEFAULT: string;
    foreground: string;
    light: string;
    [key: string]: string;
  };
  info: {
    DEFAULT: string;
    foreground: string;
    light: string;
    [key: string]: string;
  };
  [key: string]: any;
}

/**
 * Typography token definitions
 */
export interface TypographyTokens {
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
    body: string;
    heading: string;
    display: string;
    [key: string]: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
    '7xl': string;
    '8xl': string;
    '9xl': string;
    DEFAULT: string;
    [key: string]: string;
  };
  fontWeight: {
    thin: number | string;
    extralight: number | string;
    light: number | string;
    normal: number | string;
    medium: number | string;
    semibold: number | string;
    bold: number | string;
    extrabold: number | string;
    black: number | string;
    DEFAULT: number | string;
    [key: string]: number | string;
  };
  lineHeight: {
    none: string;
    tight: string;
    snug: string;
    normal: string;
    relaxed: string;
    loose: string;
    DEFAULT: string;
    [key: string]: string;
  };
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
    DEFAULT: string;
    [key: string]: string;
  };
  [key: string]: any;
}

/**
 * Spacing token definitions
 */
export interface SpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
  DEFAULT: string;
  [key: string]: string;
}

/**
 * Border token definitions
 */
export interface BorderTokens {
  radius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    full: string;
    DEFAULT: string;
    [key: string]: string;
  };
  width: {
    DEFAULT: string;
    none: string;
    thin: string;
    thick: string;
    heavy: string;
    [key: string | number]: string;
  };
  focus: {
    width: string;
    style: string;
    [key: string]: string;
  };
  [key: string]: any;
}

/**
 * Shadow token definitions
 */
export interface ShadowTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  inner: string;
  DEFAULT: string;
  colored: string;
  [key: string]: string;
}

/**
 * Effect token definitions
 */
export interface EffectTokens {
  transition: {
    fast: string;
    normal: string;
    slow: string;
    DEFAULT: string;
    [key: string]: string;
  };
  opacity: {
    0: string;
    25: string;
    50: string;
    75: string;
    100: string;
    disabled: string;
    hover: string;
    [key: string | number]: string;
  };
  [key: string]: any;
}

/**
 * Component-specific token definitions
 */
export interface ComponentTokens {
  button: {
    [key: string]: any;
  };
  input: {
    [key: string]: any;
  };
  card: {
    [key: string]: any;
  };
  modal: {
    [key: string]: any;
  };
  toast: {
    [key: string]: any;
  };
  avatar: {
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Complete design token collection
 */
export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borders: BorderTokens;
  shadows: ShadowTokens;
  effects: EffectTokens;
  components: ComponentTokens;
  [key: string]: any;
}

/**
 * Theme metadata
 */
export interface ThemeMetadata {
  id: string;
  name: string;
  description: string;
  variant?: 'professional' | 'vibrant' | 'elegant' | 'minimal' | 'muted';
  industry?: string;
  seasonal?: boolean;
  isAccessible?: boolean;
  primaryColor: string;
  baseColor: string;
  secondaryColor?: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  isDefault: boolean;
  author?: string;
  tags?: string[];
}

/**
 * Complete theme object
 */
export interface Theme {
  tokens: DesignTokens;
  metadata: ThemeMetadata;
}

/**
 * Theme settings for user preferences
 */
export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  variant: 'professional' | 'vibrant' | 'minimal' | 'elegant';
  animations: 'full' | 'reduced' | 'none';
  contrast: 'normal' | 'high' | 'low';
  fontSize: number; // Scale factor (1 = normal, 1.25 = larger)
  reducedTransparency: boolean;
}

/**
 * Theme preset information
 */
export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  variant: ThemeMetadata['variant'];
  previewColor: string;
  isAccessible?: boolean;
  industry?: string;
  seasonal?: boolean;
}