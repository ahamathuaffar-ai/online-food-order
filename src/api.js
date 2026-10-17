const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export async function apiRequest(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  let responseBody = null;
  if (response.status !== 204) {
    const responseText = await response.text();
    if (responseText) {
      try {
        responseBody = JSON.parse(responseText);
      } catch {
        responseBody = { message: responseText };
      }
    }
  }

  if (!response.ok) {
    throw new Error(responseBody?.message || `Request failed (${response.status})`);
  }

  return responseBody;
}

export const api = {
  getFoods: () => apiRequest('/foods'),
  getCategories: () => apiRequest('/categories'),
  getPaymentSettings: () => apiRequest('/payment-settings'),
  savePaymentSettings: (token, settings) => apiRequest('/payment-settings', { token, method: 'PUT', body: JSON.stringify(settings) }),
  register: (details) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(details) }),
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getProfile: (token) => apiRequest('/auth/profile', { token }),
  updateProfile: (token, details) => apiRequest('/auth/profile', { token, method: 'PUT', body: JSON.stringify(details) }),
  getCart: (token) => apiRequest('/cart', { token }),
  addToCart: (token, foodId, quantity = 1) => apiRequest('/cart', { token, method: 'POST', body: JSON.stringify({ foodId, quantity }) }),
  updateCart: (token, foodId, quantity) => apiRequest('/cart', { token, method: 'PUT', body: JSON.stringify({ foodId, quantity }) }),
  getOrders: (token, isAdmin) => apiRequest(isAdmin ? '/orders' : '/orders/my', { token }),
  createOrder: (token, details) => apiRequest('/orders', { token, method: 'POST', body: JSON.stringify(details) }),
  cancelOrder: (token, orderId) => apiRequest(`/orders/${orderId}/cancel`, { token, method: 'PUT' }),
  updateOrderStatus: (token, orderId, status) => apiRequest(`/orders/${orderId}/status`, { token, method: 'PUT', body: JSON.stringify({ status }) }),
  createFood: (token, details) => apiRequest('/foods', { token, method: 'POST', body: JSON.stringify(details) }),
  updateFood: (token, foodId, details) => apiRequest(`/foods/${foodId}`, { token, method: 'PUT', body: JSON.stringify(details) }),
  deleteFood: (token, foodId) => apiRequest(`/foods/${foodId}`, { token, method: 'DELETE' }),
  createCategory: (token, name) => apiRequest('/categories', { token, method: 'POST', body: JSON.stringify({ name }) }),
  updateCategory: (token, categoryId, name) => apiRequest(`/categories/${categoryId}`, { token, method: 'PUT', body: JSON.stringify({ name }) }),
  deleteCategory: (token, categoryId) => apiRequest(`/categories/${categoryId}`, { token, method: 'DELETE' }),
};
