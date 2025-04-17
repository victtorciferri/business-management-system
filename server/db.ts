import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a connection pool to the database with optimized settings
// Lower max connections to avoid exhausting connection limit
// Add idle timeout to return connections to the pool
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10,                // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Return to pool after 30 seconds idle
  connectionTimeoutMillis: 5000, // Try to connect for 5 seconds
});

// Create a Drizzle ORM instance with our schema
export const db = drizzle(pool, { schema });

// Handle cleanup on process termination
process.on('exit', () => {
  console.log('Closing database pool connections...');
  pool.end();
});

process.on('SIGINT', () => {
  console.log('Received SIGINT - Closing database pool connections...');
  pool.end().then(() => process.exit(0));
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM - Closing database pool connections...');
  pool.end().then(() => process.exit(0));
});