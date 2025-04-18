import React from 'react';
import { Theme } from '@shared/config';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckIcon, SparklesIcon } from 'lucide-react';
import { getPresetById } from '@shared/themePresets';

interface SalonEleganteThemeCaptureProps {
  onApply: (theme: Theme) => void;
  className?: string;
  isApplied?: boolean;
}

/**
 * SalonEleganteThemeCapture Component
 * 
 * This component showcases the Salon Elegante theme with its signature styling,
 * allowing users to quickly apply this elegant, dark theme to their business.
 */
export const SalonEleganteThemeCapture: React.FC<SalonEleganteThemeCaptureProps> = ({ 
  onApply, 
  className,
  isApplied = false 
}) => {
  // Get the Salon Elegante theme from presets
  const salonElegantePreset = getPresetById('salon-elegante');
  
  if (!salonElegantePreset) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 text-red-500">
        <p>Error: Salon Elegante theme preset not found!</p>
      </div>
    );
  }
  
  const { theme } = salonElegantePreset;
  
  // Handle applying the theme
  const handleApplyTheme = () => {
    onApply(theme);
  };
  
  return (
    <Card className={cn("overflow-hidden border-2", isApplied ? "border-primary" : "border-muted", className)}>
      <CardHeader className="bg-[#1f2937] text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>
            Salon Elegante
          </CardTitle>
          <Badge 
            variant="outline" 
            className="bg-[#8b5cf6]/20 text-[#f59e0b] border-[#f59e0b]/30"
          >
            Featured Theme
          </Badge>
        </div>
        <p className="text-sm text-gray-300 mt-1">
          The signature dark theme with elegant purple and amber accents
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        <div 
          className="p-4 space-y-3"
          style={{ backgroundColor: '#1f2937', color: '#f9fafb' }}
        >
          <div className="flex gap-2">
            <div 
              className="h-8 w-8 rounded-md flex items-center justify-center text-xs"
              style={{ backgroundColor: '#8b5cf6' }}
            >
              Primary
            </div>
            <div 
              className="h-8 w-8 rounded-md flex items-center justify-center text-xs"
              style={{ backgroundColor: '#7c3aed' }}
            >
              Secondary
            </div>
            <div 
              className="h-8 w-8 rounded-md flex items-center justify-center text-xs"
              style={{ backgroundColor: '#f59e0b', color: '#1f2937' }}
            >
              Accent
            </div>
          </div>
          
          <div className="p-3 bg-[#1f2937] rounded-md border border-gray-700 shadow-md">
            <h3 className="text-sm font-serif mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#f59e0b' }}>
              Signature Typography
            </h3>
            <p className="text-xs">
              Elegant serif headings with Playfair Display
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="text-xs"
              style={{ backgroundColor: '#8b5cf6' }}
            >
              Book Now
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs border-[#f59e0b] text-[#f59e0b]"
            >
              Learn More
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t bg-[#1f2937]/90 text-white pt-3 pb-3">
        <Button
          onClick={handleApplyTheme}
          variant={isApplied ? "default" : "secondary"}
          className="w-full gap-1.5"
          style={isApplied ? {} : { backgroundColor: '#f59e0b', color: '#1f2937' }}
        >
          {isApplied ? (
            <>
              <CheckIcon className="h-4 w-4" />
              <span>Applied</span>
            </>
          ) : (
            <>
              <SparklesIcon className="h-4 w-4" />
              <span>Apply Salon Elegante</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SalonEleganteThemeCapture;