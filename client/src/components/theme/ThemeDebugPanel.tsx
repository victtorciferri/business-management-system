/**
 * Theme Debug Panel
 * 
 * A development tool to visualize and debug the theme system.
 * This component shows the current theme state and allows testing theme changes.
 */

import React, { useState } from 'react';
import { useTheme } from '../../../providers/ThemeProvider';
import { defaultThemes } from '../../../../shared/defaultThemes';

interface ThemeDebugPanelProps {
  defaultExpanded?: boolean;
}

export function ThemeDebugPanel({ defaultExpanded = false }: ThemeDebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState<'tokens' | 'colors' | 'typography' | 'settings'>('tokens');
  const theme = useTheme();

  // Get all available theme IDs
  const themeIds = Object.keys(defaultThemes);

  // Toggle panel expansion
  const toggleExpanded = () => setIsExpanded(!isExpanded);

  // Change the theme to a preset
  const handleThemeChange = (themeId: string) => {
    theme.changeTheme(themeId);
  };

  // Toggle between light and dark mode
  const handleModeToggle = () => {
    theme.toggleMode();
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleExpanded}
          className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Show theme debug panel"
        >
          <div className="flex items-center justify-center w-6 h-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] bg-background border border-border rounded-lg shadow-xl overflow-hidden z-50">
      <div className="bg-muted p-2 flex justify-between items-center border-b border-border">
        <h3 className="font-semibold text-foreground">Theme Debug</h3>
        <div className="flex space-x-1">
          <button 
            onClick={handleModeToggle}
            className="p-1 rounded hover:bg-muted-foreground/10"
            aria-label="Toggle dark mode"
          >
            {theme.mode === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>
          <button 
            onClick={toggleExpanded}
            className="p-1 rounded hover:bg-muted-foreground/10"
            aria-label="Close panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-2 border-b border-border bg-muted/50">
        <div className="flex flex-wrap gap-1">
          {themeIds.map(id => (
            <button
              key={id}
              onClick={() => handleThemeChange(id)}
              className={`px-2 py-1 text-xs rounded ${
                theme.theme.metadata.id === id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted-foreground/10'
              }`}
            >
              {defaultThemes[id].metadata.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('tokens')}
          className={`flex-1 p-2 text-sm ${
            activeTab === 'tokens' ? 'bg-background font-medium' : 'bg-muted/50 hover:bg-muted/80'
          }`}
        >
          Tokens
        </button>
        <button
          onClick={() => setActiveTab('colors')}
          className={`flex-1 p-2 text-sm ${
            activeTab === 'colors' ? 'bg-background font-medium' : 'bg-muted/50 hover:bg-muted/80'
          }`}
        >
          Colors
        </button>
        <button
          onClick={() => setActiveTab('typography')}
          className={`flex-1 p-2 text-sm ${
            activeTab === 'typography' ? 'bg-background font-medium' : 'bg-muted/50 hover:bg-muted/80'
          }`}
        >
          Typography
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 p-2 text-sm ${
            activeTab === 'settings' ? 'bg-background font-medium' : 'bg-muted/50 hover:bg-muted/80'
          }`}
        >
          Settings
        </button>
      </div>
      
      <div className="overflow-y-auto max-h-96 p-4">
        {activeTab === 'tokens' && (
          <div>
            <h4 className="font-medium mb-2">Theme Metadata</h4>
            <div className="text-xs space-y-1 mb-4">
              <div><span className="font-mono text-muted-foreground">ID:</span> {theme.theme.metadata.id}</div>
              <div><span className="font-mono text-muted-foreground">Name:</span> {theme.theme.metadata.name}</div>
              <div><span className="font-mono text-muted-foreground">Version:</span> {theme.theme.metadata.version}</div>
              <div><span className="font-mono text-muted-foreground">Variant:</span> {theme.theme.metadata.variant}</div>
              <div><span className="font-mono text-muted-foreground">Author:</span> {theme.theme.metadata.author}</div>
              <div><span className="font-mono text-muted-foreground">Description:</span> {theme.theme.metadata.description}</div>
            </div>
            
            <h4 className="font-medium mb-2">CSS Variables</h4>
            <div className="space-y-2 text-xs">
              <div className="flex">
                <span className="font-mono text-muted-foreground w-36 truncate">--color-primary:</span>
                <span>{theme.getVariable('colors.primary.DEFAULT')}</span>
              </div>
              <div className="flex">
                <span className="font-mono text-muted-foreground w-36 truncate">--color-background:</span>
                <span>{theme.getVariable('colors.background.DEFAULT')}</span>
              </div>
              <div className="flex">
                <span className="font-mono text-muted-foreground w-36 truncate">--color-foreground:</span>
                <span>{theme.getVariable('colors.foreground.DEFAULT')}</span>
              </div>
              <div className="flex">
                <span className="font-mono text-muted-foreground w-36 truncate">--font-family-body:</span>
                <span>{theme.getVariable('typography.fontFamily.body')}</span>
              </div>
              <div className="flex">
                <span className="font-mono text-muted-foreground w-36 truncate">--border-radius:</span>
                <span>{theme.getVariable('borders.radius.DEFAULT')}</span>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'colors' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Primary Colors</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded bg-primary mb-1"></div>
                  <span className="text-xs text-muted-foreground">Primary</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded bg-primary-foreground mb-1"></div>
                  <span className="text-xs text-muted-foreground">Primary FG</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded bg-secondary mb-1"></div>
                  <span className="text-xs text-muted-foreground">Secondary</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded bg-secondary-foreground mb-1"></div>
                  <span className="text-xs text-muted-foreground">Secondary FG</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded bg-accent mb-1"></div>
                  <span className="text-xs text-muted-foreground">Accent</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded bg-accent-foreground mb-1"></div>
                  <span className="text-xs text-muted-foreground">Accent FG</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">UI Colors</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded bg-background mb-1"></div>
                  <span className="text-xs text-muted-foreground">Background</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded bg-foreground mb-1"></div>
                  <span className="text-xs text-muted-foreground">Foreground</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded bg-muted mb-1"></div>
                  <span className="text-xs text-muted-foreground">Muted</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded bg-muted-foreground mb-1"></div>
                  <span className="text-xs text-muted-foreground">Muted FG</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded border border-border mb-1"></div>
                  <span className="text-xs text-muted-foreground">Border</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded bg-card mb-1"></div>
                  <span className="text-xs text-muted-foreground">Card</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'typography' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Font Families</h4>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Heading</div>
                  <div className="font-heading text-lg">The quick brown fox jumps over the lazy dog.</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Body</div>
                  <div className="font-body">The quick brown fox jumps over the lazy dog.</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Mono</div>
                  <div className="font-mono text-sm">const example = "Hello World!";</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Font Sizes</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground">xs</span>
                  <div className="text-xs">Lorem ipsum dolor sit amet</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">sm</span>
                  <div className="text-sm">Lorem ipsum dolor sit amet</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">base</span>
                  <div className="text-base">Lorem ipsum dolor sit amet</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">lg</span>
                  <div className="text-lg">Lorem ipsum dolor sit amet</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">xl</span>
                  <div className="text-xl">Lorem ipsum dolor sit amet</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">2xl</span>
                  <div className="text-2xl">Lorem ipsum dolor sit amet</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Theme Settings</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Mode</span>
                  <div className="text-sm font-mono bg-muted rounded px-2 py-1">{theme.mode}</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Animations</span>
                  <div className="text-sm font-mono bg-muted rounded px-2 py-1">{theme.settings.animations}</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Contrast</span>
                  <div className="text-sm font-mono bg-muted rounded px-2 py-1">{theme.settings.contrast}</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Font Size</span>
                  <div className="text-sm font-mono bg-muted rounded px-2 py-1">×{theme.settings.fontSize}</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Reduced Transparency</span>
                  <div className="text-sm font-mono bg-muted rounded px-2 py-1">{theme.settings.reducedTransparency ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">State</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Loading</span>
                  <div className="text-sm font-mono bg-muted rounded px-2 py-1">{theme.isLoading ? 'Yes' : 'No'}</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Preview Mode</span>
                  <div className="text-sm font-mono bg-muted rounded px-2 py-1">{theme.isPreviewMode ? 'Yes' : 'No'}</div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Unsaved Changes</span>
                  <div className="text-sm font-mono bg-muted rounded px-2 py-1">{theme.hasUnsavedChanges ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => theme.resetTheme()}
                className="flex-1 px-3 py-1.5 text-sm bg-muted hover:bg-muted-foreground/10 rounded"
              >
                Reset Theme
              </button>
              <button
                onClick={() => theme.saveTheme()}
                className={`flex-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded ${
                  theme.isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'
                }`}
                disabled={theme.isSaving}
              >
                {theme.isSaving ? 'Saving...' : 'Save Theme'}
              </button>
            </div>
            
            <div className="pt-2 border-t border-border">
              <label className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={theme.isPreviewMode}
                  onChange={(e) => theme.setPreviewMode(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm">Preview Mode</span>
              </label>
              
              <div className="text-xs text-muted-foreground">
                In preview mode, theme changes are only applied visually and not saved to the state.
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-2 bg-muted/50 border-t border-border flex justify-between text-xs text-muted-foreground">
        <div>2025 Theme System</div>
        <div>{process.env.NODE_ENV === 'development' ? 'Development' : 'Production'}</div>
      </div>
    </div>
  );
}