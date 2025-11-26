import api from './axios';

export const bannerApi = {
  // Get all active banners for homepage (ordered)
  getPublicBanners: async () => {
    const response = await api.get('/banners');
    return response.data;
  }
};

export default bannerApi;
