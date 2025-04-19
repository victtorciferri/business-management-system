# Design Tokens Reference

## Introduction to Design Tokens

Design tokens are the atomic values that form the foundation of our design system. They represent the smallest visual elements like colors, typography, spacing, and more. By centralizing these values as tokens, we ensure consistency across the entire application and make it easier to update the visual language.

## Design Token Categories

Our theme system organizes tokens into the following categories:

1. **Colors**: Brand colors, UI states, backgrounds, text colors
2. **Typography**: Font families, sizes, weights, line heights
3. **Spacing**: Paddings, margins, gaps
4. **Borders**: Border widths, radii, styles
5. **Shadows**: Drop shadows, inner shadows
6. **Effects**: Transitions, animations, opacity levels
7. **Components**: Component-specific tokens

## Token Structure

### Color Tokens

```typescript
interface ColorTokens {
  primary: {
    DEFAULT: string;
    light: string;
    dark: string;
    foreground: string;
    hover: string;
    [key: string]: string;
  };
  secondary: {
    DEFAULT: string;
    light: string;
    dark: string;
    foreground: string;
    hover: string;
    [key: string]: string;
  };
  background: {
    DEFAULT: string;
    surface: string;
    elevated: string;
    sunken: string;
    [key: string]: string;
  };
  foreground: {
    DEFAULT: string;
    muted: string;
    subtle: string;
    [key: string]: string;
  };
  border: string;
  focus: string;
  // State colors
  destructive: {
    DEFAULT: string;
    foreground: string;
    light: string;
    [key: string]: string;
  };
  success: {
    DEFAULT: string;
    foreground: string;
    light: string;
    [key: string]: string;
  };
  warning: {
    DEFAULT: string;
    foreground: string;
    light: string;
    [key: string]: string;
  };
  info: {
    DEFAULT: string;
    foreground: string;
    light: string;
    [key: string]: string;
  };
  [key: string]: any;
}
```

### Typography Tokens

```typescript
interface TypographyTokens {
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
    body: string;
    heading: string;
    display: string;
    [key: string]: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
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
    DEFAULT: string;
    [key: string]: string;
  };
  fontWeight: {
    thin: number | string;
    extralight: number | string;
    light: number | string;
    normal: number | string;
    medium: number | string;
    semibold: number | string;
    bold: number | string;
    extrabold: number | string;
    black: number | string;
    DEFAULT: number | string;
    [key: string]: number | string;
  };
  lineHeight: {
    none: string;
    tight: string;
    snug: string;
    normal: string;
    relaxed: string;
    loose: string;
    DEFAULT: string;
    [key: string]: string;
  };
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
    DEFAULT: string;
    [key: string]: string;
  };
  [key: string]: any;
}
```

### Spacing Tokens

```typescript
interface SpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
  DEFAULT: string;
  [key: string]: string;
}
```

### Border Tokens

```typescript
interface BorderTokens {
  radius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    full: string;
    DEFAULT: string;
    [key: string]: string;
  };
  width: {
    DEFAULT: string;
    none: string;
    thin: string;
    thick: string;
    heavy: string;
    [key: string | number]: string;
  };
  focus: {
    width: string;
    style: string;
    [key: string]: string;
  };
  [key: string]: any;
}
```

### Shadow Tokens

```typescript
interface ShadowTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  inner: string;
  DEFAULT: string;
  colored: string;
  [key: string]: string;
}
```

### Effect Tokens

```typescript
interface EffectTokens {
  transition: {
    fast: string;
    normal: string;
    slow: string;
    DEFAULT: string;
    [key: string]: string;
  };
  opacity: {
    0: string;
    25: string;
    50: string;
    75: string;
    100: string;
    disabled: string;
    hover: string;
    [key: string | number]: string;
  };
  [key: string]: any;
}
```

### Component Tokens

```typescript
interface ComponentTokens {
  button: {
    [key: string]: any;
  };
  input: {
    [key: string]: any;
  };
  card: {
    [key: string]: any;
  };
  modal: {
    [key: string]: any;
  };
  toast: {
    [key: string]: any;
  };
  avatar: {
    [key: string]: any;
  };
  [key: string]: any;
}
```

## CSS Variable Mapping

Tokens are automatically mapped to CSS variables with a predictable naming convention:

```
--theme-{category}-{subcategory}-{key}
```

Examples:
- `--theme-colors-primary-DEFAULT`
- `--theme-typography-fontSize-lg`
- `--theme-spacing-md`
- `--theme-borders-radius-sm`

## Using Design Tokens

### In React Components

```tsx
import { useThemeVar } from '@/hooks/useThemeVar';

function MyComponent() {
  const primaryColor = useThemeVar('colors.primary.DEFAULT');
  const fontSize = useThemeVar('typography.fontSize.lg');
  
  return (
    <div style={{ 
      color: primaryColor,
      fontSize: fontSize
    }}>
      Content styled with design tokens
    </div>
  );
}
```

### In CSS

```css
.my-component {
  color: var(--theme-colors-primary-DEFAULT);
  font-size: var(--theme-typography-fontSize-lg);
  margin: var(--theme-spacing-md);
  border-radius: var(--theme-borders-radius-sm);
  box-shadow: var(--theme-shadows-md);
  transition: all var(--theme-effects-transition-normal);
}
```

### In Tailwind

```tsx
function MyComponent() {
  return (
    <div className="text-primary bg-background-surface p-md rounded-md shadow-md">
      Content styled with design tokens via Tailwind
    </div>
  );
}
```

## Default Values

The theme system provides sensible defaults for all tokens. These defaults are used when a custom theme doesn't override specific values.

## Token Inheritance

Tokens can inherit from base themes:

1. Global default tokens serve as the foundation
2. Business-specific base theme tokens override global defaults
3. Specific theme tokens override business base theme tokens
4. Dark/light mode variants override the appropriate token sets

This inheritance chain allows for flexible theme customization with minimal repetition.