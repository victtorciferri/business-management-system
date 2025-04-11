import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays, startOfDay, setHours, setMinutes, addMinutes } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftIcon, CalendarIcon, ClockIcon } from "lucide-react";
import { type Service, type Customer, type Appointment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  phone: z.string().min(7, { message: "Please enter a valid phone number" }),
  notes: z.string().optional(),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string({ required_error: "Please select a time" }),
});

export default function BookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Get serviceId from URL query parameter
  const params = new URLSearchParams(location.search);
  const serviceId = parseInt(params.get("serviceId") || "0");
  
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
  
  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      notes: "",
    }
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedService) {
      toast({
        title: "Error",
        description: "Please select a service",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create or get customer
      const customerResponse = await apiRequest("POST", "/api/customers", {
        userId: 1, // Use business owner's ID for all customer-created appointments
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        notes: values.notes || ""
      });
      
      const customer: Customer = await customerResponse.json();
      
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
        customerId: customer.id,
        serviceId: selectedService.id,
        date: appointmentDate.toISOString(),
        duration: selectedService.duration,
        status: "scheduled",
        notes: values.notes || "",
        reminderSent: false,
        paymentStatus: "pending"
      });
      
      const appointment: Appointment = await appointmentResponse.json();
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({
        queryKey: ['/api/appointments']
      });
      
      toast({
        title: "Success!",
        description: "Your appointment has been booked successfully."
      });
      
      // Redirect to the appointment details or thank you page
      navigate(`/customer-portal/my-appointments?email=${encodeURIComponent(values.email)}`);
      
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
        <Button variant="ghost" size="icon" onClick={() => navigate("/customer-portal")} className="mr-2">
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
          <Button onClick={() => navigate("/customer-portal/services")}>
            View Services
          </Button>
        </div>
      ) : (
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
              <CardTitle>Your Information</CardTitle>
              <CardDescription>Provide your details to book the appointment</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+56 9 XXXX XXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full"
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