import React, { useState, useCallback, useRef } from 'react';
import vibrantWrapper from '@/utils/vibrant-wrapper';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Theme } from '@shared/config';
import { cn } from '@/lib/utils';
import { ImageIcon, UploadIcon, CheckIcon, PaletteIcon } from 'lucide-react';

interface PaletteColor {
  name: string;
  hex: string;
  role: keyof Theme | null;
}

interface ColorExtractorProps {
  onSelectColors: (colors: Partial<Theme>) => void;
  className?: string;
}

/**
 * ColorExtractor Component
 * 
 * Extracts color palettes from uploaded business logos and images.
 * Allows users to generate brand-consistent color schemes automatically.
 */
export const ColorExtractor: React.FC<ColorExtractorProps> = ({ 
  onSelectColors,
  className
}) => {
  const { toast } = useToast();
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setHasImage(true);
    };
    reader.readAsDataURL(file);

    try {
      setIsExtracting(true);
      
      // Extract colors using Vibrant
      const image = await createImageBitmap(file);
      const swatches = await vibrantWrapper.extractColors(file);
      
      // Map swatches to palette colors
      const extractedPalette: PaletteColor[] = [];
      
      if (swatches.Vibrant) {
        extractedPalette.push({ 
          name: 'Vibrant', 
          hex: swatches.Vibrant.getHex(), 
          role: 'primaryColor' 
        });
      }
      
      if (swatches.DarkVibrant) {
        extractedPalette.push({ 
          name: 'Dark Vibrant', 
          hex: swatches.DarkVibrant.getHex(), 
          role: 'secondaryColor' 
        });
      }
      
      if (swatches.LightVibrant) {
        extractedPalette.push({ 
          name: 'Light Vibrant', 
          hex: swatches.LightVibrant.getHex(), 
          role: 'accentColor' 
        });
      }
      
      if (swatches.Muted) {
        extractedPalette.push({ 
          name: 'Muted', 
          hex: swatches.Muted.getHex(), 
          role: null 
        });
      }
      
      if (swatches.DarkMuted) {
        extractedPalette.push({ 
          name: 'Dark Muted', 
          hex: swatches.DarkMuted.getHex(), 
          role: 'textColor' 
        });
      }
      
      if (swatches.LightMuted) {
        extractedPalette.push({ 
          name: 'Light Muted', 
          hex: swatches.LightMuted.getHex(), 
          role: 'backgroundColor' 
        });
      }
      
      setPalette(extractedPalette);
      
      toast({
        title: "Colors extracted",
        description: "Colors have been extracted from your image",
      });
    } catch (error) {
      console.error('Error extracting colors:', error);
      toast({
        title: "Extraction failed",
        description: "Failed to extract colors from the image. Please try another image.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  }, [toast]);

  // Handle applying the extracted palette
  const handleApplyPalette = useCallback(() => {
    // Create theme object from palette
    const themeUpdate: Partial<Theme> = {
      colorPalette: palette.map(color => color.hex),
    };
    
    // Apply role-based colors
    palette.forEach(color => {
      if (color.role) {
        themeUpdate[color.role] = color.hex;
      }
    });
    
    // Apply theme update
    onSelectColors(themeUpdate);
    
    toast({
      title: "Palette applied",
      description: "The extracted color palette has been applied to your theme",
    });
  }, [palette, onSelectColors, toast]);

  // Handle clicking the upload zone
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col space-y-1.5">
        <Label className="text-base font-semibold">Extract Colors from Logo</Label>
        <p className="text-sm text-muted-foreground">
          Upload your business logo to automatically generate a matching color palette
        </p>
      </div>
      
      <div 
        onClick={handleUploadClick}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors",
          hasImage ? "border-primary/30" : "border-gray-300"
        )}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
        
        {imagePreview ? (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="relative w-full max-w-[200px] aspect-square">
              <img 
                src={imagePreview} 
                alt="Logo preview" 
                className="w-full h-full object-contain"
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleUploadClick}>
              <UploadIcon className="mr-2 h-4 w-4" />
              Change image
            </Button>
          </div>
        ) : (
          <>
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-center text-muted-foreground mt-2">
              Click to upload your logo or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              SVG, PNG, JPG or GIF (max. 2MB)
            </p>
          </>
        )}
      </div>
      
      {isExtracting ? (
        <div className="space-y-3">
          <Label>Extracting colors...</Label>
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-12 rounded-md" />
            ))}
          </div>
        </div>
      ) : palette.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Extracted Palette</Label>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleApplyPalette}
                >
                  <PaletteIcon className="mr-2 h-4 w-4" />
                  Apply colors
                </Button>
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {palette.map((color, index) => (
                  <div key={index} className="space-y-1 text-center">
                    <div 
                      className="h-12 w-full rounded-md border shadow-sm flex items-center justify-center relative"
                      style={{ backgroundColor: color.hex }}
                    >
                      {color.role && (
                        <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 rounded-tl-md p-1">
                          <CheckIcon className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-mono truncate">{color.hex}</p>
                    <p className="text-xs text-muted-foreground">{color.name}</p>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-muted-foreground">
                Colors with a check mark will be automatically assigned to the theme
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default ColorExtractor;