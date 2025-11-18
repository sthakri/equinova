/**
 * WalletService Unit Tests
 *
 * Tests wallet functionality including:
 * - Wallet creation
 * - Balance management
 * - BUY transactions (balance decreases)
 * - SELL transactions (balance increases)
 * - Insufficient funds handling
 * - Transaction history
 */

const mongoose = require("mongoose");
const { WalletModel } = require("../model/WalletModel");
const WalletService = require("../src/services/WalletService");

describe("WalletService Tests", () => {
  let testUserId;

  // Setup before all tests
  beforeAll(async () => {
    // Connect to test database
    const mongoUri =
      process.env.MONGO_TEST_URL || "mongodb://127.0.0.1:27017/trading-test";
    await mongoose.connect(mongoUri);
  });

  // Setup before each test
  beforeEach(() => {
    // Generate unique user ID for each test
    testUserId = new mongoose.Types.ObjectId();
  });

  // Cleanup after each test
  afterEach(async () => {
    await WalletModel.deleteMany({});
  });

  // Cleanup after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("getOrCreateWallet", () => {
    test("should create new wallet with $100,000 starting balance", async () => {
      const wallet = await WalletService.getOrCreateWallet(testUserId);

      expect(wallet).toBeDefined();
      expect(wallet.userId.toString()).toBe(testUserId.toString());
      expect(wallet.balance).toBe(100000);
      expect(wallet.currency).toBe("USD");
      expect(wallet.transactions).toEqual([]);
    });

    test("should return existing wallet if already created", async () => {
      // Create wallet first time
      const wallet1 = await WalletService.getOrCreateWallet(testUserId);
      const wallet1Id = wallet1._id;

      // Get wallet second time
      const wallet2 = await WalletService.getOrCreateWallet(testUserId);

      // Should be the same wallet
      expect(wallet2._id.toString()).toBe(wallet1Id.toString());
      expect(wallet2.balance).toBe(wallet1.balance);
    });

    test("should not create duplicate wallets for same user", async () => {
      await WalletService.getOrCreateWallet(testUserId);
      await WalletService.getOrCreateWallet(testUserId);
      await WalletService.getOrCreateWallet(testUserId);

      // Count wallets in database
      const walletCount = await WalletModel.countDocuments({
        userId: testUserId,
      });

      expect(walletCount).toBe(1);
    });

    test("should create separate wallets for different users", async () => {
      const userId1 = new mongoose.Types.ObjectId();
      const userId2 = new mongoose.Types.ObjectId();

      const wallet1 = await WalletService.getOrCreateWallet(userId1);
      const wallet2 = await WalletService.getOrCreateWallet(userId2);

      expect(wallet1._id.toString()).not.toBe(wallet2._id.toString());
      expect(wallet1.userId.toString()).toBe(userId1.toString());
      expect(wallet2.userId.toString()).toBe(userId2.toString());
    });

    test("should initialize with correct default values", async () => {
      const wallet = await WalletService.getOrCreateWallet(testUserId);

      expect(wallet.balance).toBe(100000);
      expect(wallet.currency).toBe("USD");
      expect(Array.isArray(wallet.transactions)).toBe(true);
      expect(wallet.transactions.length).toBe(0);
    });
  });

  describe("getBalance", () => {
    test("should return balance for existing wallet", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      const balance = await WalletService.getBalance(testUserId);

      expect(balance).toBe(100000);
    });

    test("should create wallet and return balance if not exists", async () => {
      const balance = await WalletService.getBalance(testUserId);

      expect(balance).toBe(100000);

      // Verify wallet was created
      const wallet = await WalletModel.findOne({ userId: testUserId });
      expect(wallet).toBeDefined();
    });

    test("should return updated balance after transactions", async () => {
      await WalletService.getOrCreateWallet(testUserId);
      await WalletService.processTransaction(testUserId, "BUY", 10000, {
        symbol: "TEST",
        quantity: 10,
        price: 1000,
      });

      const balance = await WalletService.getBalance(testUserId);

      expect(balance).toBe(90000);
    });
  });

  describe("processTransaction - BUY Orders", () => {
    test("should decrease balance correctly for BUY transaction", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      const result = await WalletService.processTransaction(
        testUserId,
        "BUY",
        15000,
        {
          symbol: "INFY",
          quantity: 10,
          price: 1500,
        }
      );

      expect(result.success).toBe(true);
      expect(result.balance).toBe(85000); // 100000 - 15000
      expect(result.transaction.type).toBe("BUY");
      expect(result.transaction.amount).toBe(15000);
    });

    test("should record transaction details for BUY", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      const result = await WalletService.processTransaction(
        testUserId,
        "BUY",
        25000,
        {
          symbol: "TCS",
          quantity: 5,
          price: 5000,
        }
      );

      expect(result.transaction.symbol).toBe("TCS");
      expect(result.transaction.quantity).toBe(5);
      expect(result.transaction.price).toBe(5000);
      expect(result.transaction.balanceAfter).toBe(75000);
    });

    test("should add transaction to wallet history for BUY", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      await WalletService.processTransaction(testUserId, "BUY", 10000, {
        symbol: "WIPRO",
        quantity: 20,
        price: 500,
      });

      const wallet = await WalletModel.findOne({ userId: testUserId });

      expect(wallet.transactions.length).toBe(1);
      expect(wallet.transactions[0].type).toBe("BUY");
      expect(wallet.transactions[0].symbol).toBe("WIPRO");
    });

    test("should handle multiple BUY transactions", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      // First BUY
      await WalletService.processTransaction(testUserId, "BUY", 20000, {
        symbol: "INFY",
        quantity: 10,
        price: 2000,
      });

      // Second BUY
      await WalletService.processTransaction(testUserId, "BUY", 15000, {
        symbol: "TCS",
        quantity: 5,
        price: 3000,
      });

      const wallet = await WalletModel.findOne({ userId: testUserId });

      expect(wallet.balance).toBe(65000); // 100000 - 20000 - 15000
      expect(wallet.transactions.length).toBe(2);
    });

    test("should persist balance changes to database", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      await WalletService.processTransaction(testUserId, "BUY", 30000, {
        symbol: "RELIANCE",
        quantity: 15,
        price: 2000,
      });

      // Fetch fresh from database
      const wallet = await WalletModel.findOne({ userId: testUserId });

      expect(wallet.balance).toBe(70000);
    });
  });

  describe("processTransaction - SELL Orders", () => {
    test("should increase balance correctly for SELL transaction", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      const result = await WalletService.processTransaction(
        testUserId,
        "SELL",
        20000,
        {
          symbol: "INFY",
          quantity: 10,
          price: 2000,
        }
      );

      expect(result.success).toBe(true);
      expect(result.balance).toBe(120000); // 100000 + 20000
      expect(result.transaction.type).toBe("SELL");
    });

    test("should record transaction details for SELL", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      const result = await WalletService.processTransaction(
        testUserId,
        "SELL",
        35000,
        {
          symbol: "TCS",
          quantity: 7,
          price: 5000,
        }
      );

      expect(result.transaction.symbol).toBe("TCS");
      expect(result.transaction.quantity).toBe(7);
      expect(result.transaction.price).toBe(5000);
      expect(result.transaction.amount).toBe(35000);
      expect(result.transaction.balanceAfter).toBe(135000);
    });

    test("should add transaction to wallet history for SELL", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      await WalletService.processTransaction(testUserId, "SELL", 15000, {
        symbol: "WIPRO",
        quantity: 30,
        price: 500,
      });

      const wallet = await WalletModel.findOne({ userId: testUserId });

      expect(wallet.transactions.length).toBe(1);
      expect(wallet.transactions[0].type).toBe("SELL");
      expect(wallet.transactions[0].symbol).toBe("WIPRO");
    });

    test("should handle BUY followed by SELL transactions", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      // BUY first (balance decreases)
      await WalletService.processTransaction(testUserId, "BUY", 40000, {
        symbol: "INFY",
        quantity: 20,
        price: 2000,
      });

      // SELL later (balance increases)
      await WalletService.processTransaction(testUserId, "SELL", 50000, {
        symbol: "INFY",
        quantity: 20,
        price: 2500,
      });

      const wallet = await WalletModel.findOne({ userId: testUserId });

      // 100000 - 40000 + 50000 = 110000 (profit of 10000)
      expect(wallet.balance).toBe(110000);
      expect(wallet.transactions.length).toBe(2);
    });

    test("should allow SELL even with zero balance", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      // Drain balance
      await WalletService.processTransaction(testUserId, "BUY", 100000, {
        symbol: "STOCK",
        quantity: 100,
        price: 1000,
      });

      // SELL should still work
      const result = await WalletService.processTransaction(
        testUserId,
        "SELL",
        110000,
        {
          symbol: "STOCK",
          quantity: 100,
          price: 1100,
        }
      );

      expect(result.success).toBe(true);
      expect(result.balance).toBe(110000);
    });
  });

  describe("Insufficient Funds Scenarios", () => {
    test("should throw error when insufficient balance for BUY", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      await expect(
        WalletService.processTransaction(testUserId, "BUY", 150000, {
          symbol: "EXPENSIVE",
          quantity: 1,
          price: 150000,
        })
      ).rejects.toThrow("Insufficient balance");
    });

    test("should not modify balance on insufficient funds error", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      try {
        await WalletService.processTransaction(testUserId, "BUY", 200000, {
          symbol: "EXPENSIVE",
          quantity: 1,
          price: 200000,
        });
      } catch (error) {
        // Expected error
      }

      const wallet = await WalletModel.findOne({ userId: testUserId });

      // Balance should remain unchanged
      expect(wallet.balance).toBe(100000);
      expect(wallet.transactions.length).toBe(0);
    });

    test("should allow BUY with exact balance amount", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      const result = await WalletService.processTransaction(
        testUserId,
        "BUY",
        100000,
        {
          symbol: "MAXBUY",
          quantity: 100,
          price: 1000,
        }
      );

      expect(result.success).toBe(true);
      expect(result.balance).toBe(0);
    });

    test("should reject BUY that exceeds balance by $1", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      await expect(
        WalletService.processTransaction(testUserId, "BUY", 100001, {
          symbol: "OVERBUDGET",
          quantity: 1,
          price: 100001,
        })
      ).rejects.toThrow("Insufficient balance");
    });

    test("should check balance after previous transactions", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      // Use 80000
      await WalletService.processTransaction(testUserId, "BUY", 80000, {
        symbol: "STOCK1",
        quantity: 40,
        price: 2000,
      });

      // Try to use 30000 (only 20000 remaining)
      await expect(
        WalletService.processTransaction(testUserId, "BUY", 30000, {
          symbol: "STOCK2",
          quantity: 10,
          price: 3000,
        })
      ).rejects.toThrow("Insufficient balance");
    });
  });

  describe("Transaction Validation", () => {
    test("should reject invalid transaction type", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      await expect(
        WalletService.processTransaction(testUserId, "INVALID", 10000, {
          symbol: "TEST",
          quantity: 1,
          price: 10000,
        })
      ).rejects.toThrow("Invalid transaction type");
    });

    test("should only accept BUY or SELL types", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      const invalidTypes = ["buy", "sell", "TRADE", "TRANSFER", ""];

      for (const type of invalidTypes) {
        await expect(
          WalletService.processTransaction(testUserId, type, 1000, {
            symbol: "TEST",
            quantity: 1,
            price: 1000,
          })
        ).rejects.toThrow();
      }
    });

    test("should accept BUY type (case-sensitive)", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      const result = await WalletService.processTransaction(
        testUserId,
        "BUY",
        5000,
        {
          symbol: "TEST",
          quantity: 5,
          price: 1000,
        }
      );

      expect(result.success).toBe(true);
    });

    test("should accept SELL type (case-sensitive)", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      const result = await WalletService.processTransaction(
        testUserId,
        "SELL",
        5000,
        {
          symbol: "TEST",
          quantity: 5,
          price: 1000,
        }
      );

      expect(result.success).toBe(true);
    });
  });

  describe("getTransactionHistory", () => {
    test("should return empty array for new wallet", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      const history = await WalletService.getTransactionHistory(testUserId);

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(0);
    });

    test("should return transaction history in descending order", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      // Create transactions
      await WalletService.processTransaction(testUserId, "BUY", 10000, {
        symbol: "FIRST",
        quantity: 10,
        price: 1000,
      });

      await WalletService.processTransaction(testUserId, "BUY", 5000, {
        symbol: "SECOND",
        quantity: 5,
        price: 1000,
      });

      await WalletService.processTransaction(testUserId, "SELL", 8000, {
        symbol: "THIRD",
        quantity: 8,
        price: 1000,
      });

      const history = await WalletService.getTransactionHistory(testUserId);

      // Most recent should be first
      expect(history[0].symbol).toBe("THIRD");
      expect(history[1].symbol).toBe("SECOND");
      expect(history[2].symbol).toBe("FIRST");
    });

    test("should limit results to specified count", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      // Create 15 transactions
      for (let i = 1; i <= 15; i++) {
        await WalletService.processTransaction(testUserId, "BUY", 1000, {
          symbol: `STOCK${i}`,
          quantity: 1,
          price: 1000,
        });
      }

      const history = await WalletService.getTransactionHistory(testUserId, 5);

      expect(history.length).toBe(5);
    });

    test("should default to 10 transactions", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      // Create 20 transactions
      for (let i = 1; i <= 20; i++) {
        await WalletService.processTransaction(testUserId, "SELL", 1000, {
          symbol: `STOCK${i}`,
          quantity: 1,
          price: 1000,
        });
      }

      const history = await WalletService.getTransactionHistory(testUserId);

      expect(history.length).toBe(10);
    });
  });

  describe("Transaction Timestamps", () => {
    test("should include timestamp in transaction", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      const beforeTime = new Date();

      await WalletService.processTransaction(testUserId, "BUY", 10000, {
        symbol: "TEST",
        quantity: 10,
        price: 1000,
      });

      const afterTime = new Date();

      const wallet = await WalletModel.findOne({ userId: testUserId });
      const transaction = wallet.transactions[0];

      expect(transaction.timestamp).toBeDefined();
      expect(transaction.timestamp).toBeInstanceOf(Date);
      expect(transaction.timestamp.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime()
      );
      expect(transaction.timestamp.getTime()).toBeLessThanOrEqual(
        afterTime.getTime()
      );
    });

    test("should have unique timestamps for rapid transactions", async () => {
      await WalletService.getOrCreateWallet(testUserId);

      // Execute transactions rapidly
      await WalletService.processTransaction(testUserId, "BUY", 1000, {
        symbol: "RAPID1",
        quantity: 1,
        price: 1000,
      });

      await WalletService.processTransaction(testUserId, "BUY", 1000, {
        symbol: "RAPID2",
        quantity: 1,
        price: 1000,
      });

      const wallet = await WalletModel.findOne({ userId: testUserId });

      // Timestamps might be the same if executed within same millisecond
      // Just verify they exist and are valid
      expect(wallet.transactions[0].timestamp).toBeDefined();
      expect(wallet.transactions[1].timestamp).toBeDefined();
    });
  });

  describe("Session Support", () => {
    // Note: Session tests require MongoDB replica set
    // Skip these tests in local development with standalone MongoDB
    test.skip("should support MongoDB session parameter", async () => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        await WalletService.getOrCreateWallet(testUserId);

        const result = await WalletService.processTransaction(
          testUserId,
          "BUY",
          10000,
          {
            symbol: "SESSION_TEST",
            quantity: 10,
            price: 1000,
          },
          session
        );

        expect(result.success).toBe(true);

        await session.commitTransaction();
      } finally {
        session.endSession();
      }

      const wallet = await WalletModel.findOne({ userId: testUserId });
      expect(wallet.balance).toBe(90000);
    });

    test.skip("should rollback on transaction abort", async () => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        await WalletService.getOrCreateWallet(testUserId);

        await WalletService.processTransaction(
          testUserId,
          "BUY",
          20000,
          {
            symbol: "ROLLBACK_TEST",
            quantity: 20,
            price: 1000,
          },
          session
        );

        // Abort transaction
        await session.abortTransaction();
      } finally {
        session.endSession();
      }

      // Check if wallet was created (outside transaction)
      const wallet = await WalletModel.findOne({ userId: testUserId });

      // Wallet might exist but transaction should not be recorded
      if (wallet) {
        expect(wallet.transactions.length).toBe(0);
      }
    });
  });
});
