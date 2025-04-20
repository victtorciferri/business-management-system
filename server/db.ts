import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure neon to use WebSockets
neonConfig.webSocketConstructor = ws;

// Verify DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a singleton connection pool with optimized settings
// These settings help prevent connection exhaustion issues
let _pool: Pool | null = null;

export function getPool(): Pool {
  if (!_pool) {
    console.log("Creating new database connection pool");
    _pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
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
export const db = drizzle(pool, { 
  schema,
  logger: true // Enable query logging for debugging
});

// Cache management utility
export function closePool(): Promise<void> {
  if (_pool) {
    console.log('Closing database pool connections...');
    return _pool.end().then(() => {
      _pool = null;
    });
  }
  return Promise.resolve();
}

// Handle cleanup on process termination
process.on('exit', () => {
  if (_pool) {
    console.log('Process exiting - closing database pool');
    // On exit, we can only do synchronous operations
    _pool.end().catch(err => console.error('Error closing pool on exit:', err));
  }
});

process.on('SIGINT', () => {
  console.log('Received SIGINT - Closing database pool');
  closePool().then(() => process.exit(0));
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM - Closing database pool');
  closePool().then(() => process.exit(0));
});