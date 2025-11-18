import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import BuyActionWindow from "../components/BuyActionWindow";
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
  },
}));

describe("BuyActionWindow Component", () => {
  const mockCloseTradeWindow = jest.fn();

  const renderWithContext = (uid) => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    delete window.location;
    window.location = { reload: jest.fn() };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders BuyActionWindow with loading state", () => {
    apiClient.get.mockImplementation(() => new Promise(() => {}));

    renderWithContext("AAPL");

    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.getAllByText(/Loading.../i).length).toBeGreaterThan(0);
  });

  test("fetches and displays current market price", async () => {
    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: { price: 155.75 },
      },
    });

    renderWithContext("AAPL");

    await waitFor(() => {
      expect(screen.getAllByText("$155.75")[0]).toBeInTheDocument();
    });

    expect(screen.getByText(/Current Market Price:/i)).toBeInTheDocument();
  });

  test("validates quantity input - minimum value", async () => {
    const user = userEvent.setup();

    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: { price: 150.0 },
      },
    });

    renderWithContext("AAPL");

    await waitFor(() => {
      expect(screen.getByText("Buy")).toBeInTheDocument();
    });

    const qtyInput = screen.getAllByRole("spinbutton")[0];
    await user.clear(qtyInput);
    await user.type(qtyInput, "0");

    const buyButton = screen.getByText("Buy");
    await user.click(buyButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Please enter a valid quantity \(minimum 1\)./i)
      ).toBeInTheDocument();
    });

    expect(apiClient.post).not.toHaveBeenCalled();
  });

  test("validates price input - positive value required", async () => {
    const user = userEvent.setup();

    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: { price: 150.0 },
      },
    });

    renderWithContext("AAPL");

    await waitFor(() => {
      expect(screen.getByText("Buy")).toBeInTheDocument();
    });

    const priceInput = screen.getAllByRole("spinbutton")[1];
    await user.clear(priceInput);
    await user.type(priceInput, "0");

    const buyButton = screen.getByText("Buy");
    await user.click(buyButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Please enter a valid price./i)
      ).toBeInTheDocument();
    });

    expect(apiClient.post).not.toHaveBeenCalled();
  });

  test("calculates total cost correctly", async () => {
    const user = userEvent.setup();

    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: { price: 100.0 },
      },
    });

    renderWithContext("TSLA");

    await waitFor(() => {
      expect(screen.getByText("Buy")).toBeInTheDocument();
    });

    const qtyInput = screen.getAllByRole("spinbutton")[0];
    await user.clear(qtyInput);
    await user.type(qtyInput, "10");

    const priceInput = screen.getAllByRole("spinbutton")[1];
    await user.clear(priceInput);
    await user.type(priceInput, "150.50");

    // Total should be 10 * 150.50 = 1505.00
    await waitFor(() => {
      expect(
        screen.getByText((content, element) => {
          return (
            element.tagName === "SPAN" &&
            element.textContent.includes("Total Cost:") &&
            element.textContent.includes("$1505.00")
          );
        })
      ).toBeInTheDocument();
    });
  });

  test("submits buy order successfully", async () => {
    const user = userEvent.setup();

    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: { price: 200.0 },
      },
    });

    apiClient.post.mockResolvedValue({
      data: {
        success: true,
        message: "Order placed successfully",
      },
    });

    renderWithContext("GOOGL");

    await waitFor(() => {
      expect(screen.getByText("Buy")).toBeInTheDocument();
    });

    const qtyInput = screen.getAllByRole("spinbutton")[0];
    await user.clear(qtyInput);
    await user.type(qtyInput, "5");

    const buyButton = screen.getByText("Buy");
    await user.click(buyButton);

    await waitFor(() => {
      expect(screen.getByText("Placing Order...")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith("/api/orders", {
        name: "GOOGL",
        qty: 5,
        price: 200.0,
        mode: "BUY",
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Order placed successfully!/i)
      ).toBeInTheDocument();
    });
  });

  test("handles API error when placing order", async () => {
    const user = userEvent.setup();

    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: { price: 150.0 },
      },
    });

    apiClient.post.mockRejectedValue({
      response: {
        data: { message: "Insufficient balance" },
      },
    });

    renderWithContext("AAPL");

    await waitFor(() => {
      expect(screen.getByText("Buy")).toBeInTheDocument();
    });

    const buyButton = screen.getByText("Buy");
    await user.click(buyButton);

    await waitFor(() => {
      expect(screen.getByText("Insufficient balance")).toBeInTheDocument();
    });

    expect(mockCloseTradeWindow).not.toHaveBeenCalled();
  });

  test("cancel button closes the window", async () => {
    const user = userEvent.setup();

    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: { price: 150.0 },
      },
    });

    renderWithContext("AAPL");

    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    expect(mockCloseTradeWindow).toHaveBeenCalled();
  });

  test("disables inputs and buttons during order submission", async () => {
    const user = userEvent.setup();

    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: { price: 150.0 },
      },
    });

    // Make post delay to keep button in submitting state
    apiClient.post.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: { success: true } }), 100)
        )
    );

    renderWithContext("AAPL");

    await waitFor(() => {
      expect(screen.getByText("Buy")).toBeInTheDocument();
    });

    const buyButton = screen.getByText("Buy");
    await user.click(buyButton);

    await waitFor(() => {
      expect(screen.getByText("Placing Order...")).toBeInTheDocument();
    });

    const qtyInput = screen.getAllByRole("spinbutton")[0];
    expect(qtyInput).toBeDisabled();

    const priceInput = screen.getAllByRole("spinbutton")[1];
    expect(priceInput).toBeDisabled();
  });

  test("handles price fetch error gracefully", async () => {
    apiClient.get.mockRejectedValue(new Error("Network error"));

    renderWithContext("AAPL");

    await waitFor(() => {
      expect(
        screen.getByText(/Unable to fetch current price. Please try again./i)
      ).toBeInTheDocument();
    });
  });

  test("updates total cost when quantity changes", async () => {
    const user = userEvent.setup();

    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: { price: 50.0 },
      },
    });

    renderWithContext("AMD");

    await waitFor(() => {
      expect(screen.getByText("Buy")).toBeInTheDocument();
    });

    // Initial: 1 * 50 = 50
    expect(
      screen.getByText((content, element) => {
        return (
          element.tagName === "SPAN" &&
          element.textContent.includes("Total Cost:") &&
          element.textContent.includes("$50.00")
        );
      })
    ).toBeInTheDocument();

    const qtyInput = screen.getAllByRole("spinbutton")[0];
    await user.clear(qtyInput);
    await user.type(qtyInput, "20");

    // Updated: 20 * 50 = 1000
    await waitFor(() => {
      expect(
        screen.getByText((content, element) => {
          return (
            element.tagName === "SPAN" &&
            element.textContent.includes("Total Cost:") &&
            element.textContent.includes("$1000.00")
          );
        })
      ).toBeInTheDocument();
    });
  });

  test("updates total cost when price changes", async () => {
    const user = userEvent.setup();

    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: { price: 100.0 },
      },
    });

    renderWithContext("NVDA");

    await waitFor(() => {
      expect(screen.getByText("Buy")).toBeInTheDocument();
    });

    const priceInput = screen.getAllByRole("spinbutton")[1];
    await user.clear(priceInput);
    await user.type(priceInput, "250.75");

    // 1 * 250.75 = 250.75
    await waitFor(() => {
      expect(
        screen.getByText((content, element) => {
          return (
            element.tagName === "SPAN" &&
            element.textContent.includes("Total Cost:") &&
            element.textContent.includes("$250.75")
          );
        })
      ).toBeInTheDocument();
    });
  });

  test("allows decimal quantities for fractional shares", async () => {
    const user = userEvent.setup();

    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: { price: 1000.0 },
      },
    });

    apiClient.post.mockResolvedValue({
      data: { success: true },
    });

    renderWithContext("BRK.A");

    await waitFor(() => {
      expect(screen.getByText("Buy")).toBeInTheDocument();
    });

    const qtyInput = screen.getAllByRole("spinbutton")[0];
    await user.clear(qtyInput);
    await user.type(qtyInput, "2.5");

    await waitFor(() => {
      expect(
        screen.getByText((content, element) => {
          return (
            element.tagName === "SPAN" &&
            element.textContent.includes("Total Cost:") &&
            element.textContent.includes("$2500.00")
          );
        })
      ).toBeInTheDocument();
    });

    const buyButton = screen.getByText("Buy");
    await user.click(buyButton);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith("/api/orders", {
        name: "BRK.A",
        qty: 2.5,
        price: 1000.0,
        mode: "BUY",
      });
    });
  });

  test("displays stock symbol prominently", async () => {
    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: { price: 150.0 },
      },
    });

    renderWithContext("TSLA");

    await waitFor(() => {
      expect(screen.getByText("TSLA")).toBeInTheDocument();
    });
  });

  test("window reloads after successful order", async () => {
    const user = userEvent.setup();

    apiClient.get.mockResolvedValue({
      data: {
        success: true,
        data: { price: 150.0 },
      },
    });

    apiClient.post.mockResolvedValue({
      data: { success: true },
    });

    renderWithContext("AAPL");

    await waitFor(() => {
      expect(screen.getByText("Buy")).toBeInTheDocument();
    });

    const buyButton = screen.getByText("Buy");
    await user.click(buyButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Order placed successfully!/i)
      ).toBeInTheDocument();
    });

    // Wait for the reload to be scheduled
    await new Promise((resolve) => setTimeout(resolve, 1100));

    expect(mockCloseTradeWindow).toHaveBeenCalled();
  });
});
