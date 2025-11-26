/**
 * Test RajaOngkir Cost API
 * Check if shipping cost calculation works with city IDs
 */
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.RAJAONGKIR_API_KEY;
const BASE_URL = 'https://rajaongkir.komerce.id/api/v1';

async function testCostAPI() {
  console.log('🚀 Testing RajaOngkir Cost API\n');

  const testCases = [
    {
      name: 'Bandung → Jakarta (JNE)',
      origin: 55, // Bandung
      destination: 10, // Jakarta (assuming from province list)
      weight: 1000,
      courier: 'jne'
    },
    {
      name: 'Bandung → Cimahi (TIKI)',
      origin: 55,
      destination: 56, // Cimahi
      weight: 500,
      courier: 'tiki'
    }
  ];

  for (const test of testCases) {
    console.log(`\n📦 Test: ${test.name}`);
    console.log(`   Origin: ${test.origin}, Destination: ${test.destination}, Weight: ${test.weight}g, Courier: ${test.courier}`);

    try {
      const response = await axios.post(
        `${BASE_URL}/cost`,
        {
          origin: test.origin,
          destination: test.destination,
          weight: test.weight,
          courier: test.courier
        },
        {
          headers: {
            'key': API_KEY,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data && response.data.data) {
        console.log(`   ✅ Success!`);
        console.log(`   Response structure:`, JSON.stringify(response.data.data, null, 2));
      } else {
        console.log(`   ⚠️  No data in response`);
      }
    } catch (error) {
      if (error.response) {
        console.log(`   ❌ Error: ${error.response.status} ${error.response.statusText}`);
        console.log(`   Response:`, error.response.data);
      } else {
        console.log(`   ❌ Error:`, error.message);
      }
    }
  }

  console.log('\n✅ Test completed\n');
}

testCostAPI().catch(console.error);
