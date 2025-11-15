const { WalletModel } = require("../../model/WalletModel");

class WalletService {
  // Find existing wallet or create new one with 100000 starting balance
  async getOrCreateWallet(userId) {
    let wallet = await WalletModel.findOne({ userId });

    if (!wallet) {
      wallet = await WalletModel.create({
        userId,
        balance: 100000,
        currency: "USD",
      });
    }

    return wallet;
  }

  // Get current wallet balance
  async getBalance(userId) {
    const wallet = await this.getOrCreateWallet(userId);
    return wallet.balance;
  }

  // Process buy/sell transaction
  async processTransaction(userId, type, amount, details) {
    const wallet = await this.getOrCreateWallet(userId);

    // Validate transaction type
    if (!["BUY", "SELL"].includes(type)) {
      throw new Error("Invalid transaction type. Must be BUY or SELL");
    }

    // Calculate new balance
    const newBalance =
      type === "BUY" ? wallet.balance - amount : wallet.balance + amount;

    // Check if user has sufficient balance for BUY
    if (type === "BUY" && newBalance < 0) {
      throw new Error("Insufficient balance");
    }

    // Create transaction record
    const transaction = {
      type,
      amount,
      symbol: details.symbol,
      quantity: details.quantity,
      price: details.price,
      balanceAfter: newBalance,
      timestamp: new Date(),
    };

    // Update wallet
    wallet.transactions.push(transaction);
    wallet.balance = newBalance;
    await wallet.save();

    return {
      success: true,
      balance: wallet.balance,
      transaction,
    };
  }

  // Get transaction history
  async getTransactionHistory(userId, limit = 10) {
    const wallet = await this.getOrCreateWallet(userId);

    // Sort by timestamp descending and limit results
    const transactions = wallet.transactions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    return transactions;
  }
}

module.exports = new WalletService();
