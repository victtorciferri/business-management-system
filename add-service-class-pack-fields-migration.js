/**
 * Migration script to add class pack fields to services table
 */
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

async function addServiceClassPackFields() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Starting migration to add class pack fields to services table...');
    
    // Check if columns already exist
    const checkIsRecurringColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'services' AND column_name = 'is_recurring'
    `);
    
    const checkRecurringDaysColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'services' AND column_name = 'recurring_days'
    `);
    
    const checkRecurringTimeColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'services' AND column_name = 'recurring_time'
    `);
    
    const checkSessionsPerMonthColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'services' AND column_name = 'sessions_per_month'
    `);
    
    // Add is_recurring column if it doesn't exist
    if (checkIsRecurringColumn.rowCount === 0) {
      console.log('Adding is_recurring column to services table...');
      await pool.query(`
        ALTER TABLE services
        ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE
      `);
      console.log('is_recurring column added successfully!');
    } else {
      console.log('is_recurring column already exists.');
    }
    
    // Add recurring_days column if it doesn't exist
    if (checkRecurringDaysColumn.rowCount === 0) {
      console.log('Adding recurring_days column to services table...');
      await pool.query(`
        ALTER TABLE services
        ADD COLUMN recurring_days TEXT
      `);
      console.log('recurring_days column added successfully!');
    } else {
      console.log('recurring_days column already exists.');
    }
    
    // Add recurring_time column if it doesn't exist
    if (checkRecurringTimeColumn.rowCount === 0) {
      console.log('Adding recurring_time column to services table...');
      await pool.query(`
        ALTER TABLE services
        ADD COLUMN recurring_time TEXT
      `);
      console.log('recurring_time column added successfully!');
    } else {
      console.log('recurring_time column already exists.');
    }
    
    // Add sessions_per_month column if it doesn't exist
    if (checkSessionsPerMonthColumn.rowCount === 0) {
      console.log('Adding sessions_per_month column to services table...');
      await pool.query(`
        ALTER TABLE services
        ADD COLUMN sessions_per_month INTEGER
      `);
      console.log('sessions_per_month column added successfully!');
    } else {
      console.log('sessions_per_month column already exists.');
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
addServiceClassPackFields();