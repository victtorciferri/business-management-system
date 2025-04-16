import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface ColorPalette {
  name?: string;
  primary: string;
  secondary: string;
  accent: string;
}

interface PaletteSuggestionsProps {
  currentPalette: ColorPalette;
  onSelect: (palette: ColorPalette) => void;
}

// Predefined color palettes
const predefinedPalettes: ColorPalette[] = [
  {
    name: 'Default',
    primary: '#4f46e5',
    secondary: '#06b6d4',
    accent: '#f59e0b',
  },
  {
    name: 'Emerald Forest',
    primary: '#059669',
    secondary: '#10b981',
    accent: '#f59e0b',
  },
  {
    name: 'Modern Purple',
    primary: '#8b5cf6',
    secondary: '#a78bfa',
    accent: '#f43f5e',
  },
  {
    name: 'Ocean Blue',
    primary: '#0284c7',
    secondary: '#38bdf8',
    accent: '#f97316',
  },
  {
    name: 'Elegant Dark',
    primary: '#1e293b',
    secondary: '#475569',
    accent: '#f43f5e',
  },
  {
    name: 'Vibrant Red',
    primary: '#dc2626',
    secondary: '#f87171',
    accent: '#3b82f6',
  },
  {
    name: 'Earthy Tones',
    primary: '#78350f',
    secondary: '#92400e',
    accent: '#65a30d',
  },
  {
    name: 'Monochrome',
    primary: '#111827',
    secondary: '#374151',
    accent: '#f97316',
  },
];

// Industry-specific palettes
const industryPalettes: Record<string, ColorPalette[]> = {
  salon: [
    {
      name: 'Salon Elegance',
      primary: '#9d174d',
      secondary: '#ec4899',
      accent: '#8b5cf6',
    },
    {
      name: 'Salon Modern',
      primary: '#7c3aed',
      secondary: '#a78bfa',
      accent: '#f472b6',
    }
  ],
  fitness: [
    {
      name: 'Fitness Energy',
      primary: '#16a34a',
      secondary: '#22d3ee',
      accent: '#facc15',
    },
    {
      name: 'Fitness Power',
      primary: '#0f172a',
      secondary: '#3b82f6',
      accent: '#ef4444',
    }
  ],
  medical: [
    {
      name: 'Medical Trust',
      primary: '#0284c7',
      secondary: '#0ea5e9',
      accent: '#64748b',
    },
    {
      name: 'Medical Care',
      primary: '#0891b2',
      secondary: '#06b6d4',
      accent: '#8b5cf6',
    }
  ],
};

export function PaletteSuggestions({ currentPalette, onSelect }: PaletteSuggestionsProps) {
  // Check if two palettes are the same (with case-insensitive comparison)
  const isSamePalette = (a: ColorPalette, b: ColorPalette) => {
    // Convert all colors to lowercase for consistent comparison
    return a.primary.toLowerCase() === b.primary.toLowerCase() && 
           a.secondary.toLowerCase() === b.secondary.toLowerCase() && 
           a.accent.toLowerCase() === b.accent.toLowerCase();
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {predefinedPalettes.map((palette, index) => (
          <Card 
            key={index}
            className={`overflow-hidden cursor-pointer transition ${
              isSamePalette(palette, currentPalette) 
                ? 'ring-2 ring-primary ring-offset-2' 
                : 'hover:shadow-md'
            }`}
            onClick={() => onSelect(palette)}
          >
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{palette.name}</span>
                {isSamePalette(palette, currentPalette) && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex gap-1 h-8">
                <div 
                  className="flex-1 rounded-l-sm"
                  style={{ backgroundColor: palette.primary }}
                ></div>
                <div 
                  className="flex-1"
                  style={{ backgroundColor: palette.secondary }}
                ></div>
                <div 
                  className="flex-1 rounded-r-sm"
                  style={{ backgroundColor: palette.accent }}
                ></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="pt-4">
        <h4 className="text-sm font-medium mb-3">Industry-specific Palettes</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(industryPalettes).map(([industry, palettes]) => (
            palettes.map((palette, index) => (
              <Card 
                key={`${industry}-${index}`}
                className={`overflow-hidden cursor-pointer transition ${
                  isSamePalette(palette, currentPalette) 
                    ? 'ring-2 ring-primary ring-offset-2' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => onSelect(palette)}
              >
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{palette.name}</span>
                    {isSamePalette(palette, currentPalette) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex gap-1 h-8">
                    <div 
                      className="flex-1 rounded-l-sm"
                      style={{ backgroundColor: palette.primary }}
                    ></div>
                    <div 
                      className="flex-1"
                      style={{ backgroundColor: palette.secondary }}
                    ></div>
                    <div 
                      className="flex-1 rounded-r-sm"
                      style={{ backgroundColor: palette.accent }}
                    ></div>
                  </div>
                </div>
              </Card>
            ))
          ))}
        </div>
      </div>
    </div>
  );
}