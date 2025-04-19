/**
 * ThemeMarketplaceCard Component - 2025 Edition
 *
 * A card component that displays a theme from the marketplace
 * with a preview image, name, description, and apply button.
 */

import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MarketplaceTheme } from '@shared/marketplaceThemes';
import { cn } from '@/lib/utils';

interface ThemeMarketplaceCardProps {
  theme: MarketplaceTheme;
  onPreview: (themeId: string) => void;
  onApply: (themeId: string) => void;
  className?: string;
}

export function ThemeMarketplaceCard({
  theme,
  onPreview,
  onApply,
  className,
}: ThemeMarketplaceCardProps) {
  // Handle placeholder image if real images are not available
  const thumbnailSrc = theme.preview.thumbnailImage || 
    `https://via.placeholder.com/300x200/${theme.primaryColor.replace('#', '')}/FFFFFF?text=${theme.name}`;
  
  return (
    <Card className={cn("overflow-hidden transition-all duration-300 hover:shadow-md", className)}>
      <div className="relative">
        {/* Theme image */}
        <div 
          className="w-full h-40 bg-center bg-cover" 
          style={{ 
            backgroundImage: `url(${thumbnailSrc})`,
            backgroundColor: theme.primaryColor,
          }}
        />
        
        {/* Price badge */}
        <div className="absolute top-2 right-2">
          <Badge variant={theme.price === 'free' ? 'secondary' : 'default'}>
            {theme.price === 'free' ? 'Free' : `$${theme.price}`}
          </Badge>
        </div>
        
        {/* New badge */}
        {theme.isNew && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive">New</Badge>
          </div>
        )}
      </div>
      
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold tracking-tight">{theme.name}</h3>
          <span className="text-xs text-muted-foreground">{theme.category}</span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{theme.description}</p>
        
        <div className="flex flex-wrap gap-1 mt-2">
          {theme.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {theme.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{theme.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onPreview(theme.id)}
        >
          Preview
        </Button>
        <Button 
          variant="default" 
          size="sm"
          onClick={() => onApply(theme.id)}
        >
          {theme.price === 'free' ? 'Apply Theme' : 'Purchase & Apply'}
        </Button>
      </CardFooter>
    </Card>
  );
}