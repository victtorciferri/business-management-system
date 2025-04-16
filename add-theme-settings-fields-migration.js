import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import pkg from 'pg';
const { Pool } = pkg;

async function addThemeSettingsFields() {
  console.log('Starting migration to add theme settings fields...');
  
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    // Check if theme_settings column already exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'theme_settings'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('Theme settings column already exists. Skipping migration.');
      return;
    }
    
    // Add theme_settings column to users table as JSONB
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN theme_settings JSONB DEFAULT '{
        "primaryColor": "indigo-600",
        "secondaryColor": "gray-200",
        "accentColor": "amber-500",
        "textColor": "gray-800",
        "backgroundColor": "white",
        "fontFamily": "sans-serif",
        "borderRadius": "rounded-md",
        "buttonStyle": "rounded",
        "cardStyle": "elevated"
      }'
    `);
    
    // Add industry_type column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN industry_type TEXT DEFAULT 'general'
    `);
    
    // Add locale column if it doesn't exist
    const localeResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'locale'
    `);
    
    if (localeResult.rows.length === 0) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN locale TEXT DEFAULT 'en'
      `);
    }
    
    // Add currency settings if they don't exist
    const currencyCodeResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'currency_code'
    `);
    
    if (currencyCodeResult.rows.length === 0) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN currency_code TEXT DEFAULT 'USD',
        ADD COLUMN currency_symbol TEXT DEFAULT '$'
      `);
    }
    
    // Add additional display fields
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN logo_url TEXT,
      ADD COLUMN cover_image_url TEXT,
      ADD COLUMN description TEXT
    `);
    
    console.log('Successfully added theme settings fields to users table');
  } catch (error) {
    console.error('Error adding theme settings fields:', error);
    throw error;
  }
}

// Execute the migration
addThemeSettingsFields()
  .then(() => {
    console.log('Theme settings fields migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Theme settings fields migration failed:', error);
    process.exit(1);
  });

export { addThemeSettingsFields };