require("dotenv").config();
const mongoose = require("mongoose");
const { UserModel } = require("../model/UserModel");
const { HoldingsModel } = require("../model/HoldingsModel");
const { OrdersModel } = require("../model/OrdersModel");
const { WalletModel } = require("../model/WalletModel");

const uri = process.env.MONGO_URL;

async function resetDatabase() {
  try {
    console.log("========================================");
    console.log("  DATABASE CLEANUP FOR PRODUCTION");
    console.log("========================================\n");

    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("✓ Connected to MongoDB\n");

    // Get collection stats before deletion
    const userCount = await UserModel.countDocuments();
    const holdingsCount = await HoldingsModel.countDocuments();
    const ordersCount = await OrdersModel.countDocuments();
    const walletCount = await WalletModel.countDocuments();

    console.log("📊 Current database state:");
    console.log(`   Users:     ${userCount}`);
    console.log(`   Holdings:  ${holdingsCount}`);
    console.log(`   Orders:    ${ordersCount}`);
    console.log(`   Wallets:   ${walletCount}`);
    console.log("");

    // Delete all data
    console.log("🧹 Cleaning database...");
    await UserModel.deleteMany({});
    console.log("   ✓ Deleted all users");

    await HoldingsModel.deleteMany({});
    console.log("   ✓ Deleted all holdings");

    await OrdersModel.deleteMany({});
    console.log("   ✓ Deleted all orders");

    await WalletModel.deleteMany({});
    console.log("   ✓ Deleted all wallets");
    console.log("");

    // Verify deletion
    const finalUserCount = await UserModel.countDocuments();
    const finalHoldingsCount = await HoldingsModel.countDocuments();
    const finalOrdersCount = await OrdersModel.countDocuments();
    const finalWalletCount = await WalletModel.countDocuments();

    console.log("✅ Database cleaned successfully!");
    console.log("📊 Final database state:");
    console.log(`   Users:     ${finalUserCount}`);
    console.log(`   Holdings:  ${finalHoldingsCount}`);
    console.log(`   Orders:    ${finalOrdersCount}`);
    console.log(`   Wallets:   ${finalWalletCount}`);
    console.log("");

    console.log("========================================");
    console.log("  ✨ PRODUCTION READY ✨");
    console.log("========================================\n");

    console.log("📈 Available Stock Symbols (50 US Stocks):");
    console.log("─────────────────────────────────────────");
    console.log(
      "Technology: AAPL, MSFT, GOOGL, AMZN, META, NVDA, TSLA, NFLX, ADBE, CRM"
    );
    console.log("Finance:    JPM, BAC, WFC, GS, MS, C, BLK, AXP, V, MA");
    console.log(
      "Healthcare: JNJ, UNH, PFE, ABBV, TMO, MRK, LLY, ABT, DHR, BMY"
    );
    console.log("Consumer:   WMT, HD, MCD, NKE, SBUX, PG, KO, PEP, COST, TGT");
    console.log("Industrial: BA, CAT, GE, MMM, UPS, HON, LMT, RTX, DE, UNP");
    console.log("");
    console.log("💡 Notes:");
    console.log("   • Stock prices are managed in-memory by MarketDataService");
    console.log("   • Prices update automatically via WebSocket");
    console.log("   • No database seeding required for watchlist");
    console.log("   • New users will start with clean state");
    console.log("");
    console.log("🚀 Next Steps:");
    console.log("   1. Review README.md (Deployment section)");
    console.log("   2. Configure environment variables on hosting platforms");
    console.log("   3. Deploy backend (Render), dashboard & frontend (Vercel)");
    console.log("   4. Test complete user flow");
    console.log("");
  } catch (error) {
    console.error("❌ Error resetting database:", error.message);
    console.error("\nTroubleshooting:");
    console.error("  • Check MONGO_URL in .env file");
    console.error("  • Verify MongoDB Atlas network access");
    console.error("  • Confirm database user credentials");
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("✓ Database connection closed\n");
  }
}

// Run the script
console.log("\n🔧 Starting database cleanup...\n");
resetDatabase();
