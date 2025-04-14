import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  AlertCircleIcon, 
  RefreshCwIcon,
  UserIcon
} from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import CustomerPortalLayout from "@/components/customer-portal/layout";

// Define the email schema for validation
const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" })
});

export default function ZeroFriction() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const [email, setEmail] = useState("");
  const [customerData, setCustomerData] = useState<any>(null);
  
  // Get businessId from URL params
  const params = new URLSearchParams(window.location.search);
  const businessId = params.get("businessId") ? parseInt(params.get("businessId")!) : 1;
  const emailFromParams = params.get("email");
  
  // Check for saved email in cookies
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const savedEmail = getCookie('appointease_email');
    if (savedEmail) {
      setEmail(savedEmail);
      form.setValue('email', savedEmail);
      // Optional: auto-lookup if email found in cookie
      //handleSubmit({ email: savedEmail });
    }
  }, []);
  
  // Initialize the form with react-hook-form
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: ""
    }
  });
  
  // Handle form submission
  const handleSubmit = async (values: z.infer<typeof emailSchema>) => {
    try {
      setIsLoading(true);
      setEmail(values.email);
      setHasSearched(true);
      
      // Use the businessId from URL params, already defined above
      
      // Call the zero-friction API endpoint
      const response = await apiRequest("POST", "/api/zero-friction-lookup", {
        email: values.email,
        businessId
      });
      
      if (response.status === 429) {
        // Handle rate limiting
        const data = await response.json();
        setIsRateLimited(true);
        setRetryAfter(data.retryAfter || 60);
        toast({
          title: "Too many requests",
          description: data.message,
          variant: "destructive"
        });
        return;
      }
      
      const data = await response.json();
      setCustomerData(data);
      
      // Optionally save email in local storage for 24 hours
      if (data.customerExists && data.appointments.length > 0) {
        localStorage.setItem('appointease_email', values.email);
        localStorage.setItem('appointease_email_expires', String(Date.now() + 24 * 60 * 60 * 1000));
      }
      
    } catch (error) {
      console.error("Error looking up appointments:", error);
      toast({
        title: "Error",
        description: "There was an error looking up your appointments.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format user information
  const getUserDisplay = () => {
    if (!customerData) return null;
    
    if (customerData.customerInitials) {
      return (
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-medium">
            {customerData.customerInitials}
          </div>
          {customerData.customerFirstName && (
            <span>Hello, {customerData.customerFirstName}</span>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  // Format retry message for rate limiting
  const getRetryMessage = () => {
    if (!isRateLimited) return null;
    
    const minutes = Math.floor(retryAfter / 60);
    const seconds = retryAfter % 60;
    
    if (minutes > 0) {
      return `Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}${seconds > 0 ? ` and ${seconds} second${seconds > 1 ? 's' : ''}` : ''}`;
    }
    
    return `Please try again in ${seconds} second${seconds > 1 ? 's' : ''}`;
  };
  
  // Get the business data to pass to the layout
  const { data: businessData } = useQuery<{
    business: any;
    services: any[];
  }>({
    queryKey: ['/api/business-data/salonelegante'],
    enabled: true
  });
  
  return (
    <CustomerPortalLayout 
      business={businessData?.business} 
      businessId={businessId?.toString()} 
      accessToken={null}
    >
      <div className="mb-8 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(businessId ? `/customer-portal?businessId=${businessId}` : "/customer-portal")} 
          className="mr-2"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quick Appointment Lookup</h1>
          <p className="text-muted-foreground">Check your upcoming appointments instantly</p>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Enter Your Email</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input 
                        placeholder="Enter your email address" 
                        {...field} 
                        type="email"
                        disabled={isLoading || isRateLimited}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                disabled={isLoading || isRateLimited}
              >
                {isLoading ? (
                  <>
                    <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Find Appointments"
                )}
              </Button>
            </form>
            
            {isRateLimited && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                <AlertCircleIcon className="inline-block mr-1 h-4 w-4" />
                <span>{getRetryMessage()}</span>
              </div>
            )}
          </Form>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-10 w-full" />
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : hasSearched && customerData ? (
        customerData.appointments.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Your Upcoming Appointments</span>
              </CardTitle>
              {getUserDisplay()}
              <p className="text-sm text-muted-foreground">
                Here are your upcoming appointments
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerData.appointments.map((appointment: any) => {
                    return (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">{appointment.serviceName}</TableCell>
                        <TableCell>{appointment.formattedDate}</TableCell>
                        <TableCell>{appointment.formattedTime}</TableCell>
                        <TableCell>{appointment.duration} mins</TableCell>
                        <TableCell>{appointment.businessName}</TableCell>
                        <TableCell>
                          {appointment.status === 'scheduled' && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">Scheduled</span>
                          )}
                          {appointment.status === 'completed' && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Completed</span>
                          )}
                          {appointment.status === 'cancelled' && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Cancelled</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              <div className="mt-6 flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(businessId 
                    ? `/customer-portal/new-appointment?businessId=${businessId}` 
                    : "/customer-portal/new-appointment")}
                >
                  Book Another Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <CalendarIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No Upcoming Appointments</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any upcoming appointments scheduled with us.
            </p>
            <Button onClick={() => navigate(businessId 
              ? `/customer-portal/new-appointment?businessId=${businessId}` 
              : "/customer-portal/new-appointment")}>
              Book Your First Appointment
            </Button>
          </div>
        )
      ) : !hasSearched ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <UserIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">Quick & Easy Access</h3>
          <p className="text-muted-foreground mb-4">
            Enter your email above to instantly view your upcoming appointments.
            <br />No password required!
          </p>
        </div>
      ) : null}
    </CustomerPortalLayout>
  );
}