import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Eye, MoreHorizontal, Settings, Trash, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Define a type for the business data returned by the admin API
interface AdminBusiness {
  id: number;
  name: string;           // business_name in database
  slug: string;           // business_slug in database
  ownerEmail: string;     // email in database
  customDomain: string | null;
  subscriptionStatus: string | null;
  platformFeePercentage: number;
  phone: string | null;
  subscription: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PlatformAdminProps {
  businessSlug?: string;
  editBusinessId?: number;
  isCreateMode?: boolean;
}

export default function PlatformAdmin({ businessSlug, editBusinessId, isCreateMode }: PlatformAdminProps = {}) {
  const [_, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBusinesses, setFilteredBusinesses] = useState<AdminBusiness[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<AdminBusiness | null>(null);
  const [isBusinessDetails, setIsBusinessDetails] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Determine which view to show based on props
  useEffect(() => {
    if (isCreateMode) {
      setIsCreating(true);
      setIsBusinessDetails(false);
      setIsEditMode(false);
    } else if (businessSlug) {
      setIsBusinessDetails(true);
      setIsEditMode(false);
      setIsCreating(false);
    } else if (editBusinessId) {
      setIsEditMode(true);
      setIsBusinessDetails(false);
      setIsCreating(false);
    } else {
      setIsBusinessDetails(false);
      setIsEditMode(false);
      setIsCreating(false);
    }
  }, [businessSlug, editBusinessId, isCreateMode]);

  // Fetch all businesses
  const { data: businesses, isLoading, error } = useQuery<AdminBusiness[]>({
    queryKey: ["/api/admin/businesses"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/businesses");
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching businesses:", errorText);
        throw new Error(`Failed to fetch businesses: ${response.status} ${errorText}`);
      }
      
      const businessData = await response.json();
      
      // Debug: Log the raw business data to see what's coming from the API
      console.log("Raw business data from API:", {
        businessCount: businessData?.length || 0,
        firstBusiness: businessData?.[0] || null,
        allBusinesses: businessData || []
      });
      
      return businessData;
    },
    retry: 1
  });
  
  // Find the specific business by slug or ID
  useEffect(() => {
    if (businesses && (businessSlug || editBusinessId)) {
      const business = businessSlug 
        ? businesses.find(b => b.slug === businessSlug)
        : businesses.find(b => b.id === editBusinessId);
        
      if (business) {
        setSelectedBusiness(business);
      }
    }
  }, [businesses, businessSlug, editBusinessId]);

  // Filter businesses based on search term
  useEffect(() => {
    if (businesses) {
      const filtered = businesses.filter(business => {
        const businessName = (business.name || "").toLowerCase();
        const email = (business.ownerEmail || "").toLowerCase();
        const slug = (business.slug || "").toLowerCase();
        
        const searchTermLower = searchTerm.toLowerCase();
        
        return businessName.includes(searchTermLower) || 
               email.includes(searchTermLower) || 
               slug.includes(searchTermLower);
      });
      
      // Debug the filtering process
      console.log("Filtering businesses:", { 
        total: businesses.length,
        filtered: filtered.length,
        searchTerm
      });
      
      setFilteredBusinesses(filtered);
    }
  }, [businesses, searchTerm]);

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleManageBusiness = (slug: string | null) => {
    if (slug) {
      setLocation(`/platform-admin/${slug}`);
    }
  };

  const renderSubscriptionStatus = (status: string | null) => {
    if (!status) return <Badge variant="outline">Free</Badge>;
    
    switch(status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-500">Trial</Badge>;
      case 'cancelled':
        return <Badge className="bg-yellow-500">Cancelled</Badge>;
      case 'past_due':
        return <Badge className="bg-red-500">Past Due</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Render the business details view
  const renderBusinessDetails = () => {
    if (!selectedBusiness) {
      return (
        <div className="text-center py-8">
          <h2 className="text-xl font-medium mb-2">Business not found</h2>
          <p className="text-muted-foreground">The requested business could not be found.</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => setLocation("/platform-admin")}
          >
            Return to Business List
          </Button>
        </div>
      );
    }

    return (
      <>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation("/platform-admin")}
                className="mb-2"
              >
                <span className="mr-1">←</span> Back to Businesses
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{selectedBusiness.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-muted-foreground">{selectedBusiness.slug}</p>
              {selectedBusiness.customDomain && (
                <Badge variant="outline">{selectedBusiness.customDomain}</Badge>
              )}
              {renderSubscriptionStatus(selectedBusiness.subscriptionStatus)}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => selectedBusiness.id && setLocation(`/preview/${selectedBusiness.id}`)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Site
            </Button>
            <Button 
              variant="default"
              onClick={() => selectedBusiness.id && setLocation(`/platform-admin/edit/${selectedBusiness.id}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Business
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Details about this business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p>{selectedBusiness.ownerEmail}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                    <p>{selectedBusiness.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                    <p>{formatDate(selectedBusiness.createdAt)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                    <p>{formatDate(selectedBusiness.updatedAt)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Platform Fee</h3>
                    <p>{selectedBusiness.platformFeePercentage}%</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Subscription</h3>
                    <p>{selectedBusiness.subscription || "Free Plan"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Actions</CardTitle>
              <CardDescription>Manage this business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Modify Platform Fee
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Appointments
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                View Customers
              </Button>
              <Button className="w-full justify-start" variant="destructive">
                <Trash className="h-4 w-4 mr-2" />
                Suspend Business
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  };

  // Render the business edit form
  const renderEditForm = () => {
    if (!selectedBusiness) {
      return (
        <div className="text-center py-8">
          <h2 className="text-xl font-medium mb-2">Business not found</h2>
          <p className="text-muted-foreground">The requested business could not be found.</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => setLocation("/platform-admin")}
          >
            Return to Business List
          </Button>
        </div>
      );
    }

    return (
      <>
        <div className="flex items-center space-x-2 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation(`/platform-admin/${selectedBusiness.slug}`)}
          >
            <span className="mr-1">←</span> Back to Business Details
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Business: {selectedBusiness.name}</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Edit Business Information</CardTitle>
            <CardDescription>Update the business details</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">This feature is coming soon. Currently, you can view business details but not edit them.</p>
            <Button 
              variant="outline" 
              onClick={() => setLocation(`/platform-admin/${selectedBusiness.slug}`)}
            >
              Return to Business Details
            </Button>
          </CardContent>
        </Card>
      </>
    );
  };
  
  // Render the business list view
  const renderBusinessList = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Administration</h1>
          <p className="text-muted-foreground">
            Manage all businesses on the AppointEase platform
          </p>
        </div>
        <Button onClick={() => setLocation("/platform-admin/create")}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Business
        </Button>
      </div>
      
      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
          <h3 className="font-medium mb-1">Error loading businesses</h3>
          <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
          <p className="text-sm mt-2">
            This could be due to missing database columns if your schema has changed. Try running a database migration.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Businesses</CardTitle>
          <CardDescription>
            View and manage all businesses registered on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-sm items-center space-x-2 mb-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                className="pl-9 pr-8 border-muted-foreground/20 focus-visible:ring-primary/30"
                placeholder="Search by name, email, or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full p-0 hover:bg-muted" 
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredBusinesses && (
                <span>{filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'}</span>
              )}
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredBusinesses && filteredBusinesses.length > 0 ? (
            <div className="rounded-md border overflow-hidden">
              <Table className="w-full">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-semibold">Business Name</TableHead>
                    <TableHead className="font-semibold">Slug</TableHead>
                    <TableHead className="font-semibold">Domain</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Owner Email</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBusinesses.map((business, index) => (
                    <TableRow 
                      key={business.id}
                      className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                    >
                      <TableCell className="font-medium">
                        {business.name || "Unnamed Business"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {business.slug || "No slug"}
                      </TableCell>
                      <TableCell>
                        {business.customDomain || "—"}
                      </TableCell>
                      <TableCell>
                        {renderSubscriptionStatus(business.subscriptionStatus)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {business.ownerEmail || "No email"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="default"
                          size="sm"
                          onClick={() => business.slug && handleManageBusiness(business.slug)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-5">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No businesses found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Try changing your search criteria or create a new business using the button above.
              </p>
              <Button 
                onClick={() => setLocation("/platform-admin/create")}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Business
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );

  // Create new business form
  const renderCreateForm = () => {
    const { toast } = useToast();
    
    // Form state
    const [formData, setFormData] = useState({
      businessName: '',
      businessSlug: '',
      email: '',
      password: '',
      phone: '',
      platformFeePercentage: 5
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form handling
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Auto-generate slug from business name
      if (name === 'businessName') {
        const slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        setFormData(prev => ({
          ...prev,
          businessSlug: slug
        }));
      }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (isSubmitting) return;
      
      setIsSubmitting(true);
      
      try {
        const response = await apiRequest("POST", "/api/users", formData);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create business: ${response.status} ${errorText}`);
        }
        
        // Invalidate businesses query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["/api/admin/businesses"] });
        
        // Show success toast
        toast({
          title: "Business created successfully",
          description: `${formData.businessName} has been created and is ready to use.`,
          variant: "default",
        });
        
        // Redirect to the business list
        setLocation("/platform-admin");
      } catch (error) {
        console.error("Error creating business:", error);
        
        // Show error toast
        toast({
          title: "Failed to create business",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    };
    
    return (
      <>
        <div className="flex items-center space-x-2 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/platform-admin")}
          >
            <span className="mr-1">←</span> Back to Businesses
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-6">Create New Business</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Enter the details for the new business</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="businessName">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="Salon Elegante"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="businessSlug">
                    Business Slug <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="businessSlug"
                    name="businessSlug"
                    value={formData.businessSlug}
                    onChange={handleChange}
                    placeholder="salon-elegante"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for the URL: appointease.com/{formData.businessSlug}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="business@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="phone">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="platformFeePercentage">
                    Platform Fee Percentage <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="platformFeePercentage"
                    name="platformFeePercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.platformFeePercentage}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentage of payments that will be collected as platform fee.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setLocation("/platform-admin")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Business'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </>
    );
  };

  return (
    <div className="container mx-auto py-6">
      {isBusinessDetails 
        ? renderBusinessDetails()
        : isEditMode 
          ? renderEditForm() 
          : isCreating
            ? renderCreateForm()
            : renderBusinessList()
      }
    </div>
  );
}