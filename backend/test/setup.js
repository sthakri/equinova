/**
 * Jest Setup File
 *
 * Runs before all tests to configure the test environment
 */

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key";

// Increase timeout for MongoDB operations
jest.setTimeout(30000);

// Suppress console logs during tests (optional - comment out to see logs)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };
