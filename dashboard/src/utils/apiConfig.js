import apiClient from "./apiClient";

// API Configuration
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3002";

// Export the configured API client
export { apiClient };

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
    PROFILE: `${API_BASE_URL}/api/auth/me`,
  },

  // Wallet endpoints
  WALLET: {
    BALANCE: `${API_BASE_URL}/api/wallet/balance`,
    TRANSACTIONS: `${API_BASE_URL}/api/wallet/transactions`,
  },

  // Market Data endpoints
  MARKET: {
    PRICES: `${API_BASE_URL}/api/market/prices`,
    PRICE: (symbol) => `${API_BASE_URL}/api/market/price/${symbol}`,
    SYMBOLS: `${API_BASE_URL}/api/market/symbols`,
    WATCHLIST: `${API_BASE_URL}/api/market/watchlist`,
    RESET: `${API_BASE_URL}/api/market/reset`,
  },

  // Trading endpoints
  ALL_HOLDINGS: `${API_BASE_URL}/allHoldings`,
  HOLDINGS: `${API_BASE_URL}/holdings`, // For individual holding lookup
  ORDERS: `${API_BASE_URL}/allOrders`,
  NEW_ORDER: `${API_BASE_URL}/newOrder`,
};

// Axios configuration with credentials
export const axiosConfig = {
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
};

export default API_BASE_URL;
