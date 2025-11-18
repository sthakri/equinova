import React, { useContext, useState, useEffect } from "react";
import { Tooltip, Grow } from "@mui/material";
import { io } from "socket.io-client";
import GeneralContext from "./GeneralContext";
import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
} from "@mui/icons-material";
import { DoughnutChart } from "./DoughnoutChart";

// WebSocket URL from environment variable
const WS_URL = process.env.REACT_APP_WS_URL || "http://localhost:3002";

// All 50 US stocks divided into pages of 10
const ALL_STOCKS = [
  // Page 1 - Technology Giants
  [
    "AAPL",
    "MSFT",
    "GOOGL",
    "AMZN",
    "META",
    "TSLA",
    "NVDA",
    "ORCL",
    "ADBE",
    "CRM",
  ],
  // Page 2 - Tech & Semiconductors
  ["INTC", "AMD", "NFLX", "AVGO", "CSCO", "JPM", "BAC", "WFC", "GS", "MS"],
  // Page 3 - Finance & Banking
  ["C", "AXP", "BLK", "SCHW", "JNJ", "UNH", "PFE", "ABBV", "MRK", "TMO"],
  // Page 4 - Healthcare & Consumer
  ["ABT", "LLY", "WMT", "HD", "MCD", "NKE", "SBUX", "TGT", "COST", "LOW"],
  // Page 5 - Industrial, Energy & Communication
  ["BA", "CAT", "XOM", "CVX", "DIS", "CMCSA", "T", "VZ", "AAPL", "MSFT"],
];

const WatchList = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    // Create socket connection
    const socket = io(WS_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Handle connection
    socket.on("connect", () => {
      console.log("✅ WebSocket connected:", socket.id);
      setConnectionStatus("connected");

      // Subscribe to current page stocks
      socket.emit("subscribe_watchlist", ALL_STOCKS[currentPage]);
    });

    // Handle watchlist updates
    socket.on("watchlist_update", (priceData) => {
      console.log("📊 Received watchlist update:", priceData);

      // Format data for display
      const formattedData = priceData.map((stock) => ({
        name: stock.symbol,
        price: stock.price.toFixed(2),
        percent: `${
          stock.changePercent >= 0 ? "+" : ""
        }${stock.changePercent.toFixed(2)}%`,
        change: stock.change.toFixed(2),
        changePercent: stock.changePercent,
        isDown: stock.isDown,
        lastUpdated: stock.lastUpdated,
      }));

      setWatchlist(formattedData);
      setLoading(false);
    });

    // Handle connection errors
    socket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error);
      setConnectionStatus("error");
      setLoading(false);
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log("🔌 WebSocket disconnected:", reason);
      setConnectionStatus("disconnected");
    });

    // Cleanup on unmount
    return () => {
      console.log("🔌 Unsubscribing and disconnecting WebSocket");
      socket.emit("unsubscribe_watchlist");
      socket.disconnect();
    };
  }, [currentPage]); // Re-subscribe when page changes

  const handleNextPage = () => {
    if (currentPage < ALL_STOCKS.length - 1) {
      setCurrentPage(currentPage + 1);
      setLoading(true);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setLoading(true);
    }
  };

  const labels = watchlist.map((stock) => stock.name);
  const data = {
    labels,
    datasets: [
      {
        label: "Price",
        data: watchlist.map((stock) => stock.price),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="watchlist-container">
        <div className="search-container">
          <input
            type="text"
            name="search"
            id="search"
            placeholder="Search eg: AAPL, MSFT, GOOGL, TSLA"
            className="search"
          />
          <span className="counts">
            {connectionStatus === "connecting"
              ? "Connecting to live prices..."
              : connectionStatus === "error"
              ? "Connection error - Retrying..."
              : "Loading..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist-container">
      <div className="search-container">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search eg: AAPL, MSFT, GOOGL, TSLA"
          className="search"
        />
        <span className="counts">
          {watchlist.length} / 50
          {connectionStatus === "connected" && (
            <span style={{ color: "green", marginLeft: "5px" }}>● Live</span>
          )}
        </span>
      </div>

      <ul className="list">
        {watchlist.length === 0 ? (
          <li style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            No stocks in watchlist
          </li>
        ) : (
          watchlist.map((stock, index) => {
            return <WatchListItem stock={stock} key={stock.name || index} />;
          })
        )}
      </ul>

      {/* Pagination Controls */}
      <div className="watchlist-pagination">
        <button
          className="pagination-btn"
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          style={{ opacity: currentPage === 0 ? 0.5 : 1 }}
        >
          ← Prev
        </button>
        <span className="page-indicator">
          Page {currentPage + 1} of {ALL_STOCKS.length}
        </span>
        <button
          className="pagination-btn"
          onClick={handleNextPage}
          disabled={currentPage === ALL_STOCKS.length - 1}
          style={{ opacity: currentPage === ALL_STOCKS.length - 1 ? 0.5 : 1 }}
        >
          Next →
        </button>
      </div>

      <DoughnutChart data={data}></DoughnutChart>
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  const handleMouseEnter = (e) => {
    setShowWatchlistActions(true);
  };

  const handleMouseLeave = (e) => {
    setShowWatchlistActions(false);
  };

  return (
    <li onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>
        <div className="itemInfo">
          <span className="percent">{stock.percent}</span>
          {stock.isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="down" />
          )}
          <span className="price">{stock.price}</span>
        </div>
      </div>
      {showWatchlistActions && <WatchListActions uid={stock.name} />}
    </li>
  );
};

const WatchListActions = ({ uid }) => {
  const generalContext = useContext(GeneralContext);

  const handleBuyClick = () => {
    generalContext.openBuyWindow(uid);
  };

  const handleSellClick = () => {
    generalContext.openSellWindow(uid);
  };

  return (
    <span className="actions">
      <span>
        <Tooltip
          title="Buy (B)"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={handleBuyClick}
        >
          <button className="buy">Buy</button>
        </Tooltip>
        <Tooltip
          title="Sell (S)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="sell" onClick={handleSellClick}>
            Sell
          </button>
        </Tooltip>
        <Tooltip
          title="Analytics (A)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="action">
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>
        <Tooltip title="More" placement="top" arrow TransitionComponent={Grow}>
          <button className="action">
            <MoreHoriz className="icon" />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};
