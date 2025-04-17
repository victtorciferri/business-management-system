import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "../../../contexts/ThemeContext";
import { Theme as ContextTheme } from "../../../contexts/ThemeContext";
import { Theme } from "@shared/config";
import { ThemePresetSelector } from "./ThemePresetSelector";
import { ColorExtractor } from "./ColorExtractor";
import { FontSelector } from "./FontSelector";
import { Save, RefreshCw, Paintbrush, EyeIcon, Check, X as XIcon } from 'lucide-react';
import { applyTheme, resetTheme } from '../../../utils/applyTheme';

// Color picker with preview
const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (color: string) => void }) => {
  return (
    <div className="mb-4">
      <Label className="block mb-1">{label}</Label>
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-md border border-gray-300 shadow-sm" 
          style={{ backgroundColor: value }}
        />
        <input 
          type="color" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className="h-10"
        />
        <div className="text-sm font-mono">{value}</div>
      </div>
    </div>
  );
};

// Font selector is now imported from './FontSelector'

// Border radius selector component
const BorderRadiusSelector = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const radiusOptions = [
    { value: '0', label: 'None' },
    { value: '0.125rem', label: 'Extra Small (2px)' },
    { value: '0.25rem', label: 'Small (4px)' },
    { value: '0.375rem', label: 'Medium (6px)' },
    { value: '0.5rem', label: 'Large (8px)' },
    { value: '0.75rem', label: 'Extra Large (12px)' },
    { value: '1rem', label: 'Rounded (16px)' },
    { value: '9999px', label: 'Full' },
  ];

  return (
    <div className="mb-4">
      <Label htmlFor="border-radius" className="block mb-1">Border Radius</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="border-radius" className="w-full">
          <SelectValue placeholder="Select border radius" />
        </SelectTrigger>
        <SelectContent>
          {radiusOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="mt-2 h-10 border" style={{ borderRadius: value }}>
        <div className="w-full h-full flex items-center justify-center bg-muted">
          Preview
        </div>
      </div>
    </div>
  );
};

// Spacing selector component
const SpacingSelector = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const spacingOptions = [
    { value: '0.5rem', label: 'Compact (8px)' },
    { value: '0.75rem', label: 'Cozy (12px)' },
    { value: '1rem', label: 'Standard (16px)' },
    { value: '1.25rem', label: 'Comfortable (20px)' },
    { value: '1.5rem', label: 'Spacious (24px)' },
    { value: '2rem', label: 'Very Spacious (32px)' },
  ];

  return (
    <div className="mb-4">
      <Label htmlFor="spacing" className="block mb-1">Base Spacing</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="spacing" className="w-full">
          <SelectValue placeholder="Select spacing" />
        </SelectTrigger>
        <SelectContent>
          {spacingOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="mt-2 flex flex-col gap-2">
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-md bg-primary"></div>
          <div className="w-6 h-6 rounded-md bg-secondary" style={{ marginLeft: value }}></div>
        </div>
        <div className="text-xs text-muted-foreground">Elements spaced by {value}</div>
      </div>
    </div>
  );
};

// Theme preview card
const ThemePreview = ({ theme }: { theme: Theme }) => {
  return (
    <div className="border rounded-md p-4 mt-4">
      <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
        <EyeIcon className="h-4 w-4" />
        Theme Preview
      </h3>
      <div className="space-y-4">
        <div 
          className="w-full h-24 rounded-md flex items-center justify-center" 
          style={{ 
            backgroundColor: theme.primary, 
            color: '#fff',
            borderRadius: theme.borderRadius || '0.375rem',
            fontFamily: theme.font || 'Inter'
          }}
        >
          Primary Color
        </div>
        <div 
          className="w-full h-14 rounded-md flex items-center justify-center" 
          style={{ 
            backgroundColor: theme.secondary, 
            color: '#fff',
            borderRadius: theme.borderRadius || '0.375rem',
            fontFamily: theme.font || 'Inter'
          }}
        >
          Secondary Color
        </div>
        <div 
          className="w-full rounded-md flex flex-col items-center justify-center p-4" 
          style={{ 
            backgroundColor: theme.background, 
            color: theme.text,
            borderRadius: theme.borderRadius || '0.375rem',
            fontFamily: theme.font || 'Inter',
            padding: theme.spacing || '1rem'
          }}
        >
          <h4 className="text-lg font-semibold" style={{ color: theme.text }}>Background & Text</h4>
          <p style={{ color: theme.text, marginBottom: theme.spacing || '1rem' }}>
            This is how your text will appear on your background using {theme.font || 'Inter'} font.
          </p>
          <div className="flex gap-2" style={{ gap: theme.spacing || '1rem' }}>
            <Button 
              className="rounded-md" 
              style={{ 
                backgroundColor: theme.primary, 
                color: '#fff',
                borderRadius: theme.borderRadius || '0.375rem',
                fontFamily: theme.font || 'Inter'
              }}
            >
              Primary Button
            </Button>
            <Button 
              className="rounded-md" 
              variant="outline"
              style={{ 
                borderColor: theme.primary, 
                color: theme.primary,
                borderRadius: theme.borderRadius || '0.375rem',
                fontFamily: theme.font || 'Inter'
              }}
            >
              Outline Button
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-4 p-3 rounded border-dashed border-2 bg-muted/30 text-center">
        <p className="text-sm">This preview shows how your theme settings will appear on your business portal.</p>
      </div>
    </div>
  );
};

interface BusinessThemeEditorProps {
  onSave?: () => void;
  initialTheme?: Theme;
  businessId?: number | null;
  onSaveTheme?: (theme: Theme) => Promise<void>;
}

export function BusinessThemeEditor({ 
  onSave, 
  initialTheme,
  businessId,
  onSaveTheme 
}: BusinessThemeEditorProps) {
  const { toast } = useToast();
  const { businessTheme, updateBusinessTheme } = useTheme();
  const [theme, setTheme] = useState<Theme>({
    name: 'Custom Theme',
    primary: '#1E3A8A',
    secondary: '#9333EA',
    background: '#FFFFFF',
    text: '#111827',
    appearance: 'system',
    font: 'Inter',
    borderRadius: '0.375rem',
    spacing: '1rem'
  });
  const [loading, setLoading] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);

  // Load current theme when component mounts
  useEffect(() => {
    if (initialTheme) {
      // If an initialTheme prop is provided, use that (for admin view)
      setTheme(initialTheme);
    } else if (businessTheme) {
      // Otherwise use the theme from context (for business owner view)
      // Use the existing theme but fill in missing properties with defaults
      setTheme({
        ...businessTheme,
        name: businessTheme.name || 'Custom Theme',
        font: businessTheme.font || 'Inter',
        borderRadius: businessTheme.borderRadius || '0.375rem',
        spacing: businessTheme.spacing || '1rem'
      });
    }
  }, [businessTheme, initialTheme]);

  // Handle color changes
  const handleColorChange = (key: keyof Theme, value: string) => {
    setTheme((prev: Theme) => ({ ...prev, [key]: value }));
  };

  // Handle appearance mode toggle
  const handleAppearanceChange = (mode: 'light' | 'dark' | 'system') => {
    setTheme((prev: Theme) => ({ ...prev, appearance: mode }));
  };

  // Handle font change
  const handleFontChange = (font: string) => {
    setTheme((prev: Theme) => ({ ...prev, font }));
  };

  // Handle border radius change
  const handleBorderRadiusChange = (borderRadius: string) => {
    setTheme((prev: Theme) => ({ ...prev, borderRadius }));
  };

  // Handle spacing change
  const handleSpacingChange = (spacing: string) => {
    setTheme((prev: Theme) => ({ ...prev, spacing }));
  };

  // Handle colors extracted from logo
  const handleExtractedColors = (colors: Partial<Theme>) => {
    setTheme((prev: Theme) => ({ ...prev, ...colors }));
  };

  // Apply theme temporarily for preview
  const handlePreview = () => {
    try {
      setPreviewActive(true);
      
      // Store the current theme in session storage for potential reset
      if (!sessionStorage.getItem('previousTheme')) {
        sessionStorage.setItem('previousTheme', JSON.stringify(businessTheme || theme));
      }
      
      // Apply the theme using our applyTheme utility
      applyTheme(theme);
      
      toast({
        title: "Preview mode active",
        description: "This is a preview of how your theme will look. Save to apply permanently.",
      });
    } catch (error) {
      console.error('Error previewing theme:', error);
      toast({
        title: "Preview failed",
        description: "There was a problem generating the preview.",
        variant: "destructive",
      });
    }
  };

  // Save theme to API
  const saveTheme = async () => {
    setLoading(true);
    try {
      // If a custom save function was provided (for admin), use that
      if (onSaveTheme) {
        await onSaveTheme(theme);
      } 
      // Otherwise use the business API endpoint (for business owner)
      else {
        const response = await fetch('/api/business/theme', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ theme }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save theme');
        }
        
        // Update theme context (only for business owner view)
        updateBusinessTheme(theme);
      }
      
      toast({
        title: "Theme saved",
        description: "The theme settings have been updated.",
      });
      
      // Call onSave callback if provided
      if (onSave) onSave();
    } catch (error) {
      console.error('Error saving theme:', error);
      toast({
        title: "Error saving theme",
        description: "There was a problem saving theme settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setPreviewActive(false);
    }
  };

  // Cancel preview and restore previous theme
  const cancelPreview = () => {
    // Restore the previous theme from session storage if it exists
    const previousThemeJSON = sessionStorage.getItem('previousTheme');
    if (previousThemeJSON) {
      try {
        const previousTheme = JSON.parse(previousThemeJSON) as Theme;
        // Clear CSS variables first, then apply the previous theme
        resetTheme(); // Using the imported utility directly
        applyTheme(previousTheme); 
        // Clear the stored theme
        sessionStorage.removeItem('previousTheme');
      } catch (error) {
        console.error('Error restoring previous theme:', error);
      }
    }
    
    setPreviewActive(false);
    toast({
      title: "Preview cancelled",
      description: "Theme preview has been cancelled and original theme restored.",
    });
  };

  // Reset theme to defaults
  const resetThemeToDefaults = () => {
    const defaultTheme: Theme = {
      name: 'Default Theme',
      primary: '#1E3A8A',
      secondary: '#9333EA',
      background: '#FFFFFF',
      text: '#111827',
      appearance: 'system',
      font: 'Inter',
      borderRadius: '0.375rem',
      spacing: '1rem'
    };
    
    setTheme(defaultTheme);
    // First clear existing CSS variables, then apply the default theme
    resetTheme(); // Using the imported utility directly, not calling recursively
    applyTheme(defaultTheme);
    
    toast({
      title: "Theme reset",
      description: "Theme settings have been reset to defaults.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paintbrush className="h-5 w-5 text-primary" />
          Business Theme Editor
        </CardTitle>
        <CardDescription>
          Customize your business colors, typography, and visual appearance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="colors">
          <TabsList className="mb-4">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography & Spacing</TabsTrigger>
            <TabsTrigger value="presets">Theme Presets</TabsTrigger>
            <TabsTrigger value="logo">Logo Colors</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="colors" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ColorPicker
                  label="Primary Color" 
                  value={theme.primary}
                  onChange={(color) => handleColorChange('primary', color)}
                />
                <ColorPicker
                  label="Secondary Color" 
                  value={theme.secondary}
                  onChange={(color) => handleColorChange('secondary', color)}
                />
                <ColorPicker
                  label="Background Color" 
                  value={theme.background}
                  onChange={(color) => handleColorChange('background', color)}
                />
                <ColorPicker
                  label="Text Color" 
                  value={theme.text}
                  onChange={(color) => handleColorChange('text', color)}
                />
              </div>
              
              <ThemePreview theme={theme} />
            </div>
          </TabsContent>
          
          <TabsContent value="typography" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FontSelector 
                  value={theme.font || 'Inter'} 
                  onChange={handleFontChange} 
                />
                <BorderRadiusSelector 
                  value={theme.borderRadius || '0.375rem'} 
                  onChange={handleBorderRadiusChange} 
                />
                <SpacingSelector 
                  value={theme.spacing || '1rem'} 
                  onChange={handleSpacingChange} 
                />
              </div>
              
              <ThemePreview theme={theme} />
            </div>
          </TabsContent>
          
          <TabsContent value="presets" className="space-y-4">
            <ThemePresetSelector
              currentTheme={theme}
              onSelectPreset={(preset) => {
                // Apply the selected preset
                setTheme(preset);
                toast({
                  title: "Theme preset applied",
                  description: `"${preset.name}" theme has been applied. Don't forget to save your changes.`,
                });
              }}
            />
          </TabsContent>
          
          <TabsContent value="logo" className="space-y-4">
            <ColorExtractor onExtractColors={handleExtractedColors} />
            <div className="mt-4">
              <ThemePreview theme={theme} />
            </div>
          </TabsContent>
          
          <TabsContent value="appearance">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-gray-500">Enable dark mode for your business portal</p>
                </div>
                <div className="space-x-2">
                  <Switch
                    id="dark-mode"
                    checked={theme.appearance === 'dark'}
                    onCheckedChange={(checked) => handleAppearanceChange(checked ? 'dark' : 'light')}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="system-mode">Follow System Preference</Label>
                  <p className="text-sm text-gray-500">Automatically switch based on user's device settings</p>
                </div>
                <div className="space-x-2">
                  <Switch
                    id="system-mode"
                    checked={theme.appearance === 'system'}
                    onCheckedChange={(checked) => handleAppearanceChange(checked ? 'system' : 'light')}
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <ThemePreview theme={theme} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-6" />
        
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={resetThemeToDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          
          <div className="flex gap-2">
            {previewActive ? (
              <Button variant="outline" onClick={cancelPreview}>
                <XIcon className="h-4 w-4 mr-2" />
                Cancel Preview
              </Button>
            ) : (
              <Button variant="outline" onClick={handlePreview} disabled={loading}>
                <EyeIcon className="h-4 w-4 mr-2" />
                Preview Theme
              </Button>
            )}
            <Button onClick={saveTheme} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Theme
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}