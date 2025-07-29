import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Coffee, Plus, Minus, ShoppingCart, MapPin, 
  Clock, ArrowLeft, CheckCircle, Loader2 
} from "lucide-react";
import type { MenuItem as MenuItemType, CartItem } from "@shared/schema";

export default function OrderNew() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Get table number from URL query parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const table = urlParams.get('t');
    if (table) {
      setTableNumber(parseInt(table, 10));
    } else {
      // If no table number, redirect to landing
      setLocation('/');
    }
  }, [setLocation]);

  const { data: menuItems = [], isLoading } = useQuery<MenuItemType[]>({
    queryKey: ["/api/menu"],
  });

  const categories = [
    { id: "all", label: "All Items", icon: Coffee },
    { id: "coffee", label: "Coffee", icon: Coffee },
    { id: "food", label: "Food", icon: Coffee },
    { id: "desserts", label: "Desserts", icon: Coffee },
  ];

  const filteredItems = selectedCategory === "all" 
    ? menuItems.filter(item => item.isActive)
    : menuItems.filter(item => item.category === selectedCategory && item.isActive);

  const addToCart = (item: MenuItemType) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.menuItemId === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.menuItemId === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, {
          menuItemId: item.id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: 1,
        }];
      }
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.menuItemId === menuItemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(cartItem =>
          cartItem.menuItemId === menuItemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else {
        return prevCart.filter(cartItem => cartItem.menuItemId !== menuItemId);
      }
    });
  };

  const getItemQuantity = (menuItemId: string) => {
    const cartItem = cart.find(item => item.menuItemId === menuItemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = cartTotal * 0.08; // 8% tax
  const finalTotal = cartTotal + tax;

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Placed Successfully!",
        description: "Your order is being prepared. You'll receive updates shortly.",
      });
      setCart([]);
      setTimeout(() => {
        setLocation('/thank-you');
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !tableNumber) return;

    setIsSubmitting(true);
    
    const orderData = {
      order: {
        tableNumber,
        subtotal: cartTotal.toFixed(2),
        tax: tax.toFixed(2),
        total: finalTotal.toFixed(2),
        notes: "",
      },
      items: cart.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: item.price.toFixed(2),
        totalPrice: (item.price * item.quantity).toFixed(2),
      })),
    };

    try {
      await createOrderMutation.mutateAsync(orderData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-gray-700">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">Table {tableNumber}</span>
              </div>
              
              {cart.length > 0 && (
                <div className="flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="font-medium">{cart.length} items</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Menu Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Categories */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`whitespace-nowrap ${
                    selectedCategory === category.id 
                      ? "bg-orange-600 hover:bg-orange-700" 
                      : "hover:bg-orange-50"
                  }`}
                >
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.label}
                </Button>
              ))}
            </div>

            {/* Menu Items */}
            <div className="grid gap-4">
              {filteredItems.map((item) => {
                const quantity = getItemQuantity(item.id);
                
                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {item.name}
                          </h3>
                          
                          {item.description && (
                            <p className="text-gray-600 text-sm mb-3">
                              {item.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-bold text-gray-900">
                              ${item.price}
                            </span>
                            <Badge variant="outline" className="capitalize">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 ml-6">
                          {quantity > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {quantity > 0 && (
                            <span className="w-8 text-center font-medium">
                              {quantity}
                            </span>
                          )}
                          
                          <Button
                            variant={quantity > 0 ? "outline" : "default"}
                            size="sm"
                            onClick={() => addToCart(item)}
                            className={quantity === 0 ? "bg-orange-600 hover:bg-orange-700" : "w-8 h-8 p-0"}
                          >
                            <Plus className="w-4 h-4" />
                            {quantity === 0 && <span className="ml-2">Add</span>}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Your Order</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Your cart is empty
                  </p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {cart.map((item) => (
                        <div key={item.menuItemId} className="flex justify-between items-center">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            <p className="text-xs text-gray-500">
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromCart(item.menuItemId)}
                              className="w-6 h-6 p-0"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            
                            <span className="w-6 text-center text-sm">
                              {item.quantity}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
                                if (menuItem) addToCart(menuItem);
                              }}
                              className="w-6 h-6 p-0"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="w-16 text-right font-medium text-sm">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (8%)</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${finalTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handlePlaceOrder}
                      disabled={cart.length === 0 || isSubmitting}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Place Order
                        </>
                      )}
                    </Button>

                    <div className="text-xs text-gray-500 text-center">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Estimated time: 10-15 minutes
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}