# Best Practices & Performance

## Theme System Best Practices

### Structural Best Practices

#### 1. Follow Theme Hierarchy

The theme system uses a hierarchical structure for theme inheritance:

```
Global Default Theme
      ↓
Business Base Theme
      ↓
  Active Theme
      ↓
Component-specific Overrides
```

- **Always respect this hierarchy** in your implementations
- Use the most specific level appropriate for your customization
- Avoid duplicating tokens across levels

#### 2. Use Semantic Token Names

- Use semantic names that describe the purpose, not the visual property:

```typescript
// ✅ Good
const buttonBackground = theme.tokens.colors.primary.DEFAULT;
const dangerColor = theme.tokens.colors.destructive.DEFAULT;

// ❌ Bad
const buttonBackground = "#4f46e5";
const dangerColor = "#ef4444";
```

#### 3. Consistent CSS Variable Usage

- Use the defined CSS variable pattern consistently:
  - Global variables: `var(--theme-{category}-{key})`
  - Component-specific: `var(--theme-components-{component}-{key})`

```css
/* ✅ Good */
.my-component {
  color: var(--theme-colors-primary-DEFAULT);
  margin: var(--theme-spacing-md);
}

/* ❌ Bad */
.my-component {
  color: #4f46e5; /* Hardcoded color */
  margin: 16px; /* Hardcoded spacing */
}
```

#### 4. Business Context Awareness

- Always check for business context before accessing business-specific themes
- Provide fallbacks for missing business contexts

```typescript
// ✅ Good
function BusinessThemedComponent() {
  const { theme, businessId } = useBusinessTheme();
  
  if (!businessId) {
    // Fallback to default styling when no business context
    return <DefaultStyling />;
  }
  
  return <ThemedComponent theme={theme} />;
}
```

### Design Best Practices

#### 1. Accessibility First

- Ensure sufficient color contrast for all themes (minimum 4.5:1 for normal text)
- Test themes with screen readers and keyboard navigation
- Provide accessible names for all interactive elements

```typescript
// Generate accessible colors
function getAccessibleTextColor(backgroundColor: string): string {
  const contrast = getContrastRatio(backgroundColor, '#ffffff');
  return contrast >= 4.5 ? '#ffffff' : '#000000';
}
```

#### 2. Dark Mode Support

- Design all themes with both light and dark mode variants
- Ensure readability and contrast in both modes
- Test theme transitions between modes

```typescript
// ✅ Good approach
const cardBackground = colorMode === 'dark' 
  ? theme.tokens.colors.background.elevated 
  : theme.tokens.colors.background.DEFAULT;

// ❌ Bad approach
const cardBackground = '#ffffff'; // Only works in light mode
```

#### 3. Responsive Design

- Test themes across all screen sizes
- Use relative units (em, rem) instead of pixels
- Design mobile-first and enhance for larger screens

```css
/* ✅ Good */
.themed-card {
  padding: var(--theme-spacing-md); /* Relative spacing */
  margin-bottom: 1.5rem;
}

/* ❌ Bad */
.themed-card {
  padding: 16px; /* Fixed pixel values */
  margin-bottom: 24px;
}
```

#### 4. Keep Themes Consistent

- Maintain visual hierarchy within themes
- Use consistent spacing patterns (8px grid system)
- Ensure typography follows the defined scale

```typescript
// ✅ Good sizing pattern
const sizes = {
  sm: `${baseSize * 0.75}rem`,
  md: `${baseSize}rem`,
  lg: `${baseSize * 1.5}rem`,
  xl: `${baseSize * 2}rem`,
};
```

### Performance Best Practices

#### 1. Minimize Theme Updates

- Batch theme updates to minimize DOM repaints
- Debounce user input for theme customization
- Cache computed theme values when possible

```typescript
// ✅ Good - Debounced theme updates
const debouncedUpdateTheme = useCallback(
  debounce((newTheme) => {
    updateThemeMutation.mutate(newTheme);
  }, 500),
  [updateThemeMutation]
);
```

#### 2. CSS Variable Performance

- Scope CSS variables to the appropriate level (avoid unnecessary global variables)
- Minimize CSS variable updates during animations
- Set variables at the appropriate DOM level, not on every element

```typescript
// ✅ Good - Centralized CSS variable updates
function updateThemeVariables(theme: Theme, element: HTMLElement) {
  const cssVars = generateCssVariables(theme.tokens);
  applyCssVariables(element, cssVars);
}

// ❌ Bad - Applying styles to many elements individually
function updateComponentStyles(theme: Theme, elements: HTMLElement[]) {
  elements.forEach(el => {
    el.style.backgroundColor = theme.tokens.colors.background.DEFAULT;
    el.style.color = theme.tokens.colors.foreground.DEFAULT;
  });
}
```

#### 3. Theme Loading Strategy

- Use skeleton states while themes are loading
- Pre-load critical theme data
- Apply themes progressively (critical styles first)

```tsx
function ThemedComponent() {
  const { theme, isLoading } = useBusinessTheme();
  
  if (isLoading) {
    return <SkeletonLoader />;
  }
  
  return <ComponentWithTheme theme={theme} />;
}
```

#### 4. Cache Theme Calculations

- Cache theme token transformations
- Memoize complex theme-based calculations
- Store processed themes in memory/localStorage

```typescript
// ✅ Good - Memoized theme processing
const processedTheme = useMemo(() => {
  return processThemeTokens(theme.tokens);
}, [theme.tokens]);

// For theme metadata that rarely changes
const serializedTheme = localStorage.getItem('cachedTheme');
if (serializedTheme) {
  // Use cached theme for initial render
}
```

## Testing Themes

### 1. Component Testing with Different Themes

Test components with multiple themes to ensure they respond correctly to different design tokens:

```typescript
describe('Button component', () => {
  it('renders correctly with the default theme', () => {
    render(
      <ThemeProvider theme={defaultTheme}>
        <Button>Click me</Button>
      </ThemeProvider>
    );
    // Assert styles match default theme
  });
  
  it('renders correctly with a custom theme', () => {
    render(
      <ThemeProvider theme={customTheme}>
        <Button>Click me</Button>
      </ThemeProvider>
    );
    // Assert styles match custom theme
  });
  
  it('renders correctly in dark mode', () => {
    render(
      <ThemeProvider theme={darkTheme}>
        <Button>Click me</Button>
      </ThemeProvider>
    );
    // Assert styles match dark theme
  });
});
```

### 2. Visual Regression Testing

Use snapshot testing to catch unexpected visual changes:

```typescript
it('matches visual snapshot with theme applied', () => {
  const { container } = render(
    <ThemeProvider theme={testTheme}>
      <ThemedComponent />
    </ThemeProvider>
  );
  
  expect(container).toMatchSnapshot();
});
```

### 3. Accessibility Testing

Test color contrast and accessibility for different themes:

```typescript
it('maintains sufficient color contrast in all themes', () => {
  const themes = [lightTheme, darkTheme, highContrastTheme];
  
  themes.forEach(theme => {
    const background = theme.tokens.colors.background.DEFAULT;
    const foreground = theme.tokens.colors.foreground.DEFAULT;
    
    const contrastRatio = calculateContrastRatio(background, foreground);
    expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
  });
});
```

## Theme System Deployment

### 1. Theme Update Strategy

When deploying theme system updates:

1. **Be Backward Compatible**: Ensure new theme features don't break existing themes
2. **Version Themes**: Track theme versions to manage compatibility
3. **Progressive Enhancement**: Add new token types gradually
4. **Default Fallbacks**: Provide sensible defaults for missing tokens

```typescript
// ✅ Good - Handling potentially missing tokens
const borderRadius = theme.tokens.borders?.radius?.DEFAULT || '0.375rem';
```

### 2. Theme Migration Tools

Provide tools for migrating between theme versions:

```typescript
/**
 * Migrates a v1 theme to v2 format
 */
function migrateThemeToV2(themeV1: ThemeV1): ThemeV2 {
  // Map old theme structure to new structure
  return {
    tokens: {
      colors: mapColorsToV2(themeV1.colors),
      typography: mapTypographyToV2(themeV1.typography),
      // Add new token categories with defaults
      spacing: defaultSpacingTokens,
      // ...other new token categories
    },
    metadata: {
      // Preserve and extend metadata
      ...themeV1.metadata,
      version: '2.0.0'
    }
  };
}
```

## Multi-tenant Considerations

### 1. Isolation

Ensure complete theme isolation between tenants:

```css
/* Business-specific theme vars - completely isolated */
.theme-business-123 {
  --theme-colors-primary-DEFAULT: #0ea5e9;
}

.theme-business-456 {
  --theme-colors-primary-DEFAULT: #ef4444;
}
```

### 2. Performance

- Load only the themes needed for the current business context
- Use lazy loading for additional themes
- Consider a theme CDN for marketplace themes

```typescript
// Load only the current business theme
useEffect(() => {
  if (businessId) {
    themeApi.getActiveTheme(businessId).then(setTheme);
  }
}, [businessId]);
```

### 3. Storage Optimization

- Store common theme parts as base themes
- Store only the differences for derived themes
- Use theme compression for large themes

```typescript
// Optimized theme storage
const baseTheme = getBaseTheme();
const customizations = {
  // Only store what's different from the base
  colors: {
    primary: { DEFAULT: '#0ea5e9' }
  }
};

// Reconstruct the full theme when needed
const fullTheme = mergeThemes(baseTheme, customizations);
```

## Advanced Theme Techniques

### 1. Theme Analytics

Track theme usage to improve the system:

```typescript
function trackThemeUsage(theme: Theme, businessId: number) {
  analytics.track('theme_applied', {
    themeId: theme.metadata.id,
    businessId,
    variant: theme.metadata.variant,
    // Other relevant metrics
  });
}
```

### 2. A/B Testing Themes

Test different themes with users:

```typescript
function getABTestTheme(businessId: number): Promise<Theme> {
  // Determine test group
  const testGroup = getTestGroup(businessId);
  
  // Return different theme based on test group
  if (testGroup === 'A') {
    return themeApi.getThemeById(themeAId);
  } else {
    return themeApi.getThemeById(themeBId);
  }
}
```

### 3. Seasonal Theme Updates

Automatically update themes based on seasons or events:

```typescript
function getSeasonalTheme(baseTheme: Theme): Theme {
  const currentMonth = new Date().getMonth();
  
  // Winter theme (December, January, February)
  if (currentMonth === 11 || currentMonth <= 1) {
    return applyWinterTheme(baseTheme);
  }
  
  // Summer theme (June, July, August)
  if (currentMonth >= 5 && currentMonth <= 7) {
    return applySummerTheme(baseTheme);
  }
  
  // Default to base theme for other months
  return baseTheme;
}
```

## Common Pitfalls and Solutions

### 1. Theme Bleeding

**Problem**: Theme styles from one business affecting another

**Solution**: Ensure proper CSS isolation through class namespacing

```css
/* ✅ Good - Properly isolated */
.theme-business-123 .button {
  background-color: var(--theme-colors-primary-DEFAULT);
}

/* ❌ Bad - Global styles affect all businesses */
.button {
  background-color: var(--theme-colors-primary-DEFAULT);
}
```

### 2. Theme Load Flash

**Problem**: Flash of unstyled content before theme loads

**Solution**: Use skeleton states and preload critical theme data

```tsx
function ThemedApp() {
  const { theme, isLoading } = useBusinessTheme();
  
  // Apply early theme class to prevent flash
  useEffect(() => {
    if (!isLoading && theme) {
      document.documentElement.classList.add(`theme-${theme.metadata.id}`);
    }
    
    return () => {
      document.documentElement.classList.remove(`theme-${theme.metadata.id}`);
    };
  }, [isLoading, theme]);
  
  if (isLoading) {
    return <AppSkeleton />;
  }
  
  return <App theme={theme} />;
}
```

### 3. Theme Synchronization

**Problem**: Theme updates not synchronizing between tabs/devices

**Solution**: Use local storage events or server synchronization

```typescript
// Listen for theme updates from other tabs
window.addEventListener('storage', (event) => {
  if (event.key === 'activeTheme') {
    // Reload the theme
    const newTheme = JSON.parse(event.newValue);
    applyTheme(newTheme);
  }
});

// When updating theme
function updateTheme(newTheme) {
  // Apply theme locally
  applyTheme(newTheme);
  
  // Store for other tabs to detect
  localStorage.setItem('activeTheme', JSON.stringify(newTheme));
}
```

### 4. Accessibility Regressions

**Problem**: Theme customizations breaking accessibility

**Solution**: Enforce accessibility checks for theme updates

```typescript
function validateThemeAccessibility(theme: Theme): boolean {
  const { colors } = theme.tokens;
  
  // Check text contrast
  const textContrast = getContrastRatio(
    colors.foreground.DEFAULT,
    colors.background.DEFAULT
  );
  
  if (textContrast < 4.5) {
    return false;
  }
  
  // Check interactive element contrast
  const buttonContrast = getContrastRatio(
    colors.primary.foreground,
    colors.primary.DEFAULT
  );
  
  if (buttonContrast < 4.5) {
    return false;
  }
  
  return true;
}
```

## Final Recommendations

1. **Start Simple**: Begin with basic theme customization and expand gradually
2. **Document Everything**: Keep theme token documentation up-to-date
3. **Create Theme Showcases**: Build example implementations of different themes
4. **Get User Feedback**: Regularly test themes with real users
5. **Monitor Performance**: Watch for theme-related performance issues
6. **Build Theme Tools**: Create utilities to make theme creation easier
7. **Train Your Team**: Ensure all developers understand the theme system
8. **Regular Audits**: Periodically audit themes for accessibility and consistency