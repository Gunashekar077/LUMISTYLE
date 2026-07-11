import axios from 'axios';

// Dynamically determine the backend API URL based on the current page's hostname.
// This allows mobile devices and other local network users to reach the backend on port 5000.
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  
  // If it's a local address, connect to local backend on port 5000
  if (
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.') || 
    hostname.startsWith('10.') || 
    hostname.startsWith('172.') ||
    !hostname.includes('.')
  ) {
    return `http://${hostname}:5000/api`;
  }
  
  // Otherwise, use the production Render API URL
  return 'https://lumistyle-7yox.onrender.com/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to automatically append JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  login: async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  register: async (name, email, password) => {
    const response = await API.post('/auth/register', { name, email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  getProfile: async () => {
    const response = await API.get('/auth/profile');
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await API.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (email, code, newPassword) => {
    const response = await API.post('/auth/reset-password', { email, code, newPassword });
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
  }
};

// Products endpoints
export const productService = {
  getProducts: async (params = {}) => {
    const response = await API.get('/products', { params });
    return response.data;
  },
  getProductById: async (id) => {
    const response = await API.get(`/products/${id}`);
    return response.data;
  },
  createProduct: async (productData) => {
    const response = await API.post('/products', productData);
    return response.data;
  },
  updateProduct: async (id, productData) => {
    const response = await API.put(`/products/${id}`, productData);
    return response.data;
  },
  deleteProduct: async (id) => {
    const response = await API.delete(`/products/${id}`);
    return response.data;
  }
};

// Cart endpoints
export const cartService = {
  getCart: async () => {
    const response = await API.get('/cart');
    return response.data;
  },
  addCartItem: async (productId, quantity = 1) => {
    const response = await API.post('/cart/add', { productId, quantity });
    return response.data;
  },
  updateCartItem: async (productId, quantity) => {
    const response = await API.put('/cart/update', { productId, quantity });
    return response.data;
  },
  removeCartItem: async (productId) => {
    const response = await API.delete('/cart/remove', { data: { productId } });
    return response.data;
  }
};

// Orders endpoints
export const orderService = {
  createOrder: async (products, pricingDetails, shippingDetails, paymentMethod) => {
    const response = await API.post('/orders', { 
      products, 
      pricingDetails, 
      shippingDetails, 
      paymentMethod 
    });
    return response.data;
  },
  getOrders: async () => {
    const response = await API.get('/orders');
    return response.data;
  },
  getOrderById: async (id) => {
    const response = await API.get(`/orders/${id}`);
    return response.data;
  }
};

export default API;
