/**
 * ColorModeToggle Component - 2025 Edition
 *
 * A component for switching between light, dark, and system color modes
 */

import React, { useContext } from 'react';
import { GlobalThemeContext } from '@/providers/GlobalThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useGlobalTheme } from '@/hooks/useGlobalTheme';

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
  // First try to use the hook, and if it fails, fall back to the context
  let themeContext;
  try {
    themeContext = useGlobalTheme();
  } catch (e) {
    themeContext = useContext(GlobalThemeContext);
  }
  
  const { appearance, setAppearance, darkMode, systemPreference } = themeContext;

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
    setAppearance(mode);
    
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
        onClick={() => handleModeChange(darkMode ? 'light' : 'dark')}
        className={`rounded-full transition-all ${className}`}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? (
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
          variant={appearance === 'light' ? 'default' : buttonVariant}
          size={sizeMap[size]}
          onClick={() => handleModeChange('light')}
          className="gap-2"
          aria-label="Light mode"
        >
          <Sun size={iconSizes[size]} className={appearance === 'light' ? 'text-amber-200' : ''} />
          {size !== 'sm' && <span>Light</span>}
        </Button>
        
        <Button
          variant={appearance === 'dark' ? 'default' : buttonVariant}
          size={sizeMap[size]}
          onClick={() => handleModeChange('dark')}
          className="gap-2"
          aria-label="Dark mode"
        >
          <Moon size={iconSizes[size]} className={appearance === 'dark' ? 'text-blue-200' : ''} />
          {size !== 'sm' && <span>Dark</span>}
        </Button>
        
        <Button
          variant={appearance === 'system' ? 'default' : buttonVariant}
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
          {appearance === 'light' && (
            <>
              <Sun size={iconSizes[size]} className="text-amber-500 transition-all" />
              {size !== 'sm' && <span>Light</span>}
            </>
          )}
          
          {appearance === 'dark' && (
            <>
              <Moon size={iconSizes[size]} className="text-indigo-400 transition-all" />
              {size !== 'sm' && <span>Dark</span>}
            </>
          )}
          
          {appearance === 'system' && (
            <>
              <Monitor size={iconSizes[size]} className="transition-all" />
              {size !== 'sm' && (
                <span>System {systemPreference && `(${systemPreference})`}</span>
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
          <span>System {systemPreference && `(${systemPreference})`}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}