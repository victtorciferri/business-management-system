import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "../../../contexts/ThemeContext";
import { Theme as ContextTheme } from "../../../contexts/ThemeContext";
import { Theme } from "@shared/config";
import { ThemePresetSelector } from "./ThemePresetSelector";

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

// Theme preview card
const ThemePreview = ({ theme }: { theme: Theme }) => {
  return (
    <div className="border rounded-md p-4 mt-4">
      <h3 className="text-lg font-medium mb-2">Theme Preview</h3>
      <div className="space-y-4">
        <div 
          className="w-full h-24 rounded-md flex items-center justify-center" 
          style={{ backgroundColor: theme.primary, color: '#fff' }}
        >
          Primary Color
        </div>
        <div 
          className="w-full h-14 rounded-md flex items-center justify-center" 
          style={{ backgroundColor: theme.secondary, color: '#fff' }}
        >
          Secondary Color
        </div>
        <div 
          className="w-full h-32 rounded-md flex flex-col items-center justify-center p-4" 
          style={{ backgroundColor: theme.background, color: theme.text }}
        >
          <h4 className="text-lg font-semibold" style={{ color: theme.text }}>Background & Text</h4>
          <p style={{ color: theme.text }}>This is how your text will appear on your background.</p>
          <Button 
            className="mt-2" 
            style={{ backgroundColor: theme.primary, color: '#fff' }}
          >
            Sample Button
          </Button>
        </div>
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

  // Load current theme when component mounts
  useEffect(() => {
    if (initialTheme) {
      // If an initialTheme prop is provided, use that (for admin view)
      setTheme(initialTheme);
    } else if (businessTheme) {
      // Otherwise use the theme from context (for business owner view)
      // Add the name property if it's missing in the context theme
      setTheme({
        name: 'Custom Theme',
        ...businessTheme,
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
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Business Theme Editor</CardTitle>
        <CardDescription>
          Customize your business colors and appearance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="colors">
          <TabsList className="mb-4">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="presets">Theme Presets</TabsTrigger>
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
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={saveTheme} disabled={loading}>
            {loading ? 'Saving...' : 'Save Theme'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}