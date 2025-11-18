import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { VerticalGraph } from "./VerticalGraph";
import { apiClient, API_ENDPOINTS } from "../utils/apiConfig";

// WebSocket URL from environment variable
const WS_URL = process.env.REACT_APP_WS_URL || "http://localhost:3002";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [summary, setSummary] = useState({
    totalInvested: 0,
    totalCurrent: 0,
    totalPL: 0,
    totalPLPercent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  // Calculate summary from holdings with current prices
  const calculateSummary = (holdings) => {
    if (!holdings || holdings.length === 0) {
      return {
        totalInvested: 0,
        totalCurrent: 0,
        totalPL: 0,
        totalPLPercent: 0,
      };
    }

    const totalInvested = holdings.reduce((sum, h) => sum + h.avg * h.qty, 0);
    const totalCurrent = holdings.reduce((sum, h) => sum + h.price * h.qty, 0);
    const totalPL = totalCurrent - totalInvested;
    const totalPLPercent =
      totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

    return {
      totalInvested: parseFloat(totalInvested.toFixed(2)),
      totalCurrent: parseFloat(totalCurrent.toFixed(2)),
      totalPL: parseFloat(totalPL.toFixed(2)),
      totalPLPercent: parseFloat(totalPLPercent.toFixed(2)),
    };
  };

  useEffect(() => {
    let socket = null;

    // Fetch initial holdings data
    const fetchHoldings = async () => {
      try {
        const res = await apiClient.get(API_ENDPOINTS.ALL_HOLDINGS);

        let holdings = [];
        if (res.data.success && res.data.holdings) {
          holdings = res.data.holdings;
        } else {
          holdings = res.data || [];
        }

        setAllHoldings(holdings);
        setSummary(calculateSummary(holdings));
        setLoading(false);

        // If we have holdings, set up WebSocket for live updates
        if (holdings.length > 0) {
          setupWebSocket(holdings);
        }
      } catch (error) {
        console.error("Error fetching holdings:", error);
        setAllHoldings([]);
        setLoading(false);
      }
    };

    // Setup WebSocket connection for real-time price updates
    const setupWebSocket = (holdings) => {
      // Extract unique symbols from holdings
      const symbols = holdings.map((h) => h.name);

      if (symbols.length === 0) {
        return;
      }

      console.log("🔌 Setting up WebSocket for holdings:", symbols);

      // Create socket connection
      socket = io(WS_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      // Handle connection
      socket.on("connect", () => {
        console.log("✅ Holdings WebSocket connected:", socket.id);
        setConnectionStatus("connected");

        // Subscribe to holding symbols for price updates
        socket.emit("subscribe_watchlist", symbols);
      });

      // Handle price updates
      socket.on("watchlist_update", (priceData) => {
        console.log("📊 Received price update for holdings:", priceData);

        // Update holdings with new prices
        setAllHoldings((prevHoldings) => {
          const updatedHoldings = prevHoldings.map((holding) => {
            // Find matching price data
            const priceInfo = priceData.find((p) => p.symbol === holding.name);

            if (priceInfo) {
              // Update price and calculate P&L
              const currentPrice = priceInfo.price;
              const unrealizedPL = (currentPrice - holding.avg) * holding.qty;
              const unrealizedPLPercent =
                ((currentPrice - holding.avg) / holding.avg) * 100;

              return {
                ...holding,
                price: currentPrice,
                unrealizedPL: parseFloat(unrealizedPL.toFixed(2)),
                unrealizedPLPercent: parseFloat(unrealizedPLPercent.toFixed(2)),
                currentValue: parseFloat(
                  (currentPrice * holding.qty).toFixed(2)
                ),
                isDown: priceInfo.isDown,
              };
            }

            return holding;
          });

          // Recalculate summary with new prices
          setSummary(calculateSummary(updatedHoldings));

          return updatedHoldings;
        });
      });

      // Handle connection errors
      socket.on("connect_error", (error) => {
        console.error("❌ Holdings WebSocket connection error:", error);
        setConnectionStatus("error");
      });

      // Handle disconnection
      socket.on("disconnect", (reason) => {
        console.log("🔌 Holdings WebSocket disconnected:", reason);
        setConnectionStatus("disconnected");
      });
    };

    // Initialize
    fetchHoldings();

    // Cleanup on unmount
    return () => {
      if (socket) {
        console.log("🔌 Unsubscribing and disconnecting Holdings WebSocket");
        socket.emit("unsubscribe_watchlist");
        socket.disconnect();
      }
    };
  }, []);

  const labels = allHoldings.map((subArray) => subArray["name"]);
  const data = {
    labels,
    datasets: [
      {
        label: "Stock Price",
        data: allHoldings.map((stock) => stock.price),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };
  return (
    <>
      <h3 className="title">
        Holdings ({allHoldings.length})
        {connectionStatus === "connected" && (
          <span
            style={{ color: "green", marginLeft: "10px", fontSize: "14px" }}
          >
            ● Live
          </span>
        )}
        {loading && (
          <span style={{ color: "#666", marginLeft: "10px", fontSize: "14px" }}>
            Loading...
          </span>
        )}
      </h3>

      <div className="order-table">
        <table>
          <tr>
            <th>Instrument</th>
            <th>Qty.</th>
            <th>Avg. cost</th>
            <th>LTP</th>
            <th>Cur. val</th>
            <th>P&L</th>
            <th>P&L %</th>
          </tr>

          {allHoldings.length === 0 ? (
            <tr>
              <td
                colSpan="7"
                style={{ textAlign: "center", padding: "20px", color: "#666" }}
              >
                {loading
                  ? "Loading holdings..."
                  : "No holdings found. Start trading to see your portfolio!"}
              </td>
            </tr>
          ) : (
            allHoldings.map((stock, index) => {
              // Calculate P&L values
              const currentValue = stock.price * stock.qty;
              const investedValue = stock.avg * stock.qty;
              const profitLoss = currentValue - investedValue;
              const profitLossPercent =
                ((stock.price - stock.avg) / stock.avg) * 100;

              const isProfit = profitLoss >= 0.0;
              const profClass = isProfit ? "profit" : "loss";

              return (
                <tr key={stock._id || stock.name || index}>
                  <td>{stock.name}</td>
                  <td>{stock.qty}</td>
                  <td>{stock.avg.toFixed(2)}</td>
                  <td className={stock.isDown ? "loss" : "profit"}>
                    {stock.price.toFixed(2)}
                  </td>
                  <td>{currentValue.toFixed(2)}</td>
                  <td className={profClass}>
                    {profitLoss >= 0 ? "+" : ""}
                    {profitLoss.toFixed(2)}
                  </td>
                  <td className={profClass}>
                    {profitLossPercent >= 0 ? "+" : ""}
                    {profitLossPercent.toFixed(2)}%
                  </td>
                </tr>
              );
            })
          )}
        </table>
      </div>

      <div className="row">
        <div className="col">
          <h5>
            {summary.totalInvested.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h5>
          <p>Total investment</p>
        </div>
        <div className="col">
          <h5>
            {summary.totalCurrent.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h5>
          <p>Current value</p>
        </div>
        <div className="col">
          <h5 className={summary.totalPL >= 0 ? "profit" : "loss"}>
            {summary.totalPL.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            ({summary.totalPLPercent >= 0 ? "+" : ""}
            {summary.totalPLPercent.toFixed(2)}%)
          </h5>
          <p>P&L</p>
        </div>
      </div>
      <VerticalGraph data={data}></VerticalGraph>
    </>
  );
};

export default Holdings;
