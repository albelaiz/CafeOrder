import "dotenv/config";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle, type NeonDatabase } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

let db: NeonDatabase<typeof schema> | null = null;
let pool: Pool | null = null;
let dbError: Error | null = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
  } catch (error) {
    console.error("Failed to initialize database connection:", error);
    dbError = error instanceof Error ? error : new Error(String(error));
  }
} else {
  const errorMessage = "DATABASE_URL is not set. The application will run without a database connection. Please set the DATABASE_URL environment variable for full functionality.";
  console.warn(errorMessage);
  dbError = new Error(errorMessage);
}

export { db, pool, dbError };