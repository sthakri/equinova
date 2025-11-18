import React, { useState, useEffect } from "react";
import { apiClient, API_ENDPOINTS } from "../utils/apiConfig";
import { clearAuthData, redirectToFrontend } from "../utils/authHelpers";
import Menu from "./Menu";

const TopBar = () => {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userInitials, setUserInitials] = useState("U");

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
        if (response.data.success && response.data.user) {
          const fullName = response.data.user.fullName || "User";
          setUserName(fullName);

          // Generate initials from full name
          const nameParts = fullName.trim().split(/\s+/);
          const initials =
            nameParts.length >= 2
              ? (
                  nameParts[0][0] + nameParts[nameParts.length - 1][0]
                ).toUpperCase()
              : fullName.substring(0, 2).toUpperCase();
          setUserInitials(initials);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error("Logout error:", error);
    }

    clearAuthData();
    redirectToFrontend();
  };

  return (
    <div className="topbar-container">
      <div className="indices-container">
        <div className="nifty">
          <p className="index">NIFTY 50</p>
          <p className="index-points">{100.2} </p>
          <p className="percent"> </p>
        </div>
        <div className="sensex">
          <p className="index">SENSEX</p>
          <p className="index-points">{100.2}</p>
          <p className="percent"></p>
        </div>
      </div>

      <Menu />

      {/* Profile Section in TopBar */}
      <div className="topbar-profile" onClick={handleProfileClick}>
        <div className="topbar-avatar">{userInitials}</div>
        <p className="topbar-username">{userName}</p>

        {/* Profile Dropdown */}
        {isProfileDropdownOpen && (
          <div className="topbar-dropdown">
            <div className="topbar-dropdown-header">
              <p className="topbar-dropdown-label">Account</p>
              <p className="topbar-dropdown-name">{userName}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="topbar-logout-btn"
              style={{
                background: isLoggingOut ? "#f5f5f5" : "white",
                color: isLoggingOut ? "#999" : "#f44336",
                cursor: isLoggingOut ? "not-allowed" : "pointer",
              }}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
