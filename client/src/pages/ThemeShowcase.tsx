/**
 * ThemeShowcase Page - 2025 Edition
 *
 * A comprehensive showcase of the new theme system with examples
 * of all theme features and components.
 */

import React from 'react';
import { useGlobalTheme } from '@/hooks/useGlobalTheme';
import { ThemeDemo } from '@/components/theme-aware/ThemeDemo';
import { ThemeTokenPreview } from '@/components/theme-aware/ThemeTokenPreview';
import { ComponentVariantsDemo } from '@/components/theme-aware/ComponentVariantsDemo';
import { ColorModeToggle } from '@/components/theme-aware/ColorModeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

// Define simple page header components locally
const PageHeader = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <section className={`grid gap-1 ${className}`} {...props}>{children}</section>
);

const PageHeaderHeading = ({ className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1 className={`text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl ${className}`} {...props} />
);

const PageHeaderDescription = ({ className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-muted-foreground md:text-lg ${className}`} {...props} />
);

export function ThemeShowcase() {
  return (
    <div className="container py-8 space-y-8">
      <PageHeader className="pb-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <PageHeaderHeading>Theme System Showcase</PageHeaderHeading>
          <ColorModeToggle variant="dropdown" size="md" />
        </div>
        <PageHeaderDescription>
          Explore the 2025 Edition theme system with its powerful design tokens,
          component theming, and dynamic color modes.
        </PageHeaderDescription>
      </PageHeader>
      
      <Tabs defaultValue="demo" className="w-full">
        <TabsList className="w-full sm:w-auto mb-4">
          <TabsTrigger value="demo">Theme Demo</TabsTrigger>
          <TabsTrigger value="tokens">Token Preview</TabsTrigger>
          <TabsTrigger value="variants">Component Variants</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="demo" className="mt-6 space-y-6">
          <ThemeDemo />
        </TabsContent>
        
        <TabsContent value="tokens" className="mt-6 space-y-6">
          <ThemeTokenPreview />
        </TabsContent>
        
        <TabsContent value="variants" className="mt-6 space-y-6">
          <ComponentVariantsDemo />
        </TabsContent>
        
        <TabsContent value="docs" className="mt-6 space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Theme System Documentation</h2>
            
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <h3>Core Concepts</h3>
              <p>
                The 2025 Edition theme system is built on several key foundations:
              </p>
              
              <ul>
                <li>
                  <strong>Design Tokens</strong>: A comprehensive token system for colors, typography, spacing, and more
                </li>
                <li>
                  <strong>Multi-tenant Architecture</strong>: Support for multiple businesses with isolated theme contexts
                </li>
                <li>
                  <strong>Dark Mode</strong>: First-class support for light, dark, and system color modes
                </li>
                <li>
                  <strong>Accessibility</strong>: Built-in tools for ensuring color contrast and readability
                </li>
              </ul>
              
              <h3>Using Theme Hooks</h3>
              <p>
                The theme system provides several hooks for consuming theme values:
              </p>
              
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
{`// Global theme hooks
import { useGlobalTheme, useDarkMode } from '@/hooks/useGlobalTheme';

// For business-specific theming
import { useBusinessTheme } from '@/providers/MultiTenantThemeProvider';

// For convenient CSS variable access
import useThemeVars from '@/hooks/useThemeVars';

function MyComponent() {
  // Access dark mode controls
  const { darkMode, toggleDarkMode } = useDarkMode();
  
  // Get theme CSS variables
  const { getCssVar } = useThemeVars();
  
  return (
    <div style={{ 
      backgroundColor: getCssVar('colors.background.base'),
      color: getCssVar('colors.background.foreground')
    }}>
      <button onClick={toggleDarkMode}>
        Toggle {darkMode ? 'Light' : 'Dark'} Mode
      </button>
    </div>
  );
}`}
              </pre>
              
              <h3>Theme Providers</h3>
              <p>
                The theme system uses a hierarchy of providers:
              </p>
              
              <ol>
                <li>
                  <strong>GlobalThemeProvider</strong>: Manages application-wide theme settings like dark mode and border radius
                </li>
                <li>
                  <strong>MultiTenantThemeProvider</strong>: Handles business-specific themes with proper CSS isolation
                </li>
                <li>
                  <strong>ThemeProvider</strong>: The main entry point that combines both providers
                </li>
              </ol>
              
              <h3>Creating Theme-Aware Components</h3>
              <p>
                Components can consume theme values through hooks and CSS variables:
              </p>
              
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
{`import { cssVar } from '@/lib/themeUtils';
import useThemeVars from '@/hooks/useThemeVars';

function ThemedButton({ children }) {
  const { getCssVar } = useThemeVars();
  
  return (
    <button
      style={{
        backgroundColor: getCssVar('colors.primary.base'),
        color: getCssVar('colors.primary.foreground'),
        borderRadius: \`var(--radius)\`
      }}
    >
      {children}
    </button>
  );
}`}
              </pre>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}