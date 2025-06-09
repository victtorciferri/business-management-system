// Remove customer access tokens table - AppointEase frictionless restoration
const { Client } = require('pg');

async function removeCustomerAccessTokensTable() {
  const client = new Client({
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE || 'business_management',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'password',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Drop the customer_access_tokens table and its indexes
    await client.query(`
      DROP TABLE IF EXISTS customer_access_tokens CASCADE;
    `);

    console.log('Successfully dropped customer_access_tokens table');

  } catch (error) {
    console.error('Error removing customer access tokens table:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  removeCustomerAccessTokensTable()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { removeCustomerAccessTokensTable };
