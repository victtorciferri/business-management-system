// Script to create default staff availability schedule for staff member ID 3
// Using global fetch available in Node.js 18+

async function createStaffAvailability() {
  const baseUrl = 'http://localhost:9002';
  
  console.log('Creating default staff availability schedule for staff member ID 3...');
  
  try {
    // Create default availability schedule (Monday to Friday, 9 AM to 5 PM)
    const availabilityData = [
      {
        staffId: 3,
        dayOfWeek: 1, // Monday
        startTime: '09:00:00',
        endTime: '17:00:00',
        isAvailable: true
      },
      {
        staffId: 3,
        dayOfWeek: 2, // Tuesday
        startTime: '09:00:00',
        endTime: '17:00:00',
        isAvailable: true
      },
      {
        staffId: 3,
        dayOfWeek: 3, // Wednesday
        startTime: '09:00:00',
        endTime: '17:00:00',
        isAvailable: true
      },
      {
        staffId: 3,
        dayOfWeek: 4, // Thursday
        startTime: '09:00:00',
        endTime: '17:00:00',
        isAvailable: true
      },
      {
        staffId: 3,
        dayOfWeek: 5, // Friday
        startTime: '09:00:00',
        endTime: '17:00:00',
        isAvailable: true
      },
      {
        staffId: 3,
        dayOfWeek: 6, // Saturday
        startTime: '10:00:00',
        endTime: '14:00:00',
        isAvailable: true
      },
      {
        staffId: 3,
        dayOfWeek: 0, // Sunday
        startTime: '00:00:00',
        endTime: '00:00:00',
        isAvailable: false
      }
    ];    // Create each availability schedule entry
    for (const availability of availabilityData) {
      console.log(`Creating availability for ${getDayName(availability.dayOfWeek)}...`);
      
      const response = await fetch(`${baseUrl}/api/staff/3/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          staffId: availability.staffId,
          dayOfWeek: availability.dayOfWeek,
          startTime: availability.startTime.substring(0, 5), // Remove seconds (HH:MM format)
          endTime: availability.endTime.substring(0, 5),     // Remove seconds (HH:MM format)
          isAvailable: availability.isAvailable
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${getDayName(availability.dayOfWeek)}: ${availability.startTime} - ${availability.endTime}`);
      } else {
        const error = await response.text();
        console.log(`❌ Failed to create ${getDayName(availability.dayOfWeek)}: ${error}`);
      }
    }

    console.log('\n✅ Staff availability schedule created successfully!');
    console.log('Now try booking an appointment again.');

  } catch (error) {
    console.error('❌ Error creating staff availability:', error);
  }
}

function getDayName(dayOfWeek) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}

// Run the script
createStaffAvailability();
