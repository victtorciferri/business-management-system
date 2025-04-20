import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Theme } from '@shared/config';
import { ThemePreset, getPresetCategories, getPresetsByCategory } from '@shared/themePresets';
import { cn } from '@/lib/utils';
import { CheckIcon, InfoIcon, SparklesIcon } from 'lucide-react';

interface ThemePresetSelectorProps {
  onSelectPreset: (theme: Theme) => void;
  className?: string;
}

/**
 * ThemePresetSelector Component
 * 
 * Provides a selection of industry-specific theme presets.
 * Organized by categories with previews and descriptions.
 */
export const ThemePresetSelector: React.FC<ThemePresetSelectorProps> = ({
  onSelectPreset,
  className
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('beauty');
  const [categories, setCategories] = useState<string[]>([]);
  const [presets, setPresets] = useState<ThemePreset[]>([]);

  // Load categories and presets on mount
  useEffect(() => {
    const allCategories = getPresetCategories();
    setCategories(allCategories);
    if (!activeCategory && allCategories.length > 0) {
      setActiveCategory(allCategories[0]);
    }
  }, [activeCategory]);

  // Update presets when category changes
  useEffect(() => {
    if (activeCategory) {
      const categoryPresets = getPresetsByCategory(activeCategory);
      setPresets(categoryPresets);
      // Reset selection when changing categories
      setSelectedPreset(null);
    }
  }, [activeCategory]);

  // Handle preset selection
  const handleSelectPreset = (preset: ThemePreset) => {
    setSelectedPreset(preset.id);
    
    // Simply pass the theme directly without mapping for backward compatibility
    // This is a cleaner approach when not prioritizing backward compatibility
    console.log("Selected preset theme:", preset.theme);
    onSelectPreset(preset.theme);
  };

  // Format category name for display
  const formatCategoryName = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Render color swatch for preset
  const renderPresetSwatch = (preset: ThemePreset) => {
    return (
      <div className="flex gap-1">
        <div 
          className="h-4 w-4 rounded-full" 
          style={{ backgroundColor: preset.theme.primaryColor }}
        />
        <div 
          className="h-4 w-4 rounded-full" 
          style={{ backgroundColor: preset.theme.secondaryColor }}
        />
        <div 
          className="h-4 w-4 rounded-full" 
          style={{ backgroundColor: preset.theme.accentColor }}
        />
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col space-y-1.5">
        <h3 className="text-base font-semibold">Theme Presets</h3>
        <p className="text-sm text-muted-foreground">
          Select from professionally designed themes for your industry
        </p>
      </div>
      
      <Tabs 
        value={activeCategory} 
        onValueChange={setActiveCategory}
        className="w-full"
      >
        <TabsList className="mb-4 w-full justify-start overflow-auto">
          {categories.map((category) => (
            <TabsTrigger 
              key={category} 
              value={category}
              className="min-w-fit"
            >
              {formatCategoryName(category)}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map((category) => (
          <TabsContent 
            key={category} 
            value={category}
            className="mt-0"
          >
            <ScrollArea className="h-[370px] pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {getPresetsByCategory(category).map((preset) => (
                  <Card 
                    key={preset.id} 
                    className={cn(
                      "cursor-pointer hover:shadow-md transition-shadow border-2",
                      selectedPreset === preset.id 
                        ? "border-primary" 
                        : "border-transparent"
                    )}
                    onClick={() => handleSelectPreset(preset)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{preset.name}</CardTitle>
                        {renderPresetSwatch(preset)}
                      </div>
                      <CardDescription className="text-xs">
                        {preset.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      {/* Preview area with components styled in the preset's theme */}
                      <div 
                        className="rounded-md p-3 space-y-2"
                        style={{ 
                          backgroundColor: preset.theme.backgroundColor,
                          color: preset.theme.textColor
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div 
                            className="text-sm font-semibold"
                            style={{ color: preset.theme.primaryColor }}
                          >
                            Preview
                          </div>
                          <Badge 
                            variant="outline"
                            style={{ 
                              borderColor: preset.theme.accentColor,
                              color: preset.theme.accentColor
                            }}
                          >
                            {preset.theme.variant}
                          </Badge>
                        </div>
                        <div 
                          className="flex gap-2 text-xs"
                          style={{ 
                            fontFamily: preset.theme.fontFamily 
                          }}
                        >
                          <div
                            className="rounded-md px-2 py-1 text-white"
                            style={{ 
                              backgroundColor: preset.theme.primaryColor,
                              borderRadius: `${preset.theme.borderRadius}px`
                            }}
                          >
                            Primary
                          </div>
                          <div
                            className="rounded-md px-2 py-1 text-white"
                            style={{ 
                              backgroundColor: preset.theme.secondaryColor,
                              borderRadius: `${preset.theme.borderRadius}px`
                            }}
                          >
                            Secondary
                          </div>
                          <div
                            className="rounded-md px-2 py-1"
                            style={{ 
                              backgroundColor: preset.theme.accentColor,
                              borderRadius: `${preset.theme.borderRadius}px`,
                              color: ['#fff', '#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6'].includes(preset.theme.accentColor) 
                                ? '#000' : '#fff'
                            }}
                          >
                            Accent
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <InfoIcon className="h-4 w-4" />
                                  <span className="sr-only">Theme info</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Font: {preset.theme.fontFamily}</p>
                                <p className="text-xs">Border Radius: {preset.theme.borderRadius}px</p>
                                <p className="text-xs">Appearance: {preset.theme.appearance}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Button
                          size="sm"
                          variant={selectedPreset === preset.id ? "default" : "outline"}
                          onClick={() => handleSelectPreset(preset)}
                          className="gap-1.5"
                        >
                          {selectedPreset === preset.id ? (
                            <>
                              <CheckIcon className="h-3.5 w-3.5" />
                              Selected
                            </>
                          ) : (
                            <>
                              <SparklesIcon className="h-3.5 w-3.5" />
                              Apply
                            </>
                          )}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ThemePresetSelector;