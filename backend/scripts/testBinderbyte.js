import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

/**
 * Test Binderbyte API
 * Script untuk memvalidasi API key Binderbyte
 */

const testBinderbyte = async () => {
  console.log('🔍 Testing Binderbyte API...\n');
  
  const apiKey = process.env.BINDERBYTE_API_KEY || '9d144fe37e0b33960cd9ba38f6c5c6b0e0f0f4dd2a87b86ec6c7bf0a81bdad9d';
  
  console.log('✅ API Key found:', apiKey.substring(0, 20) + '...');
  console.log('🌐 Base URL: https://api.binderbyte.com/v1\n');
  
  try {
    // Test 1: Get Provinces
    console.log('📡 Test 1: Getting provinces...');
    const provincesResponse = await axios.get('https://api.binderbyte.com/v1/list_province', {
      params: { api_key: apiKey },
      timeout: 10000
    });
    
    console.log('✅ Provinces Response Status:', provincesResponse.data.status);
    if (provincesResponse.data.status === 200) {
      const provinces = provincesResponse.data.data;
      console.log(`✅ Total Provinsi: ${provinces.length}`);
      console.log('\n📋 Sample Provinsi:');
      provinces.slice(0, 5).forEach(prov => {
        console.log(`   - ${prov.name}`);
      });
    }
    
    // Test 2: Get Cities (Jawa Barat)
    console.log('\n📡 Test 2: Getting cities (Jawa Barat)...');
    const citiesResponse = await axios.get('https://api.binderbyte.com/v1/list_city', {
      params: { 
        api_key: apiKey,
        province: 'Jawa Barat'
      },
      timeout: 10000
    });
    
    console.log('✅ Cities Response Status:', citiesResponse.data.status);
    if (citiesResponse.data.status === 200) {
      const cities = citiesResponse.data.data;
      console.log(`✅ Total Kota di Jawa Barat: ${cities.length}`);
      console.log('\n📋 Sample Kota:');
      cities.slice(0, 5).forEach(city => {
        console.log(`   - ${city.name}`);
      });
    }
    
    // Test 3: Calculate Shipping Cost
    console.log('\n📡 Test 3: Calculating shipping cost (Bandung -> Jakarta)...');
    const costResponse = await axios.get('https://api.binderbyte.com/v1/cost', {
      params: {
        api_key: apiKey,
        origin: 'Bandung',
        destination: 'Jakarta',
        weight: 1000,
        courier: 'jne'
      },
      timeout: 10000
    });
    
    console.log('✅ Cost Response Status:', costResponse.data.status);
    if (costResponse.data.status === 200) {
      const services = costResponse.data.data;
      console.log(`✅ Total Layanan JNE: ${services.length}`);
      console.log('\n📋 Layanan & Harga:');
      services.forEach(service => {
        console.log(`   - ${service.service}: Rp ${service.cost.toLocaleString('id-ID')} (${service.etd})`);
      });
    }
    
    console.log('\n✅ Semua test berhasil! API Binderbyte berfungsi dengan baik.');
    console.log('\n💡 Catatan:');
    console.log('   - API Key demo sudah include di .env');
    console.log('   - Untuk production, daftar akun di https://binderbyte.com/');
    console.log('   - API gratis unlimited request!');
    
  } catch (error) {
    console.error('\n❌ Test gagal!');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('\n📊 Error Details:');
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Cek koneksi internet');
    console.log('   2. Cek API key di .env');
    console.log('   3. Visit: https://docs.binderbyte.com/');
    
    process.exit(1);
  }
};

// Run test
testBinderbyte();
