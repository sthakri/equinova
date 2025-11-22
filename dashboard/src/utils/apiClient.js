import axios from "axios";

// API Configuration
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3002";

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enable cookies for authentication
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor - Add Bearer token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    // Add Authorization header with token if available (for cross-site auth)
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors and redirect to login
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear authentication data
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");

      // Avoid infinite redirect loops - check if we're not already on login page
      if (!window.location.href.includes("/login")) {
        // Store current URL for redirect after login
        const currentPath = window.location.pathname + window.location.search;
        const dashboardUrl = window.location.origin;
        sessionStorage.setItem(
          "redirectAfterLogin",
          dashboardUrl + currentPath
        );

        // Get frontend URL from environment
        const frontendUrl =
          process.env.REACT_APP_FRONTEND_URL || "http://localhost:3001";

        // Redirect to frontend login page
        window.location.href = `${frontendUrl}/login`;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
