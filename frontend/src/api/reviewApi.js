import api from '../utils/api';

export const reviewApi = {
  // Get all reviews for admin
  getReviews: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.product_id) params.append('product_id', filters.product_id);
    if (filters.user_id) params.append('user_id', filters.user_id);
    
  const response = await api.get(`/api/reviews-admin?${params.toString()}`);
  return response.data; // { success, data }
  },

  // Approve review
  approveReview: async (reviewId) => {
  const response = await api.patch(`/api/reviews-admin/${reviewId}/approve`);
    return response.data;
  },

  // Reject review
  rejectReview: async (reviewId) => {
  const response = await api.patch(`/api/reviews-admin/${reviewId}/reject`);
    return response.data;
  },

  // Delete review
  deleteReview: async (reviewId) => {
  const response = await api.delete(`/api/reviews-admin/${reviewId}`);
    return response.data;
  }
};

export default reviewApi;