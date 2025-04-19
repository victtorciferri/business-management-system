/**
 * ThemeTokenPreview Component - 2025 Edition
 *
 * A comprehensive preview of all available theme tokens
 */

import React from "react";
import useThemeVars from '@/hooks/useThemeVars';
import { useBusinessTheme } from '@/providers/MultiTenantThemeProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Token display component
type TokenDisplayProps = {
  tokenPath: string;
  label: string;
  showValue?: boolean;
}

const TokenDisplay = ({ tokenPath, label, showValue = true }: TokenDisplayProps) => {
  const { getCssVar, getCssVarValue } = useThemeVars();
  const value = getCssVarValue(tokenPath);
  
  const isColor = tokenPath.startsWith('colors.');
  
  return (
    <div className="flex items-center gap-2 py-1">
      {isColor && (
        <div 
          className="w-6 h-6 rounded border border-border flex-shrink-0"
          style={{ backgroundColor: getCssVar(tokenPath) }}
        />
      )}
      <div className="flex-grow">
        <div className="text-sm font-medium">{label}</div>
        {showValue && (
          <div className="text-xs text-muted-foreground font-mono">
            {isColor ? value : getCssVar(tokenPath)}
          </div>
        )}
      </div>
    </div>
  );
};

// Font family preview 
const FontFamilyPreview = ({ fontFamily, name }: { fontFamily: string, name: string }) => {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-1">{name}</h4>
      <p style={{ fontFamily }} className="text-muted-foreground">
        The quick brown fox jumps over the lazy dog
      </p>
    </div>
  );
};

// Font size preview
const FontSizePreview = ({ fontSize, name }: { fontSize: string, name: string }) => {
  return (
    <div className="mb-2">
      <span className="text-xs text-muted-foreground inline-block w-24">{name}</span>
      <span style={{ fontSize }} className="font-medium">
        The quick brown fox
      </span>
    </div>
  );
};

// Spacing preview
const SpacingPreview = ({ spacing, name }: { spacing: string, name: string }) => {
  return (
    <div className="mb-2 flex items-center">
      <span className="text-xs text-muted-foreground inline-block w-24">{name}</span>
      <div 
        className="bg-primary/20 rounded"
        style={{ width: spacing, height: '20px' }}
      />
    </div>
  );
};

// Main component
export function ThemeTokenPreview() {
  const { themeClasses } = useBusinessTheme();
  const { getCssVar, getCssVarValue } = useThemeVars();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Design Tokens Preview</CardTitle>
          <CardDescription>
            Explore the complete set of design tokens available in the theme system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="w-full md:w-auto mb-6 grid grid-cols-4 md:inline-flex">
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="spacing">Spacing</TabsTrigger>
              <TabsTrigger value="radii">Border Radius</TabsTrigger>
            </TabsList>
            
            {/* Colors tab */}
            <TabsContent value="colors" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Primary */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Primary</h3>
                  <TokenDisplay tokenPath="colors.primary.base" label="Base" />
                  <TokenDisplay tokenPath="colors.primary.foreground" label="Foreground" />
                  <TokenDisplay tokenPath="colors.primary.hover" label="Hover" />
                  <TokenDisplay tokenPath="colors.primary.active" label="Active" />
                  <TokenDisplay tokenPath="colors.primary.focus" label="Focus" />
                  <TokenDisplay tokenPath="colors.primary.subtle" label="Subtle" />
                </div>
                
                {/* Secondary */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Secondary</h3>
                  <TokenDisplay tokenPath="colors.secondary.base" label="Base" />
                  <TokenDisplay tokenPath="colors.secondary.foreground" label="Foreground" />
                  <TokenDisplay tokenPath="colors.secondary.hover" label="Hover" />
                  <TokenDisplay tokenPath="colors.secondary.active" label="Active" />
                  <TokenDisplay tokenPath="colors.secondary.focus" label="Focus" />
                  <TokenDisplay tokenPath="colors.secondary.subtle" label="Subtle" />
                </div>
                
                {/* Background */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Background</h3>
                  <TokenDisplay tokenPath="colors.background.base" label="Base" />
                  <TokenDisplay tokenPath="colors.background.foreground" label="Foreground" />
                  <TokenDisplay tokenPath="colors.background.subtle" label="Subtle" />
                  <TokenDisplay tokenPath="colors.background.muted" label="Muted" />
                  <TokenDisplay tokenPath="colors.background.elevated" label="Elevated" />
                </div>
                
                {/* Accent */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Accent</h3>
                  <TokenDisplay tokenPath="colors.accent.base" label="Base" />
                  <TokenDisplay tokenPath="colors.accent.foreground" label="Foreground" />
                  <TokenDisplay tokenPath="colors.accent.subtle" label="Subtle" />
                </div>
                
                {/* Feedback */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Feedback</h3>
                  <TokenDisplay tokenPath="colors.success.base" label="Success" />
                  <TokenDisplay tokenPath="colors.warning.base" label="Warning" />
                  <TokenDisplay tokenPath="colors.error.base" label="Error" />
                  <TokenDisplay tokenPath="colors.info.base" label="Info" />
                </div>
                
                {/* Borders */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Borders</h3>
                  <TokenDisplay tokenPath="colors.border.base" label="Base" />
                  <TokenDisplay tokenPath="colors.border.subtle" label="Subtle" />
                  <TokenDisplay tokenPath="colors.border.focus" label="Focus" />
                </div>
              </div>
            </TabsContent>
            
            {/* Typography tab */}
            <TabsContent value="typography" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Font families */}
                <div>
                  <h3 className="font-semibold mb-4">Font Families</h3>
                  <FontFamilyPreview 
                    fontFamily={getCssVarValue('typography.fontFamily.base')} 
                    name="Base Font" 
                  />
                  <FontFamilyPreview 
                    fontFamily={getCssVarValue('typography.fontFamily.heading')} 
                    name="Heading Font" 
                  />
                  <FontFamilyPreview 
                    fontFamily={getCssVarValue('typography.fontFamily.mono')} 
                    name="Monospace Font" 
                  />
                </div>
                
                {/* Font sizes */}
                <div>
                  <h3 className="font-semibold mb-4">Font Sizes</h3>
                  <FontSizePreview fontSize={getCssVarValue('typography.fontSize.xs')} name="xs" />
                  <FontSizePreview fontSize={getCssVarValue('typography.fontSize.sm')} name="sm" />
                  <FontSizePreview fontSize={getCssVarValue('typography.fontSize.base')} name="base" />
                  <FontSizePreview fontSize={getCssVarValue('typography.fontSize.lg')} name="lg" />
                  <FontSizePreview fontSize={getCssVarValue('typography.fontSize.xl')} name="xl" />
                  <FontSizePreview fontSize={getCssVarValue('typography.fontSize.2xl')} name="2xl" />
                  <FontSizePreview fontSize={getCssVarValue('typography.fontSize.3xl')} name="3xl" />
                </div>
                
                {/* Font weights */}
                <div>
                  <h3 className="font-semibold mb-4">Font Weights</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-muted-foreground inline-block w-24">Light</span>
                      <span style={{ fontWeight: getCssVarValue('typography.fontWeight.light') }}>
                        The quick brown fox
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground inline-block w-24">Regular</span>
                      <span style={{ fontWeight: getCssVarValue('typography.fontWeight.regular') }}>
                        The quick brown fox
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground inline-block w-24">Medium</span>
                      <span style={{ fontWeight: getCssVarValue('typography.fontWeight.medium') }}>
                        The quick brown fox
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground inline-block w-24">Bold</span>
                      <span style={{ fontWeight: getCssVarValue('typography.fontWeight.bold') }}>
                        The quick brown fox
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Line heights */}
                <div>
                  <h3 className="font-semibold mb-4">Line Heights</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Tight (1.25)</div>
                      <p style={{ lineHeight: getCssVarValue('typography.lineHeight.tight') }} className="border-l-2 border-primary pl-2">
                        This is an example of text with tight line height. It tends to work well for headlines and situations where vertical space is at a premium.
                      </p>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Normal (1.5)</div>
                      <p style={{ lineHeight: getCssVarValue('typography.lineHeight.normal') }} className="border-l-2 border-secondary pl-2">
                        This is an example of text with normal line height. It's generally good for body text where readability is important, balancing space between lines.
                      </p>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Relaxed (1.75)</div>
                      <p style={{ lineHeight: getCssVarValue('typography.lineHeight.relaxed') }} className="border-l-2 border-accent pl-2">
                        This is an example of text with relaxed line height. It provides more breathing room between lines, which can improve readability for longer texts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Spacing tab */}
            <TabsContent value="spacing" className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Spacing Scale</h3>
                <div className="space-y-1">
                  <SpacingPreview spacing={getCssVarValue('spacing.0')} name="spacing.0" />
                  <SpacingPreview spacing={getCssVarValue('spacing.1')} name="spacing.1" />
                  <SpacingPreview spacing={getCssVarValue('spacing.2')} name="spacing.2" />
                  <SpacingPreview spacing={getCssVarValue('spacing.3')} name="spacing.3" />
                  <SpacingPreview spacing={getCssVarValue('spacing.4')} name="spacing.4" />
                  <SpacingPreview spacing={getCssVarValue('spacing.5')} name="spacing.5" />
                  <SpacingPreview spacing={getCssVarValue('spacing.6')} name="spacing.6" />
                  <SpacingPreview spacing={getCssVarValue('spacing.8')} name="spacing.8" />
                  <SpacingPreview spacing={getCssVarValue('spacing.10')} name="spacing.10" />
                  <SpacingPreview spacing={getCssVarValue('spacing.12')} name="spacing.12" />
                  <SpacingPreview spacing={getCssVarValue('spacing.16')} name="spacing.16" />
                  <SpacingPreview spacing={getCssVarValue('spacing.20')} name="spacing.20" />
                  <SpacingPreview spacing={getCssVarValue('spacing.24')} name="spacing.24" />
                </div>
              </div>
            </TabsContent>
            
            {/* Border radius tab */}
            <TabsContent value="radii" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center">
                  <div 
                    className="w-24 h-24 bg-primary/20 mb-2"
                    style={{ borderRadius: getCssVarValue('radii.none') }}
                  />
                  <span className="text-sm">None</span>
                  <span className="text-xs text-muted-foreground">0px</span>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="w-24 h-24 bg-primary/20 mb-2"
                    style={{ borderRadius: getCssVarValue('radii.small') }}
                  />
                  <span className="text-sm">Small</span>
                  <span className="text-xs text-muted-foreground">
                    {getCssVarValue('radii.small')}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="w-24 h-24 bg-primary/20 mb-2"
                    style={{ borderRadius: getCssVarValue('radii.medium') }}
                  />
                  <span className="text-sm">Medium</span>
                  <span className="text-xs text-muted-foreground">
                    {getCssVarValue('radii.medium')}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="w-24 h-24 bg-primary/20 mb-2"
                    style={{ borderRadius: getCssVarValue('radii.large') }}
                  />
                  <span className="text-sm">Large</span>
                  <span className="text-xs text-muted-foreground">
                    {getCssVarValue('radii.large')}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="w-24 h-24 bg-primary/20 mb-2"
                    style={{ borderRadius: getCssVarValue('radii.xl') }}
                  />
                  <span className="text-sm">Extra Large</span>
                  <span className="text-xs text-muted-foreground">
                    {getCssVarValue('radii.xl')}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="w-24 h-24 bg-primary/20 mb-2"
                    style={{ borderRadius: getCssVarValue('radii.full') }}
                  />
                  <span className="text-sm">Full</span>
                  <span className="text-xs text-muted-foreground">
                    {getCssVarValue('radii.full')}
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}