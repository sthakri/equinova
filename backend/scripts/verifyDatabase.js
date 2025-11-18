require("dotenv").config();
const mongoose = require("mongoose");
const { UserModel } = require("../model/UserModel");
const { HoldingsModel } = require("../model/HoldingsModel");
const { OrdersModel } = require("../model/OrdersModel");
const { WalletModel } = require("../model/WalletModel");

const uri = process.env.MONGO_URL;

async function verifyDatabase() {
  try {
    console.log("🔍 Verifying database state...\n");
    await mongoose.connect(uri);

    // Count all collections
    const userCount = await UserModel.countDocuments();
    const holdingsCount = await HoldingsModel.countDocuments();
    const ordersCount = await OrdersModel.countDocuments();
    const walletCount = await WalletModel.countDocuments();

    console.log("📊 Database State:");
    console.log("==================");
    console.log(`Users:     ${userCount}`);
    console.log(`Holdings:  ${holdingsCount}`);
    console.log(`Orders:    ${ordersCount}`);
    console.log(`Wallets:   ${walletCount}`);
    console.log("");

    const isClean =
      userCount === 0 &&
      holdingsCount === 0 &&
      ordersCount === 0 &&
      walletCount === 0;

    if (isClean) {
      console.log("✅ SUCCESS: Database is clean and ready for production!");
      console.log("   All collections are empty.");
      console.log("");
      console.log("🚀 Next Steps:");
      console.log("   1. Start the backend server: npm start");
      console.log("   2. Visit http://localhost:3000 to register new users");
      console.log("   3. Start trading with the 15 available stocks!");
      process.exit(0);
    } else {
      console.log("⚠️  WARNING: Database is not completely clean!");
      console.log("   Run: node scripts/resetDatabase.js");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error verifying database:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

verifyDatabase();
