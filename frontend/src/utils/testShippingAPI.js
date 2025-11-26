/**
 * Test Shipping API Connection
 * Jalankan di browser console untuk test koneksi
 */

// Test 1: Check API Base URL
console.log('🔍 API Base URL:', window.location.origin);
console.log('🔍 Expected Backend:', process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000');

// Test 2: Simple fetch test
const testShippingAPI = async () => {
  try {
    console.log('🧪 Testing shipping API...');
    
    const baseURL = 'http://localhost:5000';
    const endpoints = [
      '/api/v1/shipping/provinces',
      '/api/v1/shipping/couriers',
      '/api/v1/shipping/cities'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n📡 Testing: ${baseURL}${endpoint}`);
      
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint}: SUCCESS`);
        console.log('Response:', data);
      } else {
        console.log(`❌ ${endpoint}: FAILED (${response.status})`);
      }
    }
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Pastikan backend running: cd backend && npm run dev');
    console.log('2. Check port di backend/.env (PORT atau APP_PORT)');
    console.log('3. Check frontend .env (REACT_APP_API_BASE_URL)');
  }
};

// Run test
testShippingAPI();

// Export untuk digunakan di component
export default testShippingAPI;
