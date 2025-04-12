import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product, ProductVariant } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Layers, 
  Plus, 
  DollarSign, 
  Tag, 
  Clock, 
  ShoppingBag, 
  Edit, 
  Trash2,
  Loader2
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import VariantManager from "./variant-manager";
import { format } from "date-fns";

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onDelete: (product: Product) => void;
}

export default function ProductDetail({ product, onBack, onDelete }: ProductDetailProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("details");
  const [isVariantsModalOpen, setIsVariantsModalOpen] = useState(false);
  
  // Fetch product variants
  const { 
    data: variants = [], 
    isLoading: isLoadingVariants,
    error: variantsError
  } = useQuery({
    queryKey: [`/api/products/${product.id}/variants`],
    enabled: !!product.id
  });

  // Delete variant mutation
  const deleteVariantMutation = useMutation({
    mutationFn: async (variantId: number) => {
      const response = await apiRequest("DELETE", `/api/product-variants/${variantId}`);
      if (!response.ok) {
        throw new Error("Failed to delete variant");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products/${product.id}/variants`] });
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

  // Toggle product's hasVariants flag
  const toggleVariantsMutation = useMutation({
    mutationFn: async (hasVariants: boolean) => {
      const response = await apiRequest(
        "PUT", 
        `/api/products/${product.id}`, 
        { hasVariants }
      );
      
      if (!response.ok) {
        throw new Error("Failed to update product");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/products`] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${product.id}`] });
      toast({
        title: "Success",
        description: "Product updated successfully",
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

  // Handle variant deletion with confirmation
  const handleDeleteVariant = (variant: ProductVariant) => {
    if (window.confirm(`Are you sure you want to delete this variant?`)) {
      deleteVariantMutation.mutate(variant.id);
    }
  };

  // Handle toggling product variants mode
  const handleToggleVariantsMode = (hasVariants: boolean) => {
    toggleVariantsMutation.mutate(hasVariants);
  };

  // Format variant data for display
  const formattedVariants = Array.isArray(variants) ? variants : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          {product.hasVariants && (
            <Badge variant="outline" className="ml-2">
              <Layers className="h-3.5 w-3.5 mr-1" />
              Has Variants
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setIsVariantsModalOpen(true)}
          >
            <Layers className="h-4 w-4 mr-2" />
            Manage Variants
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => onDelete(product)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Product
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Product Details</TabsTrigger>
          <TabsTrigger value="variants">
            Variants
            {formattedVariants.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {formattedVariants.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4 pt-4">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Description</h3>
                  <p className="text-muted-foreground">
                    {product.description || "No description provided"}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <h3 className="font-medium text-sm mb-1 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                      Price
                    </h3>
                    <p className="text-lg font-semibold">
                      ${typeof product.price === 'number' 
                        ? product.price.toFixed(2) 
                        : parseFloat(String(product.price || 0)).toFixed(2)}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm mb-1 flex items-center">
                      <Tag className="h-4 w-4 mr-1 text-muted-foreground" />
                      Category
                    </h3>
                    <p>{product.category || "Uncategorized"}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm mb-1 flex items-center">
                      <ShoppingBag className="h-4 w-4 mr-1 text-muted-foreground" />
                      Stock
                    </h3>
                    <p>{product.stock || 0} units</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm mb-1 flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      Created
                    </h3>
                    <p>{product.createdAt ? format(new Date(product.createdAt), 'MMM d, yyyy') : 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="rounded-md max-h-52 object-contain"
                  />
                ) : (
                  <div className="bg-muted rounded-md h-52 w-full flex items-center justify-center">
                    <p className="text-muted-foreground">No image</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="variants" className="pt-4">
          {isLoadingVariants ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : variantsError ? (
            <div className="text-center p-8 text-destructive">
              <p>Failed to load variants</p>
            </div>
          ) : formattedVariants.length === 0 ? (
            <div className="text-center p-8 border rounded-lg">
              <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Variants Available</h3>
              <p className="text-muted-foreground mb-4">
                {product.hasVariants 
                  ? "This product is set up for variants, but none have been created yet."
                  : "This product does not have variants enabled."}
              </p>
              <Button 
                onClick={() => setIsVariantsModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                {product.hasVariants ? "Add Variants" : "Enable Variants"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Product Variants</h3>
                <Button 
                  variant="outline"
                  onClick={() => setIsVariantsModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variant
                </Button>
              </div>
              
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-medium">Variant</th>
                      <th className="py-3 px-4 text-left text-sm font-medium">SKU</th>
                      <th className="py-3 px-4 text-left text-sm font-medium">Size</th>
                      <th className="py-3 px-4 text-left text-sm font-medium">Color</th>
                      <th className="py-3 px-4 text-left text-sm font-medium">Price Adjustment</th>
                      <th className="py-3 px-4 text-left text-sm font-medium">Stock</th>
                      <th className="py-3 px-4 text-right text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {formattedVariants.map((variant: ProductVariant) => (
                      <tr key={variant.id}>
                        <td className="py-3 px-4">
                          {variant.imageUrl && (
                            <div className="flex items-center gap-2">
                              <div className="h-10 w-10 rounded overflow-hidden">
                                <img 
                                  src={variant.imageUrl} 
                                  alt={`Variant ${variant.id}`} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <span>Variant {variant.id}</span>
                            </div>
                          )}
                          {!variant.imageUrl && (
                            <span>Variant {variant.id}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">{variant.sku || '-'}</td>
                        <td className="py-3 px-4">{variant.size || '-'}</td>
                        <td className="py-3 px-4">
                          {variant.color && (
                            <div className="flex items-center gap-2">
                              <div 
                                className="h-4 w-4 rounded-full border" 
                                style={{ backgroundColor: variant.color }}
                              />
                              {variant.color}
                            </div>
                          )}
                          {!variant.color && '-'}
                        </td>
                        <td className="py-3 px-4">
                          {variant.additionalPrice 
                            ? `+$${parseFloat(variant.additionalPrice).toFixed(2)}` 
                            : '-'}
                        </td>
                        <td className="py-3 px-4">{variant.inventory || 0}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => setIsVariantsModalOpen(true)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteVariant(variant)}
                              disabled={deleteVariantMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Variants Management Modal */}
      <Dialog 
        open={isVariantsModalOpen}
        onOpenChange={setIsVariantsModalOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Product Variants</DialogTitle>
          </DialogHeader>
          <VariantManager 
            product={product}
            onToggleVariants={handleToggleVariantsMode}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}