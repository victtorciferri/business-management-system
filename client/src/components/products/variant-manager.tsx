import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product, ProductVariant } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle, Edit, Trash2 } from "lucide-react";
import VariantForm from "./variant-form";

interface VariantManagerProps {
  product: Product;
  onToggleVariants: (hasVariants: boolean) => void;
}

export default function VariantManager({ product, onToggleVariants }: VariantManagerProps) {
  const { toast } = useToast();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Fetch product variants
  const { 
    data: variants = [], 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [`/api/products/${product.id}/variants`],
    enabled: !!product.id && !!product.hasVariants
  });

  // Handle toggling variants mode
  const handleToggleVariantsMode = (enabled: boolean) => {
    if (!enabled && Array.isArray(variants) && variants.length > 0) {
      const confirmDisable = window.confirm(
        "Disabling variants will delete all existing variants for this product. Are you sure you want to continue?"
      );
      if (!confirmDisable) return;
    }
    onToggleVariants(enabled);
  };

  // Handle form submission success
  const handleFormSuccess = () => {
    setSelectedVariant(null);
    setShowAddForm(false);
    refetch();
  };

  // Format variant data for display
  const formattedVariants = Array.isArray(variants) ? variants : [];

  if (!product.hasVariants) {
    return (
      <div className="space-y-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Enable Product Variants</h3>
            <p className="text-sm text-muted-foreground">
              Variants allow you to offer different versions of your product (e.g., sizes, colors)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="variants-mode" 
              checked={product.hasVariants}
              onCheckedChange={handleToggleVariantsMode}
            />
            <Label htmlFor="variants-mode">
              {product.hasVariants ? "Enabled" : "Disabled"}
            </Label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Product Variants</h3>
          <p className="text-sm text-muted-foreground">
            Manage different versions of your product with unique attributes
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="variants-mode" 
              checked={product.hasVariants}
              onCheckedChange={handleToggleVariantsMode}
            />
            <Label htmlFor="variants-mode">
              {product.hasVariants ? "Enabled" : "Disabled"}
            </Label>
          </div>
          <Button 
            variant="outline"
            onClick={() => {
              setSelectedVariant(null);
              setShowAddForm(true);
            }}
            disabled={!product.hasVariants}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Variant
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center p-8 text-destructive">
          <p>Failed to load variants</p>
        </div>
      ) : showAddForm || selectedVariant ? (
        <VariantForm 
          productId={product.id}
          variant={selectedVariant || undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setSelectedVariant(null);
            setShowAddForm(false);
          }}
        />
      ) : formattedVariants.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Variants Yet</CardTitle>
            <CardDescription>
              Add your first product variant using the "Add Variant" button above
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="w-full"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Your First Variant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formattedVariants.map((variant: ProductVariant) => (
            <Card key={variant.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {variant.sku || `Variant ${variant.id}`}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setSelectedVariant(variant)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Are you sure you want to delete this variant?")) {
                          // Delete variant action will be handled in the parent component
                          toast({
                            title: "Coming Soon",
                            description: "Variant deletion will be implemented soon.",
                          });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {variant.size && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Size</h4>
                        <p className="text-sm">{variant.size}</p>
                      </div>
                    )}
                    
                    {variant.color && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Color</h4>
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="w-4 h-4 rounded-full border" 
                            style={{ backgroundColor: variant.color }}
                          />
                          <span className="text-sm">{variant.color}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Price Adjustment</h4>
                      <p className="text-sm">
                        {variant.additionalPrice 
                          ? `+$${parseFloat(variant.additionalPrice).toFixed(2)}` 
                          : "No adjustment"}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Inventory</h4>
                      <p className="text-sm">{variant.inventory || 0} units</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}