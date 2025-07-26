import { storage } from "./storage";
import { hashPassword } from "./auth";

async function seedUsers() {
  try {
    console.log("Seeding staff and admin users...");

    // Create admin user
    const adminExists = await storage.getUserByUsername("admin");
    if (!adminExists) {
      await storage.createUser({
        username: "admin",
        password: await hashPassword("admin123"),
        firstName: "Admin",
        lastName: "User",
        role: "admin",
      });
      console.log("✓ Admin user created (username: admin, password: admin123)");
    } else {
      console.log("✓ Admin user already exists");
    }

    // Create staff user
    const staffExists = await storage.getUserByUsername("staff");
    if (!staffExists) {
      await storage.createUser({
        username: "staff",
        password: await hashPassword("staff123"),
        firstName: "Staff",
        lastName: "Member",
        role: "staff",
      });
      console.log("✓ Staff user created (username: staff, password: staff123)");
    } else {
      console.log("✓ Staff user already exists");
    }

    console.log("Users seeding completed!");
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedUsers().then(() => process.exit(0));
}

export { seedUsers };