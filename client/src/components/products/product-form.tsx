import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Product } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Layers, Info } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Product category options
const PRODUCT_CATEGORIES = [
  "Hair Care",
  "Skin Care",
  "Nail Care",
  "Makeup",
  "Fragrance",
  "Wellness",
  "Tools & Accessories",
  "Packages",
  "Other"
];

// Form schema with validation
const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100, "Name is too long"),
  description: z.string().min(1, "Description is required").max(500, "Description is too long"),
  price: z.coerce.number().min(0, "Price must be at least 0"),
  stock: z.coerce.number().int().min(0, "Stock must be at least 0"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  hasVariants: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Initialize form with existing product data or defaults
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      imageUrl: product.imageUrl || "",
      hasVariants: product.hasVariants || false,
    } : {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "",
      imageUrl: "",
      hasVariants: false,
    },
  });
  
  // Track the hasVariants value for conditional UI rendering
  const hasVariants = form.watch("hasVariants");

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);

      // Clean up imageUrl if empty
      if (data.imageUrl === "") {
        data.imageUrl = undefined;
      }
      
      // Convert numeric values to strings as expected by the API
      const formattedData = {
        ...data,
        price: data.price.toString(),  // Convert price number to string
        stock: data.stock,             // Keep stock as a number
      };

      // Format data and determine if it's a new product or an update
      if (product) {
        // Update existing product
        const response = await apiRequest("PUT", `/api/products/${product.id}`, formattedData);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update product");
        }
        
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        // Create new product
        const response = await apiRequest("POST", "/api/products", formattedData);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to create product");
        }
        
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }
      
      // Call success callback
      onSuccess();
    } catch (error) {
      console.error("Error submitting product:", error);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
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
                  placeholder="Enter product description" 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
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
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
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
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
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
        
        <FormField
          control={form.control}
          name="hasVariants"
          render={({ field }) => (
            <FormItem className={`flex flex-row items-center justify-between rounded-lg border p-4 ${field.value ? 'bg-primary/5 border-primary/30' : ''}`}>
              <div className="space-y-0.5">
                <FormLabel className="text-base flex items-center">
                  <Layers className={`mr-2 h-5 w-5 ${field.value ? 'text-primary' : ''}`} />
                  <span className={field.value ? 'font-medium' : ''}>Product Variants</span>
                </FormLabel>
                <FormDescription>
                  Enable variants for different sizes, colors, etc.
                </FormDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${field.value ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {field.value ? 'Enabled' : 'Disabled'}
                </span>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className={field.value ? 'data-[state=checked]:bg-primary' : ''}
                  />
                </FormControl>
              </div>
            </FormItem>
          )}
        />
        
        {hasVariants && (
          <Alert className="bg-primary/5 border-primary/30 text-primary">
            <Info className="h-4 w-4" />
            <AlertTitle>Product Variants Enabled</AlertTitle>
            <AlertDescription className="text-foreground/80">
              After creating this product, you'll be able to add different variants with specific attributes like size, color, etc.
              <strong className="block mt-1">Note: You'll manage variants after saving this product.</strong>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex gap-3 justify-end">
          <Button
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : product ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}