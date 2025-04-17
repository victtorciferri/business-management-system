import React from 'react';
import { 
  Card,
  CardContent
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { LayoutGrid, Sparkles, Briefcase, Scissors, Award, Stethoscope } from 'lucide-react';
import type { Theme, ThemePreset } from '../../../types/theme';

interface ThemePresetSelectorProps {
  onSelect: (preset: Partial<Theme>) => void;
}

export default function ThemePresetSelector({ onSelect }: ThemePresetSelectorProps) {
  // Theme presets organized by industry/style
  const presets: ThemePreset[] = [
    // Professional presets
    {
      id: 'pro-blue',
      name: 'Corporate Blue',
      category: 'professional',
      description: 'Professional and trustworthy blue theme',
      theme: {
        primaryColor: '#2563eb',
        secondaryColor: '#475569',
        accentColor: '#f59e0b',
        backgroundColor: '#ffffff',
        textColor: '#1e293b',
        variant: 'professional'
      },
      preview: {
        colors: ['#2563eb', '#475569', '#f59e0b', '#ffffff', '#1e293b']
      }
    },
    {
      id: 'pro-green',
      name: 'Business Green',
      category: 'professional',
      description: 'Professional green theme with a touch of growth',
      theme: {
        primaryColor: '#059669',
        secondaryColor: '#334155',
        accentColor: '#8b5cf6',
        backgroundColor: '#f8fafc',
        textColor: '#0f172a',
        variant: 'professional'
      },
      preview: {
        colors: ['#059669', '#334155', '#8b5cf6', '#f8fafc', '#0f172a']
      }
    },
    {
      id: 'pro-purple',
      name: 'Elegant Purple',
      category: 'professional',
      description: 'Sophisticated and elegant purple theme',
      theme: {
        primaryColor: '#7c3aed',
        secondaryColor: '#334155',
        accentColor: '#ec4899',
        backgroundColor: '#ffffff',
        textColor: '#1e293b',
        variant: 'professional'
      },
      preview: {
        colors: ['#7c3aed', '#334155', '#ec4899', '#ffffff', '#1e293b']
      }
    },
    
    // Salon & Spa presets
    {
      id: 'salon-pink',
      name: 'Spa Elegance',
      category: 'salon',
      description: 'Luxurious pink and gold for spas and salons',
      theme: {
        primaryColor: '#db2777',
        secondaryColor: '#8b5cf6',
        accentColor: '#d97706',
        backgroundColor: '#fffbf5',
        textColor: '#1e293b',
        variant: 'vibrant'
      },
      preview: {
        colors: ['#db2777', '#8b5cf6', '#d97706', '#fffbf5', '#1e293b']
      }
    },
    {
      id: 'salon-teal',
      name: 'Tranquil Teal',
      category: 'salon',
      description: 'Peaceful teal theme for relaxing environments',
      theme: {
        primaryColor: '#0d9488',
        secondaryColor: '#475569',
        accentColor: '#8b5cf6',
        backgroundColor: '#f8fafc',
        textColor: '#1e293b',
        variant: 'tint'
      },
      preview: {
        colors: ['#0d9488', '#475569', '#8b5cf6', '#f8fafc', '#1e293b']
      }
    },
    {
      id: 'salon-lavender',
      name: 'Lavender Calm',
      category: 'salon',
      description: 'Soothing lavender theme for wellness centers',
      theme: {
        primaryColor: '#8b5cf6',
        secondaryColor: '#64748b',
        accentColor: '#ec4899',
        backgroundColor: '#f8f9fa',
        textColor: '#334155',
        variant: 'tint'
      },
      preview: {
        colors: ['#8b5cf6', '#64748b', '#ec4899', '#f8f9fa', '#334155']
      }
    },
    
    // Medical presets
    {
      id: 'medical-blue',
      name: 'Healthcare Blue',
      category: 'medical',
      description: 'Clean, professional blue for medical practices',
      theme: {
        primaryColor: '#0284c7',
        secondaryColor: '#64748b',
        accentColor: '#059669',
        backgroundColor: '#ffffff',
        textColor: '#0f172a',
        variant: 'professional'
      },
      preview: {
        colors: ['#0284c7', '#64748b', '#059669', '#ffffff', '#0f172a']
      }
    },
    {
      id: 'medical-teal',
      name: 'Medical Teal',
      category: 'medical',
      description: 'Trustworthy teal theme for healthcare',
      theme: {
        primaryColor: '#0f766e',
        secondaryColor: '#475569',
        accentColor: '#dc2626',
        backgroundColor: '#f9fafb',
        textColor: '#1e293b',
        variant: 'professional'
      },
      preview: {
        colors: ['#0f766e', '#475569', '#dc2626', '#f9fafb', '#1e293b']
      }
    },
    {
      id: 'medical-green',
      name: 'Wellness Green',
      category: 'medical',
      description: 'Calming green for wellness and medical spas',
      theme: {
        primaryColor: '#16a34a',
        secondaryColor: '#334155',
        accentColor: '#3b82f6',
        backgroundColor: '#f8fafc',
        textColor: '#0f172a',
        variant: 'tint'
      },
      preview: {
        colors: ['#16a34a', '#334155', '#3b82f6', '#f8fafc', '#0f172a']
      }
    },
    
    // Creative presets
    {
      id: 'creative-orange',
      name: 'Creative Orange',
      category: 'creative',
      description: 'Vibrant orange for creative businesses',
      theme: {
        primaryColor: '#ea580c',
        secondaryColor: '#4338ca',
        accentColor: '#fbbf24',
        backgroundColor: '#ffffff',
        textColor: '#27272a',
        variant: 'vibrant'
      },
      preview: {
        colors: ['#ea580c', '#4338ca', '#fbbf24', '#ffffff', '#27272a']
      }
    },
    {
      id: 'creative-purple',
      name: 'Creative Purple',
      category: 'creative',
      description: 'Bold, creative purple theme',
      theme: {
        primaryColor: '#9333ea',
        secondaryColor: '#0891b2',
        accentColor: '#f43f5e',
        backgroundColor: '#f8fafc',
        textColor: '#0f172a',
        variant: 'vibrant'
      },
      preview: {
        colors: ['#9333ea', '#0891b2', '#f43f5e', '#f8fafc', '#0f172a']
      }
    },
    {
      id: 'creative-pink',
      name: 'Bold Pink',
      category: 'creative',
      description: 'Playful pink theme for fashion and creative industries',
      theme: {
        primaryColor: '#ec4899',
        secondaryColor: '#6366f1',
        accentColor: '#fbbf24',
        backgroundColor: '#ffffff',
        textColor: '#334155',
        variant: 'vibrant'
      },
      preview: {
        colors: ['#ec4899', '#6366f1', '#fbbf24', '#ffffff', '#334155']
      }
    }
  ];
  
  // Function to filter presets by category
  const getPresetsByCategory = (category: string) => {
    return presets.filter(preset => preset.category === category);
  };
  
  return (
    <div className="theme-preset-selector">
      <Tabs defaultValue="all">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="all" className="flex items-center gap-1">
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">All</span>
          </TabsTrigger>
          <TabsTrigger value="professional" className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Business</span>
          </TabsTrigger>
          <TabsTrigger value="salon" className="flex items-center gap-1">
            <Scissors className="h-4 w-4" />
            <span className="hidden sm:inline">Salon</span>
          </TabsTrigger>
          <TabsTrigger value="medical" className="flex items-center gap-1">
            <Stethoscope className="h-4 w-4" />
            <span className="hidden sm:inline">Medical</span>
          </TabsTrigger>
          <TabsTrigger value="creative" className="flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Creative</span>
          </TabsTrigger>
        </TabsList>
        
        {/* All presets */}
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presets.map((preset) => (
              <PresetCard key={preset.id} preset={preset} onSelect={onSelect} />
            ))}
          </div>
        </TabsContent>
        
        {/* Professional presets */}
        <TabsContent value="professional">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getPresetsByCategory('professional').map((preset) => (
              <PresetCard key={preset.id} preset={preset} onSelect={onSelect} />
            ))}
          </div>
        </TabsContent>
        
        {/* Salon presets */}
        <TabsContent value="salon">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getPresetsByCategory('salon').map((preset) => (
              <PresetCard key={preset.id} preset={preset} onSelect={onSelect} />
            ))}
          </div>
        </TabsContent>
        
        {/* Medical presets */}
        <TabsContent value="medical">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getPresetsByCategory('medical').map((preset) => (
              <PresetCard key={preset.id} preset={preset} onSelect={onSelect} />
            ))}
          </div>
        </TabsContent>
        
        {/* Creative presets */}
        <TabsContent value="creative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getPresetsByCategory('creative').map((preset) => (
              <PresetCard key={preset.id} preset={preset} onSelect={onSelect} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Individual preset card component
function PresetCard({ 
  preset, 
  onSelect 
}: { 
  preset: ThemePreset; 
  onSelect: (preset: Partial<Theme>) => void;
}) {
  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
      onClick={() => onSelect(preset.theme)}
    >
      <div 
        className="h-12 w-full flex items-center justify-center"
        style={{ backgroundColor: preset.theme.primaryColor }}
      >
        <span className="font-medium text-white text-sm">
          {preset.name}
        </span>
      </div>
      
      <CardContent className="p-4">
        <div className="flex gap-1.5 mb-2">
          {preset.preview?.colors.map((color, index) => (
            <div 
              key={index}
              className="h-6 w-6 rounded-full border"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground">
          {preset.description}
        </p>
        
        {preset.theme.variant && (
          <div className="mt-2 flex items-center">
            <Award className="h-3.5 w-3.5 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground capitalize">
              {preset.theme.variant}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}