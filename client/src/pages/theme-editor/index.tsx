import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ColorEditor } from '@/components/theme-editor/ColorEditor';
import { ColorPalette } from '@/../../shared/colorUtils';
import { Palette, Type, Box, Grid, Layout, Eye, Save, Undo, PanelLeft } from 'lucide-react';

export default function ThemeEditorPage() {
  const [activeTab, setActiveTab] = useState('colors');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null);
  const [isDirty, setIsDirty] = useState(false);

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

  // Handle save
  const handleSave = () => {
    console.log('Saving theme with primary color:', primaryColor);
    console.log('Color palette:', colorPalette);
    setIsDirty(false);
    // This is where we would integrate with the API to save the theme
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
        <div className="flex gap-2">
          <Button variant="outline" disabled={!isDirty}>
            <Undo className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!isDirty}>
            <Save className="mr-2 h-4 w-4" />
            Save Theme
          </Button>
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
            <Card>
              <CardHeader>
                <CardTitle>Typography</CardTitle>
                <CardDescription>
                  Configure text styles, font families, and type scale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Typography settings will be implemented in the next phase.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spacing" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Spacing</CardTitle>
                <CardDescription>
                  Adjust spacing tokens and layout variables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Spacing settings will be implemented in the next phase.
                </p>
              </CardContent>
            </Card>
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
              <CardContent>
                <p className="text-muted-foreground">
                  Live preview functionality will be implemented in the next phase.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </div>
    </div>
  );
}