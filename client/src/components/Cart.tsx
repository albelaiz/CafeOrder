import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import type { CartItem } from "@shared/schema";

interface CartProps {
  cart: CartItem[];
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onRemoveItem: (menuItemId: string) => void;
  onCheckout: () => void;
  isLoading: boolean;
}

export function Cart({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isLoading,
}: CartProps) {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.085; // 8.5% tax
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Your Cart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Your cart is empty</p>
            <p className="text-sm text-gray-400 mt-1">
              Add items from the menu to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Your Cart
          </div>
          <Badge variant="secondary">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {cart.map((item) => (
            <div key={item.menuItemId} className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-800">{item.name}</h4>
                <p className="text-xs text-gray-600">{item.price.toFixed(2)} DH each</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.menuItemId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="h-6 w-6 p-0"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                
                <span className="text-sm font-medium w-8 text-center">
                  {item.quantity}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.menuItemId, item.quantity + 1)}
                  className="h-6 w-6 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.menuItemId)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Order Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span>{subtotal.toFixed(2)} DH</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (8.5%):</span>
            <span>{tax.toFixed(2)} DH</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span className="text-cafe-brown">{total.toFixed(2)} DH</span>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          onClick={onCheckout}
          disabled={isLoading || cart.length === 0}
          className="w-full bg-cafe-accent hover:bg-orange-600 text-white font-semibold py-3"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `Place Order - ${total.toFixed(2)} DH`
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Your order will be prepared fresh and you'll be notified when ready
        </p>
      </CardContent>
    </Card>
  );
}