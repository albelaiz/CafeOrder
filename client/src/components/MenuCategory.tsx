import { Button } from "@/components/ui/button";
import { Coffee, UtensilsCrossed, Cookie } from "lucide-react";

interface MenuCategoryProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  { id: "all", name: "All", icon: UtensilsCrossed },
  { id: "coffee", name: "Coffee & Drinks", icon: Coffee },
  { id: "food", name: "Food", icon: UtensilsCrossed },
  { id: "desserts", name: "Desserts", icon: Cookie },
];

export function MenuCategory({ selectedCategory, onCategoryChange }: MenuCategoryProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Menu</h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => onCategoryChange(category.id)}
              className={`flex items-center space-x-2 ${
                selectedCategory === category.id
                  ? "bg-cafe-brown hover:bg-cafe-light text-white"
                  : "hover:bg-cafe-bg"
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{category.name}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}