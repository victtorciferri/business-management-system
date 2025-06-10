// Script to directly insert staff availability records into the database
import { Pool } from 'pg';

async function createStaffAvailabilityDirect() {
  console.log('Creating default staff availability schedule for staff member ID 3 using direct database access...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:AppointEase123!@34.176.74.36:5432/postgres'
  });

  try {
    // Create default availability schedule (Monday to Friday, 9 AM to 5 PM)
    const availabilityData = [
      {
        staffId: 3,
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        staffId: 3,
        dayOfWeek: 2, // Tuesday
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        staffId: 3,
        dayOfWeek: 3, // Wednesday
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        staffId: 3,
        dayOfWeek: 4, // Thursday
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        staffId: 3,
        dayOfWeek: 5, // Friday
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true
      },
      {
        staffId: 3,
        dayOfWeek: 6, // Saturday
        startTime: '10:00',
        endTime: '14:00',
        isAvailable: true
      },
      {
        staffId: 3,
        dayOfWeek: 0, // Sunday
        startTime: '00:00',
        endTime: '00:00',
        isAvailable: false
      }
    ];

    // First, check if staff member exists
    const staffCheck = await pool.query(
      'SELECT id, username, business_id FROM users WHERE id = $1 AND role = $2',
      [3, 'staff']
    );

    if (staffCheck.rows.length === 0) {
      console.error('❌ Staff member with ID 3 not found or not a staff role');
      return;
    }

    const staff = staffCheck.rows[0];
    console.log(`✅ Found staff member: ${staff.username} (Business ID: ${staff.business_id})`);

    // Get business info
    const businessCheck = await pool.query(
      'SELECT business_slug FROM users WHERE id = $1',
      [staff.business_id]
    );

    const businessSlug = businessCheck.rows[0]?.business_slug || 'default';
    console.log(`📍 Business slug: ${businessSlug}`);

    // Clear existing availability for this staff member
    const deleteResult = await pool.query(
      'DELETE FROM staff_availability WHERE staff_id = $1',
      [3]
    );
    console.log(`🗑️ Cleared ${deleteResult.rowCount} existing availability records`);

    // Create each availability schedule entry
    for (const availability of availabilityData) {
      console.log(`Creating availability for ${getDayName(availability.dayOfWeek)}...`);
        const result = await pool.query(
        `INSERT INTO staff_availability 
         (staff_id, day_of_week, start_time, end_time, is_available, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
         RETURNING id`,
        [
          availability.staffId,
          availability.dayOfWeek,
          availability.startTime,
          availability.endTime,
          availability.isAvailable
        ]
      );

      if (result.rows.length > 0) {
        console.log(`✅ ${getDayName(availability.dayOfWeek)}: ${availability.startTime} - ${availability.endTime} (ID: ${result.rows[0].id})`);
      } else {
        console.log(`❌ Failed to create ${getDayName(availability.dayOfWeek)}`);
      }
    }

    console.log('\n🎉 Staff availability schedule created successfully!');
    console.log('Now try booking an appointment again.');

    // Verify the records were created
    const verifyResult = await pool.query(
      'SELECT * FROM staff_availability WHERE staff_id = $1 ORDER BY day_of_week',
      [3]
    );
    
    console.log(`\n📋 Verification: ${verifyResult.rows.length} availability records found for staff ID 3:`);
    verifyResult.rows.forEach(row => {
      console.log(`   ${getDayName(row.day_of_week)}: ${row.start_time} - ${row.end_time} (Available: ${row.is_available})`);
    });

  } catch (error) {
    console.error('❌ Error creating staff availability:', error);
  } finally {
    await pool.end();
  }
}

function getDayName(dayOfWeek) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}

// Run the script
createStaffAvailabilityDirect();
