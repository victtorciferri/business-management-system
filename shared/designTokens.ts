/**
 * Design Tokens - 2025 Edition
 * 
 * Defines the structure of the design token system
 */

/**
 * Color tokens
 */
export interface ColorTokens {
  primary: Record<string, string> | string;
  secondary: Record<string, string> | string;
  background: Record<string, string> | string;
  foreground: Record<string, string> | string;
  border: string | Record<string, string>;
  focus: string | Record<string, string>;
  destructive: Record<string, string> | string;
  success: Record<string, string> | string;
  warning: Record<string, string> | string;
  info: Record<string, string> | string;
  [key: string]: Record<string, string> | string;
}

/**
 * Typography tokens
 */
export interface TypographyTokens {
  fontFamily: Record<string, string>;
  fontSize: Record<string, string>;
  fontWeight: Record<string, string>;
  lineHeight: Record<string, string>;
  letterSpacing: Record<string, string>;
  [key: string]: Record<string, string>;
}

/**
 * Spacing tokens
 */
export interface SpacingTokens {
  [key: string]: string;
}

/**
 * Border tokens
 */
export interface BorderTokens {
  radius: Record<string, string>;
  width: Record<string, string>;
  focus: Record<string, string>;
  [key: string]: Record<string, string>;
}

/**
 * Shadow tokens
 */
export interface ShadowTokens {
  [key: string]: string;
}

/**
 * Effect tokens
 */
export interface EffectTokens {
  transition: Record<string, string>;
  opacity: Record<string, string>;
  [key: string]: Record<string, string>;
}

/**
 * Component tokens
 */
export interface ComponentTokens {
  [key: string]: Record<string, string | Record<string, string>>;
}

/**
 * Design token system
 */
export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borders: BorderTokens;
  shadows: ShadowTokens;
  effects: EffectTokens;
  components: ComponentTokens;
}

/**
 * Theme settings
 */
export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  fontFamily: string;
}

/**
 * Theme metadata
 */
export interface ThemeMetadata {
  id: string;
  name: string;
  description?: string;
  variant: 'professional' | 'vibrant' | 'elegant' | 'minimal' | 'muted';
  industry?: string;
  seasonal?: boolean;
  isAccessible?: boolean;
  createdAt: string;
  updatedAt: string;
  primaryColor: string;
  baseColor: string;
  secondaryColor?: string;
  version: string;
  isDefault: boolean;
}

/**
 * Complete theme
 */
export interface Theme {
  tokens: DesignTokens;
  metadata: ThemeMetadata;
  settings?: ThemeSettings;
}