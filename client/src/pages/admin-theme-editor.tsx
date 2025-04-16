import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ThemeEditor } from "@/components/business/theme-customization/ThemeEditor";
import { ArrowLeft, Eye, Save, Shield } from "lucide-react";

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

  // Fetch real business config/theme data
  useEffect(() => {
    const fetchThemeData = async () => {
      if (businessId) {
        try {
          const response = await apiRequest("GET", `/api/admin/business/${businessId}/theme`);
          if (response.ok) {
            const data = await response.json();
            setBusinessConfig({
              primaryColor: data.primary || "#4f46e5",
              secondaryColor: data.secondaryColor || "#06b6d4",
              accentColor: data.accentColor || "#f59e0b",
              industryType: data.industryType || "general",
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
                <Shield className="h-4 w-4 mr-1" />
                Admin Dashboard
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
        <ThemeEditor 
          onPreview={handlePreview}
          onSave={handleSaveComplete}
          initialConfig={{
            primaryColor: businessConfig.primaryColor,
            secondaryColor: businessConfig.secondaryColor,
            accentColor: businessConfig.accentColor,
            industryType: businessConfig.industryType,
            // Set the business context manually for the theme editor
            business: {
              id: business.id,
              name: business.name,
              slug: business.slug
            }
          }}
        />
        
        {previewActive && (
          <Card>
            <CardHeader>
              <CardTitle>Theme Preview</CardTitle>
              <CardDescription>
                This is a preview of how the theme will look
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Primary Color</h3>
                  <div 
                    className="h-12 rounded-md border flex items-center justify-center"
                    style={{ backgroundColor: previewTheme.primaryColor || businessConfig.primaryColor }}
                  >
                    <span className="font-medium" style={{ color: "#ffffff" }}>
                      {previewTheme.primaryColor || businessConfig.primaryColor}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Secondary Color</h3>
                  <div 
                    className="h-12 rounded-md border flex items-center justify-center"
                    style={{ backgroundColor: previewTheme.secondaryColor || businessConfig.secondaryColor }}
                  >
                    <span className="font-medium" style={{ color: "#ffffff" }}>
                      {previewTheme.secondaryColor || businessConfig.secondaryColor}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Accent Color</h3>
                  <div 
                    className="h-12 rounded-md border flex items-center justify-center"
                    style={{ backgroundColor: previewTheme.accentColor || businessConfig.accentColor }}
                  >
                    <span className="font-medium" style={{ color: "#ffffff" }}>
                      {previewTheme.accentColor || businessConfig.accentColor}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Font Family</h3>
                  <div 
                    className="h-12 rounded-md border flex items-center justify-center px-4"
                    style={{ fontFamily: previewTheme.fontFamily || "system-ui, sans-serif" }}
                  >
                    <span>The quick brown fox jumps over the lazy dog</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-medium mb-4">UI Components Preview</h3>
                  <div className="space-y-4">
                    <Button 
                      style={{ 
                        backgroundColor: previewTheme.primaryColor || businessConfig.primaryColor,
                        borderRadius: previewTheme.borderRadius ? `${previewTheme.borderRadius}px` : '8px'
                      }}
                    >
                      Primary Button
                    </Button>
                    
                    <Button 
                      variant="outline"
                      style={{ 
                        borderColor: previewTheme.primaryColor || businessConfig.primaryColor,
                        color: previewTheme.primaryColor || businessConfig.primaryColor,
                        borderRadius: previewTheme.borderRadius ? `${previewTheme.borderRadius}px` : '8px'
                      }}
                    >
                      Outline Button
                    </Button>
                    
                    <Card style={{ 
                      borderRadius: previewTheme.borderRadius ? `${previewTheme.borderRadius}px` : '8px' 
                    }}>
                      <CardHeader>
                        <CardTitle>Card Title</CardTitle>
                        <CardDescription>Card description</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>Card content sample text</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-4">Industry Layout Preview</h3>
                  <div className="border rounded-md p-4 h-64 flex items-center justify-center">
                    <p className="text-center text-muted-foreground">
                      Selected industry template: <strong>{previewTheme.industryType || businessConfig.industryType}</strong>
                      <br /><br />
                      A live preview would be rendered here with the actual template.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="mt-8">
        <Button variant="outline" onClick={() => setLocation("/admin-dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Dashboard
        </Button>
      </div>
    </div>
  );
}