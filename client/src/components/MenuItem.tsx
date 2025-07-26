import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import type { MenuItem as MenuItemType } from "@shared/schema";

interface MenuItemProps {
  item: MenuItemType;
  onAddToCart: (item: MenuItemType, quantity: number) => void;
}

export function MenuItem({ item, onAddToCart }: MenuItemProps) {
  const [quantity, setQuantity] = useState(0);

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => Math.max(0, prev - 1));

  const handleAddToCart = () => {
    if (quantity > 0) {
      onAddToCart(item, quantity);
      setQuantity(0);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "coffee": return "bg-orange-100 text-orange-800";
      case "food": return "bg-blue-100 text-blue-800";
      case "desserts": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-48 object-cover"
        />
      )}
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
          <span className="text-cafe-brown font-bold text-lg">${item.price}</span>
        </div>
        
        <div className="mb-3">
          <Badge className={getCategoryColor(item.category)}>
            {item.category}
          </Badge>
        </div>
        
        {item.description && (
          <p className="text-gray-600 text-sm mb-3">{item.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="w-8 h-8 rounded-full p-0"
              onClick={decreaseQuantity}
              disabled={quantity === 0}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="font-medium w-8 text-center">{quantity}</span>
            <Button
              size="sm"
              className="w-8 h-8 rounded-full p-0 bg-cafe-brown hover:bg-cafe-light"
              onClick={increaseQuantity}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          <Button
            className="bg-cafe-accent hover:bg-orange-600"
            onClick={handleAddToCart}
            disabled={quantity === 0}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
