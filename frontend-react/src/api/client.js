import { mockStore } from './mockStore';

// Determine default backend URL. If on GitHub Pages or custom domain and no VITE_API_URL, default to null for clean mock fallback
const ENV_URL = import.meta.env.VITE_API_URL;
let BASE_URL = localStorage.getItem('apex_custom_api_url') || ENV_URL || '';

export const connectionState = {
  isMockMode: false,
  apiEndpoint: BASE_URL,
  setApiEndpoint: (url) => {
    BASE_URL = url ? url.replace(/\/$/, '') : '';
    if (url) {
      localStorage.setItem('apex_custom_api_url', BASE_URL);
    } else {
      localStorage.removeItem('apex_custom_api_url');
    }
  }
};

async function request(endpoint, options = {}, fallbackFn = null) {
  // If no backend is configured or already determined offline, use in-browser store
  if (!BASE_URL && fallbackFn) {
    connectionState.isMockMode = true;
    return await fallbackFn();
  }

  const url = `${BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for fast fallback
    const res = await fetch(url, { ...config, signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Request failed with status ${res.status}`);
    }
    connectionState.isMockMode = false;
    return await res.json();
  } catch (error) {
    if (fallbackFn) {
      console.warn(`[Apex Engine] API unavailable at ${url}, switching to In-Browser Storage engine.`);
      connectionState.isMockMode = true;
      return await fallbackFn();
    }
    throw error;
  }
}

export const api = {
  // Stats
  getStats: () => request('/api/expenses/stats', {}, () => mockStore.getStats()),
  
  // History & Trends
  getHistory: (period = 'weekly') => request(`/api/expenses/history?period=${period}`, {}, () => mockStore.getHistory(period)),
  
  // Expenses CRUD
  getExpenses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/expenses?${query}`, {}, () => mockStore.getExpenses(params));
  },
  createExpense: (data) => request('/api/expenses', {
    method: 'POST',
    body: JSON.stringify(data)
  }, () => mockStore.createExpense(data)),
  updateExpense: (id, data) => request(`/api/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }, () => mockStore.updateExpense(id, data)),
  deleteExpense: (id) => request(`/api/expenses/${id}`, {
    method: 'DELETE'
  }, () => mockStore.deleteExpense(id)),
  getCategories: () => request('/api/expenses/categories', {}, () => mockStore.getCategories()),

  // Products CRUD
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/products?${query}`, {}, () => mockStore.getProducts(params));
  },
  createProduct: (data) => request('/api/products', {
    method: 'POST',
    body: JSON.stringify(data)
  }, () => mockStore.createProduct(data)),
  getProductDetails: (id) => request(`/api/products/${id}`, {}, () => {
    const prods = mockStore.getProducts();
    const p = prods.find(item => item.id === parseInt(id));
    if (!p) throw new Error('Product not found');
    return p;
  }),
  updateProduct: (id, data) => request(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }, () => mockStore.updateProduct(id, data)),
  deleteProduct: (id) => request(`/api/products/${id}`, {
    method: 'DELETE'
  }, () => mockStore.deleteProduct(id)),

  // AI Chatbot
  sendChatMessage: (message, apiKey = null) => request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, api_key: apiKey })
  }, () => mockStore.sendChatMessage(message, apiKey)),
  getChatHistory: () => request('/api/chat/history', {}, () => mockStore.getChatHistory()),
  clearChatHistory: () => request('/api/chat/history', { method: 'DELETE' }, () => mockStore.clearChatHistory()),

  // Seed / Reset
  reseedDatabase: () => request('/api/seed/reset', { method: 'POST' }, () => mockStore.reset())
};
