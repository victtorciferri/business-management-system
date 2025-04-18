/**
 * Migration script to add is_default column to themes table
 */
import { pool } from './server/db.js';

async function addIsDefaultColumn() {
  try {
    // First check if column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'themes' AND column_name = 'is_default';
    `;
    
    const checkResult = await pool.query(checkColumnQuery);
    
    if (checkResult.rows.length === 0) {
      console.log('Adding is_default column to themes table...');
      
      // Add the is_default column
      const addColumnQuery = `
        ALTER TABLE themes 
        ADD COLUMN is_default BOOLEAN DEFAULT FALSE;
      `;
      
      await pool.query(addColumnQuery);
      console.log('Successfully added is_default column.');
      
      // Update the is_default values based on is_preset (if that column exists)
      const checkPresetColumnQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'themes' AND column_name = 'is_preset';
      `;
      
      const presetCheckResult = await pool.query(checkPresetColumnQuery);
      
      if (presetCheckResult.rows.length > 0) {
        console.log('Copying values from is_preset to is_default...');
        
        const updateQuery = `
          UPDATE themes
          SET is_default = is_preset;
        `;
        
        await pool.query(updateQuery);
        console.log('Successfully copied is_preset values to is_default.');
      }
    } else {
      console.log('Column is_default already exists in themes table.');
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error in migration:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Execute the migration
addIsDefaultColumn();