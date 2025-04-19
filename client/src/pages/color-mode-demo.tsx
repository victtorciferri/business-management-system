/**
 * Color Mode Demo Page - 2025 Edition
 * 
 * This page showcases the new color mode switching functionality with animated transitions.
 */

import React from 'react';
import { useGlobalTheme } from '@/hooks/useGlobalTheme';
import ColorModeToggle from '@/components/theme-aware/ColorModeToggle';

const ColorModeDemo = () => {
  const { darkMode, appearance, systemPreference } = useGlobalTheme();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 transition-colors">
      <div className="max-w-3xl w-full bg-card-base text-card-foreground rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Color Mode System (2025)</h1>
        
        <div className="mb-8 text-center">
          <p className="text-lg mb-2">Current theme: <span className="font-semibold">{darkMode ? 'Dark' : 'Light'}</span></p>
          <p className="text-muted-foreground">Preference: <span className="font-medium">{appearance}</span></p>
          {appearance === 'system' && (
            <p className="text-sm text-muted-foreground">System preference: {systemPreference || 'not detected'}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-background-base p-6 rounded-lg border border-border">
            <h2 className="font-semibold mb-4">Toggle Variants</h2>
            <div className="flex flex-wrap gap-4">
              <ColorModeToggle variant="icon" />
              <ColorModeToggle variant="pill" withText />
              <ColorModeToggle variant="button" withText />
            </div>
          </div>
          
          <div className="bg-background-base p-6 rounded-lg border border-border">
            <h2 className="font-semibold mb-4">Size Variants</h2>
            <div className="flex items-center gap-4">
              <ColorModeToggle size="sm" variant="icon" />
              <ColorModeToggle size="md" variant="icon" />
              <ColorModeToggle size="lg" variant="icon" />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Mode-Aware Components</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-primary-base text-primary-foreground rounded-md">
              Primary Component
            </div>
            <div className="p-4 bg-secondary-base text-secondary-foreground rounded-md">
              Secondary Component
            </div>
            <div className="p-4 bg-accent-base text-accent-foreground rounded-md">
              Accent Component
            </div>
            <div className="p-4 bg-muted-base text-muted-foreground rounded-md">
              Muted Component
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-destructive-base text-destructive-foreground rounded-md">
            Destructive Component
          </div>
          
          <div className="mt-6 text-sm text-muted-foreground">
            <p>This page demonstrates the smooth transition between light and dark modes.</p>
            <p>The transitions are applied to colors while preserving layout stability.</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <a href="/" className="text-primary-base hover:underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default ColorModeDemo;