import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Hardcoded DATABASE_URL for MVP
const databaseUrl = "postgresql://postgres:AppointEase123!@34.176.74.36:5432/postgres";

console.log("Database URL:", databaseUrl);

// Create a singleton connection pool with optimized settings
// This helps prevent connection exhaustion issues, and manages pool lifecycle
let _pool: Pool | null = null;

export function getPool(): Pool {
  if (!_pool) {
    console.log("Creating new database connection pool");
    _pool = new Pool({
      connectionString: databaseUrl,
      max: 5,        // Limit max connections to avoid exhausting resources
      idleTimeoutMillis: 10000, // Return to pool after 10 seconds
      connectionTimeoutMillis: 3000, // Try to connect for 3 seconds
      allowExitOnIdle: true // Allow the process to exit if pool is idle
    });
  }
  return _pool;
}

// Initialize pool
const pool = getPool();

// Create drizzle instance
export const db = drizzle(pool, { schema });

// Export query helper function
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

// Export pool for direct use if needed
export { pool };