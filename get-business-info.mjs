import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:AppointEase123!@34.176.74.36:5432/postgres'
});

async function getBusinessInfo() {
  try {
    const result = await pool.query(
      "SELECT id, business_name, business_slug FROM users WHERE business_slug = $1",
      ['salonelegante']
    );
    
    console.log('Business info for salonelegante:');
    if (result.rows.length > 0) {
      console.log('  ID:', result.rows[0].id);
      console.log('  Name:', result.rows[0].business_name);
      console.log('  Slug:', result.rows[0].business_slug);
    } else {
      console.log('  Business not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

getBusinessInfo();
