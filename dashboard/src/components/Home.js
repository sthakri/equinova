import React, { useState, useEffect } from "react";
import { apiClient, API_ENDPOINTS } from "../utils/apiConfig";
import Dashboard from "./Dashboard";
import TopBar from "./TopBar";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = async () => {
      try {
        // Test authentication by calling a protected endpoint
        const response = await apiClient.get(API_ENDPOINTS.WALLET.BALANCE);

        // If successful, user is authenticated
        console.log("[Auth] Authentication successful", response.status);
        setIsAuthenticated(true);
        setIsChecking(false);
      } catch (error) {
        console.error("[Auth] Authentication check failed:", error);

        // Always stop checking, even on error
        setIsChecking(false);
        setIsAuthenticated(false);

        // For 401, redirect to login
        if (error.response?.status === 401) {
          console.log(
            "[Auth] Not authenticated (401), redirecting to login..."
          );

          // Clear invalid token
          localStorage.removeItem("authToken");

          // Store redirect URL and redirect to login
          const currentPath = window.location.pathname + window.location.search;
          const dashboardUrl = window.location.origin;
          sessionStorage.setItem(
            "redirectAfterLogin",
            dashboardUrl + currentPath
          );

          const frontendUrl =
            process.env.REACT_APP_FRONTEND_URL || "http://localhost:3001";

          // Small delay to show error state, then redirect
          setTimeout(() => {
            window.location.href = `${frontendUrl}/login`;
          }, 500);
        } else {
          // For network or other errors, also redirect
          console.error("[Auth] Network or server error, redirecting...");
          localStorage.removeItem("authToken");

          const frontendUrl =
            process.env.REACT_APP_FRONTEND_URL || "http://localhost:3001";

          setTimeout(() => {
            window.location.href = `${frontendUrl}/login`;
          }, 500);
        }
      }
    };

    checkAuth();
  }, []);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#666",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #3498db",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px auto",
            }}
          ></div>
          <p>Verifying authentication...</p>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // Only render dashboard if authenticated
  if (!isAuthenticated) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#666",
        }}
      >
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <>
      <TopBar />
      <Dashboard />
    </>
  );
};

export default Home;
