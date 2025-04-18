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
  Tabs as IconTabs, 
  Type, 
  LetterCase, 
  ArrowRight, 
  MoveHorizontal, 
  MoveVertical, 
  Scaling, 
  RefreshCcw 
} from 'lucide-react';
import { 
  typographyPresets,
  defaultTypographySettings,
  FontFamily,
  TypeScale,
  TypographySettings,
  generateTypographyCssVariables,
  generateTypeScale,
  popularFontPairings,
  getTypographySample,
} from '@/../../shared/typographyUtils';

interface TypographyEditorProps {
  initialSettings?: Partial<TypographySettings>;
  onChange?: (settings: TypographySettings) => void;
}

export function TypographyEditor({ 
  initialSettings,
  onChange
}: TypographyEditorProps) {
  const [settings, setSettings] = useState<TypographySettings>({
    ...defaultTypographySettings,
    ...initialSettings
  });
  
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedTextStyle, setSelectedTextStyle] = useState<string>('body');
  const [activeTab, setActiveTab] = useState('text-styles');
  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog');
  
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
  
  // Apply font pairing
  const applyFontPairing = (heading: FontFamily, body: FontFamily) => {
    setSettings(prev => ({
      ...prev,
      headingFont: heading,
      bodyFont: body,
    }));
  };
  
  // Apply typography preset
  const applyPreset = (presetName: string) => {
    const preset = typographyPresets.find(p => p.name === presetName);
    if (preset) {
      setSettings({
        ...settings,
        headingFont: preset.headingFont,
        bodyFont: preset.bodyFont,
        monoFont: preset.monoFont,
        scale: preset.scale,
        baseFontSize: preset.baseFontSize,
        baseLineHeight: preset.baseLineHeight,
      });
      setSelectedPreset(presetName);
    }
  };
  
  // Handle scale ratio change
  const handleScaleRatioChange = (value: number[]) => {
    const newRatio = value[0];
    const newScale = generateTypeScale(settings.baseFontSize, newRatio);
    
    setSettings({
      ...settings,
      scale: {
        ...settings.scale,
        ratio: newRatio,
        values: newScale
      }
    });
  };
  
  // Handle base font size change
  const handleBaseFontSizeChange = (value: number[]) => {
    const newBaseSize = value[0];
    const newScale = generateTypeScale(newBaseSize, settings.scale.ratio);
    
    setSettings({
      ...settings,
      baseFontSize: newBaseSize,
      scale: {
        ...settings.scale,
        base: newBaseSize,
        values: newScale
      }
    });
  };
  
  // Helper to generate CSS variables for the preview
  const getPreviewStyles = () => {
    const cssVariables = generateTypographyCssVariables(settings);
    const styleObject: React.CSSProperties = {};
    
    Object.entries(cssVariables).forEach(([key, value]) => {
      styleObject[key as any] = value;
    });
    
    return styleObject;
  };
  
  // Style for the current text style preview
  const getTextStylePreview = (style: string): React.CSSProperties => {
    const textStyle = settings.textStyles[style];
    if (!textStyle) return {};
    
    return {
      fontFamily: textStyle.fontFamily.replace('var(--font-heading)', settings.headingFont.name)
        .replace('var(--font-body)', settings.bodyFont.name)
        .replace('var(--font-mono)', settings.monoFont.name),
      fontSize: textStyle.fontSize.replace('var(--fs-', '').replace(')', ''),
      fontWeight: textStyle.fontWeight,
      lineHeight: textStyle.lineHeight.replace('var(--lh-', '').replace(')', ''),
      letterSpacing: textStyle.letterSpacing.replace('var(--ls-', '').replace(')', ''),
      textTransform: textStyle.textTransform as any,
      margin: style.startsWith('h') ? '0.5em 0' : style === 'body' ? '1em 0' : '0.25em 0',
    };
  };
  
  return (
    <div className="typography-editor">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 grid grid-cols-3">
          <TabsTrigger value="text-styles">
            <Type className="w-4 h-4 mr-2" />
            Text Styles
          </TabsTrigger>
          <TabsTrigger value="font-settings">
            <LetterCase className="w-4 h-4 mr-2" />
            Fonts & Scales
          </TabsTrigger>
          <TabsTrigger value="presets">
            <IconTabs className="w-4 h-4 mr-2" />
            Presets
          </TabsTrigger>
        </TabsList>
        
        {/* Text Styles Tab */}
        <TabsContent value="text-styles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Typography Preview</CardTitle>
              <CardDescription>
                See how your typography settings will look
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="w-2/3 p-4 border rounded-md bg-background" style={getPreviewStyles()}>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-6">
                      {Object.keys(settings.textStyles).map(style => (
                        <div 
                          key={style}
                          className={`text-style-preview ${selectedTextStyle === style ? 'ring-2 ring-primary ring-offset-2' : ''} hover:bg-muted/30 p-2 rounded cursor-pointer`}
                          onClick={() => setSelectedTextStyle(style)}
                        >
                          <div style={getTextStylePreview(style)}>
                            {getTypographySample(style)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {style}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
                
                <div className="w-1/3 space-y-4">
                  <div>
                    <Label>Selected Style</Label>
                    <Select 
                      value={selectedTextStyle} 
                      onValueChange={setSelectedTextStyle}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(settings.textStyles).map(style => (
                          <SelectItem key={style} value={style}>
                            {style}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedTextStyle && (
                    <div className="space-y-3">
                      <div>
                        <Label>Font Family</Label>
                        <Select 
                          value={settings.textStyles[selectedTextStyle].fontFamily}
                          onValueChange={(value) => {
                            setSettings({
                              ...settings,
                              textStyles: {
                                ...settings.textStyles,
                                [selectedTextStyle]: {
                                  ...settings.textStyles[selectedTextStyle],
                                  fontFamily: value
                                }
                              }
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select font family" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="var(--font-heading)">Heading Font</SelectItem>
                            <SelectItem value="var(--font-body)">Body Font</SelectItem>
                            <SelectItem value="var(--font-mono)">Mono Font</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Font Size</Label>
                        <Select 
                          value={settings.textStyles[selectedTextStyle].fontSize}
                          onValueChange={(value) => {
                            setSettings({
                              ...settings,
                              textStyles: {
                                ...settings.textStyles,
                                [selectedTextStyle]: {
                                  ...settings.textStyles[selectedTextStyle],
                                  fontSize: value
                                }
                              }
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select font size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="var(--fs-xs)">Extra Small</SelectItem>
                            <SelectItem value="var(--fs-sm)">Small</SelectItem>
                            <SelectItem value="var(--fs-base)">Base</SelectItem>
                            <SelectItem value="var(--fs-lg)">Large</SelectItem>
                            <SelectItem value="var(--fs-xl)">XL</SelectItem>
                            <SelectItem value="var(--fs-2xl)">2XL</SelectItem>
                            <SelectItem value="var(--fs-3xl)">3XL</SelectItem>
                            <SelectItem value="var(--fs-4xl)">4XL</SelectItem>
                            <SelectItem value="var(--fs-5xl)">5XL</SelectItem>
                            <SelectItem value="var(--fs-6xl)">6XL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Font Weight</Label>
                        <Select 
                          value={settings.textStyles[selectedTextStyle].fontWeight.toString()}
                          onValueChange={(value) => {
                            setSettings({
                              ...settings,
                              textStyles: {
                                ...settings.textStyles,
                                [selectedTextStyle]: {
                                  ...settings.textStyles[selectedTextStyle],
                                  fontWeight: parseInt(value)
                                }
                              }
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select font weight" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="300">Light (300)</SelectItem>
                            <SelectItem value="400">Regular (400)</SelectItem>
                            <SelectItem value="500">Medium (500)</SelectItem>
                            <SelectItem value="600">Semibold (600)</SelectItem>
                            <SelectItem value="700">Bold (700)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Line Height</Label>
                        <Select 
                          value={settings.textStyles[selectedTextStyle].lineHeight}
                          onValueChange={(value) => {
                            setSettings({
                              ...settings,
                              textStyles: {
                                ...settings.textStyles,
                                [selectedTextStyle]: {
                                  ...settings.textStyles[selectedTextStyle],
                                  lineHeight: value
                                }
                              }
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select line height" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="var(--lh-none)">None (1)</SelectItem>
                            <SelectItem value="var(--lh-tight)">Tight (1.25)</SelectItem>
                            <SelectItem value="var(--lh-snug)">Snug (1.375)</SelectItem>
                            <SelectItem value="var(--lh-normal)">Normal (1.5)</SelectItem>
                            <SelectItem value="var(--lh-relaxed)">Relaxed (1.625)</SelectItem>
                            <SelectItem value="var(--lh-loose)">Loose (2)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Letter Spacing</Label>
                        <Select 
                          value={settings.textStyles[selectedTextStyle].letterSpacing}
                          onValueChange={(value) => {
                            setSettings({
                              ...settings,
                              textStyles: {
                                ...settings.textStyles,
                                [selectedTextStyle]: {
                                  ...settings.textStyles[selectedTextStyle],
                                  letterSpacing: value
                                }
                              }
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select letter spacing" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="var(--ls-tighter)">Tighter (-0.05em)</SelectItem>
                            <SelectItem value="var(--ls-tight)">Tight (-0.025em)</SelectItem>
                            <SelectItem value="var(--ls-normal)">Normal (0)</SelectItem>
                            <SelectItem value="var(--ls-wide)">Wide (0.025em)</SelectItem>
                            <SelectItem value="var(--ls-wider)">Wider (0.05em)</SelectItem>
                            <SelectItem value="var(--ls-widest)">Widest (0.1em)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {settings.textStyles[selectedTextStyle].textTransform !== undefined && (
                        <div>
                          <Label>Text Transform</Label>
                          <Select 
                            value={settings.textStyles[selectedTextStyle].textTransform || 'none'}
                            onValueChange={(value) => {
                              setSettings({
                                ...settings,
                                textStyles: {
                                  ...settings.textStyles,
                                  [selectedTextStyle]: {
                                    ...settings.textStyles[selectedTextStyle],
                                    textTransform: value === 'none' ? undefined : value
                                  }
                                }
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select text transform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="uppercase">Uppercase</SelectItem>
                              <SelectItem value="lowercase">Lowercase</SelectItem>
                              <SelectItem value="capitalize">Capitalize</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Font Settings Tab */}
        <TabsContent value="font-settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Font Families</CardTitle>
              <CardDescription>
                Configure the font families used in your design system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="heading-font">Heading Font</Label>
                  <Select 
                    value={settings.headingFont.name}
                    onValueChange={(value) => {
                      const fontPair = popularFontPairings.find(
                        pair => pair.heading.name === value
                      );
                      
                      if (fontPair) {
                        setSettings({
                          ...settings,
                          headingFont: fontPair.heading
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select heading font" />
                    </SelectTrigger>
                    <SelectContent>
                      {popularFontPairings.map(pair => (
                        <SelectItem key={pair.heading.name} value={pair.heading.name}>
                          {pair.heading.name} ({pair.heading.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div 
                    className="mt-2 p-3 border rounded text-lg"
                    style={{ fontFamily: `"${settings.headingFont.name}", ${settings.headingFont.fallbacks.join(", ")}` }}
                  >
                    The quick brown fox jumps over the lazy dog
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="body-font">Body Font</Label>
                  <Select 
                    value={settings.bodyFont.name}
                    onValueChange={(value) => {
                      const fontPair = popularFontPairings.find(
                        pair => pair.body.name === value
                      );
                      
                      if (fontPair) {
                        setSettings({
                          ...settings,
                          bodyFont: fontPair.body
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select body font" />
                    </SelectTrigger>
                    <SelectContent>
                      {popularFontPairings.map(pair => (
                        <SelectItem key={pair.body.name} value={pair.body.name}>
                          {pair.body.name} ({pair.body.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div 
                    className="mt-2 p-3 border rounded"
                    style={{ fontFamily: `"${settings.bodyFont.name}", ${settings.bodyFont.fallbacks.join(", ")}` }}
                  >
                    The quick brown fox jumps over the lazy dog. This is a longer text sample to show how body text will appear in paragraphs with a range of sizes and weights.
                  </div>
                </div>

                <div>
                  <Label htmlFor="mono-font">Monospace Font</Label>
                  <Select 
                    value={settings.monoFont.name}
                    onValueChange={(value) => {
                      const monoFont = [
                        ...typographyPresets.map(p => p.monoFont),
                      ].find(font => font.name === value);
                      
                      if (monoFont) {
                        setSettings({
                          ...settings,
                          monoFont
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select monospace font" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...new Set(typographyPresets.map(p => p.monoFont.name))].map(fontName => (
                        <SelectItem key={fontName} value={fontName}>
                          {fontName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div 
                    className="mt-2 p-3 border rounded font-mono text-sm"
                    style={{ fontFamily: `"${settings.monoFont.name}", ${settings.monoFont.fallbacks.join(", ")}` }}
                  >
                    function example() {
                      return "Hello, World!";
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Type Scale</CardTitle>
              <CardDescription>
                Configure the type scale used across the design system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="base-size">Base Font Size ({settings.baseFontSize}px)</Label>
                    <span className="text-sm text-muted-foreground">{settings.baseFontSize}px</span>
                  </div>
                  <Slider
                    id="base-size"
                    min={12}
                    max={20}
                    step={1}
                    value={[settings.baseFontSize]}
                    onValueChange={handleBaseFontSizeChange}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Smaller</span>
                    <span>Larger</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="scale-ratio">Scale Ratio ({settings.scale.ratio.toFixed(3)})</Label>
                    <span className="text-sm text-muted-foreground">{settings.scale.ratio.toFixed(3)}</span>
                  </div>
                  <Slider
                    id="scale-ratio"
                    min={1.067}
                    max={1.5}
                    step={0.001}
                    value={[settings.scale.ratio]}
                    onValueChange={handleScaleRatioChange}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Smaller steps</span>
                    <span>Larger steps</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="line-height">Base Line Height ({settings.baseLineHeight.toFixed(1)})</Label>
                    <span className="text-sm text-muted-foreground">{settings.baseLineHeight.toFixed(1)}</span>
                  </div>
                  <Slider
                    id="line-height"
                    min={1.2}
                    max={2.0}
                    step={0.1}
                    value={[settings.baseLineHeight]}
                    onValueChange={(value) => {
                      setSettings({
                        ...settings,
                        baseLineHeight: value[0]
                      });
                    }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Tighter</span>
                    <span>Looser</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Label className="mb-2 block">Scale Preview</Label>
                  <div className="space-y-2 border rounded-md p-4">
                    {Object.entries(settings.scale.values)
                      .filter(([key]) => ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'].includes(key))
                      .map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between border-b pb-1 last:border-0">
                          <div>
                            <span className="text-sm text-muted-foreground mr-2">{key}:</span>
                            <span style={{ fontSize: value.size }}>{value.size}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {`Line height: ${value.lineHeight}, Letter spacing: ${value.letterSpacing}`}
                          </div>
                        </div>
                      ))}
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
              <CardTitle>Typography Presets</CardTitle>
              <CardDescription>
                Choose from predefined typography systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {typographyPresets.map(preset => (
                  <div
                    key={preset.name}
                    className={`border rounded-md p-4 cursor-pointer ${
                      selectedPreset === preset.name ? 'ring-2 ring-primary' : 'hover:bg-muted/20'
                    }`}
                    onClick={() => applyPreset(preset.name)}
                  >
                    <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: `"${preset.headingFont.name}", ${preset.headingFont.fallbacks.join(", ")}` }}>
                      {preset.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3" style={{ fontFamily: `"${preset.bodyFont.name}", ${preset.bodyFont.fallbacks.join(", ")}` }}>
                      {preset.description}
                    </p>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Type size={12} />
                        <span>{preset.headingFont.name} / {preset.bodyFont.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Scaling size={12} />
                        <span>{preset.scale.ratio.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Font Pairings</CardTitle>
              <CardDescription>
                Choose from popular font combinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {popularFontPairings.map((pair, index) => (
                  <div
                    key={index}
                    className="border rounded-md p-4 cursor-pointer hover:bg-muted/20"
                    onClick={() => applyFontPairing(pair.heading, pair.body)}
                  >
                    <h3 className="text-lg font-semibold mb-1" 
                      style={{ fontFamily: `"${pair.heading.name}", ${pair.heading.fallbacks.join(", ")}` }}
                    >
                      {pair.heading.name}
                    </h3>
                    <p className="text-sm mb-3" 
                      style={{ fontFamily: `"${pair.body.name}", ${pair.body.fallbacks.join(", ")}` }}
                    >
                      {pair.body.name} - The quick brown fox jumps over the lazy dog.
                    </p>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>{pair.heading.category} + {pair.body.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}