// Test staff availability query directly
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:AppointEase123!@34.176.74.36:5432/postgres'
});

async function testStaffAvailabilityQuery() {
  console.log('Testing staff availability query...');
  
  try {
    // Test 1: Direct database query
    console.log('\n1. Direct database query:');
    const directResult = await pool.query(
      'SELECT * FROM staff_availability WHERE staff_id = $1 ORDER BY day_of_week',
      [3]
    );
    console.log(`Found ${directResult.rows.length} records in database`);
    directResult.rows.forEach(row => {
      console.log(`  Day ${row.day_of_week}: ${row.start_time}-${row.end_time} (Available: ${row.is_available})`);
    });
    
    // Test 2: HTTP API call to the endpoint
    console.log('\n2. HTTP API call:');
    try {
      const response = await fetch('http://localhost:9002/api/staff/3/availability?businessId=1');
      if (response.ok) {
        const data = await response.json();
        console.log(`API returned ${data.length} records`);
        data.forEach(record => {
          console.log(`  Day ${record.dayOfWeek}: ${record.startTime}-${record.endTime} (Available: ${record.isAvailable})`);
        });
      } else {
        const errorText = await response.text();
        console.log('API Error:', response.status, errorText);
      }
    } catch (fetchError) {
      console.log('Fetch error:', fetchError.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testStaffAvailabilityQuery();
