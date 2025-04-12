import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, PlusCircle, Search, Tag, DollarSign, ShoppingBag, Pencil, Trash2, Layers } from "lucide-react";
import ProductForm from "@/components/products/product-form";
import ProductDetail from "@/components/products/product-detail";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";

export default function ProductsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch products
  const { 
    data: products = [], 
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/products'],
    enabled: !!user,
    retry: 1,
    retryDelay: 1000
  });

  // Extract unique categories from products
  const categories = [
    "all", 
    ...Array.from(
      new Set(
        Array.isArray(products) 
          ? products.map((product: Product) => product.category).filter(Boolean)
          : []
      )
    ).sort()
  ];

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/products/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete product");
      }
    },
    onSuccess: () => {
      // Invalidate and refetch products query
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      // If viewing the deleted product, go back to the list
      setSelectedProduct(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Ensure products is an array
  const productsArray = Array.isArray(products) ? products : [];
  
  // Filter products based on search term and category
  const filteredProducts = productsArray.filter((product: Product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle product deletion with confirmation
  const handleDeleteProduct = (product: Product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  // Close dialogs and refresh data
  const handleFormSuccess = () => {
    setIsAddDialogOpen(false);
    setEditingProduct(null);
    queryClient.invalidateQueries({ queryKey: ['/api/products'] });
  };

  // View product details
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  // Product list view JSX
  const renderProductList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[70vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }
  
    // Check if it's an authentication error
    if (error) {
      const isAuthError = (error as any)?.response?.status === 401;
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
          <h2 className="text-2xl font-bold text-destructive mb-2">
            {isAuthError ? "Authentication Required" : "Error Loading Products"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {isAuthError 
              ? "You must be logged in to view your products. Please log in and try again."
              : "There was a problem loading your products. Please try again."}
          </p>
          {isAuthError ? (
            <Button onClick={() => window.location.href = '/auth'}>
              Go to Login
            </Button>
          ) : (
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/products'] })}
            >
              Try Again
            </Button>
          )}
        </div>
      );
    }
  
    return (
      <div className="container py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Product Management</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
        </div>
  
        {/* Filters and search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Tabs 
            value={selectedCategory} 
            onValueChange={setSelectedCategory}
            className="w-full md:w-auto"
          >
            <TabsList className="w-full md:w-auto">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
  
        {/* Products list */}
        {filteredProducts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product: Product) => (
              <Card 
                key={product.id} 
                className="overflow-hidden border border-border hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleViewProduct(product)}
              >
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                      <div className="flex items-center text-sm bg-muted px-2 py-1 rounded-md">
                        <Tag className="w-3 h-3 mr-1" />
                        <span className="capitalize">{product.category}</span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground line-clamp-2 mb-4">
                      {product.description}
                    </p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1 text-muted-foreground" />
                        <span className="font-medium">
                          ${typeof product.price === 'number' 
                            ? product.price.toFixed(2) 
                            : parseFloat(String(product.price || 0)).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <ShoppingBag className="w-4 h-4 mr-1 text-muted-foreground" />
                        <span>
                          {product.stock ?? 0} in stock
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      {product.hasVariants && (
                        <Badge variant="outline" className="flex items-center">
                          <Layers className="w-3 h-3 mr-1" />
                          Variants
                        </Badge>
                      )}
                      
                      <div className="flex space-x-2 ml-auto" onClick={(e) => e.stopPropagation()}>
                        {product.hasVariants && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProduct(product);
                            }}
                            title="Manage Variants"
                          >
                            <Layers className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProduct(product);
                          }}
                          title="Edit Product"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProduct(product);
                          }}
                          disabled={deleteProductMutation.isPending}
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-card">
            <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              {productsArray.length === 0
                ? "You haven't added any products yet. Add your first product to start selling."
                : "No products match your current search or filter."}
            </p>
            {productsArray.length === 0 && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            )}
          </div>
        )}
  
        {/* Add product dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <ProductForm 
              onSuccess={handleFormSuccess} 
              onCancel={() => setIsAddDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
  
        {/* Edit product dialog */}
        <Dialog 
          open={!!editingProduct} 
          onOpenChange={(open) => {
            if (!open) setEditingProduct(null);
          }}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <ProductForm 
                product={editingProduct}
                onSuccess={handleFormSuccess} 
                onCancel={() => setEditingProduct(null)} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // Render product detail view or product list
  return selectedProduct 
    ? (
      <div className="container py-6 max-w-7xl mx-auto">
        <ProductDetail 
          product={selectedProduct} 
          onBack={() => setSelectedProduct(null)}
          onDelete={handleDeleteProduct}
        />
      </div>
    ) 
    : renderProductList();
}