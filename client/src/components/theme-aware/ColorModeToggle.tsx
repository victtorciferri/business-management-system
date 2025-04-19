/**
 * ColorModeToggle - 2025 Edition
 * 
 * A beautiful animated toggle for switching between light and dark modes
 * with smooth transitions and accessibility features.
 */

import React from 'react';
import { useGlobalTheme } from '@/hooks/useGlobalTheme';
import '../../lib/colorModeTransition.css';

interface ColorModeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'icon' | 'switch' | 'button';
}

export function ColorModeToggle({
  className = '',
  size = 'md',
  showLabel = false,
  variant = 'icon'
}: ColorModeToggleProps) {
  const { darkMode, setDarkMode, appearance, setAppearance } = useGlobalTheme();
  
  // Toggle between light and dark mode
  const toggleColorMode = () => {
    if (appearance === 'system') {
      // If current mode is system preference, switch to explicit mode based on current state
      setAppearance(darkMode ? 'dark' : 'light');
    } else {
      // Otherwise just toggle between light and dark
      setAppearance(appearance === 'dark' ? 'light' : 'dark');
    }
  };
  
  // Toggle to use system preference
  const toggleSystemPreference = () => {
    setAppearance(appearance === 'system' ? (darkMode ? 'dark' : 'light') : 'system');
  };
  
  // Size classes for the toggle
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };
  
  // Icon sizes
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };
  
  if (variant === 'switch') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabel && (
          <span className="text-sm">
            {darkMode ? 'Dark' : 'Light'} Mode
          </span>
        )}
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox"
            checked={darkMode}
            onChange={toggleColorMode}
            className="sr-only peer"
            aria-label={`Toggle ${darkMode ? 'light' : 'dark'} mode`}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
        </label>
      </div>
    );
  }
  
  if (variant === 'button') {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <button
          type="button"
          onClick={() => setAppearance('light')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            appearance === 'light' 
              ? 'bg-primary text-white' 
              : 'bg-secondary hover:bg-secondary-hover text-secondary-foreground'
          }`}
          aria-pressed={appearance === 'light'}
        >
          Light
        </button>
        <button
          type="button"
          onClick={() => setAppearance('dark')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            appearance === 'dark' 
              ? 'bg-primary text-white' 
              : 'bg-secondary hover:bg-secondary-hover text-secondary-foreground'
          }`}
          aria-pressed={appearance === 'dark'}
        >
          Dark
        </button>
        <button
          type="button"
          onClick={() => setAppearance('system')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            appearance === 'system' 
              ? 'bg-primary text-white' 
              : 'bg-secondary hover:bg-secondary-hover text-secondary-foreground'
          }`}
          aria-pressed={appearance === 'system'}
        >
          System
        </button>
      </div>
    );
  }
  
  // Default to icon variant
  return (
    <button
      type="button"
      onClick={toggleColorMode}
      onContextMenu={(e) => {
        e.preventDefault();
        toggleSystemPreference();
      }}
      className={`relative overflow-hidden rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 hover:bg-secondary ${sizeClasses[size]} ${className}`}
      aria-label={`Toggle ${darkMode ? 'light' : 'dark'} mode (Right-click for system preference)`}
      title={`Toggle ${darkMode ? 'light' : 'dark'} mode (Right-click for system preference)`}
    >
      <span className={`absolute ${darkMode ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          width={iconSizes[size]}
          height={iconSizes[size]}
          className="text-amber-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          />
        </svg>
      </span>
      
      <span className={`absolute ${darkMode ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          width={iconSizes[size]}
          height={iconSizes[size]}
          className="text-indigo-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
          />
        </svg>
      </span>
      
      {appearance === 'system' && (
        <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
      )}
      
      {showLabel && (
        <span className="ml-2 text-sm">{darkMode ? 'Dark' : 'Light'}</span>
      )}
    </button>
  );
}