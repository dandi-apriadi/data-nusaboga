import axios from 'axios';
import shippingConfig from '../config/rajaongkir.js';

/**
 * Shipping Controller - RajaOngkir (New Domain)
 * Domain baru: https://rajaongkir.komerce.id
 */

/**
 * Get list of provinces
 * GET /api/v1/shipping/provinces
 */
export const getProvinces = async (req, res) => {
  try {
    const response = await axios.get(`${shippingConfig.baseUrl}/destination/province`, {
      headers: {
        'key': shippingConfig.apiKey
      },
      timeout: shippingConfig.timeout
    });

    // RajaOngkir Komerce response format
    if (!response.data || !response.data.data) {
      console.error('[ShippingController] Invalid response:', response.data);
      return res.status(400).json({
        success: false,
        msg: 'Gagal mengambil data provinsi'
      });
    }

    res.json({
      success: true,
      data: response.data.data || []
    });
  } catch (error) {
    console.error('[ShippingController] getProvinces error:', error.message);
    
    let errorMsg = 'Terjadi kesalahan saat mengambil data provinsi';
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 401:
          errorMsg = 'API Key tidak valid. Silakan cek konfigurasi RAJAONGKIR_API_KEY di .env';
          break;
        case 403:
          errorMsg = 'Akses ditolak. Pastikan API Key aktif';
          break;
        default:
          errorMsg = data?.message || errorMsg;
      }
      
      console.error('[ShippingController] API Error:', status, data);
    }
    
    res.status(error.response?.status || 500).json({
      success: false,
      msg: errorMsg,
      error: error.message
    });
  }
};

/**
 * Get list of cities by province
 * GET /api/v1/shipping/cities?province_id=5
 */
export const getCities = async (req, res) => {
  try {
    const { province_id } = req.query;

    if (!province_id) {
      return res.status(400).json({
        success: false,
        msg: 'province_id wajib diisi'
      });
    }

    // Endpoint menggunakan path parameter, bukan query string
    const response = await axios.get(
      `${shippingConfig.baseUrl}/destination/city/${province_id}`,
      {
        headers: {
          'key': shippingConfig.apiKey
        },
        timeout: shippingConfig.timeout
      }
    );

    if (!response.data || !response.data.data) {
      return res.status(400).json({
        success: false,
        msg: 'Gagal mengambil data kota'
      });
    }

    res.json({
      success: true,
      data: response.data.data || []
    });
  } catch (error) {
    console.error('[ShippingController] getCities error:', error.message);
    res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan saat mengambil data kota',
      error: error.message
    });
  }
};

/**
 * Calculate shipping cost
 * POST /api/v1/shipping/cost
 * Body: {
 *   origin: number (city ID, required) - e.g., 55 for Bandung,
 *   destination: number (city ID, required),
 *   weight: number (in grams, required),
 *   courier: string (jne|tiki|pos|jnt|sicepat, optional)
 * }
 * 
 * Note: Menggunakan manual rate table karena endpoint /cost di RajaOngkir returns 404
 */
export const calculateShippingCost = async (req, res) => {
  try {
    const { origin, destination, weight, courier, destination_province_id } = req.body;

    // Validation
    if (!origin) {
      return res.status(400).json({
        success: false,
        msg: 'origin (ID kota asal) wajib diisi'
      });
    }

    if (!destination) {
      return res.status(400).json({
        success: false,
        msg: 'destination (ID kota tujuan) wajib diisi'
      });
    }

    if (!weight || weight <= 0) {
      return res.status(400).json({
        success: false,
        msg: 'weight (berat dalam gram) wajib diisi dan harus lebih dari 0'
      });
    }

    // Manual mode: Calculate using rate table
    if (shippingConfig.mode === 'manual' || !destination_province_id) {
      // Get destination province (from body atau fallback)
      let destProvinceId = destination_province_id;
      
      // Jika tidak ada province_id, coba lookup dari cityProvinceMap
      if (!destProvinceId && shippingConfig.cityProvinceMap[destination]) {
        destProvinceId = shippingConfig.cityProvinceMap[destination];
      }

      // Jika masih tidak ada, anggap sebagai Sulawesi lainnya (fallback lebih masuk akal untuk origin Manado)
      if (!destProvinceId) {
        destProvinceId = 27; // Sulteng as fallback
        console.warn(`[ShippingController] No province_id for city ${destination}, assuming Sulawesi lainnya`);
      }

      // Get region dari province
      const region = shippingConfig.provinceRegionMap[destProvinceId] || 'sulawesi_other';
      const rateConfig = shippingConfig.manualRates[region];

      if (!rateConfig) {
        return res.status(400).json({
          success: false,
          msg: 'Region tidak ditemukan untuk provinsi tujuan'
        });
      }

      // Calculate cost per courier
      const weightInKg = weight / 1000;
      const shippingOptions = [];

      const couriersToCheck = courier 
        ? [courier] 
        : rateConfig.couriers;

      // Courier price adjustment factors (untuk variasi harga)
      const courierPriceFactors = {
        'jne': 1.0,      // Standard (paling populer)
        'tiki': 1.05,    // Sedikit lebih mahal (premium service)
        'pos': 0.85,     // Termurah (BUMN, subsidi)
        'jnt': 0.9,      // Murah (agresif pricing)
        'sicepat': 0.95, // Competitive
        'anteraja': 0.92,// Murah (startup)
        'ninja': 0.93,   // Competitive
        'lion': 1.08,    // Premium (cargo specialist)
        'sap': 0.98,     // Standard
        'wahana': 0.88,  // Budget friendly
        'grab': 1.15,    // Instant delivery (same day)
        'gojek': 1.12,   // Instant delivery (same day)
        'lalamove': 1.18 // Premium instant
      };

      for (const courierCode of couriersToCheck) {
        const courierInfo = shippingConfig.couriers.find(c => c.code === courierCode);
        if (!courierInfo) continue;

        // Base cost = baseRate * weight (kg)
        // Round up untuk partial kg (min 1kg)
        const effectiveWeight = Math.max(1, Math.ceil(weightInKg));
        const baseRateAdjusted = rateConfig.baseRate * (courierPriceFactors[courierCode] || 1.0);
        const baseCost = baseRateAdjusted * effectiveWeight;

        // Add services with variations - LENGKAP!
        let services = [];
        
        switch(courierCode) {
          case 'jne':
            services = [
              { code: 'REG', name: 'Reguler', multiplier: 1.0, etdAdjust: 0 },
              { code: 'YES', name: 'Yakin Esok Sampai (Express)', multiplier: 1.6, etdAdjust: -1 },
              { code: 'OKE', name: 'Ongkos Kirim Ekonomis', multiplier: 0.75, etdAdjust: 2 },
              { code: 'JTR', name: 'JNE Trucking (Cargo)', multiplier: 1.2, etdAdjust: 1 },
              { code: 'SS', name: 'Super Speed (Same Day)', multiplier: 2.0, etdAdjust: -2 }
            ];
            break;
            
          case 'tiki':
            services = [
              { code: 'REG', name: 'Regular Service', multiplier: 1.0, etdAdjust: 0 },
              { code: 'ONS', name: 'Over Night Service', multiplier: 1.7, etdAdjust: -1 },
              { code: 'ECO', name: 'Economy Service', multiplier: 0.85, etdAdjust: 1 },
              { code: 'TDS', name: 'TIKI Day Service (Express)', multiplier: 1.8, etdAdjust: -1 },
              { code: 'SDS', name: 'Same Day Service', multiplier: 2.2, etdAdjust: -2 }
            ];
            break;
            
          case 'jnt':
            services = [
              { code: 'REG', name: 'Reguler', multiplier: 1.0, etdAdjust: 0 },
              { code: 'EZ', name: 'Express (Cepat)', multiplier: 1.5, etdAdjust: -1 },
              { code: 'CARGO', name: 'J&T Cargo (Heavy)', multiplier: 1.3, etdAdjust: 1 }
            ];
            break;
            
          case 'pos':
            services = [
              { code: 'REG', name: 'Pos Reguler', multiplier: 1.0, etdAdjust: 0 },
              { code: 'EXP', name: 'Pos Express (Kilat)', multiplier: 1.4, etdAdjust: -1 },
              { code: 'NEXTDAY', name: 'Pos Nextday', multiplier: 1.6, etdAdjust: -1 },
              { code: 'SAMEDAY', name: 'Pos Same Day', multiplier: 2.0, etdAdjust: -2 },
              { code: 'PAKET48', name: 'Paket 48 Jam', multiplier: 1.2, etdAdjust: 0 }
            ];
            break;
            
          case 'sicepat':
            services = [
              { code: 'REG', name: 'Regular', multiplier: 1.0, etdAdjust: 0 },
              { code: 'BEST', name: 'Best (Next Day)', multiplier: 1.5, etdAdjust: -1 },
              { code: 'HALU', name: 'Hemat (Ekonomis)', multiplier: 0.8, etdAdjust: 1 },
              { code: 'GOKIL', name: 'Gokil (Instant)', multiplier: 2.1, etdAdjust: -2 },
              { code: 'SIUNT', name: 'Siuntung (Cargo)', multiplier: 1.3, etdAdjust: 1 }
            ];
            break;
            
          case 'lion':
            services = [
              { code: 'REG', name: 'Reguler', multiplier: 1.0, etdAdjust: 0 },
              { code: 'ONEPACK', name: 'One Pack (Express)', multiplier: 1.6, etdAdjust: -2 },
              { code: 'REGPACK', name: 'Regular Pack', multiplier: 0.95, etdAdjust: 0 },
              { code: 'CARGO', name: 'Lion Cargo', multiplier: 1.4, etdAdjust: 1 }
            ];
            break;
            
          case 'anteraja':
            services = [
              { code: 'REG', name: 'Reguler', multiplier: 1.0, etdAdjust: 0 },
              { code: 'SAME_DAY', name: 'Same Day', multiplier: 1.9, etdAdjust: -2 },
              { code: 'NEXT_DAY', name: 'Next Day', multiplier: 1.5, etdAdjust: -1 }
            ];
            break;
            
          case 'ninja':
            services = [
              { code: 'REG', name: 'Standard', multiplier: 1.0, etdAdjust: 0 },
              { code: 'EXPRESS', name: 'Express', multiplier: 1.5, etdAdjust: -1 },
              { code: 'NEXTDAY', name: 'Next Day', multiplier: 1.6, etdAdjust: -1 },
              { code: 'SAMEDAY', name: 'Same Day', multiplier: 2.0, etdAdjust: -2 }
            ];
            break;
            
          case 'wahana':
            services = [
              { code: 'REG', name: 'Normal', multiplier: 1.0, etdAdjust: 0 },
              { code: 'EXPRESS', name: 'Express', multiplier: 1.4, etdAdjust: -1 },
              { code: 'CARGO', name: 'Wahana Cargo', multiplier: 1.2, etdAdjust: 1 }
            ];
            break;
            
          case 'sap':
            services = [
              { code: 'REG', name: 'Regular', multiplier: 1.0, etdAdjust: 0 },
              { code: 'EXPRESS', name: 'Express', multiplier: 1.5, etdAdjust: -1 },
              { code: 'JUMBO', name: 'SAP Jumbo (Large)', multiplier: 1.3, etdAdjust: 1 }
            ];
            break;
            
          default:
            services = [
              { code: 'REG', name: 'Reguler', multiplier: 1.0, etdAdjust: 0 },
              { code: 'EXPRESS', name: 'Express', multiplier: 1.5, etdAdjust: -1 }
            ];
        }

        services.forEach(service => {
          const finalCost = Math.round(baseCost * service.multiplier);
          const etdDays = rateConfig.etd.split('-');
          const minEtd = Math.max(1, parseInt(etdDays[0]) + service.etdAdjust);
          const maxEtd = Math.max(minEtd + 1, parseInt(etdDays[1] || etdDays[0]) + service.etdAdjust);
          
          shippingOptions.push({
            courier_code: courierCode.toUpperCase(),
            courier_name: courierInfo.name,
            service: service.code,
            description: service.name,
            cost: finalCost,
            etd: `${minEtd}-${maxEtd}`,
            note: 'Manual rate calculation'
          });
        });
      }

      // Sort by cost (cheapest first)
      shippingOptions.sort((a, b) => a.cost - b.cost);

      return res.json({
        success: true,
        data: {
          origin,
          destination,
          weight,
          mode: 'manual',
          region: region,
          shipping_options: shippingOptions
        }
      });
    }

    // API mode (currently returns 404 for /cost endpoint)
    const couriersToCheck = courier 
      ? [courier] 
      : shippingConfig.couriers.map(c => c.code);

    const costPromises = couriersToCheck.map(async (courierCode) => {
      try {
        const response = await axios.post(
          `${shippingConfig.baseUrl}/cost`,
          {
            origin: parseInt(origin),
            destination: parseInt(destination),
            weight: parseInt(weight),
            courier: courierCode
          },
          {
            headers: {
              'key': shippingConfig.apiKey,
              'Content-Type': 'application/json'
            },
            timeout: shippingConfig.timeout
          }
        );

        if (response.data && response.data.data) {
          return {
            courier: courierCode,
            data: response.data.data
          };
        }
        return null;
      } catch (err) {
        console.error(`[ShippingController] Error checking ${courierCode}:`, err.message);
        return null;
      }
    });

    const results = await Promise.all(costPromises);
    const validResults = results.filter(r => r !== null);

    if (validResults.length === 0) {
      return res.status(400).json({
        success: false,
        msg: 'Tidak ada layanan pengiriman yang tersedia untuk tujuan ini'
      });
    }

    // Format response
    const shippingOptions = [];
    validResults.forEach(result => {
      if (result.data && Array.isArray(result.data)) {
        result.data.forEach(service => {
          shippingOptions.push({
            courier_code: result.courier.toUpperCase(),
            courier_name: service.courier_name || result.courier.toUpperCase(),
            service: service.service_name || service.service,
            description: service.description || '',
            cost: parseInt(service.cost || 0),
            etd: service.etd || '2-3',
            note: service.note || ''
          });
        });
      }
    });

    // Sort by cost (cheapest first)
    shippingOptions.sort((a, b) => a.cost - b.cost);

    res.json({
      success: true,
      data: {
        origin,
        destination,
        weight,
        mode: 'api',
        shipping_options: shippingOptions
      }
    });

  } catch (error) {
    console.error('[ShippingController] calculateShippingCost error:', error.message);
    res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan saat menghitung ongkos kirim',
      error: error.message
    });
  }
};

/**
 * Get available couriers
 * GET /api/v1/shipping/couriers
 */
export const getCouriers = async (req, res) => {
  try {
    res.json({
      success: true,
      data: shippingConfig.couriers
    });
  } catch (error) {
    console.error('[ShippingController] getCouriers error:', error.message);
    res.status(500).json({
      success: false,
      msg: 'Terjadi kesalahan',
      error: error.message
    });
  }
};
