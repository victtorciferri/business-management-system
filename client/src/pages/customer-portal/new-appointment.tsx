import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays, startOfDay, setHours, setMinutes, addMinutes } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftIcon, CalendarIcon, ClockIcon, UserIcon, CheckIcon, LoaderIcon } from "lucide-react";
import { type Service, type Customer, type Appointment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define email schema for the first step
const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" })
});

// Define customer info schema for new customers
const customerInfoSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  phone: z.string().min(7, { message: "Please enter a valid phone number" })
});

// Define appointment schema for the final step
const appointmentSchema = z.object({
  serviceId: z.string().min(1, { message: "Please select a service" }),
  staffId: z.string().min(1, { message: "Please select a staff member" }),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string({ required_error: "Please select a time" }),
  notes: z.string().optional()
});

// Define the steps of the booking process
type BookingStep = 'email-check' | 'customer-info' | 'appointment-details';

export default function NewAppointment() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<BookingStep>('email-check');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("token");
  const businessId = params.get("businessId") ? parseInt(params.get("businessId")!) : 1;
  
  // Email form for the first step
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: ""
    }
  });
  
  // Customer info form for new customers
  const customerForm = useForm<z.infer<typeof customerInfoSchema>>({
    resolver: zodResolver(customerInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: ""
    }
  });
  
  // Appointment form for the final step
  const appointmentForm = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      serviceId: "",
      staffId: "",
      notes: ""
    }
  });

  // Query to fetch services
  const { data: services } = useQuery({
    queryKey: ['/api/services'],
    enabled: true
  });
  
  // Query to fetch staff members
  const { data: staff } = useQuery({
    queryKey: ['/api/staff'],
    enabled: currentStep === 'appointment-details'
  });
  
  // Query to fetch appointments for time slot availability
  const { data: appointments } = useQuery({
    queryKey: ['/api/appointments'],
    enabled: !!selectedDate && !!selectedService && !!selectedStaff
  });
  
  // Set service ID effect
  useEffect(() => {
    if (services && services.length > 0) {
      // Select the first service by default if none is selected
      if (!selectedService) {
        setSelectedService(services[0]);
        appointmentForm.setValue('serviceId', services[0].id.toString());
      }
    }
  }, [services, selectedService, appointmentForm]);
  
  // Set staff ID effect
  useEffect(() => {
    if (staff && staff.length > 0 && !selectedStaff) {
      setSelectedStaff(staff[0].id.toString());
      appointmentForm.setValue('staffId', staff[0].id.toString());
    }
  }, [staff, selectedStaff, appointmentForm]);
  
  // Generate available time slots based on selected date, service, and staff
  useEffect(() => {
    if (selectedDate && selectedService && selectedStaff) {
      const serviceDuration = selectedService.duration;
      const staffId = parseInt(selectedStaff);
      
      // Filter appointments for selected date and staff
      const existingAppointmentsOnDate = appointments?.filter(
        (app: Appointment) => {
          const appDate = new Date(app.date);
          return format(appDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') && 
                 app.staffId === staffId;
        }
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
  }, [selectedDate, appointments, selectedService, selectedStaff]);
  
  // Handle email submission to check if customer exists
  const onSubmitEmail = async (data: z.infer<typeof emailSchema>) => {
    setIsCheckingEmail(true);
    try {
      const response = await apiRequest("POST", "/api/check-customer-exists", {
        email: data.email,
        businessId: businessId
      });
      
      const responseData = await response.json();
      
      if (responseData.exists) {
        // Customer exists, save data and move to appointment details
        setCustomer(responseData.customer);
        setCurrentStep('appointment-details');
        toast({
          title: "Welcome back!",
          description: "We found your account. You can proceed with booking your appointment."
        });
      } else {
        // Customer doesn't exist, move to customer info form
        customerForm.setValue('email', data.email);
        setCurrentStep('customer-info');
      }
    } catch (error) {
      console.error("Error checking customer email:", error);
      toast({
        title: "Error",
        description: "There was a problem checking your email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCheckingEmail(false);
    }
  };
  
  // Handle new customer information submission
  const onSubmitCustomerInfo = async (data: z.infer<typeof customerInfoSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/customers", {
        userId: businessId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        notes: ""
      });
      
      const newCustomer = await response.json();
      setCustomer(newCustomer);
      setCurrentStep('appointment-details');
      
      toast({
        title: "Account created",
        description: "Your profile has been created. Now you can book your appointment."
      });
    } catch (error) {
      console.error("Error creating customer:", error);
      toast({
        title: "Error",
        description: "There was a problem creating your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle appointment submission
  const onSubmitAppointment = async (data: z.infer<typeof appointmentSchema>) => {
    if (!customer) {
      toast({
        title: "Error",
        description: "Customer information is missing. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const service = services?.find((s: Service) => s.id.toString() === data.serviceId);
      
      if (!service) {
        throw new Error("Selected service not found");
      }
      
      // Parse the time and create a full date object
      const [hours, minutes] = data.time.split(':');
      const [hourValue, meridiem] = hours.split(' ');
      let hour = parseInt(hourValue);
      
      if (meridiem && meridiem.toLowerCase() === 'pm' && hour < 12) {
        hour += 12;
      } else if (meridiem && meridiem.toLowerCase() === 'am' && hour === 12) {
        hour = 0;
      }
      
      const appointmentDate = new Date(data.date);
      appointmentDate.setHours(hour);
      appointmentDate.setMinutes(parseInt(minutes || "0"));
      
      // Create appointment
      const appointmentResponse = await apiRequest("POST", "/api/appointments", {
        userId: businessId,
        customerId: customer.id,
        serviceId: parseInt(data.serviceId),
        staffId: parseInt(data.staffId),
        date: appointmentDate.toISOString(),
        duration: service.duration,
        status: "scheduled",
        notes: data.notes || "",
        reminderSent: false,
        paymentStatus: "pending"
      });
      
      const appointment = await appointmentResponse.json();
      
      // Create a customer access token if needed
      if (!accessToken) {
        const tokenResponse = await apiRequest("POST", "/api/customer-access-token", {
          email: customer.email,
          businessId: businessId,
          sendEmail: true
        });
        
        const tokenData = await tokenResponse.json();
        
        // Redirect to the appointment details page with the new token
        toast({
          title: "Success!",
          description: "Your appointment has been booked successfully. An email has been sent with your booking details."
        });
        
        navigate(`/customer-portal/my-appointments?token=${tokenData.token}&businessId=${businessId}`);
      } else {
        // Use existing token for redirect
        toast({
          title: "Success!",
          description: "Your appointment has been booked successfully."
        });
        
        navigate(`/customer-portal/my-appointments?token=${accessToken}&businessId=${businessId}`);
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['/api/appointments']
      });
      
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Error",
        description: "There was a problem booking your appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(`/customer-portal?businessId=${businessId}`)} 
          className="mr-2"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Book an Appointment</h1>
          <p className="text-muted-foreground">
            Follow the steps below to schedule your appointment
          </p>
        </div>
      </div>
      
      {/* Booking progress indicator */}
      <div className="mb-10">
        <div className="w-full flex items-center justify-center">
          <div className="flex items-center w-full max-w-3xl">
            <div className={`flex-1 flex flex-col items-center ${currentStep === 'email-check' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 ${currentStep === 'email-check' ? 'border-primary bg-primary/10' : 'border-muted'}`}>
                <UserIcon className="h-5 w-5" />
              </div>
              <span className="text-sm">Email Check</span>
            </div>
            
            <div className={`w-20 h-[2px] ${currentStep === 'email-check' ? 'bg-muted' : 'bg-primary'}`} />
            
            <div className={`flex-1 flex flex-col items-center ${currentStep === 'customer-info' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 ${currentStep === 'customer-info' ? 'border-primary bg-primary/10' : 'border-muted'}`}>
                <UserIcon className="h-5 w-5" />
              </div>
              <span className="text-sm">Your Info</span>
            </div>
            
            <div className={`w-20 h-[2px] ${currentStep === 'appointment-details' ? 'bg-primary' : 'bg-muted'}`} />
            
            <div className={`flex-1 flex flex-col items-center ${currentStep === 'appointment-details' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 ${currentStep === 'appointment-details' ? 'border-primary bg-primary/10' : 'border-muted'}`}>
                <CalendarIcon className="h-5 w-5" />
              </div>
              <span className="text-sm">Appointment</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Step 1: Email check */}
      {currentStep === 'email-check' && (
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Check Your Email</CardTitle>
              <CardDescription>
                Please enter your email to check if you've booked with us before
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-6">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your.email@example.com" 
                            type="email" 
                            {...field} 
                            disabled={isCheckingEmail}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isCheckingEmail}
                  >
                    {isCheckingEmail ? (
                      <>
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : "Continue"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Step 2: Customer information for new customers */}
      {currentStep === 'customer-info' && (
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>
                Please provide your details to create your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...customerForm}>
                <form onSubmit={customerForm.handleSubmit(onSubmitCustomerInfo)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={customerForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="First Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={customerForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Last Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={customerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your.email@example.com"
                            type="email"
                            {...field}
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={customerForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+56 9 XXXX XXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep('email-check')}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : "Continue"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Step 3: Appointment details */}
      {currentStep === 'appointment-details' && (
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Select Date & Time
              </CardTitle>
              <CardDescription>Choose when you'd like to schedule your appointment</CardDescription>
              
              {/* Show customer info */}
              {customer && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
                  <CheckIcon className="mr-2 h-5 w-5 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-medium">Booking as:</span> {customer.firstName} {customer.lastName} ({customer.email})
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...appointmentForm}>
                <form onSubmit={appointmentForm.handleSubmit(onSubmitAppointment)} className="space-y-6">
                  <div className="grid gap-4">
                    <FormField
                      control={appointmentForm.control}
                      name="serviceId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              const service = services?.find((s: Service) => s.id.toString() === value);
                              setSelectedService(service || null);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {services?.map((service: Service) => (
                                <SelectItem 
                                  key={service.id} 
                                  value={service.id.toString()}
                                >
                                  {service.name} - ${service.price} ({service.duration} min)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={appointmentForm.control}
                      name="staffId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Staff Member</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedStaff(value);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a staff member" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {staff?.map((s: any) => (
                                <SelectItem 
                                  key={s.id} 
                                  value={s.id.toString()}
                                >
                                  {s.firstName} {s.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        appointmentForm.setValue('date', date as Date, { shouldValidate: true });
                      }}
                      disabled={(date) => date < new Date() || date > addDays(new Date(), 60)}
                      className="rounded-md border mx-auto"
                    />
                  </div>
                  
                  {selectedDate && (
                    <div>
                      <Label className="mb-2 flex items-center">
                        <ClockIcon className="mr-2 h-4 w-4" />
                        Available Time Slots
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableTimes.length > 0 ? (
                          availableTimes.map((time) => (
                            <Button
                              key={time}
                              type="button"
                              variant={appointmentForm.getValues("time") === time ? "default" : "outline"}
                              className="text-sm"
                              onClick={() => appointmentForm.setValue("time", time, { shouldValidate: true })}
                            >
                              {time}
                            </Button>
                          ))
                        ) : (
                          <p className="text-muted-foreground col-span-3 text-center py-4">
                            No available times for the selected date and staff.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <FormField
                    control={appointmentForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special requests or information we should know"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (customer) {
                          setCurrentStep('email-check');
                        } else {
                          setCurrentStep('customer-info');
                        }
                      }}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit"
                      disabled={
                        isSubmitting || 
                        !selectedDate || 
                        !appointmentForm.getValues("time") ||
                        !appointmentForm.getValues("serviceId") ||
                        !appointmentForm.getValues("staffId")
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                          Booking...
                        </>
                      ) : "Book Appointment"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <div>
            {/* Selected service details */}
            {selectedService && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Selected Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Service:</span>
                      <span>{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Duration:</span>
                      <span>{selectedService.duration} minutes</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Price:</span>
                      <span>${selectedService.price}</span>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                      {selectedService.description}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Booking policy information */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <span className="text-xs">i</span>
                    </div>
                    Availability
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We offer appointments Monday through Saturday. Sunday hours are by special arrangement only.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <span className="text-xs">i</span>
                    </div>
                    Duration
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Please arrive 10 minutes before your scheduled appointment. Services begin and end on time to accommodate all clients.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <span className="text-xs">i</span>
                    </div>
                    Cancellation Policy
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We kindly request 24 hours notice for cancellations. Late cancellations may incur a fee of 50% of the service price.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <span className="text-xs">i</span>
                    </div>
                    Confirmation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You'll receive a confirmation email after booking. We'll also send a reminder 24 hours before your appointment.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}