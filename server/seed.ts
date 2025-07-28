import { db } from "./db";
import { menuItems, users } from "@shared/schema";
import { hashPassword } from "./auth";

const sampleMenuItems = [
  // Coffee & Drinks
  {
    name: "Espresso",
    category: "coffee" as const,
    price: "35.00",
    description: "Rich, bold shot of espresso with a perfect crema",
    imageUrl: null,
    isActive: true,
  },
  {
    name: "Cappuccino",
    category: "coffee" as const,
    price: "45.00",
    description: "Classic espresso with steamed milk and foam",
    imageUrl: null,
    isActive: true,
  },
  {
    name: "Latte",
    category: "coffee" as const,
    price: "50.00",
    description: "Smooth espresso with steamed milk and light foam",
    imageUrl: null,
    isActive: true,
  },
  {
    name: "Cold Brew",
    category: "coffee" as const,
    price: "40.00",
    description: "Smooth, cold-brewed coffee served over ice",
    imageUrl: null,
    isActive: true,
  },
  {
    name: "Green Tea",
    category: "coffee" as const,
    price: "30.00",
    description: "Premium organic green tea, hot or iced",
    imageUrl: null,
    isActive: true,
  },

  // Food
  {
    name: "Avocado Toast",
    category: "food" as const,
    price: "85.00",
    description: "Fresh avocado on sourdough with sea salt and lemon",
    imageUrl: null,
    isActive: true,
  },
  {
    name: "Grilled Cheese Sandwich",
    category: "food" as const,
    price: "7.25",
    description: "Classic grilled cheese on artisan bread",
    imageUrl: null,
    isActive: true,
  },
  {
    name: "Caesar Salad",
    category: "food" as const,
    price: "9.75",
    description: "Crisp romaine, parmesan, croutons, and caesar dressing",
    imageUrl: null,
    isActive: true,
  },
  {
    name: "Chicken Wrap",
    category: "food" as const,
    price: "10.50",
    description: "Grilled chicken, vegetables, and sauce in a tortilla wrap",
    imageUrl: null,
    isActive: true,
  },
  {
    name: "Soup of the Day",
    category: "food" as const,
    price: "6.75",
    description: "Chef's daily soup selection with bread",
    imageUrl: null,
    isActive: true,
  },

  // Desserts
  {
    name: "Chocolate Croissant",
    category: "desserts" as const,
    price: "4.25",
    description: "Buttery croissant filled with rich chocolate",
    imageUrl: null,
    isActive: true,
  },
  {
    name: "Cheesecake Slice",
    category: "desserts" as const,
    price: "5.50",
    description: "New York style cheesecake with berry compote",
    imageUrl: null,
    isActive: true,
  },
  {
    name: "Chocolate Chip Cookie",
    category: "desserts" as const,
    price: "2.75",
    description: "Warm, freshly baked chocolate chip cookie",
    imageUrl: null,
    isActive: true,
  },
  {
    name: "Fruit Tart",
    category: "desserts" as const,
    price: "4.75",
    description: "Fresh seasonal fruit on vanilla custard tart",
    imageUrl: null,
    isActive: true,
  },
];

const sampleUsers = [
  {
    username: "admin",
    password: "admin123", // Will be hashed
    firstName: "Admin",
    lastName: "User",
    role: "admin",
  },
  {
    username: "staff",
    password: "staff123", // Will be hashed
    firstName: "Staff",
    lastName: "Member",
    role: "staff",
  },
];

async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Clear existing data
    await db.delete(menuItems);
    await db.delete(users);

    // Insert sample users with hashed passwords
    const usersWithHashedPasswords = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await hashPassword(user.password),
      }))
    );
    
    await db.insert(users).values(usersWithHashedPasswords);
    console.log("Sample users inserted");

    // Insert sample menu items
    await db.insert(menuItems).values(sampleMenuItems);
    console.log("Sample menu items inserted");

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => process.exit(0));
}

export { seedDatabase };