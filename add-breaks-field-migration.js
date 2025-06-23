import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:AppointEase123!@34.176.74.36:5432/postgres';

const isLocalDB = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
const sslConfig = isLocalDB ? false : { rejectUnauthorized: false };

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: sslConfig
});

(async () => {
  try {
    console.log('Adding breaks field to staff_availability table...');
    
    // Add breaks column as JSONB to store array of break times
    await pool.query(`
      ALTER TABLE staff_availability 
      ADD COLUMN IF NOT EXISTS breaks JSONB DEFAULT '[]'::jsonb;
    `);
    
    console.log('✓ Breaks field added successfully!');
    
    // Verify the change
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'staff_availability' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\nUpdated staff_availability table structure:');
    console.table(result.rows);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
})();
