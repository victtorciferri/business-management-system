import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";
import { Appointment, Customer, Service, insertAppointmentSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, set } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AppointmentFormProps {
  userId: number;
  initialDate?: Date;
  existingAppointment?: Appointment | null;
  onSubmitSuccess?: () => void;
}

// Extend the appointment schema for the form
const formSchema = z.object({
  userId: z.number(),
  customerId: z.string().min(1, { message: "Customer is required" }),
  serviceId: z.string().min(1, { message: "Service is required" }),
  staffId: z.string().default("none"),
  date: z.date({ required_error: "Date is required" }),
  time: z.string({ required_error: "Time is required" }),
  notes: z.string().optional(),
  sendReminder: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export function AppointmentForm({
  userId,
  initialDate = new Date(),
  existingAppointment,
  onSubmitSuccess,
}: AppointmentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Format initial time
  const getInitialTime = () => {
    if (existingAppointment) {
      const date = new Date(existingAppointment.date);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Default to current hour, rounded to next 15 minutes
    const now = new Date();
    const minutes = Math.ceil(now.getMinutes() / 15) * 15;
    return `${now.getHours().toString().padStart(2, '0')}:${minutes === 60 ? '00' : minutes.toString().padStart(2, '0')}`;
  };

  // Initialize form with default values or existing appointment
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: userId,
      customerId: existingAppointment?.customerId.toString() || "",
      serviceId: existingAppointment?.serviceId.toString() || "",
      staffId: existingAppointment?.staffId?.toString() || "none",
      date: existingAppointment ? new Date(existingAppointment.date) : initialDate,
      time: getInitialTime(),
      notes: existingAppointment?.notes || "",
      sendReminder: existingAppointment ? (existingAppointment.reminderSent || false) : true,
    },
  });

  // Fetch customers, services, and staff members
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: [`/api/customers?userId=${userId}`],
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: [`/api/services?userId=${userId}`],
  });
  
  // Fetch staff members
  const { data: staffMembers = [] } = useQuery<any[]>({
    queryKey: [`/api/staff?userId=${userId}`],
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      // Combine date and time
      const [hours, minutes] = values.time.split(':').map(Number);
      const appointmentDate = set(values.date, { hours, minutes });
      
      // Determine duration from selected service
      const service = services.find(s => s.id === parseInt(values.serviceId));
      const duration = service?.duration || 60;
      
      const appointmentData = {
        userId: values.userId,
        customerId: parseInt(values.customerId),
        serviceId: parseInt(values.serviceId),
        staffId: values.staffId && values.staffId !== "none" ? parseInt(values.staffId) : null,
        date: appointmentDate.toISOString(),
        duration,
        status: "scheduled",
        notes: values.notes || "",
        reminderSent: false,
        paymentStatus: "pending",
      };
      
      if (existingAppointment) {
        // Update existing appointment
        await apiRequest("PUT", `/api/appointments/${existingAppointment.id}`, appointmentData);
        toast({
          title: "Appointment updated",
          description: "The appointment has been updated successfully.",
        });
      } else {
        // Create new appointment
        try {
          const response = await apiRequest("POST", "/api/appointments", appointmentData);
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Unknown error');
          }
          
          toast({
            title: "Appointment created",
            description: "New appointment has been scheduled.",
          });
        } catch (error: any) {
          console.error("Appointment creation error details:", error, appointmentData);
          throw error; // Re-throw to be caught by the outer catch block
        }
      }
      
      // Send email reminder if requested
      if (values.sendReminder) {
        // Get the appointment ID - either the existing one or the newly created one
        let appointmentId;
        
        if (existingAppointment) {
          // For existing appointments
          appointmentId = existingAppointment.id;
        } else {
          // For newly created appointments, we need to use the response from the create operation
          // The appointment ID is now stored in the response from the create request
          appointmentId = appointment.id;
        }
        
        if (appointmentId && (!existingAppointment || !existingAppointment.reminderSent)) {
          // In a real application, we would schedule this for later
          // For the MVP, we'll just call the API to simulate sending immediately
          console.log("Sending reminder for appointment ID:", appointmentId);
          await apiRequest("POST", "/api/send-reminder", { appointmentId });
        }
      }
      
      // Invalidate appointments query to refresh the data
      queryClient.invalidateQueries({
        queryKey: [`/api/appointments`],
      });
      
      // Call success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      console.error("Appointment submission error:", error);
      
      let errorMessage = "Failed to save the appointment. Please try again.";
      if (error.message) {
        errorMessage = error.message;
      }
      
      // If error contains detailed validation errors, display them
      if (error.errors) {
        errorMessage += ": " + Object.values(error.errors).join(", ");
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <h3 className="text-lg font-medium mb-4">
        {existingAppointment ? "Edit Appointment" : "New Appointment"}
      </h3>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem 
                      key={customer.id} 
                      value={customer.id.toString()}
                    >
                      {customer.firstName} {customer.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="serviceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem 
                      key={service.id} 
                      value={service.id.toString()}
                    >
                      {service.name} ({service.duration}m)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <TimePicker 
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add any special notes or requests"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="staffId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Staff Member</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No staff assigned</SelectItem>
                  {staffMembers.map((staff) => (
                    <SelectItem 
                      key={staff.id} 
                      value={staff.id.toString()}
                    >
                      {staff.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="sendReminder"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Send email reminder</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Send a reminder email 24 hours before the appointment.
                </p>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline"
            onClick={onSubmitSuccess}
          >
            Cancel
          </Button>
          <Button type="submit">
            {existingAppointment ? "Update Appointment" : "Save Appointment"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
