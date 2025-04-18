/**
 * Theme Selector Component - 2025 Edition
 * 
 * Component for selecting and managing themes in the theme editor
 */

import { useState } from 'react';
import { useThemeManager } from '@/hooks/use-theme-manager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Trash2, Pencil, Plus, MoreHorizontal, Check } from 'lucide-react';
import { ThemeEntity } from '@shared/schema';
import { ThemeRequest } from '@/lib/themeApi';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ThemeSelectorProps {
  onSelectTheme: (theme: ThemeEntity) => void;
  selectedThemeId?: number;
}

export function ThemeSelector({ onSelectTheme, selectedThemeId }: ThemeSelectorProps) {
  const { 
    themes, 
    isLoadingThemes, 
    activeTheme, 
    createTheme, 
    updateTheme, 
    deleteTheme, 
    activateTheme 
  } = useThemeManager();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeEntity | null>(null);
  const [newTheme, setNewTheme] = useState<Partial<ThemeRequest>>({
    name: '',
    description: '',
    primaryColor: '#4f46e5',
    isDefault: false,
    isActive: false,
  });

  // Function to handle theme selection
  const handleThemeSelect = (theme: ThemeEntity) => {
    onSelectTheme(theme);
  };

  // Function to handle creating a new theme
  const handleCreateTheme = () => {
    if (!newTheme.name) return;
    
    createTheme({
      name: newTheme.name,
      description: newTheme.description || '',
      primaryColor: newTheme.primaryColor || '#4f46e5',
      isDefault: newTheme.isDefault || false,
      isActive: newTheme.isActive || false,
    });
    
    setNewTheme({
      name: '',
      description: '',
      primaryColor: '#4f46e5',
      isDefault: false,
      isActive: false,
    });
    
    setIsCreateDialogOpen(false);
  };

  // Function to handle updating a theme
  const handleUpdateTheme = () => {
    if (!editingTheme) return;
    
    updateTheme(editingTheme.id, {
      name: editingTheme.name,
      description: editingTheme.description,
      primaryColor: editingTheme.primaryColor,
      isDefault: editingTheme.isDefault,
      isActive: editingTheme.isActive,
    });
    
    setEditingTheme(null);
    setIsEditDialogOpen(false);
  };

  // Function to handle deleting a theme
  const handleDeleteTheme = (themeId: number) => {
    if (confirm('Are you sure you want to delete this theme? This action cannot be undone.')) {
      deleteTheme(themeId);
    }
  };

  // Function to handle activating a theme
  const handleActivateTheme = (themeId: number) => {
    activateTheme(themeId);
  };

  // Function to edit a theme
  const handleEditTheme = (theme: ThemeEntity) => {
    setEditingTheme({ ...theme });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Theme Selection</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Theme
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Theme</DialogTitle>
              <DialogDescription>
                Create a new theme with basic settings. You can customize it further in the theme editor.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={newTheme.name} 
                  onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })} 
                  placeholder="Theme name" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={newTheme.description || ''} 
                  onChange={(e) => setNewTheme({ ...newTheme, description: e.target.value })} 
                  placeholder="Theme description" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input 
                    id="primaryColor" 
                    type="text" 
                    value={newTheme.primaryColor || '#4f46e5'} 
                    onChange={(e) => setNewTheme({ ...newTheme, primaryColor: e.target.value })} 
                    placeholder="#4f46e5" 
                  />
                  <Input 
                    type="color" 
                    value={newTheme.primaryColor || '#4f46e5'} 
                    onChange={(e) => setNewTheme({ ...newTheme, primaryColor: e.target.value })} 
                    className="w-12 p-1 h-10" 
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="isDefault" 
                    checked={newTheme.isDefault || false} 
                    onChange={(e) => setNewTheme({ ...newTheme, isDefault: e.target.checked })} 
                    className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary" 
                  />
                  <Label htmlFor="isDefault" className="cursor-pointer">Make Default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="isActive" 
                    checked={newTheme.isActive || false} 
                    onChange={(e) => setNewTheme({ ...newTheme, isActive: e.target.checked })} 
                    className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary" 
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">Make Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTheme} disabled={!newTheme.name}>Create Theme</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">Available Themes</CardTitle>
          <CardDescription>
            Select a theme to edit or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {isLoadingThemes ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          ) : themes && themes.length > 0 ? (
            <ScrollArea className="h-[320px] pr-4">
              <div className="space-y-3">
                {themes.map((theme) => (
                  <div 
                    key={theme.id}
                    className={`
                      p-3 border rounded-lg transition-all cursor-pointer
                      flex items-center justify-between
                      ${selectedThemeId === theme.id ? 'border-primary bg-primary/5' : 'hover:border-primary/30'}
                    `}
                    onClick={() => handleThemeSelect(theme)}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-6 h-6 rounded-full border"
                        style={{ backgroundColor: theme.primaryColor }}
                      />
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{theme.name}</h4>
                          {theme.isActive && (
                            <Badge variant="secondary" className="h-5 px-1.5 text-xs">Active</Badge>
                          )}
                          {theme.isDefault && (
                            <Badge variant="outline" className="h-5 px-1.5 text-xs">Default</Badge>
                          )}
                        </div>
                        {theme.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {theme.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {selectedThemeId === theme.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleEditTheme(theme);
                          }}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {!theme.isActive && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleActivateTheme(theme.id);
                            }}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Set as Active
                            </DropdownMenuItem>
                          )}
                          {!theme.isDefault && !theme.isActive && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTheme(theme.id);
                            }} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No themes found. Create a new theme to get started.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Theme
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Theme Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Theme</DialogTitle>
            <DialogDescription>
              Update the basic settings of your theme.
            </DialogDescription>
          </DialogHeader>
          {editingTheme && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input 
                  id="edit-name" 
                  value={editingTheme.name} 
                  onChange={(e) => setEditingTheme({ ...editingTheme, name: e.target.value })} 
                  placeholder="Theme name" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  value={editingTheme.description || ''} 
                  onChange={(e) => setEditingTheme({ ...editingTheme, description: e.target.value })} 
                  placeholder="Theme description" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input 
                    id="edit-primaryColor" 
                    type="text" 
                    value={editingTheme.primaryColor} 
                    onChange={(e) => setEditingTheme({ ...editingTheme, primaryColor: e.target.value })} 
                    placeholder="#4f46e5" 
                  />
                  <Input 
                    type="color" 
                    value={editingTheme.primaryColor} 
                    onChange={(e) => setEditingTheme({ ...editingTheme, primaryColor: e.target.value })} 
                    className="w-12 p-1 h-10" 
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="edit-isDefault" 
                    checked={editingTheme.isDefault} 
                    onChange={(e) => setEditingTheme({ ...editingTheme, isDefault: e.target.checked })} 
                    className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary" 
                  />
                  <Label htmlFor="edit-isDefault" className="cursor-pointer">Make Default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="edit-isActive" 
                    checked={editingTheme.isActive} 
                    onChange={(e) => setEditingTheme({ ...editingTheme, isActive: e.target.checked })} 
                    className="form-checkbox h-4 w-4 text-primary rounded focus:ring-primary" 
                  />
                  <Label htmlFor="edit-isActive" className="cursor-pointer">Make Active</Label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateTheme}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}