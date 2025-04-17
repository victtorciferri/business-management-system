import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBusinessContext } from "@/contexts/BusinessContext";

export default function BusinessThemeEditor() {
  const { businessTheme, updateBusinessTheme } = useTheme();
  const { business } = useBusinessContext();
  const { toast } = useToast();
  
  // Local state for form values
  const [primary, setPrimary] = useState(businessTheme.primary);
  const [secondary, setSecondary] = useState(businessTheme.secondary);
  const [background, setBackground] = useState(businessTheme.background);
  const [text, setText] = useState(businessTheme.text);
  const [appearance, setAppearance] = useState<"light" | "dark" | "system">(
    businessTheme.appearance || "system"
  );
  
  // Update local state when business theme changes
  useEffect(() => {
    setPrimary(businessTheme.primary);
    setSecondary(businessTheme.secondary);
    setBackground(businessTheme.background);
    setText(businessTheme.text);
    setAppearance(businessTheme.appearance || "system");
  }, [businessTheme]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all colors are hex format
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(primary) || !hexRegex.test(secondary) || 
        !hexRegex.test(background) || !hexRegex.test(text)) {
      toast({
        title: "Invalid color format",
        description: "All colors must be in hex format (e.g., #1E3A8A)",
        variant: "destructive"
      });
      return;
    }
    
    // Update the theme
    updateBusinessTheme({
      primary,
      secondary,
      background,
      text,
      appearance
    });
    
    toast({
      title: "Theme updated",
      description: "Your business theme has been updated successfully"
    });
  };
  
  // Apply preview colors to a specific element without affecting the whole app
  const previewStyle = {
    "--preview-primary": primary,
    "--preview-secondary": secondary,
    "--preview-background": background,
    "--preview-text": text,
  } as React.CSSProperties;
  
  if (!business) {
    return null; // Only show for business owners
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Theme</CardTitle>
          <CardDescription>
            Customize your business theme colors. These colors will be used throughout your business portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="colors">
              <TabsList className="mb-4">
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="colors" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primary"
                        value={primary}
                        onChange={(e) => setPrimary(e.target.value)}
                        placeholder="#1E3A8A"
                      />
                      <input
                        type="color"
                        value={primary}
                        onChange={(e) => setPrimary(e.target.value)}
                        className="w-10 h-10 border rounded"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondary">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondary"
                        value={secondary}
                        onChange={(e) => setSecondary(e.target.value)}
                        placeholder="#9333EA"
                      />
                      <input
                        type="color"
                        value={secondary}
                        onChange={(e) => setSecondary(e.target.value)}
                        className="w-10 h-10 border rounded"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="background">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="background"
                        value={background}
                        onChange={(e) => setBackground(e.target.value)}
                        placeholder="#FFFFFF"
                      />
                      <input
                        type="color"
                        value={background}
                        onChange={(e) => setBackground(e.target.value)}
                        className="w-10 h-10 border rounded"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="text">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="#111827"
                      />
                      <input
                        type="color"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-10 h-10 border rounded"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="appearance" className="space-y-4">
                <div className="space-y-2">
                  <Label>Appearance Mode</Label>
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant={appearance === "light" ? "default" : "outline"}
                      onClick={() => setAppearance("light")}
                    >
                      Light
                    </Button>
                    <Button 
                      type="button"
                      variant={appearance === "dark" ? "default" : "outline"}
                      onClick={() => setAppearance("dark")}
                    >
                      Dark
                    </Button>
                    <Button 
                      type="button"
                      variant={appearance === "system" ? "default" : "outline"}
                      onClick={() => setAppearance("system")}
                    >
                      System
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="space-y-4">
                <div 
                  className="p-6 rounded-lg border shadow-sm" 
                  style={previewStyle}
                >
                  <div className="mb-4 p-4 rounded" style={{ 
                    backgroundColor: 'var(--preview-background)',
                    color: 'var(--preview-text)',
                    border: '1px solid var(--preview-text)'
                  }}>
                    <h3 className="text-lg font-semibold mb-2">Background & Text</h3>
                    <p>This is how your background and text colors will look together.</p>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="p-4 rounded" style={{ 
                      backgroundColor: 'var(--preview-primary)',
                      color: '#ffffff'
                    }}>
                      Primary Color
                    </div>
                    
                    <div className="p-4 rounded" style={{ 
                      backgroundColor: 'var(--preview-secondary)',
                      color: '#ffffff'
                    }}>
                      Secondary Color
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button"
                variant="outline"
                onClick={() => {
                  setPrimary(businessTheme.primary);
                  setSecondary(businessTheme.secondary);
                  setBackground(businessTheme.background);
                  setText(businessTheme.text);
                }}
              >
                Reset
              </Button>
              <Button type="submit">Save Theme</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}