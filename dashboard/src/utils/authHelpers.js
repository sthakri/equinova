/**
 * Authentication Helper Functions
 * Provides utilities for handling authentication flows in the dashboard
 */

/**
 * Redirect to the frontend home/landing page
 */
export const redirectToFrontend = () => {
  const frontendUrl =
    process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";
  window.location.href = frontendUrl;
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
