import { useState } from "react";
import { User, Service } from "@shared/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Info, 
  ShoppingBag, 
  Plus,
  Minus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface StorePageProps {
  business: Omit<User, "password">;
  services: Service[];
  slug: string;
}

// Example product type
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export default function StorePage({ business, services, slug }: StorePageProps) {
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  
  // Example products - in a real app these would come from the database
  const products: Product[] = [
    { 
      id: 1, 
      name: "Professional Shampoo", 
      description: "Salon-quality shampoo for all hair types", 
      price: 24.99, 
      image: "shampoo.jpg",
      category: "Hair Care" 
    },
    { 
      id: 2, 
      name: "Hair Styling Cream", 
      description: "Medium hold styling cream for natural looks", 
      price: 19.99, 
      image: "styling-cream.jpg",
      category: "Hair Care" 
    },
    { 
      id: 3, 
      name: "Moisturizing Conditioner", 
      description: "Deep hydration for dry and damaged hair", 
      price: 22.99, 
      image: "conditioner.jpg",
      category: "Hair Care" 
    },
    { 
      id: 4, 
      name: "Professional Hairbrush", 
      description: "Detangling brush for all hair types", 
      price: 15.99, 
      image: "hairbrush.jpg",
      category: "Accessories" 
    },
    { 
      id: 5, 
      name: "Gift Card", 
      description: "Perfect gift for any occasion", 
      price: 50.00, 
      image: "gift-card.jpg",
      category: "Gift Cards" 
    }
  ];
  
  // Get unique product categories
  const categories = Array.from(new Set(products.map(product => product.category)));
  
  // Add product to cart
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };
  
  // Update cart item quantity
  const updateQuantity = (productId: number, amount: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const newQuantity = Math.max(0, item.quantity + amount);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };
  
  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Store</h1>
      <p className="text-gray-600 mb-8">Shop for products and services</p>
      
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="products">
            <Package className="w-4 h-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="cart">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Cart {cart.length > 0 && `(${cart.length})`}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start font-normal">
                    All Products
                  </Button>
                  {categories.map(category => (
                    <Button key={category} variant="ghost" className="w-full justify-start font-normal">
                      {category}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Products Grid */}
            <div className="md:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <ShoppingBag className="h-10 w-10 text-gray-400" />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="font-bold">${product.price.toFixed(2)}</span>
                        <Button size="sm" onClick={() => addToCart(product)}>
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="cart" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Shopping Cart</CardTitle>
              <CardDescription>
                {cart.length === 0 
                  ? "Your cart is empty" 
                  : `You have ${cart.length} ${cart.length === 1 ? 'item' : 'items'} in your cart`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-4">
                    Looks like you haven't added any products to your cart yet.
                  </p>
                  <Button variant="outline" asChild>
                    <TabsTrigger value="products">Browse Products</TabsTrigger>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex items-center py-3 border-b">
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center mr-4">
                          <ShoppingBag className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium">{item.product.name}</h4>
                          <p className="text-sm text-gray-500">${item.product.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(item.product.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="mx-3 w-6 text-center">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 rounded-full"
                            onClick={() => updateQuantity(item.product.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="w-24 text-right">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            {cart.length > 0 && (
              <CardFooter className="flex justify-between">
                <Button variant="outline">Continue Shopping</Button>
                <Button>Checkout</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}