import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";
import type { MenuItem as MenuItemType } from "@shared/schema";

interface MenuItemProps {
  item: MenuItemType;
  onAddToCart: (item: MenuItemType, quantity: number) => void;
}

export function MenuItem({ item, onAddToCart }: MenuItemProps) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart(item, quantity);
    setQuantity(1); // Reset quantity after adding
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "coffee":
        return "bg-amber-100 text-amber-800";
      case "food":
        return "bg-green-100 text-green-800";
      case "desserts":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
      <div className="aspect-video relative overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cafe-bg to-orange-100 flex items-center justify-center">
            <span className="text-cafe-brown text-lg font-semibold">
              {item.name.charAt(0)}
            </span>
          </div>
        )}
        <Badge
          className={`absolute top-2 right-2 ${getCategoryColor(item.category)}`}
        >
          {item.category}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-sm text-gray-600 mb-2">
              {item.description}
            </p>
          )}
          <p className="text-xl font-bold text-cafe-brown">
            {parseFloat(item.price).toFixed(2)} DH
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            onClick={handleAddToCart}
            className="bg-cafe-accent hover:bg-orange-600 text-white"
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}