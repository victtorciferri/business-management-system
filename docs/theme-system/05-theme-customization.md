# Theme Customization Examples

## Introduction

This document provides practical examples of how to customize themes in the system. It covers common customization scenarios, from simple color changes to advanced token manipulations.

## Basic Theme Customization

### Example 1: Changing Primary Colors

```typescript
import { useBusinessTheme } from '@/hooks/useBusinessTheme';
import { themeApi } from '@/lib/themeApi';
import { useToast } from '@/hooks/use-toast';

function PrimaryColorCustomizer() {
  const { theme, businessId } = useBusinessTheme();
  const [primaryColor, setPrimaryColor] = useState(theme.tokens.colors.primary.DEFAULT);
  const toast = useToast();
  
  const updateThemeMutation = useMutation({
    mutationFn: (color: string) => themeApi.updateActiveTheme(businessId, {
      tokens: {
        ...theme.tokens,
        colors: {
          ...theme.tokens.colors,
          primary: {
            ...theme.tokens.colors.primary,
            DEFAULT: color,
            // Automatically generate shades
            light: generateLighterShade(color, 0.2),
            dark: generateDarkerShade(color, 0.2),
            hover: generateDarkerShade(color, 0.1)
          }
        }
      }
    }),
    onSuccess: () => {
      toast.success('Theme updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update theme: ${error.message}`);
    }
  });
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setPrimaryColor(newColor);
  };
  
  const handleColorUpdate = () => {
    updateThemeMutation.mutate(primaryColor);
  };
  
  return (
    <div className="color-customizer">
      <h3>Primary Color</h3>
      <div className="color-picker-wrapper">
        <input 
          type="color" 
          value={primaryColor} 
          onChange={handleColorChange}
          aria-label="Select primary color"
        />
        <span>{primaryColor}</span>
      </div>
      
      <div className="color-preview">
        <div 
          className="color-swatch"
          style={{ backgroundColor: primaryColor }}
        />
        <div 
          className="color-swatch"
          style={{ backgroundColor: generateLighterShade(primaryColor, 0.2) }}
        />
        <div 
          className="color-swatch"
          style={{ backgroundColor: generateDarkerShade(primaryColor, 0.2) }}
        />
      </div>
      
      <Button 
        onClick={handleColorUpdate}
        disabled={updateThemeMutation.isPending}
      >
        {updateThemeMutation.isPending ? 'Updating...' : 'Update Theme'}
      </Button>
    </div>
  );
}
```

### Example 2: Typography Customization

```typescript
function TypographyCustomizer() {
  const { theme, businessId } = useBusinessTheme();
  const [fontFamily, setFontFamily] = useState(theme.tokens.typography.fontFamily.body);
  const [fontSize, setFontSize] = useState(theme.tokens.typography.fontSize.base);
  const toast = useToast();
  
  const updateThemeMutation = useMutation({
    mutationFn: () => themeApi.updateActiveTheme(businessId, {
      tokens: {
        ...theme.tokens,
        typography: {
          ...theme.tokens.typography,
          fontFamily: {
            ...theme.tokens.typography.fontFamily,
            body: fontFamily,
            DEFAULT: fontFamily
          },
          fontSize: {
            ...theme.tokens.typography.fontSize,
            base: fontSize,
            DEFAULT: fontSize
          }
        }
      }
    }),
    onSuccess: () => {
      toast.success('Typography updated successfully!');
    }
  });
  
  const fontOptions = [
    "Inter, sans-serif",
    "Roboto, sans-serif",
    "Poppins, sans-serif",
    "Montserrat, sans-serif",
    "Open Sans, sans-serif",
    "Lato, sans-serif",
    "Playfair Display, serif",
    "Merriweather, serif",
    "Roboto Mono, monospace"
  ];
  
  const fontSizeOptions = [
    "0.75rem", // xs
    "0.875rem", // sm
    "1rem", // base
    "1.125rem", // lg
    "1.25rem", // xl
    "1.5rem", // 2xl
  ];
  
  return (
    <div className="typography-customizer">
      <h3>Typography Settings</h3>
      
      <div className="form-group">
        <Label htmlFor="font-family">Font Family</Label>
        <Select value={fontFamily} onValueChange={setFontFamily}>
          <SelectTrigger id="font-family">
            <SelectValue placeholder="Select font family" />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.map(font => (
              <SelectItem key={font} value={font}>
                <span style={{ fontFamily: font }}>{font.split(',')[0]}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="form-group">
        <Label htmlFor="font-size">Base Font Size</Label>
        <Select value={fontSize} onValueChange={setFontSize}>
          <SelectTrigger id="font-size">
            <SelectValue placeholder="Select base font size" />
          </SelectTrigger>
          <SelectContent>
            {fontSizeOptions.map(size => (
              <SelectItem key={size} value={size}>
                {size} {size === "1rem" && "(default)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="typography-preview" style={{ fontFamily, fontSize }}>
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <p>This is a paragraph text in the selected font family and size.</p>
        <a href="#">This is how links will appear</a>
      </div>
      
      <Button 
        onClick={() => updateThemeMutation.mutate()}
        disabled={updateThemeMutation.isPending}
      >
        {updateThemeMutation.isPending ? 'Updating...' : 'Update Typography'}
      </Button>
    </div>
  );
}
```

## Advanced Theme Customization

### Example 3: Component-specific Token Customization

```typescript
function ButtonCustomizer() {
  const { theme, businessId } = useBusinessTheme();
  const toast = useToast();
  
  // Extract current button tokens or use defaults
  const buttonTokens = theme.tokens.components?.button || {
    borderRadius: '0.375rem',
    fontWeight: 'medium',
    transition: 'all 200ms',
    primary: {
      background: theme.tokens.colors.primary.DEFAULT,
      color: theme.tokens.colors.primary.foreground,
      hoverBackground: theme.tokens.colors.primary.hover,
      hoverColor: theme.tokens.colors.primary.foreground
    }
  };
  
  const [settings, setSettings] = useState(buttonTokens);
  
  const handleChange = (path: string, value: string) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      // Handle nested paths like 'primary.background'
      const pathParts = path.split('.');
      if (pathParts.length === 1) {
        newSettings[path] = value;
      } else {
        const [parent, child] = pathParts;
        newSettings[parent] = { ...newSettings[parent], [child]: value };
      }
      return newSettings;
    });
  };
  
  const updateThemeMutation = useMutation({
    mutationFn: () => themeApi.updateActiveTheme(businessId, {
      tokens: {
        ...theme.tokens,
        components: {
          ...theme.tokens.components,
          button: settings
        }
      }
    }),
    onSuccess: () => {
      toast.success('Button styles updated successfully!');
    }
  });
  
  return (
    <div className="button-customizer">
      <h3>Button Customization</h3>
      
      <div className="form-group">
        <Label>Border Radius</Label>
        <Input 
          type="text" 
          value={settings.borderRadius} 
          onChange={(e) => handleChange('borderRadius', e.target.value)}
        />
      </div>
      
      <div className="form-group">
        <Label>Font Weight</Label>
        <Select 
          value={settings.fontWeight} 
          onValueChange={(value) => handleChange('fontWeight', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select font weight" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="semibold">Semibold</SelectItem>
            <SelectItem value="bold">Bold</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Accordion type="single" collapsible>
        <AccordionItem value="primary">
          <AccordionTrigger>Primary Button Style</AccordionTrigger>
          <AccordionContent>
            <div className="form-group">
              <Label>Background Color</Label>
              <div className="color-input-group">
                <input 
                  type="color" 
                  value={settings.primary.background} 
                  onChange={(e) => handleChange('primary.background', e.target.value)}
                />
                <Input 
                  value={settings.primary.background}
                  onChange={(e) => handleChange('primary.background', e.target.value)}
                />
              </div>
            </div>
            
            <div className="form-group">
              <Label>Text Color</Label>
              <div className="color-input-group">
                <input 
                  type="color" 
                  value={settings.primary.color} 
                  onChange={(e) => handleChange('primary.color', e.target.value)}
                />
                <Input 
                  value={settings.primary.color}
                  onChange={(e) => handleChange('primary.color', e.target.value)}
                />
              </div>
            </div>
            
            <div className="form-group">
              <Label>Hover Background</Label>
              <div className="color-input-group">
                <input 
                  type="color" 
                  value={settings.primary.hoverBackground} 
                  onChange={(e) => handleChange('primary.hoverBackground', e.target.value)}
                />
                <Input 
                  value={settings.primary.hoverBackground}
                  onChange={(e) => handleChange('primary.hoverBackground', e.target.value)}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="button-preview">
        <h4>Button Preview</h4>
        <div className="preview-container">
          <button style={{
            borderRadius: settings.borderRadius,
            fontWeight: settings.fontWeight,
            backgroundColor: settings.primary.background,
            color: settings.primary.color,
            padding: '0.5rem 1rem',
            border: 'none',
            cursor: 'pointer',
            transition: settings.transition
          }}>
            Primary Button
          </button>
        </div>
      </div>
      
      <Button 
        onClick={() => updateThemeMutation.mutate()}
        disabled={updateThemeMutation.isPending}
      >
        Update Button Styles
      </Button>
    </div>
  );
}
```

### Example 4: Complete Theme Presets

```typescript
import { useBusinessTheme } from '@/hooks/useBusinessTheme';
import { themePresets } from '@/lib/themePresets';
import { themeApi } from '@/lib/themeApi';
import { useToast } from '@/hooks/use-toast';

function ThemePresetSelector() {
  const { businessId } = useBusinessTheme();
  const toast = useToast();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  
  const applyPresetMutation = useMutation({
    mutationFn: (presetId: string) => {
      const preset = themePresets.find(p => p.id === presetId);
      if (!preset) throw new Error('Preset not found');
      
      return themeApi.createTheme({
        businessId,
        businessSlug: '', // This will be filled by the backend
        name: preset.name,
        description: preset.description,
        isActive: true,
        tokens: preset.tokens,
        category: preset.category,
        tags: preset.tags || []
      });
    },
    onSuccess: () => {
      toast.success('Theme preset applied successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to apply preset: ${error.message}`);
    }
  });
  
  return (
    <div className="theme-preset-selector">
      <h2>Theme Presets</h2>
      <p>Choose a preset to quickly set up your theme:</p>
      
      <div className="preset-grid">
        {themePresets.map(preset => (
          <div 
            key={preset.id}
            className={cn(
              "preset-card",
              selectedPreset === preset.id && "selected"
            )}
            onClick={() => setSelectedPreset(preset.id)}
          >
            <div 
              className="preset-color" 
              style={{ backgroundColor: preset.previewColor }}
            />
            <div className="preset-info">
              <h3>{preset.name}</h3>
              <p>{preset.description}</p>
              <div className="preset-tags">
                <Badge>{preset.variant}</Badge>
                {preset.isAccessible && <Badge variant="outline">Accessible</Badge>}
                {preset.industry && <Badge variant="secondary">{preset.industry}</Badge>}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <Button 
        onClick={() => {
          if (selectedPreset) applyPresetMutation.mutate(selectedPreset);
        }}
        disabled={!selectedPreset || applyPresetMutation.isPending}
        className="mt-4"
      >
        {applyPresetMutation.isPending ? 'Applying...' : 'Apply Selected Preset'}
      </Button>
    </div>
  );
}
```

### Example 5: Color Palette Generator

```typescript
import { useState } from 'react';
import { useBusinessTheme } from '@/hooks/useBusinessTheme';
import { generateColorPalette } from '@/lib/colorUtils';
import { themeApi } from '@/lib/themeApi';
import { useToast } from '@/hooks/use-toast';

function ColorPaletteGenerator() {
  const { theme, businessId } = useBusinessTheme();
  const toast = useToast();
  const [baseColor, setBaseColor] = useState('#4f46e5');
  const [generatedPalette, setGeneratedPalette] = useState<Record<string, string> | null>(null);
  
  const generatePalette = () => {
    const palette = generateColorPalette(baseColor);
    setGeneratedPalette(palette);
  };
  
  const applyPaletteMutation = useMutation({
    mutationFn: () => {
      if (!generatedPalette) throw new Error('No palette generated');
      
      return themeApi.updateActiveTheme(businessId, {
        tokens: {
          ...theme.tokens,
          colors: {
            ...theme.tokens.colors,
            primary: {
              DEFAULT: generatedPalette.primary,
              light: generatedPalette.primaryLight,
              dark: generatedPalette.primaryDark,
              foreground: generatedPalette.primaryForeground,
              hover: generatedPalette.primaryDark
            },
            secondary: {
              DEFAULT: generatedPalette.secondary,
              light: generatedPalette.secondaryLight,
              dark: generatedPalette.secondaryDark,
              foreground: generatedPalette.secondaryForeground,
              hover: generatedPalette.secondaryDark
            },
            accent: generatedPalette.accent,
            background: {
              ...theme.tokens.colors.background,
              DEFAULT: generatedPalette.background
            }
          }
        }
      });
    },
    onSuccess: () => {
      toast.success('Color palette applied successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to apply palette: ${error.message}`);
    }
  });
  
  return (
    <div className="color-palette-generator">
      <h2>Color Palette Generator</h2>
      <p>Generate a harmonious color palette from a base color:</p>
      
      <div className="color-picker-wrapper">
        <input 
          type="color" 
          value={baseColor} 
          onChange={(e) => setBaseColor(e.target.value)}
          aria-label="Select base color"
        />
        <Input 
          value={baseColor}
          onChange={(e) => setBaseColor(e.target.value)}
        />
        <Button onClick={generatePalette}>Generate Palette</Button>
      </div>
      
      {generatedPalette && (
        <div className="palette-preview">
          <h3>Generated Palette</h3>
          
          <div className="color-swatches">
            {Object.entries(generatedPalette).map(([name, color]) => (
              <div key={name} className="color-swatch-item">
                <div 
                  className="swatch" 
                  style={{ backgroundColor: color }}
                />
                <div className="swatch-info">
                  <span>{name}</span>
                  <code>{color}</code>
                </div>
              </div>
            ))}
          </div>
          
          <Button 
            onClick={() => applyPaletteMutation.mutate()}
            disabled={applyPaletteMutation.isPending}
            className="mt-4"
          >
            Apply This Palette
          </Button>
        </div>
      )}
    </div>
  );
}
```

## Theme Import/Export

### Example 6: Theme Export

```typescript
function ThemeExporter() {
  const { theme } = useBusinessTheme();
  
  const exportTheme = () => {
    // Create a formatted JSON string
    const themeJson = JSON.stringify(theme, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.replace(/\s+/g, '-').toLowerCase()}-theme.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  
  return (
    <div className="theme-exporter">
      <h3>Export Current Theme</h3>
      <p>Download your current theme as a JSON file for backup or sharing.</p>
      
      <Button onClick={exportTheme}>
        Export Theme
      </Button>
    </div>
  );
}
```

### Example 7: Theme Import

```typescript
function ThemeImporter() {
  const { businessId } = useBusinessTheme();
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const importThemeMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('No file selected');
      
      try {
        // Read the file contents
        const fileContents = await file.text();
        const themeData = JSON.parse(fileContents);
        
        // Validate the theme structure
        if (!themeData.tokens) {
          throw new Error('Invalid theme file: missing tokens');
        }
        
        // Import the theme
        return themeApi.createTheme({
          businessId,
          businessSlug: '', // This will be filled by the backend
          name: themeData.name || 'Imported Theme',
          description: themeData.description || 'Imported from file',
          isActive: true,
          tokens: themeData.tokens
        });
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new Error('Invalid JSON file');
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('Theme imported successfully!');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error) => {
      toast.error(`Failed to import theme: ${error.message}`);
    }
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };
  
  return (
    <div className="theme-importer">
      <h3>Import Theme</h3>
      <p>Import a theme from a JSON file:</p>
      
      <Input 
        type="file" 
        accept=".json" 
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      
      {file && (
        <div className="file-info">
          <p>Selected file: {file.name} ({Math.round(file.size / 1024)} KB)</p>
          
          <Button 
            onClick={() => importThemeMutation.mutate()}
            disabled={importThemeMutation.isPending}
          >
            {importThemeMutation.isPending ? 'Importing...' : 'Import Theme'}
          </Button>
        </div>
      )}
    </div>
  );
}
```

These examples demonstrate a range of common theme customization scenarios, from simple color changes to advanced component styling, palette generation, and theme import/export functionality.