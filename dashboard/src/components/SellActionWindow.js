import React, { useContext, useEffect, useState } from "react";
import GeneralContext from "./GeneralContext";
import { apiClient, API_ENDPOINTS } from "../utils/apiConfig";
import "./BuyActionWindow.css";

const SellActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);
  const [currentPrice, setCurrentPrice] = useState(0.0);
  const [availableQty, setAvailableQty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { closeTradeWindow } = useContext(GeneralContext);

  // Fetch both available quantity and current price
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Fetch available quantity
        const encodedUid = encodeURIComponent(uid);
        const holdingsResponse = await apiClient.get(
          `${API_ENDPOINTS.HOLDINGS}/${encodedUid}`
        );

        if (!isMounted) return;

        // Backend returns { success: true, holding: { qty, ... } }
        const qty = holdingsResponse.data?.holding?.qty ?? 0;
        setAvailableQty(qty);

        // Fetch current market price
        const priceResponse = await apiClient.get(
          API_ENDPOINTS.MARKET.PRICE(uid)
        );

        if (!isMounted) return;

        if (priceResponse.data.success && priceResponse.data.data) {
          const price = priceResponse.data.data.price;
          setCurrentPrice(price);
          setStockPrice(price);
        }

        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching data:", err);

        // If 404, means no holding exists - set qty to 0
        if (err.response?.status === 404) {
          setAvailableQty(0);
          setError("You don't own any shares of this stock.");
        } else {
          setError("Unable to fetch current price. Please try again.");
        }
        setLoading(false);
      }
    };

    if (uid) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [uid]);

  // Calculate total revenue
  const totalRevenue = (stockPrice * stockQuantity).toFixed(2);

  const handleSellClick = async () => {
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

    if (availableQty !== null && quantity > availableQty) {
      setError(`Only ${availableQty} shares available to sell.`);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await apiClient.post(API_ENDPOINTS.NEW_ORDER, {
        name: uid,
        qty: quantity,
        price,
        mode: "SELL",
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
        err.response?.data?.message || "Unable to place sell order.";
      setError(message);
      setSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    closeTradeWindow();
  };

  const handleQuantityChange = (e) => {
    const value = Number(e.target.value);
    // Allow entering quantities greater than available to trigger validation on submit
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

  const isSellDisabled = loading || availableQty === null || availableQty === 0;

  return (
    <div className="container" id="sell-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <div
            style={{
              marginBottom: "15px",
              padding: "10px",
              background: "#fff3e0",
              borderRadius: "4px",
              border: "1px solid #ffb74d",
            }}
          >
            <p style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#666" }}>
              <strong>{uid}</strong>
            </p>
            <p style={{ margin: "0 0 5px 0", fontSize: "12px", color: "#999" }}>
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
            <p style={{ margin: "0", fontSize: "12px", color: "#999" }}>
              {availableQty === null
                ? "Checking available quantity..."
                : availableQty === 0
                ? "⚠️ No shares available to sell"
                : `Available: ${availableQty} shares`}
            </p>
          </div>

          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="sell-qty"
              min="1"
              max={availableQty || 1}
              step="1"
              onChange={handleQuantityChange}
              value={stockQuantity}
              disabled={loading || submitting || isSellDisabled}
            />
          </fieldset>
          <fieldset>
            <legend>Price per share</legend>
            <input
              type="number"
              name="price"
              id="sell-price"
              step="0.05"
              min="0"
              onChange={handlePriceChange}
              value={stockPrice}
              disabled={loading || submitting || isSellDisabled}
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
          Total Revenue: <strong>${totalRevenue}</strong>
        </span>
        <div>
          <button
            type="button"
            className="btn btn-red"
            onClick={handleSellClick}
            disabled={isSellDisabled || submitting || success}
            style={{
              cursor:
                isSellDisabled || submitting || success
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {submitting ? "Placing Order..." : loading ? "Loading..." : "Sell"}
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

export default SellActionWindow;
