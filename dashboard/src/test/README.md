# Dashboard Component Tests

This directory contains comprehensive tests for the Trading Platform dashboard components.

## Test Structure

### Component Tests

- **Holdings.test.js** - Tests for holdings display, real-time updates, and P&L calculations
- **Funds.test.js** - Tests for wallet balance display and transaction history
- **BuyActionWindow.test.js** - Tests for buy order form validation and submission
- **OrderInteraction.test.js** - Integration tests for complete order flows

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test Holdings.test.js
```

## Test Coverage

The test suite covers:

- ✅ Component rendering with data
- ✅ Loading states
- ✅ Error handling
- ✅ User interactions
- ✅ Form validation
- ✅ API integration
- ✅ Order placement flows

## Mocked Dependencies

The following are mocked in `setupTests.js`:

- `socket.io-client` - WebSocket connections
- `window.location.reload` - Page reloads
- API calls via `apiClient`

## Writing New Tests

1. Import testing utilities:

```javascript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
```

2. Mock API responses:

```javascript
jest.mock("../utils/apiConfig");
```

3. Follow the Arrange-Act-Assert pattern
4. Use descriptive test names
5. Clean up after each test with appropriate cleanup functions
