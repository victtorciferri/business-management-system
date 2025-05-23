import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ColorEditor } from '@/components/theme-editor/ColorEditor';
import { TypographyEditor } from '@/components/theme-editor/TypographyEditor';
import { SpacingEditor } from '@/components/theme-editor/SpacingEditor';
import { ColorPalette, generatePaletteFromColor } from '@/../../shared/colorUtils';
import { TypographySettings, defaultTypographySettings } from '@/../../shared/typographyUtils';
import { SpacingSettings, defaultSpacingSettings } from '@/../../shared/spacingUtils';
import { Palette, Type, Box, Grid, Layout, Eye, Save, Undo, PanelLeft, Download, Upload } from 'lucide-react';

interface ThemeOption {
  id: number;
  name: string;
  primaryColor: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
}

export default function ThemeEditorPage() {
  const [activeTab, setActiveTab] = useState('colors');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null);
  const [typographySettings, setTypographySettings] = useState<TypographySettings>(defaultTypographySettings);
  const [spacingSettings, setSpacingSettings] = useState<SpacingSettings>(defaultSpacingSettings);
  const [isDirty, setIsDirty] = useState(false);
  
  // State for saved themes
  const [availableThemes, setAvailableThemes] = useState<ThemeOption[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('new');
  const [isLoading, setIsLoading] = useState(false);
  
  // Load available themes on component mount
  useEffect(() => {
    const loadThemes = async () => {
      try {
        setIsLoading(true);
        
        // Get the current user to verify authentication
        const userResponse = await fetch('/api/user');
        if (!userResponse.ok) {
          console.log('Not authenticated or no user found');
          return;
        }
        
        const userData = await userResponse.json();
        if (!userData || !userData.id) {
          console.log('No valid user data found');
          return;
        }
        
        // Fetch themes for the current business
        const themesResponse = await fetch('/api/themes');
        if (!themesResponse.ok) {
          throw new Error('Failed to load themes');
        }
        
        const themesData = await themesResponse.json();
        setAvailableThemes(themesData.themes || []);
        
        // If there's at least one theme and none is selected, select the active one
        if (themesData.themes && themesData.themes.length > 0) {
          const activeTheme = themesData.themes.find((theme: ThemeOption) => theme.isActive);
          if (activeTheme && selectedThemeId === 'new') {
            setSelectedThemeId(String(activeTheme.id));
          }
        }
      } catch (error) {
        console.error('Error loading themes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadThemes();
  }, []);
  
  // Load a specific theme when selected
  useEffect(() => {
    const loadTheme = async () => {
      if (selectedThemeId === 'new') {
        // Reset to defaults for a new theme
        handleReset();
        return;
      }
      
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/themes/${selectedThemeId}`);
        if (!response.ok) {
          throw new Error('Failed to load theme');
        }
        
        const themeData = await response.json();
        
        // Apply the loaded theme data
        if (themeData.primaryColor) {
          setPrimaryColor(themeData.primaryColor);
        }
        
        if (themeData.colorPalette) {
          setColorPalette(themeData.colorPalette);
        } else if (themeData.primaryColor) {
          // Generate palette from primary color if none exists
          const generatedPalette = generatePaletteFromColor(themeData.primaryColor);
          setColorPalette(generatedPalette);
        }
        
        if (themeData.typographySettings) {
          setTypographySettings(themeData.typographySettings);
        }
        
        if (themeData.spacingSettings) {
          setSpacingSettings(themeData.spacingSettings);
        }
        
        // Reset dirty state as we just loaded a saved theme
        setIsDirty(false);
      } catch (error) {
        console.error('Error loading theme:', error);
        alert('Failed to load the selected theme');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTheme();
  }, [selectedThemeId]);

  // Handle color change
  const handleColorChange = (color: string) => {
    setPrimaryColor(color);
    setIsDirty(true);
  };

  // Handle palette change
  const handlePaletteChange = (palette: ColorPalette) => {
    setColorPalette(palette);
    setIsDirty(true);
  };
  
  // Handle typography settings change
  const handleTypographyChange = (settings: TypographySettings) => {
    setTypographySettings(settings);
    setIsDirty(true);
  };
  
  // Handle spacing settings change
  const handleSpacingChange = (settings: SpacingSettings) => {
    setSpacingSettings(settings);
    setIsDirty(true);
  };

  // Handle save
  const handleSave = async () => {
    console.log('Saving theme with primary color:', primaryColor);
    console.log('Color palette:', colorPalette);
    console.log('Typography settings:', typographySettings);
    console.log('Spacing settings:', spacingSettings);
    
    try {
      // Get current user/business
      const userResponse = await fetch('/api/user');
      if (!userResponse.ok) {
        throw new Error('Failed to get current user. Please log in.');
      }
      
      const userData = await userResponse.json();
      
      if (!userData || !userData.id) {
        throw new Error('No user data available.');
      }
      
      // Save the theme
      const response = await fetch('/api/themes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId: userData.id,
          businessSlug: userData.businessSlug || 'default',
          name: 'Custom Theme',
          description: 'Theme created in Theme Editor',
          primaryColor,
          colorPalette,
          typographySettings,
          spacingSettings,
          isDefault: false,
          isActive: true // Set as active by default
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save theme.');
      }
      
      const savedTheme = await response.json();
      console.log('Theme saved successfully:', savedTheme);
      
      // Show success message
      alert('Theme saved successfully and set as active.');
      
      setIsDirty(false);
    } catch (error) {
      console.error('Error saving theme:', error);
      alert('Failed to save theme: ' + error.message);
    }
  };
  
  // Handle reset
  const handleReset = () => {
    setPrimaryColor('#4f46e5');
    setColorPalette(null);
    setTypographySettings(defaultTypographySettings);
    setSpacingSettings(defaultSpacingSettings);
    setIsDirty(false);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Theme Editor</h1>
          <p className="text-muted-foreground">
            Customize your theme with advanced color controls, typography settings, and more.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="theme-select">Theme</Label>
            <Select 
              value={selectedThemeId} 
              onValueChange={setSelectedThemeId}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Create New Theme</SelectItem>
                {availableThemes.map(theme => (
                  <SelectItem key={theme.id} value={String(theme.id)}>
                    {theme.name} {theme.isActive && '(Active)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={!isDirty || isLoading} onClick={handleReset}>
              <Undo className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!isDirty || isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Theme
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left sidebar with theme sections */}
        <div className="col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>Configure all aspects of your theme</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="colors" orientation="vertical" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full rounded-none border-r h-auto flex flex-col items-stretch space-y-0 space-x-0">
                  <TabsTrigger value="colors" className="justify-start">
                    <Palette className="mr-2 h-4 w-4" />
                    Colors
                  </TabsTrigger>
                  <TabsTrigger value="typography" className="justify-start">
                    <Type className="mr-2 h-4 w-4" />
                    Typography
                  </TabsTrigger>
                  <TabsTrigger value="spacing" className="justify-start">
                    <Layout className="mr-2 h-4 w-4" />
                    Spacing
                  </TabsTrigger>
                  <TabsTrigger value="borders" className="justify-start">
                    <Box className="mr-2 h-4 w-4" />
                    Borders
                  </TabsTrigger>
                  <TabsTrigger value="components" className="justify-start">
                    <Grid className="mr-2 h-4 w-4" />
                    Components
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="justify-start">
                    <Eye className="mr-2 h-4 w-4" />
                    Live Preview
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Main content area */}
        <div className="col-span-9">
          <TabsContent value="colors" className="mt-0">
            <ColorEditor 
              initialColor={primaryColor} 
              onChange={handleColorChange} 
              onPaletteChange={handlePaletteChange} 
            />
          </TabsContent>

          <TabsContent value="typography" className="mt-0">
            <TypographyEditor 
              initialSettings={typographySettings}
              onChange={handleTypographyChange}
            />
          </TabsContent>

          <TabsContent value="spacing" className="mt-0">
            <SpacingEditor 
              initialSettings={spacingSettings}
              onChange={handleSpacingChange}
            />
          </TabsContent>

          <TabsContent value="borders" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Borders & Shadows</CardTitle>
                <CardDescription>
                  Configure border radius, widths, and shadow styles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Border and shadow settings will be implemented in the next phase.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="components" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Component Tokens</CardTitle>
                <CardDescription>
                  Customize specific components in your design system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Component token settings will be implemented in the next phase.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Live Theme Preview</CardTitle>
                <CardDescription>
                  See your theme changes applied to all components in real-time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Typography Preview</h3>
                  <div className="space-y-4 border rounded-md p-6">
                    <h1 className="text-4xl font-bold">Heading 1</h1>
                    <h2 className="text-3xl font-bold">Heading 2</h2>
                    <h3 className="text-2xl font-semibold">Heading 3</h3>
                    <h4 className="text-xl font-semibold">Heading 4</h4>
                    <h5 className="text-lg font-medium">Heading 5</h5>
                    <h6 className="text-base font-medium">Heading 6</h6>
                    <Separator className="my-4" />
                    <p className="text-base">
                      This is a paragraph with <strong>bold text</strong>, <em>italic text</em>, and a{' '}
                      <a href="#" className="text-primary underline">link</a>. The typography settings
                      you've configured will affect how all text appears throughout your application.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This is smaller text often used for secondary information.
                    </p>
                    <div className="bg-muted p-4 rounded-md">
                      <code className="text-sm font-mono">This is a code block that uses the monospace font.</code>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex gap-2">
                      <Button variant="default">Primary Button</Button>
                      <Button variant="secondary">Secondary Button</Button>
                      <Button variant="outline">Outline Button</Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Color Palette Preview</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {colorPalette && Object.entries(colorPalette.shades)
                      .filter(([key]) => ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'].includes(key))
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([shade, details]) => (
                        <div key={shade} className="text-center">
                          <div 
                            className="w-full h-12 rounded-md mb-1 border"
                            style={{ backgroundColor: details.value }}
                          ></div>
                          <p className="text-xs font-medium">{shade}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </div>
    </div>
  );
}