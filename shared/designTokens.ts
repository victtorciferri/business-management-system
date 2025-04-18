/**
 * Design Tokens Schema - 2025 Edition
 * 
 * A comprehensive type system for design tokens that will power the theme engine.
 * This schema defines all possible customizable aspects of the application's design system.
 */

/**
 * Color token definitions - the foundation of the visual design
 */
export interface ColorTokens {
  // Brand colors
  primary: {
    DEFAULT: string;
    light: string;
    dark: string;
    contrast: string; // High contrast version for accessibility
  };
  
  secondary: {
    DEFAULT: string;
    light: string;
    dark: string;
    contrast: string;
  };
  
  accent: {
    DEFAULT: string;
    light: string;
    dark: string;
    contrast: string;
  };
  
  // Background colors
  background: {
    DEFAULT: string; // Main background
    surface: string; // Card/element backgrounds
    elevated: string; // Raised elements
    sunken: string; // Inset elements
    highlight: string; // Highlighted areas
  };
  
  // Text colors
  text: {
    DEFAULT: string; // Primary text
    secondary: string; // Less prominent text
    tertiary: string; // Least prominent text
    onPrimary: string; // Text on primary color
    onSecondary: string; // Text on secondary color
    onAccent: string; // Text on accent color
    disabled: string; // Disabled text
  };
  
  // State colors
  state: {
    info: {
      DEFAULT: string;
      foreground: string; // Text on info background
      background: string; // Light background for info states
    };
    success: {
      DEFAULT: string;
      foreground: string;
      background: string;
    };
    warning: {
      DEFAULT: string;
      foreground: string;
      background: string;
    };
    error: {
      DEFAULT: string;
      foreground: string;
      background: string;
    };
  };
  
  // Border colors
  border: {
    DEFAULT: string;
    strong: string;
    light: string;
    focus: string;
    disabled: string;
  };
  
  // Data visualization colors (for charts, graphs)
  dataVis: {
    sequential: string[]; // Array of colors for sequential data
    categorical: string[]; // Array of colors for categorical data
    diverging: string[]; // Array of diverging colors (low to high)
  };
}

/**
 * Typography token definitions - fonts, sizes, weights, etc.
 */
export interface TypographyTokens {
  // Font families
  fontFamily: {
    heading: string; // For headings
    body: string; // For body text
    mono: string; // For code, tabular data
    special: string; // For special text elements (can be brand-specific)
  };
  
  // Font sizes (defined in rem for scalability)
  fontSize: {
    xs: string;
    sm: string;
    base: string; // Default text size
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
  };
  
  // Font weights
  fontWeight: {
    thin: number;
    extralight: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
  };
  
  // Line heights
  lineHeight: {
    none: string; // 1
    tight: string; // 1.25
    snug: string; // 1.375
    normal: string; // 1.5
    relaxed: string; // 1.625
    loose: string; // 2
    body: string; // Specific for body text
    heading: string; // Specific for headings
  };
  
  // Letter spacing
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
  };
  
  // Paragraph spacing
  paragraphSpacing: {
    DEFAULT: string;
    tight: string;
    loose: string;
  };
  
  // Text case transformations
  textCase: {
    none: string;
    uppercase: string;
    lowercase: string;
    capitalize: string;
  };
  
  // Text decoration
  textDecoration: {
    none: string;
    underline: string;
    lineThrough: string;
  };
}

/**
 * Spacing token definitions for consistent layout
 */
export interface SpacingTokens {
  // Space scale in 0.25rem (4px) increments
  0: string; // 0px
  px: string; // 1px
  0.5: string; // 0.125rem / 2px
  1: string; // 0.25rem / 4px
  1.5: string; // 0.375rem / 6px
  2: string; // 0.5rem / 8px
  2.5: string; // 0.625rem / 10px
  3: string; // 0.75rem / 12px
  3.5: string; // 0.875rem / 14px
  4: string; // 1rem / 16px
  5: string; // 1.25rem / 20px
  6: string; // 1.5rem / 24px
  7: string; // 1.75rem / 28px
  8: string; // 2rem / 32px
  9: string; // 2.25rem / 36px
  10: string; // 2.5rem / 40px
  11: string; // 2.75rem / 44px
  12: string; // 3rem / 48px
  14: string; // 3.5rem / 56px
  16: string; // 4rem / 64px
  20: string; // 5rem / 80px
  24: string; // 6rem / 96px
  28: string; // 7rem / 112px
  32: string; // 8rem / 128px
  36: string; // 9rem / 144px
  40: string; // 10rem / 160px
  44: string; // 11rem / 176px
  48: string; // 12rem / 192px
  52: string; // 13rem / 208px
  56: string; // 14rem / 224px
  60: string; // 15rem / 240px
  64: string; // 16rem / 256px
  72: string; // 18rem / 288px
  80: string; // 20rem / 320px
  96: string; // 24rem / 384px
}

/**
 * Border token definitions
 */
export interface BorderTokens {
  // Border radius
  radius: {
    none: string;
    sm: string;
    DEFAULT: string; // Medium radius
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    full: string; // Fully rounded (circle/pill)
  };
  
  // Border width
  width: {
    none: string;
    hairline: string; // Ultra thin
    thin: string;
    DEFAULT: string; // Medium width
    thick: string;
    heavy: string;
  };
  
  // Border style
  style: {
    none: string;
    solid: string;
    dashed: string;
    dotted: string;
    double: string;
  };
}

/**
 * Shadow token definitions
 */
export interface ShadowTokens {
  // Elevation shadows
  sm: string;
  DEFAULT: string; // Medium shadow
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  inner: string; // Inset shadow
  none: string;
  
  // Colored shadows for special effects
  colored: {
    primary: string; // Shadow with primary color
    success: string;
    warning: string;
    error: string;
  };
}

/**
 * Animation token definitions
 */
export interface AnimationTokens {
  // Durations
  duration: {
    fastest: string; // 100ms
    faster: string; // 150ms
    fast: string; // 200ms
    normal: string; // 300ms
    slow: string; // 400ms
    slower: string; // 500ms
    slowest: string; // 700ms
  };
  
  // Easing curves
  easing: {
    linear: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    easeInBack: string;
    easeOutBack: string;
    easeInOutBack: string;
    easeInElastic: string;
    easeOutElastic: string;
    easeInOutElastic: string;
    easeInBounce: string;
    easeOutBounce: string;
    easeInOutBounce: string;
  };
  
  // Animation presets
  preset: {
    fadeIn: string;
    fadeOut: string;
    scaleIn: string;
    scaleOut: string;
    slideInFromTop: string;
    slideInFromRight: string;
    slideInFromBottom: string;
    slideInFromLeft: string;
    slideOutToTop: string;
    slideOutToRight: string;
    slideOutToBottom: string;
    slideOutToLeft: string;
  };
}

/**
 * Depth (z-index) token definitions
 */
export interface DepthTokens {
  // Z-index values
  negative: number; // -1, for elements that should be behind the baseline
  base: number; // 0, the baseline
  low: number; // 10, for slight elevations
  menu: number; // 50, for dropdown menus
  navigation: number; // 100, for sticky headers
  overlay: number; // 500, for overlays
  modal: number; // 1000, for modals
  toast: number; // 2000, for notifications
  tooltip: number; // 3000, for tooltips
  top: number; // 9999, for elements that should always be on top
}

/**
 * Media query breakpoint definitions
 */
export interface BreakpointTokens {
  xs: string; // Extra small devices
  sm: string; // Small devices
  md: string; // Medium devices
  lg: string; // Large devices
  xl: string; // Extra large devices
  '2xl': string; // 2X extra large devices
  
  // Specific named contexts
  mobile: string;
  tablet: string;
  desktop: string;
  wide: string;
}

/**
 * Component-specific token definitions
 * These are specific to UI components and can reference other tokens
 */
export interface ComponentTokens {
  // Button component tokens
  button: {
    // Size variants
    size: {
      sm: {
        fontSize: string;
        padding: string;
        height: string;
        minWidth: string;
        iconSize: string;
      };
      md: {
        fontSize: string;
        padding: string;
        height: string;
        minWidth: string;
        iconSize: string;
      };
      lg: {
        fontSize: string;
        padding: string;
        height: string;
        minWidth: string;
        iconSize: string;
      };
    };
    
    // Style variants
    variant: {
      primary: {
        background: string;
        color: string;
        border: string;
        hoverBackground: string;
        hoverColor: string;
        activeBackground: string;
        focusRing: string;
        disabledBackground: string;
        disabledColor: string;
      };
      secondary: {
        background: string;
        color: string;
        border: string;
        hoverBackground: string;
        hoverColor: string;
        activeBackground: string;
        focusRing: string;
        disabledBackground: string;
        disabledColor: string;
      };
      outline: {
        background: string;
        color: string;
        border: string;
        hoverBackground: string;
        hoverColor: string;
        activeBackground: string;
        focusRing: string;
        disabledBackground: string;
        disabledColor: string;
      };
      ghost: {
        background: string;
        color: string;
        border: string;
        hoverBackground: string;
        hoverColor: string;
        activeBackground: string;
        focusRing: string;
        disabledBackground: string;
        disabledColor: string;
      };
      link: {
        background: string;
        color: string;
        border: string;
        hoverBackground: string;
        hoverColor: string;
        activeBackground: string;
        focusRing: string;
        disabledBackground: string;
        disabledColor: string;
      };
      destructive: {
        background: string;
        color: string;
        border: string;
        hoverBackground: string;
        hoverColor: string;
        activeBackground: string;
        focusRing: string;
        disabledBackground: string;
        disabledColor: string;
      };
    };
  };
  
  // Input component tokens
  input: {
    // Size variants
    size: {
      sm: {
        fontSize: string;
        padding: string;
        height: string;
        iconSize: string;
      };
      md: {
        fontSize: string;
        padding: string;
        height: string;
        iconSize: string;
      };
      lg: {
        fontSize: string;
        padding: string;
        height: string;
        iconSize: string;
      };
    };
    
    // Core styles
    background: string;
    color: string;
    placeholderColor: string;
    borderColor: string;
    borderColorFocus: string;
    borderColorHover: string;
    borderColorError: string;
    borderWidth: string;
    borderRadius: string;
    boxShadow: string;
    boxShadowFocus: string;
    boxShadowError: string;
    
    // States
    error: {
      background: string;
      borderColor: string;
      color: string;
      boxShadow: string;
    };
    disabled: {
      background: string;
      borderColor: string;
      color: string;
      opacity: string;
    };
    readOnly: {
      background: string;
      borderColor: string;
      color: string;
    };
  };
  
  // Card component tokens
  card: {
    // Style variants
    variant: {
      default: {
        background: string;
        borderColor: string;
        borderWidth: string;
        borderRadius: string;
        boxShadow: string;
        padding: string;
      };
      flat: {
        background: string;
        borderColor: string;
        borderWidth: string;
        borderRadius: string;
        boxShadow: string;
        padding: string;
      };
      elevated: {
        background: string;
        borderColor: string;
        borderWidth: string;
        borderRadius: string;
        boxShadow: string;
        padding: string;
      };
      outlined: {
        background: string;
        borderColor: string;
        borderWidth: string;
        borderRadius: string;
        boxShadow: string;
        padding: string;
      };
    };
    
    // Card parts
    header: {
      background: string;
      padding: string;
      borderBottomWidth: string;
      borderBottomColor: string;
    };
    body: {
      padding: string;
    };
    footer: {
      background: string;
      padding: string;
      borderTopWidth: string;
      borderTopColor: string;
    };
  };
  
  // Modal component tokens
  modal: {
    background: string;
    borderRadius: string;
    boxShadow: string;
    overlay: {
      background: string;
      backdropFilter: string;
    };
    header: {
      padding: string;
      borderBottomWidth: string;
      borderBottomColor: string;
    };
    body: {
      padding: string;
    };
    footer: {
      padding: string;
      borderTopWidth: string;
      borderTopColor: string;
    };
  };
  
  // Alert component tokens
  alert: {
    borderRadius: string;
    padding: string;
    
    // Alert variants
    variant: {
      info: {
        background: string;
        borderColor: string;
        color: string;
        iconColor: string;
      };
      success: {
        background: string;
        borderColor: string;
        color: string;
        iconColor: string;
      };
      warning: {
        background: string;
        borderColor: string;
        color: string;
        iconColor: string;
      };
      error: {
        background: string;
        borderColor: string;
        color: string;
        iconColor: string;
      };
    };
  };
  
  // Badge component tokens
  badge: {
    borderRadius: string;
    fontSize: string;
    fontWeight: string;
    
    // Size variants
    size: {
      sm: {
        fontSize: string;
        padding: string;
        height: string;
      };
      md: {
        fontSize: string;
        padding: string;
        height: string;
      };
      lg: {
        fontSize: string;
        padding: string;
        height: string;
      };
    };
    
    // Style variants
    variant: {
      default: {
        background: string;
        color: string;
      };
      primary: {
        background: string;
        color: string;
      };
      secondary: {
        background: string;
        color: string;
      };
      outline: {
        background: string;
        borderColor: string;
        color: string;
      };
      success: {
        background: string;
        color: string;
      };
      warning: {
        background: string;
        color: string;
      };
      error: {
        background: string;
        color: string;
      };
    };
  };
  
  // More component tokens can be added as needed...
}

/**
 * Layout-specific tokens
 */
export interface LayoutTokens {
  // Container
  container: {
    maxWidth: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
    padding: {
      sm: string;
      md: string;
      lg: string;
    };
  };
  
  // Grid system
  grid: {
    columns: number;
    gap: {
      sm: string;
      md: string;
      lg: string;
    };
  };
  
  // Section spacing
  section: {
    padding: {
      sm: string;
      md: string;
      lg: string;
    };
    margin: {
      sm: string;
      md: string;
      lg: string;
    };
  };
  
  // Header
  header: {
    height: {
      sm: string;
      md: string;
      lg: string;
    };
    padding: string;
    background: string;
    boxShadow: string;
    zIndex: number;
  };
  
  // Sidebar
  sidebar: {
    width: {
      compact: string;
      default: string;
      expanded: string;
    };
    background: string;
    boxShadow: string;
    zIndex: number;
  };
  
  // Footer
  footer: {
    padding: string;
    background: string;
  };
}

/**
 * Master design token interface that combines all token categories
 */
export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borders: BorderTokens;
  shadows: ShadowTokens;
  animation: AnimationTokens;
  depth: DepthTokens;
  breakpoints: BreakpointTokens;
  components: ComponentTokens;
  layout: LayoutTokens;
}

/**
 * Theme metadata
 */
export interface ThemeMetadata {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string; // URL to theme preview image
  tags: string[];
  industry?: string;
  featured: boolean;
  baseTheme?: string; // ID of theme this extends (if any)
}

/**
 * Complete theme interface combining metadata and design tokens
 */
export interface Theme {
  metadata: ThemeMetadata;
  tokens: DesignTokens;
}

/**
 * Theme mode that can be applied to any theme
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Theme variant representing styling approaches
 */
export type ThemeVariant = 'professional' | 'playful' | 'minimal' | 'vibrant' | 'elegant' | 'custom';

/**
 * Animation preference for accessibility
 */
export type AnimationPreference = 'full' | 'reduced' | 'none';

/**
 * Contrast preference for accessibility
 */
export type ContrastPreference = 'normal' | 'high' | 'maximum';

/**
 * User theme settings/preferences
 */
export interface ThemeSettings {
  mode: ThemeMode;
  variant: ThemeVariant;
  animations: AnimationPreference;
  contrast: ContrastPreference;
  fontSize: number; // Scaling factor
  reducedTransparency: boolean;
  customColors?: Partial<ColorTokens>;
}

/**
 * Theme categories for organization
 */
export type ThemeCategory = 
  | 'business' // Professional business themes
  | 'creative' // Creative and artistic themes
  | 'tech'     // Technology-focused themes
  | 'nature'   // Nature-inspired themes
  | 'minimal'  // Minimalist themes
  | 'vibrant'  // Colorful and vibrant themes
  | 'industry' // Industry-specific themes
  | 'seasonal' // Seasonal and holiday themes
  | 'custom';  // User-created themes