/**
 * Theme Creator - 2025 Edition
 * 
 * A developer-friendly API for creating consistent themes using the design token system.
 * This provides factory functions and builders to simplify theme creation.
 */

import { 
  Theme, 
  ThemeMetadata, 
  DesignTokens, 
  ColorTokens,
  TypographyTokens,
  SpacingTokens,
  BorderTokens,
  ShadowTokens,
  AnimationTokens,
  DepthTokens,
  BreakpointTokens,
  ComponentTokens,
  LayoutTokens,
  ThemeCategory,
  ThemeVariant
} from './designTokens';

import { deepMerge } from './tokenUtils';

/**
 * Default font stacks for common font categories
 */
export const fontStacks = {
  // Sans-serif fonts
  sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  
  // Serif fonts
  serif: 'Playfair Display, Georgia, Cambria, "Times New Roman", Times, serif',
  
  // Monospace fonts
  mono: 'JetBrains Mono, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  
  // Display/heading fonts
  display: 'Plus Jakarta Sans, Poppins, system-ui, sans-serif',
  
  // Handwriting fonts
  handwriting: 'Caveat, "Brush Script MT", cursive',
  
  // Accessible sans - optimized for legibility and screen readers
  sansAccessible: 'Atkinson Hyperlegible, Inter, Arial, sans-serif',
  
  // Dyslexia-friendly font
  dyslexic: 'OpenDyslexic, Comic Sans MS, Verdana, sans-serif',
  
  // Business fonts
  business: 'Montserrat, Arial, "Helvetica Neue", sans-serif',
  
  // Technical fonts - good for documentation and technical content
  technical: 'IBM Plex Sans, Roboto, system-ui, sans-serif',
  
  // Magazine style
  magazine: 'Merriweather, Georgia, serif',
  
  // Modern sans
  modern: 'Outfit, Inter, system-ui, sans-serif',
  
  // Minimal
  minimal: 'DM Sans, system-ui, sans-serif',
  
  // Elegant
  elegant: 'Cormorant Garamond, Playfair Display, Georgia, serif',
  
  // Clean with good readability for UI
  ui: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

/**
 * Common color palettes by name
 */
export const colorPalettes = {
  // Corporate/Professional blues
  corporate: {
    primary: '#0f172a',    // Slate 900
    secondary: '#1e40af',  // Blue 800
    accent: '#0ea5e9',     // Sky 500
    neutral: '#64748b',    // Slate 500
  },
  
  // Creative/Modern purples
  creative: {
    primary: '#6b21a8',    // Purple 800
    secondary: '#7e22ce',  // Purple 700
    accent: '#d946ef',     // Fuchsia 500
    neutral: '#a1a1aa',    // Zinc 400
  },
  
  // Natural/Organic greens
  natural: {
    primary: '#166534',    // Green 800
    secondary: '#15803d',  // Green 700
    accent: '#facc15',     // Yellow 400
    neutral: '#a8a29e',    // Stone 400
  },
  
  // Vibrant/Energetic oranges
  energetic: {
    primary: '#9a3412',    // Orange 800
    secondary: '#c2410c',  // Orange 700
    accent: '#facc15',     // Yellow 400
    neutral: '#a8a29e',    // Stone 400
  },
  
  // Elegant/Luxury deep purples and golds
  elegant: {
    primary: '#581c87',    // Purple 900
    secondary: '#7e22ce',  // Purple 700
    accent: '#f59e0b',     // Amber 500
    neutral: '#78716c',    // Stone 500
  },
  
  // Tech/Futuristic cyans
  tech: {
    primary: '#164e63',    // Cyan 800
    secondary: '#0e7490',  // Cyan 700
    accent: '#06b6d4',     // Cyan 500
    neutral: '#71717a',    // Zinc 500
  },
  
  // Playful/Fun pinks
  playful: {
    primary: '#831843',    // Pink 800
    secondary: '#be185d',  // Pink 700
    accent: '#8b5cf6',     // Violet 500
    neutral: '#a1a1aa',    // Zinc 400
  },
  
  // Serious/Traditional grays
  traditional: {
    primary: '#1f2937',    // Gray 800
    secondary: '#374151',  // Gray 700
    accent: '#3b82f6',     // Blue 500
    neutral: '#9ca3af',    // Gray 400
  },
  
  // Medical/Healthcare blues
  medical: {
    primary: '#1e3a8a',    // Blue 900
    secondary: '#1d4ed8',  // Blue 700
    accent: '#06b6d4',     // Cyan 500
    neutral: '#94a3b8',    // Slate 400
  },
  
  // Food/Restaurant warm colors
  culinary: {
    primary: '#7c2d12',    // Orange 900
    secondary: '#c2410c',  // Orange 700
    accent: '#65a30d',     // Lime 600
    neutral: '#a8a29e',    // Stone 400
  },
};

/**
 * Create a complete set of color tokens from a base palette
 */
function createColorTokens(palette: {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  background?: string;
  text?: string;
}): ColorTokens {
  // Default background and text colors
  const background = palette.background || '#ffffff';
  const text = palette.text || '#1f2937';
  
  return {
    primary: {
      DEFAULT: palette.primary,
      light: adjustColorLightness(palette.primary, 20),
      dark: adjustColorLightness(palette.primary, -20),
      contrast: getContrastColor(palette.primary),
    },
    
    secondary: {
      DEFAULT: palette.secondary,
      light: adjustColorLightness(palette.secondary, 20),
      dark: adjustColorLightness(palette.secondary, -20),
      contrast: getContrastColor(palette.secondary),
    },
    
    accent: {
      DEFAULT: palette.accent,
      light: adjustColorLightness(palette.accent, 20),
      dark: adjustColorLightness(palette.accent, -20),
      contrast: getContrastColor(palette.accent),
    },
    
    background: {
      DEFAULT: background,
      surface: adjustColorLightness(background, -3),
      elevated: adjustColorLightness(background, 3),
      sunken: adjustColorLightness(background, -8),
      highlight: adjustColorLightness(background, 5),
    },
    
    text: {
      DEFAULT: text,
      secondary: adjustColorLightness(text, 20),
      tertiary: adjustColorLightness(text, 40),
      onPrimary: getContrastColor(palette.primary),
      onSecondary: getContrastColor(palette.secondary),
      onAccent: getContrastColor(palette.accent),
      disabled: adjustColorLightness(text, 45),
    },
    
    state: {
      info: {
        DEFAULT: '#3b82f6', // Blue 500
        foreground: '#ffffff',
        background: '#eff6ff', // Blue 50
      },
      success: {
        DEFAULT: '#10b981', // Emerald 500
        foreground: '#ffffff',
        background: '#ecfdf5', // Emerald 50
      },
      warning: {
        DEFAULT: '#f59e0b', // Amber 500
        foreground: '#ffffff',
        background: '#fffbeb', // Amber 50
      },
      error: {
        DEFAULT: '#ef4444', // Red 500
        foreground: '#ffffff',
        background: '#fef2f2', // Red 50
      },
    },
    
    border: {
      DEFAULT: adjustColorLightness(text, 75),
      strong: adjustColorLightness(text, 55),
      light: adjustColorLightness(text, 90),
      focus: palette.primary,
      disabled: adjustColorLightness(text, 80),
    },
    
    dataVis: {
      sequential: [
        '#c1e7ff',
        '#7cc6fa',
        '#3ba2f6',
        '#0077e6',
        '#004da9',
      ],
      categorical: [
        palette.primary,
        palette.secondary,
        palette.accent,
        '#10b981', // Emerald 500
        '#f59e0b', // Amber 500
        '#ef4444', // Red 500
        '#8b5cf6', // Violet 500
      ],
      diverging: [
        '#ef4444', // Red 500
        '#f97316', // Orange 500  
        '#facc15', // Yellow 400
        '#a3a3a3', // Neutral
        '#a3e635', // Lime 400
        '#34d399', // Emerald 400
        '#0ea5e9', // Sky 500
      ],
    },
  };
}

/**
 * Create complete typography tokens based on base font selections
 */
function createTypographyTokens(options: {
  heading?: string;
  body?: string;
  mono?: string;
  special?: string;
} = {}): TypographyTokens {
  return {
    fontFamily: {
      heading: options.heading || fontStacks.sans,
      body: options.body || fontStacks.sans,
      mono: options.mono || fontStacks.mono,
      special: options.special || fontStacks.display,
    },
    
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      md: '1.075rem',
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
    },
    
    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
      body: '1.6',
      heading: '1.2',
    },
    
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
    
    paragraphSpacing: {
      DEFAULT: '1.5rem',
      tight: '1rem',
      loose: '2rem',
    },
    
    textCase: {
      none: 'none',
      uppercase: 'uppercase',
      lowercase: 'lowercase',
      capitalize: 'capitalize',
    },
    
    textDecoration: {
      none: 'none',
      underline: 'underline',
      lineThrough: 'line-through',
    },
  };
}

/**
 * Create complete spacing tokens with a consistent scale
 * 
 * Uses a 0.25rem (4px) based scale by default
 */
function createSpacingTokens(): SpacingTokens {
  return {
    0: '0px',
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  };
}

/**
 * Create complete border tokens
 */
function createBorderTokens(baseRadius: number = 6): BorderTokens {
  return {
    radius: {
      none: '0px',
      sm: `${baseRadius / 2}px`,
      DEFAULT: `${baseRadius}px`,
      md: `${baseRadius}px`,
      lg: `${baseRadius * 1.5}px`,
      xl: `${baseRadius * 2}px`,
      '2xl': `${baseRadius * 2.5}px`,
      '3xl': `${baseRadius * 3}px`,
      full: '9999px',
    },
    
    width: {
      none: '0px',
      hairline: '0.5px',
      thin: '1px',
      DEFAULT: '2px',
      thick: '3px',
      heavy: '4px',
    },
    
    style: {
      none: 'none',
      solid: 'solid',
      dashed: 'dashed',
      dotted: 'dotted',
      double: 'double',
    },
  };
}

/**
 * Create complete shadow tokens
 */
function createShadowTokens(intensity: 'soft' | 'medium' | 'sharp' = 'medium'): ShadowTokens {
  let shadowPrefix: string;
  
  switch (intensity) {
    case 'soft':
      shadowPrefix = 'rgba(0, 0, 0, 0.05)';
      break;
    case 'medium':
      shadowPrefix = 'rgba(0, 0, 0, 0.1)';
      break;
    case 'sharp':
      shadowPrefix = 'rgba(0, 0, 0, 0.15)';
      break;
  }
  
  return {
    sm: `0 1px 2px 0 ${shadowPrefix}`,
    DEFAULT: `0 1px 3px 0 ${shadowPrefix}, 0 1px 2px -1px ${shadowPrefix}`,
    md: `0 4px 6px -1px ${shadowPrefix}, 0 2px 4px -2px ${shadowPrefix}`,
    lg: `0 10px 15px -3px ${shadowPrefix}, 0 4px 6px -4px ${shadowPrefix}`,
    xl: `0 20px 25px -5px ${shadowPrefix}, 0 8px 10px -6px ${shadowPrefix}`,
    '2xl': `0 25px 50px -12px ${shadowPrefix}`,
    '3xl': `0 35px 60px -15px ${shadowPrefix}`,
    inner: `inset 0 2px 4px 0 ${shadowPrefix}`,
    none: 'none',
    
    colored: {
      primary: '0 4px 14px 0 rgba(var(--colors-primary), 0.35)',
      success: '0 4px 14px 0 rgba(var(--colors-state-success), 0.35)',
      warning: '0 4px 14px 0 rgba(var(--colors-state-warning), 0.35)',
      error: '0 4px 14px 0 rgba(var(--colors-state-error), 0.35)',
    },
  };
}

/**
 * Create complete animation tokens
 */
function createAnimationTokens(speed: 'fast' | 'normal' | 'slow' = 'normal'): AnimationTokens {
  // Duration multiplier based on speed
  const durationMultiplier = speed === 'fast' ? 0.8 : speed === 'slow' ? 1.5 : 1;
  
  return {
    duration: {
      fastest: `${Math.round(100 * durationMultiplier)}ms`,
      faster: `${Math.round(150 * durationMultiplier)}ms`,
      fast: `${Math.round(200 * durationMultiplier)}ms`,
      normal: `${Math.round(300 * durationMultiplier)}ms`,
      slow: `${Math.round(400 * durationMultiplier)}ms`,
      slower: `${Math.round(500 * durationMultiplier)}ms`,
      slowest: `${Math.round(700 * durationMultiplier)}ms`,
    },
    
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeInBack: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
      easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      easeInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      easeInElastic: 'cubic-bezier(0.7, 0, 0.84, 0)',
      easeOutElastic: 'cubic-bezier(0.16, 1, 0.3, 1)',
      easeInOutElastic: 'cubic-bezier(0.87, 0, 0.13, 1)',
      easeInBounce: 'cubic-bezier(0.5, 0, 0.75, 0)',
      easeOutBounce: 'cubic-bezier(0.25, 1, 0.5, 1)',
      easeInOutBounce: 'cubic-bezier(0.76, 0, 0.24, 1)',
    },
    
    preset: {
      fadeIn: 'fade-in 0.3s ease-in-out',
      fadeOut: 'fade-out 0.3s ease-in-out',
      scaleIn: 'scale-in 0.2s ease-out',
      scaleOut: 'scale-out 0.2s ease-in',
      slideInFromTop: 'slide-in-from-top 0.3s ease-out',
      slideInFromRight: 'slide-in-from-right 0.3s ease-out',
      slideInFromBottom: 'slide-in-from-bottom 0.3s ease-out',
      slideInFromLeft: 'slide-in-from-left 0.3s ease-out',
      slideOutToTop: 'slide-out-to-top 0.3s ease-in',
      slideOutToRight: 'slide-out-to-right 0.3s ease-in',
      slideOutToBottom: 'slide-out-to-bottom 0.3s ease-in',
      slideOutToLeft: 'slide-out-to-left 0.3s ease-in',
    },
  };
}

/**
 * Create complete depth tokens for z-index management
 */
function createDepthTokens(): DepthTokens {
  return {
    negative: -1,
    base: 0,
    low: 10,
    menu: 50,
    navigation: 100,
    overlay: 500,
    modal: 1000,
    toast: 2000,
    tooltip: 3000,
    top: 9999,
  };
}

/**
 * Create complete breakpoint tokens for responsive design
 */
function createBreakpointTokens(): BreakpointTokens {
  return {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  };
}

/**
 * Create component tokens based on color and element tokens
 */
function createComponentTokens(colors: ColorTokens, borders: BorderTokens): ComponentTokens {
  // This is a simplified version - a real implementation would be more comprehensive
  // and would reference the color and border tokens
  return {
    button: {
      size: {
        sm: {
          fontSize: '0.875rem',
          padding: '0.5rem 1rem',
          height: '2rem',
          minWidth: '4rem',
          iconSize: '0.875rem',
        },
        md: {
          fontSize: '1rem',
          padding: '0.75rem 1.5rem',
          height: '2.5rem',
          minWidth: '5rem',
          iconSize: '1rem',
        },
        lg: {
          fontSize: '1.125rem',
          padding: '1rem 2rem',
          height: '3rem',
          minWidth: '6rem',
          iconSize: '1.25rem',
        },
      },
      
      variant: {
        primary: {
          background: colors.primary.DEFAULT,
          color: colors.primary.contrast,
          border: 'none',
          hoverBackground: colors.primary.dark,
          hoverColor: colors.primary.contrast,
          activeBackground: colors.primary.dark,
          focusRing: `0 0 0 3px ${colors.primary.light}`,
          disabledBackground: adjustColorLightness(colors.primary.DEFAULT, 40),
          disabledColor: colors.primary.contrast,
        },
        secondary: {
          background: colors.secondary.DEFAULT,
          color: colors.secondary.contrast,
          border: 'none',
          hoverBackground: colors.secondary.dark,
          hoverColor: colors.secondary.contrast,
          activeBackground: colors.secondary.dark,
          focusRing: `0 0 0 3px ${colors.secondary.light}`,
          disabledBackground: adjustColorLightness(colors.secondary.DEFAULT, 40),
          disabledColor: colors.secondary.contrast,
        },
        outline: {
          background: 'transparent',
          color: colors.primary.DEFAULT,
          border: `${borders.width.thin} solid ${colors.primary.DEFAULT}`,
          hoverBackground: adjustColorLightness(colors.primary.DEFAULT, 95),
          hoverColor: colors.primary.DEFAULT,
          activeBackground: adjustColorLightness(colors.primary.DEFAULT, 90),
          focusRing: `0 0 0 3px ${colors.primary.light}`,
          disabledBackground: 'transparent',
          disabledColor: colors.text.disabled,
        },
        ghost: {
          background: 'transparent',
          color: colors.primary.DEFAULT,
          border: 'none',
          hoverBackground: adjustColorLightness(colors.primary.DEFAULT, 95),
          hoverColor: colors.primary.DEFAULT,
          activeBackground: adjustColorLightness(colors.primary.DEFAULT, 90),
          focusRing: `0 0 0 3px ${colors.primary.light}`,
          disabledBackground: 'transparent',
          disabledColor: colors.text.disabled,
        },
        link: {
          background: 'transparent',
          color: colors.primary.DEFAULT,
          border: 'none',
          hoverBackground: 'transparent',
          hoverColor: colors.primary.dark,
          activeBackground: 'transparent',
          focusRing: 'none',
          disabledBackground: 'transparent',
          disabledColor: colors.text.disabled,
        },
        destructive: {
          background: colors.state.error.DEFAULT,
          color: colors.state.error.foreground,
          border: 'none',
          hoverBackground: adjustColorLightness(colors.state.error.DEFAULT, -10),
          hoverColor: colors.state.error.foreground,
          activeBackground: adjustColorLightness(colors.state.error.DEFAULT, -15),
          focusRing: `0 0 0 3px ${adjustColorLightness(colors.state.error.DEFAULT, 30)}`,
          disabledBackground: adjustColorLightness(colors.state.error.DEFAULT, 40),
          disabledColor: colors.state.error.foreground,
        },
      },
    },
    
    input: {
      size: {
        sm: {
          fontSize: '0.875rem',
          padding: '0.375rem 0.75rem',
          height: '2rem',
          iconSize: '0.875rem',
        },
        md: {
          fontSize: '1rem',
          padding: '0.5rem 1rem',
          height: '2.5rem',
          iconSize: '1rem',
        },
        lg: {
          fontSize: '1.125rem',
          padding: '0.75rem 1.25rem',
          height: '3rem',
          iconSize: '1.25rem',
        },
      },
      
      background: colors.background.DEFAULT,
      color: colors.text.DEFAULT,
      placeholderColor: colors.text.tertiary,
      borderColor: colors.border.DEFAULT,
      borderColorFocus: colors.primary.DEFAULT,
      borderColorHover: colors.border.strong,
      borderColorError: colors.state.error.DEFAULT,
      borderWidth: borders.width.thin,
      borderRadius: borders.radius.DEFAULT,
      boxShadow: 'none',
      boxShadowFocus: `0 0 0 2px ${adjustColorLightness(colors.primary.DEFAULT, 30)}`,
      boxShadowError: `0 0 0 2px ${adjustColorLightness(colors.state.error.DEFAULT, 30)}`,
      
      error: {
        background: colors.state.error.background,
        borderColor: colors.state.error.DEFAULT,
        color: colors.text.DEFAULT,
        boxShadow: `0 0 0 2px ${adjustColorLightness(colors.state.error.DEFAULT, 30)}`,
      },
      disabled: {
        background: adjustColorLightness(colors.background.DEFAULT, -3),
        borderColor: colors.border.disabled,
        color: colors.text.disabled,
        opacity: '0.7',
      },
      readOnly: {
        background: adjustColorLightness(colors.background.DEFAULT, -3),
        borderColor: colors.border.light,
        color: colors.text.DEFAULT,
      },
    },
    
    card: {
      variant: {
        default: {
          background: colors.background.surface,
          borderColor: colors.border.DEFAULT,
          borderWidth: borders.width.thin,
          borderRadius: borders.radius.DEFAULT,
          boxShadow: 'none',
          padding: '1.5rem',
        },
        flat: {
          background: colors.background.DEFAULT,
          borderColor: colors.border.DEFAULT,
          borderWidth: borders.width.thin,
          borderRadius: borders.radius.DEFAULT,
          boxShadow: 'none',
          padding: '1.5rem',
        },
        elevated: {
          background: colors.background.elevated,
          borderColor: 'transparent',
          borderWidth: '0',
          borderRadius: borders.radius.DEFAULT,
          boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)`,
          padding: '1.5rem',
        },
        outlined: {
          background: 'transparent',
          borderColor: colors.border.DEFAULT,
          borderWidth: borders.width.thin,
          borderRadius: borders.radius.DEFAULT,
          boxShadow: 'none',
          padding: '1.5rem',
        },
      },
      
      header: {
        background: 'transparent',
        padding: '1.5rem',
        borderBottomWidth: borders.width.thin,
        borderBottomColor: colors.border.light,
      },
      body: {
        padding: '1.5rem',
      },
      footer: {
        background: 'transparent',
        padding: '1.5rem',
        borderTopWidth: borders.width.thin,
        borderTopColor: colors.border.light,
      },
    },
    
    modal: {
      background: colors.background.elevated,
      borderRadius: borders.radius.lg,
      boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25)`,
      overlay: {
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      },
      header: {
        padding: '1.5rem',
        borderBottomWidth: borders.width.thin,
        borderBottomColor: colors.border.light,
      },
      body: {
        padding: '1.5rem',
      },
      footer: {
        padding: '1.5rem',
        borderTopWidth: borders.width.thin,
        borderTopColor: colors.border.light,
      },
    },
    
    alert: {
      borderRadius: borders.radius.DEFAULT,
      padding: '1rem',
      
      variant: {
        info: {
          background: colors.state.info.background,
          borderColor: colors.state.info.DEFAULT,
          color: colors.text.DEFAULT,
          iconColor: colors.state.info.DEFAULT,
        },
        success: {
          background: colors.state.success.background,
          borderColor: colors.state.success.DEFAULT,
          color: colors.text.DEFAULT,
          iconColor: colors.state.success.DEFAULT,
        },
        warning: {
          background: colors.state.warning.background,
          borderColor: colors.state.warning.DEFAULT,
          color: colors.text.DEFAULT,
          iconColor: colors.state.warning.DEFAULT,
        },
        error: {
          background: colors.state.error.background,
          borderColor: colors.state.error.DEFAULT,
          color: colors.text.DEFAULT,
          iconColor: colors.state.error.DEFAULT,
        },
      },
    },
    
    badge: {
      borderRadius: borders.radius.full,
      fontSize: '0.75rem',
      fontWeight: '500',
      
      size: {
        sm: {
          fontSize: '0.6875rem',
          padding: '0.125rem 0.375rem',
          height: '1.25rem',
        },
        md: {
          fontSize: '0.75rem',
          padding: '0.15rem 0.5rem',
          height: '1.5rem',
        },
        lg: {
          fontSize: '0.875rem',
          padding: '0.25rem 0.75rem',
          height: '1.75rem',
        },
      },
      
      variant: {
        default: {
          background: colors.background.elevated,
          color: colors.text.DEFAULT,
        },
        primary: {
          background: colors.primary.DEFAULT,
          color: colors.primary.contrast,
        },
        secondary: {
          background: colors.secondary.DEFAULT,
          color: colors.secondary.contrast,
        },
        outline: {
          background: 'transparent',
          borderColor: colors.border.DEFAULT,
          color: colors.text.DEFAULT,
        },
        success: {
          background: colors.state.success.DEFAULT,
          color: colors.state.success.foreground,
        },
        warning: {
          background: colors.state.warning.DEFAULT,
          color: colors.state.warning.foreground,
        },
        error: {
          background: colors.state.error.DEFAULT,
          color: colors.state.error.foreground,
        },
      },
    },
  };
}

/**
 * Create layout tokens
 */
function createLayoutTokens(): LayoutTokens {
  return {
    container: {
      maxWidth: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
      padding: {
        sm: '1rem',
        md: '2rem',
        lg: '4rem',
      },
    },
    
    grid: {
      columns: 12,
      gap: {
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
      },
    },
    
    section: {
      padding: {
        sm: '2rem',
        md: '4rem',
        lg: '6rem',
      },
      margin: {
        sm: '2rem',
        md: '4rem',
        lg: '6rem',
      },
    },
    
    header: {
      height: {
        sm: '3.5rem',
        md: '4rem',
        lg: '5rem',
      },
      padding: '0 2rem',
      background: 'var(--colors-background-DEFAULT)',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      zIndex: 100,
    },
    
    sidebar: {
      width: {
        compact: '4rem',
        default: '16rem',
        expanded: '20rem',
      },
      background: 'var(--colors-background-surface)',
      boxShadow: '1px 0 3px 0 rgba(0, 0, 0, 0.05)',
      zIndex: 90,
    },
    
    footer: {
      padding: '2rem',
      background: 'var(--colors-background-surface)',
    },
  };
}

/**
 * Helper function to adjust color lightness
 * This is a placeholder - would need a proper color manipulation library
 */
function adjustColorLightness(color: string, amount: number): string {
  // This is a simplified implementation
  // In a real project, use a proper color library like chroma.js or colord
  return color;
}

/**
 * Get a contrasting color (black or white) based on background
 * This is a placeholder - would need a proper color contrast library
 */
function getContrastColor(backgroundColor: string): string {
  // Simplified version - would use proper contrast calculations in real implementation
  // For now we'll assume light backgrounds get dark text and vice versa
  const isLight = backgroundColor.match(/#[a-f0-9]{2}[a-f0-9]{2}[a-f0-9]{2}/i)
    ? parseInt(backgroundColor.substring(1), 16) > 0xffffff / 2
    : true;
    
  return isLight ? '#111827' : '#ffffff';
}

/**
 * Create complete design tokens from a primary color
 */
export function createTokensFromPrimaryColor(
  primaryColor: string,
  options: {
    variant?: ThemeVariant;
    secondaryColor?: string;
    accentColor?: string;
    borderRadius?: number;
    fontFamily?: {
      heading?: string;
      body?: string;
      mono?: string;
    };
    shadowIntensity?: 'soft' | 'medium' | 'sharp';
    animationSpeed?: 'fast' | 'normal' | 'slow';
  } = {}
): DesignTokens {
  // Generate secondary and accent colors if not provided
  const secondaryColor = options.secondaryColor || 
    adjustColorLightness(primaryColor, 20); // Lighter version of primary
    
  const accentColor = options.accentColor ||
    adjustColorLightness(primaryColor, -30); // Darker version of primary
  
  // Create color tokens
  const colorTokens = createColorTokens({
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
    neutral: '#71717a', // Default neutral color
  });
  
  // Create border tokens with custom radius
  const borderTokens = createBorderTokens(options.borderRadius);
  
  // Create all token categories
  const tokens: DesignTokens = {
    colors: colorTokens,
    typography: createTypographyTokens(options.fontFamily),
    spacing: createSpacingTokens(),
    borders: borderTokens,
    shadows: createShadowTokens(options.shadowIntensity),
    animation: createAnimationTokens(options.animationSpeed),
    depth: createDepthTokens(),
    breakpoints: createBreakpointTokens(),
    components: createComponentTokens(colorTokens, borderTokens),
    layout: createLayoutTokens(),
  };
  
  return tokens;
}

/**
 * Create complete design tokens from a color palette
 */
export function createTokensFromPalette(
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    neutral?: string;
    background?: string;
    text?: string;
  },
  options: {
    variant?: ThemeVariant;
    borderRadius?: number;
    fontFamily?: {
      heading?: string;
      body?: string;
      mono?: string;
    };
    shadowIntensity?: 'soft' | 'medium' | 'sharp';
    animationSpeed?: 'fast' | 'normal' | 'slow';
  } = {}
): DesignTokens {
  // Create color tokens from palette
  const colorTokens = createColorTokens({
    ...palette,
    neutral: palette.neutral || '#71717a',
  });
  
  // Create border tokens with custom radius
  const borderTokens = createBorderTokens(options.borderRadius);
  
  // Create all token categories
  const tokens: DesignTokens = {
    colors: colorTokens,
    typography: createTypographyTokens(options.fontFamily),
    spacing: createSpacingTokens(),
    borders: borderTokens,
    shadows: createShadowTokens(options.shadowIntensity),
    animation: createAnimationTokens(options.animationSpeed),
    depth: createDepthTokens(),
    breakpoints: createBreakpointTokens(),
    components: createComponentTokens(colorTokens, borderTokens),
    layout: createLayoutTokens(),
  };
  
  return tokens;
}

/**
 * Create a theme with metadata and tokens
 */
export function createTheme(
  metadata: Partial<ThemeMetadata>,
  tokens: DesignTokens
): Theme {
  // Generate a UUID for the theme ID if not provided
  const id = metadata.id || `theme-${Date.now()}`;
  
  // Create default metadata
  const defaultMetadata: ThemeMetadata = {
    id,
    name: metadata.name || 'Untitled Theme',
    description: metadata.description || 'A custom theme',
    author: metadata.author || 'System',
    version: metadata.version || '1.0.0',
    createdAt: metadata.createdAt || new Date().toISOString(),
    updatedAt: metadata.updatedAt || new Date().toISOString(),
    thumbnail: metadata.thumbnail,
    tags: metadata.tags || [],
    industry: metadata.industry,
    featured: metadata.featured || false,
    baseTheme: metadata.baseTheme,
  };
  
  return {
    metadata: defaultMetadata,
    tokens,
  };
}

/**
 * Create a theme directly from a primary color and options
 */
export function createThemeFromColor(
  primaryColor: string,
  metadata: Partial<ThemeMetadata>,
  options?: Parameters<typeof createTokensFromPrimaryColor>[1]
): Theme {
  const tokens = createTokensFromPrimaryColor(primaryColor, options);
  return createTheme(metadata, tokens);
}

/**
 * Create a theme directly from a palette and options
 */
export function createThemeFromPalette(
  palette: Parameters<typeof createTokensFromPalette>[0],
  metadata: Partial<ThemeMetadata>,
  options?: Parameters<typeof createTokensFromPalette>[1]
): Theme {
  const tokens = createTokensFromPalette(palette, options);
  return createTheme(metadata, tokens);
}

/**
 * Create a theme from one of the predefined color palettes
 */
export function createThemeFromPredefinedPalette(
  paletteName: keyof typeof colorPalettes,
  metadata: Partial<ThemeMetadata>,
  options?: Parameters<typeof createTokensFromPalette>[1]
): Theme {
  const palette = colorPalettes[paletteName];
  return createThemeFromPalette(palette, metadata, options);
}

/**
 * Extend an existing theme with overrides
 */
export function extendTheme(base: Theme, overrides: Partial<DesignTokens>, metadata?: Partial<ThemeMetadata>): Theme {
  const newTokens = deepMerge(base.tokens, overrides);
  
  const newMetadata: ThemeMetadata = {
    ...base.metadata,
    id: `${base.metadata.id}-extended`,
    name: `${base.metadata.name} Extended`,
    description: `Extended version of ${base.metadata.name}`,
    baseTheme: base.metadata.id,
    updatedAt: new Date().toISOString(),
    ...metadata,
  };
  
  return {
    metadata: newMetadata,
    tokens: newTokens,
  };
}

/**
 * Extract tokens from an element
 * This is useful for "sampling" a theme from a website
 */
export function extractTokensFromElement(element: HTMLElement): Partial<DesignTokens> {
  if (typeof window === 'undefined') {
    throw new Error('extractTokensFromElement can only be used in browser environments');
  }
  
  const computedStyle = window.getComputedStyle(element);
  
  // Extract colors
  const extractedColors: Partial<ColorTokens> = {
    primary: {
      DEFAULT: computedStyle.getPropertyValue('--colors-primary') || computedStyle.color,
      light: computedStyle.getPropertyValue('--colors-primary-light') || '',
      dark: computedStyle.getPropertyValue('--colors-primary-dark') || '',
      contrast: computedStyle.getPropertyValue('--colors-primary-contrast') || '',
    },
    background: {
      DEFAULT: computedStyle.backgroundColor,
      surface: computedStyle.getPropertyValue('--colors-background-surface') || '',
    },
    text: {
      DEFAULT: computedStyle.color,
      secondary: computedStyle.getPropertyValue('--colors-text-secondary') || '',
    },
  };
  
  // Extract typography
  const extractedTypography: Partial<TypographyTokens> = {
    fontFamily: {
      body: computedStyle.fontFamily,
      heading: computedStyle.getPropertyValue('--typography-fontFamily-heading') || computedStyle.fontFamily,
      mono: computedStyle.getPropertyValue('--typography-fontFamily-mono') || '',
      special: computedStyle.getPropertyValue('--typography-fontFamily-special') || '',
    },
    fontSize: {
      base: computedStyle.fontSize,
    },
  };
  
  // Extract borders
  const extractedBorders: Partial<BorderTokens> = {
    radius: {
      DEFAULT: computedStyle.borderRadius,
    },
    width: {
      DEFAULT: computedStyle.borderWidth,
    },
  };
  
  return {
    colors: extractedColors,
    typography: extractedTypography,
    borders: extractedBorders,
  };
}