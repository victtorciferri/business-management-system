import React from 'react';
import { useBusinessTheme } from '@/hooks/useBusinessTheme';
import { useColorMode } from '@/hooks/useColorMode';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Card variants using class-variance-authority
 * These adapt to the current theme automatically through CSS variables
 */
const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-md",
        outlined: "border-2",
        flat: "shadow-none",
        interactive: "hover:shadow-md transition-shadow cursor-pointer",
      },
      padding: {
        none: "",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

/**
 * Card component props 
 */
export interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  as?: React.ElementType;
}

/**
 * Theme-aware Card component
 * 
 * This component automatically adapts to the current theme and supports
 * different visual treatments for cards.
 * 
 * @example
 * ```tsx
 * <Card>Default Card</Card>
 * <Card variant="elevated">Elevated Card</Card>
 * <Card variant="outlined" padding="lg">Large Outlined Card</Card>
 * ```
 */
export function ThemeAwareCard({
  className,
  variant,
  padding,
  as: Component = 'div',
  children,
  ...props
}: CardProps) {
  const { theme } = useBusinessTheme();
  const { colorMode } = useColorMode();
  
  // Get component-specific tokens if they exist
  const cardTokens = theme?.tokens?.components?.card || {};
  
  // Apply any business-specific card styles
  const customStyles: React.CSSProperties = {};
  
  // Apply business-specific card styles based on variant
  if (variant && cardTokens[variant]) {
    const variantTokens = cardTokens[variant];
    
    // Apply dark mode specific styles if available
    if (colorMode === 'dark' && variantTokens.dark) {
      Object.assign(customStyles, variantTokens.dark);
    } else if (variantTokens.light) {
      Object.assign(customStyles, variantTokens.light);
    }
  }
  
  return (
    <Component
      className={cn(cardVariants({ variant, padding, className }))}
      style={customStyles}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * Card header component
 */
export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

/**
 * Card title component
 */
export function CardTitle({
  className,
  as: Component = 'h3',
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & {
  as?: React.ElementType;
}) {
  return (
    <Component
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

/**
 * Card description component
 */
export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

/**
 * Card content component
 */
export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props} />
  );
}

/**
 * Card footer component
 */
export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  );
}

/**
 * Usage example for the ThemeAwareCard
 */
export function CardExample() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Card Variants</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ThemeAwareCard>
          <CardHeader>
            <CardTitle>Default Card</CardTitle>
            <CardDescription>This is a default card with standard styling</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here. This card uses the default variant.</p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">Last updated: April 2025</p>
          </CardFooter>
        </ThemeAwareCard>
        
        <ThemeAwareCard variant="elevated">
          <CardHeader>
            <CardTitle>Elevated Card</CardTitle>
            <CardDescription>This card has increased elevation</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This card stands out with additional shadow depth.</p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">Last updated: April 2025</p>
          </CardFooter>
        </ThemeAwareCard>
        
        <ThemeAwareCard variant="outlined">
          <CardHeader>
            <CardTitle>Outlined Card</CardTitle>
            <CardDescription>This card has a stronger border</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This card emphasizes its border rather than shadow.</p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">Last updated: April 2025</p>
          </CardFooter>
        </ThemeAwareCard>
        
        <ThemeAwareCard variant="flat" padding="lg">
          <CardTitle>Flat Card with Large Padding</CardTitle>
          <p className="mt-4">This card has no shadow and larger padding for a more spacious layout.</p>
        </ThemeAwareCard>
        
        <ThemeAwareCard variant="interactive" padding="md">
          <CardHeader>
            <CardTitle>Interactive Card</CardTitle>
            <CardDescription>This card responds to hover</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Hover over this card to see the interaction effect.</p>
          </CardContent>
        </ThemeAwareCard>
        
        <ThemeAwareCard padding="none" className="overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1546768292-fb12f6c92568?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhdXRpZnVsJTIwbGFuZHNjYXBlc3xlbnwwfHwwfHx8MA%3D%3D" 
            alt="Landscape" 
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="text-xl font-bold">Card with No Padding</h3>
            <p className="mt-2">This card has no internal padding, allowing content like images to extend to the edges.</p>
          </div>
        </ThemeAwareCard>
      </div>
    </div>
  );
}