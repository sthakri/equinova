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

    // Log requests in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors and redirect to login
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${
          response.config.url
        } - ${response.status}`
      );
    }
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.warn("[API] Unauthorized - Redirecting to login");

      // Clear authentication data
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");

      // Store current URL for redirect after login
      const currentPath = window.location.pathname + window.location.search;
      const dashboardUrl = window.location.origin;
      sessionStorage.setItem("redirectAfterLogin", dashboardUrl + currentPath);

      // Get frontend URL from environment
      const frontendUrl =
        process.env.REACT_APP_FRONTEND_URL || "http://localhost:3001";

      // Redirect to frontend login page
      // Check if we're not already being redirected to avoid infinite loops
      if (!window.location.href.includes("/login")) {
        window.location.href = `${frontendUrl}/login`;
      }
    }

    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      console.error("[API] Forbidden - Access denied");
    }

    // Handle network errors
    if (!error.response) {
      console.error("[API] Network Error - Unable to reach server");
    }

    // Log other errors in development
    if (process.env.NODE_ENV === "development" && error.response) {
      console.error(
        `[API Error] ${error.config?.method?.toUpperCase()} ${
          error.config?.url
        } - ${error.response.status}`,
        error.response.data
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;
