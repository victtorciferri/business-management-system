import { db, pool } from './server/db.js';
import { sql } from 'drizzle-orm';

async function addStaffIdColumn() {
  console.log('Checking if staff_id column exists in appointments table...');
  
  try {
    // Check if the column exists
    const columnExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='appointments' AND column_name='staff_id'
      );
    `);
    
    const exists = columnExists.rows[0].exists;
    
    if (!exists) {
      console.log('Adding staff_id column to appointments table...');
      
      // Add the column
      await db.execute(sql`
        ALTER TABLE appointments
        ADD COLUMN staff_id INTEGER REFERENCES users(id);
      `);
      
      console.log('Column added successfully!');
    } else {
      console.log('Column already exists, no changes needed.');
    }
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the migration
addStaffIdColumn();