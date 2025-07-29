import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Coffee, Plus, Minus, ShoppingCart, MapPin, 
  Clock, ArrowLeft, CheckCircle, Loader2, 
  ChefHat, Utensils, Cookie, Star, Heart
} from "lucide-react";
import type { MenuItem as MenuItemType, CartItem } from "@shared/schema";

export default function OrderModern() {
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
      setLocation('/');
    }
  }, [setLocation]);

  const { data: menuItems = [], isLoading } = useQuery<MenuItemType[]>({
    queryKey: ["/api/menu"],
  });

  const categories = [
    { 
      id: "all", 
      label: "All Items", 
      icon: <Utensils className="w-4 h-4" />,
      color: "bg-gradient-to-r from-purple-500 to-pink-500"
    },
    { 
      id: "coffee", 
      label: "Coffee", 
      icon: <Coffee className="w-4 h-4" />,
      color: "bg-gradient-to-r from-amber-500 to-orange-500"
    },
    { 
      id: "food", 
      label: "Food", 
      icon: <ChefHat className="w-4 h-4" />,
      color: "bg-gradient-to-r from-green-500 to-emerald-500"
    },
    { 
      id: "desserts", 
      label: "Desserts", 
      icon: <Cookie className="w-4 h-4" />,
      color: "bg-gradient-to-r from-pink-500 to-rose-500"
    },
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

    // Add haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
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
  const tax = cartTotal * 0.08;
  const finalTotal = cartTotal + tax;

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Placed Successfully!",
        description: "Your delicious order is being prepared with care.",
      });
      setCart([]);
      setTimeout(() => {
        setLocation('/thank-you');
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Order Failed",
        description: "Something went wrong. Please try again.",
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 text-lg">Loading our delicious menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full">
                <MapPin className="w-4 h-4" />
                <span className="font-semibold">Table {tableNumber}</span>
              </div>
              
              {cart.length > 0 && (
                <div className="flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-medium">
                  <ShoppingCart className="w-4 h-4" />
                  <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Categories */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`${
                    selectedCategory === category.id 
                      ? `text-white ${category.color}` 
                      : "hover:bg-gray-50"
                  } font-medium px-6 py-3 rounded-full transition-all duration-200`}
                >
                  {category.icon}
                  <span className="ml-2">{category.label}</span>
                </Button>
              ))}
            </div>

            {/* Menu Items */}
            <div className="grid gap-6">
              {filteredItems.map((item) => {
                const quantity = getItemQuantity(item.id);
                
                return (
                  <Card key={item.id} className="card-modern overflow-hidden group">
                    <CardContent className="p-0">
                      <div className="flex">
                        {/* Item Image Placeholder */}
                        <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Coffee className="w-8 h-8 text-gray-400" />
                        </div>
                        
                        {/* Item Content */}
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                {item.name}
                              </h3>
                              
                              {item.description && (
                                <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                                  {item.description}
                                </p>
                              )}
                              
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl font-bold text-gray-900">
                                  ${item.price}
                                </span>
                                <Badge 
                                  variant="secondary" 
                                  className="capitalize bg-gray-100 text-gray-700"
                                >
                                  {item.category}
                                </Badge>
                                <div className="flex items-center space-x-1 text-yellow-500">
                                  <Star className="w-4 h-4 fill-current" />
                                  <span className="text-sm text-gray-600">4.8</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Add to Cart Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {quantity > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeFromCart(item.id)}
                                  className="w-10 h-10 p-0 rounded-full hover:bg-red-50 hover:border-red-200"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                              )}
                              
                              {quantity > 0 && (
                                <span className="w-8 text-center font-semibold text-lg">
                                  {quantity}
                                </span>
                              )}
                              
                              <Button
                                size="sm"
                                onClick={() => addToCart(item)}
                                className={`${
                                  quantity === 0 
                                    ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6" 
                                    : "w-10 h-10 p-0 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                } text-white font-medium transition-all duration-200`}
                              >
                                <Plus className="w-4 h-4" />
                                {quantity === 0 && <span className="ml-2">Add to Cart</span>}
                              </Button>
                            </div>
                            
                            {quantity > 0 && (
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Subtotal</p>
                                <p className="font-bold text-lg text-gray-900">
                                  ${(item.price * quantity).toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>
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
            <Card className="card-modern sticky top-28">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Your Order</h2>
                </div>
                
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-2">Your cart is empty</p>
                    <p className="text-sm text-gray-400">Add some delicious items from our menu</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Cart Items */}
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.menuItemId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                            <p className="text-xs text-gray-500">
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromCart(item.menuItemId)}
                              className="w-7 h-7 p-0 rounded-full"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
                                if (menuItem) addToCart(menuItem);
                              }}
                              className="w-7 h-7 p-0 rounded-full"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="w-16 text-right">
                            <span className="font-semibold text-sm">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Order Summary */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax (8%)</span>
                        <span className="font-medium">${tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${finalTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handlePlaceOrder}
                      disabled={cart.length === 0 || isSubmitting}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-lg transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Place Order • ${finalTotal.toFixed(2)}
                        </>
                      )}
                    </Button>

                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Estimated: 12-18 minutes</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        We'll bring your order directly to your table
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}