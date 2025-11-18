/**
 * Authentication Helper Functions
 * Provides utilities for handling authentication flows in the dashboard
 */

/**
 * Store the current URL for redirect after login
 * @param {string} url - Optional URL to store. If not provided, uses current location
 */
export const storeRedirectUrl = (url = null) => {
  const redirectUrl = url || window.location.pathname + window.location.search;
  const dashboardUrl = window.location.origin;
  sessionStorage.setItem("redirectAfterLogin", dashboardUrl + redirectUrl);
};

/**
 * Get the stored redirect URL and clear it from session storage
 * @returns {string|null} - The stored redirect URL or null if not found
 */
export const getAndClearRedirectUrl = () => {
  const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
  if (redirectUrl) {
    sessionStorage.removeItem("redirectAfterLogin");
    return redirectUrl;
  }
  return null;
};

/**
 * Redirect to the frontend login page
 * Stores current URL for redirect after successful login
 */
export const redirectToLogin = () => {
  // Store current location for redirect after login
  storeRedirectUrl();

  // Get frontend URL from environment
  const frontendUrl =
    process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";

  // Redirect to login page
  window.location.href = `${frontendUrl}/login`;
};

/**
 * Redirect to the frontend home/landing page
 */
export const redirectToFrontend = () => {
  const frontendUrl =
    process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";
  window.location.href = frontendUrl;
};

/**
 * Check if user is authenticated by testing a protected endpoint
 * @param {Function} apiCall - Function that makes an API call to a protected endpoint
 * @returns {Promise<boolean>} - True if authenticated, false otherwise
 */
export const checkAuthentication = async (apiCall) => {
  try {
    await apiCall();
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      return false;
    }
    // For other errors, we should also treat as not authenticated
    console.error("Error checking authentication:", error);
    return false;
  }
};

/**
 * Clear authentication data from local/session storage
 */
export const clearAuthData = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  sessionStorage.removeItem("user");
};
