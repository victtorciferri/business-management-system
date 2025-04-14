import React, { useState, useRef, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Paintbrush, Check } from 'lucide-react';

interface ColorPickerProps {
  id?: string;
  color: string;
  onChange: (color: string) => void;
  presetColors?: string[];
}

export function ColorPicker({ 
  id, 
  color, 
  onChange, 
  presetColors = [
    '#000000', '#ffffff', '#f44336', '#e91e63', '#9c27b0', 
    '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', 
    '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', 
    '#ffc107', '#ff9800', '#ff5722', '#795548', '#607d8b'
  ] 
}: ColorPickerProps) {
  const [localColor, setLocalColor] = useState(color);
  const [isOpen, setIsOpen] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);
  
  // Update local color when prop changes
  useEffect(() => {
    setLocalColor(color);
  }, [color]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setLocalColor(newColor);
  };
  
  // Apply color change when input blurs or enter is pressed
  const applyColorChange = () => {
    // Validate color format
    if (/^#([0-9A-F]{3}){1,2}$/i.test(localColor)) {
      onChange(localColor);
    } else {
      // Reset to last valid color if invalid
      setLocalColor(color);
    }
  };
  
  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyColorChange();
      setIsOpen(false);
    }
  };
  
  // Handle preset color selection
  const handlePresetSelect = (presetColor: string) => {
    setLocalColor(presetColor);
    onChange(presetColor);
  };
  
  // Focus input when popover opens
  useEffect(() => {
    if (isOpen && colorInputRef.current) {
      setTimeout(() => {
        colorInputRef.current?.focus();
        colorInputRef.current?.select();
      }, 100);
    }
  }, [isOpen]);
  
  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="h-10 w-10 rounded-md p-0 relative overflow-hidden"
            aria-label="Pick a color"
            id={id}
          >
            <div 
              className="absolute inset-0"
              style={{ backgroundColor: localColor }}
            />
            {localColor === '#ffffff' && (
              <div className="absolute inset-0 border border-gray-200 rounded-md" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div 
                  className="h-8 w-8 rounded-md"
                  style={{ backgroundColor: localColor }}
                />
                <Input
                  ref={colorInputRef}
                  value={localColor}
                  onChange={handleInputChange}
                  onBlur={applyColorChange}
                  onKeyDown={handleKeyPress}
                  maxLength={7}
                  className="font-mono"
                />
                <Paintbrush className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div>
              <div className="grid grid-cols-5 gap-2">
                {presetColors.map((presetColor) => (
                  <Button
                    key={presetColor}
                    variant="outline"
                    className="h-8 w-8 rounded-md p-0 relative overflow-hidden"
                    onClick={() => handlePresetSelect(presetColor)}
                  >
                    <div 
                      className="absolute inset-0"
                      style={{ backgroundColor: presetColor }}
                    />
                    {presetColor === localColor && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                    {presetColor === '#ffffff' && (
                      <div className="absolute inset-0 border border-gray-200 rounded-md" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      <Input
        value={localColor}
        onChange={handleInputChange}
        onBlur={applyColorChange}
        maxLength={7}
        className="font-mono w-28"
      />
    </div>
  );
}