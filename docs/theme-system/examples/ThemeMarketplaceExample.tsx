import React, { useState } from 'react';
import { useBusinessTheme } from '@/hooks/useBusinessTheme';
import { themeApi } from '@/lib/themeApi';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MarketplaceTheme } from '@shared/marketplaceThemes';

/**
 * Example component demonstrating theme marketplace integration
 */
export function ThemeMarketplaceExample() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Theme Marketplace</h2>
      
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search themes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded-md bg-background w-full md:w-64"
        />
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-md bg-background"
        >
          <option value="all">All Categories</option>
          <option value="professional">Professional</option>
          <option value="vibrant">Vibrant</option>
          <option value="elegant">Elegant</option>
          <option value="minimal">Minimal</option>
          <option value="seasonal">Seasonal</option>
        </select>
      </div>
      
      <MarketplaceThemeGrid 
        category={selectedCategory === 'all' ? undefined : selectedCategory}
        searchQuery={searchQuery}
      />
    </div>
  );
}

/**
 * Grid of marketplace themes
 */
function MarketplaceThemeGrid({
  category,
  searchQuery
}: {
  category?: string;
  searchQuery: string;
}) {
  // Fetch marketplace themes
  const { data: themes = [], isLoading, error } = useQuery({
    queryKey: ['/api/marketplace/themes', { category, searchQuery }],
    queryFn: async () => {
      let url = '/api/marketplace/themes';
      const params = new URLSearchParams();
      
      if (category) params.append('category', category);
      if (searchQuery) params.append('query', searchQuery);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch marketplace themes');
      }
      
      const data = await response.json();
      return data.themes;
    }
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <ThemeCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 border border-destructive bg-destructive/10 text-destructive rounded-md">
        <h3 className="font-semibold mb-2">Error loading marketplace themes</h3>
        <p>{(error as Error).message}</p>
      </div>
    );
  }
  
  if (themes.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed rounded-lg">
        <h3 className="text-xl font-medium mb-2">No themes found</h3>
        <p className="text-muted-foreground">
          {searchQuery 
            ? `No results for "${searchQuery}"${category && category !== 'all' ? ` in ${category}` : ''}`
            : 'No themes available in this category'}
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {themes.map((theme: MarketplaceTheme) => (
        <MarketplaceThemeCard key={theme.id} theme={theme} />
      ))}
    </div>
  );
}

/**
 * Individual marketplace theme card
 */
function MarketplaceThemeCard({ theme }: { theme: MarketplaceTheme }) {
  const { businessId } = useBusinessTheme();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Mutation for applying theme
  const applyThemeMutation = useMutation({
    mutationFn: () => {
      if (!businessId) {
        throw new Error('No business context found');
      }
      
      return themeApi.applyMarketplaceTheme(theme.id, businessId);
    },
    onSuccess: () => {
      toast.success(`Theme "${theme.name}" applied successfully!`);
      queryClient.invalidateQueries({ queryKey: ['/api/themes/active'] });
    },
    onError: (error) => {
      toast.error(`Failed to apply theme: ${(error as Error).message}`);
    }
  });
  
  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="aspect-[16/9] overflow-hidden bg-muted">
        <img
          src={theme.thumbnailImageUrl || theme.previewImageUrl}
          alt={`${theme.name} preview`}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">{theme.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{theme.description}</p>
          </div>
          
          {theme.isNew && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              New
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary/10 text-secondary">
            {theme.category}
          </span>
          
          {theme.isAccessible && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
              Accessible
            </span>
          )}
          
          {theme.seasonal && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
              Seasonal
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-5 gap-2 mt-4">
          {generateColorSwatches(theme).map((color, index) => (
            <div
              key={index}
              className="h-6 rounded-full"
              style={{ backgroundColor: color }}
              title={`Theme color ${index + 1}`}
            />
          ))}
        </div>
        
        <div className="flex space-x-3 mt-5">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex-1 px-4 py-2 border rounded-md hover:bg-accent"
          >
            Preview
          </button>
          
          <button
            onClick={() => applyThemeMutation.mutate()}
            disabled={applyThemeMutation.isPending || !businessId}
            className={cn(
              "flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground",
              "hover:bg-primary/90",
              "disabled:opacity-50"
            )}
          >
            {applyThemeMutation.isPending ? 'Applying...' : 'Apply Theme'}
          </button>
        </div>
        
        {!businessId && (
          <p className="text-xs text-destructive mt-2">
            Business context required to apply themes
          </p>
        )}
      </div>
      
      {isPreviewOpen && (
        <ThemePreviewModal
          theme={theme}
          onClose={() => setIsPreviewOpen(false)}
          onApply={() => {
            setIsPreviewOpen(false);
            applyThemeMutation.mutate();
          }}
        />
      )}
    </div>
  );
}

/**
 * Theme preview modal
 */
function ThemePreviewModal({
  theme,
  onClose,
  onApply
}: {
  theme: MarketplaceTheme;
  onClose: () => void;
  onApply: () => void;
}) {
  const { businessId } = useBusinessTheme();
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-card border rounded-lg shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold">{theme.name} Preview</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-auto">
          <img
            src={theme.previewImageUrl}
            alt={`${theme.name} full preview`}
            className="w-full"
          />
          
          <div className="p-6">
            <h4 className="text-lg font-medium mb-2">Theme Details</h4>
            <p className="mb-4">{theme.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h5 className="text-sm font-medium mb-1">Category</h5>
                <p>{theme.category}</p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium mb-1">Features</h5>
                <div className="flex flex-wrap gap-2">
                  {theme.isAccessible && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                      Accessible
                    </span>
                  )}
                  
                  {theme.seasonal && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      Seasonal
                    </span>
                  )}
                  
                  {theme.industry && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {theme.industry}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h5 className="text-sm font-medium mb-2">Color Palette</h5>
              <div className="grid grid-cols-5 gap-3">
                {generateColorSwatches(theme).map((color, index) => (
                  <div key={index} className="text-center">
                    <div
                      className="h-12 rounded-md mb-1"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-mono">{color}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <h5 className="text-sm font-medium mb-1">Typography</h5>
              <p>
                Primary Font: {theme.tokens?.typography?.fontFamily?.body || 'Default System Font'}
              </p>
              <p>
                Heading Font: {theme.tokens?.typography?.fontFamily?.heading || 'Default System Font'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-accent"
          >
            Cancel
          </button>
          
          <button
            onClick={onApply}
            disabled={!businessId}
            className={cn(
              "px-4 py-2 rounded-md bg-primary text-primary-foreground",
              "hover:bg-primary/90",
              "disabled:opacity-50"
            )}
          >
            Apply This Theme
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Theme card skeleton for loading state
 */
function ThemeCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden bg-card animate-pulse">
      <div className="aspect-[16/9] bg-muted" />
      
      <div className="p-5 space-y-3">
        <div className="h-6 bg-muted rounded-md w-3/4" />
        <div className="h-4 bg-muted rounded-md w-full" />
        
        <div className="flex gap-2">
          <div className="h-5 bg-muted rounded-md w-16" />
          <div className="h-5 bg-muted rounded-md w-20" />
        </div>
        
        <div className="grid grid-cols-5 gap-2 mt-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-muted rounded-full" />
          ))}
        </div>
        
        <div className="flex space-x-3 pt-2">
          <div className="flex-1 h-10 bg-muted rounded-md" />
          <div className="flex-1 h-10 bg-muted rounded-md" />
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function to generate color swatches from a theme
 */
function generateColorSwatches(theme: MarketplaceTheme): string[] {
  const colors: string[] = [];
  
  // Try to extract colors from the theme tokens
  if (theme.tokens?.colors) {
    const { colors: tokenColors } = theme.tokens;
    
    if (tokenColors.primary?.DEFAULT) colors.push(tokenColors.primary.DEFAULT);
    if (tokenColors.secondary?.DEFAULT) colors.push(tokenColors.secondary.DEFAULT);
    if (tokenColors.accent) colors.push(tokenColors.accent);
    if (tokenColors.background?.DEFAULT) colors.push(tokenColors.background.DEFAULT);
    if (tokenColors.destructive?.DEFAULT) colors.push(tokenColors.destructive.DEFAULT);
  }
  
  // If we couldn't extract enough colors, use fallbacks based on primary color
  if (colors.length < 5 && theme.tokens?.colors?.primary?.DEFAULT) {
    const primaryColor = theme.tokens.colors.primary.DEFAULT;
    
    // Add variations of the primary color
    if (colors.length < 5) colors.push(lightenColor(primaryColor, 0.2));
    if (colors.length < 5) colors.push(darkenColor(primaryColor, 0.2));
    if (colors.length < 5) colors.push(darkenColor(primaryColor, 0.4));
  }
  
  // If still not enough, add placeholder colors
  while (colors.length < 5) {
    colors.push('#e2e8f0');
  }
  
  return colors;
}

/**
 * Helper function to lighten a color
 */
function lightenColor(color: string, amount: number): string {
  // This is a simplified implementation
  // In a real app, use a proper color library
  return color;
}

/**
 * Helper function to darken a color
 */
function darkenColor(color: string, amount: number): string {
  // This is a simplified implementation
  // In a real app, use a proper color library
  return color;
}