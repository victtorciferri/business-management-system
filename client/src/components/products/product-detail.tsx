import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Tag, Package, DollarSign, Layers, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import ProductForm from "./product-form";
import VariantManager from "./variant-manager";

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onDelete: (product: Product) => void;
}

export default function ProductDetail({ product, onBack, onDelete }: ProductDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [hasVariants, setHasVariants] = useState(product.hasVariants || false);
  const { toast } = useToast();

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const response = await apiRequest("PUT", `/api/products/${product.id}`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update product");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
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

  const handleFormSuccess = () => {
    setIsEditing(false);
    queryClient.invalidateQueries({ queryKey: ['/api/products'] });
  };

  const handleToggleVariants = (newVariantStatus: boolean) => {
    setHasVariants(newVariantStatus);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="pl-1">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Pencil className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="destructive" onClick={() => onDelete(product)}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <Badge variant="outline" className="mb-2">
                {product.category || "General"}
              </Badge>
              <CardTitle className="text-2xl">{product.name}</CardTitle>
              <CardDescription className="mt-2">
                {product.description || "No description available"}
              </CardDescription>
            </div>
            {product.imageUrl && (
              <div className="w-20 h-20 rounded-md overflow-hidden">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center">
                <DollarSign className="h-4 w-4 mr-1" /> Price
              </span>
              <span className="text-xl font-medium mt-1">
                ${Number(product.price).toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center">
                <Package className="h-4 w-4 mr-1" /> Stock
              </span>
              <span className="text-xl font-medium mt-1">
                {product.hasVariants ? "See variants" : product.stock || 0}
              </span>
            </div>
            <div className="flex flex-col p-4 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center">
                <Layers className="h-4 w-4 mr-1" /> Variants
              </span>
              <span className="text-xl font-medium mt-1">
                {product.hasVariants ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="variants" className="w-full">
        <TabsList>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="details">Additional Details</TabsTrigger>
        </TabsList>
        <TabsContent value="variants" className="pt-4">
          <VariantManager 
            product={product} 
            onToggleVariants={handleToggleVariants}
          />
        </TabsContent>
        <TabsContent value="details" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">ID</h3>
                  <p>{product.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Created At</h3>
                  <p>{new Date(product.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Updated At</h3>
                  <p>{new Date(product.updatedAt).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Product Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <ProductForm 
            product={product}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}