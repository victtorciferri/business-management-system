import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useThemeManager } from '@/hooks/use-theme-manager';
import { useBusinessTheme } from '@/providers/MultiTenantThemeProvider';
import { useDarkMode } from '@/hooks/use-theme-variables';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from '../business/theme-customization/ColorPicker';
import { ThemePresetSelector } from '../business/theme-customization/ThemePresetSelector';
import { FontSelector } from '../business/theme-customization/FontSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Paintbrush, Palette, LayoutGrid, Settings2, 
  Moon, Sun, Monitor, Save, EyeOff, Eye, Undo2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import the theme-aware components
import { ThemeAwareButton } from '../theme-aware/ThemeAwareButton';
import { VariantAwareButton } from '../theme-aware/VariantAwareButton';
import { VariantAwareCard } from '../theme-aware/VariantAwareCard';
import { VariantAwareBadge } from '../theme-aware/VariantAwareBadge';
import { ThemeTokenPreview } from '../theme-aware/ThemeTokenPreview';

// Type for theme data (with proper type safety for database fields)
interface ThemeData {
  id?: number;
  name?: string | null;
  primary?: string | null;
  primaryColor?: string | null;
  secondary?: string | null;
  secondaryColor?: string | null;
  background?: string | null;
  backgroundColor?: string | null;
  text?: string | null;
  textColor?: string | null;
  accent?: string | null;
  accentColor?: string | null;
  fontFamily?: string | null;
  variant?: string | null;
  fontSize?: number | null;
  highContrast?: boolean | null;
  reducedMotion?: boolean | null;
  borderRadius?: number | null;
  isActive?: boolean | null;
  isDefault?: boolean | null;
  logoImageUrl?: string | null;
  // Extra properties from the database
  businessId?: number | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  popularity?: number | null;
  // For component styling
  style?: string | null;
  // This allows for other properties that might come from the API
  [key: string]: any;
}

interface ModernThemeEditorProps {
  businessId?: number | null;
  businessData?: any;
  onPreviewToggle?: (isPreviewActive: boolean) => void;
}

export function ModernThemeEditor({ businessId, businessData, onPreviewToggle }: ModernThemeEditorProps) {
  const { toast } = useToast();
  const { isDarkMode, toggleDarkMode, preference, setPreference } = useDarkMode();
  
  // Get business theme data from the context
  const businessThemeContext = useBusinessTheme();
  
  // Get theme manager for API interactions
  const themeManager = useThemeManager();
  
  // Local state
  const [activeTab, setActiveTab] = useState('colors');
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeData | null>(null);
  const [originalTheme, setOriginalTheme] = useState<ThemeData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize current theme from the active theme in the context
  useEffect(() => {
    const fetchActiveTheme = async () => {
      try {
        // Try to get active theme from business context first
        if (businessThemeContext.currentTheme) {
          setCurrentTheme(businessThemeContext.currentTheme);
          setOriginalTheme(businessThemeContext.currentTheme);
          return;
        }
        
        // If no active theme in business context, try to get from theme manager
        if (themeManager.currentTheme) {
          setCurrentTheme(themeManager.currentTheme);
          setOriginalTheme(themeManager.currentTheme);
          return;
        }
        
        // If still no theme, try to fetch active theme
        const activeTheme = await themeManager.getActiveTheme(businessId);
        if (activeTheme) {
          setCurrentTheme(activeTheme);
          setOriginalTheme(activeTheme);
        }
      } catch (error) {
        console.error('Error fetching active theme:', error);
      }
    };
    
    fetchActiveTheme();
  }, [businessThemeContext.currentTheme, themeManager.currentTheme, themeManager, businessId]);
  
  // Check for changes
  useEffect(() => {
    if (currentTheme && originalTheme) {
      // Compare essential theme properties instead of full JSON to avoid comparison issues with preset data
      const hasChanges = 
        currentTheme.primary !== originalTheme.primary ||
        currentTheme.secondary !== originalTheme.secondary ||
        currentTheme.accent !== originalTheme.accent ||
        currentTheme.background !== originalTheme.background ||
        currentTheme.text !== originalTheme.text ||
        currentTheme.fontFamily !== originalTheme.fontFamily ||
        currentTheme.variant !== originalTheme.variant ||
        currentTheme.borderRadius !== originalTheme.borderRadius ||
        currentTheme.highContrast !== originalTheme.highContrast ||
        currentTheme.reducedMotion !== originalTheme.reducedMotion;
        
      setHasUnsavedChanges(hasChanges);
    }
  }, [currentTheme, originalTheme]);
  
  // Toggle preview mode
  const togglePreview = useCallback(() => {
    setIsPreviewActive((prev: boolean) => {
      const newState = !prev;
      if (onPreviewToggle) {
        onPreviewToggle(newState);
      }
      return newState;
    });
  }, [onPreviewToggle]);
  
  // Update theme property
  const updateTheme = useCallback((updates: Partial<ThemeData>) => {
    setCurrentTheme((prev: ThemeData | null) => {
      if (!prev) return updates as ThemeData;
      return {
        ...prev,
        ...updates
      };
    });
    setHasUnsavedChanges(true);
  }, []);
  
  // Reset theme to original
  const resetTheme = useCallback(() => {
    setCurrentTheme(originalTheme);
    setHasUnsavedChanges(false);
    toast({
      title: "Theme reset",
      description: "Your changes have been discarded."
    });
  }, [originalTheme, toast]);
  
  // Save theme changes
  const saveTheme = useCallback(async () => {
    if (!currentTheme) return;
    
    try {
      setIsSaving(true);
      console.log("Saving theme:", currentTheme);
      
      // Cleanly map the theme according to 2025 Edition schema
      // This ensures consistent property naming regardless of source
      const cleanTheme = {
        name: currentTheme.name || "Custom Theme",
        primaryColor: currentTheme.primaryColor,
        secondaryColor: currentTheme.secondaryColor,
        accentColor: currentTheme.accentColor,
        backgroundColor: currentTheme.backgroundColor,
        textColor: currentTheme.textColor,
        fontFamily: currentTheme.fontFamily,
        borderRadius: currentTheme.borderRadius,
        spacing: currentTheme.spacing,
        buttonStyle: currentTheme.buttonStyle,
        cardStyle: currentTheme.cardStyle,
        appearance: currentTheme.appearance,
        variant: currentTheme.variant,
        customCSS: currentTheme.customCSS,
        // If there are legacy fields from the preset, normalize them
        ...(currentTheme.id ? { id: currentTheme.id } : {}),
      };
      
      console.log("Clean mapped theme for saving:", cleanTheme);
      
      // Use the appropriate save method depending on context
      let result;
      
      // If theme has an ID, it's an existing theme, so update it
      if (cleanTheme.id) {
        result = await themeManager.updateTheme(cleanTheme.id, cleanTheme);
      } else {
        // If no id exists, create a new theme
        const newTheme = {
          ...cleanTheme,
          businessId: businessId || undefined,
          isActive: true
        };
        result = await themeManager.createNewTheme(newTheme);
      }
      
      if (result) {
        setOriginalTheme(result);
        setCurrentTheme(result);
        setHasUnsavedChanges(false);
        toast({
          title: "Theme saved",
          description: "Your theme changes have been saved successfully."
        });
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      toast({
        title: "Error saving theme",
        description: "There was a problem saving your theme changes.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  }, [themeManager, currentTheme, businessId, toast]);
  
  // If there's no theme data yet, show a loading state
  if (!currentTheme) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Theme Editor</h2>
          <p className="text-muted-foreground">Customize your business theme</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled={!hasUnsavedChanges || isSaving}
            onClick={resetTheme}
          >
            <Undo2 className="mr-2 h-4 w-4" />
            Reset
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            disabled={!hasUnsavedChanges || isSaving}
            onClick={saveTheme}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm"
            disabled={isSaving}
            onClick={() => {
              // Override the hasUnsavedChanges check for cases where the button is stuck
              setHasUnsavedChanges(true);
              setTimeout(() => saveTheme(), 100);
            }}
          >
            <Save className="mr-2 h-4 w-4" />
            Force Save
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={togglePreview}
          >
            {isPreviewActive ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Exit Preview
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Unsaved changes alert */}
      {hasUnsavedChanges && (
        <Alert>
          <AlertDescription>
            You have unsaved changes. Click 'Save Changes' to apply them.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Main editor interface */}
      <div className={cn(
        "grid gap-6",
        isPreviewActive ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"
      )}>
        {/* Editor panel */}
        <div className={cn(
          "col-span-1 md:col-span-2",
          isPreviewActive ? "md:col-span-1" : "md:col-span-2"
        )}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                Customize colors, typography, and other design elements
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="presets" className="flex items-center">
                    <Palette className="mr-2 h-4 w-4" />
                    Presets
                  </TabsTrigger>
                  <TabsTrigger value="colors" className="flex items-center">
                    <Paintbrush className="mr-2 h-4 w-4" />
                    Colors
                  </TabsTrigger>
                  <TabsTrigger value="typography" className="flex items-center">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Typography
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="flex items-center">
                    <Settings2 className="mr-2 h-4 w-4" />
                    Advanced
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="presets" className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium mb-4">Theme Presets</h3>
                    <ThemePresetSelector 
                      onSelectPreset={(preset) => {
                        // Apply the preset theme
                        setCurrentTheme((prev) => {
                          if (!prev) return preset as ThemeData;
                          return {
                            ...prev,
                            ...preset,
                            // Make sure we preserve the ID and business ID
                            id: prev.id,
                            businessId: prev.businessId
                          };
                        });
                        
                        // Force enable save button
                        setHasUnsavedChanges(true);
                        
                        console.log("Preset selected, hasUnsavedChanges set to true");
                      }}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="colors" className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium mb-4">Color Mode</h3>
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        variant={preference === 'light' ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setPreference('light')}
                        className="flex items-center gap-2"
                      >
                        <Sun className="h-4 w-4" />
                        Light
                      </Button>
                      <Button 
                        variant={preference === 'dark' ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setPreference('dark')}
                        className="flex items-center gap-2"
                      >
                        <Moon className="h-4 w-4" />
                        Dark
                      </Button>
                      <Button 
                        variant={preference === 'system' ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setPreference('system')}
                        className="flex items-center gap-2"
                      >
                        <Monitor className="h-4 w-4" />
                        System
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-base font-medium mb-4">Brand Colors</h3>
                    
                    <ColorPicker
                      label="Primary Color"
                      color={currentTheme.primary || currentTheme.primaryColor || "#4f46e5"}
                      onChange={(color) => updateTheme({ primary: color, primaryColor: color })}
                      description="Main brand color, used for primary buttons and key UI elements"
                    />
                    
                    <ColorPicker
                      label="Secondary Color"
                      color={currentTheme.secondary || currentTheme.secondaryColor || "#9333EA"}
                      onChange={(color) => updateTheme({ secondary: color, secondaryColor: color })}
                      description="Supporting color used for secondary elements and accents"
                    />
                    
                    <ColorPicker
                      label="Accent Color"
                      color={currentTheme.accent || currentTheme.accentColor || "#f59e0b"}
                      onChange={(color) => updateTheme({ accent: color, accentColor: color })}
                      description="Highlight color for special elements and emphasis"
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-base font-medium mb-4">Interface Colors</h3>
                    
                    <ColorPicker
                      label="Background Color"
                      color={currentTheme.background || currentTheme.backgroundColor || "#FFFFFF"}
                      onChange={(color) => updateTheme({ background: color, backgroundColor: color })}
                      description="Main background color of your application"
                    />
                    
                    <ColorPicker
                      label="Text Color"
                      color={currentTheme.text || currentTheme.textColor || "#111827"}
                      onChange={(color) => updateTheme({ text: color, textColor: color })}
                      description="Primary text color for content"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="typography" className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium mb-4">Font Family</h3>
                    <FontSelector
                      value={currentTheme.fontFamily || "Inter, system-ui, sans-serif"}
                      onChange={(fontFamily) => updateTheme({ fontFamily })}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-base font-medium mb-4">Font Scale</h3>
                    <Select
                      defaultValue="normal"
                      onValueChange={(value) => {
                        const scale = value === 'large' ? 1.15 : value === 'small' ? 0.9 : 1;
                        updateTheme({ fontSize: scale });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select font scale" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium mb-4">Theme Variant</h3>
                    <Select
                      defaultValue={currentTheme.variant || "professional"}
                      onValueChange={(value) => updateTheme({ variant: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select theme variant" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="vibrant">Vibrant</SelectItem>
                        <SelectItem value="elegant">Elegant</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-2">
                      The variant affects the overall look and feel of components
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-base font-medium mb-4">Accessibility</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="high-contrast">High Contrast</Label>
                          <p className="text-sm text-muted-foreground">
                            Increase contrast for better readability
                          </p>
                        </div>
                        <Switch 
                          id="high-contrast" 
                          checked={currentTheme.highContrast || false}
                          onCheckedChange={(checked) => updateTheme({ highContrast: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="reduced-motion">Reduced Motion</Label>
                          <p className="text-sm text-muted-foreground">
                            Minimize animations and transitions
                          </p>
                        </div>
                        <Switch 
                          id="reduced-motion" 
                          checked={currentTheme.reducedMotion || false}
                          onCheckedChange={(checked) => updateTheme({ reducedMotion: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Preview panel */}
        {isPreviewActive && (
          <div className="col-span-1 md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Theme Preview</CardTitle>
                <CardDescription>
                  Preview how your theme will look with different components
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-base font-medium">Primary Colors</h3>
                  <div className="flex flex-wrap gap-3">
                    <div 
                      className="w-16 h-16 rounded-md border shadow-sm flex items-center justify-center text-xs font-medium"
                      style={{ backgroundColor: currentTheme.primary || currentTheme.primaryColor || "#4f46e5", color: "#FFF" }}
                    >
                      Primary
                    </div>
                    <div 
                      className="w-16 h-16 rounded-md border shadow-sm flex items-center justify-center text-xs font-medium"
                      style={{ backgroundColor: currentTheme.secondary || currentTheme.secondaryColor || "#9333EA", color: "#FFF" }}
                    >
                      Secondary
                    </div>
                    <div 
                      className="w-16 h-16 rounded-md border shadow-sm flex items-center justify-center text-xs font-medium"
                      style={{ backgroundColor: currentTheme.accent || currentTheme.accentColor || "#f59e0b", color: "#FFF" }}
                    >
                      Accent
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-base font-medium">Components</h3>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Buttons</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="default">Default Button</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Variant-Aware Buttons</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button size="lg">Large Button</Button>
                      <Button size="default">Medium</Button>
                      <Button size="sm">Small</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Cards</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Default Card</CardTitle>
                          <CardDescription>This is a default card component</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>Card content goes here</p>
                        </CardContent>
                      </Card>
                      
                      <Card className="shadow-lg">
                        <CardHeader>
                          <CardTitle>Elevated Card</CardTitle>
                          <CardDescription>This card has elevation</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>Card with shadow</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Badges</h4>
                    <div className="flex flex-wrap gap-3">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                        Success
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
                        Warning
                      </span>
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-red-900 dark:text-red-300">
                        Error
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                        Info
                      </span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Simple theme token preview instead of importing ThemeTokenPreview */}
                <div className="p-4 rounded-md border bg-gray-50 dark:bg-gray-900">
                  <h3 className="text-base font-medium mb-3">Theme Tokens Preview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium mb-1">Primary Color</div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: currentTheme.primary || currentTheme.primaryColor }}
                        ></div>
                        <span>{currentTheme.primary || currentTheme.primaryColor}</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Background</div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border" 
                          style={{ backgroundColor: currentTheme.background || currentTheme.backgroundColor }}
                        ></div>
                        <span>{currentTheme.background || currentTheme.backgroundColor}</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Font Family</div>
                      <div>{currentTheme.fontFamily || "System Default"}</div>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Theme Variant</div>
                      <div className="capitalize">{currentTheme.variant || "Default"}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}