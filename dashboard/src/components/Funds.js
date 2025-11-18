import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiClient, API_ENDPOINTS } from "../utils/apiConfig";

const Funds = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch wallet data
  const fetchWalletData = async () => {
    try {
      // Fetch balance and transactions in parallel
      const [balanceRes, transactionsRes] = await Promise.all([
        apiClient.get(API_ENDPOINTS.WALLET.BALANCE),
        apiClient.get(API_ENDPOINTS.WALLET.TRANSACTIONS),
      ]);

      setBalance(balanceRes.data.balance || 0);
      setTransactions(transactionsRes.data.transactions || []);
      setLoading(false);
      setLoadingTransactions(false);
      setRefreshing(false);
    } catch (err) {
      console.error("Error fetching wallet data:", err);
      setLoading(false);
      setLoadingTransactions(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchWalletData();
  }, []);

  // Refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    fetchWalletData();
  };

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <>
      <div className="funds">
        <p>Manage your virtual trading funds</p>
        <button
          className="btn btn-blue"
          onClick={handleRefresh}
          disabled={refreshing}
          style={{ cursor: refreshing ? "wait" : "pointer" }}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="row">
        <div className="col">
          <span>
            <p>Wallet Balance</p>
          </span>

          <div className="table">
            <div className="data">
              <p>Available balance</p>
              <p className="imp colored">
                ${loading ? "Loading..." : formatCurrency(balance)}
              </p>
            </div>
            <div className="data">
              <p>Currency</p>
              <p className="imp">USD</p>
            </div>
            <div className="data">
              <p>Account Type</p>
              <p className="imp">Virtual Trading</p>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="commodity">
            <h3>Virtual Trading Account</h3>
            <p>Start with $100,000 virtual money</p>
            <p>Practice trading without any risk!</p>
            <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
              Current Balance: <strong>${formatCurrency(balance)}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="row" style={{ marginTop: "30px" }}>
        <div className="col" style={{ width: "100%" }}>
          <h3 className="title">Transaction History ({transactions.length})</h3>

          <div className="order-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Symbol</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Amount</th>
                  <th>Balance After</th>
                </tr>
              </thead>
              <tbody>
                {loadingTransactions ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "#666",
                      }}
                    >
                      No transactions yet. Start trading to see your transaction
                      history!
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn, index) => (
                    <tr key={txn._id || index}>
                      <td>{formatDate(txn.timestamp)}</td>
                      <td>
                        <span
                          className={txn.type === "BUY" ? "loss" : "profit"}
                          style={{ fontWeight: "bold" }}
                        >
                          {txn.type}
                        </span>
                      </td>
                      <td>{txn.symbol || "-"}</td>
                      <td>{txn.quantity || "-"}</td>
                      <td>{txn.price ? `$${txn.price.toFixed(2)}` : "-"}</td>
                      <td
                        className={txn.type === "BUY" ? "loss" : "profit"}
                        style={{ fontWeight: "bold" }}
                      >
                        {txn.type === "BUY" ? "-" : "+"}$
                        {formatCurrency(txn.amount)}
                      </td>
                      <td>${formatCurrency(txn.balanceAfter)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Funds;
