import axios from 'axios';
import { getToken, getGuestId } from '../utils/constants';

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    config.headers['x-guest-id'] = getGuestId();
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('greenshoes_token');
      localStorage.removeItem('greenshoes_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  checkEmail: (email) => api.post('/auth/check-email', { email }),
};

// Product APIs
export const productAPI = {
  getAll: (params) => api.get('/catalog', { params }),
  getById: (id) => api.get(`/products/${id}`),
};

// Cart APIs
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (item) => api.post('/cart/add', item),
  increase: (itemId) => api.patch(`/cart/${itemId}/increase`),
  decrease: (itemId) => api.patch(`/cart/${itemId}/decrease`),
  changeVariant: (itemId, variant) => api.patch(`/cart/${itemId}/change-variant`, variant),
  remove: (itemId) => api.delete(`/cart/${itemId}`),
  moveToWishlist: (itemId) => api.post(`/cart/move-to-wishlist/${itemId}`),
};

// Wishlist APIs
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist/add', { product_id: productId }),  // Fixed: product_id instead of productId
  remove: (productId) => api.delete(`/wishlist/${productId}`),
  moveToCart: (productId, variant) => api.post(`/wishlist/move-to-cart/${productId}`, variant),
};

// Address APIs
export const addressAPI = {
  getAll: () => api.get('/addresses'),
  getById: (id) => api.get(`/addresses/${id}`),
  add: (address) => api.post('/addresses', address),
  update: (id, address) => api.put(`/addresses/${id}`, address),
  delete: (id) => api.delete(`/addresses/${id}`),
  setDefault: (id) => api.patch(`/addresses/${id}/set-default`),
};

// Payment Card APIs
export const paymentAPI = {
  get: () => api.get('/payment-cards'),
  add: (card) => api.post('/payment-cards', card),
  delete: () => api.delete('/payment-cards'),
};

// Checkout APIs
export const checkoutAPI = {
  guest: (data) => api.post('/checkout/guest', data),
  savedCard: (data) => api.post('/checkout/saved-card', data),
  newCard: (data) => api.post('/checkout/new-card', data),
};

// Order APIs
export const orderAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  reorder: (id) => api.post(`/orders/${id}/reorder`),
};

export default api;