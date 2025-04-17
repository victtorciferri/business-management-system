import React, { useState } from 'react';
// We'll use a manual color extraction since node-vibrant has import issues
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, RefreshCw, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Theme } from '@shared/config';

interface ColorExtractorProps {
  onExtractColors: (colors: Partial<Theme>) => void;
}

export function ColorExtractor({ onExtractColors }: ColorExtractorProps) {
  const { toast } = useToast();
  const [isExtracting, setIsExtracting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<Partial<Theme> | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if the file is an image
    if (!file.type.match('image.*')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Extract colors from the image
    try {
      setIsExtracting(true);
      const colors = await extractColors(file);
      setExtractedColors(colors);
      toast({
        title: "Colors extracted",
        description: "Colors have been extracted from your logo. Click 'Apply Colors' to use them.",
      });
    } catch (error) {
      console.error('Error extracting colors:', error);
      toast({
        title: "Color extraction failed",
        description: "Unable to extract colors from this image. Please try another image.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // Simple color extraction function based on canvas sampling
  const extractColors = async (file: File): Promise<Partial<Theme>> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (!event.target?.result) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        try {
          // Create an image element
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.src = event.target.result as string;
          
          img.onload = () => {
            try {
              // Create a canvas to analyze the image
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
              }
              
              // Scale down for performance
              const maxSize = 100;
              const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
              canvas.width = img.width * scale;
              canvas.height = img.height * scale;
              
              // Draw image to canvas
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              
              // Get image data
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const pixels = imageData.data;
              
              // Calculate color buckets (simplified)
              const colorSamples: Record<string, number> = {};
              
              // Sample pixels (skip some for performance)
              for (let i = 0; i < pixels.length; i += 16) {
                const r = pixels[i];
                const g = pixels[i + 1];
                const b = pixels[i + 2];
                const a = pixels[i + 3];
                
                // Skip transparent pixels
                if (a < 128) continue;
                
                // Quantize a bit to reduce unique colors
                const quantR = Math.round(r / 16) * 16;
                const quantG = Math.round(g / 16) * 16;
                const quantB = Math.round(b / 16) * 16;
                
                const colorKey = `${quantR},${quantG},${quantB}`;
                colorSamples[colorKey] = (colorSamples[colorKey] || 0) + 1;
              }
              
              // Convert to array and sort by frequency
              const sortedColors = Object.entries(colorSamples)
                .sort((a, b) => b[1] - a[1])
                .map(([key]) => {
                  const [r, g, b] = key.split(',').map(Number);
                  return { r, g, b, hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}` };
                });
              
              // Get a bright color for primary
              const getBrightColor = () => {
                for (const color of sortedColors) {
                  const brightness = (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
                  if (brightness > 128 && brightness < 240) return color.hex;
                }
                return '#1E3A8A'; // Default primary if no suitable color found
              };
              
              // Get a darker color for text
              const getDarkColor = () => {
                for (const color of sortedColors) {
                  const brightness = (color.r * 299 + color.g * 587 + color.b * 114) / 1000;
                  if (brightness < 100) return color.hex;
                }
                return '#111827'; // Default dark if no suitable color found
              };
              
              // Generate theme colors
              const themeColors: Partial<Theme> = {
                primary: getBrightColor(),
                secondary: sortedColors[1]?.hex || '#9333EA',
                background: '#FFFFFF',
                text: getDarkColor(),
              };
              
              resolve(themeColors);
            } catch (err) {
              console.error('Color extraction error:', err);
              reject(err);
            }
          };
          
          img.onerror = () => {
            reject(new Error('Failed to load image'));
          };
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleApplyColors = () => {
    if (extractedColors) {
      onExtractColors(extractedColors);
      toast({
        title: "Colors applied",
        description: "The extracted colors have been applied to your theme.",
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Extract Colors from Logo</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Upload your logo to automatically generate a color palette
              </p>
            </div>
            <div className="flex items-center">
              <Label 
                htmlFor="logo-upload" 
                className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Logo
              </Label>
              <input 
                id="logo-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
          </div>

          {imagePreview && (
            <div className="mt-4 flex flex-col md:flex-row gap-4 items-start">
              <div className="border rounded-md p-4 flex-shrink-0">
                <p className="text-sm font-medium mb-2">Uploaded Logo</p>
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <img 
                    src={imagePreview} 
                    alt="Uploaded logo" 
                    className="max-w-full max-h-full object-contain" 
                  />
                  {isExtracting && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </div>

              {extractedColors && (
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">Extracted Colors</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-md border"
                        style={{ backgroundColor: extractedColors.primary }}
                      />
                      <span className="text-sm">Primary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-md border"
                        style={{ backgroundColor: extractedColors.secondary }}
                      />
                      <span className="text-sm">Secondary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-md border"
                        style={{ backgroundColor: extractedColors.background }}
                      />
                      <span className="text-sm">Background</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-md border"
                        style={{ backgroundColor: extractedColors.text }}
                      />
                      <span className="text-sm">Text</span>
                    </div>
                  </div>
                  <Button onClick={handleApplyColors} className="w-full">
                    <Check className="h-4 w-4 mr-2" />
                    Apply Colors
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}