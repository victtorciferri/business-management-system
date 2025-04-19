/**
 * Color Mode Demo Page - 2025 Edition
 * 
 * This page demonstrates the color mode switching capabilities of the 
 * theme system with smooth transitions between light and dark modes.
 */

import React from 'react';
import { useGlobalTheme } from '@/hooks/useGlobalTheme';
import { ColorModeToggle } from '@/components/theme-aware/ColorModeToggle';
import { ThemeAwareButton } from '@/components/theme-aware/ThemeAwareButton';

export default function ColorModeDemo() {
  const { darkMode, appearance } = useGlobalTheme();
  
  return (
    <div className="min-h-screen p-8 bg-background text-background-foreground transition-colors">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Color Mode Switching Demo
          </h1>
          <p className="text-xl text-muted-foreground">
            Demonstrating smooth transitions between light and dark modes
          </p>
        </header>
        
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Color Mode Toggles</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Icon Toggle</h3>
                <ColorModeToggle variant="icon" size="md" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Switch Toggle</h3>
                <ColorModeToggle variant="switch" showLabel={true} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Button Toggle</h3>
                <ColorModeToggle variant="button" />
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Settings</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt>Mode:</dt>
                  <dd className="font-medium">{darkMode ? 'Dark' : 'Light'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Preference:</dt>
                  <dd className="font-medium capitalize">{appearance}</dd>
                </div>
              </dl>
            </div>
          </div>
          
          <div className="md:col-span-2 bg-card p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">UI Components</h2>
            <p className="text-muted-foreground mb-6">
              Components automatically adapt to the current color mode with smooth transitions
            </p>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Buttons</h3>
                <div className="flex flex-wrap gap-3">
                  <ThemeAwareButton>Default</ThemeAwareButton>
                  <ThemeAwareButton variant="primary">Primary</ThemeAwareButton>
                  <ThemeAwareButton variant="secondary">Secondary</ThemeAwareButton>
                  <ThemeAwareButton variant="outline">Outline</ThemeAwareButton>
                  <ThemeAwareButton variant="ghost">Ghost</ThemeAwareButton>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Cards</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-card border rounded-lg">
                    <h4 className="font-medium">Card Title</h4>
                    <p className="text-sm text-muted-foreground">Card with default background</p>
                  </div>
                  <div className="p-4 bg-muted border rounded-lg">
                    <h4 className="font-medium">Muted Card</h4>
                    <p className="text-sm text-muted-foreground">Card with muted background</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Text Elements</h3>
                <div className="space-y-2">
                  <p className="text-lg">Regular paragraph text with <a href="#" className="text-primary hover:underline">primary link</a></p>
                  <p className="text-muted-foreground">Muted text for secondary information</p>
                  <p className="text-sm">Small text for captions or metadata</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Form Elements</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full px-3 py-2 border rounded-md bg-background text-background-foreground"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full px-3 py-2 border rounded-md bg-background text-background-foreground"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="bg-card p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="prose dark:prose-invert max-w-none">
            <p>
              Our color mode switching implementation uses a combination of technologies to provide 
              a seamless experience:
            </p>
            <ul>
              <li>
                <strong>CSS Variables</strong> - All theme colors are defined as CSS custom properties,
                making it easy to update them dynamically.
              </li>
              <li>
                <strong>Tailwind CSS</strong> - The dark mode variant (<code>dark:</code>) is used to 
                define different styles for dark mode.
              </li>
              <li>
                <strong>CSS Transitions</strong> - Smooth transitions are applied to color changes using
                CSS transition properties.
              </li>
              <li>
                <strong>localStorage Persistence</strong> - User preferences are stored in localStorage 
                so they're remembered between visits.
              </li>
              <li>
                <strong>System Preference Detection</strong> - The <code>prefers-color-scheme</code> media 
                query is used to detect the user's system preference.
              </li>
            </ul>
            <p>
              The color mode switching UI allows users to toggle between light and dark modes manually
              or follow their system preference automatically.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}