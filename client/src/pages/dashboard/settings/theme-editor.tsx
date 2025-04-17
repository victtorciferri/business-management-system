import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useUser } from '@/hooks/useUser';
import { 
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading 
} from '@/components/ui/page-header';
import { BusinessThemeEditor } from '@/components/business/theme-customization/BusinessThemeEditor';
import { defaultTheme, type Theme } from '@/types/theme';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';

export default function ThemeEditorPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const businessId = user?.id;
  
  // State to store the current theme
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  
  // Fetch the user's current theme
  const { data: themeData, isLoading } = useQuery({
    queryKey: ['theme', businessId],
    queryFn: async () => {
      if (!businessId) return null;
      
      const result = await apiRequest(`/api/business/${businessId}/theme`, {
        method: 'GET'
      });
      
      return result as Theme;
    },
    enabled: !!businessId,
  });
  
  // Update currentTheme when we get data from the API
  useEffect(() => {
    if (themeData) {
      setCurrentTheme(themeData);
    } else if (businessId && !isLoading) {
      // If no theme is found, use default theme
      setCurrentTheme({
        ...defaultTheme,
        businessId,
        name: `${user?.businessName || 'Business'} Theme`,
      });
    }
  }, [themeData, businessId, isLoading, user?.businessName]);
  
  // Mutation to save theme changes
  const saveMutation = useMutation({
    mutationFn: async (theme: Theme) => {
      if (!businessId) return null;
      
      return apiRequest(`/api/business/theme`, {
        method: 'POST', 
        body: JSON.stringify(theme)
      });
    },
    onSuccess: () => {
      // Invalidate the theme cache to fetch fresh data
      queryClient.invalidateQueries({ queryKey: ['theme', businessId] });
      
      toast({
        title: 'Theme saved successfully',
        description: 'Your theme changes have been applied to your business portal.',
        variant: 'default',
      });
    },
    onError: (error) => {
      console.error('Error saving theme:', error);
      
      toast({
        title: 'Failed to save theme',
        description: 'There was an error saving your theme. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Handle save theme
  const handleSaveTheme = async (theme: Theme) => {
    if (!businessId) return;
    
    try {
      const themeToSave = {
        ...theme,
        businessId,
      };
      
      await saveMutation.mutateAsync(themeToSave);
    } catch (error) {
      console.error('Error in handleSaveTheme:', error);
    }
  };
  
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <PageHeader className="pb-8">
        <PageHeaderHeading>Theme Customization</PageHeaderHeading>
        <PageHeaderDescription>
          Customize your business portal's appearance with colors, fonts, and styles.
        </PageHeaderDescription>
      </PageHeader>
      
      {currentTheme ? (
        <ThemeProvider initialTheme={currentTheme}>
          <BusinessThemeEditor 
            businessId={businessId}
            initialTheme={currentTheme}
            onSave={handleSaveTheme}
          />
        </ThemeProvider>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium">Loading theme editor...</h3>
            <p className="text-muted-foreground">Please wait while we fetch your theme settings.</p>
          </div>
        </div>
      )}
    </div>
  );
}