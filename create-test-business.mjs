// Create a test business for API testing

const baseURL = 'http://localhost:9002';

async function createTestBusiness() {
  console.log('🏢 Creating Test Business for API Testing');
  console.log('='.repeat(50));
  
  try {
    const response = await fetch(`${baseURL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'testbusiness@example.com',
        password: 'password123',
        businessName: 'Test Business',
        businessSlug: 'test-business',
        firstName: 'Test',
        lastName: 'Owner',
        username: 'testowner'
      })
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Test business created successfully!');
      console.log(`Business Name: ${data.business?.businessName}`);
      console.log(`Business Slug: ${data.business?.businessSlug}`);
      console.log(`Business ID: ${data.business?.id}`);
    } else {
      const errorData = await response.json();
      console.log('❌ Failed to create test business:');
      console.log(`Error: ${errorData.message}`);
      if (errorData.errors) {
        console.log('Validation errors:', errorData.errors);
      }
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

createTestBusiness();
