// Migration script to add address fields to the users table

import { db } from './server/db.js';
import pg from 'pg';
const { Pool } = pg;

async function addAddressFields() {
  try {
    // Log the beginning of the migration
    console.log('Starting migration: Adding address fields to users table');
    
    // Connect to the database
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Define the SQL query to add the address fields
    const alterTableQuery = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS city TEXT,
      ADD COLUMN IF NOT EXISTS state TEXT,
      ADD COLUMN IF NOT EXISTS postal_code TEXT,
      ADD COLUMN IF NOT EXISTS country TEXT,
      ADD COLUMN IF NOT EXISTS latitude TEXT,
      ADD COLUMN IF NOT EXISTS longitude TEXT;
    `;
    
    // Execute the query
    await pool.query(alterTableQuery);
    
    // Update the sample data (Salon Elegante) with address information
    const updateSampleDataQuery = `
      UPDATE users 
      SET 
        address = '123 Main Street', 
        city = 'Santiago', 
        state = 'Region Metropolitana', 
        postal_code = '8320000', 
        country = 'Chile',
        latitude = '-33.4372',
        longitude = '-70.6506'
      WHERE business_slug = 'salonelegante';
    `;
    
    await pool.query(updateSampleDataQuery);
    
    console.log('Migration complete: Address fields added to users table');
    console.log('Sample data updated with address information');
    
    // Close the connection
    await pool.end();
    
    return { success: true, message: 'Address fields added successfully' };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error };
  }
}

// If this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  addAddressFields().then(result => {
    if (result.success) {
      console.log('Migration successful');
      process.exit(0);
    } else {
      console.error('Migration failed:', result.error);
      process.exit(1);
    }
  });
}

export { addAddressFields };