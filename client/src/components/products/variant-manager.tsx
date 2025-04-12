import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ProductVariant, Product } from "@shared/schema";
import { Pencil, Trash2, Plus, Loader2, Tag, Palette, Ruler, Box } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import VariantForm from "./variant-form";

interface VariantManagerProps {
  product: Product;
  onToggleVariants: (hasVariants: boolean) => void;
}

export default function VariantManager({ product, onToggleVariants }: VariantManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const { toast } = useToast();

  // Fetch variants for this product
  const {
    data: variants = [],
    isLoading: isLoadingVariants,
    isError,
    error
  } = useQuery({
    queryKey: ['/api/products', product.id, 'variants'],
    queryFn: async () => {
      const response = await fetch(`/api/products/${product.id}/variants`);
      if (!response.ok) {
        throw new Error('Failed to fetch variants');
      }
      return response.json();
    },
    enabled: !!product && !!product.id && product.hasVariants === true
  });

  // Delete variant mutation
  const deleteVariantMutation = useMutation({
    mutationFn: async (variantId: number) => {
      const response = await apiRequest("DELETE", `/api/product-variants/${variantId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete variant");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', product.id, 'variants'] });
      toast({
        title: "Success",
        description: "Variant deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update product to enable/disable variants
  const updateProductMutation = useMutation({
    mutationFn: async ({id, hasVariants}: {id: number, hasVariants: boolean}) => {
      const response = await apiRequest("PUT", `/api/products/${id}`, { hasVariants });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update product");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle variants on/off
  const handleToggleVariants = () => {
    const newVariantStatus = !product.hasVariants;
    updateProductMutation.mutate({ 
      id: product.id, 
      hasVariants: newVariantStatus 
    });
    onToggleVariants(newVariantStatus);
  };

  // Handle variant deletion with confirmation
  const handleDeleteVariant = (variant: ProductVariant) => {
    if (window.confirm(`Are you sure you want to delete this variant?`)) {
      deleteVariantMutation.mutate(variant.id);
    }
  };

  // Close dialog and refresh data after successful form submission
  const handleFormSuccess = () => {
    setIsAddDialogOpen(false);
    setEditingVariant(null);
    queryClient.invalidateQueries({ queryKey: ['/api/products', product.id, 'variants'] });
  };

  const formattedVariants = Array.isArray(variants) ? variants : [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Product Variants</h3>
        <Button 
          variant={product.hasVariants ? "default" : "outline"} 
          onClick={handleToggleVariants}
          disabled={updateProductMutation.isPending}
        >
          {updateProductMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          {product.hasVariants ? "Disable Variants" : "Enable Variants"}
        </Button>
      </div>

      {product.hasVariants && (
        <>
          <div className="flex justify-end">
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Variant
            </Button>
          </div>

          {isLoadingVariants ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-destructive">
              Error loading variants: {error instanceof Error ? error.message : "Unknown error"}
            </div>
          ) : formattedVariants.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/20">
              <p className="text-muted-foreground">No variants added yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add size, color or other options for this product
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formattedVariants.map((variant: ProductVariant) => (
                <Card key={variant.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          <Tag className="h-3 w-3 mr-1" /> {variant.sku}
                        </Badge>
                        <CardTitle className="text-base">
                          {variant.size && variant.color 
                            ? `${variant.size} / ${variant.color}`
                            : variant.size || variant.color || "Standard"}
                        </CardTitle>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => setEditingVariant(variant)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteVariant(variant)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="space-y-1 text-sm">
                      {variant.size && (
                        <div className="flex items-center text-muted-foreground">
                          <Ruler className="h-3.5 w-3.5 mr-1" /> Size: {variant.size}
                        </div>
                      )}
                      {variant.color && (
                        <div className="flex items-center text-muted-foreground">
                          <Palette className="h-3.5 w-3.5 mr-1" /> Color: {variant.color}
                        </div>
                      )}
                      <div className="flex items-center text-muted-foreground">
                        <Box className="h-3.5 w-3.5 mr-1" /> Inventory: {variant.inventory}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between">
                    <span className="text-sm font-medium">
                      Additional Price: ${Number(variant.additionalPrice).toFixed(2)}
                    </span>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Variant Dialog */}
      <Dialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Product Variant</DialogTitle>
          </DialogHeader>
          <VariantForm 
            productId={product.id}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Variant Dialog */}
      <Dialog 
        open={!!editingVariant} 
        onOpenChange={(open) => !open && setEditingVariant(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Product Variant</DialogTitle>
          </DialogHeader>
          {editingVariant && (
            <VariantForm 
              productId={product.id}
              variant={editingVariant}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditingVariant(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}