import React, { useState, useEffect } from 'react';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Grid } from '@/components/ui/layout';
import { ColorPicker } from './ColorPicker';
import { PaletteSuggestions } from './PaletteSuggestions';
import { FontSelector } from './FontSelector';

interface ThemeEditorProps {
  onPreview?: (themeConfig: any) => void;
  onSave?: () => void;
}

export function ThemeEditor({ onPreview, onSave }: ThemeEditorProps) {
  const { business, config, refreshBusinessData } = useBusinessContext();
  const { toast } = useToast();
  
  // Theme settings state
  const [themeSettings, setThemeSettings] = useState({
    primaryColor: config.primaryColor || '#4f46e5',
    secondaryColor: config.secondaryColor || '#06b6d4',
    accentColor: config.accentColor || '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    fontFamily: 'Inter, sans-serif',
    borderRadius: 6,
    buttonStyle: 'default',
    cardStyle: 'default',
    industryType: config.industryType || 'general',
    logoPosition: 'left',
    navbarStyle: 'simple',
    footerStyle: 'standard',
  });
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('colors');
  
  // Live preview state
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  
  // Load current theme settings when business data changes
  useEffect(() => {
    if (business) {
      setThemeSettings(prev => ({
        ...prev,
        primaryColor: config.primaryColor || prev.primaryColor,
        secondaryColor: config.secondaryColor || prev.secondaryColor,
        accentColor: config.accentColor || prev.accentColor,
        industryType: config.industryType || prev.industryType,
      }));
    }
  }, [business, config]);
  
  // Handle color change
  const handleColorChange = (colorType: string, color: string) => {
    setThemeSettings(prev => ({
      ...prev,
      [colorType]: color
    }));
    
    if (isPreviewActive && onPreview) {
      onPreview({
        ...themeSettings,
        [colorType]: color
      });
    }
  };
  
  // Handle any input change
  const handleInputChange = (field: string, value: string | number | boolean) => {
    setThemeSettings(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (isPreviewActive && onPreview) {
      onPreview({
        ...themeSettings,
        [field]: value
      });
    }
  };
  
  // Toggle live preview
  const togglePreview = () => {
    setIsPreviewActive(!isPreviewActive);
    
    if (!isPreviewActive && onPreview) {
      onPreview(themeSettings);
    }
  };
  
  // Save theme settings
  const saveThemeSettings = async () => {
    if (!business) return;
    
    setIsSaving(true);
    
    try {
      // Update theme settings
      await apiRequest('/api/business/theme-settings', {
        method: 'PATCH',
        body: JSON.stringify({
          themeSettings: {
            primaryColor: themeSettings.primaryColor,
            secondaryColor: themeSettings.secondaryColor,
            accentColor: themeSettings.accentColor,
            textColor: themeSettings.textColor,
            backgroundColor: themeSettings.backgroundColor,
            fontFamily: themeSettings.fontFamily,
            borderRadius: themeSettings.borderRadius ? `rounded-[${themeSettings.borderRadius}px]` : 'rounded-md',
            buttonStyle: themeSettings.buttonStyle === 'default' ? 'rounded' : themeSettings.buttonStyle,
            cardStyle: themeSettings.cardStyle === 'default' ? 'elevated' : themeSettings.cardStyle
          }
        })
      });
      
      // Update industry type if it's specified
      if (themeSettings.industryType && themeSettings.industryType !== config.industryType) {
        await apiRequest('/api/business/industry-type', {
          method: 'PATCH',
          body: JSON.stringify({
            industryType: themeSettings.industryType
          })
        });
      }
      
      // Refresh business data to get updated theme
      await refreshBusinessData();
      
      toast({
        title: 'Theme saved',
        description: 'Your theme settings have been saved successfully.',
      });
      
      if (onSave) onSave();
    } catch (error) {
      console.error('Error saving theme settings:', error);
      toast({
        title: 'Error saving theme',
        description: 'There was a problem saving your theme settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Reset theme settings
  const resetThemeSettings = () => {
    setThemeSettings({
      primaryColor: '#4f46e5',
      secondaryColor: '#06b6d4',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      fontFamily: 'Inter, sans-serif',
      borderRadius: 6,
      buttonStyle: 'default',
      cardStyle: 'default',
      industryType: config.industryType || 'general',
      logoPosition: 'left',
      navbarStyle: 'simple',
      footerStyle: 'standard',
    });
    
    if (isPreviewActive && onPreview) {
      onPreview({
        primaryColor: '#4f46e5',
        secondaryColor: '#06b6d4',
        accentColor: '#f59e0b',
        backgroundColor: '#ffffff',
        textColor: '#111827',
        fontFamily: 'Inter, sans-serif',
        borderRadius: 6,
        buttonStyle: 'default',
        cardStyle: 'default',
        industryType: config.industryType || 'general',
        logoPosition: 'left',
        navbarStyle: 'simple',
        footerStyle: 'standard',
      });
    }
    
    toast({
      title: 'Theme reset',
      description: 'Theme settings have been reset to defaults.',
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Theme Customization</CardTitle>
        <CardDescription>
          Customize the appearance of your business portal and customer-facing pages
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-6">
          <TabsContent value="colors" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Brand Colors</h3>
              <Grid cols={3} className="gap-8">
                <div className="space-y-3">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <ColorPicker 
                    id="primaryColor"
                    color={themeSettings.primaryColor} 
                    onChange={(color) => handleColorChange('primaryColor', color)} 
                  />
                  <p className="text-sm text-muted-foreground">
                    Used for primary buttons, active states, and links
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <ColorPicker 
                    id="secondaryColor"
                    color={themeSettings.secondaryColor} 
                    onChange={(color) => handleColorChange('secondaryColor', color)} 
                  />
                  <p className="text-sm text-muted-foreground">
                    Used for secondary elements and accents
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <ColorPicker 
                    id="accentColor"
                    color={themeSettings.accentColor} 
                    onChange={(color) => handleColorChange('accentColor', color)} 
                  />
                  <p className="text-sm text-muted-foreground">
                    Used for highlights and call-to-action elements
                  </p>
                </div>
              </Grid>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Suggested Color Palettes</h3>
              <p className="text-sm text-muted-foreground">
                Choose from pre-designed color palettes or create your own
              </p>
              <PaletteSuggestions 
                currentPalette={{
                  primary: themeSettings.primaryColor,
                  secondary: themeSettings.secondaryColor,
                  accent: themeSettings.accentColor
                }}
                onSelect={(palette) => {
                  setThemeSettings(prev => ({
                    ...prev,
                    primaryColor: palette.primary,
                    secondaryColor: palette.secondary,
                    accentColor: palette.accent
                  }));
                  
                  if (isPreviewActive && onPreview) {
                    onPreview({
                      ...themeSettings,
                      primaryColor: palette.primary,
                      secondaryColor: palette.secondary,
                      accentColor: palette.accent
                    });
                  }
                }}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="typography" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Fonts</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fontFamily">Font Family</Label>
                  <FontSelector 
                    id="fontFamily"
                    value={themeSettings.fontFamily}
                    onChange={(font) => handleInputChange('fontFamily', font)}
                  />
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Text Colors</h3>
              <Grid cols={2} className="gap-8">
                <div className="space-y-3">
                  <Label htmlFor="textColor">Main Text Color</Label>
                  <ColorPicker 
                    id="textColor"
                    color={themeSettings.textColor} 
                    onChange={(color) => handleColorChange('textColor', color)} 
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <ColorPicker 
                    id="backgroundColor"
                    color={themeSettings.backgroundColor} 
                    onChange={(color) => handleColorChange('backgroundColor', color)} 
                  />
                </div>
              </Grid>
            </div>
          </TabsContent>
          
          <TabsContent value="layout" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Layout Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="logoPosition">Logo Position</Label>
                  <Select 
                    value={themeSettings.logoPosition}
                    onValueChange={(value) => handleInputChange('logoPosition', value)}
                  >
                    <SelectTrigger id="logoPosition" className="w-full">
                      <SelectValue placeholder="Select logo position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="navbarStyle">Navigation Bar Style</Label>
                  <Select 
                    value={themeSettings.navbarStyle}
                    onValueChange={(value) => handleInputChange('navbarStyle', value)}
                  >
                    <SelectTrigger id="navbarStyle" className="w-full">
                      <SelectValue placeholder="Select navbar style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="expanded">Expanded</SelectItem>
                      <SelectItem value="transparent">Transparent</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="footerStyle">Footer Style</Label>
                  <Select 
                    value={themeSettings.footerStyle}
                    onValueChange={(value) => handleInputChange('footerStyle', value)}
                  >
                    <SelectTrigger id="footerStyle" className="w-full">
                      <SelectValue placeholder="Select footer style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="expanded">Expanded</SelectItem>
                      <SelectItem value="centered">Centered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Spacing & Rounding</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="borderRadius">Border Radius</Label>
                    <span className="text-sm text-muted-foreground">{themeSettings.borderRadius}px</span>
                  </div>
                  <Slider
                    id="borderRadius"
                    min={0}
                    max={20}
                    step={1}
                    value={[themeSettings.borderRadius]}
                    onValueChange={(values) => handleInputChange('borderRadius', values[0])}
                  />
                  <p className="text-sm text-muted-foreground">
                    Controls the roundness of buttons, cards, and other UI elements
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="components" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Component Styles</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="buttonStyle">Button Style</Label>
                  <Select 
                    value={themeSettings.buttonStyle}
                    onValueChange={(value) => handleInputChange('buttonStyle', value)}
                  >
                    <SelectTrigger id="buttonStyle" className="w-full">
                      <SelectValue placeholder="Select button style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="pill">Pill</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="cardStyle">Card Style</Label>
                  <Select 
                    value={themeSettings.cardStyle}
                    onValueChange={(value) => handleInputChange('cardStyle', value)}
                  >
                    <SelectTrigger id="cardStyle" className="w-full">
                      <SelectValue placeholder="Select card style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="elevated">Elevated</SelectItem>
                      <SelectItem value="bordered">Bordered</SelectItem>
                      <SelectItem value="flat">Flat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Industry Template</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="industryType">Industry Type</Label>
                  <Select 
                    value={themeSettings.industryType}
                    onValueChange={(value) => handleInputChange('industryType', value)}
                  >
                    <SelectTrigger id="industryType" className="w-full">
                      <SelectValue placeholder="Select industry type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="salon">Salon & Beauty</SelectItem>
                      <SelectItem value="fitness">Fitness & Wellness</SelectItem>
                      <SelectItem value="medical">Medical & Health</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-2">
                    Changing the industry type will adjust the layout and components to best fit your business type
                  </p>
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Custom CSS</h3>
              <div className="space-y-2">
                <Label htmlFor="customCss">Custom CSS (Advanced)</Label>
                <div className="relative">
                  <textarea
                    id="customCss"
                    className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                    placeholder="/* Add your custom CSS here */"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  For advanced users only. Add custom CSS to override default styles.
                </p>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="flex justify-between border-t p-6">
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={resetThemeSettings}
          >
            Reset to Defaults
          </Button>
          <div className="flex items-center space-x-2">
            <Switch 
              id="preview-mode" 
              checked={isPreviewActive}
              onCheckedChange={togglePreview}
            />
            <Label htmlFor="preview-mode">Live Preview</Label>
          </div>
        </div>
        <Button 
          onClick={saveThemeSettings}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Theme'}
        </Button>
      </CardFooter>
    </Card>
  );
}