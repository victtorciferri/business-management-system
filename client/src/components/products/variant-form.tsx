import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ProductVariant } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schema with validation
const variantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  size: z.string().optional(),
  color: z.string().optional(),
  additionalPrice: z.coerce.number().min(0, "Additional price must be at least 0"),
  inventory: z.coerce.number().int().min(0, "Inventory must be at least 0"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type VariantFormValues = z.infer<typeof variantSchema>;

interface VariantFormProps {
  productId: number;
  variant?: ProductVariant;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function VariantForm({ productId, variant, onSuccess, onCancel }: VariantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Initialize form with existing variant data or defaults
  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: variant ? {
      sku: variant.sku,
      size: variant.size || "",
      color: variant.color || "",
      additionalPrice: Number(variant.additionalPrice) || 0,
      inventory: variant.inventory || 0,
      imageUrl: variant.imageUrl || "",
    } : {
      sku: "",
      size: "",
      color: "",
      additionalPrice: 0,
      inventory: 0,
      imageUrl: "",
    },
  });

  const onSubmit = async (data: VariantFormValues) => {
    try {
      setIsSubmitting(true);

      // Clean up imageUrl if empty
      if (data.imageUrl === "") {
        data.imageUrl = undefined;
      }
      
      // Convert numeric values to strings as expected by the API
      const formattedData = {
        ...data,
        additionalPrice: data.additionalPrice.toString(),  // Convert price number to string
      };

      // Format data and determine if it's a new variant or an update
      if (variant) {
        // Update existing variant
        const response = await apiRequest(
          "PUT", 
          `/api/product-variants/${variant.id}`, 
          formattedData
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update variant");
        }
        
        toast({
          title: "Success",
          description: "Variant updated successfully",
        });
      } else {
        // Create new variant
        const response = await apiRequest(
          "POST", 
          `/api/products/${productId}/variants`, 
          formattedData
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create variant");
        }
        
        toast({
          title: "Success",
          description: "Variant created successfully",
        });
      }
      
      // Call success callback
      onSuccess();
    } catch (error) {
      console.error("Error submitting variant:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
              <FormControl>
                <Input placeholder="Enter SKU" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="S, M, L, XL, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Red, Blue, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="additionalPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    step="0.01" 
                    min="0"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="inventory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inventory</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    min="0"
                    step="1"
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
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Variant Image URL (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/image.jpg" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-3 justify-end pt-2">
          <Button
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : variant ? "Update Variant" : "Add Variant"}
          </Button>
        </div>
      </form>
    </Form>
  );
}