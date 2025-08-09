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
        return "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30";
      case "food":
        return "bg-yellow-400/15 text-yellow-300 border border-yellow-300/30";
      case "desserts":
        return "bg-yellow-400/25 text-yellow-200 border border-yellow-200/30";
      default:
        return "bg-gray-600/20 text-gray-300 border border-gray-300/30";
    }
  };

  return (
    <Card className="card-restaurant hover-lift bg-gray-900 border-gray-700">
      <div className="aspect-video relative overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-b border-yellow-400/20">
            <span className="text-yellow-400 text-2xl font-bold">
              {item.name.charAt(0)}
            </span>
          </div>
        )}
        <Badge
          className={`absolute top-3 right-3 ${getCategoryColor(item.category)} font-medium`}
        >
          {item.category}
        </Badge>
      </div>
      
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-sm text-gray-300 mb-3 leading-relaxed">
              {item.description}
            </p>
          )}
          <p className="text-2xl font-bold text-yellow-400">
            {parseFloat(item.price).toFixed(2)} DH
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="border-gray-600 hover:border-yellow-400 hover:bg-yellow-400/10 text-white"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-medium min-w-[3rem] text-center">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(quantity + 1)}
              className="border-gray-600 hover:border-yellow-400 hover:bg-yellow-400/10 text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            onClick={handleAddToCart}
            className="btn-restaurant"
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}