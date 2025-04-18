import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface FontSelectorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
}

interface FontOption {
  name: string;
  value: string;
  category: string;
  description?: string;
}

// Available fonts
const fonts: FontOption[] = [
  // Featured - our special fonts for branded themes
  {
    name: 'Playfair Display',
    value: '"Playfair Display", serif',
    category: 'Featured',
    description: 'Elegant serif font used in Salon Elegante theme'
  },
  {
    name: 'Manrope',
    value: 'Manrope, sans-serif',
    category: 'Featured',
    description: 'Modern sans-serif for professional businesses'
  },
  // Sans-serif fonts
  {
    name: 'Inter',
    value: 'Inter, sans-serif',
    category: 'Sans-serif',
  },
  {
    name: 'Roboto',
    value: 'Roboto, sans-serif',
    category: 'Sans-serif',
  },
  {
    name: 'Open Sans',
    value: '"Open Sans", sans-serif',
    category: 'Sans-serif',
  },
  {
    name: 'Montserrat',
    value: 'Montserrat, sans-serif',
    category: 'Sans-serif',
  },
  {
    name: 'Lato',
    value: 'Lato, sans-serif',
    category: 'Sans-serif',
  },
  {
    name: 'Poppins',
    value: 'Poppins, sans-serif',
    category: 'Sans-serif',
  },
  {
    name: 'Source Sans Pro',
    value: '"Source Sans Pro", sans-serif',
    category: 'Sans-serif',
  },
  // Serif fonts
  {
    name: 'Merriweather',
    value: 'Merriweather, serif',
    category: 'Serif',
  },
  {
    name: 'Lora',
    value: 'Lora, serif',
    category: 'Serif',
  },
  {
    name: 'PT Serif',
    value: '"PT Serif", serif',
    category: 'Serif',
  },
  // Monospace fonts
  {
    name: 'JetBrains Mono',
    value: '"JetBrains Mono", monospace',
    category: 'Monospace',
  },
  {
    name: 'Fira Code',
    value: '"Fira Code", monospace',
    category: 'Monospace',
  },
  {
    name: 'IBM Plex Mono',
    value: '"IBM Plex Mono", monospace',
    category: 'Monospace',
  },
];

export function FontSelector({ id, value, onChange }: FontSelectorProps) {
  // Group fonts by category
  const fontCategories = fonts.reduce<Record<string, FontOption[]>>((acc, font) => {
    if (!acc[font.category]) {
      acc[font.category] = [];
    }
    acc[font.category].push(font);
    return acc;
  }, {});
  
  // Use default font if value is undefined or empty
  const safeValue = value || 'Inter, sans-serif';
  
  // Check if the provided value exists in our font list, if not default to Inter
  const fontExists = fonts.some(font => font.value === safeValue);
  const finalValue = fontExists ? safeValue : 'Inter, sans-serif';
  
  return (
    <Select 
      value={finalValue} 
      onValueChange={(newValue) => onChange(newValue)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Select a font" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(fontCategories).map(([category, categoryFonts]) => (
          <React.Fragment key={category}>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              {category}
            </div>
            {categoryFonts.map((font) => (
              <SelectItem
                key={font.name}
                value={font.value}
                style={{ fontFamily: font.value }}
                className={category === 'Featured' ? 'flex flex-col items-start' : ''}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{font.name}</span>
                  {category === 'Featured' && (
                    <Badge variant="outline" className="ml-2 px-1.5 py-0.5 text-[10px] bg-primary/10 text-primary border-primary/30">
                      Featured
                    </Badge>
                  )}
                </div>
                {category === 'Featured' && 'description' in font && (
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {font.description}
                  </span>
                )}
              </SelectItem>
            ))}
          </React.Fragment>
        ))}
      </SelectContent>
    </Select>
  );
}