/**
 * ThemeSelector - 2025 Edition
 * 
 * Component for selecting themes from available business themes.
 * Displays a list of available themes and allows switching between them.
 */

import React from 'react';
import { useBusinessTheme } from '@/providers/MultiTenantThemeProvider';
import { ThemeEntity } from '@shared/schema';
import { activateTheme } from '@/lib/themeApi';

interface ThemeSelectorProps {
  showPreview?: boolean;
  onThemeSelect?: (theme: ThemeEntity) => void;
  className?: string;
}

export function ThemeSelector({
  showPreview = true,
  onThemeSelect,
  className = '',
}: ThemeSelectorProps) {
  const { 
    themes, 
    activeTheme, 
    activeThemeId, 
    setActiveThemeId, 
    isLoading 
  } = useBusinessTheme();
  
  const handleThemeSelect = async (theme: ThemeEntity) => {
    // Update the active theme in the UI immediately
    setActiveThemeId(theme.id);
    
    // Notify parent component if callback provided
    if (onThemeSelect) {
      onThemeSelect(theme);
    }
    
    try {
      // Update the active theme in the database
      await activateTheme(theme.id);
    } catch (error) {
      console.error('Failed to activate theme:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!themes || themes.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No themes available. Create a theme first.
      </div>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium">Select Theme</h3>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isActive={theme.id === activeThemeId}
            onClick={() => handleThemeSelect(theme)}
            showPreview={showPreview}
          />
        ))}
      </div>
    </div>
  );
}

interface ThemeCardProps {
  theme: ThemeEntity;
  isActive: boolean;
  onClick: () => void;
  showPreview: boolean;
}

function ThemeCard({ theme, isActive, onClick, showPreview }: ThemeCardProps) {
  // Extract primary color from theme tokens for preview
  const primaryColor = theme.tokens?.colors?.primary?.base || '#0070f3';
  const secondaryColor = theme.tokens?.colors?.secondary?.base || '#f1f5f9';
  const accentColor = theme.tokens?.colors?.accent?.base || '#f1f5f9';
  const backgroundColor = theme.tokens?.colors?.background?.base || '#ffffff';
  
  return (
    <div
      className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md ${
        isActive ? 'ring-2 ring-primary' : ''
      }`}
      onClick={onClick}
    >
      {showPreview && (
        <div className="relative" style={{ backgroundColor: backgroundColor, height: '120px' }}>
          {/* Preview UI elements that showcase the theme colors */}
          <div className="absolute top-3 left-3 right-3 flex gap-2">
            <div className="w-16 h-8 rounded-md" style={{ backgroundColor: primaryColor }}></div>
            <div className="w-16 h-8 rounded-md" style={{ backgroundColor: secondaryColor }}></div>
            <div className="w-8 h-8 rounded-md" style={{ backgroundColor: accentColor }}></div>
          </div>
          
          <div className="absolute bottom-3 left-3 right-3">
            <div className="w-full h-6 rounded-md" style={{ backgroundColor: primaryColor, opacity: 0.2 }}></div>
          </div>
        </div>
      )}
      
      <div className="p-3 border-t">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium truncate">{theme.name}</h4>
            <p className="text-sm text-muted-foreground truncate">
              {theme.description || 'No description'}
            </p>
          </div>
          
          {isActive && (
            <div className="rounded-full bg-primary/10 text-primary p-1 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}