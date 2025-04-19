# Theme Marketplace Guide

## Introduction

The Theme Marketplace is a curated collection of professionally designed themes that businesses can browse, preview, and apply with a single click. It provides an easy way to quickly change the look and feel of a business storefront without requiring design expertise.

## Accessing the Theme Marketplace

The Theme Marketplace is available to all business users through the Business Portal. Navigate to **Settings > Themes > Theme Marketplace** to access it.

## Marketplace Features

### 1. Theme Browsing

The marketplace offers a grid view of available themes with filtering and sorting options:

- **Categories**: Filter themes by industry, style, or mood
- **Sorting**: Sort by popularity, newest, or alphabetically
- **Search**: Find themes by name or description
- **Filtering**: Filter by color scheme, style, or accessibility features

### 2. Theme Preview

Each theme in the marketplace includes:

- **Thumbnail**: Visual preview of the theme
- **Name & Description**: Brief information about the theme
- **Preview Button**: View a full-page preview of the theme
- **Apply Button**: Apply the theme to your business with one click

### 3. Theme Application

When a theme is applied:

1. The system creates a copy of the marketplace theme in your business account
2. The new theme is set as the active theme for your business
3. Your previous theme remains available but inactive
4. The application process is immediate with no downtime

## Theme Marketplace Architecture

The marketplace is built on these key components:

### 1. `MarketplaceTheme` Interface

```typescript
interface MarketplaceTheme {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  previewImageUrl: string;
  thumbnailImageUrl: string;
  popularity: number;
  isNew: boolean;
  isAccessible: boolean;
  industry?: string;
  seasonal?: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
  tokens: DesignTokens;
}
```

### 2. Theme Categories

Themes are organized into the following categories:

- **Professional**: Clean, corporate themes for service businesses
- **Vibrant**: Bold, colorful themes for creative businesses
- **Elegant**: Sophisticated, refined themes for luxury businesses
- **Minimal**: Simple, uncluttered themes focusing on content
- **Seasonal**: Themes tied to holidays or seasons
- **Industry-specific**: Themes designed for specific business types

### 3. Theme Preview System

The preview system allows users to see how their site would look with a new theme before applying it:

```tsx
function ThemePreview({ themeId }: { themeId: string }) {
  const { data: theme, isLoading } = useQuery({
    queryKey: ['/api/marketplace/themes', themeId],
    queryFn: () => fetch(`/api/marketplace/themes/${themeId}`).then(res => res.json())
  });
  
  if (isLoading) return <ThemePreviewSkeleton />;
  
  return (
    <div className="theme-preview">
      <PreviewHeader theme={theme} />
      <div className="theme-preview-content">
        {/* Preview components with the theme applied */}
        <ThemeProvider previewTheme={theme.tokens}>
          <PreviewContent />
        </ThemeProvider>
      </div>
    </div>
  );
}
```

### 4. Theme Application Flow

```typescript
async function applyMarketplaceTheme(marketplaceThemeId: string, businessId: number) {
  // 1. Fetch the marketplace theme
  const marketplaceTheme = await fetchMarketplaceTheme(marketplaceThemeId);
  
  // 2. Create a new theme for the business based on the marketplace theme
  const newTheme = {
    businessId,
    businessSlug: await getBusinessSlug(businessId),
    name: marketplaceTheme.name,
    description: marketplaceTheme.description,
    isActive: true, // Will be set as the active theme
    isDefault: false,
    tokens: marketplaceTheme.tokens,
    baseThemeId: marketplaceThemeId,
    category: marketplaceTheme.category,
    tags: marketplaceTheme.tags,
    preview: marketplaceTheme.previewImageUrl,
    thumbnail: marketplaceTheme.thumbnailImageUrl,
  };
  
  // 3. Create the theme in the database
  // This will automatically deactivate other themes
  return await createTheme(newTheme);
}
```

## Implementing the Theme Marketplace

### 1. MarketplaceThemeCard Component

```tsx
function MarketplaceThemeCard({ theme }: { theme: MarketplaceTheme }) {
  const { businessId } = useBusinessContext();
  const navigation = useNavigation();
  const toast = useToast();
  
  // Theme application mutation
  const applyThemeMutation = useMutation({
    mutationFn: () => apiRequest(`/api/themes/apply-marketplace`, {
      method: 'POST',
      body: JSON.stringify({
        marketplaceThemeId: theme.id,
        businessId
      })
    }),
    onSuccess: () => {
      toast.success(`Theme "${theme.name}" applied successfully!`);
      queryClient.invalidateQueries({ queryKey: ['/api/themes/active'] });
    },
    onError: (error) => {
      toast.error(`Failed to apply theme: ${error.message}`);
    }
  });
  
  return (
    <div className="marketplace-theme-card">
      <img 
        src={theme.thumbnailImageUrl} 
        alt={`${theme.name} preview`}
        className="theme-thumbnail"
      />
      <div className="theme-card-content">
        <h3>{theme.name}</h3>
        <p>{theme.description}</p>
        <div className="theme-tags">
          {theme.tags.map(tag => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>
        <div className="theme-actions">
          <Button 
            variant="outline" 
            onClick={() => navigation.navigate(`/theme-marketplace/preview/${theme.id}`)}
          >
            Preview
          </Button>
          <Button 
            onClick={() => applyThemeMutation.mutate()}
            disabled={applyThemeMutation.isPending}
          >
            {applyThemeMutation.isPending ? 'Applying...' : 'Apply Theme'}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### 2. Theme Marketplace Page

```tsx
function ThemeMarketplacePage() {
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('popularity');
  
  const { data: themes = [], isLoading } = useQuery({
    queryKey: ['/api/marketplace/themes', { category, searchQuery, sort }],
    queryFn: () => fetchMarketplaceThemes({ category, searchQuery, sort })
  });
  
  return (
    <div className="theme-marketplace">
      <h1>Theme Marketplace</h1>
      
      <div className="marketplace-filters">
        <Input 
          placeholder="Search themes..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="vibrant">Vibrant</SelectItem>
            <SelectItem value="elegant">Elegant</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
            <SelectItem value="seasonal">Seasonal</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity">Most Popular</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="marketplace-grid">
          {Array(6).fill(0).map((_, i) => (
            <ThemeCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="marketplace-grid">
          {themes.map(theme => (
            <MarketplaceThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      )}
    </div>
  );
}
```

## Best Practices for Theme Marketplace

1. **Regular updates**: Refresh the marketplace with new themes regularly to keep it engaging.

2. **Theme versioning**: Maintain version information for marketplace themes to allow for updates.

3. **Business-specific recommendations**: Suggest themes that match the business's industry or existing branding.

4. **Seasonal promotions**: Highlight seasonal themes at appropriate times of the year.

5. **Before/after previews**: Show how the business's current site would look with the new theme.

6. **Theme customization**: Allow businesses to customize marketplace themes after applying them.

7. **Analytics**: Track which themes are most popular to guide future theme development.

8. **Accessibility information**: Clearly mark which themes meet accessibility standards.

9. **Industry categorization**: Organize themes by business type to help users find relevant options.

10. **Theme migration**: Provide tools to help businesses migrate custom content when switching themes.