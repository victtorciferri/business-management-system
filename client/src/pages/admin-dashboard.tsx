import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { useTheme } from "@/contexts/ThemeContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertCircle, 
  ArrowLeft, 
  Building, 
  Pencil, 
  Eye, 
  Search, 
  Users, 
  Palette,
  Save,
  Settings,
  Shield
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Customer,
  Appointment,
  Payment
} from "@shared/schema";

export default function AdminDashboard() {
  const [_, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("businesses");
  const [searchTerm, setSearchTerm] = useState("");
  // Define AdminBusiness type to match the API response
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
  
  const [filteredBusinesses, setFilteredBusinesses] = useState<AdminBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [platformFeePercentage, setPlatformFeePercentage] = useState<string>("2.00");
  const [editBusinessDialog, setEditBusinessDialog] = useState<boolean>(false);
  const [themeSettingsDialog, setThemeSettingsDialog] = useState<boolean>(false);
  const [currentEditBusiness, setCurrentEditBusiness] = useState<AdminBusiness | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    slug: "",
    customDomain: "",
    ownerEmail: "",
    platformFeePercentage: ""
  });

  // Fetch all businesses
  const { data: businesses, isLoading: isLoadingBusinesses, error: businessesError } = useQuery<AdminBusiness[]>({
    queryKey: ["/api/admin/businesses"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/businesses");
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching businesses:", errorText);
        throw new Error(`Failed to fetch businesses: ${response.status} ${errorText}`);
      }
      
      // Debug log to see the response
      const data = await response.json();
      console.log("Businesses API response:", data);
      return data;
    },
    retry: 1
  });

  // Fetch customers for a specific business
  const { data: customers, isLoading: isLoadingCustomers } = useQuery<Customer[]>({
    queryKey: ["/api/admin/customers", selectedBusinessId],
    queryFn: async () => {
      if (!selectedBusinessId) return [];
      const response = await apiRequest("GET", `/api/admin/customers?businessId=${selectedBusinessId}`);
      return response.json();
    },
    enabled: !!selectedBusinessId
  });

  // Fetch appointments for a specific business
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: ["/api/admin/appointments", selectedBusinessId],
    queryFn: async () => {
      if (!selectedBusinessId) return [];
      const response = await apiRequest("GET", `/api/admin/appointments?businessId=${selectedBusinessId}`);
      return response.json();
    },
    enabled: !!selectedBusinessId
  });

  // Fetch payments for a specific business
  const { data: payments, isLoading: isLoadingPayments } = useQuery<Payment[]>({
    queryKey: ["/api/admin/payments", selectedBusinessId],
    queryFn: async () => {
      if (!selectedBusinessId) return [];
      const response = await apiRequest("GET", `/api/admin/payments?businessId=${selectedBusinessId}`);
      return response.json();
    },
    enabled: !!selectedBusinessId
  });

  // Filter businesses based on search term
  useEffect(() => {
    if (businesses) {
      const filtered = businesses.filter(business => 
        business.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.slug?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBusinesses(filtered as any[]);
    }
  }, [businesses, searchTerm]);

  // Update platform fee percentage when a business is selected
  useEffect(() => {
    if (selectedBusinessId && businesses) {
      const business = businesses.find(b => b.id === selectedBusinessId);
      if (business && business.platformFeePercentage) {
        setPlatformFeePercentage(business.platformFeePercentage.toString());
      } else {
        setPlatformFeePercentage("2.00"); // Default
      }
    }
  }, [selectedBusinessId, businesses]);

  const handleBusinessSelect = (businessId: number) => {
    setSelectedBusinessId(businessId);
    setActiveTab("customers");
  };

  const handleUpdatePlatformFee = async () => {
    if (!selectedBusinessId) return;
    
    try {
      await apiRequest("PATCH", "/api/business/platform-fee", {
        userId: selectedBusinessId,
        platformFeePercentage: platformFeePercentage
      });
      
      // Show success message or refresh data
      alert("Platform fee updated successfully");
    } catch (error) {
      console.error("Error updating platform fee:", error);
      alert("Failed to update platform fee");
    }
  };

  const handleBackToBusinesses = () => {
    setSelectedBusinessId(null);
    setActiveTab("businesses");
  };
  
  const handleEditBusiness = (business: AdminBusiness) => {
    setCurrentEditBusiness(business);
    setEditFormData({
      name: business.name || "",
      slug: business.slug || "",
      customDomain: business.customDomain || "",
      ownerEmail: business.ownerEmail || "",
      platformFeePercentage: business.platformFeePercentage?.toString() || "2.00"
    });
    setEditBusinessDialog(true);
  };
  
  const handleThemeSettings = (businessId: number) => {
    setSelectedBusinessId(businessId);
    setThemeSettingsDialog(true);
  };
  
  const navigateToAdvancedThemeEditor = (businessId: number) => {
    setLocation(`/admin-theme-editor/${businessId}`);
  };
  
  // Helper function to handle navigation (replacing the navigate function)
  const navigate = (path: string) => {
    setLocation(path);
  };
  
  const handleSaveBusinessEdit = async () => {
    if (!currentEditBusiness) return;
    
    try {
      const response = await apiRequest("PUT", `/api/admin/business/${currentEditBusiness.id}`, {
        name: editFormData.name,
        slug: editFormData.slug,
        customDomain: editFormData.customDomain || null,
        ownerEmail: editFormData.ownerEmail,
        platformFeePercentage: parseFloat(editFormData.platformFeePercentage)
      });
      
      if (!response.ok) {
        throw new Error("Failed to update business");
      }
      
      // Invalidate and refresh the businesses query
      queryClient.invalidateQueries({queryKey: ["/api/admin/businesses"]});
      
      // Close the dialog
      setEditBusinessDialog(false);
    } catch (error) {
      console.error("Error updating business:", error);
      alert("Failed to update business: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };
  
  const [themeSettings, setThemeSettings] = useState({
    primary: "#4f46e5",
    variant: "professional",
    appearance: "system",
    radius: "8"
  });

  // Update theme settings when business is selected for editing
  useEffect(() => {
    if (selectedBusinessId && businesses) {
      const business = businesses.find(b => b.id === selectedBusinessId);
      if (business) {
        // These fields would ideally come from the business data
        // For now setting defaults if not available
        setThemeSettings({
          primary: "#4f46e5",
          variant: "professional",
          appearance: "system",
          radius: "8"
        });
      }
    }
  }, [selectedBusinessId, businesses]);

  const handleSaveThemeSettings = async () => {
    if (!selectedBusinessId) return;
    
    try {
      const response = await apiRequest("PUT", `/api/admin/business/${selectedBusinessId}/theme`, {
        primary: themeSettings.primary,
        variant: themeSettings.variant,
        appearance: themeSettings.appearance,
        radius: parseInt(themeSettings.radius)
      });
      
      if (!response.ok) {
        throw new Error("Failed to update theme settings");
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({queryKey: ["/api/admin/businesses"]});
      
      setThemeSettingsDialog(false);
      alert("Theme settings updated successfully");
    } catch (error) {
      console.error("Error updating theme settings:", error);
      alert("Failed to update theme settings: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${numAmount.toFixed(2)}`;
  };

  const calculateTotalRevenue = (payments: Payment[] | undefined) => {
    if (!payments || payments.length === 0) return 0;
    return payments.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0);
  };

  const calculatePlatformRevenue = (payments: Payment[] | undefined) => {
    if (!payments || payments.length === 0) return 0;
    return payments.reduce((sum, payment) => {
      const feeAmount = payment.platformFeeAmount 
        ? parseFloat(payment.platformFeeAmount.toString()) 
        : 0;
      return sum + feeAmount;
    }, 0);
  };

  const isLoading = isLoadingBusinesses || 
    (selectedBusinessId && (isLoadingCustomers || isLoadingAppointments || isLoadingPayments));

  // Get dark mode state to apply appropriate styling
  const { isDarkMode } = useTheme();

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage all businesses and access client information
          </p>
        </div>
      </div>
      
      {/* Edit Business Dialog */}
      <Dialog open={editBusinessDialog} onOpenChange={setEditBusinessDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Business Information</DialogTitle>
            <DialogDescription>
              Update the business details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="businessName" className="text-right">
                Name
              </Label>
              <Input
                id="businessName"
                value={editFormData.name}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="businessSlug" className="text-right">
                Slug
              </Label>
              <Input
                id="businessSlug"
                value={editFormData.slug}
                onChange={(e) => setEditFormData({...editFormData, slug: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ownerEmail" className="text-right">
                Owner Email
              </Label>
              <Input
                id="ownerEmail"
                type="email"
                value={editFormData.ownerEmail}
                onChange={(e) => setEditFormData({...editFormData, ownerEmail: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customDomain" className="text-right">
                Custom Domain
              </Label>
              <Input
                id="customDomain"
                value={editFormData.customDomain}
                onChange={(e) => setEditFormData({...editFormData, customDomain: e.target.value})}
                placeholder="example.com (optional)"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="platformFee" className="text-right">
                Platform Fee %
              </Label>
              <Input
                id="platformFee"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={editFormData.platformFeePercentage}
                onChange={(e) => setEditFormData({...editFormData, platformFeePercentage: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBusinessDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBusinessEdit} className="ml-2">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Theme Settings Dialog */}
      <Dialog open={themeSettingsDialog} onOpenChange={setThemeSettingsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Theme Settings</DialogTitle>
            <DialogDescription>
              Customize the business theme settings or use the advanced editor for more options.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="primaryColor" className="text-right">
                Primary Color
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={themeSettings.primary}
                  onChange={(e) => setThemeSettings({...themeSettings, primary: e.target.value})}
                  className="w-24 h-10"
                />
                <Input 
                  type="text" 
                  value={themeSettings.primary}
                  onChange={(e) => setThemeSettings({...themeSettings, primary: e.target.value})}
                  className="flex-1"
                  placeholder="HEX color code" 
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="themeVariant" className="text-right">
                Variant
              </Label>
              <Select 
                value={themeSettings.variant}
                onValueChange={(value) => setThemeSettings({...themeSettings, variant: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="tint">Tint</SelectItem>
                  <SelectItem value="vibrant">Vibrant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="appearance" className="text-right">
                Appearance
              </Label>
              <Select 
                value={themeSettings.appearance}
                onValueChange={(value) => setThemeSettings({...themeSettings, appearance: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select appearance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="borderRadius" className="text-right">
                Border Radius
              </Label>
              <Input
                id="borderRadius"
                type="number"
                min="0"
                max="24"
                step="1"
                value={themeSettings.radius}
                onChange={(e) => setThemeSettings({...themeSettings, radius: e.target.value})}
                className="col-span-3"
              />
            </div>
            <Separator className="my-2" />
            <div className="col-span-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => {
                  setThemeSettingsDialog(false);
                  if (selectedBusinessId) {
                    setLocation(`/admin-theme-editor/${selectedBusinessId}`);
                  }
                }}
              >
                <Palette className="h-4 w-4" />
                Open Advanced Theme Editor
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                The advanced editor provides more theme customization options including fonts, component styles, and layout settings.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setThemeSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveThemeSettings} className="ml-2">
              <Save className="h-4 w-4 mr-2" />
              Save Theme Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {businessesError && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
          <h3 className="font-medium mb-1">Error loading businesses</h3>
          <p className="text-sm">{businessesError instanceof Error ? businessesError.message : 'Unknown error occurred'}</p>
          <p className="text-sm mt-2">
            This could be due to missing database columns if your schema has changed. Try running a database migration.
          </p>
        </div>
      )}

      {selectedBusinessId ? (
        <>
          <div className="mb-6">
            <Button variant="outline" onClick={handleBackToBusinesses}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Businesses
            </Button>
          </div>

          {businesses && (
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {businesses.find(b => b.id === selectedBusinessId)?.name}
                  </CardTitle>
                  <CardDescription>
                    {businesses.find(b => b.id === selectedBusinessId)?.ownerEmail}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Business Details</h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        <span className="font-medium">Slug:</span> {businesses.find(b => b.id === selectedBusinessId)?.slug}
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        <span className="font-medium">Custom Domain:</span> {businesses.find(b => b.id === selectedBusinessId)?.customDomain || "None"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Subscription:</span> {businesses.find(b => b.id === selectedBusinessId)?.subscriptionStatus || "Free"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Platform Fee Settings</h3>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="text-sm font-medium mb-1 block">
                            Fee Percentage
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={platformFeePercentage}
                            onChange={(e) => setPlatformFeePercentage(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleUpdatePlatformFee}>
                          Update Fee
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="customers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customers</CardTitle>
                  <CardDescription>
                    View all customers for this business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingCustomers ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : customers && customers.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customers.map((customer) => (
                            <TableRow key={customer.id}>
                              <TableCell>{customer.id}</TableCell>
                              <TableCell>{customer.firstName} {customer.lastName}</TableCell>
                              <TableCell>{customer.email}</TableCell>
                              <TableCell>{customer.phone || "N/A"}</TableCell>
                              <TableCell>{formatDate(customer.createdAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No customers found for this business
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appointments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Appointments</CardTitle>
                  <CardDescription>
                    View all appointments for this business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingAppointments ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : appointments && appointments.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Customer ID</TableHead>
                            <TableHead>Service ID</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {appointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell>{appointment.id}</TableCell>
                              <TableCell>{formatDate(appointment.date)}</TableCell>
                              <TableCell>{appointment.status}</TableCell>
                              <TableCell>{appointment.paymentStatus}</TableCell>
                              <TableCell>{appointment.customerId}</TableCell>
                              <TableCell>{appointment.serviceId}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No appointments found for this business
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payments</CardTitle>
                  <CardDescription>
                    View all payments for this business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPayments ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : payments && payments.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{formatCurrency(calculateTotalRevenue(payments))}</div>
                            <p className="text-xs text-muted-foreground">Total Revenue</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{formatCurrency(calculatePlatformRevenue(payments))}</div>
                            <p className="text-xs text-muted-foreground">Platform Revenue</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{payments.length}</div>
                            <p className="text-xs text-muted-foreground">Total Transactions</p>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Fee %</TableHead>
                              <TableHead>Platform Fee</TableHead>
                              <TableHead>Business Amount</TableHead>
                              <TableHead>Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {payments.map((payment) => (
                              <TableRow key={payment.id}>
                                <TableCell>{payment.id}</TableCell>
                                <TableCell>{formatCurrency(payment.amount)}</TableCell>
                                <TableCell>{payment.status}</TableCell>
                                <TableCell>{payment.platformFeePercentage}%</TableCell>
                                <TableCell>{formatCurrency(payment.platformFeeAmount || 0)}</TableCell>
                                <TableCell>{formatCurrency(payment.businessAmount || 0)}</TableCell>
                                <TableCell>{formatDate(payment.createdAt)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No payments found for this business
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>
                    View business performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <h3 className="text-lg font-medium">Coming Soon</h3>
                      <p className="text-sm text-muted-foreground">
                        Detailed analytics will be available in a future update
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Businesses</CardTitle>
              <CardDescription>
                Manage all businesses on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex w-full max-w-sm items-center space-x-2 mb-6">
                <Input
                  type="search"
                  placeholder="Search businesses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="submit" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {isLoadingBusinesses ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredBusinesses && filteredBusinesses.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Business Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Custom Domain</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Platform Fee</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBusinesses.map((business) => (
                        <TableRow key={business.id}>
                          <TableCell>{business.id}</TableCell>
                          <TableCell>{business.name}</TableCell>
                          <TableCell>{business.ownerEmail}</TableCell>
                          <TableCell>{business.slug}</TableCell>
                          <TableCell>{business.customDomain || "None"}</TableCell>
                          <TableCell>{business.subscriptionStatus || "Free"}</TableCell>
                          <TableCell>{business.platformFeePercentage || "2.00"}%</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleBusinessSelect(business.id)}
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                                onClick={() => handleEditBusiness(business)}
                                title="Edit business"
                              >
                                <Pencil className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="bg-purple-50 hover:bg-purple-100 border-purple-200"
                                onClick={() => handleThemeSettings(business.id)}
                                title="Basic theme settings"
                              >
                                <Palette className="h-4 w-4 text-purple-600" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
                                onClick={() => navigateToAdvancedThemeEditor(business.id)}
                                title="Advanced theme editor"
                              >
                                <Settings className="h-4 w-4 text-indigo-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No businesses found
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className={`${isDarkMode ? 'bg-gradient-to-r from-blue-950/50 to-indigo-950/50' : 'bg-gradient-to-r from-blue-50 to-indigo-50'} p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-500/10'} rounded-full`}>
                          <Building className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`} />
                        </div>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>Total Businesses</span>
                      </div>
                      <div className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-blue-100' : 'text-blue-900'}`}>
                        {businesses ? businesses.length : 0}
                      </div>
                    </div>
                    {businesses && businesses.length > 0 && (
                      <div className={`h-16 w-16 flex items-center justify-center ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-500/10'} rounded-full`}>
                        <span className={`text-lg font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>{businesses.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className={`${isDarkMode ? 'bg-gradient-to-r from-green-950/50 to-emerald-950/50' : 'bg-gradient-to-r from-green-50 to-emerald-50'} p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 ${isDarkMode ? 'bg-green-500/20' : 'bg-green-500/10'} rounded-full`}>
                          <Users className={`h-5 w-5 ${isDarkMode ? 'text-green-400' : 'text-green-700'}`} />
                        </div>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-900'}`}>Total Customers</span>
                      </div>
                      <div className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-green-100' : 'text-green-900'}`}>
                        {isLoading ? (
                          <div className={`h-8 w-20 animate-pulse ${isDarkMode ? 'bg-green-800/30' : 'bg-green-200/50'} rounded`}></div>
                        ) : (
                          <div className="flex items-center">
                            <span>-</span>
                            <span className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-700'} ml-2`}>Coming soon</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`h-16 w-16 flex items-center justify-center ${isDarkMode ? 'bg-green-500/20' : 'bg-green-500/10'} rounded-full`}>
                      <span className={`${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                        <Users className="h-8 w-8 opacity-70" />
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className={`${isDarkMode ? 'bg-gradient-to-r from-purple-950/50 to-violet-950/50' : 'bg-gradient-to-r from-purple-50 to-violet-50'} p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-500/10'} rounded-full`}>
                          <div className={`h-5 w-5 flex items-center justify-center ${isDarkMode ? 'text-purple-400' : 'text-purple-700'} font-bold`}>$</div>
                        </div>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-900'}`}>Platform Revenue</span>
                      </div>
                      <div className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-purple-100' : 'text-purple-900'}`}>
                        {isLoading ? (
                          <div className={`h-8 w-20 animate-pulse ${isDarkMode ? 'bg-purple-800/30' : 'bg-purple-200/50'} rounded`}></div>
                        ) : (
                          <div className="flex items-center">
                            <span>-</span>
                            <span className={`text-xs ${isDarkMode ? 'text-purple-400' : 'text-purple-700'} ml-2`}>Coming soon</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`h-16 w-16 flex items-center justify-center ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-500/10'} rounded-full`}>
                      <span className={`text-lg font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>$</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className={`${isDarkMode ? 'bg-gradient-to-r from-amber-950/50 to-yellow-950/50' : 'bg-gradient-to-r from-amber-50 to-yellow-50'} p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 ${isDarkMode ? 'bg-amber-500/20' : 'bg-amber-500/10'} rounded-full`}>
                          <div className={`h-5 w-5 flex items-center justify-center ${isDarkMode ? 'text-amber-400' : 'text-amber-700'} font-bold`}>%</div>
                        </div>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-amber-300' : 'text-amber-900'}`}>Average Fee</span>
                      </div>
                      {isLoading ? (
                        <div className={`h-8 w-20 animate-pulse ${isDarkMode ? 'bg-amber-800/30' : 'bg-amber-200/50'} rounded mt-2`}></div>
                      ) : businesses && businesses.length > 0 ? (
                        <div className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-amber-100' : 'text-amber-900'}`}>
                          {(businesses.reduce((sum, b) => sum + (b.platformFeePercentage || 0), 0) / businesses.length).toFixed(2)}%
                        </div>
                      ) : (
                        <div className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-amber-100' : 'text-amber-900'}`}>
                          0.00%
                        </div>
                      )}
                    </div>
                    <div className={`h-16 w-16 flex items-center justify-center ${isDarkMode ? 'bg-amber-500/20' : 'bg-amber-500/10'} rounded-full`}>
                      <span className={`text-lg font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
                        {businesses && businesses.length > 0 
                          ? `${(businesses.reduce((sum, b) => sum + (b.platformFeePercentage || 0), 0) / businesses.length).toFixed(1)}%`
                          : "0%"
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}