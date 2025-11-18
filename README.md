# Equinova – MERN Trading Platform

Production-ready monorepo for a simulated trading platform with three apps:

- `backend` – Express + MongoDB API (auth, orders, holdings)
- `dashboard` – Authenticated trading web app (React)
- `frontend` – Marketing/landing site (React)

All tests pass, security is configured, and the codebase is ready for deployment.

## Overview

- Full-featured virtual trading experience: register/login, buy/sell orders, holdings, wallet/funds, order history, charts.
- Realistic market flow backed by a market data service and clean service boundaries.
- Clean separation between public site (`frontend`) and app (`dashboard`).

## Tech Stack (MERN)

- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Helmet, express-rate-limit, CORS, dotenv, pino
- Web Apps: React 19, React Router DOM, Axios, MUI (dashboard), Chart.js (dashboard)
- Tooling/Tests: Jest, React Testing Library, supertest, nodemon, CRA (react-scripts)

## Folder Structure

```
backend/      Express API, Mongo/Mongoose, tests, scripts
dashboard/    React trading app (MUI, charts)
frontend/     React marketing/landing site
```

## Installation

Prerequisites: Node.js >= 16, a MongoDB connection string (Atlas recommended).

```powershell
# From repository root
cd backend;   npm install; cd ..
cd dashboard; npm install; cd ..
cd frontend;  npm install; cd ..
```

## Environment Variables

Create a real `.env` file in each app. Do not commit `.env`.

Backend (`backend/.env`):

- `MONGO_URL` (required): MongoDB URI
- `JWT_SECRET` (required): strong secret for tokens
- `PORT` (optional, default 3002)
- `FRONTEND_URL` (dev default http://localhost:3001)
- `DASHBOARD_URL` (dev default http://localhost:3000)
- `CORS_ORIGINS` (optional, comma-separated)
- `LOG_LEVEL` (optional, default info)
- `PRICE_UPDATE_INTERVAL_MS` (optional, e.g., 60000)
- `COOKIE_DOMAIN` (optional for prod, e.g., .yourdomain.com)

Dashboard (`dashboard/.env`):

- `REACT_APP_API_BASE_URL` (e.g., http://localhost:3002)
- `REACT_APP_WS_URL` (if used; e.g., ws://localhost:3002)
- `REACT_APP_FRONTEND_URL` (optional, used in redirects if needed)

Frontend (`frontend/.env`):

- `REACT_APP_API_BASE_URL` (e.g., http://localhost:3002)
- `REACT_APP_DASHBOARD_URL` (e.g., http://localhost:3000)

## How To Run (Local)

Use three terminals or panes.

Backend (port 3002):

```powershell
cd backend; npm run dev
```

Dashboard (port 3000):

```powershell
cd dashboard; npm run dev
```

Frontend (port 3001):

```powershell
cd frontend; npm run dev
```

## Useful Scripts

Backend:

- `npm run dev` – Start dev server (nodemon)
- `npm start` – Start production server
- `npm test` – Run tests with coverage
- `npm run test:watch` – Watch mode for tests
- `npm run smoke-test` – End-to-end backend smoke test

Dashboard/Frontend:

- `npm run dev` – Start CRA dev server
- `npm run build` – Production build
- `npm test` – Run tests

## Deployment

Recommended: Render for backend, Vercel for dashboard and frontend.

Backend (Render):

1. Create a new Web Service from this GitHub repo.
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Environment: add `MONGO_URL`, `JWT_SECRET`, `FRONTEND_URL`, `DASHBOARD_URL`, any `CORS_ORIGINS`.

Dashboard (Vercel):

1. Import project from GitHub.
2. Root Directory: `dashboard`
3. Framework: Create React App (auto-detected)
4. Environment Variables: `REACT_APP_API_BASE_URL`, `REACT_APP_WS_URL`
5. Build/Output: defaults (Build: `npm run build`)

Frontend (Vercel):

1. Import project from GitHub.
2. Root Directory: `frontend`
3. Framework: Create React App (auto-detected)
4. Environment Variables: `REACT_APP_API_BASE_URL`, `REACT_APP_DASHBOARD_URL`
5. Build/Output: defaults (Build: `npm run build`)

Post-Deploy Checklist:

- Verify CORS: backend allows dashboard and frontend origins
- Confirm cookies/domains (set `COOKIE_DOMAIN` if using subdomains)
- Test full flow: register → login → buy → holdings → sell

## Notes

- Do not use `.env.example`; maintain only real `.env` files locally and set env vars in hosting dashboards.
- `.gitignore` already excludes `.env`, `node_modules`, build outputs.

## License

ISC
