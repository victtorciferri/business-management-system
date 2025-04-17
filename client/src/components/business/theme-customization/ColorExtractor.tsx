import React, { useState, useRef } from 'react';
import { Image, Upload, UploadCloud, CheckCircle2, Palette } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
// @ts-ignore
import Vibrant from 'node-vibrant';
// @ts-ignore
import tinycolor from 'tinycolor2';

interface ColorExtractorProps {
  onColorsExtracted: (colors: string[]) => void;
}

export default function ColorExtractor({ onColorsExtracted }: ColorExtractorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracted, setIsExtracted] = useState(false);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create URL for preview
      const url = URL.createObjectURL(selectedFile);
      setFileUrl(url);
      
      // Reset extraction state
      setIsExtracted(false);
      setExtractedColors([]);
    }
  };

  // Handle dropping files
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      
      // Create URL for preview
      const url = URL.createObjectURL(droppedFile);
      setFileUrl(url);
      
      // Reset extraction state
      setIsExtracted(false);
      setExtractedColors([]);
    }
  };

  // Prevent default drag behavior
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Trigger file input click
  const handleUploadClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  // Extract colors from an image using node-vibrant library
  const extractColors = async () => {
    if (!fileUrl) return;
    
    setIsLoading(true);
    
    try {
      // Use node-vibrant to extract a palette from the image
      const palette = await Vibrant.from(fileUrl).getPalette();
      
      // Get the most prominent colors
      const colors: string[] = [];
      
      // Primary color (most vibrant)
      if (palette.Vibrant) {
        colors.push(tinycolor(palette.Vibrant.hex).toHexString());
      }
      
      // Secondary color (try muted or dark vibrant for contrast)
      if (palette.Muted) {
        colors.push(tinycolor(palette.Muted.hex).toHexString());
      } else if (palette.DarkVibrant) {
        colors.push(tinycolor(palette.DarkVibrant.hex).toHexString());
      } else if (palette.LightVibrant) {
        colors.push(tinycolor(palette.LightVibrant.hex).toHexString());
      }
      
      // Text color (usually dark for contrast)
      if (palette.DarkMuted) {
        colors.push(tinycolor(palette.DarkMuted.hex).toHexString());
      } else {
        // Default to a dark gray if no suitable color found
        colors.push('#333333');
      }
      
      // Background color (usually light for contrast)
      if (palette.LightMuted) {
        colors.push(tinycolor(palette.LightMuted.hex).toHexString());
      } else {
        // Default to white if no suitable color found
        colors.push('#FFFFFF');
      }
      
      // Update state with extracted colors
      setExtractedColors(colors);
      setIsExtracted(true);
      
      // Call the callback function with extracted colors
      onColorsExtracted(colors);
    } catch (error) {
      console.error('Error extracting colors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up resources when component unmounts
  React.useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  return (
    <div className="color-extractor">
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div
            className="flex flex-col items-center justify-center gap-4 rounded-md border border-dashed p-8 text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <div className="flex flex-col items-center gap-2">
              {fileUrl ? (
                <div className="relative h-28 w-28 overflow-hidden rounded-md border border-gray-200">
                  <img
                    src={fileUrl}
                    alt="Logo preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-md bg-gray-100">
                  <Image className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              
              <div className="mt-2 text-sm text-muted-foreground">
                {fileUrl ? (
                  <span className="font-medium">{file?.name}</span>
                ) : (
                  <span>Upload your business logo or brand image</span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleUploadClick}
                size="sm"
                className="gap-1"
                disabled={isLoading}
              >
                <UploadCloud className="h-4 w-4" />
                {fileUrl ? "Change" : "Upload"}
              </Button>
              
              {fileUrl && !isExtracted && (
                <Button
                  onClick={extractColors}
                  size="sm"
                  className="gap-1"
                  disabled={isLoading}
                >
                  <Palette className="h-4 w-4" />
                  {isLoading ? "Extracting..." : "Extract Colors"}
                </Button>
              )}
              
              {isExtracted && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Colors extracted</span>
                </div>
              )}
            </div>
            
            {/* Color preview */}
            {extractedColors.length > 0 && (
              <div className="mt-4 flex gap-2">
                {extractedColors.map((color, index) => (
                  <div
                    key={index}
                    className="h-8 w-12 rounded-md border"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}