import api from './axios';

// List orders: /orders?status=&channel=&page=&pageSize=
export const listOrdersApi = async (params = {}) => {
  const res = await api.get('/orders', { params });
  return res.data; // { items, total, page, pageSize, ... }
};

// Get order detail: /orders/:id
export const getOrderApi = async (id) => {
  const res = await api.get(`/orders/${id}`);
  return res.data; // full order object
};

// Guest checkout (tanpa perlu login)
export const guestCheckoutApi = async (payload) => {
  const res = await api.post('/orders/guest/checkout', payload);
  return res.data; // { order_id, order_number, guest_info, ... }
};
