import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure Neon to use WebSockets
neonConfig.webSocketConstructor = ws;

async function createCustomerAccessTokensTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS customer_access_tokens (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        business_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        last_used_at TIMESTAMP WITH TIME ZONE
      );
    `);
    
    console.log('Successfully created customer_access_tokens table');
  } catch (error) {
    console.error('Error creating customer_access_tokens table:', error);
  } finally {
    await pool.end();
  }
}

createCustomerAccessTokensTable();