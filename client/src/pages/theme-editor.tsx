import React, { useState, useEffect } from 'react';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { ThemeEditor } from '@/components/business/theme-customization/ThemeEditor';
import { BusinessThemeEditor } from '@/components/business/theme-customization/BusinessThemeEditor';
import { Container, Section } from '@/components/ui/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, AlertTriangle, Paintbrush, Eye } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ModernThemeEditor } from '@/components/theme-editor/ModernThemeEditor';
import GlobalThemeProvider from '@/providers/GlobalThemeProvider';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Define local Theme type for theme preview
interface Theme {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  fontFamily?: string;
  [key: string]: any;
}

export default function ThemeEditorPage() {
  const { business, isLoading: businessContextLoading } = useBusinessContext();
  const [location] = useLocation();
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [businessId, setBusinessId] = useState<number | null>(null);
  
  // Parse query parameters to get businessId
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const businessIdParam = params.get('businessId');
    
    if (businessIdParam && !isNaN(Number(businessIdParam))) {
      setBusinessId(Number(businessIdParam));
    }
  }, [location]);
  
  // Fetch business data if businessId is provided (for admin)
  const { data: adminBusinessData, isLoading: adminBusinessLoading } = useQuery({
    queryKey: ['/api/admin/business', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      const response = await apiRequest('GET', `/api/admin/business/${businessId}`);
      return response.json();
    },
    enabled: !!businessId
  });
  
  // Determine which business to use based on context or admin panel
  const currentBusiness = adminBusinessData || business;
  const isLoading = businessContextLoading || adminBusinessLoading;
  
  // Handle theme preview
  const handlePreview = (themeConfig: any) => {
    setPreviewTheme(themeConfig as Theme);
    setIsPreviewActive(true);
    
    // Apply preview styles
    // Using legacy property names first, falling back to new theme properties if available
    const primary = themeConfig.primaryColor || themeConfig.primary;
    const secondary = themeConfig.secondaryColor || themeConfig.secondary;
    const background = themeConfig.backgroundColor || themeConfig.background;
    const textColor = themeConfig.textColor || themeConfig.text;
    
    if (primary) document.documentElement.style.setProperty('--primary', primary);
    if (secondary) document.documentElement.style.setProperty('--secondary', secondary);
    if (themeConfig.accentColor) document.documentElement.style.setProperty('--accent', themeConfig.accentColor);
    if (background) document.documentElement.style.setProperty('--background', background);
    if (textColor) document.documentElement.style.setProperty('--foreground', textColor);
    
    // Apply border radius
    if (themeConfig.borderRadius) {
      document.documentElement.style.setProperty('--radius', `${themeConfig.borderRadius}px`);
    }
    
    // Apply font family
    if (themeConfig.fontFamily) {
      document.body.style.fontFamily = themeConfig.fontFamily;
    }
  };
  
  // Handle theme save
  const handleSave = () => {
    // Reset preview state after saving
    setIsPreviewActive(false);
    setPreviewTheme(null);
    
    // Reset any preview styles that were applied
    document.documentElement.removeAttribute('style');
    document.body.removeAttribute('style');
  };
  
  // Exit preview mode
  const exitPreview = () => {
    setIsPreviewActive(false);
    setPreviewTheme(null);
    
    // Reset any preview styles that were applied
    document.documentElement.removeAttribute('style');
    document.body.removeAttribute('style');
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen pb-12">
        {isPreviewActive && (
          <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
            <Alert className="w-auto max-w-md border shadow-lg">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Preview Mode Active</AlertTitle>
              <AlertDescription>
                You're previewing theme changes. These changes are not saved yet.
              </AlertDescription>
              <Button 
                size="sm" 
                variant="outline" 
                className="ml-4"
                onClick={exitPreview}
              >
                Exit Preview
              </Button>
            </Alert>
          </div>
        )}
        
        <Container>
          <div className="flex flex-col md:flex-row items-start justify-between py-6 gap-4">
            <div>
              <Button variant="ghost" size="sm" asChild className="mb-2">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Paintbrush className="h-6 w-6 text-primary" />
                Theme Editor
              </h1>
              <p className="text-muted-foreground mt-1">
                Customize the look and feel of your business portal
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/preview-business">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Site
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/dashboard/settings">
                  Back to Settings
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <Tabs defaultValue="modern">
              <TabsList className="mb-4">
                <TabsTrigger value="modern">Modern Theme System</TabsTrigger>
                <TabsTrigger value="legacy">Legacy Theme Editors</TabsTrigger>
              </TabsList>
              
              <Card className="mb-4 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <CardContent className="py-3">
                  <Alert className="bg-transparent border-0 p-0">
                    <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-700 dark:text-blue-300">About Theme Editors</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
                      <p className="mb-2"><strong>Modern Theme System (2025)</strong>: The new sophisticated theme editor with comprehensive design tokens and component variants.</p>
                      <p><strong>Legacy Theme Editors</strong>: Earlier versions of the theme editor for backward compatibility.</p>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
              
              <TabsContent value="modern">
                <GlobalThemeProvider>
                  <ModernThemeEditor 
                    onPreviewToggle={setIsPreviewActive}
                  />
                </GlobalThemeProvider>
              </TabsContent>
              
              <TabsContent value="legacy">
                <Tabs defaultValue="simple">
                  <TabsList className="mb-4">
                    <TabsTrigger value="simple">Business Theme</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced Theme Editor</TabsTrigger>
                  </TabsList>
                
                  <TabsContent value="advanced">
                    <ThemeEditor 
                      onPreview={handlePreview}
                      onSave={handleSave}
                    />
                  </TabsContent>
                  
                  <TabsContent value="simple">
                    <BusinessThemeEditor />
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </div>
          
          <Section>
            <Card>
              <CardHeader>
                <CardTitle>Theme Export & Import</CardTitle>
                <CardDescription>
                  Save your theme settings or load a previously saved theme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <Button variant="outline">
                    Export Theme Settings
                  </Button>
                  <Button variant="outline">
                    Import Theme Settings
                  </Button>
                </div>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Theme Compatibility</AlertTitle>
                  <AlertDescription>
                    Imported themes may need adjustments to work correctly with your current template.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </Section>
        </Container>
      </div>
    </ProtectedRoute>
  );
}