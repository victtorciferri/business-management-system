import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FontSelectorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
}

// Available fonts
const fonts = [
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
  {
    name: 'Playfair Display',
    value: '"Playfair Display", serif',
    category: 'Serif',
  },
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
  const fontCategories = fonts.reduce((acc, font) => {
    if (!acc[font.category]) {
      acc[font.category] = [];
    }
    acc[font.category].push(font);
    return acc;
  }, {} as Record<string, typeof fonts>);
  
  return (
    <Select value={value} onValueChange={onChange}>
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
              >
                {font.name}
              </SelectItem>
            ))}
          </React.Fragment>
        ))}
      </SelectContent>
    </Select>
  );
}