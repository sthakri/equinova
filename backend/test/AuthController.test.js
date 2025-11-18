/**
 * AuthController Unit Tests
 *
 * Tests authentication functionality including:
 * - Password hashing
 * - Email normalization
 * - Token generation
 * - Input validation
 */

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UserModel } = require("../model/UserModel");
const { signToken, verifyToken } = require("../src/util/SecretToken");
const WalletService = require("../src/services/WalletService");

// Mock WalletService to avoid database operations
jest.mock("../src/services/WalletService");

describe("AuthController Tests", () => {
  // Setup before all tests
  beforeAll(async () => {
    // Set required environment variables
    process.env.JWT_SECRET = "test-secret-key-for-jest";
    process.env.NODE_ENV = "test";

    // Connect to test database
    const mongoUri =
      process.env.MONGO_TEST_URL || "mongodb://127.0.0.1:27017/trading-test";
    await mongoose.connect(mongoUri);
  });

  // Cleanup after each test
  afterEach(async () => {
    await UserModel.deleteMany({});
    jest.clearAllMocks();
  });

  // Cleanup after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("Password Hashing", () => {
    test("should hash password using bcrypt before saving", async () => {
      const plainPassword = "TestPassword123";

      const user = await UserModel.create({
        fullName: "Test User",
        email: "test@example.com",
        password: plainPassword,
      });

      // Password should be hashed (not equal to plain text)
      expect(user.password).not.toBe(plainPassword);

      // Password should start with bcrypt prefix
      expect(user.password).toMatch(/^\$2[aby]\$/);

      // Password length should be bcrypt hash length (60 chars)
      expect(user.password.length).toBe(60);
    });

    test("should use bcrypt with at least 10 salt rounds", async () => {
      const password = "SecurePass456";

      const user = await UserModel.create({
        fullName: "Salt Test User",
        email: "salttest@example.com",
        password,
      });

      // Extract salt rounds from hash (format: $2a$10$...)
      const saltRounds = parseInt(user.password.split("$")[2]);

      // Should use at least 10 rounds
      expect(saltRounds).toBeGreaterThanOrEqual(10);
    });

    test("should generate different hashes for same password", async () => {
      const password = "SamePassword789";

      const user1 = await UserModel.create({
        fullName: "User One",
        email: "user1@example.com",
        password,
      });

      const user2 = await UserModel.create({
        fullName: "User Two",
        email: "user2@example.com",
        password,
      });

      // Hashes should be different due to different salts
      expect(user1.password).not.toBe(user2.password);
    });

    test("should correctly compare passwords with comparePassword method", async () => {
      const correctPassword = "CorrectPass123";
      const wrongPassword = "WrongPass456";

      const user = await UserModel.create({
        fullName: "Compare Test User",
        email: "compare@example.com",
        password: correctPassword,
      });

      // Correct password should match
      const isCorrect = await user.comparePassword(correctPassword);
      expect(isCorrect).toBe(true);

      // Wrong password should not match
      const isWrong = await user.comparePassword(wrongPassword);
      expect(isWrong).toBe(false);
    });

    test("should not rehash password if not modified", async () => {
      const user = await UserModel.create({
        fullName: "Rehash Test",
        email: "rehash@example.com",
        password: "InitialPassword123",
      });

      const originalHash = user.password;

      // Update non-password field
      user.fullName = "Updated Name";
      await user.save();

      // Hash should remain the same
      expect(user.password).toBe(originalHash);
    });
  });

  describe("Email Normalization", () => {
    test("should convert email to lowercase", async () => {
      const user = await UserModel.create({
        fullName: "Email Test User",
        email: "TEST@EXAMPLE.COM",
        password: "Password123",
      });

      expect(user.email).toBe("test@example.com");
    });

    test("should trim whitespace from email", async () => {
      const user = await UserModel.create({
        fullName: "Trim Test User",
        email: "  trimmed@example.com  ",
        password: "Password123",
      });

      expect(user.email).toBe("trimmed@example.com");
    });

    test("should enforce unique email constraint", async () => {
      await UserModel.create({
        fullName: "First User",
        email: "duplicate@example.com",
        password: "Password123",
      });

      // Attempting to create second user with same email should fail
      await expect(
        UserModel.create({
          fullName: "Second User",
          email: "duplicate@example.com",
          password: "Password456",
        })
      ).rejects.toThrow();
    });

    test("should treat case-insensitive emails as duplicates", async () => {
      await UserModel.create({
        fullName: "Original User",
        email: "case@example.com",
        password: "Password123",
      });

      // Should fail because email is normalized to lowercase
      await expect(
        UserModel.create({
          fullName: "Duplicate User",
          email: "CASE@EXAMPLE.COM",
          password: "Password456",
        })
      ).rejects.toThrow();
    });

    test("should allow different email domains", async () => {
      const user1 = await UserModel.create({
        fullName: "User One",
        email: "user@gmail.com",
        password: "Password123",
      });

      const user2 = await UserModel.create({
        fullName: "User Two",
        email: "user@yahoo.com",
        password: "Password123",
      });

      expect(user1.email).toBe("user@gmail.com");
      expect(user2.email).toBe("user@yahoo.com");
    });
  });

  describe("Token Generation", () => {
    test("should generate valid JWT token", () => {
      const payload = {
        id: "user123",
        email: "test@example.com",
        role: "user",
      };

      const token = signToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    test("should include correct payload in token", () => {
      const payload = {
        id: "user456",
        email: "payload@example.com",
        role: "admin",
      };

      const token = signToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    test("should set default expiration to 3 days", () => {
      const payload = { id: "user789", email: "expire@example.com" };

      const token = signToken(payload);
      const decoded = verifyToken(token);

      // Check that exp is set
      expect(decoded.exp).toBeDefined();

      // Calculate expected expiration (3 days from now)
      const threeDaysInSeconds = 3 * 24 * 60 * 60;
      const expectedExp = Math.floor(Date.now() / 1000) + threeDaysInSeconds;

      // Should be within 10 seconds of expected
      expect(Math.abs(decoded.exp - expectedExp)).toBeLessThan(10);
    });

    test("should respect custom expiration option", () => {
      const payload = { id: "user999", email: "custom@example.com" };

      const token = signToken(payload, { expiresIn: "1h" });
      const decoded = verifyToken(token);

      // Should expire in approximately 1 hour
      const oneHourInSeconds = 60 * 60;
      const expectedExp = Math.floor(Date.now() / 1000) + oneHourInSeconds;

      expect(Math.abs(decoded.exp - expectedExp)).toBeLessThan(10);
    });

    test("should throw error when verifying invalid token", () => {
      const invalidToken = "invalid.token.string";

      expect(() => verifyToken(invalidToken)).toThrow();
    });

    test("should throw error when JWT_SECRET is missing", () => {
      // Save original secret
      const originalSecret = process.env.JWT_SECRET;

      // Remove secret
      delete process.env.JWT_SECRET;

      // Should throw error
      expect(() => signToken({ id: "test" })).toThrow(
        "JWT_SECRET is not defined"
      );

      // Restore secret
      process.env.JWT_SECRET = originalSecret;
    });

    test("should create tokens that can be verified", () => {
      const payload = {
        id: "verify123",
        email: "verify@example.com",
        role: "user",
      };

      const token = signToken(payload);

      // Should not throw when verifying
      expect(() => verifyToken(token)).not.toThrow();

      const decoded = verifyToken(token);
      expect(decoded.id).toBe(payload.id);
    });
  });

  describe("Input Validation", () => {
    test("should require full name", async () => {
      await expect(
        UserModel.create({
          email: "noname@example.com",
          password: "Password123",
        })
      ).rejects.toThrow();
    });

    test("should require email", async () => {
      await expect(
        UserModel.create({
          fullName: "No Email User",
          password: "Password123",
        })
      ).rejects.toThrow();
    });

    test("should require password", async () => {
      await expect(
        UserModel.create({
          fullName: "No Password User",
          email: "nopass@example.com",
        })
      ).rejects.toThrow();
    });

    test("should enforce minimum password length", async () => {
      await expect(
        UserModel.create({
          fullName: "Short Password User",
          email: "short@example.com",
          password: "Short1",
        })
      ).rejects.toThrow();
    });

    test("should accept valid user data", async () => {
      const user = await UserModel.create({
        fullName: "Valid User",
        email: "valid@example.com",
        password: "ValidPass123",
      });

      expect(user).toBeDefined();
      expect(user.fullName).toBe("Valid User");
      expect(user.email).toBe("valid@example.com");
    });

    test("should set default role to user", async () => {
      const user = await UserModel.create({
        fullName: "Default Role User",
        email: "defaultrole@example.com",
        password: "Password123",
      });

      expect(user.role).toBe("user");
    });

    test("should allow admin role", async () => {
      const user = await UserModel.create({
        fullName: "Admin User",
        email: "admin@example.com",
        password: "AdminPass123",
        role: "admin",
      });

      expect(user.role).toBe("admin");
    });

    test("should trim full name whitespace", async () => {
      const user = await UserModel.create({
        fullName: "  Trimmed Name  ",
        email: "trimname@example.com",
        password: "Password123",
      });

      expect(user.fullName).toBe("Trimmed Name");
    });

    test("should enforce maximum full name length", async () => {
      const longName = "A".repeat(81);

      await expect(
        UserModel.create({
          fullName: longName,
          email: "longname@example.com",
          password: "Password123",
        })
      ).rejects.toThrow();
    });
  });

  describe("User Model Methods", () => {
    test("should exclude password from JSON output", async () => {
      const user = await UserModel.create({
        fullName: "JSON Test User",
        email: "json@example.com",
        password: "Password123",
      });

      const userJSON = user.toJSON();

      expect(userJSON.password).toBeUndefined();
      expect(userJSON.email).toBe("json@example.com");
      expect(userJSON.fullName).toBe("JSON Test User");
    });

    test("should include timestamps", async () => {
      const user = await UserModel.create({
        fullName: "Timestamp User",
        email: "timestamp@example.com",
        password: "Password123",
      });

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });
});
