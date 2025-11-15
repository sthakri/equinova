const mongoose = require("mongoose");
const WalletSchema = require("../schemas/WalletSchema");

const WalletModel =
  mongoose.models.Wallet || mongoose.model("Wallet", WalletSchema);

module.exports = { WalletModel };
