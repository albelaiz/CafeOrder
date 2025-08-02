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
import { db, dbError } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

const DB_UNAVAILABLE_ERROR = "Database is not available. Please check the server configuration and logs.";

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
  createTable(data: InsertTable): Promise<Table>;
  updateTable(id: number, data: Partial<InsertTable>): Promise<Table>;
  updateTableStatus(id: number, status: string): Promise<Table>;
  deleteTable(id: number): Promise<void>;

  // Analytics
  getOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedToday: number;
    revenue: number;
  }>;

  getRevenueStats(): Promise<{
    totalRevenue: number;
    currentMonthRevenue: number;
    previousMonthRevenue: number;
    percentageChange: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  private checkDb() {
    if (!db || dbError) {
      console.error("Database operation failed:", dbError?.message || "DB object is null");
      throw new Error(DB_UNAVAILABLE_ERROR);
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    this.checkDb();
    const [user] = await db!.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    this.checkDb();
    const [user] = await db!.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    this.checkDb();
    const [user] = await db!
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    this.checkDb();
    const [user] = await db!
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Menu operations
  async getMenuItems(): Promise<MenuItem[]> {
    this.checkDb();
    return await db!.select().from(menuItems).orderBy(menuItems.category, menuItems.name);
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    this.checkDb();
    return await db!
      .select()
      .from(menuItems)
      .where(and(eq(menuItems.category, category as any), eq(menuItems.isActive, true)))
      .orderBy(menuItems.name);
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    this.checkDb();
    const [item] = await db!.select().from(menuItems).where(eq(menuItems.id, id));
    return item;
  }

  async createMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    this.checkDb();
    const [newItem] = await db!.insert(menuItems).values(item).returning();
    return newItem;
  }

  async updateMenuItem(id: string, item: Partial<InsertMenuItem>): Promise<MenuItem> {
    this.checkDb();
    const [updatedItem] = await db!
      .update(menuItems)
      .set({ ...item, updatedAt: new Date() })
      .where(eq(menuItems.id, id))
      .returning();
    return updatedItem;
  }

  async deleteMenuItem(id: string): Promise<void> {
    this.checkDb();
    const existingOrderItems = await db!
      .select()
      .from(orderItems)
      .where(eq(orderItems.menuItemId, id))
      .limit(1);

    if (existingOrderItems.length > 0) {
      throw new Error("Cannot delete menu item that has been ordered. Mark as inactive instead.");
    }

    await db!.delete(menuItems).where(eq(menuItems.id, id));
  }

  // Order operations
  async getOrders(): Promise<OrderWithItems[]> {
    this.checkDb();
    const ordersWithItems = await db!.query.orders.findMany({
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
    this.checkDb();
    const ordersWithItems = await db!.query.orders.findMany({
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
    this.checkDb();
    const order = await db!.query.orders.findFirst({
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
    this.checkDb();
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    
    const [newOrder] = await db!
      .insert(orders)
      .values({ ...order, orderNumber })
      .returning();

    const orderItemsData = items.map(item => ({
      ...item,
      orderId: newOrder.id,
    }));

    await db!.insert(orderItems).values(orderItemsData);

    const createdOrder = await this.getOrder(newOrder.id);
    return createdOrder!;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    this.checkDb();
    const [updatedOrder] = await db!
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Table operations
  async getTables(): Promise<Table[]> {
    this.checkDb();
    return await db!.select().from(tables).orderBy(tables.number);
  }

  async getTable(id: number): Promise<Table | undefined> {
    this.checkDb();
    const [table] = await db!.select().from(tables).where(eq(tables.id, id));
    return table;
  }

  async createTable(data: InsertTable): Promise<Table> {
    this.checkDb();
    const [newTable] = await db!.insert(tables).values(data).returning();
    return newTable;
  }

  async updateTable(id: number, data: partial<InsertTable>): Promise<Table> {
    this.checkDb();
    const [updatedTable] = await db!
      .update(tables)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tables.id, id))
      .returning();
    return updatedTable;
  }

  async updateTableStatus(id: number, status: string): Promise<Table> {
    this.checkDb();
    const [updatedTable] = await db!
      .update(tables)
      .set({ status, updatedAt: new Date() })
      .where(eq(tables.id, id))
      .returning();
    return updatedTable;
  }

  async deleteTable(id: number): Promise<void> {
    this.checkDb();
    await db!.delete(tables).where(eq(tables.id, id));
  }

  // Analytics
  async getOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedToday: number;
    revenue: number;
  }> {
    this.checkDb();
    const allOrders = await db!.select().from(orders);
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(order => order.status === "pending").length;
    const totalRevenue = allOrders
      .filter(order => order.status === "completed")
      .reduce((sum, order) => sum + parseFloat(order.total), 0);

    const ordersToday = allOrders.filter(order => 
      order.createdAt && new Date(order.createdAt) >= startOfDay
    ).length;

    return {
      totalOrders,
      pendingOrders,
      completedToday: ordersToday,
      revenue: totalRevenue,
    };
  }

  async getRevenueStats(): Promise<{
    totalRevenue: number;
    currentMonthRevenue: number;
    previousMonthRevenue: number;
    percentageChange: number;
  }> {
    this.checkDb();
    const allOrders = await db!.select().from(orders).where(eq(orders.status, "completed"));
    
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    
    const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    
    const currentMonthOrders = allOrders.filter(order => 
      order.createdAt && new Date(order.createdAt) >= currentMonthStart
    );
    const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    
    const previousMonthOrders = allOrders.filter(order => 
      order.createdAt && 
      new Date(order.createdAt) >= previousMonthStart && 
      new Date(order.createdAt) <= previousMonthEnd
    );
    const previousMonthRevenue = previousMonthOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    
    const percentageChange = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : currentMonthRevenue > 0 ? 100 : 0;
    
    return {
      totalRevenue,
      currentMonthRevenue,
      previousMonthRevenue,
      percentageChange: Math.round(percentageChange * 100) / 100,
    };
  }
}

export const storage = new DatabaseStorage();
