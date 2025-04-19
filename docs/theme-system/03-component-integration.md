# Component Integration Guide

## Overview

This guide explains how to integrate components with the theme system. It covers hooks, context usage, and best practices for creating theme-aware components.

## Hooks for Theme Consumption

The theme system provides several hooks for accessing theme data:

### 1. `useBusinessTheme`

This hook provides the current business theme based on the business context.

```tsx
import { useBusinessTheme } from '@/hooks/useBusinessTheme';

function MyComponent() {
  const { theme, businessId, businessSlug } = useBusinessTheme();
  
  // Access theme data
  const primaryColor = theme.tokens.colors.primary.DEFAULT;
  
  return (
    <div style={{ color: primaryColor }}>
      Using business theme for {businessSlug}
    </div>
  );
}
```

### 2. `useGlobalTheme`

This hook provides access to the global theme settings and defaults.

```tsx
import { useGlobalTheme } from '@/hooks/useGlobalTheme';

function MyComponent() {
  const { theme, settings, setSettings } = useGlobalTheme();
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setSettings({
      ...settings,
      mode: settings.mode === 'dark' ? 'light' : 'dark'
    });
  };
  
  return (
    <button onClick={toggleDarkMode}>
      Toggle {settings.mode === 'dark' ? 'Light' : 'Dark'} Mode
    </button>
  );
}
```

### 3. `useThemeVars`

This hook provides direct access to CSS variables based on the current theme.

```tsx
import { useThemeVars } from '@/hooks/useThemeVars';

function MyComponent() {
  const themeVars = useThemeVars();
  
  // Access specific CSS variables
  const primaryColorVar = themeVars['--theme-colors-primary-DEFAULT'];
  const spacing = themeVars['--theme-spacing-md'];
  
  return (
    <div style={{ 
      color: primaryColorVar,
      padding: spacing
    }}>
      Using theme CSS variables
    </div>
  );
}
```

### 4. `useColorMode`

This hook provides access to the current color mode (light/dark) and functions to change it.

```tsx
import { useColorMode } from '@/hooks/useColorMode';

function ThemeToggle() {
  const { colorMode, setColorMode, toggleColorMode } = useColorMode();
  
  return (
    <div>
      <p>Current mode: {colorMode}</p>
      <button onClick={() => setColorMode('light')}>Light</button>
      <button onClick={() => setColorMode('dark')}>Dark</button>
      <button onClick={toggleColorMode}>Toggle</button>
    </div>
  );
}
```

## Creating Theme-Aware Components

### Component Variants Architecture

The theme system supports a component variants architecture that extends design tokens for different component sizes, types, and appearances.

#### Example: Button Component with Variants

```tsx
import { useBusinessTheme } from '@/hooks/useBusinessTheme';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-sm",
        lg: "h-12 px-8 text-lg",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const { theme } = useBusinessTheme();
  // Business-specific customization could be applied here
  
  return (
    <button 
      className={cn(buttonVariants({ variant, size }), className)}
      {...props} 
    />
  );
}

export { Button, buttonVariants };
```

### Theme-Aware Variants

For more advanced theme-aware components, you can use component-specific tokens from the theme system:

```tsx
import { useBusinessTheme } from '@/hooks/useBusinessTheme';
import { cn } from '@/lib/utils';

interface VariantAwareButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function VariantAwareButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: VariantAwareButtonProps) {
  const { theme } = useBusinessTheme();
  const buttonTokens = theme.tokens.components.button || {};
  
  // Get variant-specific styles from theme if available
  const variantStyles = buttonTokens[variant] || {};
  const sizeStyles = buttonTokens.sizes?.[size] || {};
  
  const baseStyles = "rounded font-medium transition-colors focus:outline-none";
  
  // Apply variant and size specific styles
  const styles = {
    backgroundColor: variantStyles.background || '',
    color: variantStyles.color || '',
    borderRadius: sizeStyles.borderRadius || '',
    padding: sizeStyles.padding || '',
    fontSize: sizeStyles.fontSize || '',
    // ...add more styles as needed
  };
  
  return (
    <button 
      className={cn(baseStyles, className)}
      style={styles}
      {...props}
    >
      {children}
    </button>
  );
}
```

## Context Provider Integration

For components that need to provide theme data to their children:

```tsx
import { ThemeProvider } from '@/providers/ThemeProvider';
import { useBusinessTheme } from '@/hooks/useBusinessTheme';

function ThemedSection({ children }) {
  const { theme } = useBusinessTheme();
  
  // You could potentially override theme here for a specific section
  const sectionTheme = {
    ...theme,
    tokens: {
      ...theme.tokens,
      // Override specific tokens for this section
    }
  };
  
  return (
    <ThemeProvider theme={sectionTheme}>
      <div className="themed-section">
        {children}
      </div>
    </ThemeProvider>
  );
}
```

## CSS Variable Consumption

Components can also directly consume CSS variables:

```tsx
function CSSVarComponent() {
  return (
    <div className="p-md bg-background-surface text-foreground">
      <h2 className="text-primary text-2xl font-heading font-bold">
        CSS Variable Consumption
      </h2>
      <p className="mt-sm">
        This component uses CSS variables through Tailwind classes.
      </p>
      <div className="border border-border rounded-md shadow-md mt-md p-md">
        Styled content
      </div>
    </div>
  );
}
```

## Best Practices

1. **Use hooks for dynamic theme data**: Always use the provided hooks to access theme data rather than hardcoding values.

2. **Leverage the component variants pattern**: Use the class-variance-authority (cva) pattern for consistent variant handling.

3. **Respect theme hierarchy**:
   - Global theme provides defaults
   - Business theme overrides globals
   - Component-specific tokens override business theme

4. **Design for both light and dark modes**: Ensure your components look good in both light and dark modes.

5. **Handle theme loading states**: Consider adding skeleton states while theme data is loading.

6. **Use semantic token names**: Consume semantic tokens (e.g., `primary`, `secondary`) rather than specific colors.

7. **Implement responsive variants**: Make sure your components adapt to different screen sizes.

8. **Test across multiple themes**: Verify that your components work with different business themes.

9. **Maintain accessibility**: Ensure sufficient color contrast regardless of theme.