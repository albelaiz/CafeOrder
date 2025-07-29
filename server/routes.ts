import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertMenuItemSchema, insertOrderSchema, insertOrderItemSchema, insertTableSchema } from "@shared/schema";
import { z } from "zod";
import ExcelJS from "exceljs";

const orderCreationSchema = z.object({
  order: insertOrderSchema,
  items: z.array(insertOrderItemSchema),
});

export function registerRoutes(app: Express): Server {
  // Auth middleware - setup login/logout/session routes
  setupAuth(app);

  // Public menu routes (no auth required)
  app.get("/api/menu", async (req, res) => {
    try {
      const { category } = req.query;
      const menuItems = category 
        ? await storage.getMenuItemsByCategory(category as string)
        : await storage.getMenuItems();
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.get("/api/menu/:id", async (req, res) => {
    try {
      const item = await storage.getMenuItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching menu item:", error);
      res.status(500).json({ message: "Failed to fetch menu item" });
    }
  });

  // Admin menu routes (requires admin role)
  app.post("/api/menu", isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertMenuItemSchema.parse(req.body);
      const item = await storage.createMenuItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating menu item:", error);
        res.status(500).json({ message: "Failed to create menu item" });
      }
    }
  });

  app.put("/api/menu/:id", isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const validatedData = insertMenuItemSchema.partial().parse(req.body);
      const item = await storage.updateMenuItem(req.params.id, validatedData);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error updating menu item:", error);
        res.status(500).json({ message: "Failed to update menu item" });
      }
    }
  });

  app.delete("/api/menu/:id", isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteMenuItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // Public order routes (no auth required for customers)
  app.post("/api/orders", async (req, res) => {
    try {
      const { order, items } = orderCreationSchema.parse(req.body);
      const createdOrder = await storage.createOrder(order, items);
      res.status(201).json(createdOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Failed to create order" });
      }
    }
  });

  // Staff/Admin order routes (requires authentication)
  app.get("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role === "customer") {
        return res.status(403).json({ message: "Staff or admin access required" });
      }

      const { status } = req.query;
      const orders = status 
        ? await storage.getOrdersByStatus(status as string)
        : await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role === "customer") {
        return res.status(403).json({ message: "Staff or admin access required" });
      }

      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.patch("/api/orders/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role === "customer") {
        return res.status(403).json({ message: "Staff or admin access required" });
      }

      const { status } = req.body;
      const updatedOrder = await storage.updateOrderStatus(req.params.id, status);
      
      // Broadcast to all connected clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "ORDER_STATUS_UPDATED",
            data: updatedOrder
          }));
        }
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Table routes
  app.get("/api/tables", isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role === "customer") {
        return res.status(403).json({ message: "Staff or admin access required" });
      }

      const tables = await storage.getTables();
      res.json(tables);
    } catch (error) {
      console.error("Error fetching tables:", error);
      res.status(500).json({ message: "Failed to fetch tables" });
    }
  });

  app.patch("/api/tables/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role === "customer") {
        return res.status(403).json({ message: "Staff or admin access required" });
      }

      const { status } = req.body;
      const updatedTable = await storage.updateTableStatus(parseInt(req.params.id), status);
      
      // Broadcast to all connected clients
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "TABLE_STATUS_UPDATED",
            data: updatedTable
          }));
        }
      });

      res.json(updatedTable);
    } catch (error) {
      console.error("Error updating table status:", error);
      res.status(500).json({ message: "Failed to update table status" });
    }
  });

  // Table management routes (admin only)
  app.post("/api/tables", isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { number, capacity } = req.body;
      
      // Generate proper QR code URL - get current domain from request
      const protocol = req.secure ? 'https' : 'http';
      const host = req.get('host');
      const baseUrl = `${protocol}://${host}`;
      const qrCode = `${baseUrl}/order?t=${number}`;
      
      const tableData = {
        number,
        capacity: capacity || 4,
        status: "available",
        qrCode,
      };

      const newTable = await storage.createTable(tableData as any);
      res.status(201).json(newTable);
    } catch (error) {
      console.error("Error creating table:", error);
      res.status(500).json({ message: "Failed to create table" });
    }
  });

  app.put("/api/tables/:id", isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { capacity, status } = req.body;
      const updatedTable = await storage.updateTable(parseInt(req.params.id), {
        capacity,
        status,
      });
      res.json(updatedTable);
    } catch (error) {
      console.error("Error updating table:", error);
      res.status(500).json({ message: "Failed to update table" });
    }
  });

  app.delete("/api/tables/:id", isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteTable(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting table:", error);
      res.status(500).json({ message: "Failed to delete table" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/stats", isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role === "customer") {
        return res.status(403).json({ message: "Staff or admin access required" });
      }

      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Excel export route (admin only)
  app.get("/api/export/excel", isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const workbook = new ExcelJS.Workbook();
      
      // Orders sheet
      const ordersSheet = workbook.addWorksheet("Orders");
      ordersSheet.columns = [
        { header: "Order Number", key: "orderNumber", width: 15 },
        { header: "Table Number", key: "tableNumber", width: 12 },
        { header: "Status", key: "status", width: 12 },
        { header: "Items", key: "items", width: 40 },
        { header: "Subtotal", key: "subtotal", width: 12 },
        { header: "Tax", key: "tax", width: 10 },
        { header: "Total", key: "total", width: 12 },
        { header: "Order Time", key: "createdAt", width: 20 },
        { header: "Notes", key: "notes", width: 30 },
      ];

      const orders = await storage.getOrders();
      orders.forEach(order => {
        const items = order.orderItems.map(item => 
          `${item.menuItem.name} x${item.quantity} ($${item.unitPrice})`
        ).join("; ");
        
        ordersSheet.addRow({
          orderNumber: order.orderNumber,
          tableNumber: order.tableNumber,
          status: order.status,
          items,
          subtotal: `$${order.subtotal}`,
          tax: `$${order.tax}`,
          total: `$${order.total}`,
          createdAt: order.createdAt?.toLocaleString() || "",
          notes: order.notes || "",
        });
      });

      // Menu items sheet
      const menuSheet = workbook.addWorksheet("Menu Items");
      menuSheet.columns = [
        { header: "Name", key: "name", width: 25 },
        { header: "Description", key: "description", width: 40 },
        { header: "Price", key: "price", width: 12 },
        { header: "Category", key: "category", width: 15 },
        { header: "Active", key: "isActive", width: 10 },
        { header: "Created At", key: "createdAt", width: 20 },
      ];

      const menuItems = await storage.getMenuItems();
      menuItems.forEach(item => {
        menuSheet.addRow({
          name: item.name,
          description: item.description || "",
          price: `$${item.price}`,
          category: item.category,
          isActive: item.isActive ? "Yes" : "No",
          createdAt: item.createdAt?.toLocaleString() || "",
        });
      });

      // Set headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=cafe-direct-data-${new Date().toISOString().split('T')[0]}.xlsx`);

      // Write to response
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Error generating Excel export:", error);
      res.status(500).json({ message: "Failed to generate Excel export" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
      } catch (error) {
        console.error('Invalid JSON message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}