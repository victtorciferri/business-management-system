/**
 * Themed Components - 2025 Edition
 * 
 * A collection of components that demonstrate the usage of our theme system
 * in real-world UI elements.
 */

import React from 'react';
import { useTheme } from '../../../providers/ThemeProvider';
import { Theme } from '../../../../shared/designTokens';
import { 
  useButtonTheme, 
  useCardTheme, 
  useFormTheme,
  useAvatarStyles
} from './componentHooks';

/**
 * Button component with theme integration
 */
export function Button({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const theme = useButtonTheme();
  
  // Map variants to styles
  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = `
        bg-primary text-primary-foreground 
        hover:bg-primary/90 
        focus-visible:ring-2 focus-visible:ring-primary/30
      `;
      break;
    case 'secondary':
      variantStyles = `
        bg-secondary text-secondary-foreground 
        hover:bg-secondary/90
        focus-visible:ring-2 focus-visible:ring-secondary/30
      `;
      break;
    case 'outline':
      variantStyles = `
        border border-primary/20 bg-background text-foreground 
        hover:bg-primary/10 hover:border-primary/30
        focus-visible:ring-2 focus-visible:ring-primary/20
      `;
      break;
    case 'ghost':
      variantStyles = `
        bg-transparent text-foreground 
        hover:bg-primary/10
        focus-visible:ring-2 focus-visible:ring-primary/20
      `;
      break;
    case 'link':
      variantStyles = `
        bg-transparent text-primary underline-offset-4 hover:underline
        focus-visible:ring-0
      `;
      break;
  }
  
  // Map sizes to styles
  let sizeStyles = '';
  switch (size) {
    case 'small':
      sizeStyles = 'h-8 rounded-md px-3 text-xs';
      break;
    case 'medium':
      sizeStyles = 'h-10 rounded-md px-4 py-2 text-sm';
      break;
    case 'large':
      sizeStyles = 'h-12 rounded-md px-6 py-3 text-base';
      break;
  }
  
  const baseStyles = `
    inline-flex items-center justify-center 
    font-medium transition-colors
    focus-visible:outline-none focus-visible:ring-offset-2
    disabled:pointer-events-none disabled:opacity-50
  `;
  
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      style={{
        // We can use advanced theme values directly in styles
        '--btn-focus-shadow': theme.focusRingColor,
      } as React.CSSProperties}
    >
      {children}
    </button>
  );
}

/**
 * Card component with theme integration
 */
export function Card({
  children,
  title,
  footer,
  className = '',
}: {
  children: React.ReactNode;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  const theme = useCardTheme();
  
  return (
    <div 
      className={`
        rounded-lg border bg-card text-card-foreground shadow-sm
        ${className}
      `}
      style={{
        // We can use theme properties directly for custom styling
        borderRadius: theme.borderRadius,
      }}
    >
      {title && (
        <div className="flex flex-row items-center justify-between p-6 pb-2">
          <div className="font-medium">{title}</div>
        </div>
      )}
      <div className="p-6 pt-0">
        {children}
      </div>
      {footer && (
        <div className="border-t bg-muted/50 px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
}

/**
 * Input component with theme integration
 */
export function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  label,
  id,
  className = '',
}: {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  id?: string;
  className?: string;
}) {
  const formTheme = useFormTheme();
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={inputId}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm
          file:border-0 file:bg-transparent file:text-sm file:font-medium
          placeholder:text-muted-foreground
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          ${error ? 'border-destructive focus-visible:ring-destructive/30' : ''}
          ${className}
        `}
        style={{
          // We can use theme properties directly
          boxShadow: formTheme.input.shadow,
        }}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

/**
 * Avatar component with theme integration
 */
export function Avatar({
  src,
  alt,
  initials,
  size = 'medium',
  className = '',
}: {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
}) {
  const { styles } = useAvatarStyles();
  
  // Map sizes to dimensions
  let sizeClass = '';
  switch (size) {
    case 'small':
      sizeClass = 'h-8 w-8 text-xs';
      break;
    case 'medium':
      sizeClass = 'h-10 w-10 text-sm';
      break;
    case 'large':
      sizeClass = 'h-14 w-14 text-base';
      break;
    case 'xlarge':
      sizeClass = 'h-20 w-20 text-lg';
      break;
  }
  
  return (
    <div
      className={`relative flex shrink-0 overflow-hidden rounded-full ${sizeClass} ${className}`}
      style={{
        backgroundColor: styles.backgroundColor as string,
        color: styles.color as string,
      }}
    >
      {src ? (
        <img 
          src={src}
          alt={alt || 'Avatar'}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-medium">
          {initials || (alt ? alt.charAt(0).toUpperCase() : 'U')}
        </div>
      )}
    </div>
  );
}

/**
 * A component demo that shows all themed components
 */
export function ThemedComponentsDemo() {
  const theme = useTheme();
  
  return (
    <div className="space-y-10 p-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Themed Components Demo</h2>
        <p className="text-muted-foreground mb-8">
          This showcase demonstrates components styled using our 2025 theme system. The current theme is{' '}
          <strong>{theme.theme.metadata.name}</strong>.
        </p>
      </div>
      
      <section className="space-y-4">
        <h3 className="text-xl font-medium">Buttons</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Button Variants</h4>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Button Sizes</h4>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="small">Small</Button>
              <Button size="medium">Medium</Button>
              <Button size="large">Large</Button>
            </div>
          </div>
        </div>
      </section>
      
      <section className="space-y-4">
        <h3 className="text-xl font-medium">Cards</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Basic Card">
            <p className="text-muted-foreground">This is a basic card with a title. Cards can contain any content.</p>
          </Card>
          
          <Card 
            title="Card with Actions" 
            footer={
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="small">Cancel</Button>
                <Button size="small">Save</Button>
              </div>
            }
          >
            <p className="text-muted-foreground">This card has a footer with action buttons.</p>
          </Card>
          
          <Card>
            <div className="space-y-2">
              <h4 className="font-medium">Card without Title</h4>
              <p className="text-muted-foreground">This card doesn't have a separate title section.</p>
            </div>
          </Card>
        </div>
      </section>
      
      <section className="space-y-4">
        <h3 className="text-xl font-medium">Form Elements</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Input Fields</h4>
            <div className="space-y-4">
              <Input 
                label="Email Address" 
                placeholder="enter@email.com" 
                type="email" 
              />
              
              <Input 
                label="Password" 
                placeholder="Enter your password" 
                type="password" 
              />
              
              <Input 
                label="Username" 
                placeholder="Enter your username" 
                error="This username is already taken" 
              />
              
              <Input 
                label="Disabled Field" 
                placeholder="You cannot change this" 
                disabled 
              />
            </div>
          </div>
          
          <div>
            <Card title="Sign In">
              <div className="space-y-4">
                <Input 
                  label="Email Address" 
                  placeholder="enter@email.com" 
                  type="email" 
                />
                
                <Input 
                  label="Password" 
                  placeholder="Enter your password" 
                  type="password" 
                />
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                  />
                  <label htmlFor="remember" className="text-sm text-muted-foreground">
                    Remember me
                  </label>
                </div>
                
                <div className="pt-2">
                  <Button className="w-full">Sign In</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      <section className="space-y-4">
        <h3 className="text-xl font-medium">Avatars</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Avatar Sizes</h4>
            <div className="flex items-center space-x-4">
              <Avatar size="small" initials="XS" />
              <Avatar size="medium" initials="MD" />
              <Avatar size="large" initials="LG" />
              <Avatar size="xlarge" initials="XL" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Avatar with Images</h4>
            <div className="flex items-center space-x-4">
              <Avatar 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&crop=face" 
                alt="User 1"
                size="medium"
              />
              <Avatar 
                src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=256&h=256&fit=crop&crop=face" 
                alt="User 2"
                size="medium"
              />
              <Avatar 
                src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=256&h=256&fit=crop&crop=face" 
                alt="User 3"
                size="medium"
              />
              <Avatar 
                size="medium" 
                initials="JD"
              />
            </div>
          </div>
        </div>
      </section>
      
      <section className="space-y-4">
        <h3 className="text-xl font-medium">User Card Example</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="overflow-hidden">
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-background bg-primary/5">
                <Avatar 
                  size="xlarge"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=face"
                  alt="John Smith"
                  className="h-full w-full"
                />
              </div>
              
              <h3 className="mt-4 text-xl font-medium">John Smith</h3>
              <p className="text-sm text-muted-foreground">Product Designer</p>
              
              <div className="mt-6 flex w-full justify-center gap-2">
                <Button variant="outline" size="small">Message</Button>
                <Button size="small">Connect</Button>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-start space-x-4">
              <Avatar 
                size="large"
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&h=256&fit=crop&crop=face"
                alt="Jane Doe"
              />
              
              <div className="space-y-1">
                <h3 className="font-medium">Jane Doe</h3>
                <p className="text-sm text-muted-foreground">Marketing Director</p>
                
                <p className="text-sm mt-2">
                  Just shared a new campaign strategy doc with the team. Check your inbox!
                </p>
                
                <div className="mt-4 text-xs text-muted-foreground">
                  Posted 24 minutes ago
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar size="small" initials="AJ" />
                  <div>
                    <h3 className="text-sm font-medium">Alex Johnson</h3>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">3 days ago</div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm">
                  The new theme system is amazing! I love how easy it is to customize everything.
                </p>
              </div>
              
              <div className="mt-4 flex items-center space-x-4">
                <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                  </svg>
                  <span>Like</span>
                </button>
                
                <button className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
                  </svg>
                  <span>Reply</span>
                </button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}