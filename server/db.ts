import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Initialize database URL
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log(`Connecting to database in ${process.env.NODE_ENV} mode`);

// Create a singleton connection pool
let _pool: Pool | null = null;

export function getPool(): Pool {
  if (!_pool) {
    console.log("Creating new database connection pool");
    
    // Determine SSL settings based on database URL
    const isLocalDB = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
    const sslConfig = isLocalDB ? false : { rejectUnauthorized: false };
    
    _pool = new Pool({
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: sslConfig,
      allowExitOnIdle: true
    });

    // Add error handler
    _pool.on('error', (err) => {
      console.error('Unexpected error on idle database client:', err);
      // Don't exit in production, try to recover
      if (process.env.NODE_ENV !== 'production') {
        process.exit(-1);
      }
    });

    // Test the connection
    _pool.connect()
      .then(client => {
        console.log('Successfully connected to database');
        client.release();
      })
      .catch(err => {
        console.error('Error connecting to database:', err);
        _pool = null; // Reset pool on connection failure
      });
  }
  return _pool;
}

// Initialize pool
export const pool = getPool();

// Create drizzle instance
export const db = drizzle(pool, { schema });

// Export query helper function with better error handling
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  let client;
  
  try {
    client = await pool.connect();
  } catch (error) {
    console.error('Failed to get database connection:', error);
    throw new Error('Database connection failed');
  }

  try {
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { 
        text, 
        duration, 
        rows: result.rowCount 
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error executing query:', {
      text,
      params,
      error: error.message,
      stack: error.stack
    });
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};