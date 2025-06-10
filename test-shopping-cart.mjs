// Test shopping cart endpoint specifically

async function testShoppingCart() {
  console.log('🛒 Testing Shopping Cart Endpoint');
  console.log('='.repeat(50));
  
  try {
    const response = await fetch('http://localhost:9002/api/cart', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Response:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.json();
      console.log('❌ Error Response:');
      console.log(JSON.stringify(errorData, null, 2));
    }
    
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

testShoppingCart();
