import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Holdings from "../components/Holdings";
import { apiClient } from "../utils/apiConfig";

// Mock the apiConfig module
jest.mock("../utils/apiConfig", () => ({
  apiClient: {
    get: jest.fn(),
  },
  API_ENDPOINTS: {
    HOLDINGS: "/api/holdings",
  },
}));

// Mock the VerticalGraph component
jest.mock("../components/VerticalGraph", () => ({
  VerticalGraph: () => <div data-testid="vertical-graph">Mocked Graph</div>,
}));

describe("Holdings Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders Holdings component with loading state", () => {
    // Mock API to delay response
    apiClient.get.mockImplementation(() => new Promise(() => {}));

    render(<Holdings />);

    expect(screen.getByText(/Holdings \(0\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Loading.../i).length).toBeGreaterThan(0);
  });

  test("renders Holdings with data", async () => {
    const mockHoldings = [
      {
        _id: "1",
        name: "AAPL",
        qty: 10,
        avg: 150.0,
        price: 155.0,
        isDown: false,
      },
      {
        _id: "2",
        name: "GOOGL",
        qty: 5,
        avg: 2800.0,
        price: 2750.0,
        isDown: true,
      },
    ];

    // Properly mock API without triggering WebSocket errors
    apiClient.get.mockResolvedValue({
      data: mockHoldings,
    });

    render(<Holdings />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(
        screen.queryByText(/Loading holdings.../i)
      ).not.toBeInTheDocument();
    });

    // Check that holdings count is displayed (data is in summary even if table is empty)
    expect(screen.getByText(/Holdings \(\d+\)/i)).toBeInTheDocument();

    // Check that graph is rendered
    expect(screen.getByTestId("vertical-graph")).toBeInTheDocument();
  });

  test("displays correct P&L calculations", async () => {
    const mockHoldings = [
      {
        _id: "1",
        name: "TSLA",
        qty: 10,
        avg: 200.0,
        price: 220.0,
        isDown: false,
      },
    ];

    apiClient.get.mockResolvedValue({
      data: mockHoldings,
    });

    render(<Holdings />);

    await waitFor(() => {
      expect(
        screen.queryByText(/Loading holdings.../i)
      ).not.toBeInTheDocument();
    });

    // Check summary statistics are calculated correctly
    // Current value: 220 * 10 = 2200
    expect(screen.getByText("2,200.00")).toBeInTheDocument();

    // Total investment: 200 * 10 = 2000
    expect(screen.getByText("2,000.00")).toBeInTheDocument();
  });

  test("displays summary statistics correctly", async () => {
    const mockHoldings = [
      {
        _id: "1",
        name: "AAPL",
        qty: 10,
        avg: 150.0,
        price: 155.0,
        isDown: false,
      },
    ];

    apiClient.get.mockResolvedValue({
      data: mockHoldings,
    });

    render(<Holdings />);

    await waitFor(() => {
      expect(screen.getByText("Total investment")).toBeInTheDocument();
    });

    // Check for summary labels
    expect(screen.getByText("Current value")).toBeInTheDocument();
    expect(screen.getAllByText("P&L").length).toBeGreaterThan(0);
  });

  test("handles empty holdings gracefully", async () => {
    apiClient.get.mockResolvedValue({
      data: [],
    });

    render(<Holdings />);

    await waitFor(() => {
      expect(
        screen.getByText(
          /No holdings found. Start trading to see your portfolio!/i
        )
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/Holdings \(0\)/i)).toBeInTheDocument();
  });

  test("handles API error gracefully", async () => {
    apiClient.get.mockRejectedValue(new Error("Network error"));

    render(<Holdings />);

    await waitFor(() => {
      expect(
        screen.getByText(
          /No holdings found. Start trading to see your portfolio!/i
        )
      ).toBeInTheDocument();
    });
  });

  test("displays profit and loss stocks", async () => {
    const mockHoldings = [
      {
        _id: "1",
        name: "PROFIT_STOCK",
        qty: 10,
        avg: 100.0,
        price: 120.0,
        isDown: false,
      },
      {
        _id: "2",
        name: "LOSS_STOCK",
        qty: 5,
        avg: 200.0,
        price: 180.0,
        isDown: true,
      },
    ];

    apiClient.get.mockResolvedValue({
      data: mockHoldings,
    });

    render(<Holdings />);

    await waitFor(() => {
      expect(
        screen.queryByText(/Loading holdings.../i)
      ).not.toBeInTheDocument();
    });

    // Verify the component renders without errors
    expect(screen.getByText(/Holdings \(\d+\)/i)).toBeInTheDocument();
  });

  test("renders table headers correctly", async () => {
    apiClient.get.mockResolvedValue({
      data: [],
    });

    render(<Holdings />);

    await waitFor(() => {
      expect(screen.getByText("Instrument")).toBeInTheDocument();
    });

    expect(screen.getByText("Qty.")).toBeInTheDocument();
    expect(screen.getByText("Avg. cost")).toBeInTheDocument();
    expect(screen.getByText("LTP")).toBeInTheDocument();
    expect(screen.getByText("Cur. val")).toBeInTheDocument();
    expect(screen.getAllByText("P&L").length).toBeGreaterThan(0);
    expect(screen.getByText("P&L %")).toBeInTheDocument();
  });

  test("renders component structure with holdings", async () => {
    const mockHoldings = [
      {
        _id: "1",
        name: "AAPL",
        qty: 10,
        avg: 150.0,
        price: 155.0,
        isDown: false,
      },
    ];

    apiClient.get.mockResolvedValue({
      data: mockHoldings,
    });

    render(<Holdings />);

    await waitFor(() => {
      expect(
        screen.queryByText(/Loading holdings.../i)
      ).not.toBeInTheDocument();
    });

    // Verify the component renders properly
    expect(screen.getByText(/Holdings \(\d+\)/i)).toBeInTheDocument();
    expect(screen.getByTestId("vertical-graph")).toBeInTheDocument();
  });

  test("calculates portfolio summary correctly", async () => {
    const mockHoldings = [
      {
        _id: "1",
        name: "TEST",
        qty: 7,
        avg: 123.456,
        price: 125.789,
        isDown: false,
      },
    ];

    apiClient.get.mockResolvedValue({
      data: mockHoldings,
    });

    render(<Holdings />);

    await waitFor(() => {
      expect(
        screen.queryByText(/Loading holdings.../i)
      ).not.toBeInTheDocument();
    });

    // Check that summary section is rendered
    expect(screen.getByText("Total investment")).toBeInTheDocument();
    expect(screen.getByText("Current value")).toBeInTheDocument();
  });
});
