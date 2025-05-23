import * as React from "react"

import { cn } from "@/lib/utils"

// Omit the native 'size' attribute to allow our custom string sizes
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'filled' | 'outline' | 'flushed' | 'unstyled'
  size?: 'sm' | 'md' | 'lg'
  isError?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'default', size = 'md', isError = false, ...props }, ref) => {
    // Map size to specific padding based on size prop
    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { height: '2rem', padding: '0.25rem 0.5rem', fontSize: '0.875rem' },
      md: { height: '2.5rem', padding: '0.5rem 0.75rem', fontSize: '1rem' },
      lg: { height: '3rem', padding: '0.75rem 1rem', fontSize: '1.125rem' },
    };

    // Generate variant-specific classes
    const variantClasses = {
      default: "border border-input",
      filled: "border-0 bg-neutral-100 dark:bg-neutral-800",
      outline: "border-2 border-input",
      flushed: "border-0 border-b border-input rounded-none px-0",
      unstyled: "border-0 shadow-none bg-transparent px-0",
    };

    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-md bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          variantClasses[variant as keyof typeof variantClasses] || variantClasses.default,
          isError && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        style={sizeStyles[size] || sizeStyles.md}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
