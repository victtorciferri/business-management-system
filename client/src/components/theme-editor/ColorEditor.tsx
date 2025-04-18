import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  generateColorPalette, 
  calculateContrastRatio, 
  generateSemanticPalette,
  checkAccessibility,
  getColorFormats,
  ColorPalette,
  ColorShade
} from '@/../../shared/colorUtils';
import tinycolor from 'tinycolor2';
import { 
  Palette, 
  CircleOff, 
  CircleDot, 
  Pipette, 
  Copy, 
  Check, 
  Brush, 
  Sun, 
  Moon, 
  Eyedropper 
} from 'lucide-react';

interface ColorEditorProps {
  initialColor?: string;
  onChange?: (color: string) => void;
  onPaletteChange?: (palette: ColorPalette) => void;
}

export function ColorEditor({ initialColor = '#4f46e5', onChange, onPaletteChange }: ColorEditorProps) {
  const [baseColor, setBaseColor] = useState(initialColor);
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null);
  const [activeFormat, setActiveFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  const [selectedTab, setSelectedTab] = useState('palette');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [textColor, setTextColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [accessibilityResults, setAccessibilityResults] = useState(
    checkAccessibility(textColor, bgColor)
  );

  // Generate color palette when base color changes
  useEffect(() => {
    try {
      const palette = generateColorPalette(baseColor);
      setColorPalette(palette);
      
      if (onPaletteChange) {
        onPaletteChange(palette);
      }
    } catch (error) {
      console.error('Failed to generate color palette:', error);
    }
  }, [baseColor, onPaletteChange]);

  // Call onChange handler when base color changes
  useEffect(() => {
    if (onChange) {
      onChange(baseColor);
    }
  }, [baseColor, onChange]);

  // Update accessibility check when colors change
  useEffect(() => {
    setAccessibilityResults(checkAccessibility(textColor, bgColor));
  }, [textColor, bgColor]);

  // Handle color input change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (tinycolor(newColor).isValid()) {
      setBaseColor(newColor);
    }
  };

  // Handle color slider changes (HSL)
  const handleHueChange = (value: number[]) => {
    const color = tinycolor(baseColor);
    const hsl = color.toHsl();
    hsl.h = value[0];
    setBaseColor(tinycolor(hsl).toHexString());
  };

  const handleSaturationChange = (value: number[]) => {
    const color = tinycolor(baseColor);
    const hsl = color.toHsl();
    hsl.s = value[0] / 100;
    setBaseColor(tinycolor(hsl).toHexString());
  };

  const handleLightnessChange = (value: number[]) => {
    const color = tinycolor(baseColor);
    const hsl = color.toHsl();
    hsl.l = value[0] / 100;
    setBaseColor(tinycolor(hsl).toHexString());
  };

  // Copy color to clipboard
  const copyColorToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  // Render color swatch
  const ColorSwatch = ({ color, name, contrastRatio, isAccessible }: ColorShade) => (
    <div 
      className="flex items-center justify-between p-2 mb-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      onClick={() => copyColorToClipboard(color)}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-md border"
          style={{ backgroundColor: color }}
          title={color}
        />
        <span className="text-sm font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span 
          className={`text-xs ${isAccessible ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}
          title={`Contrast ratio: ${contrastRatio.toFixed(2)}`}
        >
          {isAccessible ? <CircleDot size={14} /> : <CircleOff size={14} />}
        </span>
        <span className="text-xs font-mono">{color}</span>
        {copiedColor === color ? (
          <Check size={14} className="text-green-500" />
        ) : (
          <Copy size={14} className="text-gray-400 cursor-pointer" />
        )}
      </div>
    </div>
  );

  if (!colorPalette) {
    return <div>Loading color editor...</div>;
  }

  // Get color format values
  const formats = getColorFormats(baseColor);
  const hsl = tinycolor(baseColor).toHsl();

  return (
    <div className="color-editor w-full">
      <Tabs defaultValue="palette" onValueChange={setSelectedTab} value={selectedTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="palette">
            <Palette className="w-4 h-4 mr-2" />
            Palette
          </TabsTrigger>
          <TabsTrigger value="adjustments">
            <Brush className="w-4 h-4 mr-2" />
            Adjustments
          </TabsTrigger>
          <TabsTrigger value="relationships">
            <Palette className="w-4 h-4 mr-2" />
            Relationships
          </TabsTrigger>
          <TabsTrigger value="accessibility">
            <Eyedropper className="w-4 h-4 mr-2" />
            Accessibility
          </TabsTrigger>
        </TabsList>

        {/* Color Palette Tab */}
        <TabsContent value="palette" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
              <CardDescription>
                Generate a complete color system from your base color
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                  <div
                    className="w-16 h-16 rounded-md border shadow-sm"
                    style={{ backgroundColor: baseColor }}
                  />
                  <div className="flex-1">
                    <Label htmlFor="base-color">Base Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="base-color"
                        type="text"
                        value={formats.hex}
                        onChange={handleColorChange}
                        className="font-mono"
                      />
                      <Input
                        type="color"
                        value={formats.hex}
                        onChange={handleColorChange}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="formats flex gap-2 mt-2">
                  <Badge 
                    variant={activeFormat === 'hex' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setActiveFormat('hex')}
                  >
                    HEX
                  </Badge>
                  <Badge 
                    variant={activeFormat === 'rgb' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setActiveFormat('rgb')}
                  >
                    RGB
                  </Badge>
                  <Badge 
                    variant={activeFormat === 'hsl' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setActiveFormat('hsl')}
                  >
                    HSL
                  </Badge>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-2">Color Scale</h3>
                  <ScrollArea className="h-80 rounded-md border p-2">
                    {Object.entries(colorPalette.shades)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([level, shade]) => (
                        <ColorSwatch key={level} {...shade} />
                      ))}
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => setBaseColor('#4f46e5')}>
                Reset
              </Button>
              <Button size="sm" onClick={() => copyColorToClipboard(formats.hex)}>
                Copy Base Color
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Color Adjustments Tab */}
        <TabsContent value="adjustments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Adjustments</CardTitle>
              <CardDescription>
                Fine-tune your color with precise controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="hue-slider">Hue ({Math.round(hsl.h)}°)</Label>
                    <span className="text-sm text-muted-foreground">{Math.round(hsl.h)}°</span>
                  </div>
                  <div 
                    className="h-4 rounded-md mb-2" 
                    style={{ 
                      background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                    }}
                  />
                  <Slider
                    id="hue-slider"
                    min={0}
                    max={359}
                    step={1}
                    value={[hsl.h]}
                    onValueChange={handleHueChange}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="saturation-slider">Saturation ({Math.round(hsl.s * 100)}%)</Label>
                    <span className="text-sm text-muted-foreground">{Math.round(hsl.s * 100)}%</span>
                  </div>
                  <div 
                    className="h-4 rounded-md mb-2" 
                    style={{ 
                      background: `linear-gradient(to right, 
                        ${tinycolor({ h: hsl.h, s: 0, l: hsl.l }).toHexString()}, 
                        ${tinycolor({ h: hsl.h, s: 1, l: hsl.l }).toHexString()})`
                    }}
                  />
                  <Slider
                    id="saturation-slider"
                    min={0}
                    max={100}
                    step={1}
                    value={[hsl.s * 100]}
                    onValueChange={handleSaturationChange}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="lightness-slider">Lightness ({Math.round(hsl.l * 100)}%)</Label>
                    <span className="text-sm text-muted-foreground">{Math.round(hsl.l * 100)}%</span>
                  </div>
                  <div 
                    className="h-4 rounded-md mb-2" 
                    style={{ 
                      background: 'linear-gradient(to right, #000000, #ffffff)'
                    }}
                  />
                  <Slider
                    id="lightness-slider"
                    min={0}
                    max={100}
                    step={1}
                    value={[hsl.l * 100]}
                    onValueChange={handleLightnessChange}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium mb-2">Color Format</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hex-value">HEX</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="hex-value"
                        value={formats.hex}
                        onChange={handleColorChange}
                        className="w-32 font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyColorToClipboard(formats.hex)}
                      >
                        <Copy size={14} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rgb-value">RGB</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="rgb-value"
                        value={formats.rgb}
                        readOnly
                        className="w-32 font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyColorToClipboard(formats.rgb)}
                      >
                        <Copy size={14} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hsl-value">HSL</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="hsl-value"
                        value={formats.hsl}
                        readOnly
                        className="w-32 font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyColorToClipboard(formats.hsl)}
                      >
                        <Copy size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Color Relationships Tab */}
        <TabsContent value="relationships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Relationships</CardTitle>
              <CardDescription>
                Explore harmonious color combinations based on color theory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Complementary</h3>
                  <div className="flex gap-2">
                    {colorPalette.complements.map((color, index) => (
                      <div 
                        key={index}
                        className="w-10 h-10 rounded-md border cursor-pointer"
                        style={{ backgroundColor: color }}
                        title={color}
                        onClick={() => setBaseColor(color)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Analogous</h3>
                  <div className="flex gap-2">
                    {colorPalette.analogous.map((color, index) => (
                      <div 
                        key={index}
                        className="w-10 h-10 rounded-md border cursor-pointer"
                        style={{ backgroundColor: color }}
                        title={color}
                        onClick={() => setBaseColor(color)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Triadic</h3>
                  <div className="flex gap-2">
                    {colorPalette.triadic.map((color, index) => (
                      <div 
                        key={index}
                        className="w-10 h-10 rounded-md border cursor-pointer"
                        style={{ backgroundColor: color }}
                        title={color}
                        onClick={() => setBaseColor(color)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Tetradic</h3>
                  <div className="flex gap-2">
                    {colorPalette.tetradic.map((color, index) => (
                      <div 
                        key={index}
                        className="w-10 h-10 rounded-md border cursor-pointer"
                        style={{ backgroundColor: color }}
                        title={color}
                        onClick={() => setBaseColor(color)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Monochromatic</h3>
                  <div className="flex gap-2">
                    {colorPalette.monochromatic.map((color, index) => (
                      <div 
                        key={index}
                        className="w-10 h-10 rounded-md border cursor-pointer"
                        style={{ backgroundColor: color }}
                        title={color}
                        onClick={() => setBaseColor(color)}
                      />
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-3">Semantic Colors</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(generateSemanticPalette(baseColor)).map(([name, color]) => (
                      <div 
                        key={name}
                        className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setBaseColor(color)}
                      >
                        <div 
                          className="w-6 h-6 rounded-md border"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm capitalize">{name}</span>
                        <span className="text-xs font-mono ml-auto text-gray-500">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accessibility Tab */}
        <TabsContent value="accessibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Checker</CardTitle>
              <CardDescription>
                Verify your color combinations meet WCAG 2.0 accessibility guidelines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="text-color" className="mb-1 block">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="text-color"
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="font-mono"
                      />
                      <Input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="bg-color" className="mb-1 block">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bg-color"
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="font-mono"
                      />
                      <Input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div 
                  className="p-6 rounded-md text-center border"
                  style={{ 
                    backgroundColor: bgColor,
                    color: textColor
                  }}
                >
                  <p className="text-2xl font-bold mb-2">Sample Text</p>
                  <p>This is what your text will look like.</p>
                  <p className="text-sm mt-2">The quick brown fox jumps over the lazy dog.</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                  <h3 className="text-sm font-medium mb-3">WCAG 2.0 Results</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Contrast Ratio:</span>
                      <Badge 
                        variant={accessibilityResults.contrastRatio >= 4.5 ? "default" : "destructive"}
                      >
                        {accessibilityResults.contrastRatio.toFixed(2)}:1
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Normal Text (4.5:1):</span>
                      <Badge 
                        variant={accessibilityResults.normalText ? "default" : "destructive"}
                      >
                        {accessibilityResults.normalText ? 'Pass' : 'Fail'}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Large Text (3:1):</span>
                      <Badge 
                        variant={accessibilityResults.largeText ? "default" : "destructive"}
                      >
                        {accessibilityResults.largeText ? 'Pass' : 'Fail'}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Enhanced Contrast (7:1):</span>
                      <Badge 
                        variant={accessibilityResults.enhanced ? "default" : "destructive"}
                      >
                        {accessibilityResults.enhanced ? 'Pass' : 'Fail'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-center">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTextColor('#000000');
                      setBgColor('#ffffff');
                    }}
                  >
                    <Sun size={16} className="mr-1" />
                    Light Mode
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTextColor('#ffffff');
                      setBgColor('#000000');
                    }}
                  >
                    <Moon size={16} className="mr-1" />
                    Dark Mode
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTextColor('#ffffff');
                      setBgColor(baseColor);
                    }}
                  >
                    <Pipette size={16} className="mr-1" />
                    Use Base Color
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}