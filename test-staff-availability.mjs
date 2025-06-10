// Test script to debug customer portal staff availability endpoint

async function testStaffAvailability() {
  const baseURL = 'http://localhost:9002';
  
  console.log('🧪 Testing Customer Portal Staff Availability Endpoint');
  console.log('='.repeat(60));
  
  try {
    // Test the customer portal staff availability endpoint
    const url = `${baseURL}/customer-portal/api/staff/3/availability?businessId=1`;
    console.log(`\n🔍 Testing: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📦 Response Data:');
      console.log(JSON.stringify(data, null, 2));
      
      // Check if it's availability data or staff data
      if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0];
        if (firstItem.hasOwnProperty('dayOfWeek') && firstItem.hasOwnProperty('startTime')) {
          console.log('✅ SUCCESS: Returning availability data');
        } else if (firstItem.hasOwnProperty('username') && firstItem.hasOwnProperty('email')) {
          console.log('❌ ERROR: Returning staff info instead of availability data');
        } else {
          console.log('❓ UNKNOWN: Response format not recognized');
        }
      } else {
        console.log('📝 INFO: Empty response or non-array data');
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ Error Response: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Test Complete');
}

testStaffAvailability();
