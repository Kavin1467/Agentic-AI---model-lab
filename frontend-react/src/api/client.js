const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Stats
  getStats: () => request('/api/expenses/stats'),
  
  // History & Trends
  getHistory: (period = 'weekly') => request(`/api/expenses/history?period=${period}`),
  
  // Expenses CRUD
  getExpenses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/expenses?${query}`);
  },
  createExpense: (data) => request('/api/expenses', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateExpense: (id, data) => request(`/api/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteExpense: (id) => request(`/api/expenses/${id}`, {
    method: 'DELETE'
  }),
  getCategories: () => request('/api/expenses/categories'),

  // Products CRUD
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/products?${query}`);
  },
  createProduct: (data) => request('/api/products', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getProductDetails: (id) => request(`/api/products/${id}`),
  updateProduct: (id, data) => request(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteProduct: (id) => request(`/api/products/${id}`, {
    method: 'DELETE'
  }),

  // AI Chatbot
  sendChatMessage: (message, apiKey = null) => request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, api_key: apiKey })
  }),
  getChatHistory: () => request('/api/chat/history'),
  clearChatHistory: () => request('/api/chat/history', { method: 'DELETE' }),

  // Seed / Reset
  reseedDatabase: () => request('/api/seed/reset', { method: 'POST' })
};
