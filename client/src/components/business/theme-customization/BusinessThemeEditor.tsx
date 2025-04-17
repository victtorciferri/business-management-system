import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useTheme, Theme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Save, RefreshCw, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ColorPicker from "./ColorPicker";
import ThemePreview from "./ThemePreview";
import ColorExtractor from "./ColorExtractor";

// Define font options
const FONT_OPTIONS = [
  { value: "Inter", label: "Inter (Sans-serif)" },
  { value: "Roboto", label: "Roboto (Sans-serif)" },
  { value: "Poppins", label: "Poppins (Modern)" },
  { value: "Lora", label: "Lora (Serif)" },
  { value: "Montserrat", label: "Montserrat (Clean)" },
  { value: "Open Sans", label: "Open Sans (Readable)" },
  { value: "Playfair Display", label: "Playfair Display (Elegant)" },
  { value: "Raleway", label: "Raleway (Light)" },
  { value: "Source Sans Pro", label: "Source Sans Pro (Clear)" },
  { value: "Nunito", label: "Nunito (Rounded)" }
];

interface BusinessThemeEditorProps {
  businessId?: number;
  initialTheme?: Theme;
  onSave?: (theme: Theme) => void;
  onCancel?: () => void;
  readOnly?: boolean;
}

export function BusinessThemeEditor({
  businessId,
  initialTheme,
  onSave,
  onCancel,
  readOnly = false
}: BusinessThemeEditorProps) {
  const { toast } = useToast();
  const { businessTheme, updateBusinessTheme } = useTheme();
  
  // Use initialTheme if provided, otherwise use the current theme from context
  const [theme, setTheme] = useState<Theme>(initialTheme || businessTheme);
  const [previewTheme, setPreviewTheme] = useState<Theme>(theme);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("colors");
  
  // Reset to the current theme when initialTheme changes (e.g. from API)
  useEffect(() => {
    if (initialTheme) {
      setTheme(initialTheme);
      setPreviewTheme(initialTheme);
      setIsDirty(false);
    }
  }, [initialTheme]);
  
  // Update a single theme property and mark as dirty
  const updateThemeProperty = <K extends keyof Theme>(key: K, value: Theme[K]) => {
    setTheme(prevTheme => {
      const newTheme = { ...prevTheme, [key]: value };
      setPreviewTheme(newTheme);
      setIsDirty(true);
      return newTheme;
    });
  };
  
  // Update multiple theme properties at once
  const updateThemeProperties = (updates: Partial<Theme>) => {
    setTheme(prevTheme => {
      const newTheme = { ...prevTheme, ...updates };
      setPreviewTheme(newTheme);
      setIsDirty(true);
      return newTheme;
    });
  };
  
  // Extract colors from an uploaded image
  const handleColorExtraction = (colors: string[]) => {
    if (colors.length >= 2) {
      updateThemeProperties({
        primary: colors[0],
        secondary: colors[1],
        ...(colors[2] && { text: colors[2] })
      });
      
      toast({
        title: "Colors extracted",
        description: "Brand colors have been applied from your logo.",
      });
    }
  };
  
  // Reset to the current business theme
  const handleReset = () => {
    setTheme(businessTheme);
    setPreviewTheme(businessTheme);
    setIsDirty(false);
    
    toast({
      title: "Theme reset",
      description: "All changes have been discarded.",
    });
  };
  
  // Save theme changes
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // If onSave callback is provided, use it
      if (onSave) {
        await onSave(theme);
      } 
      // Otherwise update via the theme context
      else {
        updateBusinessTheme(theme);
      }
      
      setIsDirty(false);
      
      toast({
        title: "Theme saved",
        description: "Your theme changes have been applied.",
      });
    } catch (error) {
      console.error("Failed to save theme:", error);
      setSaveError("Failed to save theme. Please try again.");
      
      toast({
        variant: "destructive",
        title: "Error saving theme",
        description: "There was a problem saving your theme changes.",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="business-theme-editor w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Editor</CardTitle>
              <CardDescription>
                Customize the look and feel of your business site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="typography">Typography</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
                
                {/* Colors tab */}
                <TabsContent value="colors" className="space-y-6">
                  <div className="space-y-4">
                    <ColorExtractor onColorsExtracted={handleColorExtraction} />
                    
                    <Separator className="my-4" />
                    
                    <ColorPicker
                      label="Primary Color"
                      description="Main brand color used for buttons, headings, and accents"
                      value={theme.primary}
                      onChange={(color) => updateThemeProperty("primary", color)}
                    />
                    
                    <ColorPicker
                      label="Secondary Color"
                      description="Used for secondary elements and highlights"
                      value={theme.secondary}
                      onChange={(color) => updateThemeProperty("secondary", color)}
                    />
                    
                    <ColorPicker
                      label="Text Color"
                      description="Main text color"
                      value={theme.text}
                      onChange={(color) => updateThemeProperty("text", color)}
                    />
                    
                    <ColorPicker
                      label="Background Color"
                      description="Main background color"
                      value={theme.background}
                      onChange={(color) => updateThemeProperty("background", color)}
                    />
                  </div>
                </TabsContent>
                
                {/* Typography tab */}
                <TabsContent value="typography" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fontFamily">Font Family</Label>
                      <Select 
                        value={theme.font} 
                        onValueChange={(value) => updateThemeProperty("font", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_OPTIONS.map(font => (
                            <SelectItem key={font.value} value={font.value}>
                              <span style={{ fontFamily: font.value }}>{font.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="appearance">Dark Mode</Label>
                        <Select 
                          value={theme.appearance} 
                          onValueChange={(value) => updateThemeProperty("appearance", value as "light" | "dark" | "system")}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light Mode</SelectItem>
                            <SelectItem value="dark">Dark Mode</SelectItem>
                            <SelectItem value="system">System Preference</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Choose light mode, dark mode, or follow system preference
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Layout tab */}
                <TabsContent value="layout" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="borderRadius">Border Radius</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Slider 
                          defaultValue={[parseFloat(theme.borderRadius || "0.375") * 16]} 
                          max={16} 
                          step={1}
                          onValueChange={(values) => {
                            const value = values[0];
                            updateThemeProperty("borderRadius", `${value / 16}rem`);
                          }}
                        />
                        <Input 
                          value={theme.borderRadius} 
                          onChange={(e) => updateThemeProperty("borderRadius", e.target.value)}
                          className="w-24 font-mono"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Adjust the roundness of corners (0 for square, 0.5rem for rounded)
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="spacing">Base Spacing</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Slider 
                          defaultValue={[parseFloat(theme.spacing || "1")]} 
                          max={2} 
                          min={0.5}
                          step={0.125}
                          onValueChange={(values) => {
                            const value = values[0];
                            updateThemeProperty("spacing", `${value}rem`);
                          }}
                        />
                        <Input 
                          value={theme.spacing} 
                          onChange={(e) => updateThemeProperty("spacing", e.target.value)}
                          className="w-24 font-mono"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Adjust the default spacing between elements
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Advanced tab */}
                <TabsContent value="advanced" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="themeName">Theme Name</Label>
                      <Input 
                        id="themeName" 
                        value={theme.name} 
                        onChange={(e) => updateThemeProperty("name", e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Give your theme a custom name
                      </p>
                    </div>
                    
                    {/* These features are planned for future implementation
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="enableAnimations" 
                          checked={false} 
                          onCheckedChange={(checked) => {}} 
                        />
                        <Label htmlFor="enableAnimations">Enable animations</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Toggle animations and transitions
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="reducedMotion" 
                          checked={false} 
                          onCheckedChange={(checked) => {}} 
                        />
                        <Label htmlFor="reducedMotion">Reduced motion</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enable for users who prefer reduced motion
                      </p>
                    </div>
                    */}
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Action buttons */}
              {!readOnly && (
                <div className="mt-6 flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={handleReset}
                    disabled={!isDirty || isSaving}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                  
                  <Button 
                    onClick={handleSave} 
                    disabled={!isDirty || isSaving}
                  >
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              {/* Save error message */}
              {saveError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{saveError}</AlertDescription>
                </Alert>
              )}
              
              {/* Save success message */}
              {!isDirty && !saveError && !isSaving && (
                <Alert className="mt-4 bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">Theme saved successfully.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Preview panel */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See how your theme will look across different elements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemePreview 
                previewTheme={previewTheme} 
                showControls={false} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}