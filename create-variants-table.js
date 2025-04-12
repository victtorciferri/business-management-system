import { pool } from './server/db.ts';

async function createVariantsTable() {
  const client = await pool.connect();
  
  try {
    console.log('Creating product_variants table...');
    
    // Drop the table if it exists
    // await client.query(`DROP TABLE IF EXISTS product_variants;`);
    
    // Create the table
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        sku TEXT,
        size TEXT,
        color TEXT,
        additional_price TEXT,
        inventory INTEGER,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Product variants table created successfully!');
  } catch (error) {
    console.error('Error creating product_variants table:', error);
  } finally {
    client.release();
  }
}

createVariantsTable().catch(console.error);