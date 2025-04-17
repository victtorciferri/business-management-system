import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  description?: string;
  presetColors?: string[];
}

export default function ColorPicker({
  value,
  onChange,
  label,
  description,
  presetColors = [
    '#1E3A8A', // Blue
    '#9333EA', // Purple
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#EC4899', // Pink
    '#6B7280', // Gray
    '#000000', // Black
    '#FFFFFF', // White
  ]
}: ColorPickerProps) {
  const [color, setColor] = useState(value || '#1E3A8A');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local state when external value changes
  useEffect(() => {
    if (value) {
      setColor(value);
    }
  }, [value]);

  // Handle color input change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    onChange(newColor);
  };

  // Handle hex input change
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let hex = e.target.value;
    
    // Ensure hex starts with #
    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }
    
    // Basic hex validation
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      setColor(hex);
      onChange(hex);
    } else if (hex.length <= 7) {
      // Allow typing but don't update parent until valid
      setColor(hex);
    }
  };

  // Handle color preset selection
  const handlePresetClick = (presetColor: string) => {
    setColor(presetColor);
    onChange(presetColor);
  };

  // Copy color to clipboard
  const copyToClipboard = () => {
    if (inputRef.current) {
      navigator.clipboard.writeText(color);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get contrasting text color for a background
  const getContrastColor = (hexColor: string): string => {
    // Remove # if present
    hexColor = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    
    // Calculate luminance using YIQ formula
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
  };

  return (
    <div className="color-picker">
      {label && (
        <div className="flex flex-col space-y-1.5 mb-2">
          <Label>{label}</Label>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[60px] h-[32px] p-0 border-2"
              style={{ 
                backgroundColor: color,
                borderColor: getContrastColor(color),
              }}
            >
              <span className="sr-only">Open color picker</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-64 p-3"
            side="right"
            align="start"
          >
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div
                  className="w-12 h-12 rounded-md border"
                  style={{ backgroundColor: color }}
                />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Input
                      ref={inputRef}
                      type="text"
                      value={color}
                      onChange={handleHexChange}
                      className="h-8 font-mono"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Input
                    type="color"
                    value={color}
                    onChange={handleColorChange}
                    className="h-8"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-1 mt-2">
                {presetColors.map((presetColor) => (
                  <button
                    key={presetColor}
                    className={`w-8 h-8 rounded-md border ${
                      presetColor === color ? 'ring-2 ring-offset-1 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: presetColor }}
                    onClick={() => handlePresetClick(presetColor)}
                    title={presetColor}
                    type="button"
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="flex-1">
          <Input
            value={color}
            onChange={handleHexChange}
            className="h-[32px] font-mono"
          />
        </div>
      </div>
    </div>
  );
}