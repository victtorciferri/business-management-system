/**
 * Color Mode Demo Page - 2025 Edition
 *
 * A demo page to showcase the color mode toggle functionality
 */

import React, { useContext } from 'react';
import { GlobalThemeContext } from '@/providers/GlobalThemeContext';
import { ColorModeToggle } from '@/components/theme-aware/ColorModeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';

export default function ColorModeDemo() {
  const { darkMode, appearance, systemPreference, radius, setRadius } = useContext(GlobalThemeContext);

  return (
    <div className="container mx-auto py-10 space-y-10">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Theme System - 2025 Edition</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A showcase of the new color mode system with smooth transitions and system preference detection.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Color Mode Information */}
        <Card>
          <CardHeader>
            <CardTitle>Current Theme Settings</CardTitle>
            <CardDescription>Information about your current color mode preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                {darkMode ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div>
                <p className="font-medium">Color Mode</p>
                <p className="text-sm text-muted-foreground">
                  Currently using <strong>{darkMode ? 'Dark' : 'Light'}</strong> mode
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                <Palette size={20} />
              </div>
              <div>
                <p className="font-medium">Preference</p>
                <p className="text-sm text-muted-foreground">
                  Your preference is set to <strong>{appearance}</strong>
                  {appearance === 'system' && systemPreference && (
                    <span> (system is {systemPreference})</span>
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="radius-slider">Border Radius: {radius}px</Label>
              </div>
              <Slider
                id="radius-slider"
                min={0}
                max={24}
                step={1}
                value={[radius]}
                onValueChange={([value]) => setRadius(value)}
              />
              <p className="text-xs text-muted-foreground">
                Adjust the border radius of UI elements
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Color Toggle Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Toggle Variants</CardTitle>
            <CardDescription>Different ways to toggle between color modes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Standard Dropdown (default)</Label>
              <div className="flex justify-between">
                <ColorModeToggle variant="dropdown" size="md" />
                <ColorModeToggle variant="dropdown" size="sm" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon Only</Label>
              <div className="flex justify-between">
                <ColorModeToggle variant="icon" size="lg" />
                <ColorModeToggle variant="icon" size="md" />
                <ColorModeToggle variant="icon" size="sm" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Button Group</Label>
              <ColorModeToggle variant="buttons" size="md" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* UI Component Examples */}
      <Tabs defaultValue="components" className="w-full">
        <TabsList className="w-full justify-start mb-4">
          <TabsTrigger value="components">UI Components</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="forms">Form Elements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="components" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Button variant="default" size="lg" className="mr-2">Primary</Button>
                  <Button variant="secondary" size="lg">Secondary</Button>
                </div>
                <div>
                  <Button variant="outline" className="mr-2">Outline</Button>
                  <Button variant="ghost" className="mr-2">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
                <div>
                  <Button variant="destructive" className="mr-2">Destructive</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Typography</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <h1 className="text-2xl font-bold">Heading 1</h1>
                <h2 className="text-xl font-semibold">Heading 2</h2>
                <h3 className="text-lg font-medium">Heading 3</h3>
                <p className="text-base">Regular paragraph text</p>
                <p className="text-sm text-muted-foreground">Muted small text</p>
                <a href="#" className="text-primary hover:underline">Link text</a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-background border"></div>
                    <span className="text-sm">Background</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-primary"></div>
                    <span className="text-sm">Primary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-secondary"></div>
                    <span className="text-sm">Secondary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-muted"></div>
                    <span className="text-sm">Muted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-accent"></div>
                    <span className="text-sm">Accent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-destructive"></div>
                    <span className="text-sm">Destructive</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="cards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Card</CardTitle>
                <CardDescription>A simple card with title and description</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is a basic card example showing how it looks in different color modes.</p>
              </CardContent>
              <CardFooter>
                <Button>Action</Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-primary text-primary-foreground">
              <CardHeader>
                <CardTitle>Primary Card</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Using primary color as background
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Cards can use different background colors to create emphasis.</p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary">Action</Button>
              </CardFooter>
            </Card>
            
            <Card className="border-4 border-primary">
              <CardHeader>
                <CardTitle>Bordered Card</CardTitle>
                <CardDescription>Using a colored border for emphasis</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Borders can be used to create visual hierarchy in your interface.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Action</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
              <CardDescription>Various form elements with dark/light mode support</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Enter your name" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="disabled">Disabled Input</Label>
                  <Input id="disabled" disabled value="This input is disabled" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Buttons</Label>
                  <div className="flex gap-2">
                    <Button>Submit</Button>
                    <Button variant="outline">Cancel</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slider">Slider</Label>
                  <Slider id="slider" defaultValue={[50]} max={100} step={1} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="ghost">Reset</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <footer className="text-center py-6 text-sm text-muted-foreground">
        <p>Theme System - 2025 Edition | Current mode: {darkMode ? 'Dark' : 'Light'}</p>
      </footer>
    </div>
  );
}