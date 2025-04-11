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
import { useQueryClient } from "@tanstack/react-query";
import { Customer } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface CustomerFormProps {
  userId: number;
  existingCustomer?: Customer | null;
  onSubmitSuccess?: () => void;
}

// Customer form schema
const formSchema = z.object({
  userId: z.number(),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CustomerForm({
  userId,
  existingCustomer,
  onSubmitSuccess,
}: CustomerFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Initialize form with default values or existing customer
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: userId,
      firstName: existingCustomer?.firstName || "",
      lastName: existingCustomer?.lastName || "",
      email: existingCustomer?.email || "",
      phone: existingCustomer?.phone || "",
      notes: existingCustomer?.notes || "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      if (existingCustomer) {
        // Update existing customer
        await apiRequest("PUT", `/api/customers/${existingCustomer.id}`, values);
        toast({
          title: "Customer updated",
          description: "The customer information has been updated successfully.",
        });
      } else {
        // Create new customer
        await apiRequest("POST", "/api/customers", values);
        toast({
          title: "Customer created",
          description: "New customer has been added to your records.",
        });
      }
      
      // Invalidate customers query to refresh the data
      queryClient.invalidateQueries({
        queryKey: [`/api/customers`],
      });
      
      // Call success callback if provided
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save the customer information. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <h3 className="text-lg font-medium mb-4">
        {existingCustomer ? "Edit Customer" : "New Customer"}
      </h3>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                <Input 
                  type="email" 
                  placeholder="john.doe@example.com" 
                  {...field} 
                />
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
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="(555) 123-4567" 
                  {...field} 
                  value={field.value || ""}
                />
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
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Customer preferences or important information"
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
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
            {existingCustomer ? "Update Customer" : "Save Customer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
