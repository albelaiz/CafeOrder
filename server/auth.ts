import bcrypt from "bcryptjs";
import session from "express-session";
import { Express } from "express";
import { storage } from "./storage";
import connectPg from "connect-pg-simple";
import { loginSchema } from "@shared/schema";
import { ZodError } from "zod";

const PostgresSessionStore = connectPg(session);

declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      role: string;
    }
  }
}

// Session configuration
export function setupAuth(app: Express) {
  const sessionStore = new PostgresSessionStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    tableName: "sessions",
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  app.use(session(sessionSettings));

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set user session
      (req.session as any).user = {
        id: user.id,
        username: user.username,
        role: user.role,
      };

      res.json({ 
        id: user.id, 
        username: user.username, 
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
      }
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("connect.sid", {
        path: '/',
        httpOnly: true,
        secure: false // Set to true in production with HTTPS
      });
      res.json({ message: "Logged out successfully" });
    });
  });

  // Get current user endpoint
  app.get("/api/auth/user", (req, res) => {
    const user = (req.session as any)?.user;
    if (!user || !req.session || !req.sessionID) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(user);
  });
}

// Authentication middleware
export function isAuthenticated(req: any, res: any, next: any) {
  const user = (req.session as any)?.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.user = user;
  next();
}

// Hash password utility
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}