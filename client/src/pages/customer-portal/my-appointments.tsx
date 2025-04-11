import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "wouter";
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
import { ArrowLeftIcon, CalendarIcon, CheckCircleIcon, ClockIcon, SendIcon } from "lucide-react";
import { type Appointment, type Service, type Customer } from "@shared/schema";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" })
});

export default function MyAppointments() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState<string>("");
  const [hasSearched, setHasSearched] = useState(false);
  
  const params = new URLSearchParams(location.search);
  const urlEmail = params.get("email");
  
  useEffect(() => {
    if (urlEmail) {
      setEmail(urlEmail);
      setHasSearched(true);
    }
  }, [urlEmail]);
  
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: urlEmail || ""
    }
  });
  
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ['/api/customers'],
    enabled: true
  });
  
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments'],
    enabled: true
  });
  
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services'],
    enabled: true
  });
  
  const isLoading = customersLoading || appointmentsLoading || servicesLoading;
  
  const onSubmit = (values: z.infer<typeof emailSchema>) => {
    setEmail(values.email);
    setHasSearched(true);
  };
  
  // Find the customer by email
  const customer = customers?.find((c: Customer) => c.email === email);
  
  // Find all appointments for this customer
  const customerAppointments = appointments?.filter(
    (a: Appointment) => customer && a.customerId === customer.id
  );
  
  // Function to display readable status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">Scheduled</span>;
      case 'completed':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Completed</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">{status}</span>;
    }
  };
  
  // Function to get service name by ID
  const getServiceName = (serviceId: number) => {
    const service = services?.find((s: Service) => s.id === serviceId);
    return service?.name || "Unknown service";
  };
  
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/customer-portal")} className="mr-2">
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
          <p className="text-muted-foreground">View and manage your scheduled appointments</p>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Find Your Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex space-x-2">
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">
                <SendIcon className="mr-2 h-4 w-4" />
                Find Appointments
              </Button>
            </form>
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
      ) : hasSearched ? (
        customerAppointments && customerAppointments.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Your Scheduled Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerAppointments.map((appointment: Appointment) => {
                    const appointmentDate = new Date(appointment.date);
                    return (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">{getServiceName(appointment.serviceId)}</TableCell>
                        <TableCell>{format(appointmentDate, 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{format(appointmentDate, 'h:mm a')}</TableCell>
                        <TableCell>{appointment.duration} mins</TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : email && !customer ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <SendIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No Customer Found</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't find a customer with the email address <span className="font-medium">{email}</span>.
            </p>
            <Button onClick={() => navigate("/customer-portal/book")}>
              Book Your First Appointment
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <CalendarIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No Appointments Found</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any appointments scheduled with us.
            </p>
            <Button onClick={() => navigate("/customer-portal/book")}>
              Book an Appointment
            </Button>
          </div>
        )
      ) : (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <CheckCircleIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">Find Your Appointments</h3>
          <p className="text-muted-foreground mb-4">
            Enter your email address above to view your appointments.
          </p>
        </div>
      )}
    </div>
  );
}