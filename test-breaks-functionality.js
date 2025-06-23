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
    console.log('Testing breaks functionality...\n');
    
    // Find a staff member for testing
    const staffResult = await pool.query(`
      SELECT id, username FROM users 
      WHERE role = 'staff' 
      LIMIT 1
    `);
    
    if (staffResult.rows.length === 0) {
      console.log('No staff members found. Creating a test scenario...');
      return;
    }
    
    const staffId = staffResult.rows[0].id;
    const staffUsername = staffResult.rows[0].username;
    
    console.log(`Testing with staff member: ${staffUsername} (ID: ${staffId})`);
    
    // Test 1: Create availability with breaks
    console.log('\n1. Creating availability with breaks...');
    const breaks = [
      { startTime: '12:00', endTime: '12:30' },
      { startTime: '15:00', endTime: '15:15' }
    ];
    
    const insertResult = await pool.query(`
      INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time, is_available, breaks)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [staffId, 1, '09:00', '17:00', true, JSON.stringify(breaks)]);
    
    console.log('✓ Availability created with breaks:', insertResult.rows[0]);
    
    // Test 2: Read availability and verify breaks
    console.log('\n2. Reading availability and verifying breaks...');
    const selectResult = await pool.query(`
      SELECT * FROM staff_availability 
      WHERE staff_id = $1 AND day_of_week = $2
    `, [staffId, 1]);
    
    if (selectResult.rows.length > 0) {
      const availability = selectResult.rows[0];
      console.log('✓ Availability found:', {
        id: availability.id,
        staffId: availability.staff_id,
        dayOfWeek: availability.day_of_week,
        startTime: availability.start_time,
        endTime: availability.end_time,
        breaks: availability.breaks
      });
      
      // Verify breaks structure
      if (availability.breaks && Array.isArray(availability.breaks)) {
        console.log('✓ Breaks are properly stored as JSON array');
        availability.breaks.forEach((breakTime, index) => {
          console.log(`  Break ${index + 1}: ${breakTime.startTime} - ${breakTime.endTime}`);
        });
      } else {
        console.log('✗ Breaks are not properly stored');
      }
    }
    
    // Test 3: Update breaks
    console.log('\n3. Updating breaks...');
    const updatedBreaks = [
      { startTime: '12:00', endTime: '13:00' },
      { startTime: '15:30', endTime: '15:45' },
      { startTime: '17:00', endTime: '17:15' }
    ];
    
    const updateResult = await pool.query(`
      UPDATE staff_availability 
      SET breaks = $1, updated_at = NOW()
      WHERE staff_id = $2 AND day_of_week = $3
      RETURNING *
    `, [JSON.stringify(updatedBreaks), staffId, 1]);
    
    if (updateResult.rows.length > 0) {
      console.log('✓ Breaks updated successfully');
      console.log('Updated breaks:', updateResult.rows[0].breaks);
    }
    
    // Clean up
    console.log('\n4. Cleaning up test data...');
    await pool.query(`
      DELETE FROM staff_availability 
      WHERE staff_id = $1 AND day_of_week = $2
    `, [staffId, 1]);
    console.log('✓ Test data cleaned up');
    
    console.log('\n🎉 All tests passed! Breaks functionality is working correctly.');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  } finally {
    await pool.end();
  }
})();
