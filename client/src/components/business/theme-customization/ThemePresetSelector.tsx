import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Theme } from '@shared/themeSchema';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

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
  const [tab, setTab] = useState<string>('general');

  // Fetch theme presets from API
  const { data, isLoading, error } = useQuery<{ presets: Theme[] }>({
    queryKey: ['/api/themes/presets'],
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const presets = data?.presets || [] as Theme[];

  // Extract preset categories based on naming convention
  const categories: Record<string, Theme[]> = {
    general: presets.filter((preset: Theme) => 
      !preset.name.includes('Salon') && 
      !preset.name.includes('Fitness') && 
      !preset.name.includes('Medical') && 
      !preset.name.includes('Spa') &&
      !preset.name.includes('Mode')),
    industry: presets.filter((preset: Theme) => 
      preset.name.includes('Salon') || 
      preset.name.includes('Fitness') || 
      preset.name.includes('Medical') || 
      preset.name.includes('Spa')),
    dark: presets.filter((preset: Theme) => 
      preset.name.includes('Dark') || 
      preset.name.includes('Night')),
  };

  // Preview a preset by selecting it
  const handlePreview = (preset: Theme) => {
    setSelectedPreset(preset);
  };

  // Apply the selected preset
  const handleApply = () => {
    if (selectedPreset) {
      onSelectPreset(selectedPreset);
      toast({
        title: "Theme preset applied",
        description: `"${selectedPreset.name}" theme has been applied to your business.`,
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
  const PresetCard = ({ preset }: { preset: Theme }) => {
    const isSelected = selectedPreset?.name === preset.name;
    const isCurrentTheme = currentTheme?.name === preset.name;
    
    return (
      <Card 
        className={`
          cursor-pointer transition-all overflow-hidden
          ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
          ${isCurrentTheme ? 'border-primary' : ''}
        `}
        onClick={() => handlePreview(preset)}
      >
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm">{preset.name}</CardTitle>
          <CardDescription className="text-xs">{preset.font}</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div 
            className="rounded-md w-full h-16 mb-2"
            style={{ 
              backgroundColor: preset.background,
              border: `1px solid ${preset.text}20`
            }}
          >
            <div 
              className="rounded-md px-3 py-2 text-xs" 
              style={{ 
                backgroundColor: preset.primary,
                color: '#fff'
              }}
            >
              Primary
            </div>
            <div 
              className="rounded-md px-3 py-1 mt-1 mx-2 text-xs inline-block" 
              style={{ 
                backgroundColor: preset.secondary,
                color: '#fff'
              }}
            >
              Secondary
            </div>
          </div>
          <div className="flex justify-between mt-3">
            <ColorSwatch color={preset.primary} label="Primary" />
            <ColorSwatch color={preset.secondary} label="Secondary" />
            <ColorSwatch color={preset.background} label="Bg" />
            <ColorSwatch color={preset.text} label="Text" />
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
      <Tabs defaultValue="general" value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="industry">Industry-specific</TabsTrigger>
          <TabsTrigger value="dark">Dark Themes</TabsTrigger>
        </TabsList>
        
        {Object.entries(categories).map(([category, categoryPresets]) => (
          <TabsContent key={category} value={category} className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryPresets.map((preset: Theme) => (
                  <PresetCard key={preset.name} preset={preset} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>

      {selectedPreset && (
        <div className="flex justify-between items-center border-t pt-4 mt-4">
          <div>
            <h3 className="font-medium">{selectedPreset.name}</h3>
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