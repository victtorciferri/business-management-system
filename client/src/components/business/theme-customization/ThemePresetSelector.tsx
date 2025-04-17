import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Theme } from '@shared/themeSchema';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Interface for the theme preset from API
interface ThemePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  theme: Theme;
}

interface ThemePresetSelectorProps {
  currentTheme: Theme;
  onSelectPreset: (preset: Theme) => void;
}

/**
 * ThemePresetSelector component
 * 
 * Displays a grid of theme preset cards organized by category
 * Allows users to preview and select a theme preset
 */
export function ThemePresetSelector({ currentTheme, onSelectPreset }: ThemePresetSelectorProps) {
  const { toast } = useToast();
  const [selectedPreset, setSelectedPreset] = useState<Theme | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [tab, setTab] = useState<string>('salon');

  // Fetch theme presets from API
  const { data, isLoading, error } = useQuery<{ 
    presets: ThemePreset[],
    categories: string[] 
  }>({
    queryKey: ['/api/themes/presets'],
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const presets = data?.presets || [] as ThemePreset[];
  const apiCategories = data?.categories || [];

  // Create categories map from API response
  const categories: Record<string, ThemePreset[]> = {};
  
  // Initialize categories with empty arrays
  if (apiCategories.length > 0) {
    apiCategories.forEach(category => {
      categories[category] = [];
    });
    
    // Add 'dark' category if not included
    if (!categories['dark']) {
      categories['dark'] = [];
    }
    
    // Populate categories
    presets.forEach(preset => {
      if (categories[preset.category]) {
        categories[preset.category].push(preset);
      }
    });
  } else {
    // Fallback categorization if API doesn't provide categories
    categories.salon = presets.filter(preset => preset.category === 'salon');
    categories.fitness = presets.filter(preset => preset.category === 'fitness');
    categories.medical = presets.filter(preset => preset.category === 'medical');
    categories.professional = presets.filter(preset => preset.category === 'professional');
    categories.dark = presets.filter(preset => preset.category === 'dark');
  }

  // Preview a preset by selecting it
  const handlePreview = (preset: Theme, presetId: string) => {
    setSelectedPreset(preset);
    setSelectedPresetId(presetId);
  };

  // Find selected preset from presets array
  const findSelectedPreset = (): ThemePreset | undefined => {
    if (!selectedPresetId) return undefined;
    return presets.find(p => p.id === selectedPresetId);
  };

  // Apply the selected preset
  const handleApply = () => {
    if (selectedPreset) {
      onSelectPreset(selectedPreset);
      const presetObj = findSelectedPreset();
      const name = presetObj?.name || selectedPreset.name;
      toast({
        title: "Theme preset applied",
        description: `"${name}" theme has been applied to your business.`,
      });
    }
  };

  // Display a preview swatch showing theme colors
  const ColorSwatch = ({ color, label }: { color: string; label: string }) => (
    <div className="flex flex-col items-center">
      <div 
        className="h-8 w-8 rounded-md border mb-1" 
        style={{ backgroundColor: color }}
      />
      <span className="text-xs">{label}</span>
    </div>
  );

  // Render a preview card for each theme preset
  const PresetCard = ({ preset }: { preset: ThemePreset }) => {
    const themeData = preset.theme;
    const isSelected = selectedPresetId === preset.id;
    const isCurrentTheme = currentTheme?.name === themeData.name;
    
    return (
      <Card 
        className={`
          cursor-pointer transition-all overflow-hidden
          ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
          ${isCurrentTheme ? 'border-primary' : ''}
        `}
        onClick={() => handlePreview(themeData, preset.id)}
      >
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm">{preset.name}</CardTitle>
          <CardDescription className="text-xs">{preset.description}</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div 
            className="rounded-md w-full h-16 mb-2"
            style={{ 
              backgroundColor: themeData.background,
              border: `1px solid ${themeData.text}20`
            }}
          >
            <div 
              className="rounded-md px-3 py-2 text-xs" 
              style={{ 
                backgroundColor: themeData.primary,
                color: '#fff'
              }}
            >
              Primary
            </div>
            <div 
              className="rounded-md px-3 py-1 mt-1 mx-2 text-xs inline-block" 
              style={{ 
                backgroundColor: themeData.secondary,
                color: '#fff'
              }}
            >
              Secondary
            </div>
          </div>
          <div className="flex justify-between mt-3">
            <ColorSwatch color={themeData.primary} label="Primary" />
            <ColorSwatch color={themeData.secondary} label="Secondary" />
            <ColorSwatch color={themeData.background} label="Bg" />
            <ColorSwatch color={themeData.text} label="Text" />
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading theme presets...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error loading theme presets</div>;
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="salon" value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="salon">Salon</TabsTrigger>
          <TabsTrigger value="fitness">Fitness</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="professional">Business</TabsTrigger>
          <TabsTrigger value="dark">Dark</TabsTrigger>
        </TabsList>
        
        {Object.entries(categories).map(([category, categoryPresets]) => (
          <TabsContent key={category} value={category} className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryPresets.map((preset: ThemePreset) => (
                  <PresetCard key={preset.id} preset={preset} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>

      {selectedPreset && (
        <div className="flex justify-between items-center border-t pt-4 mt-4">
          <div>
            <h3 className="font-medium">{findSelectedPreset()?.name || selectedPreset.name}</h3>
            <p className="text-sm text-muted-foreground">Select this theme preset?</p>
          </div>
          <Button onClick={handleApply}>
            Apply Theme
          </Button>
        </div>
      )}
    </div>
  );
}