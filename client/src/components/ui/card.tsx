import * as React from "react"

import { cn } from "@/lib/utils"
import { useCardTheme } from "@/components/theme/componentHooks"
import { useTheme } from "../../providers/ThemeProvider"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'flat'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    // Use the card theme hook to get component-specific tokens
    const cardTheme = useCardTheme();
    const { getVariableRef } = useTheme();
    
    // Map variants to class names
    const variantClasses = {
      default: "border shadow-sm",
      elevated: "border-0 shadow-md",
      outlined: "border shadow-none",
      flat: "border-0 shadow-none bg-transparent"
    };
    
    // Apply dynamic style attributes based on theme tokens
    const dynamicStyle = {
      /* Set dynamic CSS styles for runtime theme control */
      "--card-border-radius": getVariableRef("borders.radius.DEFAULT", cardTheme.borderRadius),
      "--card-border-color": getVariableRef("colors.border", cardTheme.borderColor),
      "--card-background": getVariableRef("colors.card", cardTheme.background),
      "--card-text-color": getVariableRef("colors.card-foreground", cardTheme.foreground),
      "--card-shadow": getVariableRef("shadows.sm", cardTheme.shadow),
    } as React.CSSProperties;
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg bg-card text-card-foreground",
          variantClasses[variant as keyof typeof variantClasses] || variantClasses.default,
          className
        )}
        style={dynamicStyle}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  // Use the card theme hook
  const cardTheme = useCardTheme();
  
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      style={{ padding: cardTheme.padding }}
      {...props}
    />
  )
})
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  // Use the card theme hook
  const cardTheme = useCardTheme();
  
  return (
    <div 
      ref={ref} 
      className={cn("p-6 pt-0", className)} 
      style={{ padding: cardTheme.padding, paddingTop: 0 }}
      {...props} 
    />
  )
})
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  // Use the card theme hook
  const cardTheme = useCardTheme();
  
  return (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      style={{ padding: cardTheme.padding, paddingTop: 0 }}
      {...props}
    />
  )
})
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
