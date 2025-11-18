import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { apiClient, API_ENDPOINTS } from "../utils/apiConfig";

// WebSocket URL from environment variable
const WS_URL = process.env.REACT_APP_WS_URL || "http://localhost:3002";

const Summary = () => {
  const [balance, setBalance] = useState(0);
  const [holdings, setHoldings] = useState([]);
  const [holdingsSummary, setHoldingsSummary] = useState({
    totalHoldings: 0,
    totalInvested: 0,
    totalCurrent: 0,
    totalPL: 0,
    totalPLPercent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [userName, setUserName] = useState("User");

  // Calculate summary from holdings with current prices
  const calculateSummary = (holdingsData) => {
    if (!holdingsData || holdingsData.length === 0) {
      return {
        totalHoldings: 0,
        totalInvested: 0,
        totalCurrent: 0,
        totalPL: 0,
        totalPLPercent: 0,
      };
    }

    const totalInvested = holdingsData.reduce(
      (sum, h) => sum + h.avg * h.qty,
      0
    );
    const totalCurrent = holdingsData.reduce(
      (sum, h) => sum + h.price * h.qty,
      0
    );
    const totalPL = totalCurrent - totalInvested;
    const totalPLPercent =
      totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

    return {
      totalHoldings: holdingsData.length,
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      totalCurrent: parseFloat(totalCurrent.toFixed(2)),
      totalPL: parseFloat(totalPL.toFixed(2)),
      totalPLPercent: parseFloat(totalPLPercent.toFixed(2)),
    };
  };

  // Fetch user name on mount
  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      // Fetch from API if not in localStorage
      const fetchUserName = async () => {
        try {
          const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
          if (response.data.success && response.data.user) {
            const fullName = response.data.user.fullName || "User";
            setUserName(fullName);
            localStorage.setItem("userName", fullName);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      };
      fetchUserName();
    }
  }, []);

  useEffect(() => {
    let socket = null;

    // Fetch wallet balance and holdings
    const fetchData = async () => {
      try {
        const [balanceRes, holdingsRes] = await Promise.all([
          apiClient.get(API_ENDPOINTS.WALLET.BALANCE),
          apiClient.get(API_ENDPOINTS.ALL_HOLDINGS),
        ]);

        setBalance(balanceRes.data.balance || 0);

        let holdingsData = [];
        if (holdingsRes.data.success && holdingsRes.data.holdings) {
          holdingsData = holdingsRes.data.holdings;
        } else {
          holdingsData = holdingsRes.data || [];
        }

        setHoldings(holdingsData);
        setHoldingsSummary(calculateSummary(holdingsData));
        setLoading(false);

        // If we have holdings, set up WebSocket for live updates
        if (holdingsData.length > 0) {
          setupWebSocket(holdingsData);
        }
      } catch (error) {
        console.error("Error fetching summary data:", error);
        setLoading(false);
      }
    };

    // Setup WebSocket connection for real-time price updates
    const setupWebSocket = (holdingsData) => {
      // Extract unique symbols from holdings
      const symbols = holdingsData.map((h) => h.name);

      if (symbols.length === 0) {
        return;
      }

      console.log("🔌 Setting up WebSocket for Summary:", symbols);

      // Create socket connection
      socket = io(WS_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      // Handle connection
      socket.on("connect", () => {
        console.log("✅ Summary WebSocket connected:", socket.id);
        setConnectionStatus("connected");

        // Subscribe to holding symbols for price updates
        socket.emit("subscribe_watchlist", symbols);
      });

      // Handle price updates
      socket.on("watchlist_update", (priceData) => {
        console.log("📊 Summary received price update:", priceData);

        // Update holdings with new prices
        setHoldings((prevHoldings) => {
          const updatedHoldings = prevHoldings.map((holding) => {
            // Find matching price data
            const priceInfo = priceData.find((p) => p.symbol === holding.name);

            if (priceInfo) {
              return {
                ...holding,
                price: priceInfo.price,
              };
            }

            return holding;
          });

          // Recalculate summary with new prices
          setHoldingsSummary(calculateSummary(updatedHoldings));

          return updatedHoldings;
        });
      });

      // Handle connection errors
      socket.on("connect_error", (error) => {
        console.error("❌ Summary WebSocket connection error:", error);
        setConnectionStatus("error");
      });

      // Handle disconnection
      socket.on("disconnect", (reason) => {
        console.log("🔌 Summary WebSocket disconnected:", reason);
        setConnectionStatus("disconnected");
      });
    };

    // Initialize
    fetchData();

    // Cleanup on unmount
    return () => {
      if (socket) {
        console.log("🔌 Unsubscribing and disconnecting Summary WebSocket");
        socket.emit("unsubscribe_watchlist");
        socket.disconnect();
      }
    };
  }, []);

  const formatCurrency = (value) => {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatCompact = (value) => {
    if (value >= 1000) {
      return (value / 1000).toFixed(2) + "k";
    }
    return value.toFixed(2);
  };

  return (
    <>
      <div className="username">
        <h6>Hi, {userName.split(" ")[0]}!</h6>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>Equity</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>{loading ? "..." : formatCompact(balance)}</h3>
            <p>Available Cash</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Wallet Balance{" "}
              <span>{loading ? "..." : `$${formatCurrency(balance)}`}</span>
            </p>
            <p>
              Opening Balance{" "}
              <span>{loading ? "..." : formatCompact(balance)}</span>
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      <div className="section">
        <span>
          <p>
            Holdings ({holdingsSummary.totalHoldings})
            {!loading &&
              connectionStatus === "connected" &&
              holdings.length > 0 && (
                <span
                  style={{
                    color: "green",
                    marginLeft: "10px",
                    fontSize: "12px",
                  }}
                >
                  ● Live
                </span>
              )}
          </p>
        </span>

        <div className="data">
          <div className="first">
            <h3 className={holdingsSummary.totalPL >= 0 ? "profit" : "loss"}>
              {loading ? "..." : formatCompact(holdingsSummary.totalPL)}{" "}
              <small>
                {holdingsSummary.totalPLPercent >= 0 ? "+" : ""}
                {holdingsSummary.totalPLPercent.toFixed(2)}%
              </small>
            </h3>
            <p>Total P&L</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Current Value{" "}
              <span>
                {loading
                  ? "..."
                  : `$${formatCurrency(holdingsSummary.totalCurrent)}`}
              </span>
            </p>
            <p>
              Total Invested{" "}
              <span>
                {loading
                  ? "..."
                  : `$${formatCurrency(holdingsSummary.totalInvested)}`}
              </span>
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      {/* Portfolio Summary Card */}
      {!loading && holdingsSummary.totalHoldings > 0 && (
        <div className="section">
          <span>
            <p>Portfolio Summary</p>
          </span>

          <div className="data">
            <div style={{ padding: "10px 0", width: "100%" }}>
              <div style={{ marginBottom: "12px" }}>
                <p
                  style={{
                    margin: "0 0 5px 0",
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  Total Portfolio Value
                </p>
                <p
                  style={{ margin: "0", fontSize: "18px", fontWeight: "bold" }}
                >
                  ${formatCurrency(balance + holdingsSummary.totalCurrent)}
                </p>
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "11px",
                    color: "#999",
                  }}
                >
                  Cash + Holdings
                </p>
              </div>

              <hr
                style={{
                  margin: "12px 0",
                  border: "none",
                  borderTop: "1px solid #eee",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "13px", color: "#666" }}>
                  Available Cash:
                </span>
                <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                  ${formatCurrency(balance)}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "13px", color: "#666" }}>
                  Invested Amount:
                </span>
                <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                  ${formatCurrency(holdingsSummary.totalInvested)}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "13px", color: "#666" }}>
                  Current Holdings Value:
                </span>
                <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                  ${formatCurrency(holdingsSummary.totalCurrent)}
                </span>
              </div>

              <hr
                style={{
                  margin: "12px 0",
                  border: "none",
                  borderTop: "1px solid #eee",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "13px", color: "#666" }}>
                  Unrealized P&L:
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: holdingsSummary.totalPL >= 0 ? "#4caf50" : "#f44336",
                  }}
                >
                  {holdingsSummary.totalPL >= 0 ? "+" : ""}$
                  {formatCurrency(Math.abs(holdingsSummary.totalPL))} (
                  {holdingsSummary.totalPLPercent >= 0 ? "+" : ""}
                  {holdingsSummary.totalPLPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
          <hr className="divider" />
        </div>
      )}
    </>
  );
};

export default Summary;
