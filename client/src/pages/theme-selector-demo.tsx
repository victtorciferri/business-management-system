/**
 * Theme Selector Demo Page - 2025 Edition
 * 
 * A simple demonstration page that shows the theme selector component in action.
 * It allows users to switch between different themes for a business.
 */

import React, { useState } from "react";
import { ThemeSelector } from "@/components/theme-editor/ThemeSelector";
import { ThemeAwareButton } from "@/components/theme-aware/ThemeAwareButton";
import { ThemeEntity } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function ThemeSelectorDemo() {
  const { user } = useAuth();
  const [selectedTheme, setSelectedTheme] = useState<ThemeEntity | null>(null);
  
  const handleThemeChange = (theme: ThemeEntity) => {
    setSelectedTheme(theme);
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Theme Selector Demo</h1>
        <p className="text-muted-foreground">
          This page demonstrates the new theme system for 2025. Select a theme to see it applied in real-time.
        </p>
      </div>
      
      {user ? (
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Available Themes</h2>
            <ThemeSelector 
              businessId={user.id} 
              onThemeChange={handleThemeChange}
            />
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Theme Preview</h2>
            
            {selectedTheme ? (
              <div>
                <p className="mb-4">
                  <strong>Active Theme:</strong> {selectedTheme.name}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Theme-Aware Components</h3>
                    <div className="flex flex-wrap gap-2">
                      <ThemeAwareButton variant="primary">Primary</ThemeAwareButton>
                      <ThemeAwareButton variant="secondary">Secondary</ThemeAwareButton>
                      <ThemeAwareButton variant="outline">Outline</ThemeAwareButton>
                      <ThemeAwareButton variant="ghost">Ghost</ThemeAwareButton>
                      <ThemeAwareButton variant="destructive">Destructive</ThemeAwareButton>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Theme Information</h3>
                    <div className="text-sm">
                      <p><strong>ID:</strong> {selectedTheme.id}</p>
                      <p><strong>Description:</strong> {selectedTheme.description || 'No description'}</p>
                      <p><strong>Default:</strong> {selectedTheme.isDefault ? 'Yes' : 'No'}</p>
                      <p><strong>Last Updated:</strong> {new Date(selectedTheme.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Color Palette</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedTheme.tokens?.colors && Object.entries(selectedTheme.tokens.colors).map(([key, value]) => {
                      const color = typeof value === 'string' ? value : value?.base;
                      if (!color) return null;
                      
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded-md" 
                            style={{ backgroundColor: color }}
                          />
                          <div>
                            <p className="text-sm font-medium">{key}</p>
                            <p className="text-xs text-muted-foreground">{color}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Select a theme to see the preview</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-card p-6 rounded-lg shadow-sm text-center">
          <p className="text-muted-foreground">Please log in to access theme settings</p>
        </div>
      )}
    </div>
  );
}