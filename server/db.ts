import { Pool } from 'pg'; // Correct import
import { drizzle } from 'drizzle-orm/node-postgres'; // Correct import
import * as schema from "@shared/schema";

// Hardcoded DATABASE_URL for MVP
const databaseUrl = "postgresql://postgres:AppointEase123!@34.176.74.36:5432/postgres";

console.log("Database URL:", databaseUrl);
// Create a singleton connection pool with optimized settings
// These settings help prevent connection exhaustion issues, and use the correct pool
let _pool: Pool | null = null;

export function getPool(): Pool {
  if (!_pool) {
    console.log("Creating new database connection pool");
      _pool = new Pool({
        connectionString: databaseUrl,
      max: 5,                // Limit max connections to avoid exhaustion issues
      idleTimeoutMillis: 10000, // Return to pool after 10 seconds idle
      connectionTimeoutMillis: 3000, // Try to connect for 3 seconds
      allowExitOnIdle: true // Allow the process to exit if pool is idle
    });
  }
  return _pool;
}

// Create a Drizzle ORM instance with our schema
export const pool = getPool();
export const db = drizzle(pool, { schema });