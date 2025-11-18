/**
 * Market Data Service
 * Simulates real-time stock price updates with random walk algorithm
 */

const logger = require("../util/logger");

class MarketDataService {
  constructor() {
    // Define demo symbols with base prices (US stocks)
    this.baseSymbols = {
      // Technology
      AAPL: 178.5,
      MSFT: 380.0,
      GOOGL: 142.5,
      AMZN: 155.75,
      META: 485.0,
      TSLA: 242.8,
      NVDA: 495.0,
      ORCL: 115.2,
      ADBE: 560.0,
      CRM: 285.5,
      INTC: 42.75,
      AMD: 145.3,
      NFLX: 485.0,
      AVGO: 925.0,
      CSCO: 52.5,

      // Finance
      JPM: 162.5,
      BAC: 34.8,
      WFC: 48.25,
      GS: 425.0,
      MS: 98.5,
      C: 58.75,
      AXP: 195.0,
      BLK: 785.0,
      SCHW: 68.5,

      // Healthcare
      JNJ: 158.5,
      UNH: 525.0,
      PFE: 28.75,
      ABBV: 168.5,
      MRK: 112.25,
      TMO: 545.0,
      ABT: 108.5,
      LLY: 625.0,

      // Consumer
      WMT: 168.5,
      HD: 385.0,
      MCD: 295.5,
      NKE: 92.75,
      SBUX: 98.5,
      TGT: 145.0,
      COST: 745.0,
      LOW: 245.0,

      // Industrial & Energy
      BA: 182.5,
      CAT: 345.0,
      XOM: 112.5,
      CVX: 158.75,

      // Communication
      DIS: 98.5,
      CMCSA: 42.75,
      T: 18.5,
      VZ: 41.25,
    };

    // Initialize current prices with base prices
    this.currentPrices = new Map();
    this.priceHistory = new Map();

    // Initialize all symbols
    Object.entries(this.baseSymbols).forEach(([symbol, basePrice]) => {
      this.currentPrices.set(symbol, {
        symbol,
        price: basePrice,
        basePrice,
        change: 0,
        changePercent: 0,
        isDown: false,
        lastUpdated: new Date(),
      });
      this.priceHistory.set(symbol, [basePrice]);
    });

    // Auto-update prices every 3 seconds
    this.updateInterval = null;

    // Store reference to Socket.IO and subscriptions
    this.io = null;
    this.subscriptions = null;
  }

  /**
   * Set Socket.IO instance for broadcasting updates
   */
  setSocketIO(io, subscriptions) {
    this.io = io;
    this.subscriptions = subscriptions;
    logger.info("MarketDataService connected to WebSocket server");
  }

  /**
   * Random number generator between min and max
   */
  randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Update price for a single symbol using random walk
   */
  updateSymbolPrice(symbol) {
    const symbolData = this.currentPrices.get(symbol);
    if (!symbolData) return null;

    const { price: currentPrice, basePrice } = symbolData;

    // Random walk: ±2% per update
    const changePercent = this.randomBetween(-0.02, 0.02);
    let newPrice = currentPrice * (1 + changePercent);

    // Enforce bounds: ±30% from base price
    const lowerBound = basePrice * 0.7;
    const upperBound = basePrice * 1.3;

    if (newPrice < lowerBound) {
      newPrice = lowerBound + Math.random() * (basePrice * 0.05);
    } else if (newPrice > upperBound) {
      newPrice = upperBound - Math.random() * (basePrice * 0.05);
    }

    // Round to 2 decimal places
    newPrice = Math.round(newPrice * 100) / 100;

    // Calculate change from base price
    const change = newPrice - basePrice;
    const changePercentFromBase = ((change / basePrice) * 100).toFixed(2);
    const isDown = change < 0;

    // Update price data
    const updatedData = {
      symbol,
      price: newPrice,
      basePrice,
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercentFromBase),
      isDown,
      lastUpdated: new Date(),
    };

    this.currentPrices.set(symbol, updatedData);

    // Store in history (keep last 100 prices)
    const history = this.priceHistory.get(symbol) || [];
    history.push(newPrice);
    if (history.length > 100) {
      history.shift();
    }
    this.priceHistory.set(symbol, history);

    return updatedData;
  }

  /**
   * Update all symbol prices
   */
  updateAllPrices() {
    const symbols = Array.from(this.currentPrices.keys());
    const updates = {};

    symbols.forEach((symbol) => {
      const updated = this.updateSymbolPrice(symbol);
      if (updated) {
        updates[symbol] = updated;
      }
    });

    // Broadcast updates to subscribed WebSocket clients
    this.broadcastToSubscribers();

    return updates;
  }

  /**
   * Broadcast price updates to subscribed WebSocket clients
   */
  broadcastToSubscribers() {
    if (!this.io || !this.subscriptions) {
      return;
    }

    // Iterate through all subscriptions
    this.subscriptions.forEach((symbols, socketId) => {
      // Get current prices for subscribed symbols
      const updates = symbols
        .map((symbol) => this.getPrice(symbol))
        .filter((data) => data !== null);

      // Emit to specific client
      if (updates.length > 0) {
        this.io.to(socketId).emit("watchlist_update", updates);
      }
    });
  }

  /**
   * Get current price for a single symbol
   */
  getPrice(symbol) {
    const data = this.currentPrices.get(symbol.toUpperCase());
    if (!data) {
      return null;
    }
    return data;
  }

  /**
   * Get all current prices
   */
  getAllPrices() {
    const prices = [];
    this.currentPrices.forEach((data) => {
      prices.push(data);
    });
    return prices;
  }

  /**
   * Get prices formatted for watchlist
   */
  getWatchlistPrices() {
    const prices = this.getAllPrices();
    return prices.map((item) => ({
      name: item.symbol,
      price: item.price,
      percent: `${item.changePercent >= 0 ? "+" : ""}${item.changePercent}%`,
      isDown: item.isDown,
    }));
  }

  /**
   * Get base price for a symbol
   */
  getBasePrice(symbol) {
    return this.baseSymbols[symbol.toUpperCase()] || null;
  }

  /**
   * Get all available symbols
   */
  getSymbols() {
    return Object.keys(this.baseSymbols);
  }

  /**
   * Reset a symbol to its base price
   */
  resetSymbol(symbol) {
    const basePrice = this.baseSymbols[symbol.toUpperCase()];
    if (!basePrice) return null;

    const resetData = {
      symbol: symbol.toUpperCase(),
      price: basePrice,
      basePrice,
      change: 0,
      changePercent: 0,
      isDown: false,
      lastUpdated: new Date(),
    };

    this.currentPrices.set(symbol.toUpperCase(), resetData);
    this.priceHistory.set(symbol.toUpperCase(), [basePrice]);

    return resetData;
  }

  /**
   * Reset all symbols to base prices
   */
  resetAllPrices() {
    Object.entries(this.baseSymbols).forEach(([symbol, basePrice]) => {
      this.resetSymbol(symbol);
    });
    return this.getAllPrices();
  }

  /**
   * Start auto-update interval (updates every 3 seconds)
   */
  startAutoUpdate(intervalMs = 3000) {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.updateAllPrices();
    }, intervalMs);

    logger.info({ intervalMs }, "Market data auto-update started");
  }

  /**
   * Stop auto-update interval
   */
  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      logger.info("Market data auto-update stopped");
    }
  }

  /**
   * Whether the market data auto-update interval is active
   */
  isActive() {
    return Boolean(this.updateInterval);
  }

  /**
   * Get price history for a symbol
   */
  getPriceHistory(symbol, limit = 50) {
    const history = this.priceHistory.get(symbol.toUpperCase());
    if (!history) return [];

    return history.slice(-limit);
  }
}

// Export singleton instance
module.exports = new MarketDataService();
