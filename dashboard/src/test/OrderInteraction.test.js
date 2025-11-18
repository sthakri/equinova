import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import BuyActionWindow from "../components/BuyActionWindow";
import SellActionWindow from "../components/SellActionWindow";
import GeneralContext from "../components/GeneralContext";
import { apiClient } from "../utils/apiConfig";

// Mock the apiConfig module
jest.mock("../utils/apiConfig", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
  API_ENDPOINTS: {
    MARKET: {
      PRICE: (symbol) => `/api/market/price/${symbol}`,
    },
    NEW_ORDER: "/api/orders",
    HOLDINGS: "/api/holdings",
  },
}));

describe("Order Interaction Tests", () => {
  const mockCloseTradeWindow = jest.fn();

  const renderBuyWindow = (uid) => {
    return render(
      <GeneralContext.Provider
        value={{
          closeTradeWindow: mockCloseTradeWindow,
          openBuyWindow: jest.fn(),
          openSellWindow: jest.fn(),
        }}
      >
        <BuyActionWindow uid={uid} />
      </GeneralContext.Provider>
    );
  };

  const renderSellWindow = (uid) => {
    return render(
      <GeneralContext.Provider
        value={{
          closeTradeWindow: mockCloseTradeWindow,
          openBuyWindow: jest.fn(),
          openSellWindow: jest.fn(),
        }}
      >
        <SellActionWindow uid={uid} />
      </GeneralContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    delete window.location;
    window.location = { reload: jest.fn() };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Buy Order Flow", () => {
    test("completes full buy order flow", async () => {
      const user = userEvent.setup();

      // Mock price fetch
      apiClient.get.mockResolvedValue({
        data: {
          success: true,
          data: { price: 150.0 },
        },
      });

      // Mock order submission
      apiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: "Buy order placed successfully",
        },
      });

      const { container } = renderBuyWindow("AAPL");

      // Wait for price to load
      await waitFor(() => {
        const prices = screen.getAllByText("$150.00");
        expect(prices.length).toBeGreaterThan(0);
      });

      // Enter quantity - use the input inside the buy window
      const inputs = within(container).getAllByRole("spinbutton");
      const qtyInput = inputs[0]; // First input is qty
      await user.clear(qtyInput);
      await user.type(qtyInput, "10");

      // Verify total cost is calculated
      await waitFor(() => {
        expect(
          screen.getByText((content, element) => {
            return (
              element.tagName === "SPAN" &&
              element.textContent.includes("Total Cost:") &&
              element.textContent.includes("$1500.00")
            );
          })
        ).toBeInTheDocument();
      });

      // Click buy button
      const buyButton = screen.getByText("Buy");
      await user.click(buyButton);

      // Verify order was submitted with correct data
      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith("/api/orders", {
          name: "AAPL",
          qty: 10,
          price: 150.0,
          mode: "BUY",
        });
      });

      // Verify success message
      await waitFor(() => {
        expect(
          screen.getByText(/Order placed successfully!/i)
        ).toBeInTheDocument();
      });
    });

    test("prevents buy order with insufficient validation", async () => {
      const user = userEvent.setup();

      apiClient.get.mockResolvedValue({
        data: {
          success: true,
          data: { price: 150.0 },
        },
      });

      const { container } = renderBuyWindow("AAPL");

      await waitFor(() => {
        expect(screen.getByText("Buy")).toBeInTheDocument();
      });

      // Try to submit with zero quantity
      const inputs = within(container).getAllByRole("spinbutton");
      const qtyInput = inputs[0]; // First input is qty
      await user.clear(qtyInput);
      await user.type(qtyInput, "0");

      const buyButton = screen.getByText("Buy");
      await user.click(buyButton);

      // Should show validation error
      await waitFor(() => {
        expect(
          screen.getByText(/Please enter a valid quantity/i)
        ).toBeInTheDocument();
      });

      // Order should not be submitted
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    test("handles buy order API failure", async () => {
      const user = userEvent.setup();

      apiClient.get.mockResolvedValue({
        data: {
          success: true,
          data: { price: 150.0 },
        },
      });

      apiClient.post.mockRejectedValue({
        response: {
          data: { message: "Insufficient wallet balance" },
        },
      });

      renderBuyWindow("AAPL");

      await waitFor(() => {
        expect(screen.getByText("Buy")).toBeInTheDocument();
      });

      const buyButton = screen.getByText("Buy");
      await user.click(buyButton);

      await waitFor(() => {
        expect(
          screen.getByText("Insufficient wallet balance")
        ).toBeInTheDocument();
      });

      // Window should not close on error
      expect(mockCloseTradeWindow).not.toHaveBeenCalled();
    });
  });

  describe("Sell Order Flow", () => {
    test("completes full sell order flow", async () => {
      const user = userEvent.setup();

      // Mock holdings check
      apiClient.get.mockImplementation((url) => {
        if (url.includes("/api/holdings/")) {
          return Promise.resolve({
            data: {
              success: true,
              holding: { qty: 50 },
            },
          });
        }
        // Price fetch
        return Promise.resolve({
          data: {
            success: true,
            data: { price: 200.0 },
          },
        });
      });

      // Mock order submission
      apiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: "Sell order placed successfully",
        },
      });

      const { container } = renderSellWindow("GOOGL");

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText("Available: 50 shares")).toBeInTheDocument();
      });

      // Enter quantity to sell
      const inputs = within(container).getAllByRole("spinbutton");
      const qtyInput = inputs[0]; // First input is qty
      await user.clear(qtyInput);
      await user.type(qtyInput, "10");

      // Verify total revenue is calculated
      await waitFor(() => {
        expect(
          screen.getByText((content, element) => {
            return (
              element.tagName === "SPAN" &&
              element.textContent.includes("Total Revenue:") &&
              element.textContent.includes("$2000.00")
            );
          })
        ).toBeInTheDocument();
      });

      // Click sell button
      const sellButton = screen.getByText("Sell");
      await user.click(sellButton);

      // Verify order was submitted
      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith("/api/orders", {
          name: "GOOGL",
          qty: 10,
          price: 200.0,
          mode: "SELL",
        });
      });

      // Verify success message
      await waitFor(() => {
        expect(
          screen.getByText(/Order placed successfully!/i)
        ).toBeInTheDocument();
      });
    });

    test("prevents selling more shares than available", async () => {
      const user = userEvent.setup();

      apiClient.get.mockImplementation((url) => {
        if (url.includes("/api/holdings/")) {
          return Promise.resolve({
            data: {
              success: true,
              holding: { qty: 5 },
            },
          });
        }
        return Promise.resolve({
          data: {
            success: true,
            data: { price: 200.0 },
          },
        });
      });

      const { container } = renderSellWindow("GOOGL");

      await waitFor(() => {
        expect(screen.getByText("Available: 5 shares")).toBeInTheDocument();
      });

      // Try to sell more than available
      const inputs = within(container).getAllByRole("spinbutton");
      const qtyInput = inputs[0]; // First input is qty
      await user.clear(qtyInput);
      await user.type(qtyInput, "10");

      const sellButton = screen.getByText("Sell");
      await user.click(sellButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Only 5 shares available/i)
        ).toBeInTheDocument();
      });

      expect(apiClient.post).not.toHaveBeenCalled();
    });

    test("prevents selling when no shares are owned", async () => {
      apiClient.get.mockImplementation((url) => {
        if (url.includes("/api/holdings/")) {
          return Promise.resolve({
            data: {
              success: true,
              holding: { qty: 0 },
            },
          });
        }
        return Promise.resolve({
          data: {
            success: true,
            data: { price: 200.0 },
          },
        });
      });

      renderSellWindow("MSFT");

      await waitFor(() => {
        expect(
          screen.getByText(/No shares available to sell/i)
        ).toBeInTheDocument();
      });

      // Sell button should be disabled
      const sellButton = screen.getByText("Sell");
      expect(sellButton).toBeDisabled();
    });

    test("handles 404 when stock not in holdings", async () => {
      apiClient.get.mockImplementation((url) => {
        if (url.includes("/api/holdings/")) {
          return Promise.reject({
            response: { status: 404 },
          });
        }
        return Promise.resolve({
          data: {
            success: true,
            data: { price: 200.0 },
          },
        });
      });

      renderSellWindow("NVDA");

      await waitFor(() => {
        expect(
          screen.getByText(/You don't own any shares of this stock./i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Price Updates", () => {
    test("buy window updates when user changes price", async () => {
      const user = userEvent.setup();

      apiClient.get.mockResolvedValue({
        data: {
          success: true,
          data: { price: 100.0 },
        },
      });

      const { container } = renderBuyWindow("TSLA");

      await waitFor(() => {
        const prices = screen.getAllByText("$100.00");
        expect(prices.length).toBeGreaterThan(0);
      });

      // Change price
      const inputs = within(container).getAllByRole("spinbutton");
      const priceInput = inputs[1]; // Second input is price
      await user.clear(priceInput);
      await user.type(priceInput, "110.50");

      const qtyInput = inputs[0]; // First input is qty
      await user.clear(qtyInput);
      await user.type(qtyInput, "5");

      // Total should update: 5 * 110.50 = 552.50
      await waitFor(() => {
        expect(
          screen.getByText((content, element) => {
            return (
              element.tagName === "SPAN" &&
              element.textContent.includes("Total Cost:") &&
              element.textContent.includes("$552.50")
            );
          })
        ).toBeInTheDocument();
      });
    });

    test("sell window updates when user changes price", async () => {
      const user = userEvent.setup();

      apiClient.get.mockImplementation((url) => {
        if (url.includes("/api/holdings/")) {
          return Promise.resolve({
            data: {
              success: true,
              holding: { qty: 20 },
            },
          });
        }
        return Promise.resolve({
          data: {
            success: true,
            data: { price: 150.0 },
          },
        });
      });

      const { container } = renderSellWindow("AMD");

      await waitFor(() => {
        const prices = screen.getAllByText("$150.00");
        expect(prices.length).toBeGreaterThan(0);
      });

      // Change price
      const inputs = within(container).getAllByRole("spinbutton");
      const priceInput = inputs[1]; // Second input is price
      await user.clear(priceInput);
      await user.type(priceInput, "155.25");

      const qtyInput = inputs[0]; // First input is qty
      await user.clear(qtyInput);
      await user.type(qtyInput, "8");

      // Total should update: 8 * 155.25 = 1242.00
      await waitFor(() => {
        expect(
          screen.getByText((content, element) => {
            return (
              element.tagName === "SPAN" &&
              element.textContent.includes("Total Revenue:") &&
              element.textContent.includes("$1242.00")
            );
          })
        ).toBeInTheDocument();
      });
    });
  });

  describe("Cancel Actions", () => {
    test("cancel button closes buy window", async () => {
      const user = userEvent.setup();

      apiClient.get.mockResolvedValue({
        data: {
          success: true,
          data: { price: 150.0 },
        },
      });

      renderBuyWindow("AAPL");

      await waitFor(() => {
        expect(screen.getByText("Cancel")).toBeInTheDocument();
      });

      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      expect(mockCloseTradeWindow).toHaveBeenCalled();
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    test("cancel button closes sell window", async () => {
      const user = userEvent.setup();

      apiClient.get.mockImplementation((url) => {
        if (url.includes("/api/holdings/")) {
          return Promise.resolve({
            data: {
              success: true,
              holding: { qty: 10 },
            },
          });
        }
        return Promise.resolve({
          data: {
            success: true,
            data: { price: 200.0 },
          },
        });
      });

      renderSellWindow("GOOGL");

      await waitFor(() => {
        expect(screen.getByText("Cancel")).toBeInTheDocument();
      });

      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      expect(mockCloseTradeWindow).toHaveBeenCalled();
      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });

  describe("Loading States", () => {
    test("disables buy button during price loading", () => {
      apiClient.get.mockImplementation(() => new Promise(() => {}));

      renderBuyWindow("AAPL");

      const buyButton = screen.getByRole("button", { name: /Loading/i });
      expect(buyButton).toBeDisabled();
    });

    test("disables sell button during data loading", () => {
      apiClient.get.mockImplementation(() => new Promise(() => {}));

      renderSellWindow("GOOGL");

      const sellButton = screen.getByRole("button", { name: /Loading/i });
      expect(sellButton).toBeDisabled();
    });

    test("shows submitting state during buy order", async () => {
      const user = userEvent.setup();

      apiClient.get.mockResolvedValue({
        data: {
          success: true,
          data: { price: 150.0 },
        },
      });

      apiClient.post.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { success: true } }), 200)
          )
      );

      renderBuyWindow("AAPL");

      await waitFor(() => {
        expect(screen.getByText("Buy")).toBeInTheDocument();
      });

      const buyButton = screen.getByText("Buy");
      await user.click(buyButton);

      await waitFor(() => {
        expect(screen.getByText("Placing Order...")).toBeInTheDocument();
      });
    });

    test("shows submitting state during sell order", async () => {
      const user = userEvent.setup();

      apiClient.get.mockImplementation((url) => {
        if (url.includes("/api/holdings/")) {
          return Promise.resolve({
            data: {
              success: true,
              holding: { qty: 10 },
            },
          });
        }
        return Promise.resolve({
          data: {
            success: true,
            data: { price: 200.0 },
          },
        });
      });

      apiClient.post.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { success: true } }), 200)
          )
      );

      renderSellWindow("GOOGL");

      await waitFor(() => {
        expect(screen.getByText("Sell")).toBeInTheDocument();
      });

      const sellButton = screen.getByText("Sell");
      await user.click(sellButton);

      await waitFor(() => {
        expect(screen.getByText("Placing Order...")).toBeInTheDocument();
      });
    });
  });
});
