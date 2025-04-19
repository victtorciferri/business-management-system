/**
 * Component Variants System - 2025 Edition
 * 
 * This system enables flexible component variants for theming,
 * allowing components to have different styles based on size, intent,
 * or other variants while respecting the theme tokens.
 */

import { cssVar } from './themeUtils';

// Type to define the available variants for a component
export type ComponentVariants<TVariants extends string, TSizes extends string> = {
  variant?: TVariants;
  size?: TSizes;
  className?: string;
};

// Type for the styling result of a component variant
export type VariantStyle = {
  className: string;
  style?: React.CSSProperties;
};

// Type for a map of size variants for a component
export type SizeVariantMap<TSizes extends string> = {
  [size in TSizes]: VariantStyle;
};

// Type for a map of appearance variants for a component
export type AppearanceVariantMap<TVariants extends string, TSizes extends string> = {
  [variant in TVariants]: {
    base: VariantStyle;
    sizes: SizeVariantMap<TSizes>;
  };
};

/**
 * Create styles for a component with variants
 * 
 * @param map The variant map defining styles for each variant and size
 * @param props Props containing variant, size, and className
 * @returns Combined styles for the component
 */
export function createVariantStyles<TVariants extends string, TSizes extends string>(
  map: AppearanceVariantMap<TVariants, TSizes>,
  props: ComponentVariants<TVariants, TSizes>
): VariantStyle {
  const { variant = 'primary' as TVariants, size = 'md' as TSizes, className = '' } = props;
  
  // Get the variant settings
  const variantSettings = map[variant];
  
  if (!variantSettings) {
    console.warn(`Variant "${variant}" not found, falling back to "primary"`);
    return createVariantStyles(map, { ...props, variant: 'primary' as TVariants });
  }
  
  // Get the base and size-specific styles
  const baseStyles = variantSettings.base;
  const sizeStyles = variantSettings.sizes[size];
  
  if (!sizeStyles) {
    console.warn(`Size "${size}" not found for variant "${variant}", falling back to "md"`);
    return createVariantStyles(map, { ...props, size: 'md' as TSizes });
  }
  
  // Merge styles and classes
  return {
    className: `${baseStyles.className} ${sizeStyles.className} ${className}`.trim(),
    style: {
      ...(baseStyles.style || {}),
      ...(sizeStyles.style || {}),
    },
  };
}

/**
 * Utility function to generate button variant styles
 * @returns A map of button variants with their corresponding styles
 */
export function createButtonVariants() {
  // Define the available button variants and sizes
  type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
  
  // Create the style map for buttons
  const buttonVariants: AppearanceVariantMap<ButtonVariant, ButtonSize> = {
    primary: {
      base: {
        className: 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        style: {
          backgroundColor: cssVar('colors.primary.base'),
          color: cssVar('colors.primary.foreground'),
          '--focus-ring-color': cssVar('colors.primary.focus'),
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'text-xs px-3 py-1',
        },
        md: {
          className: 'text-sm px-4 py-2',
        },
        lg: {
          className: 'text-base px-5 py-2.5',
        },
        xl: {
          className: 'text-lg px-6 py-3',
        },
      },
    },
    secondary: {
      base: {
        className: 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        style: {
          backgroundColor: cssVar('colors.secondary.base'),
          color: cssVar('colors.secondary.foreground'),
          '--focus-ring-color': cssVar('colors.secondary.focus'),
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'text-xs px-3 py-1',
        },
        md: {
          className: 'text-sm px-4 py-2',
        },
        lg: {
          className: 'text-base px-5 py-2.5',
        },
        xl: {
          className: 'text-lg px-6 py-3',
        },
      },
    },
    outline: {
      base: {
        className: 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 border',
        style: {
          backgroundColor: 'transparent',
          borderColor: cssVar('colors.border.base'),
          color: cssVar('colors.background.foreground'),
          '--focus-ring-color': cssVar('colors.primary.focus'),
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'text-xs px-3 py-1',
        },
        md: {
          className: 'text-sm px-4 py-2',
        },
        lg: {
          className: 'text-base px-5 py-2.5',
        },
        xl: {
          className: 'text-lg px-6 py-3',
        },
      },
    },
    ghost: {
      base: {
        className: 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2',
        style: {
          backgroundColor: 'transparent',
          color: cssVar('colors.background.foreground'),
          '--focus-ring-color': cssVar('colors.primary.focus'),
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'text-xs px-3 py-1',
        },
        md: {
          className: 'text-sm px-4 py-2',
        },
        lg: {
          className: 'text-base px-5 py-2.5',
        },
        xl: {
          className: 'text-lg px-6 py-3',
        },
      },
    },
    destructive: {
      base: {
        className: 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        style: {
          backgroundColor: cssVar('colors.error.base'),
          color: 'white',
          '--focus-ring-color': cssVar('colors.error.focus'),
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'text-xs px-3 py-1',
        },
        md: {
          className: 'text-sm px-4 py-2',
        },
        lg: {
          className: 'text-base px-5 py-2.5',
        },
        xl: {
          className: 'text-lg px-6 py-3',
        },
      },
    },
    link: {
      base: {
        className: 'inline-flex items-center justify-center font-medium rounded-none p-0 transition-colors underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2',
        style: {
          backgroundColor: 'transparent',
          color: cssVar('colors.primary.base'),
          '--focus-ring-color': cssVar('colors.primary.focus'),
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'text-xs',
        },
        md: {
          className: 'text-sm',
        },
        lg: {
          className: 'text-base',
        },
        xl: {
          className: 'text-lg',
        },
      },
    },
  };
  
  return buttonVariants;
}

/**
 * Utility function to generate card variant styles
 * @returns A map of card variants with their corresponding styles
 */
export function createCardVariants() {
  // Define the available card variants and sizes
  type CardVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'flat';
  type CardSize = 'sm' | 'md' | 'lg';
  
  // Create the style map for cards
  const cardVariants: AppearanceVariantMap<CardVariant, CardSize> = {
    default: {
      base: {
        className: 'rounded-md border shadow-sm',
        style: {
          backgroundColor: cssVar('colors.background.base'),
          borderColor: cssVar('colors.border.base'),
          color: cssVar('colors.background.foreground'),
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'p-3',
        },
        md: {
          className: 'p-5',
        },
        lg: {
          className: 'p-7',
        },
      },
    },
    primary: {
      base: {
        className: 'rounded-md shadow-sm',
        style: {
          backgroundColor: cssVar('colors.primary.subtle'),
          borderColor: cssVar('colors.primary.base'),
          color: cssVar('colors.background.foreground'),
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'p-3 border-l-4',
        },
        md: {
          className: 'p-5 border-l-4',
        },
        lg: {
          className: 'p-7 border-l-4',
        },
      },
    },
    secondary: {
      base: {
        className: 'rounded-md shadow-sm',
        style: {
          backgroundColor: cssVar('colors.secondary.subtle'),
          borderColor: cssVar('colors.secondary.base'),
          color: cssVar('colors.background.foreground'),
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'p-3 border-l-4',
        },
        md: {
          className: 'p-5 border-l-4',
        },
        lg: {
          className: 'p-7 border-l-4',
        },
      },
    },
    outline: {
      base: {
        className: 'rounded-md border',
        style: {
          backgroundColor: 'transparent',
          borderColor: cssVar('colors.border.base'),
          color: cssVar('colors.background.foreground'),
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'p-3',
        },
        md: {
          className: 'p-5',
        },
        lg: {
          className: 'p-7',
        },
      },
    },
    flat: {
      base: {
        className: 'rounded-md',
        style: {
          backgroundColor: cssVar('colors.background.subtle'),
          color: cssVar('colors.background.foreground'),
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'p-3',
        },
        md: {
          className: 'p-5',
        },
        lg: {
          className: 'p-7',
        },
      },
    },
  };
  
  return cardVariants;
}

/**
 * Utility function to generate input variant styles
 * @returns A map of input variants with their corresponding styles
 */
export function createInputVariants() {
  // Define the available input variants and sizes
  type InputVariant = 'default' | 'filled' | 'outline' | 'underlined';
  type InputSize = 'sm' | 'md' | 'lg';
  
  // Create the style map for inputs
  const inputVariants: AppearanceVariantMap<InputVariant, InputSize> = {
    default: {
      base: {
        className: 'flex border rounded-md px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        style: {
          backgroundColor: cssVar('colors.background.base'),
          borderColor: cssVar('colors.border.base'),
          color: cssVar('colors.background.foreground'),
          '--focus-ring-color': cssVar('colors.primary.focus'),
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'h-8 text-xs px-2',
        },
        md: {
          className: 'h-10 text-sm px-3',
        },
        lg: {
          className: 'h-12 text-base px-4',
        },
      },
    },
    filled: {
      base: {
        className: 'flex rounded-md px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        style: {
          backgroundColor: cssVar('colors.background.subtle'),
          borderColor: 'transparent',
          color: cssVar('colors.background.foreground'),
          '--focus-ring-color': cssVar('colors.primary.focus'),
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'h-8 text-xs px-2',
        },
        md: {
          className: 'h-10 text-sm px-3',
        },
        lg: {
          className: 'h-12 text-base px-4',
        },
      },
    },
    outline: {
      base: {
        className: 'flex border-2 rounded-md px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        style: {
          backgroundColor: 'transparent',
          borderColor: cssVar('colors.border.base'),
          color: cssVar('colors.background.foreground'),
          '--focus-ring-color': cssVar('colors.primary.focus'),
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'h-8 text-xs px-2',
        },
        md: {
          className: 'h-10 text-sm px-3',
        },
        lg: {
          className: 'h-12 text-base px-4',
        },
      },
    },
    underlined: {
      base: {
        className: 'flex border-b px-0 py-2 text-sm ring-offset-background rounded-none focus-visible:outline-none focus-visible:ring-0 focus-visible:border-b-2 disabled:cursor-not-allowed disabled:opacity-50',
        style: {
          backgroundColor: 'transparent',
          borderColor: cssVar('colors.border.base'),
          color: cssVar('colors.background.foreground'),
          '--focus-border-color': cssVar('colors.primary.base'),
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'h-8 text-xs',
        },
        md: {
          className: 'h-10 text-sm',
        },
        lg: {
          className: 'h-12 text-base',
        },
      },
    },
  };
  
  return inputVariants;
}

/**
 * Utility function to generate badge variant styles
 * @returns A map of badge variants with their corresponding styles
 */
export function createBadgeVariants() {
  // Define the available badge variants and sizes
  type BadgeVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'error' | 'info';
  type BadgeSize = 'sm' | 'md' | 'lg';
  
  // Create the style map for badges
  const badgeVariants: AppearanceVariantMap<BadgeVariant, BadgeSize> = {
    default: {
      base: {
        className: 'inline-flex items-center rounded-full font-medium',
        style: {
          backgroundColor: cssVar('colors.background.subtle'),
          color: cssVar('colors.background.foreground'),
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'text-xs px-2 py-0.5',
        },
        md: {
          className: 'text-xs px-2.5 py-0.5',
        },
        lg: {
          className: 'text-sm px-3 py-1',
        },
      },
    },
    primary: {
      base: {
        className: 'inline-flex items-center rounded-full font-medium',
        style: {
          backgroundColor: cssVar('colors.primary.base'),
          color: cssVar('colors.primary.foreground'),
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'text-xs px-2 py-0.5',
        },
        md: {
          className: 'text-xs px-2.5 py-0.5',
        },
        lg: {
          className: 'text-sm px-3 py-1',
        },
      },
    },
    secondary: {
      base: {
        className: 'inline-flex items-center rounded-full font-medium',
        style: {
          backgroundColor: cssVar('colors.secondary.base'),
          color: cssVar('colors.secondary.foreground'),
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'text-xs px-2 py-0.5',
        },
        md: {
          className: 'text-xs px-2.5 py-0.5',
        },
        lg: {
          className: 'text-sm px-3 py-1',
        },
      },
    },
    outline: {
      base: {
        className: 'inline-flex items-center rounded-full font-medium border',
        style: {
          backgroundColor: 'transparent',
          borderColor: cssVar('colors.border.base'),
          color: cssVar('colors.background.foreground'),
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'text-xs px-2 py-0.5',
        },
        md: {
          className: 'text-xs px-2.5 py-0.5',
        },
        lg: {
          className: 'text-sm px-3 py-1',
        },
      },
    },
    success: {
      base: {
        className: 'inline-flex items-center rounded-full font-medium',
        style: {
          backgroundColor: cssVar('colors.success.base'),
          color: 'white',
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'text-xs px-2 py-0.5',
        },
        md: {
          className: 'text-xs px-2.5 py-0.5',
        },
        lg: {
          className: 'text-sm px-3 py-1',
        },
      },
    },
    warning: {
      base: {
        className: 'inline-flex items-center rounded-full font-medium',
        style: {
          backgroundColor: cssVar('colors.warning.base'),
          color: 'white',
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'text-xs px-2 py-0.5',
        },
        md: {
          className: 'text-xs px-2.5 py-0.5',
        },
        lg: {
          className: 'text-sm px-3 py-1',
        },
      },
    },
    error: {
      base: {
        className: 'inline-flex items-center rounded-full font-medium',
        style: {
          backgroundColor: cssVar('colors.error.base'),
          color: 'white',
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'text-xs px-2 py-0.5',
        },
        md: {
          className: 'text-xs px-2.5 py-0.5',
        },
        lg: {
          className: 'text-sm px-3 py-1',
        },
      },
    },
    info: {
      base: {
        className: 'inline-flex items-center rounded-full font-medium',
        style: {
          backgroundColor: cssVar('colors.info.base'),
          color: 'white',
        } as React.CSSProperties,
      },
      sizes: {
        sm: {
          className: 'text-xs px-2 py-0.5',
        },
        md: {
          className: 'text-xs px-2.5 py-0.5',
        },
        lg: {
          className: 'text-sm px-3 py-1',
        },
      },
    },
  };
  
  return badgeVariants;
}