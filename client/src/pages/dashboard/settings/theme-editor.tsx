import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Theme, defaultTheme } from '@shared/config';
import BusinessThemeEditor from '@/components/business/theme-customization/BusinessThemeEditor';
import { Heading } from '@/components/ui/heading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

/**
 * Theme Editor Page Component
 * 
 * Dashboard page for business theme customization
 */
export default function ThemeEditorPage() {
  const [initialTheme, setInitialTheme] = useState<Theme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the current theme on load
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/business/theme');
        
        if (!response.ok) {
          throw new Error('Failed to load theme settings');
        }
        
        const data = await response.json();
        setInitialTheme(data.theme || defaultTheme);
      } catch (error) {
        console.error('Error loading theme:', error);
        setError('Unable to load theme settings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTheme();
  }, []);

  // Handle theme save
  const handleSaveTheme = async (theme: Theme) => {
    try {
      const response = await fetch('/api/business/theme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save theme settings');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving theme:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <Heading title="Theme Editor" description="Customize the look and feel of your business portal" />
        </div>
        <Card className="w-full max-w-5xl mx-auto">
          <CardContent className="p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading theme settings...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <Heading title="Theme Editor" description="Customize the look and feel of your business portal" />
        </div>
        <Alert variant="destructive" className="mb-6">
          <AlertTitle className="flex items-center gap-2">
            <InfoIcon className="h-4 w-4" />
            Error Loading Theme
          </AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <Heading title="Theme Editor" description="Customize the look and feel of your business portal" />
      </div>
      
      <ThemeProvider initialTheme={initialTheme}>
        <BusinessThemeEditor />
      </ThemeProvider>
    </div>
  );
}