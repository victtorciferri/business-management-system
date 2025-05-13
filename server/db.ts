import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Initialize database URL
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:AppointEase123!@34.176.74.36:5432/postgres";

console.log("Database URL:", databaseUrl);

// Create a singleton connection pool
let _pool: Pool | null = null;

export function getPool(): Pool {
  if (!_pool) {
    console.log("Creating new database connection pool");
    _pool = new Pool({
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : undefined,
      allowExitOnIdle: true
    });

    // Add error handler
    _pool.on('error', (err) => {
      console.error('Unexpected error on idle database client', err);
      process.exit(-1);
    });
  }
  return _pool;
}

// Initialize pool
export const pool = getPool();

// Create drizzle instance
export const db = drizzle(pool, { schema });

// Export query helper function
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  } finally {
    client.release();
  }
};