import {
  users,
  menuItems,
  orders,
  orderItems,
  tables,
  type User,
  type InsertUser,
  type MenuItem,
  type InsertMenuItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Table,
  type InsertTable,
  type OrderWithItems,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;

  // Menu operations
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(category: string): Promise<MenuItem[]>;
  getMenuItem(id: string): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, item: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: string): Promise<void>;

  // Order operations
  getOrders(): Promise<OrderWithItems[]>;
  getOrdersByStatus(status: string): Promise<OrderWithItems[]>;
  getOrder(id: string): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems>;
  updateOrderStatus(id: string, status: string): Promise<Order>;

  // Table operations
  getTables(): Promise<Table[]>;
  getTable(id: number): Promise<Table | undefined>;
  updateTableStatus(id: number, status: string): Promise<Table>;

  // Analytics
  getOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedToday: number;
    revenue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Menu operations
  async getMenuItems(): Promise<MenuItem[]> {
    return await db.select().from(menuItems).orderBy(menuItems.category, menuItems.name);
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    return await db
      .select()
      .from(menuItems)
      .where(and(eq(menuItems.category, category as any), eq(menuItems.isActive, true)))
      .orderBy(menuItems.name);
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item;
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    const [newItem] = await db.insert(menuItems).values(item).returning();
    return newItem;
  }

  async updateMenuItem(id: string, item: Partial<InsertMenuItem>): Promise<MenuItem> {
    const [updatedItem] = await db
      .update(menuItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteMenuItem(id: string): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }

  // Order operations
  async getOrders(): Promise<OrderWithItems[]> {
    const ordersWithItems = await db.query.orders.findMany({
      with: {
        orderItems: {
          with: {
            menuItem: true,
          },
        },
      },
      orderBy: [desc(orders.createdAt)],
    });
    return ordersWithItems;
  }

  async getOrdersByStatus(status: string): Promise<OrderWithItems[]> {
    const ordersWithItems = await db.query.orders.findMany({
      where: eq(orders.status, status as any),
      with: {
        orderItems: {
          with: {
            menuItem: true,
          },
        },
      },
      orderBy: [desc(orders.createdAt)],
    });
    return ordersWithItems;
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        orderItems: {
          with: {
            menuItem: true,
          },
        },
      },
    });
    return order;
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems> {
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    
    const [newOrder] = await db
      .insert(orders)
      .values({ ...order, orderNumber })
      .returning();

    const orderItemsData = items.map(item => ({
      ...item,
      orderId: newOrder.id,
    }));

    await db.insert(orderItems).values(orderItemsData);

    const createdOrder = await this.getOrder(newOrder.id);
    return createdOrder!;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Table operations
  async getTables(): Promise<Table[]> {
    return await db.select().from(tables).orderBy(tables.id);
  }

  async getTable(id: number): Promise<Table | undefined> {
    const [table] = await db.select().from(tables).where(eq(tables.id, id));
    return table;
  }

  async updateTableStatus(id: number, status: string): Promise<Table> {
    const [updatedTable] = await db
      .update(tables)
      .set({ status, updatedAt: new Date() })
      .where(eq(tables.id, id))
      .returning();
    return updatedTable;
  }

  // Analytics
  async getOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedToday: number;
    revenue: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [stats] = await db
      .select({
        totalOrders: sql<number>`count(*)`,
        pendingOrders: sql<number>`count(*) filter (where status = 'pending')`,
        completedToday: sql<number>`count(*) filter (where status = 'completed' and created_at >= ${today})`,
        revenue: sql<number>`coalesce(sum(total) filter (where status = 'completed' and created_at >= ${today}), 0)`,
      })
      .from(orders);

    return {
      totalOrders: Number(stats.totalOrders),
      pendingOrders: Number(stats.pendingOrders),
      completedToday: Number(stats.completedToday),
      revenue: Number(stats.revenue),
    };
  }
}

export const storage = new DatabaseStorage();
