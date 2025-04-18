import React from 'react';
import { Theme } from '@shared/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon, CheckIcon, StarIcon, UserIcon, ShoppingBagIcon } from 'lucide-react';

interface ThemePreviewProps {
  theme: Theme;
  className?: string;
}

/**
 * ThemePreview Component
 * 
 * This component renders a preview of various UI elements styled according to the current theme settings.
 * It helps users visualize how their theme changes will appear across the application.
 */
export const ThemePreview: React.FC<ThemePreviewProps> = ({ theme, className }) => {
  // Make sure we have a complete theme with defaults for missing properties
  const safeTheme = {
    primaryColor: '#0077B6',
    secondaryColor: '#023E8A',
    accentColor: '#48CAE4',
    backgroundColor: '#FFFFFF',
    textColor: '#111827',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: 8,
    spacing: 16,
    cardStyle: 'default',
    buttonStyle: 'default',
    appearance: 'light',
    variant: 'professional',
    // Override defaults with actual theme values if they exist
    ...(theme || {})
  };

  // Generate CSS variables for the theme
  const themeVars = {
    '--primary': safeTheme.primaryColor,
    '--secondary': safeTheme.secondaryColor,
    '--accent': safeTheme.accentColor,
    '--text': safeTheme.textColor,
    '--background': safeTheme.backgroundColor,
    '--border-radius': `${safeTheme.borderRadius}px`,
    '--spacing': `${safeTheme.spacing}px`,
    '--font-family': safeTheme.fontFamily,
  } as React.CSSProperties;

  return (
    <div 
      className={cn("overflow-hidden rounded-lg border shadow-md", className)}
      style={{
        ...themeVars,
        fontFamily: safeTheme.fontFamily,
        backgroundColor: safeTheme.backgroundColor,
        color: safeTheme.textColor,
        padding: safeTheme.spacing,
        borderRadius: safeTheme.borderRadius,
      }}
    >
      <div className="preview-container">
        <div className="mb-6">
          <h2 
            style={{ color: safeTheme.primaryColor }} 
            className="text-xl font-bold mb-2"
          >
            Theme Preview
          </h2>
          <p className="text-sm opacity-80 mb-4">
            This preview shows how your theme will look across the application
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              style={{ backgroundColor: safeTheme.primaryColor }}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              Primary Button
            </Button>
            
            <Button 
              variant="outline"
              style={{ 
                borderColor: safeTheme.secondaryColor,
                color: safeTheme.secondaryColor 
              }}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              Secondary Button
            </Button>
            
            <Button 
              variant="ghost"
              style={{ color: safeTheme.accentColor }}
            >
              Ghost Button
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card style={{
              borderRadius: safeTheme.borderRadius,
              boxShadow: safeTheme.cardStyle === 'elevated' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none',
              border: safeTheme.cardStyle === 'bordered' ? `2px solid ${safeTheme.secondaryColor}` : '1px solid #e5e7eb',
            }}>
              <CardHeader>
                <CardTitle style={{ color: safeTheme.primaryColor }}>
                  Service Card
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>This is an example of a service card in your application.</p>
                <div className="flex items-center mt-2">
                  <Badge style={{ backgroundColor: safeTheme.secondaryColor }}>
                    Available
                  </Badge>
                  <div className="flex ml-auto">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon 
                        key={star} 
                        size={14}
                        fill={star <= 4 ? safeTheme.accentColor : 'transparent'} 
                        stroke={safeTheme.accentColor}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <span className="font-bold">$75.00</span>
                <Button size="sm" style={{ backgroundColor: safeTheme.primaryColor }}>
                  Book Now
                </Button>
              </CardFooter>
            </Card>
            
            <Card style={{
              borderRadius: safeTheme.borderRadius,
              boxShadow: safeTheme.cardStyle === 'elevated' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none',
              border: safeTheme.cardStyle === 'bordered' ? `2px solid ${safeTheme.secondaryColor}` : '1px solid #e5e7eb',
            }}>
              <CardHeader>
                <CardTitle style={{ color: safeTheme.primaryColor }}>
                  Appointment Card
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-2">
                  <CalendarIcon size={16} className="mr-2" style={{ color: safeTheme.secondaryColor }} />
                  <span>April 17, 2023 - 10:00 AM</span>
                </div>
                <div className="flex items-center mb-2">
                  <UserIcon size={16} className="mr-2" style={{ color: safeTheme.secondaryColor }} />
                  <span>With Dr. Smith</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <Badge variant="outline" style={{ borderColor: safeTheme.accentColor, color: safeTheme.accentColor }}>
                    Upcoming
                  </Badge>
                  <span className="text-sm opacity-70">Duration: 1 hour</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="mr-2" style={{ borderColor: safeTheme.secondaryColor, color: safeTheme.secondaryColor }}>
                  Reschedule
                </Button>
                <Button size="sm" variant="destructive">
                  Cancel
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: safeTheme.secondaryColor }}>
                Calendar Example
              </h3>
              <Calendar 
                mode="single"
                className="rounded border shadow-sm"
                classNames={{
                  day_selected: `bg-[${safeTheme.primaryColor}]`,
                  day_today: `text-[${safeTheme.accentColor}]`,
                }}
              />
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: safeTheme.secondaryColor }}>
                Color Palette
              </h3>
              <div className="grid grid-cols-5 gap-2">
                <div 
                  className="h-16 w-16 rounded-md shadow-sm flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: safeTheme.primaryColor }}
                >
                  Primary
                </div>
                <div 
                  className="h-16 w-16 rounded-md shadow-sm flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: safeTheme.secondaryColor }}
                >
                  Secondary
                </div>
                <div 
                  className="h-16 w-16 rounded-md shadow-sm flex items-center justify-center text-xs"
                  style={{ 
                    backgroundColor: safeTheme.accentColor,
                    color: ['#fff', '#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6'].includes(safeTheme.accentColor) 
                      ? '#000' : '#fff'
                  }}
                >
                  Accent
                </div>
                <div 
                  className="h-16 w-16 rounded-md shadow-sm flex items-center justify-center text-xs"
                  style={{ 
                    backgroundColor: safeTheme.backgroundColor,
                    color: safeTheme.textColor,
                    border: '1px solid #e5e7eb'
                  }}
                >
                  Background
                </div>
                <div 
                  className="h-16 w-16 rounded-md shadow-sm flex items-center justify-center text-white text-xs"
                  style={{ 
                    backgroundColor: safeTheme.textColor
                  }}
                >
                  Text
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemePreview;
