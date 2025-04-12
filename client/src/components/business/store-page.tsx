import { useEffect, useState } from "react";
import { User, Service, Product } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Package, ShoppingCart, Tag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface StorePageProps {
  business: Omit<User, "password">;
  services: Service[];
  slug: string;
}

export default function StorePage({ business, services, slug }: StorePageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{id: number, quantity: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const { toast } = useToast();

  useEffect(() => {
    // Fetch products when the component mounts or tab changes to products
    if (activeTab === "products") {
      fetchProducts();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      // Call the products API endpoint
      const response = await apiRequest("GET", "/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const productData = await response.json();
      setProducts(productData);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Unable to load products. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (productId: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      
      if (existingItem) {
        // Increase quantity if item already in cart
        return prevCart.map(item => 
          item.id === productId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Add new item to cart
        return [...prevCart, { id: productId, quantity: 1 }];
      }
    });
    
    toast({
      title: "Added to cart",
      description: "Product added to your cart",
    });
  };

  const getProductById = (productId: number) => {
    return products.find(product => product.id === productId);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = getProductById(item.id);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">{business.businessName} Store</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Explore our quality products for your beauty and wellness needs
          </p>
        </div>
        
        <Tabs defaultValue="products" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              {cart.length > 0 && (
                <TabsTrigger value="cart" className="relative">
                  Cart
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cart.reduce((total, item) => total + item.quantity, 0)}
                  </span>
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          

          
          <TabsContent value="products">
            {isLoading ? (
              <div className="flex justify-center my-12">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : products.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle>{product.name}</CardTitle>
                      <CardDescription>{product.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-4">{product.description}</p>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span>{product.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>${product.price}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => addToCart(product.id)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Products Available</h3>
                <p className="text-muted-foreground">
                  We don't have any products available at the moment.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="cart">
            <div className="bg-card border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Your Cart</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="divide-y">
                    {cart.map(item => {
                      const product = getProductById(item.id);
                      return product ? (
                        <div key={item.id} className="py-4 flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">${product.price} × {item.quantity}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium">${(product.price * item.quantity).toFixed(2)}</span>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => {
                                  setCart(prevCart => 
                                    prevCart.map(cartItem => 
                                      cartItem.id === item.id && cartItem.quantity > 1
                                        ? { ...cartItem, quantity: cartItem.quantity - 1 }
                                        : cartItem
                                    ).filter(cartItem => cartItem.quantity > 0)
                                  );
                                }}
                              >
                                -
                              </Button>
                              <span>{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => {
                                  setCart(prevCart => 
                                    prevCart.map(cartItem => 
                                      cartItem.id === item.id
                                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                                        : cartItem
                                    )
                                  );
                                }}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                  
                  <div className="mt-6 py-4 border-t">
                    <div className="flex justify-between items-center mb-6">
                      <span className="font-semibold text-lg">Total</span>
                      <span className="font-bold text-xl">${getCartTotal().toFixed(2)}</span>
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setCart([])}
                      >
                        Clear Cart
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={() => {
                          toast({
                            title: "Checkout",
                            description: "Checkout functionality coming soon!",
                          });
                        }}
                      >
                        Checkout
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}