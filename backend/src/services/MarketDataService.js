/**
 * Market Data Service
 * Simulates real-time stock price updates with random walk algorithm
 */

class MarketDataService {
  constructor() {
    // Define demo symbols with base prices (Indian stocks)
    this.baseSymbols = {
      INFY: 1450.0,
      TCS: 3200.0,
      WIPRO: 450.0,
      HDFCBANK: 1600.0,
      RELIANCE: 2400.0,
      BHARTIARTL: 850.0,
      ITC: 420.0,
      SBIN: 580.0,
      TATAMOTORS: 650.0,
      ASIANPAINT: 3100.0,
      HINDUNILVR: 2500.0,
      MARUTI: 9500.0,
      LT: 2800.0,
      KOTAKBANK: 1750.0,
      ICICIBANK: 950.0,
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
    console.log("📡 MarketDataService connected to WebSocket server");
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

    console.log(`Market data auto-update started (interval: ${intervalMs}ms)`);
  }

  /**
   * Stop auto-update interval
   */
  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log("Market data auto-update stopped");
    }
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
