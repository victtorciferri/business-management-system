/**
 * Theme Selector Demo - 2025 Edition
 * 
 * This page demonstrates the multi-tenant theming system capability 
 * by showing different themes and how components adapt to them.
 */

import React, { useState, useEffect } from 'react';
import { ThemeEntity } from '@shared/schema';
import { ThemeSelector } from '@/components/theme-editor/ThemeSelector';
import { ThemeAwareButton } from '@/components/theme-aware/ThemeAwareButton';
import { useBusinessTheme } from '@/providers/MultiTenantThemeProvider';
import { useGlobalTheme } from '@/hooks/useGlobalTheme';

export default function ThemeSelectorDemo() {
  const { darkMode, setDarkMode } = useGlobalTheme();
  const { activeTheme } = useBusinessTheme();
  const [selectedTheme, setSelectedTheme] = useState<ThemeEntity | null>(null);
  
  // Track the selected theme
  useEffect(() => {
    if (activeTheme && !selectedTheme) {
      setSelectedTheme(activeTheme);
    }
  }, [activeTheme, selectedTheme]);
  
  // Handle theme change from the selector
  const handleThemeChange = (theme: ThemeEntity) => {
    setSelectedTheme(theme);
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Theme Selector Demo</h1>
        <p className="text-xl text-muted-foreground">
          This page demonstrates the new multi-tenant theming system
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="sticky top-4 space-y-6">
            <div className="p-4 border rounded-lg bg-card">
              <h2 className="text-xl font-semibold mb-4">Available Themes</h2>
              <ThemeSelector onThemeSelect={handleThemeChange} />
            </div>
            
            <div className="p-4 border rounded-lg bg-card">
              <h2 className="text-xl font-semibold mb-4">Display Settings</h2>
              <div className="flex items-center justify-between">
                <span>Dark Mode</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={darkMode} 
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="p-6 border rounded-lg bg-card space-y-8">
            <h2 className="text-2xl font-bold">Theme Component Showcase</h2>
            
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Theme-Aware Buttons</h3>
              <p className="text-muted-foreground">
                These buttons automatically adapt to the selected theme
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Button Variants</h4>
                  <div className="flex flex-wrap gap-3">
                    <ThemeAwareButton variant="primary">
                      Primary
                    </ThemeAwareButton>
                    <ThemeAwareButton variant="secondary">
                      Secondary
                    </ThemeAwareButton>
                    <ThemeAwareButton variant="outline">
                      Outline
                    </ThemeAwareButton>
                    <ThemeAwareButton variant="ghost">
                      Ghost
                    </ThemeAwareButton>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Button Sizes</h4>
                  <div className="flex items-center flex-wrap gap-3">
                    <ThemeAwareButton size="sm">
                      Small
                    </ThemeAwareButton>
                    <ThemeAwareButton size="md">
                      Medium
                    </ThemeAwareButton>
                    <ThemeAwareButton size="lg">
                      Large
                    </ThemeAwareButton>
                  </div>
                </div>
              </div>
            </section>
            
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Theme Colors</h3>
              <p className="text-muted-foreground">
                The current theme has the following colors
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <ColorSwatch
                  name="Primary"
                  colors={[
                    ['base', 'var(--color-primary-base, #0070f3)'],
                    ['foreground', 'var(--color-primary-foreground, #ffffff)']
                  ]}
                />
                <ColorSwatch
                  name="Secondary"
                  colors={[
                    ['base', 'var(--color-secondary-base, #f1f5f9)'],
                    ['foreground', 'var(--color-secondary-foreground, #0f172a)']
                  ]}
                />
                <ColorSwatch
                  name="Background"
                  colors={[
                    ['base', 'var(--color-background-base, #ffffff)'],
                    ['foreground', 'var(--color-background-foreground, #09090b)']
                  ]}
                />
                <ColorSwatch
                  name="Accent"
                  colors={[
                    ['base', 'var(--color-accent-base, #f1f5f9)'],
                    ['foreground', 'var(--color-accent-foreground, #0f172a)']
                  ]}
                />
              </div>
            </section>
            
            <section className="space-y-4">
              <h3 className="text-xl font-semibold">Theme Details</h3>
              <p className="text-muted-foreground">
                Current active theme information
              </p>
              
              {selectedTheme ? (
                <div className="p-4 border rounded-lg bg-card/50">
                  <dl className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
                    <dt className="font-medium">Name:</dt>
                    <dd>{selectedTheme.name}</dd>
                    
                    <dt className="font-medium">Description:</dt>
                    <dd>{selectedTheme.description || 'No description'}</dd>
                    
                    <dt className="font-medium">Business:</dt>
                    <dd>{selectedTheme.businessSlug}</dd>
                    
                    <dt className="font-medium">Created:</dt>
                    <dd>{new Date(selectedTheme.createdAt).toLocaleDateString()}</dd>
                    
                    <dt className="font-medium">Last Updated:</dt>
                    <dd>{new Date(selectedTheme.updatedAt).toLocaleDateString()}</dd>
                  </dl>
                </div>
              ) : (
                <div className="p-4 border rounded-lg bg-card/50 text-center">
                  No theme selected
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple component to display color swatches
interface ColorSwatchProps {
  name: string;
  colors: [string, string][];
}

function ColorSwatch({ name, colors }: ColorSwatchProps) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium">{name}</h4>
      <div className="space-y-2">
        {colors.map(([colorName, colorValue]) => (
          <div key={colorName} className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: colorValue }}
            />
            <span className="text-sm">{colorName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}