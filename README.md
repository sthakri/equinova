# Trading Platform

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
- `GET /allPositions` - Fetch all positions
- `POST /newOrder` - Place new order (buy/sell)

**Port**: 3002 (default)

### 3. **Dashboard** (`/dashboard`)

**Purpose**: Authenticated trading interface for active users

The dashboard provides the core trading functionality:

- Real-time portfolio overview with charts
- Holdings management with performance metrics
- Active positions tracking
- Order placement interface (buy/sell windows)
- Watchlist for monitoring stocks
- Fund management
- Performance visualization with graphs

**Key Features**:

- Interactive charts using Chart.js
- Material-UI components for consistent design
- Real-time data updates
- Responsive trading interface
- Context-based state management

**Port**: 3000 (default)

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

   Create a `.env` file in the backend directory:

   ```env
   PORT=3002
   MONGO_URL=mongodb://localhost:27017/trading-platform
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   DASHBOARD_URL=http://localhost:3000
   FRONTEND_URL=http://localhost:3001
   CORS_ORIGINS=
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   ```

   Create a `.env` file in the frontend directory:

   ```env
   REACT_APP_API_URL=http://localhost:3002
   ```

4. **Dashboard Setup**
   ```bash
   cd dashboard
   npm install
   ```

### Running the Application

You need to run all three applications simultaneously:

1. **Start Backend** (Terminal 1)

   ```bash
   cd backend
   npm start
   ```

   Server will run on http://localhost:3002

2. **Start Frontend** (Terminal 2)

   ```bash
   cd frontend
   npm start
   ```

   Landing page will run on http://localhost:3001

3. **Start Dashboard** (Terminal 3)
   ```bash
   cd dashboard
   npm start
   ```
   Trading dashboard will run on http://localhost:3000

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

### Positions Collection

```javascript
{
  product: String,     // Product type (e.g., CNC)
  name: String,        // Stock symbol
  qty: Number,         // Quantity
  avg: Number,         // Average price
  price: Number,       // Current price
  net: String,         // Net change
  day: String,         // Day's change
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

## 🧪 Testing

### Frontend Tests

```bash
cd frontend
npm test
```

### Dashboard Tests

```bash
cd dashboard
npm test
```

## 🔧 Configuration

### CORS Configuration

The backend supports multiple origins for development:

- Default: localhost:3000, localhost:3001
- Custom origins via `CORS_ORIGINS` environment variable
- Production mode enforces strict origin checking

### Environment Variables

#### Backend (.env)

- `PORT` - Server port (default: 3002)
- `MONGO_URL` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `NODE_ENV` - Environment (development/production)
- `DASHBOARD_URL` - Dashboard URL for CORS and redirects
- `FRONTEND_URL` - Frontend URL for CORS
- `CORS_ORIGINS` - Additional allowed origins (comma-separated)

#### Frontend (.env)

- `REACT_APP_API_URL` - Backend API URL

## 📈 Features

### Current Implementation

✅ User authentication (register/login/logout)
✅ Holdings management and display
✅ Positions tracking
✅ Order placement (buy/sell)
✅ Portfolio overview
✅ Real-time data display
✅ Charts and visualizations
✅ Responsive design
✅ Protected routes

### In Progress

🚧 WebSocket integration for real-time updates
🚧 Advanced charting features
🚧 Trade history filtering
🚧 Profit/loss analytics

### Planned Features

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

---

**Last Updated**: November 15, 2025

_Note: This is a virtual trading platform for educational purposes only. No real money or securities are involved._
