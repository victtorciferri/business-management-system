import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Ruler, 
  LayoutGrid, 
  Box, 
  Maximize, 
  RefreshCcw,
  Plus,
  Minus,
  MoveHorizontal,
  MoveVertical,
  ArrowRight,
  LayoutTemplate,
  Grid
} from 'lucide-react';
import { 
  spacingPresets,
  defaultSpacingSettings,
  SpacingScale,
  GridSystem,
  SpacingSettings,
  generateSpacingScale,
  generateSpacingCssVariables,
  pxToRem,
  remToPx,
} from '@/../../shared/spacingUtils';

interface SpacingEditorProps {
  initialSettings?: Partial<SpacingSettings>;
  onChange?: (settings: SpacingSettings) => void;
}

export function SpacingEditor({ 
  initialSettings,
  onChange
}: SpacingEditorProps) {
  const [settings, setSettings] = useState<SpacingSettings>({
    ...defaultSpacingSettings,
    ...initialSettings
  });
  
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('spacing-scale');
  const [selectedBreakpoint, setSelectedBreakpoint] = useState('xl');
  
  // Update settings when initialSettings changes
  useEffect(() => {
    if (initialSettings) {
      setSettings(prev => ({
        ...prev,
        ...initialSettings
      }));
    }
  }, [initialSettings]);
  
  // Call onChange when settings change
  useEffect(() => {
    if (onChange) {
      onChange(settings);
    }
  }, [settings, onChange]);
  
  // Apply spacing preset
  const applyPreset = (presetName: string) => {
    const preset = spacingPresets.find(p => p.name === presetName);
    if (preset) {
      setSettings(preset.settings);
      setSelectedPreset(presetName);
    }
  };
  
  // Handle base size change
  const handleBaseSpacingChange = (value: number[]) => {
    const baseSize = value[0];
    const newScale = generateSpacingScale(
      baseSize, 
      settings.scale.unit, 
      settings.scale.ratio
    );
    
    setSettings({
      ...settings,
      scale: {
        ...settings.scale,
        base: baseSize,
        values: newScale
      }
    });
  };
  
  // Handle grid columns change
  const handleColumnsChange = (value: number[]) => {
    setSettings({
      ...settings,
      layout: {
        ...settings.layout,
        gridSystem: {
          ...settings.layout.gridSystem,
          columns: value[0]
        }
      }
    });
  };
  
  // Helper to generate the CSS for demonstrating spacing values
  const getSpacerStyle = (size: string): React.CSSProperties => {
    const value = settings.scale.values[size];
    return {
      width: value,
      height: value,
      backgroundColor: 'var(--primary-100, #e0e7ff)',
      border: '1px solid var(--primary-400, #818cf8)',
      borderRadius: '0.25rem',
    };
  };
  
  // Helper to generate CSS for demonstrating a grid
  const getGridStyle = (): React.CSSProperties => {
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${settings.layout.gridSystem.columns}, ${settings.layout.gridSystem.columnWidth})`,
      gap: settings.layout.gridSystem.gutter,
      padding: settings.layout.gridSystem.margins,
      maxWidth: settings.layout.contentWidth,
      margin: '0 auto',
      border: '1px dashed var(--muted-foreground, #6b7280)',
      borderRadius: '0.5rem',
    };
  };
  
  // Helper to generate CSS variables for the preview
  const getPreviewStyles = () => {
    const cssVariables = generateSpacingCssVariables(settings);
    const styleObject: React.CSSProperties = {};
    
    Object.entries(cssVariables).forEach(([key, value]) => {
      styleObject[key as any] = value;
    });
    
    return styleObject;
  };
  
  return (
    <div className="spacing-editor">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 grid grid-cols-3">
          <TabsTrigger value="spacing-scale">
            <Ruler className="w-4 h-4 mr-2" />
            Spacing Scale
          </TabsTrigger>
          <TabsTrigger value="grid-layout">
            <LayoutGrid className="w-4 h-4 mr-2" />
            Grid & Layout
          </TabsTrigger>
          <TabsTrigger value="presets">
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Presets
          </TabsTrigger>
        </TabsList>
        
        {/* Spacing Scale Tab */}
        <TabsContent value="spacing-scale" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spacing Scale</CardTitle>
              <CardDescription>
                Configure the spacing scale used across your design system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="base-spacing">Base Spacing Unit ({settings.scale.base}{settings.scale.unit})</Label>
                    <span className="text-sm text-muted-foreground">{settings.scale.base}{settings.scale.unit}</span>
                  </div>
                  <Slider
                    id="base-spacing"
                    min={0.125}
                    max={1}
                    step={0.125}
                    value={[settings.scale.base]}
                    onValueChange={handleBaseSpacingChange}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Smaller</span>
                    <span>Larger</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="spacing-unit">Spacing Unit</Label>
                  <Select 
                    value={settings.scale.unit}
                    onValueChange={(value: 'px' | 'rem' | 'em') => {
                      // Convert values when changing unit
                      const convertedValues = Object.entries(settings.scale.values).reduce(
                        (acc, [key, val]) => {
                          // Skip special values
                          if (key === '0' || key === 'px') {
                            acc[key] = val;
                            return acc;
                          }
                          
                          const numValue = parseFloat(val);
                          if (!isNaN(numValue)) {
                            if (settings.scale.unit === 'px' && value === 'rem') {
                              acc[key] = pxToRem(numValue);
                            } else if (settings.scale.unit === 'rem' && value === 'px') {
                              acc[key] = remToPx(numValue);
                            } else {
                              // Keep the number, just change the unit
                              acc[key] = `${numValue}${value}`;
                            }
                          } else {
                            acc[key] = val;
                          }
                          
                          return acc;
                        },
                        {} as Record<string, string>
                      );
                      
                      setSettings({
                        ...settings,
                        scale: {
                          ...settings.scale,
                          unit: value,
                          values: convertedValues
                        }
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="px">Pixels (px)</SelectItem>
                      <SelectItem value="rem">Root EM (rem)</SelectItem>
                      <SelectItem value="em">EM (em)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4">
                  <Label className="mb-3 block">Spacing Scale Preview</Label>
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <div className="space-y-6">
                      {Object.entries(settings.scale.values)
                        .filter(([key]) => !['0', 'px'].includes(key))
                        .sort((a, b) => {
                          // Sort numerically
                          const numA = parseFloat(a[0]);
                          const numB = parseFloat(b[0]);
                          if (!isNaN(numA) && !isNaN(numB)) {
                            return numA - numB;
                          }
                          return a[0].localeCompare(b[0]);
                        })
                        .map(([key, value]) => (
                          <div key={key} className="flex items-center gap-4">
                            <div className="w-12 text-sm text-muted-foreground">{key}</div>
                            <div style={getSpacerStyle(key)} />
                            <div className="text-sm">{value}</div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Component Spacing</CardTitle>
              <CardDescription>
                Configure spacing used within and between components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label>Component Spacing</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(settings.layout.componentSpacing).map(([size, value]) => (
                    <div key={size} className="space-y-2">
                      <Label htmlFor={`component-spacing-${size}`}>{size}</Label>
                      <Input
                        id={`component-spacing-${size}`}
                        value={value}
                        onChange={(e) => {
                          setSettings({
                            ...settings,
                            layout: {
                              ...settings.layout,
                              componentSpacing: {
                                ...settings.layout.componentSpacing,
                                [size]: e.target.value
                              }
                            }
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="pt-4">
                  <Label className="mb-3 block">Component Spacing Preview</Label>
                  <div className="border rounded-md p-6 space-y-4">
                    <div>
                      <Label>XS Spacing</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary rounded-md"></div>
                          <MoveHorizontal className="text-muted-foreground" />
                          <div className="w-8 h-8 bg-primary rounded-md"></div>
                        </div>
                        <span className="text-sm">{settings.layout.componentSpacing.xs}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label>MD Spacing</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary rounded-md"></div>
                          <MoveHorizontal className="text-muted-foreground" size={24} />
                          <div className="w-8 h-8 bg-primary rounded-md"></div>
                        </div>
                        <span className="text-sm">{settings.layout.componentSpacing.md}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label>XL Spacing</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary rounded-md"></div>
                          <MoveHorizontal className="text-muted-foreground" size={40} />
                          <div className="w-8 h-8 bg-primary rounded-md"></div>
                        </div>
                        <span className="text-sm">{settings.layout.componentSpacing.xl}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Grid & Layout Tab */}
        <TabsContent value="grid-layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grid System</CardTitle>
              <CardDescription>
                Configure your layout grid system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="grid-columns">Grid Columns ({settings.layout.gridSystem.columns})</Label>
                    <span className="text-sm text-muted-foreground">{settings.layout.gridSystem.columns}</span>
                  </div>
                  <Slider
                    id="grid-columns"
                    min={4}
                    max={24}
                    step={1}
                    value={[settings.layout.gridSystem.columns]}
                    onValueChange={handleColumnsChange}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Fewer</span>
                    <span>More</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="grid-gutter">Grid Gutter</Label>
                    <Input
                      id="grid-gutter"
                      value={settings.layout.gridSystem.gutter}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          layout: {
                            ...settings.layout,
                            gridSystem: {
                              ...settings.layout.gridSystem,
                              gutter: e.target.value
                            }
                          }
                        });
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="grid-margins">Grid Margins</Label>
                    <Input
                      id="grid-margins"
                      value={settings.layout.gridSystem.margins}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          layout: {
                            ...settings.layout,
                            gridSystem: {
                              ...settings.layout.gridSystem,
                              margins: e.target.value
                            }
                          }
                        });
                      }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content-width">Content Width</Label>
                  <Input
                    id="content-width"
                    value={settings.layout.contentWidth}
                    onChange={(e) => {
                      setSettings({
                        ...settings,
                        layout: {
                          ...settings.layout,
                          contentWidth: e.target.value
                        }
                      });
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-width">Max Width</Label>
                  <Input
                    id="max-width"
                    value={settings.layout.maxWidth}
                    onChange={(e) => {
                      setSettings({
                        ...settings,
                        layout: {
                          ...settings.layout,
                          maxWidth: e.target.value
                        }
                      });
                    }}
                  />
                </div>
                
                <div className="pt-4">
                  <Label className="mb-3 block">Grid Preview</Label>
                  <div className="overflow-auto">
                    <div style={getGridStyle()}>
                      {Array.from({ length: settings.layout.gridSystem.columns }).map((_, i) => (
                        <div 
                          key={i} 
                          className="bg-primary/10 h-20 border border-primary/30 rounded flex items-center justify-center"
                        >
                          <span className="text-xs text-muted-foreground">{i + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Responsive Breakpoints</CardTitle>
              <CardDescription>
                Configure responsive breakpoints for your layout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Breakpoint</Label>
                  <Select 
                    value={selectedBreakpoint}
                    onValueChange={setSelectedBreakpoint}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select breakpoint" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(settings.layout.gridSystem.breakpoints).map(name => (
                        <SelectItem key={name} value={name}>
                          {name.toUpperCase()} ({settings.layout.gridSystem.breakpoints[name]}px)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedBreakpoint && (
                  <div className="space-y-2">
                    <Label htmlFor="breakpoint-value">Width (px)</Label>
                    <Input
                      id="breakpoint-value"
                      type="number"
                      value={settings.layout.gridSystem.breakpoints[selectedBreakpoint]}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value)) {
                          setSettings({
                            ...settings,
                            layout: {
                              ...settings.layout,
                              gridSystem: {
                                ...settings.layout.gridSystem,
                                breakpoints: {
                                  ...settings.layout.gridSystem.breakpoints,
                                  [selectedBreakpoint]: value
                                }
                              }
                            }
                          });
                        }
                      }}
                    />
                  </div>
                )}
                
                <div className="pt-4">
                  <Label className="mb-3 block">Breakpoints Preview</Label>
                  <div className="border rounded-md p-4">
                    <div className="relative h-8 w-full bg-muted rounded-md overflow-hidden">
                      {Object.entries(settings.layout.gridSystem.breakpoints)
                        .sort((a, b) => a[1] - b[1])
                        .map(([name, value], index, arr) => {
                          const maxWidth = Math.max(...Object.values(settings.layout.gridSystem.breakpoints));
                          const nextValue = index < arr.length - 1 ? arr[index + 1][1] : maxWidth;
                          const width = `${(nextValue / maxWidth) * 100}%`;
                          const left = `${(value / maxWidth) * 100}%`;
                          
                          return (
                            <div 
                              key={name}
                              className="absolute top-0 h-full inline-flex items-center pl-1"
                              style={{ 
                                left,
                                width: `calc(${width} - ${left})`,
                                backgroundColor: `rgba(79, 70, 229, ${0.1 + (index * 0.15)})` 
                              }}
                            >
                              <span className="text-xs font-medium">{name}</span>
                              <span className="text-xs ml-1 text-muted-foreground">{value}px</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Presets Tab */}
        <TabsContent value="presets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spacing Presets</CardTitle>
              <CardDescription>
                Choose from predefined spacing systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {spacingPresets.map(preset => (
                  <div
                    key={preset.name}
                    className={`border rounded-md p-4 cursor-pointer ${
                      selectedPreset === preset.name ? 'ring-2 ring-primary' : 'hover:bg-muted/20'
                    }`}
                    onClick={() => applyPreset(preset.name)}
                  >
                    <h3 className="text-lg font-semibold mb-1">
                      {preset.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {preset.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(size => (
                        <div 
                          key={size}
                          className="bg-primary/15 border border-primary/30 rounded"
                          style={{ 
                            width: `${size * 8}px`, 
                            height: `${size * 8}px` 
                          }}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Ruler size={12} />
                        <span>{preset.settings.scale.base}{preset.settings.scale.unit}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Grid size={12} />
                        <span>{preset.settings.layout.gridSystem.columns}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Box size={12} />
                        <span>{preset.settings.layout.contentWidth}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Spacing Scale Examples</CardTitle>
              <CardDescription>
                Visual examples of different spacing approaches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">4pt / 0.25rem Grid</h3>
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 4, 6, 8, 12, 16].map(size => (
                      <div 
                        key={size}
                        className="bg-primary/20 border border-primary/30 rounded flex items-center justify-center"
                        style={{ 
                          width: `${size * 4}px`, 
                          height: `${size * 4}px` 
                        }}
                      >
                        <span className="text-[9px]">{size}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Popular in design systems like Material Design. All spaces are multiples of 4, creating a visually balanced layout.
                  </p>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">8pt / 0.5rem Grid</h3>
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 3, 4, 6, 8].map(size => (
                      <div 
                        key={size}
                        className="bg-primary/20 border border-primary/30 rounded flex items-center justify-center"
                        style={{ 
                          width: `${size * 8}px`, 
                          height: `${size * 8}px` 
                        }}
                      >
                        <span className="text-[9px]">{size}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Used by many professional design systems like Atlassian, Shopify Polaris. Provides larger increments for better visual clarity.
                  </p>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">Geometric Scale</h3>
                  <div className="flex gap-2 mb-2">
                    {[4, 8, 16, 24, 40, 64].map(size => (
                      <div 
                        key={size}
                        className="bg-primary/20 border border-primary/30 rounded flex items-center justify-center"
                        style={{ 
                          width: `${size}px`, 
                          height: `${size}px` 
                        }}
                      >
                        <span className="text-[9px]">{size}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Scale with non-linear progression, offering a wider range of spacing options similar to type scales. Good for complex hierarchical layouts.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}