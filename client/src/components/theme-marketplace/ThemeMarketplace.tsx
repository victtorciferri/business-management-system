/**
 * ThemeMarketplace Component - 2025 Edition
 *
 * Main marketplace component for browsing, filtering, and applying themes.
 */

import React, { useState } from 'react';
import { 
  marketplaceThemes, 
  MarketplaceTheme, 
  ThemeCategory,
  getThemesByCategory,
  getPopularThemes,
  getNewThemes,
  getThemesByPriceType,
  searchThemes 
} from '@shared/marketplaceThemes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ThemeMarketplaceCard } from './ThemeMarketplaceCard';
import { ThemeMarketplacePreview } from './ThemeMarketplacePreview';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useBusinessTheme } from '@/providers/MultiTenantThemeProvider';

interface ThemeMarketplaceProps {
  onApplyTheme: (theme: any) => Promise<void>;
}

export function ThemeMarketplace({ onApplyTheme }: ThemeMarketplaceProps) {
  // State for filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ThemeCategory | 'all'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortOption, setSortOption] = useState<'popularity' | 'newest'>('popularity');
  
  // State for preview dialog
  const [previewThemeId, setPreviewThemeId] = useState<string | undefined>(undefined);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Theme application state
  const [isApplying, setIsApplying] = useState(false);
  
  // Get toast function
  const { toast } = useToast();
  const { activeTheme } = useBusinessTheme();
  
  // Filter and sort themes based on current filters
  const filteredThemes = React.useMemo(() => {
    // Start with all themes
    let themes = [...marketplaceThemes];
    
    // Apply search filter
    if (searchQuery) {
      themes = searchThemes(searchQuery);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      themes = themes.filter(theme => theme.category === categoryFilter);
    }
    
    // Apply price filter
    if (priceFilter === 'free') {
      themes = themes.filter(theme => theme.price === 'free');
    } else if (priceFilter === 'paid') {
      themes = themes.filter(theme => theme.price !== 'free');
    }
    
    // Apply sorting
    if (sortOption === 'popularity') {
      themes = themes.sort((a, b) => b.popularity - a.popularity);
    } else if (sortOption === 'newest') {
      themes = themes.filter(theme => theme.isNew).concat(
        themes.filter(theme => !theme.isNew)
      );
    }
    
    return themes;
  }, [searchQuery, categoryFilter, priceFilter, sortOption]);
  
  // Open preview dialog
  const handlePreview = (themeId: string) => {
    setPreviewThemeId(themeId);
    setIsPreviewOpen(true);
  };
  
  // Close preview dialog
  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewThemeId(undefined);
  };
  
  // Apply theme
  const handleApplyTheme = async (themeId: string) => {
    try {
      setIsApplying(true);
      
      // Find the theme
      const theme = marketplaceThemes.find(t => t.id === themeId);
      
      if (!theme) {
        throw new Error('Theme not found');
      }
      
      // Check if it's a paid theme
      if (theme.price !== 'free') {
        // For now, just show a toast for paid themes
        // In a real application, this would integrate with a payment system
        toast({
          title: "Payment Required",
          description: `This theme costs $${theme.price}. Payment functionality will be implemented soon.`,
          variant: "default",
        });
        return;
      }
      
      // Convert the marketplace theme to the format expected by the theme system
      const themeData = {
        name: theme.name,
        primaryColor: theme.primaryColor,
        secondaryColor: theme.secondaryColor,
        accentColor: theme.accentColor,
        fontFamily: theme.fontPrimary,
        headingFontFamily: theme.fontHeading,
        borderRadius: theme.borderRadius,
        id: `marketplace_${theme.id}`,
        isActive: true,
        isDefault: false,
        businessId: activeTheme?.businessId || 1,
      };
      
      // Apply the theme
      await onApplyTheme(themeData);
      
      // Show success message
      toast({
        title: "Theme Applied",
        description: `${theme.name} theme has been applied successfully.`,
        variant: "success",
      });
      
      // Close the preview if open
      if (isPreviewOpen) {
        handleClosePreview();
      }
    } catch (error) {
      console.error('Error applying theme:', error);
      toast({
        title: "Error",
        description: "Failed to apply theme. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };
  
  // Generate categories for filtering
  const categories: { value: ThemeCategory | 'all', label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'business', label: 'Business' },
    { value: 'creative', label: 'Creative' },
    { value: 'modern', label: 'Modern' },
    { value: 'elegant', label: 'Elegant' },
    { value: 'playful', label: 'Playful' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'professional', label: 'Professional' },
    { value: 'bold', label: 'Bold' },
  ];
  
  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Theme Marketplace</h2>
        <p className="text-muted-foreground">
          Browse and apply professional themes to customize your business appearance.
        </p>
      </div>
      
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="mb-4 w-full sm:w-auto">
          <TabsTrigger value="browse">Browse Themes</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="new">New Arrivals</TabsTrigger>
        </TabsList>
        
        {/* Browse tab - all themes with filtering */}
        <TabsContent value="browse" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Find Your Perfect Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <Input
                    id="search"
                    placeholder="Search themes..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={categoryFilter} onValueChange={value => setCategoryFilter(value as ThemeCategory | 'all')}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Select value={priceFilter} onValueChange={value => setPriceFilter(value as 'all' | 'free' | 'paid')}>
                    <SelectTrigger id="price">
                      <SelectValue placeholder="Select price range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="free">Free Only</SelectItem>
                      <SelectItem value="paid">Paid Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  {filteredThemes.length} themes found
                </p>
                
                <Select value={sortOption} onValueChange={value => setSortOption(value as 'popularity' | 'newest')}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {filteredThemes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredThemes.map((theme) => (
                <ThemeMarketplaceCard
                  key={theme.id}
                  theme={theme}
                  onPreview={handlePreview}
                  onApply={handleApplyTheme}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium">No themes found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </TabsContent>
        
        {/* Featured tab - popular themes */}
        <TabsContent value="featured" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Popular Themes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getPopularThemes(8).map((theme) => (
                <ThemeMarketplaceCard
                  key={theme.id}
                  theme={theme}
                  onPreview={handlePreview}
                  onApply={handleApplyTheme}
                />
              ))}
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Free Themes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getThemesByPriceType(true).slice(0, 4).map((theme) => (
                <ThemeMarketplaceCard
                  key={theme.id}
                  theme={theme}
                  onPreview={handlePreview}
                  onApply={handleApplyTheme}
                />
              ))}
            </div>
          </div>
          
          <div className="text-center mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setPriceFilter('free');
                setCategoryFilter('all');
                setSearchQuery('');
                setSortOption('popularity');
                
                // Switch to browse tab
                document.querySelector('[data-value="browse"]')?.click();
              }}
            >
              Browse All Free Themes
            </Button>
          </div>
        </TabsContent>
        
        {/* New Arrivals tab */}
        <TabsContent value="new" className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">New Arrivals</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {getNewThemes(8).map((theme) => (
                <ThemeMarketplaceCard
                  key={theme.id}
                  theme={theme}
                  onPreview={handlePreview}
                  onApply={handleApplyTheme}
                />
              ))}
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Theme Categories</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.filter(cat => cat.value !== 'all').map((category) => (
                <Card 
                  key={category.value}
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => {
                    setCategoryFilter(category.value as ThemeCategory);
                    setPriceFilter('all');
                    setSearchQuery('');
                    setSortOption('popularity');
                    
                    // Switch to browse tab
                    document.querySelector('[data-value="browse"]')?.click();
                  }}
                >
                  <CardContent className="p-6">
                    <h4 className="text-lg font-medium mb-2">{category.label}</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {getThemesByCategory(category.value as ThemeCategory).length} themes
                    </p>
                    <Button variant="outline" size="sm">Browse</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Theme preview dialog */}
      <ThemeMarketplacePreview
        themeId={previewThemeId}
        open={isPreviewOpen}
        onClose={handleClosePreview}
        onApply={handleApplyTheme}
      />
    </div>
  );
}