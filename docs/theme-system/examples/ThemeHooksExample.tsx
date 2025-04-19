import React, { useState } from 'react';
import { useBusinessTheme } from '@/hooks/useBusinessTheme';
import { useColorMode } from '@/hooks/useColorMode';
import { useThemeVar } from '@/hooks/useThemeVar';
import { useGlobalTheme } from '@/hooks/useGlobalTheme';
import { cn } from '@/lib/utils';

/**
 * Example component demonstrating various theme hooks
 */
export function ThemeHooksExample() {
  return (
    <div className="space-y-12">
      <BusinessThemeExample />
      <ColorModeExample />
      <ThemeVarExample />
      <GlobalThemeExample />
    </div>
  );
}

/**
 * Example for useBusinessTheme hook
 */
function BusinessThemeExample() {
  const { theme, businessId, businessSlug, isLoading, error } = useBusinessTheme();
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-64 bg-muted mb-4 rounded"></div>
        <div className="h-32 bg-muted rounded"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 border border-destructive bg-destructive/10 text-destructive rounded-md">
        <h3 className="font-semibold mb-2">Error loading theme</h3>
        <p>{error.message}</p>
      </div>
    );
  }
  
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">useBusinessTheme Hook</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Business Context</h3>
          <div className="space-y-1">
            <p><span className="font-medium">Business ID:</span> {businessId || 'Not in business context'}</p>
            <p><span className="font-medium">Business Slug:</span> {businessSlug || 'Not in business context'}</p>
          </div>
          
          <h3 className="text-lg font-semibold mt-4 mb-2">Theme Metadata</h3>
          <div className="space-y-1">
            <p><span className="font-medium">Theme ID:</span> {theme?.metadata?.id || 'N/A'}</p>
            <p><span className="font-medium">Theme Name:</span> {theme?.metadata?.name || 'Default Theme'}</p>
            <p><span className="font-medium">Primary Color:</span> {theme?.metadata?.primaryColor || 'N/A'}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Color Samples</h3>
          
          <div className="space-y-2">
            <ColorSample 
              name="Primary" 
              color={theme?.tokens?.colors?.primary?.DEFAULT} 
              textColor={theme?.tokens?.colors?.primary?.foreground}
            />
            <ColorSample 
              name="Secondary" 
              color={theme?.tokens?.colors?.secondary?.DEFAULT} 
              textColor={theme?.tokens?.colors?.secondary?.foreground}
            />
            <ColorSample 
              name="Background" 
              color={theme?.tokens?.colors?.background?.DEFAULT} 
              textColor={theme?.tokens?.colors?.foreground?.DEFAULT}
            />
            <ColorSample 
              name="Surface" 
              color={theme?.tokens?.colors?.background?.surface} 
              textColor={theme?.tokens?.colors?.foreground?.DEFAULT}
            />
            <ColorSample 
              name="Destructive" 
              color={theme?.tokens?.colors?.destructive?.DEFAULT} 
              textColor={theme?.tokens?.colors?.destructive?.foreground}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Example for useColorMode hook
 */
function ColorModeExample() {
  const { colorMode, preferredMode, setColorMode, toggleColorMode } = useColorMode();
  
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">useColorMode Hook</h2>
      
      <div className="space-y-4">
        <div>
          <p><span className="font-medium">Current Color Mode:</span> {colorMode}</p>
          <p><span className="font-medium">Preferred Mode Setting:</span> {preferredMode}</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setColorMode('light')}
            className={cn(
              "px-4 py-2 rounded-md border",
              preferredMode === 'light' 
                ? "bg-primary text-primary-foreground" 
                : "bg-card"
            )}
          >
            Light Mode
          </button>
          
          <button
            onClick={() => setColorMode('dark')}
            className={cn(
              "px-4 py-2 rounded-md border",
              preferredMode === 'dark' 
                ? "bg-primary text-primary-foreground" 
                : "bg-card"
            )}
          >
            Dark Mode
          </button>
          
          <button
            onClick={() => setColorMode('system')}
            className={cn(
              "px-4 py-2 rounded-md border",
              preferredMode === 'system' 
                ? "bg-primary text-primary-foreground" 
                : "bg-card"
            )}
          >
            System Preference
          </button>
          
          <button
            onClick={toggleColorMode}
            className="px-4 py-2 rounded-md border bg-secondary text-secondary-foreground"
          >
            Toggle Mode
          </button>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-4 bg-card border rounded-md">
            <h3 className="font-medium mb-2">Card in Current Mode</h3>
            <p className="text-sm">This card uses the current color mode.</p>
          </div>
          
          <div className={cn(
            "p-4 border rounded-md",
            colorMode === 'dark' ? "bg-white text-black" : "bg-gray-900 text-white"
          )}>
            <h3 className="font-medium mb-2">Forced Opposite Mode</h3>
            <p className="text-sm">This card uses the opposite color mode.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Example for useThemeVar hook
 */
function ThemeVarExample() {
  // Access specific theme tokens directly
  const primaryColor = useThemeVar('colors.primary.DEFAULT');
  const secondaryColor = useThemeVar('colors.secondary.DEFAULT');
  const headingFont = useThemeVar('typography.fontFamily.heading');
  const bodyFont = useThemeVar('typography.fontFamily.body');
  const borderRadius = useThemeVar('borders.radius.DEFAULT');
  const spacing = useThemeVar('spacing.DEFAULT');
  
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">useThemeVar Hook</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Theme Token Values</h3>
          
          <div className="space-y-2">
            <p><span className="font-medium">Primary Color:</span> {primaryColor}</p>
            <p><span className="font-medium">Secondary Color:</span> {secondaryColor}</p>
            <p><span className="font-medium">Heading Font:</span> {headingFont}</p>
            <p><span className="font-medium">Body Font:</span> {bodyFont}</p>
            <p><span className="font-medium">Border Radius:</span> {borderRadius}</p>
            <p><span className="font-medium">Spacing:</span> {spacing}</p>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Applied Tokens</h3>
          
          <div className="space-y-4">
            <div 
              style={{ 
                backgroundColor: primaryColor,
                padding: spacing,
                borderRadius: borderRadius,
                fontFamily: headingFont
              }}
              className="text-white p-4"
            >
              Element styled with primary color and heading font
            </div>
            
            <div 
              style={{ 
                backgroundColor: secondaryColor,
                padding: spacing,
                borderRadius: borderRadius,
                fontFamily: bodyFont
              }}
              className="text-white p-4"
            >
              Element styled with secondary color and body font
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Example for useGlobalTheme hook
 */
function GlobalThemeExample() {
  const { settings, setSettings } = useGlobalTheme();
  const [fontSize, setFontSize] = useState(settings.fontSize);
  const [animations, setAnimations] = useState(settings.animations);
  const [contrast, setContrast] = useState(settings.contrast);
  
  const handleApplySettings = () => {
    setSettings({
      ...settings,
      fontSize,
      animations,
      contrast
    });
  };
  
  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">useGlobalTheme Hook</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Current Settings</h3>
          
          <div className="space-y-1">
            <p><span className="font-medium">Color Mode:</span> {settings.mode}</p>
            <p><span className="font-medium">Theme Variant:</span> {settings.variant}</p>
            <p><span className="font-medium">Font Size Scale:</span> {settings.fontSize}x</p>
            <p><span className="font-medium">Animation Level:</span> {settings.animations}</p>
            <p><span className="font-medium">Contrast Level:</span> {settings.contrast}</p>
            <p><span className="font-medium">Reduced Transparency:</span> {settings.reducedTransparency ? 'Yes' : 'No'}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Adjust Settings</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Font Size Scale</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.05"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="text-sm w-10">{fontSize}x</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Animations</label>
              <select
                value={animations}
                onChange={(e) => setAnimations(e.target.value as any)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="full">Full</option>
                <option value="reduced">Reduced</option>
                <option value="none">None</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Contrast</label>
              <select
                value={contrast}
                onChange={(e) => setContrast(e.target.value as any)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="normal">Normal</option>
                <option value="high">High Contrast</option>
                <option value="low">Low Contrast</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={handleApplySettings}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Apply Settings
          </button>
        </div>
        
        <div 
          className={cn(
            "mt-6 p-4 border rounded-md transition-all",
            animations === 'none' ? "transition-none" : "",
            contrast === 'high' ? "shadow-none border-2" : "",
            contrast === 'low' ? "opacity-90" : ""
          )}
          style={{
            fontSize: `${fontSize}rem`
          }}
        >
          <h3 className="font-medium mb-2">Preview with Current Settings</h3>
          <p>This text reflects the font size scaling you've selected.</p>
          
          {animations !== 'none' && (
            <div className="mt-4">
              <div className={cn(
                "w-full h-2 bg-primary/20 rounded-full overflow-hidden",
                animations === 'reduced' ? "animate-[progress_3s_ease-in-out]" : "animate-[progress_1s_ease-in-out]",
              )}>
                <div className="h-full bg-primary rounded-full" style={{ width: '60%' }}></div>
              </div>
              <p className="text-xs mt-1">Animation example (progress bar)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Color sample component
 */
function ColorSample({ name, color, textColor }: { 
  name: string; 
  color?: string; 
  textColor?: string;
}) {
  return (
    <div 
      className="flex items-center h-10 rounded-md overflow-hidden"
      style={{ backgroundColor: color || '#e5e7eb' }}
    >
      <div 
        className="h-full px-3 flex items-center"
        style={{ color: textColor || '#000000' }}
      >
        {name}
      </div>
      <div className="ml-auto px-3 text-xs opacity-80 font-mono" style={{ color: textColor || '#000000' }}>
        {color || 'undefined'}
      </div>
    </div>
  );
}