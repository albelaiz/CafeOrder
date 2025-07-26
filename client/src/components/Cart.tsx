import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, CreditCard, Trash2 } from "lucide-react";
import type { CartItem } from "@shared/schema";

interface CartProps {
  cart: CartItem[];
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onRemoveItem: (menuItemId: string) => void;
  onCheckout: () => void;
  isLoading: boolean;
}

export function Cart({ cart, onUpdateQuantity, onRemoveItem, onCheckout, isLoading }: CartProps) {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.085; // 8.5% tax
  const total = subtotal + tax;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className="sticky top-24">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Your Order</h3>
          <Badge className="bg-cafe-brown text-white">
            {itemCount}
          </Badge>
        </div>
        
        <div className="space-y-3 mb-4 min-h-[100px]">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Your cart is empty</p>
              <p className="text-sm">Add items from the menu</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.menuItemId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">${item.price.toFixed(2)} each</div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-6 h-6 p-0"
                    onClick={() => onUpdateQuantity(item.menuItemId, item.quantity - 1)}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-6 h-6 p-0"
                    onClick={() => onUpdateQuantity(item.menuItemId, item.quantity + 1)}
                  >
                    +
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-6 h-6 p-0 text-red-600 hover:text-red-700"
                    onClick={() => onRemoveItem(item.menuItemId)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-right ml-2">
                  <div className="text-cafe-brown font-bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Subtotal:</span>
              <span className="font-bold text-lg">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
              <span>Tax (8.5%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-6 text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            <Button
              className="w-full bg-cafe-accent hover:bg-orange-600"
              onClick={onCheckout}
              disabled={isLoading}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isLoading ? "Processing..." : "Proceed to Checkout"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
