// WebSocket Test Client
const io = require("socket.io-client");

const socket = io("http://localhost:3002", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);

  // Subscribe to watchlist
  const symbols = ["INFY", "TCS", "WIPRO"];
  console.log(`📊 Subscribing to: ${symbols.join(", ")}`);
  socket.emit("subscribe_watchlist", symbols);
});

socket.on("watchlist_update", (data) => {
  console.log("\n📈 Watchlist Update Received:");
  data.forEach((item) => {
    const arrow = item.isDown ? "📉" : "📈";
    console.log(
      `  ${arrow} ${item.symbol}: ₹${item.price} (${
        item.changePercent >= 0 ? "+" : ""
      }${item.changePercent}%)`
    );
  });
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from server");
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error.message);
});

// Keep the script running
console.log("🔌 Connecting to WebSocket server...");
console.log("Press Ctrl+C to exit\n");

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n🛑 Shutting down...");
  socket.disconnect();
  process.exit(0);
});
