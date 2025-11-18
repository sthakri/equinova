// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock socket.io-client to prevent WebSocket connections during tests
jest.mock("socket.io-client", () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connected: false,
    id: "mock-socket-id",
  })),
}));

// Mock window.location.reload
delete window.location;
window.location = { reload: jest.fn() };

// Suppress console errors and logs during tests
const originalError = console.error;
const originalLog = console.log;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: ReactDOM.render") ||
        args[0].includes("Not implemented: HTMLFormElement.prototype.submit") ||
        args[0].includes("Error fetching holdings") ||
        args[0].includes("Error fetching price") ||
        args[0].includes("Cannot read properties of undefined") ||
        args[0].includes("In HTML, <tr> cannot be a child of <table>"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.log = (...args) => {
    // Suppress WebSocket connection logs during tests
    if (typeof args[0] === "string" && args[0].includes("🔌")) {
      return;
    }
    originalLog.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.log = originalLog;
});
