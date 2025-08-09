import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coffee, Plus, Minus, ShoppingCart } from "lucide-react";
import type { MenuItem as MenuItemType } from "@shared/schema";

interface MenuItemProps {
  item: MenuItemType;
  onAddToCart: (item: MenuItemType, quantity: number) => void;
}

export function MenuItem({ item, onAddToCart }: MenuItemProps) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart(item, quantity);
    setQuantity(1);
  };

  return (
    <Card className="card-restaurant hover-lift overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-yellow-400/10"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Coffee className="w-12 h-12 text-yellow-400 glow-effect" />
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-semibold text-white">{item.name}</h3>
            <span className="text-2xl font-bold text-yellow-400">{item.price} DH</span>
          </div>
          
          <p className="text-gray-300 mb-4 leading-relaxed">{item.description}</p>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-8 w-8 p-0 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-8 text-center font-medium text-white">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                className="h-8 w-8 p-0 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              onClick={handleAddToCart}
              className="flex-1 btn-restaurant font-medium"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}