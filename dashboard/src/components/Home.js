import React, { useState, useEffect } from "react";
import { apiClient, API_ENDPOINTS } from "../utils/apiConfig";
import Dashboard from "./Dashboard";
import TopBar from "./TopBar";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    // Check authentication on mount
    const checkAuth = async () => {
      try {
        // Log token presence
        const token = localStorage.getItem("authToken");
        const tokenDebug = token ? `Token present (${token.substring(0, 20)}...)` : "NO TOKEN FOUND";
        console.log("[Auth Debug]", tokenDebug);
        setDebugInfo(`Step 1: ${tokenDebug}\n`);

        if (!token) {
          throw new Error("No authentication token found");
        }

        // Test authentication by calling a protected endpoint
        console.log("[Auth] Calling wallet balance endpoint...");
        setDebugInfo(prev => prev + "Step 2: Calling /api/wallet/balance...\n");
        
        const response = await apiClient.get(API_ENDPOINTS.WALLET.BALANCE);

        // If successful, user is authenticated
        console.log("[Auth] Authentication successful", response.status);
        setDebugInfo(prev => prev + `Step 3: Success! Status ${response.status}\n`);
        setIsAuthenticated(true);
        setIsChecking(false);
      } catch (error) {
        console.error("[Auth] Authentication check failed:", error);
        
        // Capture detailed error info
        const errorDetails = {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          hasToken: !!localStorage.getItem("authToken")
        };
        
        const debugText = `ERROR:\n${JSON.stringify(errorDetails, null, 2)}`;
        console.error("[Auth Debug]", debugText);
        setDebugInfo(prev => prev + debugText);

        const debugText = `ERROR:\n${JSON.stringify(errorDetails, null, 2)}`;
        console.error("[Auth Debug]", debugText);
        setDebugInfo(prev => prev + debugText);

        // Store error in localStorage for persistence
        localStorage.setItem("lastAuthError", debugText);

        // Always stop checking, even on error
        setIsChecking(false);
        setIsAuthenticated(false);

        // Don't redirect immediately - show error for debugging
        // User can refresh or manually navigate if needed
        return;
        
        /* DISABLED AUTO-REDIRECT FOR DEBUGGING
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
        */
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
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          padding: "20px",
          fontSize: "14px",
          fontFamily: "monospace",
          backgroundColor: "#1e1e1e",
          color: "#d4d4d4",
        }}
      >
        <div style={{ 
          maxWidth: "800px", 
          width: "100%",
          backgroundColor: "#252526",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #3e3e42"
        }}>
          <h2 style={{ color: "#f48771", marginTop: 0 }}>Authentication Failed</h2>
          <pre style={{ 
            whiteSpace: "pre-wrap", 
            wordBreak: "break-word",
            backgroundColor: "#1e1e1e",
            padding: "15px",
            borderRadius: "4px",
            overflow: "auto",
            maxHeight: "60vh"
          }}>
            {debugInfo || localStorage.getItem("lastAuthError") || "No debug info available"}
          </pre>
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={() => {
                localStorage.removeItem("authToken");
                localStorage.removeItem("lastAuthError");
                const frontendUrl = process.env.REACT_APP_FRONTEND_URL || "http://localhost:3001";
                window.location.href = `${frontendUrl}/login`;
              }}
              style={{
                padding: "10px 20px",
                marginRight: "10px",
                backgroundColor: "#0e639c",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Go to Login
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 20px",
                backgroundColor: "#3e3e42",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Retry
            </button>
          </div>
        </div>
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
