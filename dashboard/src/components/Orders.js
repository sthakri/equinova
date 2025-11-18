import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiClient, API_ENDPOINTS } from "../utils/apiConfig";

const Orders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterSymbol, setFilterSymbol] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, BUY, SELL
  const [sortOrder, setSortOrder] = useState("DESC"); // DESC (newest first), ASC (oldest first)

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.ORDERS);

      let orders = [];
      if (res.data.success && res.data.orders) {
        orders = res.data.orders;
      } else {
        orders = res.data || [];
      }

      setAllOrders(orders);
      applyFilters(orders, filterSymbol, filterType, sortOrder);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setAllOrders([]);
      setFilteredOrders([]);
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Apply filters and sorting
  const applyFilters = (orders, symbol, type, sort) => {
    let filtered = [...orders];

    // Filter by symbol
    if (symbol.trim() !== "") {
      filtered = filtered.filter((order) =>
        order.symbol.toUpperCase().includes(symbol.toUpperCase())
      );
    }

    // Filter by type
    if (type !== "ALL") {
      filtered = filtered.filter((order) => order.type === type);
    }

    // Sort by timestamp
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sort === "DESC" ? dateB - dateA : dateA - dateB;
    });

    setFilteredOrders(filtered);
  };

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters when they change
  useEffect(() => {
    applyFilters(allOrders, filterSymbol, filterType, sortOrder);
  }, [filterSymbol, filterType, sortOrder, allOrders]);

  // Refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  // Format date/time
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Clear filters
  const clearFilters = () => {
    setFilterSymbol("");
    setFilterType("ALL");
    setSortOrder("DESC");
  };

  if (loading) {
    return (
      <div className="orders">
        <h3 className="title">Order History</h3>
        <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
          Loading orders...
        </p>
      </div>
    );
  }

  if (allOrders.length === 0) {
    return (
      <div className="orders">
        <div className="no-orders">
          <p>You haven't placed any orders yet</p>
          <Link to={"/"} className="btn">
            Get started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3 className="title">
          Order History ({filteredOrders.length} of {allOrders.length})
        </h3>
        <button
          className="btn btn-blue"
          onClick={handleRefresh}
          disabled={refreshing}
          style={{ cursor: refreshing ? "wait" : "pointer" }}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Filters Section */}
      <div
        style={{
          display: "flex",
          gap: "15px",
          marginBottom: "20px",
          padding: "15px",
          background: "#f5f5f5",
          borderRadius: "4px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1", minWidth: "200px" }}>
          <label
            htmlFor="symbol-filter"
            style={{ display: "block", marginBottom: "5px", fontSize: "12px" }}
          >
            Filter by Symbol
          </label>
          <input
            id="symbol-filter"
            type="text"
            placeholder="e.g., INFY, TCS"
            value={filterSymbol}
            onChange={(e) => setFilterSymbol(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ flex: "1", minWidth: "150px" }}>
          <label
            htmlFor="type-filter"
            style={{ display: "block", marginBottom: "5px", fontSize: "12px" }}
          >
            Filter by Type
          </label>
          <select
            id="type-filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            <option value="ALL">All Orders</option>
            <option value="BUY">Buy Orders</option>
            <option value="SELL">Sell Orders</option>
          </select>
        </div>

        <div style={{ flex: "1", minWidth: "150px" }}>
          <label
            htmlFor="sort-order"
            style={{ display: "block", marginBottom: "5px", fontSize: "12px" }}
          >
            Sort by Date
          </label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            <option value="DESC">Newest First</option>
            <option value="ASC">Oldest First</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            onClick={clearFilters}
            style={{
              padding: "8px 16px",
              background: "#666",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Symbol</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#666",
                  }}
                >
                  No orders match your filters. Try adjusting or clearing the
                  filters.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td style={{ fontSize: "13px" }}>
                    {formatDateTime(order.timestamp)}
                  </td>
                  <td>
                    <strong>{order.symbol}</strong>
                  </td>
                  <td>
                    <span
                      className={order.type === "BUY" ? "loss" : "profit"}
                      style={{
                        fontWeight: "bold",
                        padding: "4px 8px",
                        borderRadius: "3px",
                        background:
                          order.type === "BUY" ? "#e3f2fd" : "#e8f5e9",
                      }}
                    >
                      {order.type}
                    </span>
                  </td>
                  <td>{order.qty}</td>
                  <td>${order.price.toFixed(2)}</td>
                  <td style={{ fontWeight: "bold" }}>
                    ${formatCurrency(order.totalValue)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      {filteredOrders.length > 0 && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f9f9f9",
            borderRadius: "4px",
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
              Total Buy Orders
            </p>
            <p
              style={{
                margin: "5px 0 0 0",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#2196f3",
              }}
            >
              {filteredOrders.filter((o) => o.type === "BUY").length}
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
              Total Sell Orders
            </p>
            <p
              style={{
                margin: "5px 0 0 0",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#4caf50",
              }}
            >
              {filteredOrders.filter((o) => o.type === "SELL").length}
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
              Total Volume
            </p>
            <p
              style={{
                margin: "5px 0 0 0",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              $
              {formatCurrency(
                filteredOrders.reduce((sum, o) => sum + o.totalValue, 0)
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
