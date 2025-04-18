/**
 * Theme Examples Component
 * 
 * Demonstrates how to use the new theme system in components.
 * Shows different approaches and patterns for theme integration.
 */

import React from 'react';
import { useTheme } from '../../../providers/ThemeProvider';
import { useButtonTheme, useCardTheme, useFormTheme, useToastTheme, useAvatarStyles, useTooltipStyles } from './componentHooks';

/**
 * Button component using the component theme hook
 */
export function ThemedButton({ 
  children, 
  variant = 'primary',
  size = 'md', 
  disabled = false,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  // Get button theme tokens
  const buttonTheme = useButtonTheme();
  
  // Determine styles based on variant
  let baseStyle = '';
  
  switch (variant) {
    case 'primary':
      baseStyle = `bg-primary text-primary-foreground hover:bg-primary/90`;
      break;
    case 'secondary':
      baseStyle = `bg-secondary text-secondary-foreground hover:bg-secondary/90`;
      break;
    case 'outline':
      baseStyle = `border border-input bg-background hover:bg-accent hover:text-accent-foreground`;
      break;
    case 'ghost':
      baseStyle = `hover:bg-accent hover:text-accent-foreground`;
      break;
  }
  
  // Determine size classes
  let sizeClass = 'px-4 py-2 text-sm';
  if (size === 'sm') sizeClass = 'px-3 py-1 text-xs';
  if (size === 'lg') sizeClass = 'px-6 py-3 text-base';
  
  // Combine all classes
  const buttonClass = `
    ${baseStyle}
    ${sizeClass}
    inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium
    ring-offset-background transition-colors focus-visible:outline-none
    focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
    disabled:pointer-events-none disabled:opacity-50
    ${className}
  `;
  
  return (
    <button
      type="button"
      className={buttonClass}
      disabled={disabled}
      onClick={onClick}
      style={{
        // We can also use inline styles from the theme
        // This is useful for values not covered by utility classes
        ['--btn-focus-color' as any]: buttonTheme.focusRingColor,
      }}
    >
      {children}
    </button>
  );
}

/**
 * Card component using the component theme hook
 */
export function ThemedCard({
  children,
  title,
  className = '',
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  const cardTheme = useCardTheme();
  
  return (
    <div 
      className={`bg-card text-card-foreground rounded-lg border shadow ${className}`}
    >
      {title && (
        <div className="p-6 pb-2 font-medium text-lg">
          {title}
        </div>
      )}
      <div className="p-6 pt-0">
        {children}
      </div>
    </div>
  );
}

/**
 * Avatar component using CSS variable hook
 */
export function ThemedAvatar({
  src,
  alt,
  initials,
  size = 'md',
}: {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const { styles } = useAvatarStyles();
  
  // Determine size
  let sizeClass = 'w-10 h-10 text-sm';
  if (size === 'sm') sizeClass = 'w-8 h-8 text-xs';
  if (size === 'lg') sizeClass = 'w-16 h-16 text-base';
  
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full overflow-hidden ${sizeClass}`}
      style={{
        backgroundColor: styles.backgroundColor as string,
        color: styles.color as string,
        borderRadius: styles.borderRadius as string,
      }}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt || initials || 'Avatar'} 
          className="w-full h-full object-cover"
        />
      ) : (
        <span style={{ fontWeight: styles.fontWeight as string }}>
          {initials || alt?.charAt(0).toUpperCase() || '?'}
        </span>
      )}
    </div>
  );
}

/**
 * Example component showcasing direct theme usage
 */
export function ThemeDemonstration() {
  const theme = useTheme();
  
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Theme Demonstration</h2>
        <p className="text-muted-foreground mb-6">
          This component demonstrates different ways to use the theme system.
        </p>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Buttons</h3>
        <div className="flex flex-wrap gap-2">
          <ThemedButton>Primary Button</ThemedButton>
          <ThemedButton variant="secondary">Secondary Button</ThemedButton>
          <ThemedButton variant="outline">Outline Button</ThemedButton>
          <ThemedButton variant="ghost">Ghost Button</ThemedButton>
        </div>
        <div className="flex flex-wrap gap-2">
          <ThemedButton size="sm">Small Button</ThemedButton>
          <ThemedButton size="md">Medium Button</ThemedButton>
          <ThemedButton size="lg">Large Button</ThemedButton>
          <ThemedButton disabled>Disabled Button</ThemedButton>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ThemedCard title="Basic Card">
            <p>This is a basic card with a title and content.</p>
          </ThemedCard>
          
          <ThemedCard>
            <div className="space-y-2">
              <h4 className="font-medium">Card without title</h4>
              <p className="text-sm text-muted-foreground">This card doesn't have a separate title area.</p>
            </div>
          </ThemedCard>
          
          <ThemedCard title="Interactive Card">
            <div className="space-y-4">
              <p className="text-sm">Cards can contain buttons and other interactive elements.</p>
              <ThemedButton variant="secondary" size="sm">Card Action</ThemedButton>
            </div>
          </ThemedCard>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Avatars</h3>
        <div className="flex flex-wrap gap-4 items-center">
          <ThemedAvatar size="sm" initials="JD" />
          <ThemedAvatar initials="AB" />
          <ThemedAvatar size="lg" initials="XY" />
          <ThemedAvatar src="https://randomuser.me/api/portraits/women/32.jpg" alt="Jane Doe" />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Direct Theme Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-md">
            <h4 className="font-medium mb-2">CSS Variables</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">--color-primary</div>
              <div>{theme.getVariable('colors.primary.DEFAULT')}</div>
              
              <div className="text-muted-foreground">--font-family-heading</div>
              <div className="truncate">{theme.getVariable('typography.fontFamily.heading')}</div>
              
              <div className="text-muted-foreground">--spacing-md</div>
              <div>{theme.getVariable('spacing.md')}</div>
            </div>
          </div>
          
          <div className="p-4 border rounded-md">
            <h4 className="font-medium mb-2">Theme Settings</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Mode</div>
              <div>{theme.mode}</div>
              
              <div className="text-muted-foreground">Animations</div>
              <div>{theme.settings.animations}</div>
              
              <div className="text-muted-foreground">Theme ID</div>
              <div>{theme.theme.metadata.id}</div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={theme.toggleMode}
                className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted-foreground/10"
              >
                Toggle Dark Mode
              </button>
              
              {theme.theme.metadata.id !== 'elegant' ? (
                <button
                  onClick={() => theme.changeTheme('elegant')}
                  className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted-foreground/10"
                >
                  Try Elegant Theme
                </button>
              ) : (
                <button
                  onClick={() => theme.changeTheme('default')}
                  className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted-foreground/10"
                >
                  Try Default Theme
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}