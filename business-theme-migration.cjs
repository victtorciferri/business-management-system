const { drizzle } = require('drizzle-orm/neon-serverless');
const { Pool } = require('@neondatabase/serverless');
const { sql } = require('drizzle-orm');

/**
 * Migration script to add theme column to users table
 * and migrate any existing theme_settings data to the new column
 */
async function migrateThemeColumn() {
  console.log('Starting theme migration...');
  
  // Connect to database
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  
  // Check if theme column already exists
  const tableInfo = await db.execute(sql`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'theme'
  `);
  
  if (tableInfo.rows.length > 0) {
    console.log('Theme column already exists, skipping creation');
  } else {
    try {
      // Add theme column as JSONB
      console.log('Adding theme column to users table...');
      await db.execute(sql`
        ALTER TABLE users 
        ADD COLUMN theme JSONB DEFAULT NULL
      `);
      console.log('Theme column added successfully');
    } catch (error) {
      console.error('Error adding theme column:', error);
      process.exit(1);
    }
  }
  
  // Migrate existing theme_settings to theme
  try {
    console.log('Migrating existing theme_settings data to theme column...');
    
    // Fetch all users with theme_settings
    const users = await db.execute(sql`
      SELECT id, theme_settings 
      FROM users 
      WHERE theme_settings IS NOT NULL AND theme IS NULL
    `);
    
    console.log(`Found ${users.rows.length} users with theme_settings to migrate`);
    
    // Process each user
    for (const user of users.rows) {
      const themeSettings = user.theme_settings;
      
      // Map legacy theme settings to new format
      const theme = {
        primary: themeSettings.primaryColor || '#1E3A8A',
        secondary: themeSettings.secondaryColor || '#9333EA',
        background: themeSettings.backgroundColor || '#FFFFFF',
        text: themeSettings.textColor || '#111827',
        appearance: themeSettings.appearance || 'system'
      };
      
      // Update user with new theme
      await db.execute(sql`
        UPDATE users 
        SET theme = ${JSON.stringify(theme)}::jsonb 
        WHERE id = ${user.id}
      `);
      
      console.log(`Migrated theme for user ID ${user.id}`);
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error migrating theme settings:', error);
    process.exit(1);
  }
  
  await client.end();
  console.log('Theme migration finished');
}

migrateThemeColumn().catch(console.error);