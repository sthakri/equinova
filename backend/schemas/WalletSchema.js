const { Schema } = require("mongoose");

// Transaction subdocument schema
const transactionSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["BUY", "SELL"],
      required: [true, "Transaction type is required"],
    },
    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
    },
    symbol: {
      type: String,
      required: [true, "Stock symbol is required"],
      uppercase: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    price: {
      type: Number,
      required: [true, "Price per unit is required"],
      min: [0, "Price cannot be negative"],
    },
    balanceAfter: {
      type: Number,
      required: [true, "Balance after transaction is required"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { _id: true } // Enable _id for subdocuments
);

// Main Wallet schema
const WalletSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true,
      index: true,
    },
    balance: {
      type: Number,
      default: 100000,
      required: true,
      min: [0, "Balance cannot be negative"],
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
      trim: true,
      enum: ["USD", "EUR", "GBP", "INR"],
    },
    transactions: {
      type: [transactionSchema],
      default: [],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Index for faster queries
WalletSchema.index({ userId: 1 });

// Virtual for total transactions count
WalletSchema.virtual("transactionCount").get(function () {
  return this.transactions.length;
});

// Method to add a transaction
WalletSchema.methods.addTransaction = function (transactionData) {
  this.transactions.push(transactionData);
  this.balance = transactionData.balanceAfter;
  return this.save();
};

// Method to get recent transactions
WalletSchema.methods.getRecentTransactions = function (limit = 10) {
  return this.transactions
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

// Static method to find wallet by userId
WalletSchema.statics.findByUserId = function (userId) {
  return this.findOne({ userId });
};

module.exports = WalletSchema;
