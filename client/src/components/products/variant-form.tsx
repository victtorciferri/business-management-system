import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { ProductVariant } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Form validation schema
const variantSchema = z.object({
  sku: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  additionalPrice: z.string().optional(),
  inventory: z.number().int().min(0).optional(),
  imageUrl: z.string().optional()
});

type VariantFormValues = z.infer<typeof variantSchema>;

interface VariantFormProps {
  productId: number;
  variant?: ProductVariant;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function VariantForm({ productId, variant, onSuccess, onCancel }: VariantFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with default values or variant data if editing
  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      sku: variant?.sku || "",
      size: variant?.size || "",
      color: variant?.color || "",
      additionalPrice: variant?.additionalPrice || "",
      inventory: variant?.inventory || 0,
      imageUrl: variant?.imageUrl || ""
    }
  });
  
  // Create or update variant mutation
  const variantMutation = useMutation({
    mutationFn: async (data: VariantFormValues) => {
      if (variant) {
        // Update existing variant
        const response = await apiRequest(
          "PUT", 
          `/api/product-variants/${variant.id}`, 
          data
        );
        
        if (!response.ok) {
          throw new Error("Failed to update variant");
        }
        
        return await response.json();
      } else {
        // Create new variant
        const response = await apiRequest(
          "POST", 
          `/api/products/${productId}/variants`, 
          data
        );
        
        if (!response.ok) {
          throw new Error("Failed to create variant");
        }
        
        return await response.json();
      }
    },
    onSuccess: () => {
      // Invalidate queries to refetch the latest data
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/variants`] });
      
      toast({
        title: "Success",
        description: variant 
          ? "Variant updated successfully" 
          : "Variant created successfully",
      });
      
      // Call the onSuccess callback from parent
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always set isSubmitting to false when completed
      setIsSubmitting(false);
    }
  });
  
  // Handle form submission
  const onSubmit = async (data: VariantFormValues) => {
    setIsSubmitting(true);
    variantMutation.mutate(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                <FormControl>
                  <Input placeholder="SKU-12345" {...field} />
                </FormControl>
                <FormDescription>
                  Unique identifier for inventory management
                </FormDescription>
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
                    min="0" 
                    placeholder="0" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Number of items in stock
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <Input placeholder="S, M, L, XL, etc." {...field} />
                </FormControl>
                <FormDescription>
                  Size variant (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      className="w-12 p-1 h-10" 
                      value={field.value || "#000000"}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                    <Input 
                      placeholder="Red, Blue, etc." 
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Color variant (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="additionalPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Price</FormLabel>
                <FormControl>
                  <Input 
                    type="text" 
                    placeholder="0.00" 
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Extra cost added to base price (e.g., 5.99)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://example.com/image.jpg" 
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  URL for variant-specific image (optional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {variant ? "Updating..." : "Creating..."}
              </>
            ) : (
              variant ? "Update Variant" : "Create Variant"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}