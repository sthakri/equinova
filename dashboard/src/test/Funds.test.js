import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Funds from "../components/Funds";
import { apiClient } from "../utils/apiConfig";

// Use manual mock for react-router-dom
jest.mock("react-router-dom");

// Mock the apiConfig module
jest.mock("../utils/apiConfig", () => ({
  apiClient: {
    get: jest.fn(),
  },
  API_ENDPOINTS: {
    WALLET: {
      BALANCE: "/api/wallet/balance",
      TRANSACTIONS: "/api/wallet/transactions",
    },
  },
}));

describe("Funds Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders Funds component with loading state", () => {
    // Mock API to delay response
    apiClient.get.mockImplementation(() => new Promise(() => {}));

    render(<Funds />);

    expect(
      screen.getByText("Manage your virtual trading funds")
    ).toBeInTheDocument();
    expect(screen.getByText("Available balance")).toBeInTheDocument();
  });

  test("displays wallet balance correctly", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.includes("balance")) {
        return Promise.resolve({ data: { balance: 75000.5 } });
      }
      if (url.includes("transactions")) {
        return Promise.resolve({ data: { transactions: [] } });
      }
    });

    render(<Funds />);

    await waitFor(() => {
      const balanceElements = screen.getAllByText("$75,000.50");
      expect(balanceElements.length).toBeGreaterThan(0);
    });

    expect(screen.getByText("Available balance")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("Virtual Trading")).toBeInTheDocument();
  });

  test("displays transaction history", async () => {
    const mockTransactions = [
      {
        _id: "1",
        type: "BUY",
        symbol: "AAPL",
        quantity: 10,
        price: 150.0,
        amount: 1500.0,
        balanceAfter: 98500.0,
        timestamp: new Date("2024-01-15T10:30:00").toISOString(),
      },
      {
        _id: "2",
        type: "SELL",
        symbol: "GOOGL",
        quantity: 5,
        price: 2800.0,
        amount: 14000.0,
        balanceAfter: 112500.0,
        timestamp: new Date("2024-01-16T14:45:00").toISOString(),
      },
    ];

    apiClient.get.mockImplementation((url) => {
      if (url.includes("balance")) {
        return Promise.resolve({ data: { balance: 112500.0 } });
      }
      if (url.includes("transactions")) {
        return Promise.resolve({ data: { transactions: mockTransactions } });
      }
    });

    render(<Funds />);

    await waitFor(() => {
      expect(screen.getByText("AAPL")).toBeInTheDocument();
    });

    expect(screen.getByText("GOOGL")).toBeInTheDocument();
    expect(screen.getByText(/Transaction History \(2\)/i)).toBeInTheDocument();

    // Check transaction types
    const buyElements = screen.getAllByText("BUY");
    expect(buyElements.length).toBeGreaterThan(0);

    const sellElements = screen.getAllByText("SELL");
    expect(sellElements.length).toBeGreaterThan(0);
  });

  test("displays empty transaction history message", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.includes("balance")) {
        return Promise.resolve({ data: { balance: 100000.0 } });
      }
      if (url.includes("transactions")) {
        return Promise.resolve({ data: { transactions: [] } });
      }
    });

    render(<Funds />);

    await waitFor(() => {
      expect(
        screen.getByText(
          /No transactions yet. Start trading to see your transaction history!/i
        )
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/Transaction History \(0\)/i)).toBeInTheDocument();
  });

  test("refresh button works correctly", async () => {
    const user = userEvent.setup();

    apiClient.get.mockImplementation((url) => {
      if (url.includes("balance")) {
        return Promise.resolve({ data: { balance: 50000.0 } });
      }
      if (url.includes("transactions")) {
        return Promise.resolve({ data: { transactions: [] } });
      }
    });

    render(<Funds />);

    await waitFor(() => {
      const balanceElements = screen.getAllByText("$50,000.00");
      expect(balanceElements.length).toBeGreaterThan(0);
    });

    // Clear mock calls
    apiClient.get.mockClear();

    // Update mock to return new balance
    apiClient.get.mockImplementation((url) => {
      if (url.includes("balance")) {
        return Promise.resolve({ data: { balance: 60000.0 } });
      }
      if (url.includes("transactions")) {
        return Promise.resolve({ data: { transactions: [] } });
      }
    });

    // Click refresh button
    const refreshButton = screen.getByText("Refresh");
    await user.click(refreshButton);

    // Wait for updated balance (skip checking intermediate "Refreshing..." state as it's too fast)
    await waitFor(() => {
      const balanceElements = screen.getAllByText("$60,000.00");
      expect(balanceElements.length).toBeGreaterThan(0);
    });

    // Verify API was called again
    expect(apiClient.get).toHaveBeenCalled();
  });

  test("handles API errors gracefully", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    apiClient.get.mockRejectedValue(new Error("Network error"));

    render(<Funds />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  test("formats transaction amounts correctly", async () => {
    const mockTransactions = [
      {
        _id: "1",
        type: "BUY",
        symbol: "TSLA",
        quantity: 15,
        price: 220.5,
        amount: 3307.5,
        balanceAfter: 96692.5,
        timestamp: new Date("2024-01-17T09:00:00").toISOString(),
      },
    ];

    apiClient.get.mockImplementation((url) => {
      if (url.includes("balance")) {
        return Promise.resolve({ data: { balance: 96692.5 } });
      }
      if (url.includes("transactions")) {
        return Promise.resolve({ data: { transactions: mockTransactions } });
      }
    });

    render(<Funds />);

    await waitFor(() => {
      expect(screen.getByText("TSLA")).toBeInTheDocument();
    });

    // Check formatted amounts
    expect(screen.getByText("$220.50")).toBeInTheDocument();
    expect(screen.getByText("-$3,307.50")).toBeInTheDocument();
    const balanceAfterElements = screen.getAllByText("$96,692.50");
    expect(balanceAfterElements.length).toBeGreaterThan(0);
  });

  test("displays transaction table headers", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.includes("balance")) {
        return Promise.resolve({ data: { balance: 100000.0 } });
      }
      if (url.includes("transactions")) {
        return Promise.resolve({ data: { transactions: [] } });
      }
    });

    render(<Funds />);

    await waitFor(() => {
      expect(screen.getByText("Available balance")).toBeInTheDocument();
    });

    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("Symbol")).toBeInTheDocument();
    expect(screen.getByText("Qty")).toBeInTheDocument();
    expect(screen.getByText("Price")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Balance After")).toBeInTheDocument();
  });

  test("displays current balance in info section", async () => {
    apiClient.get.mockImplementation((url) => {
      if (url.includes("balance")) {
        return Promise.resolve({ data: { balance: 87654.32 } });
      }
      if (url.includes("transactions")) {
        return Promise.resolve({ data: { transactions: [] } });
      }
    });

    render(<Funds />);

    await waitFor(() => {
      const balanceElements = screen.getAllByText("$87,654.32");
      expect(balanceElements.length).toBeGreaterThan(0);
    });

    expect(
      screen.getByText("Start with $100,000 virtual money")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Practice trading without any risk!")
    ).toBeInTheDocument();
  });

  test("shows BUY transactions with negative amount", async () => {
    const mockTransactions = [
      {
        _id: "1",
        type: "BUY",
        symbol: "MSFT",
        quantity: 20,
        price: 300.0,
        amount: 6000.0,
        balanceAfter: 94000.0,
        timestamp: new Date().toISOString(),
      },
    ];

    apiClient.get.mockImplementation((url) => {
      if (url.includes("balance")) {
        return Promise.resolve({ data: { balance: 94000.0 } });
      }
      if (url.includes("transactions")) {
        return Promise.resolve({ data: { transactions: mockTransactions } });
      }
    });

    render(<Funds />);

    await waitFor(() => {
      expect(screen.getByText("MSFT")).toBeInTheDocument();
    });

    // BUY should show negative amount
    expect(screen.getByText("-$6,000.00")).toBeInTheDocument();
  });

  test("shows SELL transactions with positive amount", async () => {
    const mockTransactions = [
      {
        _id: "1",
        type: "SELL",
        symbol: "AMZN",
        quantity: 10,
        price: 3500.0,
        amount: 35000.0,
        balanceAfter: 135000.0,
        timestamp: new Date().toISOString(),
      },
    ];

    apiClient.get.mockImplementation((url) => {
      if (url.includes("balance")) {
        return Promise.resolve({ data: { balance: 135000.0 } });
      }
      if (url.includes("transactions")) {
        return Promise.resolve({ data: { transactions: mockTransactions } });
      }
    });

    render(<Funds />);

    await waitFor(() => {
      expect(screen.getByText("AMZN")).toBeInTheDocument();
    });

    // SELL should show positive amount
    expect(screen.getByText("+$35,000.00")).toBeInTheDocument();
  });
});
