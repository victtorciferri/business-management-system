// Migration script to add payment-related fields to the users table

import pg from 'pg';
const { Pool } = pg;

async function addPaymentFields() {
  try {
    // Log the beginning of the migration
    console.log('Starting migration: Adding payment fields to users table');
    
    // Connect to the database
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Define the SQL query to add the payment fields
    const alterTableQuery = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
      ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
      ADD COLUMN IF NOT EXISTS mercadopago_customer_id TEXT;
    `;
    
    // Execute the query
    await pool.query(alterTableQuery);
    
    console.log('Successfully added payment fields to users table:');
    console.log('- stripe_customer_id (TEXT, nullable)');
    console.log('- stripe_subscription_id (TEXT, nullable)');
    console.log('- mercadopago_customer_id (TEXT, nullable)');
    
    // Close the database connection
    await pool.end();
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
addPaymentFields();
