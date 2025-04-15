import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { AlertCircle, ArrowLeft, Building, Edit, Eye, Search, Users } from "lucide-react";
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
                              >
                                <Eye className="h-4 w-4" />
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
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-blue-500/10 rounded-full">
                          <Building className="h-5 w-5 text-blue-700" />
                        </div>
                        <span className="text-sm font-medium text-blue-900">Total Businesses</span>
                      </div>
                      <div className="text-3xl font-bold mt-2 text-blue-900">
                        {businesses ? businesses.length : 0}
                      </div>
                    </div>
                    {businesses && businesses.length > 0 && (
                      <div className="h-16 w-16 flex items-center justify-center bg-blue-500/10 rounded-full">
                        <span className="text-lg font-bold text-blue-700">{businesses.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-green-500/10 rounded-full">
                          <Users className="h-5 w-5 text-green-700" />
                        </div>
                        <span className="text-sm font-medium text-green-900">Total Customers</span>
                      </div>
                      <div className="text-3xl font-bold mt-2 text-green-900">
                        {isLoading ? (
                          <div className="h-8 w-20 animate-pulse bg-green-200/50 rounded"></div>
                        ) : (
                          <div className="flex items-center">
                            <span>-</span>
                            <span className="text-xs text-green-700 ml-2">Coming soon</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="h-16 w-16 flex items-center justify-center bg-green-500/10 rounded-full">
                      <span className="text-green-700">
                        <Users className="h-8 w-8 opacity-70" />
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-purple-500/10 rounded-full">
                          <div className="h-5 w-5 flex items-center justify-center text-purple-700 font-bold">$</div>
                        </div>
                        <span className="text-sm font-medium text-purple-900">Platform Revenue</span>
                      </div>
                      <div className="text-3xl font-bold mt-2 text-purple-900">
                        {isLoading ? (
                          <div className="h-8 w-20 animate-pulse bg-purple-200/50 rounded"></div>
                        ) : (
                          <div className="flex items-center">
                            <span>-</span>
                            <span className="text-xs text-purple-700 ml-2">Coming soon</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="h-16 w-16 flex items-center justify-center bg-purple-500/10 rounded-full">
                      <span className="text-lg font-bold text-purple-700">$</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-amber-500/10 rounded-full">
                          <div className="h-5 w-5 flex items-center justify-center text-amber-700 font-bold">%</div>
                        </div>
                        <span className="text-sm font-medium text-amber-900">Average Fee</span>
                      </div>
                      {isLoading ? (
                        <div className="h-8 w-20 animate-pulse bg-amber-200/50 rounded mt-2"></div>
                      ) : businesses && businesses.length > 0 ? (
                        <div className="text-3xl font-bold mt-2 text-amber-900">
                          {(businesses.reduce((sum, b) => sum + (b.platformFeePercentage || 0), 0) / businesses.length).toFixed(2)}%
                        </div>
                      ) : (
                        <div className="text-3xl font-bold mt-2 text-amber-900">
                          0.00%
                        </div>
                      )}
                    </div>
                    <div className="h-16 w-16 flex items-center justify-center bg-amber-500/10 rounded-full">
                      <span className="text-lg font-bold text-amber-700">
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