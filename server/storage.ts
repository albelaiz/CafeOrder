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
    // First check if the menu item exists in any orders
    const existingOrderItems = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.menuItemId, id))
      .limit(1);

    if (existingOrderItems.length > 0) {
      throw new Error("Cannot delete menu item that has been ordered. Mark as inactive instead.");
    }

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
    return await db.select().from(tables).orderBy(tables.number);
  }

  async getTable(id: number): Promise<Table | undefined> {
    const [table] = await db.select().from(tables).where(eq(tables.id, id));
    return table;
  }

  async createTable(data: InsertTable): Promise<Table> {
    const [newTable] = await db.insert(tables).values(data).returning();
    return newTable;
  }

  async updateTable(id: number, data: Partial<InsertTable>): Promise<Table> {
    const [updatedTable] = await db
      .update(tables)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tables.id, id))
      .returning();
    return updatedTable;
  }

  async updateTableStatus(id: number, status: string): Promise<Table> {
    const [updatedTable] = await db
      .update(tables)
      .set({ status, updatedAt: new Date() })
      .where(eq(tables.id, id))
      .returning();
    return updatedTable;
  }

  async deleteTable(id: number): Promise<void> {
    await db.delete(tables).where(eq(tables.id, id));
  }

  // Analytics
  async getOrderStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedToday: number;
    revenue: number;
  }> {
    const allOrders = await db.select().from(orders);
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter(order => order.status === "pending").length;
    const completedOrders = allOrders.filter(order => order.status === "completed").length;
    const totalRevenue = allOrders
      .filter(order => order.status === "completed")
      .reduce((sum, order) => sum + parseFloat(order.total), 0);

    const ordersToday = allOrders.filter(order => 
      order.createdAt && new Date(order.createdAt) >= startOfDay
    ).length;

    const ordersThisWeek = allOrders.filter(order => 
      order.createdAt && new Date(order.createdAt) >= startOfWeek
    ).length;

    const ordersThisMonth = allOrders.filter(order => 
      order.createdAt && new Date(order.createdAt) >= startOfMonth
    ).length;

    // Get most ordered items
    const orderItemsData = await db
      .select({
        name: menuItems.name,
        category: menuItems.category,
        totalQuantity: sql<number>`SUM(${orderItems.quantity})`.as('totalQuantity')
      })
      .from(orderItems)
      .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .groupBy(menuItems.id, menuItems.name, menuItems.category)
      .orderBy(sql`SUM(${orderItems.quantity}) DESC`)
      .limit(5);

    const mostOrderedItems = orderItemsData.map(item => ({
      name: item.name,
      count: Number(item.totalQuantity),
      category: item.category
    }));

    // Get active tables count
    const allTables = await db.select().from(tables);
    const activeTables = allTables.filter(table => table.status === "available" || table.status === "occupied").length;

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
    const allOrders = await db.select().from(orders).where(eq(orders.status, "completed"));
    
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
