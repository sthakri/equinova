#!/usr/bin/env node

/**
 * Backend Smoke Test Script
 *
 * This script performs end-to-end testing of the trading platform backend:
 * 1. Connects to test database
 * 2. Registers a new test user
 * 3. Authenticates the user
 * 4. Places a buy order
 * 5. Verifies order appears in history
 * 6. Checks holdings are updated
 * 7. Verifies wallet balance is deducted
 * 8. Places a sell order
 * 9. Cleans up test data
 *
 * Usage: node scripts/smokeTest.js
 */

require("dotenv").config();
const axios = require("axios");
const mongoose = require("mongoose");
const { spawn } = require("child_process");
const path = require("path");

// Configuration
const BASE_URL = process.env.SMOKE_TEST_URL || "http://localhost:3002";
const MONGO_URL = process.env.SMOKE_TEST_MONGO_URL || process.env.MONGO_URL;
const TEST_USER_EMAIL = `smoketest-${Date.now()}@test.com`;
const TEST_USER_PASSWORD = "TestPass123!";
const INITIAL_BALANCE = 100000; // Expected initial wallet balance

// Test state
let serverProcess = null;
let testUserId = null;
let authCookie = null;
let testOrderId = null;

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(
    `\n${colors.bright}[${step}]${colors.reset} ${colors.cyan}${message}${colors.reset}`
  );
}

function logSuccess(message) {
  log(`  ✓ ${message}`, colors.green);
}

function logError(message) {
  log(`  ✗ ${message}`, colors.red);
}

function logWarning(message) {
  log(`  ⚠ ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`  ℹ ${message}`, colors.blue);
}

// Axios instance with cookie jar support
const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  validateStatus: () => true, // Don't throw on any status
});

// Add request interceptor to include auth cookie
apiClient.interceptors.request.use((config) => {
  if (authCookie) {
    config.headers.Cookie = authCookie;
  }
  return config;
});

// Add response interceptor to capture cookies
apiClient.interceptors.response.use((response) => {
  const setCookie = response.headers["set-cookie"];
  if (setCookie && !authCookie) {
    authCookie = setCookie[0].split(";")[0];
  }
  return response;
});

/**
 * Wait for server to be ready
 */
async function waitForServer(maxAttempts = 30, delayMs = 1000) {
  logStep("SERVER", "Waiting for server to be ready...");

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await axios.get(`${BASE_URL}/api/market/symbols`, {
        timeout: 2000,
      });
      if (response.status === 200) {
        logSuccess(`Server is ready (attempt ${i + 1}/${maxAttempts})`);
        return true;
      }
    } catch (error) {
      // Server not ready yet
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error("Server failed to start within timeout period");
}

/**
 * Start backend server in test mode
 */
async function startServer() {
  logStep("SERVER", "Starting backend server...");

  // Check if server is already running
  try {
    const response = await axios.get(`${BASE_URL}/api/market/symbols`, {
      timeout: 2000,
    });
    if (response.status === 200) {
      logWarning("Server already running, using existing instance");
      return null;
    }
  } catch (error) {
    // Server not running, we'll start it
  }

  const serverPath = path.join(__dirname, "..", "index.js");

  serverProcess = spawn("node", [serverPath], {
    env: {
      ...process.env,
      NODE_ENV: "test",
      PORT: "3002",
    },
    stdio: "pipe",
  });

  serverProcess.stdout.on("data", (data) => {
    const message = data.toString().trim();
    if (message.includes("Server running")) {
      logInfo(`Server: ${message}`);
    }
  });

  serverProcess.stderr.on("data", (data) => {
    const message = data.toString().trim();
    if (!message.includes("DeprecationWarning")) {
      logWarning(`Server stderr: ${message}`);
    }
  });

  serverProcess.on("error", (error) => {
    logError(`Server process error: ${error.message}`);
  });

  // Wait for server to be ready
  await waitForServer();

  logSuccess("Backend server started successfully");
  return serverProcess;
}

/**
 * Register a new test user
 */
async function registerUser() {
  logStep("AUTH", "Registering test user...");

  const response = await apiClient.post("/api/auth/signup", {
    fullName: "Smoke Test User",
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  });

  if (response.status !== 201 && response.status !== 200) {
    throw new Error(
      `Registration failed: ${response.status} - ${JSON.stringify(
        response.data
      )}`
    );
  }

  logSuccess(`User registered: ${TEST_USER_EMAIL}`);
  const userId = response.data?.user?.id || response.data?.userId;
  if (userId) {
    testUserId = userId;
    logInfo(`User ID: ${userId}`);
  } else {
    logWarning("User ID not returned in signup response");
  }
  return response.data;
}

/**
 * Login with test user
 */
async function loginUser() {
  logStep("AUTH", "Logging in test user...");

  const response = await apiClient.post("/api/auth/login", {
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  });

  if (response.status !== 200) {
    throw new Error(
      `Login failed: ${response.status} - ${JSON.stringify(response.data)}`
    );
  }

  logSuccess("User logged in successfully");
  logInfo(`Auth cookie captured`);
  const userId = response.data?.user?.id || response.data?.userId;
  if (!testUserId && userId) {
    testUserId = userId;
    logInfo(`User ID: ${userId}`);
  }

  return response.data;
}

/**
 * Get wallet balance
 */
async function getWalletBalance() {
  const response = await apiClient.get("/api/wallet/balance");

  if (response.status !== 200) {
    throw new Error(`Failed to get wallet balance: ${response.status}`);
  }

  return response.data.balance;
}

/**
 * Get current holdings
 */
async function getHoldings() {
  const response = await apiClient.get("/allHoldings");

  if (response.status !== 200) {
    throw new Error(`Failed to get holdings: ${response.status}`);
  }

  return response.data.holdings || response.data;
}

/**
 * Get order history
 */
async function getOrders() {
  const response = await apiClient.get("/allOrders");

  if (response.status !== 200) {
    throw new Error(`Failed to get orders: ${response.status}`);
  }

  return response.data.orders || response.data;
}

/**
 * Get market price for a symbol
 */
async function getMarketPrice(symbol) {
  const response = await apiClient.get(`/api/market/price/${symbol}`);

  if (response.status !== 200) {
    throw new Error(`Failed to get market price: ${response.status}`);
  }

  return response.data.data.price;
}

/**
 * Place a buy order
 */
async function placeBuyOrder(symbol, quantity, price) {
  logStep(
    "ORDER",
    `Placing BUY order for ${quantity} shares of ${symbol} at $${price}...`
  );

  const response = await apiClient.post("/newOrder", {
    name: symbol,
    qty: quantity,
    price: price,
    mode: "BUY",
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(
      `Buy order failed: ${response.status} - ${JSON.stringify(response.data)}`
    );
  }

  logSuccess(`Buy order placed successfully`);
  logInfo(`Total cost: $${(quantity * price).toFixed(2)}`);

  testOrderId = response.data.orderId;
  return response.data;
}

/**
 * Place a sell order
 */
async function placeSellOrder(symbol, quantity, price) {
  logStep(
    "ORDER",
    `Placing SELL order for ${quantity} shares of ${symbol} at $${price}...`
  );

  const response = await apiClient.post("/newOrder", {
    name: symbol,
    qty: quantity,
    price: price,
    mode: "SELL",
  });

  if (response.status !== 200 && response.status !== 201) {
    throw new Error(
      `Sell order failed: ${response.status} - ${JSON.stringify(response.data)}`
    );
  }

  logSuccess(`Sell order placed successfully`);
  logInfo(`Total revenue: $${(quantity * price).toFixed(2)}`);

  return response.data;
}

/**
 * Verify order appears in history
 */
async function verifyOrderHistory(expectedSymbol, expectedMode) {
  logStep("VERIFY", "Checking order history...");

  const orders = await getOrders();

  if (!Array.isArray(orders) || orders.length === 0) {
    throw new Error("Order history is empty");
  }

  // Find the order we just placed
  const order = orders.find(
    (o) =>
      (o.symbol === expectedSymbol || o.name === expectedSymbol) &&
      (o.type === expectedMode || o.mode === expectedMode)
  );

  if (!order) {
    throw new Error(
      `Order not found in history (${expectedMode} ${expectedSymbol})`
    );
  }

  logSuccess(`Order found in history`);
  logInfo(`Order ID: ${order._id}`);
  const sym = order.symbol || order.name;
  const mode = order.type || order.mode;
  logInfo(
    `Symbol: ${sym}, Qty: ${order.qty}, Price: $${order.price}, Mode: ${mode}`
  );

  return order;
}

/**
 * Verify holdings are updated
 */
async function verifyHoldings(symbol, expectedQty) {
  logStep("VERIFY", "Checking holdings...");

  const holdings = await getHoldings();

  if (!Array.isArray(holdings)) {
    throw new Error("Holdings response is not an array");
  }

  const holding = holdings.find((h) => h.name === symbol);

  if (expectedQty > 0) {
    if (!holding) {
      throw new Error(`Holding not found for ${symbol}`);
    }

    if (holding.qty !== expectedQty) {
      throw new Error(
        `Holding quantity mismatch. Expected: ${expectedQty}, Got: ${holding.qty}`
      );
    }

    logSuccess(
      `Holding verified: ${symbol} x ${
        holding.qty
      } @ avg $${holding.avg.toFixed(2)}`
    );
  } else {
    if (holding) {
      throw new Error(
        `Holding should not exist for ${symbol} after selling all shares`
      );
    }

    logSuccess(`Holding correctly removed after selling all shares`);
  }

  return holding;
}

/**
 * Verify wallet balance
 */
async function verifyWalletBalance(expectedChange, operation) {
  logStep("VERIFY", `Checking wallet balance after ${operation}...`);

  const balance = await getWalletBalance();
  const expectedBalance = INITIAL_BALANCE + expectedChange;

  // Allow small floating point differences
  const diff = Math.abs(balance - expectedBalance);
  if (diff > 0.01) {
    throw new Error(
      `Wallet balance mismatch. Expected: $${expectedBalance.toFixed(
        2
      )}, Got: $${balance.toFixed(2)}`
    );
  }

  logSuccess(`Wallet balance verified: $${balance.toFixed(2)}`);

  return balance;
}

/**
 * Clean up test data
 */
async function cleanup() {
  logStep("CLEANUP", "Cleaning up test data...");

  try {
    await mongoose.connect(MONGO_URL);

    const db = mongoose.connection.db;

    // Delete test user and all related data
    if (testUserId) {
      await db.collection("users").deleteOne({ email: TEST_USER_EMAIL });
      await db.collection("holdings").deleteMany({ userId: testUserId });
      await db.collection("orders").deleteMany({ userId: testUserId });
      await db.collection("wallets").deleteMany({ userId: testUserId });

      logSuccess("Test user and related data deleted");
    }

    await mongoose.disconnect();
  } catch (error) {
    logWarning(`Cleanup warning: ${error.message}`);
  }
}

/**
 * Stop the server if we started it
 */
async function stopServer() {
  if (serverProcess) {
    logStep("SERVER", "Stopping backend server...");

    serverProcess.kill("SIGTERM");

    // Wait for graceful shutdown
    await new Promise((resolve) => {
      serverProcess.on("exit", () => {
        logSuccess("Server stopped");
        resolve();
      });

      // Force kill after 5 seconds if not stopped
      setTimeout(() => {
        if (serverProcess && !serverProcess.killed) {
          serverProcess.kill("SIGKILL");
          logWarning("Server force killed");
          resolve();
        }
      }, 5000);
    });
  }
}

/**
 * Main smoke test execution
 */
async function runSmokeTest() {
  const startTime = Date.now();

  log("\n" + "=".repeat(70), colors.bright);
  log("  TRADING PLATFORM - BACKEND SMOKE TEST", colors.bright + colors.cyan);
  log("=".repeat(70) + "\n", colors.bright);

  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // 1. Start server (optional - can use existing)
    await startServer();
    testsPassed++;

    // 2. Register test user
    await registerUser();
    testsPassed++;

    // 3. Login
    await loginUser();
    testsPassed++;

    // 4. Verify initial wallet balance
    const initialBalance = await getWalletBalance();
    if (initialBalance !== INITIAL_BALANCE) {
      throw new Error(
        `Initial balance mismatch. Expected: ${INITIAL_BALANCE}, Got: ${initialBalance}`
      );
    }
    logInfo(`Initial wallet balance: $${initialBalance.toFixed(2)}`);
    testsPassed++;

    // 5. Get market price
    const testSymbol = "AAPL";
    const marketPrice = await getMarketPrice(testSymbol);
    logInfo(
      `Current market price for ${testSymbol}: $${marketPrice.toFixed(2)}`
    );

    // 6. Place buy order
    const buyQty = 10;
    const buyPrice = marketPrice;
    await placeBuyOrder(testSymbol, buyQty, buyPrice);
    testsPassed++;

    // 7. Verify order in history
    await verifyOrderHistory(testSymbol, "BUY");
    testsPassed++;

    // 8. Verify holdings updated
    await verifyHoldings(testSymbol, buyQty);
    testsPassed++;

    // 9. Verify wallet balance deducted
    const buyAmount = buyQty * buyPrice;
    await verifyWalletBalance(-buyAmount, "BUY order");
    testsPassed++;

    // 10. Place sell order
    const sellQty = buyQty;
    const sellPrice = await getMarketPrice(testSymbol);
    await placeSellOrder(testSymbol, sellQty, sellPrice);
    testsPassed++;

    // 11. Verify sell order in history
    await verifyOrderHistory(testSymbol, "SELL");
    testsPassed++;

    // 12. Verify holdings cleared (sold all)
    await verifyHoldings(testSymbol, 0);
    testsPassed++;

    // 13. Verify wallet balance increased
    const sellAmount = sellQty * sellPrice;
    const netChange = sellAmount - buyAmount;
    await verifyWalletBalance(netChange, "SELL order");
    testsPassed++;

    // Get transactions to verify
    logStep("VERIFY", "Checking transaction history...");
    const transactionsResponse = await apiClient.get(
      "/api/wallet/transactions"
    );
    const transactions = transactionsResponse.data.transactions || [];

    if (transactions.length < 2) {
      throw new Error("Expected at least 2 transactions (BUY and SELL)");
    }

    logSuccess(`Found ${transactions.length} transactions`);
    logInfo(
      `Latest: ${transactions[0].type} - $${transactions[0].amount.toFixed(2)}`
    );
    testsPassed++;

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    log("\n" + "=".repeat(70), colors.bright);
    log("  SMOKE TEST COMPLETED SUCCESSFULLY", colors.bright + colors.green);
    log("=".repeat(70), colors.bright);
    log(`\n  Tests passed: ${testsPassed}`, colors.green);
    log(`  Tests failed: ${testsFailed}`, colors.red);
    log(`  Duration: ${duration}s`, colors.blue);
    log("\n");
  } catch (error) {
    testsFailed++;
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    log("\n" + "=".repeat(70), colors.bright);
    log("  SMOKE TEST FAILED", colors.bright + colors.red);
    log("=".repeat(70), colors.bright);
    logError(`\nError: ${error.message}`);
    if (error.stack) {
      logInfo("\nStack trace:");
      console.log(error.stack);
    }
    log(`\n  Tests passed: ${testsPassed}`, colors.green);
    log(`  Tests failed: ${testsFailed}`, colors.red);
    log(`  Duration: ${duration}s`, colors.blue);
    log("\n");

    throw error;
  } finally {
    // Always clean up
    await cleanup();
    await stopServer();
  }
}

// Run the smoke test
if (require.main === module) {
  runSmokeTest()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      process.exit(1);
    });
}

module.exports = { runSmokeTest };
