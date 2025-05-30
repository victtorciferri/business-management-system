/**
 * ColorModeToggle Component - 2025 Edition
 *
 * A component for switching between light, dark, and system color modes
 */

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useGlobalTheme } from '@/providers/GlobalThemeProvider';

// Map our component sizes to shadcn button sizes
const sizeMap: Record<string, "sm" | "default" | "lg" | "icon"> = {
  sm: 'sm',
  md: 'default',
  lg: 'lg'
};

interface ColorModeToggleProps {
  variant?: 'icon' | 'dropdown' | 'buttons' | 'switch';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ColorModeToggle({
  variant = 'dropdown',
  size = 'md',
  className = '',
}: ColorModeToggleProps) {
  const { colorMode, setColorMode, resolvedColorMode, prefersDarkMode } = useGlobalTheme();
  const isDarkMode = resolvedColorMode === 'dark';

  // Icon sizes based on component size
  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 22,
  };

  // Button variant based on component size
  const buttonVariant = size === 'sm' ? 'ghost' : 'outline';

  // Handle mode change
  const handleModeChange = (mode: 'light' | 'dark' | 'system') => {
    // Add a class to emphasize the transition
    document.documentElement.classList.add('emphasize-mode-transition');
    
    // Change the mode
    setColorMode(mode);
    
    // Remove the emphasis class after the transition
    setTimeout(() => {
      document.documentElement.classList.remove('emphasize-mode-transition');
    }, 400);
  };

  // Different UI variants
  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleModeChange(isDarkMode ? 'light' : 'dark')}
        className={`rounded-full transition-all ${className}`}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? (
          <Sun size={iconSizes[size]} className="text-amber-400 transition-all" />
        ) : (
          <Moon size={iconSizes[size]} className="text-indigo-500 transition-all" />
        )}
      </Button>
    );
  }

  if (variant === 'buttons') {
    return (
      <div className={`flex gap-1 ${className}`}>
        <Button
          variant={colorMode === 'light' ? 'default' : buttonVariant}
          size={sizeMap[size]}
          onClick={() => handleModeChange('light')}
          className="gap-2"
          aria-label="Light mode"
        >
          <Sun size={iconSizes[size]} className={colorMode === 'light' ? 'text-amber-200' : ''} />
          {size !== 'sm' && <span>Light</span>}
        </Button>
        
        <Button
          variant={colorMode === 'dark' ? 'default' : buttonVariant}
          size={sizeMap[size]}
          onClick={() => handleModeChange('dark')}
          className="gap-2"
          aria-label="Dark mode"
        >
          <Moon size={iconSizes[size]} className={colorMode === 'dark' ? 'text-blue-200' : ''} />
          {size !== 'sm' && <span>Dark</span>}
        </Button>
        
        <Button
          variant={colorMode === 'system' ? 'default' : buttonVariant}
          size={sizeMap[size]}
          onClick={() => handleModeChange('system')}
          className="gap-2"
          aria-label="System mode"
        >
          <Monitor size={iconSizes[size]} />
          {size !== 'sm' && <span>System</span>}
        </Button>
      </div>
    );
  }

  // Default dropdown variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={buttonVariant}
          size={sizeMap[size]}
          className={`gap-2 transition-all ${className}`}
          aria-label="Change color mode"
        >
          {colorMode === 'light' && (
            <>
              <Sun size={iconSizes[size]} className="text-amber-500 transition-all" />
              {size !== 'sm' && <span>Light</span>}
            </>
          )}
          
          {colorMode === 'dark' && (
            <>
              <Moon size={iconSizes[size]} className="text-indigo-400 transition-all" />
              {size !== 'sm' && <span>Dark</span>}
            </>
          )}
          
          {colorMode === 'system' && (
            <>
              <Monitor size={iconSizes[size]} className="transition-all" />
              {size !== 'sm' && (
                <span>System {prefersDarkMode ? '(dark)' : '(light)'}</span>
              )}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleModeChange('light')} className="gap-2">
          <Sun size={iconSizes.md} className="text-amber-500" />
          <span>Light</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleModeChange('dark')} className="gap-2">
          <Moon size={iconSizes.md} className="text-indigo-400" />
          <span>Dark</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleModeChange('system')} className="gap-2">
          <Monitor size={iconSizes.md} />
          <span>System {prefersDarkMode ? '(dark)' : '(light)'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}