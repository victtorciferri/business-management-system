import React from 'react';
import { useBusinessTheme } from '@/hooks/useBusinessTheme';
import { useColorMode } from '@/hooks/useColorMode';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button variants using class-variance-authority
 * These adapt to the current theme automatically through CSS variables
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 rounded-md text-xs",
        lg: "h-12 px-8 rounded-md text-lg",
        icon: "h-10 w-10 rounded-full p-0",
      },
      highContrast: {
        true: "", // Applied through modifiers
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      highContrast: false,
    },
    compoundVariants: [
      {
        variant: "default",
        highContrast: true,
        className: "bg-primary-dark text-white border-2 border-white",
      },
      {
        variant: "destructive",
        highContrast: true,
        className: "bg-destructive-dark text-white border-2 border-white",
      },
    ],
  }
);

/**
 * Button component props
 */
export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

/**
 * Theme-aware Button component
 * 
 * This component automatically adapts to the current theme and supports
 * both light and dark modes, as well as high contrast accessibility mode.
 * 
 * @example
 * ```tsx
 * <Button>Default Button</Button>
 * <Button variant="destructive">Delete</Button>
 * <Button variant="outline" size="sm">Small Outline</Button>
 * <Button variant="ghost" highContrast={true}>High Contrast Ghost</Button>
 * ```
 */
export function ThemeAwareButton({
  className,
  variant,
  size,
  highContrast,
  asChild = false,
  loading = false,
  children,
  ...props
}: ButtonProps) {
  const { theme } = useBusinessTheme();
  const { colorMode } = useColorMode();
  
  // Get component-specific tokens if they exist
  const buttonTokens = theme?.tokens?.components?.button || {};
  
  // Apply any business-specific button styles
  const customStyles: React.CSSProperties = {};
  
  // Extract tokens based on variant
  if (variant && buttonTokens[variant]) {
    const variantTokens = buttonTokens[variant];
    
    // Apply dark mode specific styles if available
    if (colorMode === 'dark' && variantTokens.dark) {
      Object.assign(customStyles, variantTokens.dark);
    } else if (variantTokens.light) {
      Object.assign(customStyles, variantTokens.light);
    }
  }
  
  // Extract tokens based on size
  if (size && buttonTokens.sizes && buttonTokens.sizes[size]) {
    Object.assign(customStyles, buttonTokens.sizes[size]);
  }
  
  return (
    <button
      className={cn(
        buttonVariants({ variant, size, highContrast, className })
      )}
      style={customStyles}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Usage example for the ThemeAwareButton
 */
export function ButtonExample() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Button Variants</h2>
      
      <div className="flex flex-wrap gap-4">
        <ThemeAwareButton>Default Button</ThemeAwareButton>
        <ThemeAwareButton variant="secondary">Secondary</ThemeAwareButton>
        <ThemeAwareButton variant="destructive">Destructive</ThemeAwareButton>
        <ThemeAwareButton variant="outline">Outline</ThemeAwareButton>
        <ThemeAwareButton variant="ghost">Ghost</ThemeAwareButton>
        <ThemeAwareButton variant="link">Link</ThemeAwareButton>
      </div>
      
      <h2 className="text-2xl font-bold mt-8">Button Sizes</h2>
      
      <div className="flex flex-wrap items-center gap-4">
        <ThemeAwareButton size="sm">Small</ThemeAwareButton>
        <ThemeAwareButton size="default">Default</ThemeAwareButton>
        <ThemeAwareButton size="lg">Large</ThemeAwareButton>
        <ThemeAwareButton size="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </ThemeAwareButton>
      </div>
      
      <h2 className="text-2xl font-bold mt-8">Accessibility Variants</h2>
      
      <div className="flex flex-wrap gap-4">
        <ThemeAwareButton highContrast={true}>High Contrast</ThemeAwareButton>
        <ThemeAwareButton variant="destructive" highContrast={true}>
          High Contrast Destructive
        </ThemeAwareButton>
      </div>
      
      <h2 className="text-2xl font-bold mt-8">States</h2>
      
      <div className="flex flex-wrap gap-4">
        <ThemeAwareButton disabled>Disabled</ThemeAwareButton>
        <ThemeAwareButton loading>Loading</ThemeAwareButton>
      </div>
    </div>
  );
}