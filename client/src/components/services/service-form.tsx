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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Service } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { appointmentColors } from "@/utils/date-utils";

interface ServiceFormProps {
  userId: number;
  existingService?: Service | null;
  onSubmitSuccess?: () => void;
}

// Define valid service types
const ServiceTypeEnum = z.enum(["individual", "class"]);
type ServiceType = z.infer<typeof ServiceTypeEnum>;

// Service form schema
const formSchema = z.object({
  userId: z.number(),
  name: z.string().min(1, { message: "Service name is required" }),
  description: z.string().optional(),
  duration: z.string().min(1, { message: "Duration is required" }),
  price: z.string().min(1, { message: "Price is required" }),
  color: z.string().default("#06b6d4"),
  active: z.boolean().default(true),
  serviceType: ServiceTypeEnum.default("individual"),
  capacity: z.string().default("1")
    .refine(
      (val) => {
        // For class type, ensure capacity is at least 2
        const numVal = parseInt(val);
        return !isNaN(numVal) && numVal >= 1;
      },
      { message: "Capacity must be a valid number" }
    )
}).refine(
  (data) => {
    // For class type, require capacity to be at least 2
    if (data.serviceType === "class") {
      return parseInt(data.capacity) >= 2;
    }
    return true;
  },
  {
    message: "Class capacity must be at least 2",
    path: ["capacity"],
  }
);

type FormValues = z.infer<typeof formSchema>;

export function ServiceForm({
  userId,
  existingService,
  onSubmitSuccess,
}: ServiceFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Helper function to safely extract service type
  const getServiceType = (type: string | null | undefined): ServiceType => {
    if (type === "class" || type === "individual") {
      return type;
    }
    return "individual";
  };
  
  // Initialize form with default values or existing service
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: userId,
      name: existingService?.name || "",
      description: existingService?.description || "",
      duration: existingService ? existingService.duration.toString() : "60",
      price: existingService ? existingService.price.toString() : "",
      color: existingService?.color || "#06b6d4",
      // Use nullish coalescing to handle null or undefined
      active: existingService?.active ?? true,
      // Use the helper function to validate service type
      serviceType: getServiceType(existingService?.serviceType),
      capacity: existingService?.capacity ? existingService.capacity.toString() : "1",
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      // Create service data that exactly matches the expected schema format
      // The backend validates using the insertServiceSchema from shared/schema.ts
      // Numbers are expected as numbers, strings as strings
      const serviceData = {
        userId: values.userId,  // Already a number
        name: values.name,
        description: values.description || null,
        // Numeric fields - convert from strings appropriately
        duration: parseInt(values.duration),  // integer in database
        price: values.price,  // Keep as string for numeric type
        color: values.color,
        active: values.active,
        serviceType: values.serviceType,
        capacity: values.serviceType === "class" ? parseInt(values.capacity) : 1  // integer in database
      };
      
      console.log("Submitting service data:", serviceData);
      
      if (existingService) {
        // Update existing service
        const response = await apiRequest("PUT", `/api/services/${existingService.id}`, serviceData);
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || "Failed to update service");
        }
        
        toast({
          title: "Service updated",
          description: "The service has been updated successfully.",
        });
      } else {
        // Create new service
        const response = await apiRequest("POST", "/api/services", serviceData);
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || "Failed to create service");
        }
        
        toast({
          title: "Service created",
          description: "New service has been added to your offerings.",
        });
      }
      
      // Invalidate services query to refresh the data
      queryClient.invalidateQueries({
        queryKey: [`/api/services`],
      });
      
      // Call success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error("Service form submission error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save the service. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Color presets
  const colorPresets = [
    { name: "Cyan", value: "#06b6d4" },
    { name: "Green", value: "#22c55e" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Pink", value: "#ec4899" },
    { name: "Orange", value: "#f97316" },
    { name: "Red", value: "#ef4444" },
  ];

  return (
    <Form {...form}>
      <h3 className="text-lg font-medium mb-4">
        {existingService ? "Edit Service" : "New Service"}
      </h3>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full max-h-[calc(100vh-12rem)] overflow-y-auto pb-20 relative">
        {/* Main content container with improved responsiveness */}
        <div className="grid grid-cols-1 gap-6 w-full max-w-2xl mx-auto pb-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Name</FormLabel>
                <FormControl>
                  <Input placeholder="Yoga Class" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Brief description of the service"
                    className="resize-none"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Two columns for duration and price - responsive at different breakpoints */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="5"
                      step="5"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calendar Color</FormLabel>
                <FormControl>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                        style={{ 
                          borderLeftWidth: '6px', 
                          borderLeftColor: field.value 
                        }}
                      >
                        <div 
                          className="mr-2 h-4 w-4 rounded" 
                          style={{ backgroundColor: field.value }}
                        />
                        {colorPresets.find(c => c.value === field.value)?.name || "Custom"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <div className="grid grid-cols-3 gap-2">
                        {colorPresets.map(color => (
                          <div
                            key={color.value}
                            className="cursor-pointer rounded p-2 flex flex-col items-center hover:bg-gray-100"
                            onClick={() => field.onChange(color.value)}
                          >
                            <div 
                              className="h-6 w-6 rounded" 
                              style={{ backgroundColor: color.value }}
                            />
                            <div className="text-xs mt-1">{color.name}</div>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serviceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="individual">Individual Appointment</SelectItem>
                    <SelectItem value="class">Class/Group Session</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Individual appointments are for one customer at a time. Classes allow multiple attendees.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("serviceType") === "class" && (
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="2"
                      max="100"
                      step="1"
                      {...field}
                      value={field.value}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of attendees that can book this class (2-100).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active</FormLabel>
                  <FormDescription>
                    Service will be available for booking when active.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        {/* Fixed action buttons at the bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-3 px-4 flex justify-end gap-3 z-10">
          <Button 
            type="button" 
            variant="outline"
            onClick={onSubmitSuccess}
          >
            Cancel
          </Button>
          <Button type="submit">
            {existingService ? "Update Service" : "Save Service"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
