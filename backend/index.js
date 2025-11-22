require("dotenv").config();
const { randomUUID } = require("crypto");

const express = require("express");
const pinoHttp = require("pino-http");
const logger = require("./src/util/logger");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { HoldingsModel } = require("./model/HoldingsModel");
const { OrdersModel } = require("./model/OrdersModel");
const authRoutes = require("./src/routes/authRoutes");
const { authenticationGuard } = require("./src/middlewares/authMiddleware");
const WalletService = require("./src/services/WalletService");
const MarketDataService = require("./src/services/MarketDataService");

const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const dashboardUrl = process.env.DASHBOARD_URL || "http://localhost:3001";

// CORS Configuration: Array containing both frontend and dashboard URLs
const defaultOrigins = [
  frontendUrl,
  dashboardUrl,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

// Support for additional origins via environment variable (comma-separated)
const extraOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...new Set([...defaultOrigins, ...extraOrigins]),
].filter(Boolean);

logger.info({ allowedOrigins }, "CORS configuration initialized");

const app = express();

// Create HTTP server wrapping Express app
const server = http.createServer(app);

// Create Socket.IO instance with CORS configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Make io accessible in routes if needed
app.set("io", io);

// Store WebSocket subscriptions: socketId → symbols array
const subscriptions = new Map();

// Socket.IO connection handler
io.on("connection", (socket) => {
  logger.info({ socketId: socket.id }, "Client connected");

  // Handle watchlist subscription
  socket.on("subscribe_watchlist", (symbols) => {
    if (Array.isArray(symbols) && symbols.length > 0) {
      // Validate symbols
      const validSymbols = symbols
        .map((s) => s.toUpperCase().trim())
        .filter((s) => MarketDataService.getPrice(s) !== null);

      subscriptions.set(socket.id, validSymbols);
      logger.info(
        { socketId: socket.id, symbols: validSymbols },
        "Client subscribed"
      );

      // Send initial data immediately
      const initialData = validSymbols.map((symbol) =>
        MarketDataService.getPrice(symbol)
      );
      socket.emit("watchlist_update", initialData);
    } else {
      logger.warn(
        { socketId: socket.id, symbols },
        "Invalid subscription payload"
      );
    }
  });

  // Handle unsubscribe
  socket.on("unsubscribe_watchlist", () => {
    if (subscriptions.has(socket.id)) {
      const symbols = subscriptions.get(socket.id);
      subscriptions.delete(socket.id);
      logger.info({ socketId: socket.id, symbols }, "Client unsubscribed");
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    if (subscriptions.has(socket.id)) {
      const symbols = subscriptions.get(socket.id);
      subscriptions.delete(socket.id);
      logger.info(
        { socketId: socket.id, symbols },
        "Client disconnected (had subscriptions)"
      );
    } else {
      logger.info({ socketId: socket.id }, "Client disconnected");
    }
  });
});

// Export subscriptions and io for use in other modules
app.set("subscriptions", subscriptions);

// Security: Hide X-Powered-By header
app.disable("x-powered-by");

// Security: Helmet middleware - must be first
app.use(helmet());

// CORS configuration with credentials support for cross-origin cookie sharing
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, or same-origin)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        logger.info({ origin }, "CORS allowed origin");
        return callback(null, true);
      }

      // In development, allow all origins for easier testing
      if (process.env.NODE_ENV !== "production") {
        logger.warn({ origin }, "CORS allowing non-configured origin in dev");
        return callback(null, true);
      }

      // In production, block unauthorized origins
      logger.error({ origin }, "CORS blocked origin");
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true, // Enable cookies and authentication headers
    optionsSuccessStatus: 200, // Support legacy browsers
  })
);

// Body parser and cookie parser middleware
app.use(express.json());
app.use(cookieParser());

// Structured logging with request IDs
app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const headerId = req.headers["x-request-id"];
      const id = headerId || randomUUID();
      res.setHeader("x-request-id", id);
      return id;
    },
    customProps: (req) => ({ requestId: req.id }),
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
  const dbConnected = dbState === 1;
  const marketActive = MarketDataService.isActive();

  const payload = {
    status: dbConnected && marketActive ? "ok" : "error",
    database: dbConnected ? "connected" : "disconnected",
    marketData: marketActive ? "active" : "inactive",
    uptime: process.uptime(),
  };

  if (!dbConnected || !marketActive) {
    req.log?.warn(payload, "Health check reports degraded service");
    return res.status(503).json(payload);
  }

  return res.status(200).json(payload);
});

// Rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiter to auth routes
app.use("/api/auth", authLimiter, authRoutes);

// Get all holdings for authenticated user with current prices and P&L
app.get("/allHoldings", authenticationGuard, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user's holdings from database
    const holdings = await HoldingsModel.find({ userId });

    // Enrich each holding with current market price and P&L
    const enrichedHoldings = holdings.map((holding) => {
      // Get current market price
      const marketData = MarketDataService.getPrice(holding.name);
      const currentPrice = marketData ? marketData.price : holding.price;

      // Calculate unrealized P&L
      const unrealizedPL = (currentPrice - holding.avg) * holding.qty;
      const unrealizedPLPercent =
        ((currentPrice - holding.avg) / holding.avg) * 100;

      // Calculate current value and invested value
      const currentValue = currentPrice * holding.qty;
      const investedValue = holding.avg * holding.qty;

      return {
        _id: holding._id,
        name: holding.name,
        qty: holding.qty,
        avg: holding.avg,
        price: currentPrice, // Current market price
        isDay: holding.isDay || false,
        unrealizedPL: parseFloat(unrealizedPL.toFixed(2)),
        unrealizedPLPercent: parseFloat(unrealizedPLPercent.toFixed(2)),
        currentValue: parseFloat(currentValue.toFixed(2)),
        investedValue: parseFloat(investedValue.toFixed(2)),
        updatedAt: holding.updatedAt,
      };
    });

    // Calculate portfolio summary
    const totalInvested = enrichedHoldings.reduce(
      (sum, h) => sum + h.investedValue,
      0
    );
    const totalCurrent = enrichedHoldings.reduce(
      (sum, h) => sum + h.currentValue,
      0
    );
    const totalPL = totalCurrent - totalInvested;
    const totalPLPercent =
      totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

    res.json({
      success: true,
      holdings: enrichedHoldings,
      summary: {
        totalHoldings: enrichedHoldings.length,
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        totalCurrent: parseFloat(totalCurrent.toFixed(2)),
        totalPL: parseFloat(totalPL.toFixed(2)),
        totalPLPercent: parseFloat(totalPLPercent.toFixed(2)),
      },
    });
  } catch (error) {
    req.log?.error({ err: error }, "Error fetching holdings");
    res.status(500).json({
      success: false,
      message: "Failed to fetch holdings",
    });
  }
});

// Get specific holding by symbol for authenticated user
app.get("/holdings/:symbol", authenticationGuard, async (req, res) => {
  try {
    const { symbol } = req.params;
    const userId = req.user._id;
    const holding = await HoldingsModel.findOne({
      userId,
      name: symbol.toUpperCase(),
    });

    if (!holding) {
      return res.status(404).json({
        success: false,
        message: "Holding not found",
      });
    }

    // Get current market price
    const marketData = MarketDataService.getPrice(holding.name);
    const currentPrice = marketData ? marketData.price : holding.price;

    // Calculate unrealized P&L
    const unrealizedPL = (currentPrice - holding.avg) * holding.qty;
    const unrealizedPLPercent =
      ((currentPrice - holding.avg) / holding.avg) * 100;
    const currentValue = currentPrice * holding.qty;
    const investedValue = holding.avg * holding.qty;

    res.json({
      success: true,
      holding: {
        _id: holding._id,
        name: holding.name,
        qty: holding.qty,
        avg: holding.avg,
        price: currentPrice,
        unrealizedPL: parseFloat(unrealizedPL.toFixed(2)),
        unrealizedPLPercent: parseFloat(unrealizedPLPercent.toFixed(2)),
        currentValue: parseFloat(currentValue.toFixed(2)),
        investedValue: parseFloat(investedValue.toFixed(2)),
        updatedAt: holding.updatedAt,
      },
    });
  } catch (error) {
    req.log?.error({ err: error }, "Error fetching holding");
    res.status(500).json({
      success: false,
      message: "Failed to fetch holding",
    });
  }
});

// Get all orders for authenticated user
app.get("/allOrders", authenticationGuard, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user's orders from database, sorted by newest first
    const orders = await OrdersModel.find({ userId }).sort({ createdAt: -1 });

    // Format orders for response
    const formattedOrders = orders.map((order) => {
      const totalValue = order.price * order.qty;

      return {
        _id: order._id,
        symbol: order.name,
        type: order.mode, // BUY or SELL
        qty: order.qty,
        price: order.price,
        totalValue: parseFloat(totalValue.toFixed(2)),
        timestamp: order.createdAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    res.json({
      success: true,
      orders: formattedOrders,
      count: formattedOrders.length,
    });
  } catch (error) {
    req.log?.error({ err: error }, "Error fetching orders");
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
});

// Note: Positions feature is planned for future implementation
// This will track intraday and active trading positions separate from long-term holdings

// Market Data API endpoints (Public - No Auth Required)

// GET /api/market/prices?symbols=INFY,TCS,WIPRO
// Returns prices for specific symbols or all if no query param
app.get("/api/market/prices", (req, res) => {
  try {
    const { symbols } = req.query;

    if (symbols) {
      // Filter by requested symbols
      const symbolArray = symbols.split(",").map((s) => s.trim().toUpperCase());
      const prices = [];
      const notFound = [];

      symbolArray.forEach((symbol) => {
        const priceData = MarketDataService.getPrice(symbol);
        if (priceData) {
          prices.push(priceData);
        } else {
          notFound.push(symbol);
        }
      });

      return res.json({
        success: true,
        data: prices,
        count: prices.length,
        ...(notFound.length > 0 && { notFound }),
      });
    }

    // Return all prices if no filter
    const prices = MarketDataService.getAllPrices();
    res.json({
      success: true,
      data: prices,
      count: prices.length,
    });
  } catch (error) {
    req.log?.error({ err: error }, "Error fetching market prices");
    res.status(500).json({
      success: false,
      message: "Failed to fetch market prices",
    });
  }
});

// GET /api/market/price/:symbol
// Returns current price data for a single symbol
app.get("/api/market/price/:symbol", (req, res) => {
  try {
    const { symbol } = req.params;
    const priceData = MarketDataService.getPrice(symbol);

    if (!priceData) {
      return res.status(404).json({
        success: false,
        message: `Symbol ${symbol.toUpperCase()} not found`,
        availableSymbols: MarketDataService.getSymbols(),
      });
    }

    res.json({
      success: true,
      data: priceData,
    });
  } catch (error) {
    req.log?.error({ err: error }, "Error fetching price");
    res.status(500).json({
      success: false,
      message: "Failed to fetch price",
    });
  }
});

// GET /api/market/all
// Returns all available symbols with complete market data
app.get("/api/market/all", (req, res) => {
  try {
    const prices = MarketDataService.getAllPrices();
    const symbols = MarketDataService.getSymbols();

    res.json({
      success: true,
      data: prices,
      symbols: symbols,
      count: prices.length,
      lastUpdated: new Date(),
    });
  } catch (error) {
    req.log?.error({ err: error }, "Error fetching all market data");
    res.status(500).json({
      success: false,
      message: "Failed to fetch market data",
    });
  }
});

// GET /api/market/symbols
// Returns list of all available symbol names
app.get("/api/market/symbols", (req, res) => {
  try {
    const symbols = MarketDataService.getSymbols();
    res.json({
      success: true,
      data: symbols,
      count: symbols.length,
    });
  } catch (error) {
    req.log?.error({ err: error }, "Error fetching symbols");
    res.status(500).json({
      success: false,
      message: "Failed to fetch symbols",
    });
  }
});

app.get("/api/market/watchlist", (req, res) => {
  try {
    const watchlist = MarketDataService.getWatchlistPrices();
    res.json({
      success: true,
      data: watchlist,
      count: watchlist.length,
    });
  } catch (error) {
    req.log?.error({ err: error }, "Error fetching watchlist");
    res.status(500).json({
      success: false,
      message: "Failed to fetch watchlist",
    });
  }
});

app.post("/api/market/reset", (req, res) => {
  try {
    const prices = MarketDataService.resetAllPrices();
    res.json({
      success: true,
      message: "All prices reset to base values",
      data: prices,
    });
  } catch (error) {
    req.log?.error({ err: error }, "Error resetting prices");
    res.status(500).json({
      success: false,
      message: "Failed to reset prices",
    });
  }
});

// Wallet API endpoints
app.get("/api/wallet/balance", authenticationGuard, async (req, res) => {
  try {
    const balance = await WalletService.getBalance(req.user._id);
    res.json({
      success: true,
      balance,
      currency: "USD",
    });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wallet balance",
    });
  }
});

app.get("/api/wallet/transactions", authenticationGuard, async (req, res) => {
  try {
    const transactions = await WalletService.getTransactionHistory(
      req.user._id,
      50
    );
    res.json({
      success: true,
      transactions,
      count: transactions.length,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction history",
    });
  }
});

app.post("/newOrder", authenticationGuard, async (req, res) => {
  const { name, qty, mode } = req.body;
  const parsedQty = Number(qty);
  const normalizedMode = typeof mode === "string" ? mode.toUpperCase() : null;
  const symbol = name ? name.toUpperCase().trim() : null;
  const userId = req.user._id;

  // Context for logging
  const orderContext = {
    userId: userId.toString(),
    symbol,
    qty: parsedQty,
    mode: normalizedMode,
    timestamp: new Date().toISOString(),
  };

  // Validate input
  if (
    !symbol ||
    !normalizedMode ||
    !Number.isFinite(parsedQty) ||
    parsedQty <= 0
  ) {
    req.log?.warn(
      {
        ...orderContext,
        error: "Invalid input parameters",
      },
      "Order validation failed"
    );
    return res.status(400).json({
      success: false,
      message:
        "Invalid order payload. Required: symbol, qty > 0, mode (BUY/SELL)",
    });
  }

  // Validate mode
  if (normalizedMode !== "BUY" && normalizedMode !== "SELL") {
    req.log?.warn(
      {
        ...orderContext,
        error: "Invalid mode",
      },
      "Order validation failed"
    );
    return res.status(400).json({
      success: false,
      message: "Invalid order mode. Must be BUY or SELL",
    });
  }

  // Validate symbol exists in market data
  const marketPrice = MarketDataService.getPrice(symbol);
  if (!marketPrice) {
    req.log?.warn(
      {
        ...orderContext,
        error: "Symbol not found",
      },
      "Order validation failed"
    );
    return res.status(404).json({
      success: false,
      message: `Invalid stock symbol: ${symbol}. Please check the symbol and try again.`,
      details: {
        invalidSymbol: symbol,
        availableSymbols: MarketDataService.getSymbols(),
      },
    });
  }

  const currentPrice = marketPrice.price;
  orderContext.price = currentPrice;

  // Start MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    req.log?.info(orderContext, "Processing order");

    if (normalizedMode === "BUY") {
      // Calculate total cost
      const totalCost = currentPrice * parsedQty;
      orderContext.totalCost = totalCost;

      // Check wallet balance
      const balance = await WalletService.getBalance(userId);
      if (balance < totalCost) {
        await session.abortTransaction();
        session.endSession();

        req.log?.warn(
          {
            ...orderContext,
            error: "Insufficient balance",
            required: totalCost,
            available: balance,
          },
          "BUY order failed"
        );

        return res.status(400).json({
          success: false,
          message: `Insufficient funds. Available: $${balance.toFixed(
            2
          )}, Required: $${totalCost.toFixed(2)}`,
          details: {
            required: totalCost,
            available: balance,
            shortfall: totalCost - balance,
          },
        });
      }

      // Process wallet transaction (within transaction)
      await WalletService.processTransaction(
        userId,
        "BUY",
        totalCost,
        {
          symbol,
          quantity: parsedQty,
          price: currentPrice,
        },
        session
      );

      // Find or create holding (within transaction)
      let holding = await HoldingsModel.findOne({
        userId,
        name: symbol,
      }).session(session);

      if (holding) {
        // Update existing holding with weighted average
        const totalQty = holding.qty + parsedQty;
        const totalValue = holding.qty * holding.avg + parsedQty * currentPrice;
        holding.avg = totalValue / totalQty;
        holding.qty = totalQty;
        holding.price = currentPrice;
        await holding.save({ session });

        req.log?.info(
          {
            ...orderContext,
            oldQty: holding.qty - parsedQty,
            newQty: holding.qty,
            avgPrice: holding.avg,
          },
          "Updated holding"
        );
      } else {
        // Create new holding
        holding = new HoldingsModel({
          userId,
          name: symbol,
          qty: parsedQty,
          avg: currentPrice,
          price: currentPrice,
        });
        await holding.save({ session });

        req.log?.info(
          {
            ...orderContext,
            qty: holding.qty,
            avgPrice: holding.avg,
          },
          "Created holding"
        );
      }

      // Create order record (within transaction)
      const order = new OrdersModel({
        userId,
        name: symbol,
        qty: parsedQty,
        price: currentPrice,
        mode: normalizedMode,
      });
      await order.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Get updated balance
      const newBalance = await WalletService.getBalance(userId);

      req.log?.info(
        {
          ...orderContext,
          orderId: order._id.toString(),
          newBalance,
        },
        "BUY order completed"
      );

      return res.status(201).json({
        success: true,
        message: "BUY order executed successfully",
        order: {
          id: order._id,
          symbol,
          qty: parsedQty,
          price: currentPrice,
          totalCost,
          mode: normalizedMode,
        },
        holding: {
          symbol: holding.name,
          qty: holding.qty,
          avgPrice: holding.avg,
          currentPrice: holding.price,
        },
        wallet: {
          previousBalance: balance,
          newBalance,
          amountDeducted: totalCost,
        },
      });
    } else if (normalizedMode === "SELL") {
      // Find holding (within transaction)
      const holding = await HoldingsModel.findOne({
        userId,
        name: symbol,
      }).session(session);

      if (!holding || holding.qty < parsedQty) {
        await session.abortTransaction();
        session.endSession();

        const availableQty = holding ? holding.qty : 0;
        req.log?.warn(
          {
            ...orderContext,
            error: "Insufficient quantity",
            available: availableQty,
            requested: parsedQty,
          },
          "SELL order failed"
        );

        const message =
          availableQty === 0
            ? `You don't own any shares of ${symbol}`
            : `You don't own enough shares to sell. Available: ${availableQty}, Requested: ${parsedQty}`;

        return res.status(400).json({
          success: false,
          message,
          details: {
            available: availableQty,
            requested: parsedQty,
          },
        });
      }

      // Calculate sale proceeds
      const saleProceeds = currentPrice * parsedQty;
      orderContext.totalProceeds = saleProceeds;

      // Get balance before transaction
      const previousBalance = await WalletService.getBalance(userId);

      // Credit to wallet (within transaction)
      await WalletService.processTransaction(
        userId,
        "SELL",
        saleProceeds,
        {
          symbol,
          quantity: parsedQty,
          price: currentPrice,
        },
        session
      );

      // Update holding
      holding.qty -= parsedQty;
      holding.price = currentPrice;

      // Save qty before potential deletion
      const remainingQty = holding.qty;
      const holdingData = {
        symbol: holding.name,
        qty: holding.qty,
        avgPrice: holding.avg,
        currentPrice: holding.price,
      };

      if (holding.qty === 0) {
        // Remove holding if quantity becomes zero (within transaction)
        await HoldingsModel.deleteOne({ _id: holding._id }).session(session);

        req.log?.info(
          {
            ...orderContext,
            reason: "Quantity reached zero",
          },
          "Deleted holding"
        );
      } else {
        await holding.save({ session });

        req.log?.info(
          {
            ...orderContext,
            oldQty: remainingQty + parsedQty,
            newQty: remainingQty,
          },
          "Updated holding"
        );
      }

      // Create order record (within transaction)
      const order = new OrdersModel({
        userId,
        name: symbol,
        qty: parsedQty,
        price: currentPrice,
        mode: normalizedMode,
      });
      await order.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Get updated balance
      const newBalance = await WalletService.getBalance(userId);

      req.log?.info(
        {
          ...orderContext,
          orderId: order._id.toString(),
          newBalance,
        },
        "SELL order completed"
      );

      return res.status(201).json({
        success: true,
        message: "SELL order executed successfully",
        order: {
          id: order._id,
          symbol,
          qty: parsedQty,
          price: currentPrice,
          totalProceeds: saleProceeds,
          mode: normalizedMode,
        },
        holding: remainingQty > 0 ? holdingData : null,
        wallet: {
          previousBalance,
          newBalance,
          amountCredited: saleProceeds,
        },
      });
    }
  } catch (error) {
    // Rollback transaction on any error
    await session.abortTransaction();
    session.endSession();

    // Log error with full context
    req.log?.error(
      {
        ...orderContext,
        error: error.message,
        stack: error.stack,
        errorType: error.name,
      },
      "Order processing failed - transaction rolled back"
    );

    return res.status(500).json({
      success: false,
      message: "Failed to process order",
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
      }),
    });
  }
});

// Centralized error handler - must be last middleware
app.use((err, req, res, next) => {
  if (req?.log) {
    req.log.error({ err }, "Unhandled error");
  } else {
    logger.error({ err }, "Unhandled error");
  }
  const status = err.status || 500;

  // Return standardized JSON error format
  res.status(status).json({
    success: false,
    message: err.message || "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

async function startServer() {
  try {
    await mongoose.connect(uri);
    logger.info("Database connected");

    // Connect MarketDataService to WebSocket server
    MarketDataService.setSocketIO(io, subscriptions);

    // Start market data auto-update with configurable interval
    const updateInterval =
      parseInt(process.env.PRICE_UPDATE_INTERVAL_MS) || 60000;
    logger.info({ updateInterval }, "Starting price update scheduler");
    MarketDataService.startAutoUpdate(updateInterval);

    server.listen(PORT, () => {
      logger.info({ port: PORT }, `Server listening`);
      logger.info({ port: PORT }, `WebSocket server ready`);
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to connect to MongoDB");
    process.exit(1);
  }
}

startServer();
