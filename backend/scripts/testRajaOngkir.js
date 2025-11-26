import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

/**
 * Test RajaOngkir API Key
 * Script untuk memvalidasi API key dan melihat response detail
 */

const testRajaOngkir = async () => {
  console.log('🔍 Testing RajaOngkir API...\n');
  
  const apiKey = process.env.RAJAONGKIR_API_KEY;
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.error('❌ RAJAONGKIR_API_KEY tidak ditemukan atau belum dikonfigurasi di .env');
    console.log('\n📝 Silakan tambahkan ke .env:');
    console.log('RAJAONGKIR_API_KEY=your_actual_api_key');
    process.exit(1);
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');
  console.log('🌐 Base URL: https://api.rajaongkir.com/starter\n');
  
  try {
    console.log('📡 Testing endpoint: /province');
    
    const response = await axios.get('https://api.rajaongkir.com/starter/province', {
      headers: {
        'key': apiKey
      },
      timeout: 10000
    });
    
    console.log('\n✅ Response Status:', response.status);
    console.log('📦 Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.rajaongkir) {
      const status = response.data.rajaongkir.status;
      console.log('\n📊 RajaOngkir Status:');
      console.log('   Code:', status.code);
      console.log('   Description:', status.description);
      
      if (status.code === 200) {
        const provinces = response.data.rajaongkir.results;
        console.log('\n✅ API Key VALID!');
        console.log('📍 Total Provinsi:', provinces?.length || 0);
        
        if (provinces && provinces.length > 0) {
          console.log('\n📋 Sample Provinsi:');
          provinces.slice(0, 5).forEach(prov => {
            console.log(`   - [${prov.province_id}] ${prov.province}`);
          });
        }
      } else {
        console.log('\n⚠️ RajaOngkir returned non-200 status');
      }
    }
    
    console.log('\n✅ Test selesai! API key berfungsi dengan baik.');
    
  } catch (error) {
    console.error('\n❌ Test gagal!');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('\n📊 Error Details:');
      console.error('   Status:', error.response.status);
      console.error('   Status Text:', error.response.statusText);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      
      const status = error.response.status;
      
      console.log('\n🔧 Troubleshooting:');
      
      switch (status) {
        case 400:
          console.log('   ❌ Bad Request - Parameter tidak valid');
          console.log('   💡 Pastikan format API key benar');
          break;
          
        case 401:
          console.log('   ❌ Unauthorized - API Key tidak valid');
          console.log('   💡 Cek API key di dashboard RajaOngkir');
          console.log('   💡 https://rajaongkir.com/akun/panel');
          break;
          
        case 403:
          console.log('   ❌ Forbidden - Akses ditolak');
          console.log('   💡 API key mungkin suspended atau tidak aktif');
          break;
          
        case 410:
          console.log('   ❌ Gone - API Key expired atau tidak valid');
          console.log('   💡 API key sudah tidak berlaku');
          console.log('   💡 Solusi:');
          console.log('      1. Login ke https://rajaongkir.com/');
          console.log('      2. Regenerate API key baru');
          console.log('      3. Update RAJAONGKIR_API_KEY di .env');
          console.log('      4. Restart backend server');
          break;
          
        case 429:
          console.log('   ❌ Too Many Requests - Quota habis');
          console.log('   💡 Limit request free tier: 1000/bulan');
          console.log('   💡 Tunggu hingga bulan berikutnya atau upgrade plan');
          break;
          
        default:
          console.log('   ❌ Error code:', status);
          console.log('   💡 Cek dokumentasi RajaOngkir untuk detail');
      }
      
    } else if (error.request) {
      console.error('\n📡 No response received');
      console.error('   💡 Cek koneksi internet');
      console.error('   💡 Pastikan tidak ada firewall yang memblokir');
    }
    
    console.log('\n📚 Resources:');
    console.log('   Dashboard: https://rajaongkir.com/akun/panel');
    console.log('   Dokumentasi: https://rajaongkir.com/dokumentasi');
    
    process.exit(1);
  }
};

// Run test
testRajaOngkir();
