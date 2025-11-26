/**
 * Shipping API - RajaOngkir Integration
 * Frontend API calls for shipping cost calculation
 */

import api from './axios';

/**
 * Get list of provinces
 */
export const getProvinces = async () => {
  const response = await api.get('/shipping/provinces');
  return response.data;
};

/**
 * Get list of cities
 * @param {number} provinceId - Optional province ID to filter cities
 */
export const getCities = async (provinceId = null) => {
  const params = {};
  if (provinceId) {
    params.province_id = provinceId;
  }
  const response = await api.get('/shipping/cities', { params });
  return response.data;
};

/**
 * Calculate shipping cost
 * @param {Object} payload
 * @param {number} payload.destination_city_id - Destination city ID from RajaOngkir
 * @param {number} payload.weight - Total weight in grams
 * @param {string} payload.courier - Optional: 'jne' | 'tiki' | 'pos'
 */
export const calculateShippingCost = async (payload) => {
  const response = await api.post('/shipping/cost', payload);
  return response.data;
};

/**
 * Get available couriers
 */
export const getCouriers = async () => {
  const response = await api.get('/shipping/couriers');
  return response.data;
};
