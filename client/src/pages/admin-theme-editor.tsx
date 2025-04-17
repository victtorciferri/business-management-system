import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Theme } from "@shared/config";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ThemeEditor } from "@/components/business/theme-customization/ThemeEditor";
import { BusinessThemeEditor } from "@/components/business/theme-customization/BusinessThemeEditor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Eye, Save, Shield, AlertTriangle, Paintbrush } from "lucide-react";

// Type for admin business data
interface AdminBusiness {
  id: number;
  name: string;
  slug: string;
  customDomain: string | null;
  subscriptionStatus: string | null;
  ownerEmail: string;
  platformFeePercentage?: number;
  createdAt: Date;
}

// Type for theme configuration
interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  borderRadius?: number;
  backgroundColor?: string;
  textColor?: string;
  industryType?: string;
}

interface AdminThemeEditorProps {
  businessId?: number;
}

export default function AdminThemeEditor({ businessId: propBusinessId }: AdminThemeEditorProps) {
  const [_, setLocation] = useLocation();
  const params = useParams<{ businessId: string }>();
  // Use prop businessId if provided, otherwise use URL param
  const businessId = propBusinessId || (params?.businessId ? parseInt(params.businessId, 10) : null);
  const { toast } = useToast();

  // State for theme preview
  const [previewActive, setPreviewActive] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<ThemeConfig>({});

  // Fetch the business data using the preview endpoint since there's no dedicated admin business endpoint
  const { data: business, isLoading } = useQuery<AdminBusiness | null>({
    queryKey: ["/api/preview-business", businessId],
    queryFn: async () => {
      if (!businessId) return null;
      const response = await apiRequest("GET", `/api/preview-business/${businessId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch business details");
      }
      const data = await response.json();
      // Extract the business data from the response
      return {
        id: data.business.id,
        name: data.business.businessName,
        slug: data.business.businessSlug,
        customDomain: data.business.customDomain,
        subscriptionStatus: data.business.subscriptionStatus,
        ownerEmail: data.business.email,
        platformFeePercentage: data.business.platformFeePercentage,
        createdAt: new Date(data.business.createdAt)
      };
    },
    enabled: !!businessId,
  });

  // Business theme configuration state
  const [businessConfig, setBusinessConfig] = useState<ThemeConfig>({
    primaryColor: "#4f46e5",
    secondaryColor: "#06b6d4",
    accentColor: "#f59e0b",
    industryType: "general",
  });
  
  // Business theme (new format) configuration state
  const [businessTheme, setBusinessTheme] = useState<Theme>({
    name: "Default",
    primary: "#4f46e5",
    secondary: "#9333EA",
    background: "#FFFFFF",
    text: "#111827",
    appearance: "system"
  });

  // Fetch real business config/theme data
  useEffect(() => {
    const fetchThemeData = async () => {
      if (businessId) {
        try {
          // First try to get the new theme format
          const themeResponse = await apiRequest("GET", `/api/admin/business/${businessId}/theme`);
          if (themeResponse.ok) {
            const themeData = await themeResponse.json();
            
            if (themeData.theme) {
              // New theme format
              setBusinessTheme({
                name: themeData.theme.name || business?.name || "Custom Theme",
                primary: themeData.theme.primary || "#4f46e5",
                secondary: themeData.theme.secondary || "#9333EA",
                background: themeData.theme.background || "#FFFFFF",
                text: themeData.theme.text || "#111827",
                appearance: themeData.theme.appearance || "system"
              });
            }
            
            // Also set legacy config for backwards compatibility
            setBusinessConfig({
              primaryColor: themeData.primary || themeData.theme?.primary || "#4f46e5",
              secondaryColor: themeData.secondaryColor || themeData.theme?.secondary || "#06b6d4",
              accentColor: themeData.accentColor || "#f59e0b",
              industryType: themeData.industryType || "general",
            });
          }
        } catch (error) {
          console.error("Failed to fetch theme data:", error);
        }
      }
    };
    
    fetchThemeData();
  }, [businessId]);

  // Handle theme preview
  const handlePreview = (themeConfig: ThemeConfig) => {
    setPreviewTheme(themeConfig);
    setPreviewActive(true);
    
    // Optional: Apply preview to this page
    // applyThemeToDocument(themeConfig);
  };

  // Handle theme save completion
  const handleSaveComplete = () => {
    toast({
      title: "Theme saved",
      description: "The theme has been successfully updated.",
    });
    
    // Refresh business data
    queryClient.invalidateQueries({queryKey: ["/api/preview-business", businessId]});
  };
  
  // Handle saving the new business theme
  const handleSaveBusinessTheme = async (theme: Theme) => {
    if (!businessId) return;
    
    try {
      const response = await apiRequest("POST", `/api/admin/business/${businessId}/theme`, {
        theme
      });
      
      if (!response.ok) {
        throw new Error("Failed to update business theme");
      }
      
      setBusinessTheme(theme);
      
      toast({
        title: "Theme saved",
        description: "Business theme has been successfully updated.",
      });
      
      // Refresh business data
      queryClient.invalidateQueries({queryKey: ["/api/preview-business", businessId]});
    } catch (error) {
      console.error("Error saving business theme:", error);
      toast({
        title: "Error",
        description: "Failed to save business theme. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Business Not Found</CardTitle>
            <CardDescription>
              The requested business could not be found or you don't have permission to edit it.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => setLocation("/admin-dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => setLocation("/admin-dashboard")}>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  <span>Admin Dashboard</span>
                </div>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => setLocation("/admin-dashboard")}>
                Businesses
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span>{business.name}</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span>Theme Editor</span>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{business.name} - Theme Editor</h1>
        <p className="text-muted-foreground">
          Customize the theme settings for {business.name}
        </p>
      </div>
      
      <div className="flex flex-col gap-8">
        <Tabs defaultValue="new">
          <TabsList className="mb-4">
            <TabsTrigger value="new">Business Theme</TabsTrigger>
            <TabsTrigger value="legacy">Advanced Theme Editor</TabsTrigger>
          </TabsList>
          
          <Card className="mb-4 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardContent className="py-4">
              <Alert className="bg-transparent border-0 p-0">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <AlertTitle className="text-blue-700 dark:text-blue-300 mb-1">About Theme Editors</AlertTitle>
                    <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
                      <p className="mb-2"><strong>Business Theme</strong>: The new simplified theme editor that uses direct color values. This is recommended for most businesses.</p>
                      <p><strong>Advanced Theme Editor</strong>: The legacy theme editor with more detailed customization options.</p>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            </CardContent>
          </Card>
          
          <TabsContent value="new">
            <div className="mb-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Paintbrush className="h-5 w-5 text-primary" />
                    <CardTitle>Business Theme Settings</CardTitle>
                  </div>
                  <CardDescription className="mt-1.5">
                    Color customization for {business.name}'s theme
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Admin implementation that saves to the admin API endpoint */}
                  <BusinessThemeEditor 
                    initialTheme={businessTheme}
                    businessId={businessId}
                    onSaveTheme={handleSaveBusinessTheme}
                    onSave={() => handleSaveComplete()}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="legacy">
            <ThemeEditor 
              onPreview={handlePreview}
              onSave={handleSaveComplete}
              initialConfig={{
                primaryColor: businessConfig.primaryColor,
                secondaryColor: businessConfig.secondaryColor,
                accentColor: businessConfig.accentColor,
                industryType: businessConfig.industryType,
                // Set the business context manually for the theme editor
                business: business ? {
                  id: business.id,
                  name: business.name,
                  slug: business.slug
                } : undefined
              }}
            />
          </TabsContent>
        </Tabs>
        
        {previewActive && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <CardTitle>Theme Preview</CardTitle>
              </div>
              <CardDescription className="mt-1.5">
                This is a preview of how the theme will look
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 rounded-md bg-slate-50 dark:bg-slate-900 border border-dashed">
                <p className="text-sm text-center text-muted-foreground">
                  This is a real-time preview of the theme settings. All CSS variables have been updated to reflect these changes.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Primary Color</h3>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-md border flex-shrink-0"
                        style={{ backgroundColor: previewTheme.primaryColor || businessConfig.primaryColor }}
                      ></div>
                      <div 
                        className="flex-1 h-10 rounded-md border flex items-center justify-center"
                        style={{ backgroundColor: previewTheme.primaryColor || businessConfig.primaryColor }}
                      >
                        <span className="font-medium text-sm" style={{ color: "#ffffff" }}>
                          {previewTheme.primaryColor || businessConfig.primaryColor}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Secondary Color</h3>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-md border flex-shrink-0"
                        style={{ backgroundColor: previewTheme.secondaryColor || businessConfig.secondaryColor }}
                      ></div>
                      <div 
                        className="flex-1 h-10 rounded-md border flex items-center justify-center"
                        style={{ backgroundColor: previewTheme.secondaryColor || businessConfig.secondaryColor }}
                      >
                        <span className="font-medium text-sm" style={{ color: "#ffffff" }}>
                          {previewTheme.secondaryColor || businessConfig.secondaryColor}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Accent Color</h3>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-md border flex-shrink-0"
                        style={{ backgroundColor: previewTheme.accentColor || businessConfig.accentColor }}
                      ></div>
                      <div 
                        className="flex-1 h-10 rounded-md border flex items-center justify-center"
                        style={{ backgroundColor: previewTheme.accentColor || businessConfig.accentColor }}
                      >
                        <span className="font-medium text-sm" style={{ color: "#ffffff" }}>
                          {previewTheme.accentColor || businessConfig.accentColor}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Font Family</h3>
                    <div 
                      className="h-10 rounded-md border flex items-center justify-center px-4 bg-white dark:bg-slate-800"
                      style={{ fontFamily: previewTheme.fontFamily || "system-ui, sans-serif" }}
                    >
                      <span className="text-sm">The quick brown fox jumps over the lazy dog</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="mt-8">
        <Button variant="outline" onClick={() => setLocation("/admin-dashboard")}>
          <div className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>Back to Admin Dashboard</span>
          </div>
        </Button>
      </div>
    </div>
  );
}