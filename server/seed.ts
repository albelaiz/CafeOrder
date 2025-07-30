import { db } from "./db";
import { menuItems, users, tables } from "@shared/schema";
import { hashPassword } from "./auth";

async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...");

    // Create admin user
    const adminPassword = await hashPassword("admin123");
    await db.insert(users).values({
      username: "admin",
      password: adminPassword,
      role: "admin",
      firstName: "Admin",
      lastName: "User",
    }).onConflictDoNothing();

    // Create staff user
    const staffPassword = await hashPassword("staff123");
    await db.insert(users).values({
      username: "staff",
      password: staffPassword,
      role: "staff", 
      firstName: "Staff",
      lastName: "User",
    }).onConflictDoNothing();

    // Create sample menu items
    const sampleMenuItems = [
      {
        name: "Espresso",
        description: "Rich and bold espresso shot",
        price: "2.50",
        category: "hot_drinks" as const,
        isActive: true,
        imageUrl: "/api/placeholder/300/200"
      },
      {
        name: "Cappuccino",
        description: "Espresso with steamed milk foam",
        price: "4.25",
        category: "hot_drinks" as const,
        isActive: true,
        imageUrl: "/api/placeholder/300/200"
      },
      {
        name: "Croissant",
        description: "Buttery, flaky pastry",
        price: "3.75",
        category: "food" as const,
        isActive: true,
        imageUrl: "/api/placeholder/300/200"
      }
    ];

    for (const item of sampleMenuItems) {
      await db.insert(menuItems).values(item).onConflictDoNothing();
    }

    // Create sample tables
    const sampleTables = [
      { number: 1, capacity: 2, status: "available" as const },
      { number: 2, capacity: 4, status: "available" as const },
      { number: 3, capacity: 6, status: "available" as const },
    ];

    for (const table of sampleTables) {
      await db.insert(tables).values(table).onConflictDoNothing();
    }

    console.log("✅ Database seeded successfully!");
    console.log("Admin credentials: admin / admin123");
    console.log("Staff credentials: staff / staff123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seedDatabase().then(() => {
  console.log("Seeding complete!");
  process.exit(0);
}).catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});