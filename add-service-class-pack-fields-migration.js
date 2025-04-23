/**
 * Migration script to add class pack fields to services table
 */
import { db, pool } from './server/db.js';
import { services } from './shared/schema.js';
import { sql } from 'drizzle-orm';

async function addServiceClassPackFields() {
  try {
    console.log('Starting migration: Adding class pack fields to services table...');
    
    // Add is_recurring column 
    await db.execute(sql`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE
    `);
    console.log('Added is_recurring column');
    
    // Add recurring_days column 
    await db.execute(sql`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS recurring_days TEXT
    `);
    console.log('Added recurring_days column');
    
    // Add recurring_time column 
    await db.execute(sql`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS recurring_time TEXT
    `);
    console.log('Added recurring_time column');
    
    // Add sessions_per_month column 
    await db.execute(sql`
      ALTER TABLE services 
      ADD COLUMN IF NOT EXISTS sessions_per_month INTEGER
    `);
    console.log('Added sessions_per_month column');
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

addServiceClassPackFields();