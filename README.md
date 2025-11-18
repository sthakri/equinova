# Trading Platform

**Status:** ✅ **PRODUCTION READY** | **Version:** 1.0.0 | **Last Updated:** November 17, 2025

## 🚀 Quick Start for Deployment

**Ready to deploy?** Start here:

1. 📖 Read **`DEPLOYMENT_GUIDE.md`** - Complete deployment instructions
2. ✅ Check **`PRODUCTION_READINESS.md`** - Pre-deployment checklist
3. ⚡ Use **`DEPLOYMENT_COMPLETE.md`** - Quick reference summary

**For local development:** See "Getting Started" section below.

---

A full-stack virtual trading platform with simulated market data that enables users to practice trading without real financial risk. The platform provides a realistic trading experience with features including holdings management, order placement, and real-time portfolio tracking.

## 🎯 Project Purpose

This virtual trading platform simulates a complete stock trading ecosystem where users can:

- Browse and learn about trading through an informational landing page
- Register and authenticate securely
- Execute buy and sell orders with simulated market data
- Track their portfolio holdings and positions in real-time
- Monitor order history and performance metrics

## 🏗️ Architecture Overview

```
┌─────────────────┐
│    Frontend     │
│  (Landing Page) │
│   Port: 3001    │
│                 │
│  - Home Page    │
│  - About        │
│  - Products     │
│  - Pricing      │
│  - Support      │
│  - Login/Signup │
└────────┬────────┘
         │
         ↓
┌─────────────────┐       ┌─────────────────┐
│  Backend API    │←──────│    Dashboard    │
│   Port: 3002    │       │  (Trading App)  │
│                 │       │   Port: 3000    │
│  - REST API     │       │                 │
│  - Auth Service │       │  - Holdings     │
│  - MongoDB      │       │  - Positions    │
│  - Order Mgmt   │       │  - Orders       │
└─────────────────┘       │  - Watchlist    │
                          │  - Charts       │
                          └─────────────────┘
```

## 🛠️ Tech Stack

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database for data persistence
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Passport.js** - Authentication middleware
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

**Security Packages:**

- **Helmet** - Security headers middleware (XSS, clickjacking, MIME sniffing protection)
- **express-rate-limit** - Rate limiting to prevent brute-force attacks
- **cookie-parser** - Secure cookie parsing for authentication tokens

### Frontend (Landing Page)

- **React 19.2.0** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **Font Awesome** - Icon library
- **Jest & React Testing Library** - Testing framework

### Dashboard (Trading Interface)

- **React 19.2.0** - UI library
- **Material-UI (MUI)** - Component library
- **Chart.js** - Data visualization
- **react-chartjs-2** - React wrapper for Chart.js
- **Axios** - HTTP client for API requests
- **React Router DOM** - Client-side routing

### Development Tools

- **Nodemon** - Auto-restart for Node.js development
- **React Scripts** - Create React App build tools

## 📦 Project Structure

The project consists of three separate applications:

### 1. **Frontend** (`/frontend`)

**Purpose**: Public-facing landing and marketing website

The frontend serves as the entry point for new users, providing:

- Marketing pages showcasing platform features
- Educational content about trading
- Product information and pricing details
- User registration and login interfaces
- Support and documentation access

**Key Features**:

- Responsive design with modern UI/UX
- SEO-friendly pages
- Comprehensive routing for all sections
- Integration with backend authentication

**Port**: 3001 (default)

### 2. **Backend** (`/backend`)

**Purpose**: RESTful API server and business logic layer

The backend handles all server-side operations including:

- User authentication and authorization (JWT-based)
- Database operations with MongoDB
- Order management (buy/sell operations)
- Holdings and positions tracking
- API endpoints for data retrieval

**Key Features**:

- Secure authentication with bcrypt password hashing
- CORS-enabled for cross-origin requests
- RESTful API design
- MongoDB integration with Mongoose ORM
- Environment-based configuration
- Error handling middleware

**API Endpoints**:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `GET /allHoldings` - Fetch all holdings
- `GET /holdings/:symbol` - Fetch specific holding
- `POST /newOrder` - Place new order (buy/sell)

> **Note**: Positions tracking is planned for future implementation to differentiate between long-term holdings and active intraday positions.

**Port**: 3002 (default)

### 3. **Dashboard** (`/dashboard`)

**Purpose**: Authenticated trading interface for active users

The dashboard provides the core trading functionality:

- Real-time portfolio overview with charts
- Holdings management with performance metrics
- Order placement interface (buy/sell windows)
- Watchlist for monitoring stocks
- Fund management
- Performance visualization with graphs

> **Note**: Active positions tracking feature is planned for future development to track intraday trades separately from long-term holdings.

**Key Features**:

- Interactive charts using Chart.js
- Material-UI components for consistent design
- Real-time data updates
- Responsive trading interface
- Context-based state management

**Port**: 3000 (default)

## ⚡ Quick Start

For the impatient, here's the fastest way to get running:

```bash
# Terminal 1 - Backend
cd backend && npm install && cp .env.example .env && npm run dev

# Terminal 2 - Frontend
cd frontend && npm install && cp .env.example .env && npm run dev

# Terminal 3 - Dashboard
cd dashboard && npm install && cp .env.example .env && npm run dev
```

**Important**: Edit `backend/.env` to set your `MONGO_URL` and `JWT_SECRET` before starting the backend.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js v16.0.0 or higher** (tested with v22.16.0)
- MongoDB (local or Atlas connection)
- npm or yarn package manager

> **Note**: All three applications specify `"engines": { "node": ">=16.0.0" }` in their package.json files to ensure compatibility.

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd "Trading Platform"
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file by copying the example:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and configure the following required variables:

   - `MONGO_URL` - Your MongoDB connection string
   - `JWT_SECRET` - Generate a strong secret key
   - Other variables can use default values for local development

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   ```

   Create a `.env` file by copying the example:

   ```bash
   cp .env.example .env
   ```

   The default values in `.env.example` work for local development.

4. **Dashboard Setup**

   ```bash
   cd dashboard
   npm install
   ```

   Create a `.env` file by copying the example:

   ```bash
   cp .env.example .env
   ```

   The default values in `.env.example` work for local development.

### Available Scripts

Each application has the following npm scripts:

#### Backend Scripts

- `npm run dev` - Start development server with auto-restart (Nodemon)
- `npm start` - Start production server
- `npm test` - Run unit and integration tests with coverage
- `npm run test:watch` - Run tests in watch mode
- `npm run smoke-test` - Run end-to-end smoke tests

### Logging (Backend)

- Structured logging via `pino` with per-request `x-request-id`.
- Dev mode uses `pino-pretty` for readable output; production emits JSON lines.
- Configure level with `LOG_LEVEL` env var (default `info`).
- Important events logged:
  - Auth success/failure, CORS decisions
  - Orders placed/failed with context (symbol, qty, price)
  - Errors in routes and middleware with stack traces in development

#### Frontend Scripts

- `npm run dev` - Start development server with hot reload (alias for `start`)
- `npm start` - Start development server on port 3001
- `npm run build` - Create optimized production build
- `npm test` - Run test suite in watch mode
- `npm run eject` - Eject from Create React App (one-way operation)

#### Dashboard Scripts

- `npm run dev` - Start development server with hot reload (alias for `start`)
- `npm start` - Start development server on port 3000
- `npm run build` - Create optimized production build
- `npm test` - Run test suite in watch mode
- `npm run eject` - Eject from Create React App (one-way operation)

### Running the Application

You need to run all three applications simultaneously:

#### Development Mode (Recommended)

1. **Start Backend** (Terminal 1)

   ```bash
   cd backend
   npm run dev
   ```

   Server will run on http://localhost:3002 with auto-restart on file changes (via Nodemon)

2. **Start Frontend** (Terminal 2)

   ```bash
   cd frontend
   npm run dev
   ```

   Landing page will run on http://localhost:3001 with hot reload

3. **Start Dashboard** (Terminal 3)

   ```bash
   cd dashboard
   npm run dev
   ```

   Trading dashboard will run on http://localhost:3000 with hot reload

#### Production Mode

For production deployments:

**Backend:**

```bash
cd backend
npm start
```

Runs without Nodemon for production stability

**Frontend:**

```bash
cd frontend
npm run build
# Serve the build folder with a static file server
```

**Dashboard:**

```bash
cd dashboard
npm run build
# Serve the build folder with a static file server
```

## 📊 Database Schema

### Users Collection

```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  role: String,
  createdAt: Date
}
```

### Holdings Collection

```javascript
{
  name: String,        // Stock symbol
  qty: Number,         // Quantity owned
  avg: Number,         // Average purchase price
  price: Number,       // Current market price
  net: String,         // Net profit/loss percentage
  day: String,         // Day's change percentage
  isLoss: Boolean      // Loss indicator
}
```

### Orders Collection

```javascript
{
  name: String,        // Stock symbol
  qty: Number,         // Quantity
  price: Number,       // Order price
  mode: String,        // BUY or SELL
  createdAt: Date      // Order timestamp
}
```

## 🔐 Authentication Flow

1. User registers/logs in via **Frontend** landing page
2. Credentials sent to **Backend** API
3. Backend validates and creates JWT token
4. Token stored in HTTP-only cookie
5. User redirected to **Dashboard** with authenticated session
6. Dashboard makes authenticated requests to Backend API
7. Backend middleware verifies JWT for protected routes

## 🛡️ Security

The backend implements multiple security layers to protect against common vulnerabilities:

### Security Packages

**Helmet** - Secures Express apps by setting various HTTP headers:

- Protects against XSS (Cross-Site Scripting) attacks
- Prevents clickjacking with frameguard
- Disables X-Powered-By header to hide Express usage
- Implements Content Security Policy (CSP)
- Mitigates MIME type sniffing

**express-rate-limit** - Prevents brute-force attacks:

- Limits repeated requests to API endpoints
- Configurable rate limits per IP address
- Protects authentication routes from credential stuffing
- Reduces risk of DDoS attacks

**cookie-parser** - Secure cookie handling:

- Parses HTTP-only cookies for JWT storage
- Prevents client-side JavaScript access to tokens
- Supports signed cookies for additional security
- Essential for secure session management

**Additional Security Measures:**

- Password hashing with bcrypt (10+ salt rounds)
- JWT tokens with configurable expiration
- CORS configuration with allowed origins
- Environment-based security settings
- MongoDB connection string protection via .env files

### Best Practices Implemented

✅ HTTP-only cookies for token storage
✅ Secure password hashing (bcrypt)
✅ Environment variable protection
✅ CORS restrictions
✅ Rate limiting on API endpoints
✅ Security headers via Helmet
✅ Input validation and sanitization

## 🧪 Testing

### Backend Tests

#### Unit & Integration Tests

```bash
cd backend
npm test                  # Run all tests with coverage
npm run test:watch        # Run tests in watch mode
```

**Test Coverage:**

- Authentication Controller (login, register, logout)
- Wallet Service (balance, transactions)
- Integration tests (full user flow)

**Coverage Report:** Available in `backend/coverage/lcov-report/index.html`

#### Smoke Tests (End-to-End)

The smoke test validates the complete backend system by simulating a real trading workflow:

```bash
cd backend
npm run smoke-test
```

**What it tests:**

1. ✓ Server startup and health check
2. ✓ User registration with validation
3. ✓ User login and session management
4. ✓ Buy order placement and processing
5. ✓ Holdings creation and verification
6. ✓ Wallet balance updates
7. ✓ Transaction history recording
8. ✓ Sell order execution
9. ✓ Holdings cleanup after selling
10. ✓ Order history tracking
11. ✓ Automatic test data cleanup

**Features:**

- Colored console output for easy reading
- Automatic server startup and shutdown
- Isolated test data with cleanup
- Step-by-step validation with detailed reporting
- Graceful error handling with rollback

**Requirements:**

- MongoDB running and accessible
- Backend `.env` file configured
- Ports 3002 and MongoDB port available

**Example output:**

```
========================================
   BACKEND SMOKE TEST SUITE
========================================

[1/14] Starting backend server...
✓ Server started successfully (PID: 12345)

[2/14] Registering test user...
✓ User registered: test_user_1234567890
...
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Dashboard Tests

The dashboard includes comprehensive React component tests:

```bash
cd dashboard
npm test                  # Run all tests
npm test -- --coverage    # Run with coverage report
```

**Test Coverage:**

- Holdings component (rendering, data display, calculations)
- Funds component (wallet balance, transactions)
- BuyActionWindow (form validation, order placement)
- OrderInteraction (complete buy/sell flows)

**What's tested:**

- Component rendering with various data states
- User interactions (clicks, form inputs, submissions)
- API integration and error handling
- Loading states and async operations
- Form validation and calculations
- WebSocket mock behavior

**Test documentation:** See `dashboard/src/test/README.md`

## 🔧 Configuration

### CORS Configuration

The backend supports multiple origins for development:

- Default: localhost:3000, localhost:3001
- Custom origins via `CORS_ORIGINS` environment variable
- Production mode enforces strict origin checking

### Environment Variables

#### Backend (`backend/.env`)

**Server Configuration:**

- `NODE_ENV` - Environment mode (`development`, `production`, or `test`)
  - Affects error messages, logging verbosity, and CORS behavior
  - Default: `development`
- `PORT` - Server port number
  - Default: `3002`
  - Production: Set via hosting platform

**Database Configuration:**

- `MONGO_URL` - MongoDB connection string
  - Local: `mongodb://localhost:27017/trading-platform`
  - Atlas: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?appName=<AppName>`
  - Required for database connectivity

**Authentication:**

- `JWT_SECRET` - Secret key for JWT token signing and verification
  - **CRITICAL**: Use a strong, random string (minimum 32 characters)
  - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  - Never commit actual secret to version control
- `COOKIE_DOMAIN` - Cookie domain for cross-subdomain authentication (optional)
  - Example: `.yourdomain.com` (note the leading dot)
  - Leave empty for localhost development

**CORS Configuration:**

- `FRONTEND_URL` - Frontend landing page URL
  - Development: `http://localhost:3001`
  - Production: `https://yourdomain.com`
- `DASHBOARD_URL` - Dashboard application URL
  - Development: `http://localhost:3000`
  - Production: `https://app.yourdomain.com` or `https://yourdomain.com/dashboard`
  - Used for CORS and post-login redirects
- `CORS_ORIGINS` - Additional allowed CORS origins (comma-separated)
  - Example: `https://staging.example.com,https://app.example.com`
  - Leave empty if only using FRONTEND_URL and DASHBOARD_URL

**Price Update Configuration:**

- `PRICE_UPDATE_INTERVAL_MS` - Stock price update interval in milliseconds
  - Development: `5000` (5 seconds) for faster testing
  - Production: `30000-60000` (30-60 seconds) recommended
  - Used for simulated market data updates

#### Frontend (`frontend/.env`)

**API Configuration:**

- `REACT_APP_API_BASE_URL` - Backend API base URL
  - Development: `http://localhost:3002`
  - Production: `https://api.yourdomain.com`
  - Must match the backend server URL
  - Used for all REST API requests (auth, data fetching)

#### Dashboard (`dashboard/.env`)

**API Configuration:**

- `REACT_APP_API_BASE_URL` - Backend API base URL for REST endpoints
  - Development: `http://localhost:3002`
  - Production: `https://api.yourdomain.com`
  - Must match the backend server URL
  - Used for holdings, positions, orders, and user data
- `REACT_APP_WS_URL` - WebSocket URL for real-time updates
  - Development: `ws://localhost:3002`
  - Production: `wss://api.yourdomain.com`
  - Note: Use `wss://` (secure) in production
  - **Status**: Planned for future implementation

> **Security Note**: Never commit actual `.env` files to version control. Always use `.env.example` as a template with placeholder values.

## 📈 Features

### Current Implementation

✅ User authentication (register/login/logout)
✅ Holdings management and display
✅ Order placement (buy/sell)
✅ Portfolio overview
✅ Real-time data display
✅ Charts and visualizations
✅ Responsive design
✅ Protected routes
✅ Security middleware (Helmet, rate limiting)
✅ Password validation and hashing

### In Progress

🚧 WebSocket integration for real-time updates
🚧 Advanced charting features
🚧 Trade history filtering
🚧 Profit/loss analytics

### Planned Features

📋 **Positions Tracking** - Separate intraday/active positions from long-term holdings
📋 Real-time market data simulation
📋 Watchlist with price alerts
📋 Portfolio performance analytics
📋 Transaction history export
📋 Advanced order types (limit, stop-loss)
📋 Market news integration
📋 Mobile application

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Chart.js for powerful data visualization
- Material-UI for comprehensive React components
- MongoDB for flexible data storage
- Express.js community for excellent middleware

## 📚 Additional Documentation

- **[PRODUCTION_READY.md](PRODUCTION_READY.md)** - Complete production deployment guide with security checklist
- **[DATABASE_RESET_SUMMARY.md](DATABASE_RESET_SUMMARY.md)** - Database cleanup summary and production readiness confirmation
- **[WATCHLIST_STOCKS.md](WATCHLIST_STOCKS.md)** - Detailed information about the 15 available stocks
- **[MARKET_DATA_SERVICE.md](MARKET_DATA_SERVICE.md)** - Market data architecture and WebSocket implementation
- **[TEST_SUMMARY.md](backend/TEST_SUMMARY.md)** - Test coverage and validation reports

## 🆕 Database Status

✅ **Production Ready** - Database has been cleaned and is ready for launch

The MongoDB database is completely clean with:

- **0** test users
- **0** test transactions
- **15** stocks available for trading
- Fresh start for production deployment

For details on the database reset and production readiness, see [DATABASE_RESET_SUMMARY.md](DATABASE_RESET_SUMMARY.md).

### Database Management Scripts

**Clean database:**

```bash
cd backend
node scripts/resetDatabase.js
```

**Verify database state:**

```bash
cd backend
node scripts/verifyDatabase.js
```

---

**Last Updated**: November 17, 2025

_Note: This is a virtual trading platform for educational purposes only. No real money or securities are involved._
