require("dotenv").config();

const express = require("express");
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
const dashboardUrl = process.env.DASHBOARD_URL || "http://localhost:3000";

const defaultOrigins = [
  dashboardUrl,
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];

const extraOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...new Set([...defaultOrigins, ...extraOrigins]),
].filter(Boolean);

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
  console.log(`✅ Client connected: ${socket.id}`);

  // Handle watchlist subscription
  socket.on("subscribe_watchlist", (symbols) => {
    if (Array.isArray(symbols) && symbols.length > 0) {
      // Validate symbols
      const validSymbols = symbols
        .map((s) => s.toUpperCase().trim())
        .filter((s) => MarketDataService.getPrice(s) !== null);

      subscriptions.set(socket.id, validSymbols);
      console.log(
        `📊 Client ${socket.id} subscribed to: ${validSymbols.join(", ")}`
      );

      // Send initial data immediately
      const initialData = validSymbols.map((symbol) =>
        MarketDataService.getPrice(symbol)
      );
      socket.emit("watchlist_update", initialData);
    } else {
      console.warn(
        `⚠️  Client ${socket.id} sent invalid subscription:`,
        symbols
      );
    }
  });

  // Handle unsubscribe
  socket.on("unsubscribe_watchlist", () => {
    if (subscriptions.has(socket.id)) {
      const symbols = subscriptions.get(socket.id);
      subscriptions.delete(socket.id);
      console.log(
        `🔕 Client ${socket.id} unsubscribed from: ${symbols.join(", ")}`
      );
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    if (subscriptions.has(socket.id)) {
      const symbols = subscriptions.get(socket.id);
      subscriptions.delete(socket.id);
      console.log(
        `❌ Client ${socket.id} disconnected (was subscribed to: ${symbols.join(
          ", "
        )})`
      );
    } else {
      console.log(`❌ Client ${socket.id} disconnected`);
    }
  });
});

// Export subscriptions and io for use in other modules
app.set("subscriptions", subscriptions);

// Security: Hide X-Powered-By header
app.disable("x-powered-by");

// Security: Helmet middleware - must be first
app.use(helmet());

// CORS configuration with credentials support
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (process.env.NODE_ENV !== "production") {
        console.warn(`Allowing non-configured origin in dev: ${origin}`);
        return callback(null, true);
      }

      console.warn(`Blocked origin by CORS policy: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Body parser and cookie parser middleware
app.use(express.json());
app.use(cookieParser());

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

app.get("/allHoldings", async (req, res) => {
  try {
    const allHoldings = await HoldingsModel.find({});
    res.json(allHoldings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch holdings" });
  }
});

//   tempHoldings.forEach((item) => {
//     let newHolding = new HoldingsModel({
//     newHolding.save();

//   tempPositions.forEach((item) => {
//     let newPosition = new PositionsModel({

//     newPosition.save();

app.get("/allHoldings", async (req, res) => {
  try {
    const allHoldings = await HoldingsModel.find({});
    res.json(allHoldings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch holdings" });
  }
});

app.get("/holdings/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const holding = await HoldingsModel.findOne({ name: symbol });

    if (!holding) {
      return res.status(404).json({ message: "Holding not found" });
    }

    res.json(holding);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch holding" });
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
    console.error("Error fetching market prices:", error);
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
    console.error("Error fetching price:", error);
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
    console.error("Error fetching all market data:", error);
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
    console.error("Error fetching symbols:", error);
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
    console.error("Error fetching watchlist:", error);
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
    console.error("Error resetting prices:", error);
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

app.post("/newOrder", async (req, res) => {
  const { name, qty, price, mode } = req.body;
  const parsedQty = Number(qty);
  const parsedPrice = Number(price);
  const normalizedMode = typeof mode === "string" ? mode.toUpperCase() : null;

  if (
    !name ||
    !normalizedMode ||
    !Number.isFinite(parsedQty) ||
    parsedQty <= 0
  ) {
    return res.status(400).json({ message: "Invalid order payload" });
  }

  try {
    if (normalizedMode === "SELL") {
      const holding = await HoldingsModel.findOne({ name });

      if (!holding || holding.qty < parsedQty) {
        return res
          .status(400)
          .json({ message: "Insufficient quantity available to sell" });
      }

      holding.qty -= parsedQty;
      await holding.save();
    }

    const newOrder = new OrdersModel({
      name,
      qty: parsedQty,
      price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
      mode: normalizedMode,
    });

    await newOrder.save();
    res.status(201).json({ message: "Order saved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save order" });
  }
});

// Centralized error handler - must be last middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error", err);
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
    console.log("dbConnected");

    // Connect MarketDataService to WebSocket server
    MarketDataService.setSocketIO(io, subscriptions);

    // Start market data auto-update with configurable interval
    const updateInterval =
      parseInt(process.env.PRICE_UPDATE_INTERVAL_MS) || 60000;
    console.log(
      `Starting price update scheduler with ${updateInterval}ms interval (${
        updateInterval / 1000
      }s)`
    );
    MarketDataService.startAutoUpdate(updateInterval);

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      console.log(`WebSocket server ready on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  }
}

startServer();
