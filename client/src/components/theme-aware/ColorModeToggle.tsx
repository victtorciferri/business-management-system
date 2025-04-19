/**
 * ColorModeToggle Component - 2025 Edition
 * 
 * An animated toggle button that allows users to switch between light and dark mode.
 * This component uses custom animations and transitions for a smooth visual experience.
 */

import React, { useEffect, useState } from 'react';
import { useGlobalTheme } from '@/hooks/useGlobalTheme';
import { Moon, Sun } from 'lucide-react';

interface ColorModeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'pill' | 'button';
  withText?: boolean;
}

export const ColorModeToggle: React.FC<ColorModeToggleProps> = ({
  className = '',
  size = 'md',
  variant = 'icon',
  withText = false,
}) => {
  const { darkMode, setDarkMode, appearance, setAppearance, systemPreference } = useGlobalTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  // Size configuration
  const sizeConfig = {
    sm: { iconSize: 16, height: 'h-7', padding: 'px-2' },
    md: { iconSize: 20, height: 'h-9', padding: 'px-3' },
    lg: { iconSize: 24, height: 'h-11', padding: 'px-4' },
  };

  // Toggle the mode
  const toggleMode = () => {
    setIsAnimating(true);
    
    if (appearance === 'system') {
      // If currently using system preference, switch to explicit mode
      setAppearance(systemPreference === 'light' ? 'dark' : 'light');
    } else {
      // Toggle between light and dark
      setAppearance(appearance === 'light' ? 'dark' : 'light');
    }
    
    // Animation duration is 300ms
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Classes based on props
  const baseClasses = `
    relative inline-flex items-center justify-center 
    focus:outline-none focus:ring-2 focus:ring-primary-300 
    transition-all cursor-pointer
    ${sizeConfig[size].height}
    ${isAnimating ? 'emphasize-mode-transition' : ''}
  `;

  // Variant specific classes
  const variantClasses = {
    icon: `rounded-full ${sizeConfig[size].height} aspect-square bg-transparent hover:bg-muted-base`,
    pill: `rounded-full ${sizeConfig[size].padding} bg-muted-base text-muted-foreground`,
    button: `rounded-md ${sizeConfig[size].padding} bg-primary-base text-primary-foreground hover:bg-primary-hover`
  };

  // Icons with animations
  const renderIcon = () => {
    const iconProps = {
      size: sizeConfig[size].iconSize,
      className: `transition-transform ${isAnimating ? 'animate-spin-once' : ''}`
    };

    return darkMode ? <Moon {...iconProps} /> : <Sun {...iconProps} />;
  };

  // Full mode label (used when withText is true)
  const modeLabel = () => {
    if (appearance === 'system') {
      return `System (${systemPreference || 'default'})`;
    }
    return appearance === 'light' ? 'Light' : 'Dark';
  };

  return (
    <button
      type="button"
      onClick={toggleMode}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
    >
      {renderIcon()}
      {withText && (
        <span className={`ml-2 ${variant === 'icon' ? 'sr-only' : ''}`}>
          {modeLabel()}
        </span>
      )}
    </button>
  );
};

// Add CSS for animation
const spinOnceKeyframes = `
@keyframes spin-once {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-spin-once {
  animation: spin-once 300ms ease-in-out;
}
`;

// Inject the animation styles in the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinOnceKeyframes;
  document.head.appendChild(style);
}

export default ColorModeToggle;