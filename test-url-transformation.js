// Simple test to verify URL transformation logic
console.log('Testing URL transformation logic...\n');

// Simulate the business slug extraction
function extractBusinessSlug(path) {
  const segments = path.split('/').filter(s => s);
  const reservedPaths = ['api', 'admin', 'auth', 'public'];
  
  if (segments.length > 0 && !reservedPaths.includes(segments[0])) {
    return segments[0];
  }
  return null;
}

// Simulate the buildApiUrl function
function buildApiUrl(url, currentPath) {
  // If the URL already contains a business slug pattern, return as is
  if (url.includes('/api/') && !url.startsWith('/api/')) {
    return url;
  }
  
  const businessSlug = extractBusinessSlug(currentPath);
  
  // If no business slug or URL doesn't start with /api/, return as is
  if (!businessSlug || !url.startsWith('/api/')) {
    return url;
  }
  
  // Replace /api/ with /{businessSlug}/api/
  return url.replace('/api/', `/${businessSlug}/api/`);
}

// Test cases
const testCases = [
  {
    currentPath: '/salonelegante/customer-portal/new-appointment',
    apiUrl: '/api/services?businessId=1',
    expected: '/salonelegante/api/services?businessId=1'
  },
  {
    currentPath: '/salonelegante/customer-portal',
    apiUrl: '/api/staff?businessId=1',
    expected: '/salonelegante/api/staff?businessId=1'
  },
  {
    currentPath: '/salonelegante/admin',
    apiUrl: '/api/customers/check-customer-exists',
    expected: '/salonelegante/api/customers/check-customer-exists'
  },
  {
    currentPath: '/admin/dashboard',
    apiUrl: '/api/services',
    expected: '/api/services' // Should remain unchanged - no business slug
  },
  {
    currentPath: '/salonelegante/customer-portal',
    apiUrl: '/salonelegante/api/services', // Already has business slug
    expected: '/salonelegante/api/services' // Should remain unchanged
  }
];

console.log('Running test cases:\n');

testCases.forEach((testCase, index) => {
  const result = buildApiUrl(testCase.apiUrl, testCase.currentPath);
  const passed = result === testCase.expected;
  
  console.log(`Test ${index + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Current Path: ${testCase.currentPath}`);
  console.log(`  API URL: ${testCase.apiUrl}`);
  console.log(`  Expected: ${testCase.expected}`);
  console.log(`  Got: ${result}`);
  console.log('');
});

console.log('URL transformation test completed!');
