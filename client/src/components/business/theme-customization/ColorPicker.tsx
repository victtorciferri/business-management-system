import React, { useState, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CheckIcon, CopyIcon, PaletteIcon } from 'lucide-react';

interface ColorPickerProps {
  label?: string;
  color?: string;
  onChange: (color: string) => void;
  className?: string;
  description?: string;
  presetColors?: string[];
}

/**
 * ColorPicker Component
 * 
 * A color picker component with hex input and visual color selection.
 * Includes preset colors for quick selection and color value copy functionality.
 */
export function ColorPicker({
  label,
  color,
  onChange,
  className,
  description,
  presetColors = [
    '#111827', // Gray 900
    '#1F2937', // Gray 800
    '#374151', // Gray 700
    '#4B5563', // Gray 600
    '#6B7280', // Gray 500
    '#9CA3AF', // Gray 400
    '#D1D5DB', // Gray 300
    '#E5E7EB', // Gray 200
    '#F3F4F6', // Gray 100
    '#F9FAFB', // Gray 50
    '#FFFFFF', // White
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#EC4899', // Pink
  ]
}) {
  const [currentColor, setCurrentColor] = useState(color || '#000000');
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with external color value
  useEffect(() => {
    setCurrentColor(color);
  }, [color]);

  // Handle color input change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);
    
    // Only update parent if it's a valid hex color
    if (/^#[0-9A-F]{6}$/i.test(newColor)) {
      onChange(newColor);
    }
  };

  // Handle color swatch click
  const handleColorSwatchClick = (presetColor: string) => {
    setCurrentColor(presetColor);
    onChange(presetColor);
    setIsOpen(false);
  };

  // Handle copy color value
  const handleCopyColor = () => {
    navigator.clipboard.writeText(currentColor);
    setCopied(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Generate a safe ID from the label, fallback to a random ID if label is undefined or empty
  const safeId = label && typeof label === 'string' ? 
    `color-${label.replace(/\s+/g, '-').toLowerCase()}` : 
    `color-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={cn("mb-4", className)}>
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor={safeId}>
          {label || "Color"}
        </Label>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full mr-1"
            onClick={handleCopyColor}
          >
            {copied ? 
              <CheckIcon className="h-3.5 w-3.5 text-green-500" /> : 
              <CopyIcon className="h-3.5 w-3.5 text-muted-foreground" />
            }
            <span className="sr-only">Copy color value</span>
          </Button>
          
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-7 w-7 p-0 border-2" style={{ backgroundColor: currentColor }}>
                <PaletteIcon className="h-4 w-4 sr-only" />
                <span className="sr-only">Open color picker</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="mb-3">
                <Label className="mb-2 block">Select Color</Label>
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {presetColors.map((presetColor, index) => (
                    <button
                      key={`${presetColor}-${index}`}
                      type="button"
                      className={cn(
                        "h-6 w-6 rounded-md border border-gray-200 flex items-center justify-center",
                        currentColor && presetColor && currentColor.toLowerCase() === presetColor.toLowerCase() && "ring-2 ring-primary ring-offset-1"
                      )}
                      style={{ backgroundColor: presetColor }}
                      onClick={() => handleColorSwatchClick(presetColor)}
                    >
                      {currentColor && presetColor && currentColor.toLowerCase() === presetColor.toLowerCase() && (
                        <CheckIcon className="h-3 w-3 text-white" />
                      )}
                      <span className="sr-only">Select color {presetColor}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id={safeId}
                    type="text"
                    value={currentColor}
                    onChange={handleColorChange}
                    className="w-full font-mono"
                    placeholder="#000000"
                  />
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => {
                      setCurrentColor(e.target.value);
                      onChange(e.target.value);
                    }}
                    className="h-10 w-10 border-0 p-0 rounded overflow-hidden"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
      )}
      <div className="flex items-center">
        <Input
          id={`color-input-${safeId}`}
          type="text"
          value={currentColor}
          onChange={handleColorChange}
          className="w-full font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

export default ColorPicker;