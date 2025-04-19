/**
 * ThemeDemo Component - 2025 Edition
 *
 * This component showcases the new theme system with interactive examples
 * of token usage, color mode toggling, and responsive design.
 */

import React from 'react';
import { useGlobalTheme, useDarkMode, useAppearance, useBorderRadius } from '@/hooks/useGlobalTheme';
import useThemeVars from '@/hooks/useThemeVars';
import { ColorModeToggle } from './ColorModeToggle';
import { ThemeAwareButton } from './ThemeAwareButton';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useBusinessTheme } from '@/providers/MultiTenantThemeProvider';
import { cssVar } from '@/lib/themeUtils';

const TokenDisplay = ({ tokenPath, label }: { tokenPath: string; label: string }) => {
  const { getCssVarValue } = useThemeVars();
  const value = getCssVarValue(tokenPath);
  
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm font-mono">{label}</span>
      <div className="flex items-center gap-2">
        {tokenPath.includes('color') && (
          <div 
            className="w-4 h-4 rounded-full border" 
            style={{ backgroundColor: value }}
          />
        )}
        <code className="text-xs bg-secondary/10 px-2 py-1 rounded">
          {value || '(not set)'}
        </code>
      </div>
    </div>
  );
};

export function ThemeDemo() {
  const { appearance, setAppearance } = useAppearance();
  const { radius, setRadius } = useBorderRadius();
  // Handle the case where activeTheme might be null
  const { themeClasses, activeTheme = null } = useBusinessTheme();
  const { getCssVar } = useThemeVars();
  
  return (
    <div className="space-y-8 p-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Color mode control */}
        <Card>
          <CardHeader>
            <CardTitle>Color Mode</CardTitle>
            <CardDescription>
              Toggle between light, dark, and system color modes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm mb-2">Current appearance: <strong>{appearance}</strong></p>
                <ColorModeToggle variant="buttons" />
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm mb-2">Try different variants:</p>
                <div className="flex gap-2 flex-wrap">
                  <ColorModeToggle variant="icon" size="sm" />
                  <ColorModeToggle variant="icon" size="md" />
                  <ColorModeToggle variant="icon" size="lg" />
                  <ColorModeToggle variant="dropdown" size="md" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Border radius control */}
        <Card>
          <CardHeader>
            <CardTitle>Border Radius</CardTitle>
            <CardDescription>
              Adjust the global border radius
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm mb-2">Current radius: <strong>{radius}px</strong></p>
              <Slider
                value={[radius]}
                min={0}
                max={24}
                step={1}
                onValueChange={(values) => setRadius(values[0])}
                className="my-4"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-primary h-16 rounded-sm flex items-center justify-center text-primary-foreground">
                Small
              </div>
              <div className="bg-primary h-16 rounded-md flex items-center justify-center text-primary-foreground">
                Medium
              </div>
              <div className="bg-primary h-16 rounded-lg flex items-center justify-center text-primary-foreground">
                Large
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Theme tokens display */}
      <Card>
        <CardHeader>
          <CardTitle>Current Theme Tokens</CardTitle>
          <CardDescription>
            View the available design tokens in this theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Primary colors */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Primary Colors</h3>
              <div className="space-y-1">
                <TokenDisplay tokenPath="colors.primary.base" label="Primary Base" />
                <TokenDisplay tokenPath="colors.primary.foreground" label="Primary Foreground" />
                <TokenDisplay tokenPath="colors.primary.hover" label="Primary Hover" />
                <TokenDisplay tokenPath="colors.primary.active" label="Primary Active" />
                <TokenDisplay tokenPath="colors.primary.focus" label="Primary Focus" />
                <TokenDisplay tokenPath="colors.primary.subtle" label="Primary Subtle" />
              </div>
            </div>
            
            {/* Secondary colors */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Secondary Colors</h3>
              <div className="space-y-1">
                <TokenDisplay tokenPath="colors.secondary.base" label="Secondary Base" />
                <TokenDisplay tokenPath="colors.secondary.foreground" label="Secondary Foreground" />
                <TokenDisplay tokenPath="colors.secondary.hover" label="Secondary Hover" />
                <TokenDisplay tokenPath="colors.secondary.active" label="Secondary Active" />
                <TokenDisplay tokenPath="colors.secondary.focus" label="Secondary Focus" />
                <TokenDisplay tokenPath="colors.secondary.subtle" label="Secondary Subtle" />
              </div>
            </div>
            
            {/* Background colors */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Background Colors</h3>
              <div className="space-y-1">
                <TokenDisplay tokenPath="colors.background.base" label="Background Base" />
                <TokenDisplay tokenPath="colors.background.foreground" label="Background Foreground" />
                <TokenDisplay tokenPath="colors.background.subtle" label="Background Subtle" />
                <TokenDisplay tokenPath="colors.background.muted" label="Background Muted" />
                <TokenDisplay tokenPath="colors.background.elevated" label="Background Elevated" />
              </div>
            </div>
            
            {/* Typography tokens */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Typography</h3>
              <div className="space-y-1">
                <TokenDisplay tokenPath="typography.fontFamily.base" label="Base Font" />
                <TokenDisplay tokenPath="typography.fontSize.base" label="Base Font Size" />
                <TokenDisplay tokenPath="typography.lineHeight.normal" label="Line Height" />
                <TokenDisplay tokenPath="typography.fontWeight.medium" label="Medium Weight" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Theme-aware components */}
      <Card>
        <CardHeader>
          <CardTitle>Theme-Aware Components</CardTitle>
          <CardDescription>
            Components that adapt to the current theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <ThemeAwareButton variant="primary">Primary Button</ThemeAwareButton>
                <ThemeAwareButton variant="secondary">Secondary Button</ThemeAwareButton>
                <ThemeAwareButton variant="outline">Outline Button</ThemeAwareButton>
                <ThemeAwareButton variant="ghost">Ghost Button</ThemeAwareButton>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Current Theme Rendering</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm">Active Theme: <strong>{activeTheme?.name || 'Default'}</strong></p>
                  <p className="text-sm">Theme Class: <code>{themeClasses}</code></p>
                </div>
                
                <div>
                  <div 
                    className="w-full h-20 rounded-md flex items-center justify-center text-white"
                    style={{ 
                      background: `linear-gradient(to right, ${cssVar('colors.primary.base')}, ${cssVar('colors.secondary.base')})` 
                    }}
                  >
                    <span className="font-semibold">Theme Gradient</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            This card demonstrates components that automatically adapt to the current theme settings.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}