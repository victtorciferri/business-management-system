import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays, startOfDay, setHours, setMinutes, addMinutes } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftIcon, CalendarIcon, ClockIcon } from "lucide-react";
import { type Service, type Customer, type Appointment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CustomerCheck } from "@/components/appointments/customer-check";

const formSchema = z.object({
  notes: z.string().optional(),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string({ required_error: "Please select a time" }),
});

export default function BookAppointment() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [step, setStep] = useState<'customer-check' | 'booking-details'>('customer-check');
  
  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const serviceId = parseInt(params.get("serviceId") || "0");
  const accessToken = params.get("token");
  
  // Fetch the service details
  const { data: services } = useQuery({
    queryKey: ['/api/services'],
    enabled: true
  });
  
  // Set the selected service based on the serviceId
  useEffect(() => {
    if (services && serviceId) {
      const service = services.find((s: Service) => s.id === serviceId);
      if (service) {
        setSelectedService(service);
      }
    }
  }, [services, serviceId]);
  
  // Fetch existing appointments to avoid conflicts
  const { data: appointments } = useQuery({
    queryKey: ['/api/appointments'],
    enabled: !!selectedDate
  });
  
  // Generate available time slots based on selected date and service duration
  useEffect(() => {
    if (selectedDate && selectedService) {
      const serviceDuration = selectedService.duration;
      const existingAppointmentsOnDate = appointments?.filter(
        (app: Appointment) => format(new Date(app.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
      ) || [];
      
      // Business hours: 9 AM to 6 PM
      const businessStart = 9;
      const businessEnd = 18;
      
      const timeSlots: string[] = [];
      const date = startOfDay(selectedDate);
      
      // Generate times in 30-minute increments
      for (let hour = businessStart; hour < businessEnd; hour++) {
        for (let minute of [0, 30]) {
          const slotStart = setMinutes(setHours(date, hour), minute);
          const slotEnd = addMinutes(slotStart, serviceDuration);
          
          // Skip if this slot would end after business hours
          if (slotEnd.getHours() >= businessEnd && slotEnd.getMinutes() > 0) {
            continue;
          }
          
          // Check if this slot conflicts with existing appointments
          const hasConflict = existingAppointmentsOnDate.some((app: Appointment) => {
            const appStart = new Date(app.date);
            const appEnd = addMinutes(appStart, app.duration);
            
            return (
              (slotStart >= appStart && slotStart < appEnd) || // slot starts during existing appointment
              (slotEnd > appStart && slotEnd <= appEnd) || // slot ends during existing appointment
              (slotStart <= appStart && slotEnd >= appEnd) // slot encompasses existing appointment
            );
          });
          
          if (!hasConflict) {
            timeSlots.push(format(slotStart, 'h:mm a'));
          }
        }
      }
      
      setAvailableTimes(timeSlots);
    }
  }, [selectedDate, appointments, selectedService]);
  
  // Handle existing customer continuation
  const handleExistingCustomer = async (customer: any) => {
    try {
      // For existing customers, we use the ID if provided, otherwise look them up by email
      if (customer.id) {
        setCustomerData(customer);
        setStep('booking-details');
      } else {
        // Look up customer by email
        const response = await apiRequest("POST", "/api/check-customer-exists", {
          email: customer.email,
          businessId: 1 // Use business owner's ID
        });
        
        const data = await response.json();
        if (data.exists && data.customer) {
          setCustomerData(data.customer);
          setStep('booking-details');
        } else {
          toast({
            title: "Error",
            description: "Could not find customer information. Please try again.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error getting customer data:", error);
      toast({
        title: "Error",
        description: "There was a problem retrieving customer information.",
        variant: "destructive"
      });
    }
  };
  
  // Handle new customer data submission
  const handleNewCustomer = async (customerFormData: any) => {
    try {
      // Create new customer
      const customerResponse = await apiRequest("POST", "/api/customers", {
        userId: 1, // Use business owner's ID for all customer-created appointments
        firstName: customerFormData.firstName,
        lastName: customerFormData.lastName,
        email: customerFormData.email,
        phone: customerFormData.phone || "",
        notes: ""
      });
      
      const customer: Customer = await customerResponse.json();
      setCustomerData(customer);
      setStep('booking-details');
    } catch (error) {
      console.error("Error creating customer:", error);
      toast({
        title: "Error",
        description: "There was a problem creating your customer profile. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: "",
    }
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedService || !customerData) {
      toast({
        title: "Error",
        description: "Missing required information. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Parse the time and create a full date object
      const [hours, minutes] = values.time.split(':');
      const [hourValue, meridiem] = hours.split(' ');
      let hour = parseInt(hourValue);
      
      if (meridiem && meridiem.toLowerCase() === 'pm' && hour < 12) {
        hour += 12;
      } else if (meridiem && meridiem.toLowerCase() === 'am' && hour === 12) {
        hour = 0;
      }
      
      const appointmentDate = new Date(values.date);
      appointmentDate.setHours(hour);
      appointmentDate.setMinutes(parseInt(minutes || "0"));
      
      // Create appointment
      const appointmentResponse = await apiRequest("POST", "/api/appointments", {
        userId: 1, // Use business owner's ID
        customerId: customerData.id,
        serviceId: selectedService.id,
        date: appointmentDate.toISOString(),
        duration: selectedService.duration,
        status: "scheduled",
        notes: values.notes || "",
        reminderSent: false,
        paymentStatus: "pending"
      });
      
      const appointment: Appointment = await appointmentResponse.json();
      
      // Create a customer access token
      const tokenResponse = await apiRequest("POST", "/api/customer-access-token", {
        email: customerData.email,
        businessId: 1, // Use business owner's ID
        sendEmail: true // Send the access link via email
      });
      
      const tokenData = await tokenResponse.json();
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ['/api/appointments']
      });
      
      toast({
        title: "Success!",
        description: "Your appointment has been booked successfully. Check your email for access to your customer portal."
      });
      
      // Redirect to the appointment details page with access token
      // Use existing token if available, otherwise use the new one
      navigate(`/customer-portal/my-appointments?token=${accessToken || tokenData.token}`);
      
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Error",
        description: "There was a problem booking your appointment. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(accessToken ? `/customer-portal?token=${accessToken}` : "/customer-portal")} 
          className="mr-2"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Book an Appointment</h1>
          <p className="text-muted-foreground">
            {selectedService
              ? `Booking for ${selectedService.name} (${selectedService.duration} mins)`
              : "Select a service to begin booking"}
          </p>
        </div>
      </div>
      
      {!selectedService ? (
        <div className="flex flex-col items-center justify-center py-10">
          <p className="text-muted-foreground mb-4">Please select a service from our services page first.</p>
          <Button 
            onClick={() => navigate(
              accessToken 
                ? `/customer-portal/services?token=${accessToken}` 
                : "/customer-portal/services"
            )}
          >
            View Services
          </Button>
        </div>
      ) : step === 'customer-check' ? (
        // Step 1: Check if customer exists
        <div className="max-w-md mx-auto">
          <CustomerCheck 
            businessId={1} // Using business owner's ID
            onExistingCustomer={handleExistingCustomer}
            onNewCustomer={handleNewCustomer}
          />
        </div>
      ) : (
        // Step 2: Booking details after customer is identified
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Date & Time</CardTitle>
              <CardDescription>Choose when you'd like to schedule your appointment</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="mb-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date > addDays(new Date(), 60)}
                  className="rounded-md border mx-auto"
                />
              </div>
              
              {selectedDate && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <ClockIcon className="mr-2 h-4 w-4" />
                    Available Times
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimes.length > 0 ? (
                      availableTimes.map((time) => (
                        <Button
                          key={time}
                          variant={form.getValues("time") === time ? "default" : "outline"}
                          className="text-sm"
                          onClick={() => form.setValue("time", time, { shouldValidate: true })}
                        >
                          {time}
                        </Button>
                      ))
                    ) : (
                      <p className="text-muted-foreground col-span-3 text-center py-4">
                        No available times for this date.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription>
                {customerData && (
                  <div className="mt-2 p-3 bg-green-50 text-green-700 rounded-md">
                    Booking as: <span className="font-medium">{customerData.firstName} {customerData.lastName}</span> ({customerData.email})
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requests or Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any special requests or information we should know"
                            {...field}
                            className="resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormControl>
                          <Input {...field} type="hidden" value={selectedDate?.toISOString() || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4 flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setStep('customer-check')}
                    >
                      Back to Customer Info
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={!selectedDate || !form.getValues("time")}
                    >
                      Book Appointment
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}