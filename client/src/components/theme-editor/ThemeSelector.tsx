/**
 * Theme Selector - 2025 Edition
 * 
 * A component for selecting and switching between available themes for a business.
 * It displays a list of available themes, highlights the active theme, and allows
 * the user to activate a different theme.
 */

import React from "react";
import { useBusinessTheme } from "@/providers/MultiTenantThemeProvider";
import { activateTheme } from "@/lib/themeApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ThemeEntity } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface ThemeSelectorProps {
  businessId?: number;
  onThemeChange?: (theme: ThemeEntity) => void;
}

export function ThemeSelector({ businessId, onThemeChange }: ThemeSelectorProps) {
  const { themes, activeTheme, isLoading } = useBusinessTheme();
  const queryClient = useQueryClient();
  
  // Mutation to activate a theme
  const activateThemeMutation = useMutation({
    mutationFn: async (themeId: number) => {
      return activateTheme(themeId, businessId);
    },
    onSuccess: (data) => {
      // Update the query cache
      const businessQueryKey = businessId 
        ? ['/api/themes/active', businessId]
        : ['/api/themes/active'];
      
      queryClient.setQueryData(businessQueryKey, data);
      queryClient.invalidateQueries({ queryKey: businessQueryKey });
      
      toast({
        title: "Theme activated",
        description: `${data.name} is now active.`,
      });
      
      if (onThemeChange) {
        onThemeChange(data);
      }
    },
    onError: (error) => {
      console.error("Error activating theme:", error);
      toast({
        title: "Error",
        description: "Failed to activate theme. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle theme selection
  const handleSelectTheme = (themeId: number) => {
    if (themeId === activeTheme?.id) return;
    activateThemeMutation.mutate(themeId);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!themes || themes.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>No Themes Available</CardTitle>
          <CardDescription>
            There are no themes available for this business. Create a new theme to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {themes.map((theme) => {
        const isActive = theme.id === activeTheme?.id;
        
        return (
          <Card 
            key={theme.id}
            className={`group transition-all hover:shadow-md cursor-pointer ${isActive ? 'ring-2 ring-primary' : ''}`}
            onClick={() => handleSelectTheme(theme.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{theme.name}</CardTitle>
                {isActive && <Badge variant="default">Active</Badge>}
                {theme.isDefault && <Badge variant="outline">Default</Badge>}
              </div>
              {theme.description && (
                <CardDescription className="text-sm">
                  {theme.description}
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent>
              {/* Theme preview */}
              <div 
                className="w-full h-20 rounded-md mb-2"
                style={{
                  background: theme.tokens?.colors?.primary?.base || 
                    (typeof theme.tokens?.colors?.primary === 'string' ? theme.tokens.colors.primary : '#cccccc'),
                }}
              />
              
              <div className="flex gap-2 flex-wrap">
                {theme.tokens?.colors && 
                  Object.entries(theme.tokens.colors)
                    .filter(([key]) => ['primary', 'secondary', 'accent'].includes(key))
                    .map(([key, value]) => {
                      const color = typeof value === 'string' ? value : value?.base;
                      if (!color) return null;
                      
                      return (
                        <div 
                          key={key}
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: color }}
                          title={`${key}: ${color}`}
                        />
                      );
                    })
                }
              </div>
            </CardContent>
            
            <CardFooter>
              <div className="w-full flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Last updated: {theme.updatedAt ? new Date(theme.updatedAt).toLocaleDateString() : 'Unknown'}
                </div>
                <Button 
                  variant={isActive ? "outline" : "default"}
                  size="sm"
                  disabled={isActive || activateThemeMutation.isPending}
                >
                  {isActive ? 'Current' : 'Activate'}
                </Button>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}