const { Pool } = require('pg');
require('dotenv').config();

/**
 * Create themes table in PostgreSQL database
 */
async function createThemesTable() {
  // Create a connection to the database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Creating themes table...');
    
    // Create the themes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS themes (
        id SERIAL PRIMARY KEY,
        business_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        business_slug TEXT,
        name TEXT NOT NULL,
        primary_color TEXT NOT NULL,
        secondary_color TEXT NOT NULL,
        accent_color TEXT NOT NULL,
        background_color TEXT NOT NULL,
        text_color TEXT NOT NULL,
        font_family TEXT DEFAULT 'Inter, sans-serif',
        border_radius INTEGER DEFAULT 8,
        spacing INTEGER DEFAULT 16,
        button_style TEXT DEFAULT 'default',
        card_style TEXT DEFAULT 'default',
        variant TEXT DEFAULT 'default',
        appearance TEXT DEFAULT 'system',
        is_active BOOLEAN DEFAULT true,
        is_preset BOOLEAN DEFAULT false,
        industry_type TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    // Create indices
    await pool.query(`
      CREATE INDEX IF NOT EXISTS themes_business_id_idx ON themes(business_id);
      CREATE INDEX IF NOT EXISTS themes_business_slug_idx ON themes(business_slug);
      CREATE INDEX IF NOT EXISTS themes_business_active_idx ON themes(business_id, is_active);
    `);

    console.log('Themes table created successfully!');
    
  } catch (error) {
    console.error('Error creating themes table:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Execute the function
createThemesTable();