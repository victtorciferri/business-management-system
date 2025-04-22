/**
 * Migration script to add capacity and service_type columns to services table
 */
import { db, pool } from './server/db.js';
import { services } from './shared/schema.js';
import { sql } from 'drizzle-orm';

async function addServiceCapacityAndType() {
  try {
    console.log('Starting migration to add capacity and service_type columns to services table...');
    
    // Check if columns already exist
    const checkCapacityColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'services' AND column_name = 'capacity'
    `);
    
    const checkServiceTypeColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'services' AND column_name = 'service_type'
    `);
    
    // Add capacity column if it doesn't exist
    if (checkCapacityColumn.rowCount === 0) {
      console.log('Adding capacity column to services table...');
      await pool.query(`
        ALTER TABLE services
        ADD COLUMN capacity INTEGER DEFAULT 1
      `);
      console.log('Capacity column added successfully!');
    } else {
      console.log('Capacity column already exists.');
    }
    
    // Add service_type column if it doesn't exist
    if (checkServiceTypeColumn.rowCount === 0) {
      console.log('Adding service_type column to services table...');
      await pool.query(`
        ALTER TABLE services
        ADD COLUMN service_type TEXT DEFAULT 'individual'
      `);
      console.log('Service_type column added successfully!');
    } else {
      console.log('Service_type column already exists.');
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Error in migration:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Execute the function
addServiceCapacityAndType();