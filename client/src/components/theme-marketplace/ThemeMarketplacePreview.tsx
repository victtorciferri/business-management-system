/**
 * ThemeMarketplacePreview Component - 2025 Edition
 *
 * A component for previewing a theme from the marketplace
 * with color palette, typography, components, and actions.
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MarketplaceTheme, getThemeById } from '@shared/marketplaceThemes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VariantAwareButton } from '@/components/theme-aware/VariantAwareButton';
import { VariantAwareCard } from '@/components/theme-aware/VariantAwareCard';
import { VariantAwareBadge } from '@/components/theme-aware/VariantAwareBadge';
import { VariantAwareInput } from '@/components/theme-aware/VariantAwareInput';

interface ThemeMarketplacePreviewProps {
  themeId?: string;
  onClose: () => void;
  onApply: (themeId: string) => void;
  open: boolean;
}

export function ThemeMarketplacePreview({
  themeId,
  onClose,
  onApply,
  open,
}: ThemeMarketplacePreviewProps) {
  const theme = themeId ? getThemeById(themeId) : undefined;
  
  if (!theme) {
    return null;
  }
  
  // Preview image handling
  const previewImage = theme.preview.primaryImage || 
    `https://via.placeholder.com/800x400/${theme.primaryColor.replace('#', '')}/FFFFFF?text=${theme.name}`;
  
  // Color swatches based on the theme's colors
  const colors = [
    { name: 'Primary', color: theme.primaryColor },
    { name: 'Secondary', color: theme.secondaryColor },
    { name: 'Accent', color: theme.accentColor },
    { name: 'Background', color: '#ffffff' },
    { name: 'Text', color: '#333333' },
  ];
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{theme.name}</span>
            <div className="flex gap-2">
              <Badge variant="outline">{theme.category}</Badge>
              {theme.isNew && <Badge variant="destructive">New</Badge>}
              <Badge variant={theme.price === 'free' ? 'secondary' : 'default'}>
                {theme.price === 'free' ? 'Free' : `$${theme.price}`}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription className="text-base">{theme.description}</DialogDescription>
        </DialogHeader>
        
        <div className="mt-2">
          <div 
            className="w-full h-56 bg-center bg-cover rounded-md mb-4" 
            style={{ 
              backgroundImage: `url(${previewImage})`,
              backgroundColor: theme.primaryColor,
            }}
          />
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full mb-4 grid grid-cols-4 md:grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Theme Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Author</h4>
                      <p className="text-sm text-muted-foreground">{theme.author}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Created</h4>
                      <p className="text-sm text-muted-foreground">{theme.createdAt}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {theme.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Theme Settings</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Primary Font: </span>
                        <span className="font-medium">{theme.fontPrimary}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Heading Font: </span>
                        <span className="font-medium">{theme.fontHeading}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Border Radius: </span>
                        <span className="font-medium">{theme.borderRadius}px</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Preview This Theme</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  See how this theme affects components, typography, and colors by exploring the tabs above.
                </p>
              </div>
            </TabsContent>
            
            {/* Components Tab */}
            <TabsContent value="components" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Buttons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <VariantAwareButton variant="primary" size="md">Primary</VariantAwareButton>
                    <VariantAwareButton variant="secondary" size="md">Secondary</VariantAwareButton>
                    <VariantAwareButton variant="outline" size="md">Outline</VariantAwareButton>
                    <VariantAwareButton variant="ghost" size="md">Ghost</VariantAwareButton>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cards</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <VariantAwareCard variant="primary" size="sm">
                      <p className="text-sm">Primary Card</p>
                    </VariantAwareCard>
                    <VariantAwareCard variant="secondary" size="sm">
                      <p className="text-sm">Secondary Card</p>
                    </VariantAwareCard>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Form Elements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <VariantAwareInput 
                      placeholder="Input field" 
                      variant="default"
                    />
                    <div className="flex flex-wrap gap-2 items-center">
                      <VariantAwareBadge variant="primary">Primary Badge</VariantAwareBadge>
                      <VariantAwareBadge variant="secondary">Secondary Badge</VariantAwareBadge>
                      <VariantAwareBadge variant="outline">Outline Badge</VariantAwareBadge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Typography Tab */}
            <TabsContent value="typography" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Typography</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Primary Font</h4>
                    <div 
                      className="p-4 border rounded-md" 
                      style={{ fontFamily: theme.fontPrimary }}
                    >
                      <p className="mb-2">The quick brown fox jumps over the lazy dog.</p>
                      <p className="text-sm text-muted-foreground">
                        Font: {theme.fontPrimary}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Heading Font</h4>
                    <div 
                      className="p-4 border rounded-md" 
                      style={{ fontFamily: theme.fontHeading }}
                    >
                      <h1 className="text-2xl font-bold mb-2">Heading Example</h1>
                      <p className="text-sm text-muted-foreground">
                        Font: {theme.fontHeading}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Typography Scale</h4>
                    <div className="space-y-2 p-4 border rounded-md">
                      <div>
                        <h1 className="text-4xl font-bold" style={{ fontFamily: theme.fontHeading }}>Heading 1</h1>
                        <p className="text-sm text-muted-foreground">4xl / Bold / {theme.fontHeading}</p>
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold" style={{ fontFamily: theme.fontHeading }}>Heading 2</h2>
                        <p className="text-sm text-muted-foreground">3xl / Bold / {theme.fontHeading}</p>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold" style={{ fontFamily: theme.fontHeading }}>Heading 3</h3>
                        <p className="text-sm text-muted-foreground">2xl / Bold / {theme.fontHeading}</p>
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold" style={{ fontFamily: theme.fontHeading }}>Heading 4</h4>
                        <p className="text-sm text-muted-foreground">xl / Semibold / {theme.fontHeading}</p>
                      </div>
                      <div>
                        <p className="text-base" style={{ fontFamily: theme.fontPrimary }}>Body Text</p>
                        <p className="text-sm text-muted-foreground">base / Regular / {theme.fontPrimary}</p>
                      </div>
                      <div>
                        <p className="text-sm" style={{ fontFamily: theme.fontPrimary }}>Small Text</p>
                        <p className="text-sm text-muted-foreground">sm / Regular / {theme.fontPrimary}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Color Palette</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Primary color */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Primary Color</h4>
                      <div 
                        className="h-20 rounded-md flex items-center justify-center text-white"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        <span className="font-medium">{theme.primaryColor}</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1 h-10">
                        {[90, 80, 60, 40, 20].map(opacity => (
                          <div 
                            key={opacity}
                            className="h-full rounded flex items-center justify-center text-xs"
                            style={{ 
                              backgroundColor: theme.primaryColor,
                              opacity: opacity / 100
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Secondary color */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Secondary Color</h4>
                      <div 
                        className="h-20 rounded-md flex items-center justify-center text-white"
                        style={{ backgroundColor: theme.secondaryColor }}
                      >
                        <span className="font-medium">{theme.secondaryColor}</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1 h-10">
                        {[90, 80, 60, 40, 20].map(opacity => (
                          <div 
                            key={opacity}
                            className="h-full rounded flex items-center justify-center text-xs"
                            style={{ 
                              backgroundColor: theme.secondaryColor,
                              opacity: opacity / 100
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Accent color */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Accent Color</h4>
                      <div 
                        className="h-20 rounded-md flex items-center justify-center text-white"
                        style={{ backgroundColor: theme.accentColor }}
                      >
                        <span className="font-medium">{theme.accentColor}</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1 h-10">
                        {[90, 80, 60, 40, 20].map(opacity => (
                          <div 
                            key={opacity}
                            className="h-full rounded flex items-center justify-center text-xs"
                            style={{ 
                              backgroundColor: theme.accentColor,
                              opacity: opacity / 100
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Background to text contrast example */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Background & Text</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div 
                          className="h-20 rounded-md flex items-center justify-center"
                          style={{ 
                            backgroundColor: '#ffffff',
                            color: '#333333',
                            border: '1px solid #e2e8f0' 
                          }}
                        >
                          <span className="font-medium">Light Mode</span>
                        </div>
                        <div 
                          className="h-20 rounded-md flex items-center justify-center text-white"
                          style={{ 
                            backgroundColor: '#1a1a1a',
                            color: '#ffffff'
                          }}
                        >
                          <span className="font-medium">Dark Mode</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Color Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* UI Elements */}
                    <div 
                      className="p-4 rounded-md"
                      style={{ 
                        backgroundColor: '#ffffff',
                        border: `1px solid ${theme.primaryColor}` 
                      }}
                    >
                      <h4 className="text-sm font-medium mb-2">Light Mode UI</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: theme.primaryColor }}
                          />
                          <span className="text-sm">Primary Element</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: theme.secondaryColor }}
                          />
                          <span className="text-sm">Secondary Element</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: theme.accentColor }}
                          />
                          <span className="text-sm">Accent Element</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Dark Mode UI */}
                    <div 
                      className="p-4 rounded-md text-white"
                      style={{ 
                        backgroundColor: '#1a1a1a',
                      }}
                    >
                      <h4 className="text-sm font-medium mb-2">Dark Mode UI</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-full"
                            style={{ 
                              backgroundColor: theme.primaryColor,
                              opacity: 0.9
                            }}
                          />
                          <span className="text-sm">Primary Element</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-full"
                            style={{ 
                              backgroundColor: theme.secondaryColor,
                              opacity: 0.9
                            }}
                          />
                          <span className="text-sm">Secondary Element</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-full"
                            style={{ 
                              backgroundColor: theme.accentColor,
                              opacity: 0.9
                            }}
                          />
                          <span className="text-sm">Accent Element</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="mt-6 gap-2 sm:gap-0">
          {theme.price !== 'free' && (
            <p className="text-sm text-muted-foreground mr-auto">
              One-time purchase of ${theme.price}
            </p>
          )}
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onApply(theme.id)}>
            {theme.price === 'free' ? 'Apply Theme' : 'Purchase & Apply'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}