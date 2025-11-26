/**
 * Shipping API Configuration - RajaOngkir (New Domain)
 * Domain: https://rajaongkir.komerce.id
 * 
 * Mode:
 * - 'api': Use RajaOngkir API (province/city works, cost endpoint returns 404)
 * - 'manual': Use manual rate table (fallback)
 */

export default {
  // RajaOngkir API Key
  apiKey: process.env.RAJAONGKIR_API_KEY || 'STBOZhej360c19f58631502dev8dUBqp',
  baseUrl: 'https://rajaongkir.komerce.id/api/v1',
  
  // Origin City (Manado, Sulawesi Utara)
  origin: {
    cityId: parseInt(process.env.SHIPPING_ORIGIN_CITY_ID) || 330,
    cityName: process.env.SHIPPING_ORIGIN_CITY_NAME || 'Manado',
    provinceId: parseInt(process.env.SHIPPING_ORIGIN_PROVINCE_ID) || 22,
    provinceName: process.env.SHIPPING_ORIGIN_PROVINCE_NAME || 'Sulawesi Utara'
  },
  
  // Ekspedisi yang tersedia
  couriers: [
    { code: 'jne', name: 'JNE' },
    { code: 'tiki', name: 'TIKI' },
    { code: 'pos', name: 'POS Indonesia' },
    { code: 'jnt', name: 'J&T Express' },
    { code: 'sicepat', name: 'SiCepat' },
    { code: 'anteraja', name: 'AnterAja' },
    { code: 'ninja', name: 'Ninja Xpress' },
    { code: 'lion', name: 'Lion Parcel' },
    { code: 'sap', name: 'SAP Express' },
    { code: 'wahana', name: 'Wahana' }
  ],
  
  // Timeout request dalam ms
  timeout: 15000,
  
  // Mode: 'api' untuk RajaOngkir, 'manual' untuk fallback rate table
  mode: 'manual',
  
  /**
   * Manual Rate Table (per kg, in Rupiah)
   * Origin: Manado, Sulawesi Utara
   * Digunakan ketika mode='manual' atau API gagal
   */
  manualRates: {
    // Sulawesi Utara (lokal - same province as origin)
    sulut_local: { 
      baseRate: 8000, 
      etd: '1-2', 
      couriers: ['jne', 'tiki', 'jnt', 'sicepat', 'anteraja', 'ninja', 'lion', 'wahana'] 
    },
    // Sulawesi lainnya (inter-province dalam pulau yang sama)
    sulawesi_other: { 
      baseRate: 15000, 
      etd: '2-4', 
      couriers: ['jne', 'tiki', 'jnt', 'pos', 'sicepat', 'anteraja', 'lion', 'wahana'] 
    },
    // Kalimantan (pulau tetangga)
    kalimantan: { 
      baseRate: 25000, 
      etd: '3-5', 
      couriers: ['jne', 'tiki', 'pos', 'lion', 'wahana'] 
    },
    // Jawa & Bali (pulau jauh - harus lewat laut/udara)
    jawa_bali: { 
      baseRate: 30000, 
      etd: '3-6', 
      couriers: ['jne', 'tiki', 'pos', 'jnt', 'sicepat', 'lion'] 
    },
    // Sumatera (pulau jauh)
    sumatera: { 
      baseRate: 35000, 
      etd: '4-7', 
      couriers: ['jne', 'tiki', 'pos', 'lion'] 
    },
    // Papua & Maluku (pulau tetangga timur)
    papua_maluku: { 
      baseRate: 40000, 
      etd: '4-8', 
      couriers: ['jne', 'pos', 'lion'] 
    },
    // Nusa Tenggara (agak jauh)
    nusa_tenggara: { 
      baseRate: 32000, 
      etd: '4-7', 
      couriers: ['jne', 'tiki', 'pos', 'lion'] 
    }
  },

  /**
   * Province ID to Region Mapping
   * Origin: Manado, Sulawesi Utara (province_id: 22)
   * Digunakan untuk lookup manual rate berdasarkan province_id TUJUAN
   */
  provinceRegionMap: {
    // Sulawesi Utara (lokal - same as origin)
    22: 'sulut_local',   // Sulawesi Utara (LOCAL)
    
    // Sulawesi lainnya
    27: 'sulawesi_other', // Sulteng
    33: 'sulawesi_other', // Sulsel
    20: 'sulawesi_other', // Sultra
    34: 'sulawesi_other', // Sulbar
    17: 'sulawesi_other', // Gorontalo
    
    // Jawa & Bali (pulau jauh)
    5: 'jawa_bali',      // Jawa Barat
    10: 'jawa_bali',     // DKI Jakarta
    11: 'jawa_bali',     // Banten
    12: 'jawa_bali',     // Jawa Tengah
    19: 'jawa_bali',     // DI Yogyakarta
    18: 'jawa_bali',     // Jawa Timur
    15: 'jawa_bali',     // Bali
    
    // Nusa Tenggara
    21: 'nusa_tenggara', // NTT
    1: 'nusa_tenggara',  // NTB
    
    // Sumatera
    9: 'sumatera',       // NAD
    16: 'sumatera',      // Sumatera Utara
    23: 'sumatera',      // Sumatera Barat
    25: 'sumatera',      // Riau
    13: 'sumatera',      // Jambi
    26: 'sumatera',      // Sumatera Selatan
    6: 'sumatera',       // Bengkulu
    30: 'sumatera',      // Lampung
    24: 'sumatera',      // Bangka Belitung
    8: 'sumatera',       // Kepulauan Riau
    
    // Kalimantan
    28: 'kalimantan',    // Kalbar
    4: 'kalimantan',     // Kalteng
    3: 'kalimantan',     // Kalsel
    7: 'kalimantan',     // Kaltim
    31: 'kalimantan',    // Kaltara
    
    // Papua & Maluku
    14: 'papua_maluku',  // Papua
    29: 'papua_maluku',  // Papua Barat
    2: 'papua_maluku',   // Maluku
    32: 'papua_maluku'   // Maluku Utara
  },

  /**
   * City ID to Province ID mapping cache
   * Populated dynamically from API atau hardcoded untuk cities utama
   */
  cityProvinceMap: {
    330: 22, // Manado → Sulawesi Utara
    55: 5,   // Bandung → Jawa Barat
    56: 5,   // Cimahi → Jawa Barat
    10: 10   // Jakarta (example)
  }
};
