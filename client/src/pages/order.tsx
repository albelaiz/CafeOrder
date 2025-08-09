import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import { MenuCategory } from "@/components/MenuCategory";
import { MenuItem } from "@/components/MenuItem";
import { Cart } from "@/components/Cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coffee, MapPin, Clock, ArrowLeft } from "lucide-react";
import type { MenuItem as MenuItemType, CartItem } from "@shared/schema";

export default function Order() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
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
      setOrderStatus("pending");
      // Redirect to thank you page after a delay
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

  useWebSocket((message) => {
    if (message.type === "ORDER_STATUS_UPDATED") {
      setOrderStatus(message.data.status);
      toast({
        title: "Order Update",
        description: `Your order is now ${message.data.status}`,
      });
    }
  });

  const filteredItems = selectedCategory === "all" 
    ? menuItems.filter(item => item.isActive)
    : menuItems.filter(item => item.category === selectedCategory && item.isActive);

  const addToCart = (menuItem: MenuItemType, quantity: number) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.menuItemId === menuItem.id);
      if (existingItem) {
        return prev.map(item =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: parseFloat(menuItem.price),
        quantity,
      }];
    });

    toast({
      title: "Added to Cart",
      description: `${quantity}x ${menuItem.name} added to your cart`,
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => prev.filter(item => item.menuItemId !== menuItemId));
  };

  const updateCartQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.menuItemId === menuItemId
        ? { ...item, quantity }
        : item
    ));
  };

  const handleCheckout = () => {
    if (cart.length === 0 || !tableNumber) return;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.085; // 8.5% tax
    const total = subtotal + tax;

    const orderData = {
      order: {
        tableNumber,
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        total: total.toString(),
      },
      items: cart.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: item.price.toString(),
        totalPrice: (item.price * item.quantity).toString(),
      })),
    };

    createOrderMutation.mutate(orderData);
  };

  if (!tableNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="nav-restaurant">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-yellow-400/20 mr-4"
                onClick={() => setLocation('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Coffee className="w-8 h-8 mr-3 text-yellow-400 glow-effect" />
              <h1 className="text-2xl font-bold text-white">Café Direct</h1>
            </div>
            <div className="text-right">
              <p className="text-yellow-400 font-medium">Table {tableNumber}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-8">
        <div className="text-center mb-8">
          <p className="text-xl text-gray-300 mb-4">Order directly from your table - No waiting required!</p>
            <div className="flex justify-center items-center">
              <div className="flex items-center bg-white/20 rounded-lg px-4 py-2">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="font-semibold">Table #{tableNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            <MenuCategory
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredItems.map(item => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <Cart
              cart={cart}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              onCheckout={handleCheckout}
              isLoading={createOrderMutation.isPending}
            />

            {/* Order Status Card */}
            {orderStatus && (
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Order Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        orderStatus === "pending" || orderStatus === "preparing" || orderStatus === "ready" || orderStatus === "completed"
                          ? "bg-green-500" : "bg-gray-300"
                      }`}></div>
                      <span className="text-sm">Order placed</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        orderStatus === "preparing" || orderStatus === "ready" || orderStatus === "completed"
                          ? "bg-green-500" : orderStatus === "pending" ? "bg-yellow-500 animate-pulse" : "bg-gray-300"
                      }`}></div>
                      <span className="text-sm">Preparing your order</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        orderStatus === "ready" || orderStatus === "completed"
                          ? "bg-green-500" : orderStatus === "preparing" ? "bg-yellow-500 animate-pulse" : "bg-gray-300"
                      }`}></div>
                      <span className="text-sm">Ready for pickup</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                    <p className="text-sm text-yellow-800 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Estimated time: <span className="font-medium ml-1">12-15 minutes</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}