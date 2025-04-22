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

// Service form schema
const formSchema = z.object({
  userId: z.number(),
  name: z.string().min(1, { message: "Service name is required" }),
  description: z.string().optional(),
  duration: z.string().min(1, { message: "Duration is required" })
    .transform(val => parseInt(val)),
  price: z.string().min(1, { message: "Price is required" })
    .transform(val => parseFloat(val)),
  color: z.string().default("#06b6d4"),
  active: z.boolean().default(true),
  serviceType: z.enum(["individual", "class"]).default("individual"),
  capacity: z.string().default("1")
    .transform(val => parseInt(val)),
});

type FormValues = z.infer<typeof formSchema>;

export function ServiceForm({
  userId,
  existingService,
  onSubmitSuccess,
}: ServiceFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
      active: existingService ? existingService.active : true,
      serviceType: existingService?.serviceType || "individual",
      capacity: existingService?.capacity ? existingService.capacity.toString() : "1",
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      const serviceData = {
        ...values,
        duration: parseInt(values.duration.toString()),
        price: parseFloat(values.price.toString()),
      };
      
      if (existingService) {
        // Update existing service
        await apiRequest("PUT", `/api/services/${existingService.id}`, serviceData);
        toast({
          title: "Service updated",
          description: "The service has been updated successfully.",
        });
      } else {
        // Create new service
        await apiRequest("POST", "/api/services", serviceData);
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
      toast({
        title: "Error",
        description: "Failed to save the service. Please try again.",
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
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Name</FormLabel>
              <FormControl>
                <Input placeholder="Haircut & Style" {...field} />
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
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                    onChange={(e) => field.onChange(e.target.value)}
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
        
        <div className="flex justify-end gap-3">
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
