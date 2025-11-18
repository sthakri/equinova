import React, { useContext, useState, useEffect } from "react";
import GeneralContext from "./GeneralContext";
import { apiClient, API_ENDPOINTS } from "../utils/apiConfig";
import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);
  const [currentPrice, setCurrentPrice] = useState(0.0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { closeTradeWindow } = useContext(GeneralContext);

  // Fetch current price for the symbol
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.MARKET.PRICE(uid));

        if (response.data.success && response.data.data) {
          const price = response.data.data.price;
          setCurrentPrice(price);
          setStockPrice(price);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching price:", err);
        setError("Unable to fetch current price. Please try again.");
        setLoading(false);
      }
    };

    if (uid) {
      fetchPrice();
    }
  }, [uid]);

  // Calculate total cost
  const totalCost = (stockPrice * stockQuantity).toFixed(2);

  const handleBuyClick = async () => {
    const quantity = Number(stockQuantity);
    const price = Number(stockPrice);

    // Validation
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError("Please enter a valid quantity (minimum 1).");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await apiClient.post(API_ENDPOINTS.NEW_ORDER, {
        name: uid,
        qty: quantity,
        price,
        mode: "BUY",
      });

      // Show success message
      setSuccess(true);
      setError("");

      // Close window after short delay to show success
      setTimeout(() => {
        closeTradeWindow();
        // Trigger page refresh to update holdings and balance
        window.location.reload();
      }, 1000);
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to place buy order.";
      setError(message);
      setSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    closeTradeWindow();
  };

  const handleQuantityChange = (e) => {
    const value = Number(e.target.value);
    if (value >= 0) {
      setStockQuantity(value);
    }
  };

  const handlePriceChange = (e) => {
    const value = Number(e.target.value);
    if (value >= 0) {
      setStockPrice(value);
    }
  };

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <div
            style={{
              marginBottom: "15px",
              padding: "10px",
              background: "#f5f5f5",
              borderRadius: "4px",
            }}
          >
            <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#666" }}>
              <strong>{uid}</strong>
            </p>
            <p style={{ margin: "0", fontSize: "12px", color: "#999" }}>
              Current Market Price:
              {loading ? (
                <span> Loading...</span>
              ) : (
                <strong style={{ color: "#333" }}>
                  {" "}
                  ${currentPrice.toFixed(2)}
                </strong>
              )}
            </p>
          </div>

          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              min="1"
              step="1"
              onChange={handleQuantityChange}
              value={stockQuantity}
              disabled={loading || submitting}
            />
          </fieldset>
          <fieldset>
            <legend>Price per share</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              min="0"
              onChange={handlePriceChange}
              value={stockPrice}
              disabled={loading || submitting}
            />
          </fieldset>
        </div>
      </div>

      {error && (
        <div
          className="order-error"
          style={{
            color: "#d32f2f",
            backgroundColor: "#ffebee",
            border: "1px solid #ef5350",
            borderRadius: "4px",
            padding: "12px 16px",
            margin: "10px 0",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "16px" }}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          style={{
            color: "#2e7d32",
            backgroundColor: "#e8f5e9",
            border: "1px solid #66bb6a",
            borderRadius: "4px",
            padding: "12px 16px",
            margin: "10px 0",
            fontSize: "14px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "16px" }}>✓</span>
          <span>Order placed successfully! Updating...</span>
        </div>
      )}

      <div className="buttons">
        <span style={{ fontSize: "14px", color: "#333" }}>
          Total Cost: <strong>${totalCost}</strong>
        </span>
        <div>
          <button
            type="button"
            className="btn btn-blue"
            onClick={handleBuyClick}
            disabled={loading || submitting || success}
            style={{
              cursor:
                loading || submitting || success ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Placing Order..." : loading ? "Loading..." : "Buy"}
          </button>
          <button
            type="button"
            className="btn btn-grey"
            onClick={handleCancelClick}
            disabled={submitting || success}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
