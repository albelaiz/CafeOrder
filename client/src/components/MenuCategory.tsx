import { Button } from "@/components/ui/button";
import { Coffee, Utensils, Cookie } from "lucide-react";

interface MenuCategoryProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function MenuCategory({ selectedCategory, onCategoryChange }: MenuCategoryProps) {
  const categories = [
    { id: "all", label: "All Items", icon: null },
    { id: "coffee", label: "Coffee", icon: Coffee },
    { id: "food", label: "Food", icon: Utensils },
    { id: "desserts", label: "Desserts", icon: Cookie },
  ];

  return (
    <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = selectedCategory === category.id;
        
        return (
          <Button
            key={category.id}
            variant={isActive ? "default" : "outline"}
            className={`whitespace-nowrap ${
              isActive
                ? "bg-cafe-brown text-white hover:bg-cafe-light"
                : "bg-gray-200 text-gray-700 hover:bg-cafe-light hover:text-white"
            }`}
            onClick={() => onCategoryChange(category.id)}
          >
            {Icon && <Icon className="w-4 h-4 mr-2" />}
            {category.label}
          </Button>
        );
      })}
    </div>
  );
}
