import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Theme } from '@shared/config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Paintbrush, LayoutGrid, Undo2, Save, Eye, Palette, EyeOff, Settings2, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import ThemePreview from './ThemePreview';
import ColorPicker from './ColorPicker';
import ColorExtractor from './ColorExtractor';
import ThemePresetSelector from './ThemePresetSelector';

interface BusinessThemeEditorProps {
  className?: string;
  isAdminMode?: boolean;
  businessId?: number;
  initialTheme?: Theme;
  onSaveTheme?: (theme: Theme) => Promise<void>;
  onSave?: () => void;
}

/**
 * BusinessThemeEditor Component
 * 
 * The main editor for customizing the business theme.
 * It combines different customization components with a live preview.
 * 
 * Can operate in two modes:
 * 1. Normal mode - Uses the ThemeContext for state and saving
 * 2. Admin mode - Uses local state and external save handlers to update a business theme as admin
 */
export const BusinessThemeEditor: React.FC<BusinessThemeEditorProps> = ({
  className,
  isAdminMode = false,
  businessId,
  initialTheme,
  onSaveTheme,
  onSave
}) => {
  const themeContext = useTheme();
  const { toast } = useToast();
  
  // Local state for admin mode
  // Use a more complete default theme with properly typed properties
  const [adminTheme, setAdminTheme] = useState<Theme>(initialTheme || {
    name: "Default Theme",
    primaryColor: "#4f46e5",
    secondaryColor: "#9333EA",
    accentColor: "#f59e0b",
    backgroundColor: "#FFFFFF",
    textColor: "#111827",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: 8,
    spacing: 16,
    buttonStyle: "default",
    cardStyle: "default",
    appearance: "system",
    variant: "professional",
    customCSS: ""
  });
  const [adminIsSaving, setAdminIsSaving] = useState(false);
  const [adminOriginalTheme, setAdminOriginalTheme] = useState<Theme>(adminTheme);
  
  // Use local state in admin mode, otherwise use context
  const theme = isAdminMode ? adminTheme : themeContext.theme;
  const isSaving = isAdminMode ? adminIsSaving : themeContext.isSaving;
  const hasUnsavedChanges = isAdminMode 
    ? JSON.stringify(adminTheme) !== JSON.stringify(adminOriginalTheme)
    : themeContext.hasUnsavedChanges;
  const isPreviewMode = isAdminMode ? false : themeContext.isPreviewMode;
  
  // Update functions for admin mode
  const updateTheme = useCallback((updates: Partial<Theme>) => {
    if (isAdminMode) {
      setAdminTheme(prev => ({ ...prev, ...updates }));
    } else {
      themeContext.updateTheme(updates);
    }
  }, [isAdminMode, themeContext]);
  
  const resetTheme = useCallback(() => {
    if (isAdminMode) {
      setAdminTheme(adminOriginalTheme);
      toast({
        title: "Theme reset",
        description: "Your changes have been discarded and the theme has been reset.",
      });
    } else {
      themeContext.resetTheme();
    }
  }, [isAdminMode, adminOriginalTheme, toast, themeContext]);
  
  const saveTheme = useCallback(async () => {
    if (isAdminMode) {
      try {
        setAdminIsSaving(true);
        let result;
        
        // Prefer using ThemeContext's saveThemeForBusiness if available and we have a business ID
        if (themeContext.saveThemeForBusiness && businessId) {
          console.log('Using ThemeContext.saveThemeForBusiness for business ID:', businessId);
          result = await themeContext.saveThemeForBusiness(businessId, adminTheme);
          
          if (!result.success) {
            throw new Error(result.error || 'Failed to save theme for business');
          }
        } 
        // Fall back to props handler if context method isn't available
        else if (onSaveTheme) {
          console.log('Using onSaveTheme prop handler');
          await onSaveTheme(adminTheme);
          result = { success: true };
        } 
        // No save method available
        else {
          console.error('No save method available in admin mode');
          throw new Error('No save method available');
        }
        
        setAdminOriginalTheme(adminTheme);
        
        toast({
          title: "Theme saved",
          description: "The business theme has been saved successfully.",
        });
        
        if (onSave) {
          onSave();
        }
        
        return result;
      } catch (error: any) {
        console.error('Error saving theme in admin mode:', error);
        toast({
          title: "Error saving theme",
          description: error.message || "There was a problem saving the theme. Please try again.",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      } finally {
        setAdminIsSaving(false);
      }
    } else {
      // Use the context's saveTheme method for normal mode
      return themeContext.saveTheme();
    }
  }, [isAdminMode, adminTheme, businessId, onSaveTheme, onSave, themeContext, toast]);
  
  const setPreviewMode = isAdminMode 
    ? () => {} // No-op in admin mode
    : themeContext.setPreviewMode;
  
  const [activeTab, setActiveTab] = useState('colors');
  const [showPreviewControls, setShowPreviewControls] = useState(false);

  // Helper function to handle numeric slider changes
  const handleNumericChange = (field: keyof Theme, value: number[]) => {
    updateTheme({ [field]: value[0] });
  };

  // Font families available for selection
  const fontFamilies = [
    'Inter, system-ui, sans-serif',
    'Poppins, sans-serif',
    'Playfair Display, serif',
    'Montserrat, sans-serif',
    'Lato, sans-serif',
    'Roboto, sans-serif',
    'Open Sans, sans-serif',
    'Manrope, sans-serif',
    'Plus Jakarta Sans, sans-serif',
    'Nunito, sans-serif',
  ];

  // Available button styles
  const buttonStyles = [
    { value: 'default', label: 'Default' },
    { value: 'rounded', label: 'Rounded' },
    { value: 'square', label: 'Square' },
    { value: 'pill', label: 'Pill' }
  ];

  // Available card styles
  const cardStyles = [
    { value: 'default', label: 'Default' },
    { value: 'elevated', label: 'Elevated' },
    { value: 'flat', label: 'Flat' },
    { value: 'bordered', label: 'Bordered' }
  ];

  // Available appearance modes
  const appearanceModes = [
    { value: 'light', label: 'Light Mode' },
    { value: 'dark', label: 'Dark Mode' },
    { value: 'system', label: 'System Default' }
  ];

  // Toggle preview mode
  const togglePreviewMode = () => {
    setPreviewMode(!isPreviewMode);
  };

  // Handle colors extracted from logo
  const handleColorsExtracted = (colors: Partial<Theme>) => {
    updateTheme(colors);
  };

  return (
    <div className={cn("flex flex-col lg:flex-row gap-6", className)}>
      {/* Editor Panel */}
      <Card className={cn(
        "flex-1 overflow-hidden transition-all duration-300",
        isPreviewMode ? "lg:w-0 lg:flex-none lg:opacity-0 lg:invisible" : "lg:w-1/2 lg:opacity-100 lg:visible"
      )}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Theme Editor</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetTheme}
                disabled={!hasUnsavedChanges || isSaving}
              >
                <Undo2 className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={saveTheme}
                disabled={!hasUnsavedChanges || isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
          
          {hasUnsavedChanges && (
            <Alert className="mb-4">
              <AlertDescription>
                You have unsaved changes. Click 'Save Changes' to apply them.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-6 w-full">
              <TabsTrigger value="presets" className="flex items-center">
                <Palette className="mr-2 h-4 w-4" />
                Presets
              </TabsTrigger>
              <TabsTrigger value="colors" className="flex items-center">
                <Paintbrush className="mr-2 h-4 w-4" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="layout" className="flex items-center">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center">
                <Settings2 className="mr-2 h-4 w-4" />
                Advanced
              </TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-[600px] pr-4">
              <TabsContent value="presets" className="mt-0">
                <ThemePresetSelector 
                  onSelectPreset={(preset) => {
                    updateTheme(preset);
                  }}
                />
              </TabsContent>
              
              <TabsContent value="colors" className="space-y-6 mt-0">
                <div>
                  <h3 className="text-base font-semibold mb-4">Theme Colors</h3>
                  
                  <div className="space-y-4">
                    <ColorPicker
                      label="Primary Color"
                      color={theme?.primaryColor || "#4f46e5"}
                      onChange={(color) => updateTheme({ primaryColor: color })}
                      description="The main color of your brand, used for primary buttons and elements"
                    />
                    
                    <ColorPicker
                      label="Secondary Color"
                      color={theme?.secondaryColor || "#9333EA"}
                      onChange={(color) => updateTheme({ secondaryColor: color })}
                      description="The supporting color used for secondary elements and accents"
                    />
                    
                    <ColorPicker
                      label="Accent Color"
                      color={theme?.accentColor || "#f59e0b"}
                      onChange={(color) => updateTheme({ accentColor: color })}
                      description="An additional highlight color for special elements and emphasis"
                    />
                    
                    <ColorPicker
                      label="Background Color"
                      color={theme?.backgroundColor || "#FFFFFF"}
                      onChange={(color) => updateTheme({ backgroundColor: color })}
                      description="The main background color of your site"
                    />
                    
                    <ColorPicker
                      label="Text Color"
                      color={theme?.textColor || "#111827"}
                      onChange={(color) => updateTheme({ textColor: color })}
                      description="The primary text color that will be used throughout your site"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <ColorExtractor onSelectColors={handleColorsExtracted} />
              </TabsContent>
              
              <TabsContent value="layout" className="space-y-6 mt-0">
                <div>
                  <h3 className="text-base font-semibold mb-4">Layout & Typography</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="fontFamily">Font Family</Label>
                        <span className="text-xs text-muted-foreground">
                          {theme?.fontFamily ? theme.fontFamily.split(',')[0] : 'Default'}
                        </span>
                      </div>
                      <Select
                        value={theme?.fontFamily || 'Inter, system-ui, sans-serif'}
                        onValueChange={(value) => updateTheme({ fontFamily: value })}
                      >
                        <SelectTrigger id="fontFamily" className="w-full">
                          <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                        <SelectContent>
                          {fontFamilies.map((font) => (
                            <SelectItem
                              key={font}
                              value={font}
                              style={{ fontFamily: font }}
                            >
                              {font.split(',')[0]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="borderRadius">Border Radius</Label>
                        <span className="text-xs text-muted-foreground">{theme?.borderRadius || 8}px</span>
                      </div>
                      <Slider
                        id="borderRadius"
                        min={0}
                        max={24}
                        step={1}
                        value={[theme?.borderRadius || 8]}
                        onValueChange={(value) => handleNumericChange('borderRadius', value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="spacing">Spacing</Label>
                        <span className="text-xs text-muted-foreground">{theme?.spacing || 16}px</span>
                      </div>
                      <Slider
                        id="spacing"
                        min={4}
                        max={32}
                        step={2}
                        value={[theme?.spacing || 16]}
                        onValueChange={(value) => handleNumericChange('spacing', value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="buttonStyle">Button Style</Label>
                      <Select
                        value={theme?.buttonStyle || 'default'}
                        onValueChange={(value) => 
                          updateTheme({ 
                            buttonStyle: value as 'default' | 'rounded' | 'square' | 'pill' 
                          })
                        }
                      >
                        <SelectTrigger id="buttonStyle" className="w-full">
                          <SelectValue placeholder="Button style" />
                        </SelectTrigger>
                        <SelectContent>
                          {buttonStyles.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardStyle">Card Style</Label>
                      <Select
                        value={theme?.cardStyle || 'default'}
                        onValueChange={(value) => 
                          updateTheme({ 
                            cardStyle: value as 'default' | 'elevated' | 'flat' | 'bordered' 
                          })
                        }
                      >
                        <SelectTrigger id="cardStyle" className="w-full">
                          <SelectValue placeholder="Card style" />
                        </SelectTrigger>
                        <SelectContent>
                          {cardStyles.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="advanced" className="space-y-6 mt-0">
                <div>
                  <h3 className="text-base font-semibold mb-4">Advanced Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="themeName">Theme Name</Label>
                      <Input
                        id="themeName"
                        value={theme?.name || "Default Theme"}
                        onChange={(e) => updateTheme({ name: e.target.value })}
                        placeholder="My Custom Theme"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="appearance">Appearance Mode</Label>
                      <Select
                        value={theme?.appearance || "system"}
                        onValueChange={(value) => 
                          updateTheme({ 
                            appearance: value as 'light' | 'dark' | 'system' 
                          })
                        }
                      >
                        <SelectTrigger id="appearance" className="w-full">
                          <SelectValue placeholder="Appearance mode" />
                        </SelectTrigger>
                        <SelectContent>
                          {appearanceModes.map((mode) => (
                            <SelectItem key={mode.value} value={mode.value}>
                              {mode.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="variant">Theme Variant</Label>
                      <Select
                        value={theme?.variant || 'professional'}
                        onValueChange={(value) => 
                          updateTheme({ 
                            variant: value as 'professional' | 'tint' | 'vibrant' | 'custom' 
                          })
                        }
                      >
                        <SelectTrigger id="variant" className="w-full">
                          <SelectValue placeholder="Theme variant" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="tint">Tint</SelectItem>
                          <SelectItem value="vibrant">Vibrant</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Affects how color intensities are applied throughout the interface
                      </p>
                    </div>
                    
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="customCSS">Custom CSS</Label>
                          <p className="text-xs text-muted-foreground">
                            Add custom CSS rules to further customize your theme
                          </p>
                        </div>
                      </div>
                      <textarea
                        id="customCSS"
                        value={theme?.customCSS || ''}
                        onChange={(e) => updateTheme({ customCSS: e.target.value })}
                        className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                        placeholder="/* Custom CSS rules */"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </Card>
      
      {/* Preview Panel */}
      <Card className={cn(
        "flex-1 overflow-hidden transition-all duration-300",
        isPreviewMode ? "w-full" : "lg:w-1/2"
      )}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Theme Preview</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowPreviewControls(!showPreviewControls)}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                {showPreviewControls ? 'Hide Controls' : 'Controls'}
              </Button>
              <Button 
                variant={isPreviewMode ? "default" : "outline"}
                size="sm" 
                onClick={togglePreviewMode}
              >
                {isPreviewMode ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Exit Full Preview
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Full Preview
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <ThemePreview 
            theme={theme} 
            className="w-full" 
          />
          
          {showPreviewControls && (
            <div className="mt-6 flex justify-end">
              <Button 
                variant="default"
                size="sm" 
                onClick={saveTheme}
                disabled={!hasUnsavedChanges || isSaving}
              >
                <Heart className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save This Theme'}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default BusinessThemeEditor;