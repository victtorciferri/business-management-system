# Theme System Examples

This directory contains practical examples of how to use the theme system in various scenarios.

> **Note**: These are documentation examples only and are not meant to be imported directly into your code. They are provided as reference implementations to help you understand how to work with the theme system. The import paths and module references are for illustrative purposes.

## Component Examples

### [ThemeAwareButton.tsx](./ThemeAwareButton.tsx)

Demonstrates how to create a theme-aware button component that adapts to the current theme. This component:

- Uses CSS variables for theme properties
- Supports different variants and sizes
- Provides high contrast accessibility options
- Adapts to both light and dark modes
- Shows loading and disabled states

### [ThemeAwareCard.tsx](./ThemeAwareCard.tsx)

Shows how to create flexible card components that adapt to different themes:

- Multiple card variants (default, elevated, outlined, flat, interactive)
- Customizable padding
- Card header, content, and footer components
- Responsive design for different screen sizes

## Hook Usage Examples

### [ThemeHooksExample.tsx](./ThemeHooksExample.tsx)

Demonstrates the various theme hooks available in the system:

- `useBusinessTheme`: Accessing the current business theme
- `useColorMode`: Managing light/dark mode
- `useThemeVar`: Directly accessing specific theme values
- `useGlobalTheme`: Accessing global theme settings

This example includes interactive controls to show how theme settings affect the UI in real-time.

## Integration Examples

### [ThemeMarketplaceExample.tsx](./ThemeMarketplaceExample.tsx)

Shows how to integrate with the theme marketplace:

- Browsing and filtering themes
- Displaying theme cards with previews
- Theme preview modal
- Applying themes to a business

## How to Use These Examples

These examples are intended as reference implementations. You can:

1. **Copy and Adapt**: Use these examples as a starting point for your own components
2. **Learn Patterns**: Understand the recommended patterns for working with the theme system
3. **Test Themes**: Use these examples to test your own themes and see how they affect components

To use these examples in your own code:

```tsx
import { ThemeAwareButton } from '@/components/theme-aware/ThemeAwareButton';
import { ThemeAwareCard, CardHeader, CardContent } from '@/components/theme-aware/ThemeAwareCard';

function MyComponent() {
  return (
    <div>
      <ThemeAwareButton variant="primary" size="lg">
        Themed Button
      </ThemeAwareButton>
      
      <ThemeAwareCard variant="elevated" padding="lg">
        <CardHeader>Card Title</CardHeader>
        <CardContent>Card content goes here</CardContent>
      </ThemeAwareCard>
    </div>
  );
}
```

## Best Practices Demonstrated

These examples follow these key best practices:

1. **Composition Over Inheritance**: Components are composed of smaller, reusable parts
2. **Variant-Based Design**: Using variants for different visual treatments
3. **Accessible by Default**: Ensuring components maintain accessibility with any theme
4. **Responsive Design**: Components adapt to different screen sizes
5. **Dark Mode Support**: All components work well in both light and dark modes
6. **Performance Optimizations**: Using memoization and avoiding unnecessary renders
7. **Type Safety**: Full TypeScript type definitions for all components and hooks