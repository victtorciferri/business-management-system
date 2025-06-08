// Test the complete booking flow
async function testCompleteBookingFlow() {
  const baseUrl = 'http://localhost:9002/salonelegante/api';
  
  console.log('🧪 Testing Complete Booking Flow...\n');
  
  try {
    // Step 1: Check customer exists
    console.log('1️⃣ Testing customer check...');
    const customerCheckResponse = await fetch(`${baseUrl}/customers/check-customer-exists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',      body: JSON.stringify({
        email: 'maria@example.com',
        businessId: 1
      })
    });
    
    console.log(`Customer check status: ${customerCheckResponse.status}`);
    const customerData = await customerCheckResponse.json();
    console.log('Customer data:', customerData);
    
    let customerId;
    if (customerData.exists) {
      customerId = customerData.customer.id;
      console.log(`✅ Existing customer found: ID ${customerId}`);
    } else {
      console.log('❌ Customer not found - would need to create new customer');
      return;
    }
    
    // Step 2: Get services
    console.log('\n2️⃣ Testing services endpoint...');
    const servicesResponse = await fetch(`${baseUrl}/services?businessId=1`, {
      credentials: 'include'
    });
    console.log(`Services status: ${servicesResponse.status}`);
    const services = await servicesResponse.json();
    console.log(`Found ${services.length} services`);
    
    if (services.length === 0) {
      console.log('❌ No services found');
      return;
    }
    
    const selectedService = services[0];
    console.log(`✅ Selected service: ${selectedService.name} (ID: ${selectedService.id})`);
    
    // Step 3: Get staff
    console.log('\n3️⃣ Testing staff endpoint...');
    const staffResponse = await fetch(`${baseUrl}/staff?businessId=1&serviceId=${selectedService.id}`, {
      credentials: 'include'
    });
    console.log(`Staff status: ${staffResponse.status}`);
    const staff = await staffResponse.json();
    console.log(`Found ${staff.length} staff members`);
    
    if (staff.length === 0) {
      console.log('❌ No staff found');
      return;
    }
    
    const selectedStaff = staff[0];
    console.log(`✅ Selected staff: ${selectedStaff.username} (ID: ${selectedStaff.id})`);
    
    // Step 4: Book appointment
    console.log('\n4️⃣ Testing appointment booking...');
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 1); // Tomorrow
    appointmentDate.setHours(14, 0, 0, 0); // 2:00 PM
    
    const bookingData = {
      businessId: 1,
      customerId: customerId,
      serviceId: selectedService.id,
      staffId: selectedStaff.id,
      date: appointmentDate.toISOString(),
      time: "2:00 PM",
      notes: "Test booking from API"
    };
    
    console.log('Booking data:', bookingData);
    
    const bookingResponse = await fetch(`${baseUrl}/customers/book-appointment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(bookingData)
    });
    
    console.log(`Booking status: ${bookingResponse.status}`);
    
    if (bookingResponse.ok) {
      const appointment = await bookingResponse.json();
      console.log('✅ Appointment created successfully!');
      console.log('Appointment ID:', appointment.id);
      console.log('Appointment details:', appointment);
      
      // Step 5: Test customer access token creation
      console.log('\n5️⃣ Testing customer access token...');
      const tokenResponse = await fetch(`${baseUrl}/customer-access-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',        body: JSON.stringify({
          email: 'maria@example.com',
          businessId: 1,
          sendEmail: false // Don't actually send email in test
        })
      });
      
      console.log(`Token status: ${tokenResponse.status}`);
      
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        console.log('✅ Access token created:', tokenData.token.substring(0, 10) + '...');
      } else {
        const tokenError = await tokenResponse.text();
        console.log('❌ Token creation failed:', tokenError);
      }
      
    } else {
      const error = await bookingResponse.text();
      console.log('❌ Booking failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testCompleteBookingFlow();
