/**
 * Integration Tests
 *
 * Tests complete user flow:
 * - Registration → Login → BUY → SELL → Order History
 *
 * Uses supertest for API testing with cookie management
 */

const request = require("supertest");
const mongoose = require("mongoose");
const { UserModel } = require("../model/UserModel");
const { WalletModel } = require("../model/WalletModel");
const { HoldingsModel } = require("../model/HoldingsModel");
const { OrdersModel } = require("../model/OrdersModel");

// Import the Express app
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

// Create test app instance
let app;
let server;

describe("Integration Tests - Full User Flow", () => {
  let authCookie;
  let userId;
  const testTimestamp = Date.now();
  const testUser = {
    fullName: `Integration Test User ${testTimestamp}`,
    email: `integrationtest${testTimestamp}@example.com`,
    password: "TestPassword123",
  };

  // Setup before all tests
  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = "test";
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
    process.env.PORT = "3003"; // Use different port for testing

    // Connect to test database
    const mongoUri =
      process.env.MONGO_TEST_URL || "mongodb://127.0.0.1:27017/trading-test";
    await mongoose.connect(mongoUri);

    // Create Express app for testing
    app = express();

    // Middleware
    app.use(helmet());
    app.use(
      cors({
        origin: true,
        credentials: true,
      })
    );
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Import and mount routes
    const authRoutes = require("../src/routes/authRoutes");
    const {
      authenticationGuard,
    } = require("../src/middlewares/authMiddleware");
    const WalletService = require("../src/services/WalletService");
    const MarketDataService = require("../src/services/MarketDataService");

    app.use("/api/auth", authRoutes);

    // Wallet endpoints
    app.get("/api/wallet/balance", authenticationGuard, async (req, res) => {
      try {
        const balance = await WalletService.getBalance(req.user.id);
        res.json({ success: true, balance });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });

    // Order endpoint
    app.post("/newOrder", authenticationGuard, async (req, res) => {
      const session = await mongoose.startSession();

      try {
        // For standalone MongoDB (no replica set), skip session
        const useSession = false; // Set to true if using replica set

        if (useSession) {
          session.startTransaction();
        }

        const { name, qty, price, mode } = req.body;
        const userId = req.user.id;

        // Validate inputs
        if (!name || !qty || !mode) {
          throw new Error("Missing required fields");
        }

        const parsedQty = parseInt(qty);
        if (isNaN(parsedQty) || parsedQty <= 0) {
          throw new Error("Invalid quantity");
        }

        const symbol = name.toUpperCase();

        // Get current market price
        let currentPrice;
        if (price) {
          currentPrice = parseFloat(price);
        } else {
          const marketData = await MarketDataService.getPrice(symbol);
          if (!marketData) {
            return res.status(404).json({
              success: false,
              message: `Symbol ${symbol} not found`,
            });
          }
          currentPrice = marketData.price;
        }

        const totalAmount = currentPrice * parsedQty;

        if (mode === "BUY") {
          // Process BUY transaction
          await WalletService.processTransaction(
            userId,
            "BUY",
            totalAmount,
            {
              symbol,
              quantity: parsedQty,
              price: currentPrice,
            },
            useSession ? session : null
          );

          // Update or create holding
          let holding = await HoldingsModel.findOne({ userId, name: symbol });

          if (holding) {
            const newTotalQty = holding.qty + parsedQty;
            const newAvgPrice =
              (holding.avg * holding.qty + currentPrice * parsedQty) /
              newTotalQty;
            holding.qty = newTotalQty;
            holding.avg = newAvgPrice;
            holding.price = currentPrice;
            await holding.save(useSession ? { session } : {});
          } else {
            holding = await HoldingsModel.create(
              [
                {
                  userId,
                  name: symbol,
                  qty: parsedQty,
                  avg: currentPrice,
                  price: currentPrice,
                },
              ],
              useSession ? { session } : {}
            );
            holding = holding[0];
          }

          // Create order record
          await OrdersModel.create(
            [
              {
                userId,
                name: symbol,
                qty: parsedQty,
                price: currentPrice,
                mode: "BUY",
              },
            ],
            useSession ? { session } : {}
          );

          if (useSession) {
            await session.commitTransaction();
          }

          const wallet = await WalletService.getOrCreateWallet(userId);

          return res.status(201).json({
            success: true,
            message: "BUY order placed successfully",
            order: {
              symbol,
              qty: parsedQty,
              price: currentPrice,
              mode: "BUY",
              total: totalAmount,
            },
            holding: {
              symbol: holding.name,
              qty: holding.qty,
              avg: holding.avg,
            },
            wallet: {
              newBalance: wallet.balance,
            },
          });
        } else if (mode === "SELL") {
          // Find holding
          const holding = await HoldingsModel.findOne({ userId, name: symbol });

          if (!holding) {
            return res.status(400).json({
              success: false,
              message: `You don't own any ${symbol} shares`,
            });
          }

          if (holding.qty < parsedQty) {
            return res.status(400).json({
              success: false,
              message: "Insufficient shares",
              available: holding.qty,
              requested: parsedQty,
            });
          }

          // Process SELL transaction
          await WalletService.processTransaction(
            userId,
            "SELL",
            totalAmount,
            {
              symbol,
              quantity: parsedQty,
              price: currentPrice,
            },
            useSession ? session : null
          );

          // Update holding
          holding.qty -= parsedQty;

          if (holding.qty === 0) {
            await holding.deleteOne(useSession ? { session } : {});
          } else {
            holding.price = currentPrice;
            await holding.save(useSession ? { session } : {});
          }

          // Create order record
          await OrdersModel.create(
            [
              {
                userId,
                name: symbol,
                qty: parsedQty,
                price: currentPrice,
                mode: "SELL",
              },
            ],
            useSession ? { session } : {}
          );

          if (useSession) {
            await session.commitTransaction();
          }

          const wallet = await WalletService.getOrCreateWallet(userId);

          return res.status(201).json({
            success: true,
            message: "SELL order placed successfully",
            order: {
              symbol,
              qty: parsedQty,
              price: currentPrice,
              mode: "SELL",
              total: totalAmount,
            },
            holding:
              holding.qty > 0
                ? {
                    symbol: holding.name,
                    qty: holding.qty,
                    avg: holding.avg,
                  }
                : null,
            wallet: {
              newBalance: wallet.balance,
            },
          });
        } else {
          throw new Error("Invalid mode. Must be BUY or SELL");
        }
      } catch (error) {
        if (session.inTransaction()) {
          await session.abortTransaction();
        }

        console.error("Order processing error:", error);

        return res.status(400).json({
          success: false,
          message: error.message,
        });
      } finally {
        session.endSession();
      }
    });

    // Holdings endpoint
    app.get("/allHoldings", authenticationGuard, async (req, res) => {
      try {
        const holdings = await HoldingsModel.find({ userId: req.user.id });
        res.json({
          success: true,
          holdings,
        });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });

    // Orders endpoint
    app.get("/allOrders", authenticationGuard, async (req, res) => {
      try {
        const orders = await OrdersModel.find({ userId: req.user.id }).sort({
          createdAt: -1,
        });
        res.json({
          success: true,
          orders,
        });
      } catch (error) {
        res.status(500).json({ success: false, message: error.message });
      }
    });
  });

  // Cleanup after each test
  afterEach(async () => {
    // Clean up all test data to avoid interference between tests
    await UserModel.deleteMany({});
    await WalletModel.deleteMany({});
    await HoldingsModel.deleteMany({});
    await OrdersModel.deleteMany({});

    // Reset variables
    authCookie = null;
    userId = null;
  });

  // Cleanup after all tests
  afterAll(async () => {
    await mongoose.connection.close();
    if (server) {
      server.close();
    }
  });

  describe("Complete User Flow", () => {
    test("should complete full registration → login → buy → sell flow", async () => {
      // STEP 1: Register new user
      console.log("\n📝 Step 1: Registering new user...");
      const registerRes = await request(app)
        .post("/api/auth/signup")
        .send(testUser)
        .expect(201);

      expect(registerRes.body.success).toBe(true);
      expect(registerRes.body.user).toBeDefined();
      expect(registerRes.body.user.email).toBe(testUser.email);
      expect(registerRes.body.user.fullName).toBe(testUser.fullName);

      // Extract user ID
      userId = registerRes.body.user.id;
      expect(userId).toBeDefined();

      // Extract cookie from registration
      authCookie = registerRes.headers["set-cookie"];
      expect(authCookie).toBeDefined();
      console.log("✅ User registered successfully");

      // STEP 2: Check initial balance = 100000
      console.log("\n💰 Step 2: Checking initial balance...");
      const balanceRes = await request(app)
        .get("/api/wallet/balance")
        .set("Cookie", authCookie)
        .expect(200);

      expect(balanceRes.body.success).toBe(true);
      expect(balanceRes.body.balance).toBe(100000);
      console.log("✅ Initial balance confirmed: $100,000");

      // STEP 3: Place BUY order
      console.log("\n📈 Step 3: Placing BUY order...");
      const buyRes = await request(app)
        .post("/newOrder")
        .set("Cookie", authCookie)
        .send({
          name: "AAPL",
          qty: 10,
          mode: "BUY",
        });

      // Debug output if not 201
      if (buyRes.status !== 201) {
        console.error("BUY order failed:", buyRes.status, buyRes.body);
      }

      expect(buyRes.status).toBe(201);

      expect(buyRes.body.success).toBe(true);
      expect(buyRes.body.order).toBeDefined();
      expect(buyRes.body.order.symbol).toBe("AAPL");
      expect(buyRes.body.order.qty).toBe(10);
      expect(buyRes.body.order.mode).toBe("BUY");

      const buyPrice = buyRes.body.order.price;
      const buyTotal = buyRes.body.order.total;
      console.log(`✅ BUY order placed: 10 AAPL @ $${buyPrice} = $${buyTotal}`);

      // STEP 4: Verify balance decreased
      console.log("\n💵 Step 4: Verifying balance decreased...");
      const balanceAfterBuy = await request(app)
        .get("/api/wallet/balance")
        .set("Cookie", authCookie)
        .expect(200);

      const expectedBalanceAfterBuy = 100000 - buyTotal;
      expect(balanceAfterBuy.body.balance).toBe(expectedBalanceAfterBuy);
      console.log(
        `✅ Balance decreased: $${100000} → $${balanceAfterBuy.body.balance}`
      );

      // STEP 5: Verify holding created
      console.log("\n📦 Step 5: Verifying holding created...");
      const holdingsAfterBuy = await request(app)
        .get("/allHoldings")
        .set("Cookie", authCookie)
        .expect(200);

      expect(holdingsAfterBuy.body.success).toBe(true);
      expect(holdingsAfterBuy.body.holdings).toHaveLength(1);
      expect(holdingsAfterBuy.body.holdings[0].name).toBe("AAPL");
      expect(holdingsAfterBuy.body.holdings[0].qty).toBe(10);
      expect(holdingsAfterBuy.body.holdings[0].avg).toBe(buyPrice);
      console.log("✅ Holding created: 10 AAPL shares");

      // STEP 6: Place SELL order (sell 5 shares)
      console.log("\n📉 Step 6: Placing SELL order...");
      const sellRes = await request(app)
        .post("/newOrder")
        .set("Cookie", authCookie)
        .send({
          name: "AAPL",
          qty: 5,
          mode: "SELL",
        })
        .expect(201);

      expect(sellRes.body.success).toBe(true);
      expect(sellRes.body.order).toBeDefined();
      expect(sellRes.body.order.symbol).toBe("AAPL");
      expect(sellRes.body.order.qty).toBe(5);
      expect(sellRes.body.order.mode).toBe("SELL");

      const sellPrice = sellRes.body.order.price;
      const sellTotal = sellRes.body.order.total;
      console.log(
        `✅ SELL order placed: 5 AAPL @ $${sellPrice} = $${sellTotal}`
      );

      // STEP 7: Verify balance increased
      console.log("\n💰 Step 7: Verifying balance increased...");
      const balanceAfterSell = await request(app)
        .get("/api/wallet/balance")
        .set("Cookie", authCookie)
        .expect(200);

      const expectedBalanceAfterSell = expectedBalanceAfterBuy + sellTotal;
      expect(balanceAfterSell.body.balance).toBe(expectedBalanceAfterSell);
      console.log(
        `✅ Balance increased: $${balanceAfterBuy.body.balance} → $${balanceAfterSell.body.balance}`
      );

      // STEP 8: Verify holding updated (5 shares remaining)
      console.log("\n📦 Step 8: Verifying holding updated...");
      const holdingsAfterSell = await request(app)
        .get("/allHoldings")
        .set("Cookie", authCookie)
        .expect(200);

      expect(holdingsAfterSell.body.success).toBe(true);
      expect(holdingsAfterSell.body.holdings).toHaveLength(1);
      expect(holdingsAfterSell.body.holdings[0].name).toBe("AAPL");
      expect(holdingsAfterSell.body.holdings[0].qty).toBe(5); // 10 - 5 = 5
      console.log("✅ Holding updated: 5 AAPL shares remaining");

      // STEP 9: Check order history
      console.log("\n📋 Step 9: Checking order history...");
      const ordersRes = await request(app)
        .get("/allOrders")
        .set("Cookie", authCookie)
        .expect(200);

      expect(ordersRes.body.success).toBe(true);
      expect(ordersRes.body.orders).toHaveLength(2); // 1 BUY + 1 SELL

      // Verify orders are in correct order (newest first)
      expect(ordersRes.body.orders[0].mode).toBe("SELL");
      expect(ordersRes.body.orders[0].name).toBe("AAPL");
      expect(ordersRes.body.orders[0].qty).toBe(5);

      expect(ordersRes.body.orders[1].mode).toBe("BUY");
      expect(ordersRes.body.orders[1].name).toBe("AAPL");
      expect(ordersRes.body.orders[1].qty).toBe(10);

      console.log("✅ Order history verified: 2 orders (1 BUY, 1 SELL)");

      // STEP 10: Sell remaining shares
      console.log("\n📉 Step 10: Selling all remaining shares...");
      const sellAllRes = await request(app)
        .post("/newOrder")
        .set("Cookie", authCookie)
        .send({
          name: "AAPL",
          qty: 5,
          mode: "SELL",
        })
        .expect(201);

      expect(sellAllRes.body.success).toBe(true);
      expect(sellAllRes.body.holding).toBeNull(); // No holding should remain

      // Verify holding deleted
      const holdingsAfterSellAll = await request(app)
        .get("/allHoldings")
        .set("Cookie", authCookie)
        .expect(200);

      expect(holdingsAfterSellAll.body.holdings).toHaveLength(0);
      console.log("✅ All shares sold, holding deleted");

      console.log("\n🎉 COMPLETE USER FLOW TEST PASSED!");
    });

    test("should prevent selling shares user doesn't own", async () => {
      // Register and login
      const registerRes = await request(app)
        .post("/api/auth/signup")
        .send(testUser)
        .expect(201);

      userId = registerRes.body.user.id;
      authCookie = registerRes.headers["set-cookie"];

      // Try to sell shares without buying first
      const sellRes = await request(app)
        .post("/newOrder")
        .set("Cookie", authCookie)
        .send({
          name: "MSFT",
          qty: 10,
          mode: "SELL",
        })
        .expect(400);

      expect(sellRes.body.success).toBe(false);
      expect(sellRes.body.message).toContain("don't own");
    });

    test("should prevent buying with insufficient funds", async () => {
      // Register and login
      const registerRes = await request(app)
        .post("/api/auth/signup")
        .send(testUser)
        .expect(201);

      userId = registerRes.body.user.id;
      authCookie = registerRes.headers["set-cookie"];

      // Try to buy shares exceeding balance (100000)
      const buyRes = await request(app)
        .post("/newOrder")
        .set("Cookie", authCookie)
        .send({
          name: "AAPL",
          qty: 1000, // This will exceed 100000
          price: 1500,
          mode: "BUY",
        })
        .expect(400);

      expect(buyRes.body.success).toBe(false);
      expect(buyRes.body.message).toContain("Insufficient");
    });

    test("should prevent selling more shares than owned", async () => {
      // Register and login
      const registerRes = await request(app)
        .post("/api/auth/signup")
        .send(testUser)
        .expect(201);

      userId = registerRes.body.user.id;
      authCookie = registerRes.headers["set-cookie"];

      // Buy 10 shares
      await request(app)
        .post("/newOrder")
        .set("Cookie", authCookie)
        .send({
          name: "GOOGL",
          qty: 10,
          mode: "BUY",
        })
        .expect(201);

      // Try to sell 15 shares (only have 10)
      const sellRes = await request(app)
        .post("/newOrder")
        .set("Cookie", authCookie)
        .send({
          name: "GOOGL",
          qty: 15,
          mode: "SELL",
        })
        .expect(400);

      expect(sellRes.body.success).toBe(false);
      expect(sellRes.body.message).toContain("Insufficient shares");
      expect(sellRes.body.available).toBe(10);
      expect(sellRes.body.requested).toBe(15);
    });

    test("should handle multiple BUY orders for same stock", async () => {
      // Register and login
      const registerRes = await request(app)
        .post("/api/auth/signup")
        .send(testUser)
        .expect(201);

      userId = registerRes.body.user.id;
      authCookie = registerRes.headers["set-cookie"];

      // First BUY
      const buy1 = await request(app)
        .post("/newOrder")
        .set("Cookie", authCookie)
        .send({
          name: "MSFT",
          qty: 5,
          price: 3000,
          mode: "BUY",
        })
        .expect(201);

      // Second BUY
      const buy2 = await request(app)
        .post("/newOrder")
        .set("Cookie", authCookie)
        .send({
          name: "MSFT",
          qty: 10,
          price: 3200,
          mode: "BUY",
        })
        .expect(201);

      // Check holding (should have 15 shares with weighted average price)
      const holdings = await request(app)
        .get("/allHoldings")
        .set("Cookie", authCookie)
        .expect(200);

      expect(holdings.body.holdings).toHaveLength(1);
      expect(holdings.body.holdings[0].qty).toBe(15); // 5 + 10

      // Calculate expected average: (5 * 3000 + 10 * 3200) / 15 = 3133.33...
      const expectedAvg = (5 * 3000 + 10 * 3200) / 15;
      expect(holdings.body.holdings[0].avg).toBeCloseTo(expectedAvg, 2);

      // Check order history
      const orders = await request(app)
        .get("/allOrders")
        .set("Cookie", authCookie)
        .expect(200);

      expect(orders.body.orders).toHaveLength(2);
    });

    test("should require authentication for all trading endpoints", async () => {
      // Try to access endpoints without authentication
      await request(app).get("/api/wallet/balance").expect(401);

      await request(app)
        .post("/newOrder")
        .send({
          name: "INFY",
          qty: 10,
          mode: "BUY",
        })
        .expect(401);

      await request(app).get("/allHoldings").expect(401);

      await request(app).get("/allOrders").expect(401);
    });

    test("should validate order inputs", async () => {
      // Register and login
      const registerRes = await request(app)
        .post("/api/auth/signup")
        .send(testUser)
        .expect(201);

      userId = registerRes.body.user.id;
      authCookie = registerRes.headers["set-cookie"];

      // Missing name
      await request(app)
        .post("/newOrder")
        .set("Cookie", authCookie)
        .send({
          qty: 10,
          mode: "BUY",
        })
        .expect(400);

      // Missing qty
      await request(app)
        .post("/newOrder")
        .set("Cookie", authCookie)
        .send({
          name: "AAPL",
          mode: "BUY",
        })
        .expect(400);

      // Missing mode
      await request(app)
        .post("/newOrder")
        .set("Cookie", authCookie)
        .send({
          name: "AAPL",
          qty: 10,
        })
        .expect(400);

      // Invalid quantity (zero)
      await request(app)
        .post("/newOrder")
        .set("Cookie", authCookie)
        .send({
          name: "AAPL",
          qty: 0,
          mode: "BUY",
        })
        .expect(400);

      // Invalid quantity (negative)
      await request(app)
        .post("/newOrder")
        .set("Cookie", authCookie)
        .send({
          name: "AAPL",
          qty: -5,
          mode: "BUY",
        })
        .expect(400);
    });
  });

  describe("Login Flow", () => {
    test("should login with correct credentials and receive cookie", async () => {
      // First register
      await request(app).post("/api/auth/signup").send(testUser).expect(201);

      // Then login
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.user).toBeDefined();
      expect(loginRes.body.user.email).toBe(testUser.email);

      // Check cookie is set
      const cookie = loginRes.headers["set-cookie"];
      expect(cookie).toBeDefined();
      expect(cookie[0]).toContain("equinova_session");

      // Save for cleanup
      userId = loginRes.body.user.id;
    });

    test("should reject login with wrong password", async () => {
      // First register
      await request(app).post("/api/auth/signup").send(testUser).expect(201);

      // Then try to login with wrong password
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "WrongPassword123",
        })
        .expect(401);

      expect(loginRes.body.success).toBe(false);
      expect(loginRes.body.message).toContain("Invalid");
    });

    test("should reject login with non-existent email", async () => {
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "SomePassword123",
        })
        .expect(401);

      expect(loginRes.body.success).toBe(false);
      expect(loginRes.body.message).toContain("Invalid");
    });
  });
});
