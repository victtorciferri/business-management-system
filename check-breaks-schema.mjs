import { pool } from './server/db.ts';

(async () => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'staff_availability' 
      ORDER BY ordinal_position;
    `);
    
    console.log('Current staff_availability table structure:');
    console.table(result.rows);
    
    // Also check if there's a breaks table
    const breaksTables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%break%';
    `);
    
    console.log('\nTables containing "break":');
    console.table(breaksTables.rows);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
})();
