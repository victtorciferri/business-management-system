/**
 * ThemeMarketplaceCard Component - 2025 Edition
 *
 * A card displaying theme information in the marketplace grid
 * with preview, apply, and details functionality.
 */

import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Sparkles, ChevronRight } from 'lucide-react';
import { MarketplaceTheme } from '@shared/marketplaceThemes';

interface ThemeMarketplaceCardProps {
  theme: MarketplaceTheme;
  onPreview: (themeId: string) => void;
  onApply: (themeId: string) => void;
}

export function ThemeMarketplaceCard({
  theme,
  onPreview,
  onApply,
}: ThemeMarketplaceCardProps) {
  // Determine the preview image to use
  const previewImage = theme.preview.primaryImage || 
    `https://via.placeholder.com/500x300/${theme.primaryColor.replace('#', '')}/FFFFFF?text=${theme.name}`;
  
  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all duration-200 hover:shadow-md">
      {/* Image section */}
      <div 
        className="aspect-video relative bg-cover bg-center cursor-pointer"
        style={{ backgroundImage: `url(${previewImage})` }}
        onClick={() => onPreview(theme.id)}
      >
        {/* Overlay for gradient and tags/badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-between p-3">
          <div className="flex gap-1 justify-end">
            {theme.isNew && (
              <Badge className="bg-accent hover:bg-accent text-white">New</Badge>
            )}
            {theme.tags.includes('featured') && (
              <Badge variant="secondary">Featured</Badge>
            )}
          </div>
          
          <div className="flex justify-between items-end">
            <h3 className="text-white font-medium text-lg truncate max-w-[70%]">{theme.name}</h3>
            <Badge variant={theme.price === 'free' ? 'secondary' : 'default'} className="h-6">
              {theme.price === 'free' ? 'Free' : `$${theme.price}`}
            </Badge>
          </div>
        </div>
      </div>
      
      <CardContent className="flex-grow p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <Badge variant="outline" className="text-xs mb-1">
              {theme.category}
            </Badge>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {theme.description}
            </p>
          </div>
        </div>
        
        {/* Theme color preview */}
        <div className="flex gap-1 mt-3">
          <div 
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: theme.primaryColor }}
            title="Primary color"
          />
          <div 
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: theme.secondaryColor }}
            title="Secondary color"
          />
          <div 
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: theme.accentColor }}
            title="Accent color"
          />
        </div>
        
        <div className="text-xs text-muted-foreground mt-2">
          <span className="font-medium">Fonts:</span> {theme.fontPrimary.split(',')[0]}/{theme.fontHeading.split(',')[0]}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onPreview(theme.id)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Preview
        </Button>
        
        <Button 
          variant="default" 
          size="sm" 
          className="flex-1"
          onClick={() => onApply(theme.id)}
        >
          {theme.price === 'free' ? (
            <>
              <Sparkles className="h-4 w-4 mr-1" />
              Apply
            </>
          ) : (
            <>
              Buy
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}