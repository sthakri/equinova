# 🚀 Production Deployment Guide

## Trading Platform - Complete Deployment Instructions

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Database Setup](#database-setup)
3. [Backend Deployment](#backend-deployment)
4. [Dashboard Deployment](#dashboard-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Post-Deployment](#post-deployment)
7. [Platform-Specific Instructions](#platform-specific-instructions)

---

## ✅ Pre-Deployment Checklist

### Required Services & Accounts

- [ ] MongoDB Atlas account (free tier available)
- [ ] Hosting platform account (Vercel/Heroku/Railway/AWS/DigitalOcean)
- [ ] Domain names (optional but recommended):
  - Main domain: `yourdomain.com` (Frontend)
  - Subdomain: `dashboard.yourdomain.com` (Dashboard)
  - Subdomain: `api.yourdomain.com` (Backend)

### Development Environment

- [ ] All applications running successfully locally
- [ ] No console errors in browser/terminal
- [ ] Authentication working (login/signup/logout)
- [ ] Trading features working (buy/sell/holdings)
- [ ] WebSocket connections stable

---

## 🗄️ Database Setup

### Step 1: Create MongoDB Atlas Cluster

1. **Sign up/Login to MongoDB Atlas**

   - Visit: https://www.mongodb.com/cloud/atlas
   - Create free account or login

2. **Create a Cluster**

   - Click "Build a Database"
   - Choose "Shared" (Free tier)
   - Select region closest to your users
   - Cluster name: `trading-platform` (or your choice)

3. **Configure Database Access**

   - Navigate to "Database Access"
   - Click "Add New Database User"
   - Username: Choose a secure username
   - Password: Generate strong password (save it securely!)
   - Database User Privileges: "Read and write to any database"

4. **Configure Network Access**

   - Navigate to "Network Access"
   - Click "Add IP Address"
   - For development/testing: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your server's IP address
   - Note: Some hosting platforms require 0.0.0.0/0

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Driver: Node.js
   - Copy connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `trading_platform` (or your choice)
   - Example: `mongodb+srv://username:password@cluster.xxxxx.mongodb.net/trading_platform?retryWrites=true&w=majority`

### Step 2: Clean Database for Production

Run the cleanup script to remove any test data:

```bash
cd backend
node scripts/resetDatabase.js
```

This will:

- ✅ Remove all test users
- ✅ Clear all holdings
- ✅ Delete all orders
- ✅ Clean wallet data
- ✅ Prepare clean database for production

---

## 🔧 Backend Deployment

### Step 1: Configure Environment Variables

1. **Copy production environment template**

   ```bash
   cd backend
   cp .env.production .env
   ```

2. **Update .env with your values**

   ```env
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/trading_platform
   PORT=3002
   NODE_ENV=production
   TOKEN_SECRET=<GENERATE_64_CHAR_RANDOM_STRING>
   TOKEN_EXPIRATION=7d
   FRONTEND_URL=https://yourdomain.com
   DASHBOARD_URL=https://dashboard.yourdomain.com
   ```

3. **Generate Strong JWT Secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Copy the output and use as TOKEN_SECRET

### Step 2: Prepare for Deployment

```bash
# Install dependencies
npm install --production

# Test the build
npm start
```

### Step 3: Deploy Backend

**Platform URLs after deployment:**

- Your backend will be available at: `https://api.yourdomain.com`
- Or platform default: `https://your-app-name.herokuapp.com`

**Important Notes:**

- ⚠️ Ensure WebSocket support is enabled on your hosting platform
- ⚠️ Set all environment variables in your hosting platform dashboard
- ⚠️ Add FRONTEND_URL and DASHBOARD_URL to CORS configuration

---

## 📊 Dashboard Deployment

### Step 1: Configure Environment Variables

1. **Copy production environment template**

   ```bash
   cd dashboard
   cp .env.production .env
   ```

2. **Update .env with your values**

   ```env
   REACT_APP_API_URL=https://api.yourdomain.com
   REACT_APP_WS_URL=https://api.yourdomain.com
   NODE_ENV=production
   GENERATE_SOURCEMAP=false
   ```

   **IMPORTANT:**

   - Replace `https://api.yourdomain.com` with YOUR deployed backend URL
   - NO trailing slash
   - Must include `https://`

### Step 2: Build for Production

```bash
# Install dependencies
npm install

# Create production build
npm run build
```

This creates an optimized build in the `build/` folder.

### Step 3: Deploy Dashboard

**Platform URLs after deployment:**

- Your dashboard will be available at: `https://dashboard.yourdomain.com`
- Or platform default: `https://dashboard-app-name.vercel.app`

**Deployment Options:**

**A. Vercel (Recommended)**

```bash
npm install -g vercel
vercel --prod
```

**B. Netlify**

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

**C. Manual Deployment**

- Upload `build/` folder contents to your web server
- Configure server for client-side routing

---

## 🏠 Frontend Deployment

### Step 1: Configure Environment Variables

1. **Copy production environment template**

   ```bash
   cd frontend
   cp .env.production .env
   ```

2. **Update .env with your values**

   ```env
   REACT_APP_API_URL=https://api.yourdomain.com
   REACT_APP_DASHBOARD_URL=https://dashboard.yourdomain.com
   NODE_ENV=production
   GENERATE_SOURCEMAP=false
   ```

   **IMPORTANT:**

   - Replace with YOUR deployed backend and dashboard URLs
   - NO trailing slashes
   - Must include `https://`

### Step 2: Build for Production

```bash
# Install dependencies
npm install

# Create production build
npm run build
```

### Step 3: Deploy Frontend

**Platform URLs after deployment:**

- Your frontend will be available at: `https://yourdomain.com`
- Or platform default: `https://frontend-app-name.vercel.app`

---

## 🔄 Post-Deployment

### Step 1: Update Backend CORS

After deploying frontend and dashboard, update backend CORS configuration:

In `backend/index.js`, verify CORS origins match your deployed URLs:

```javascript
const allowedOrigins = [
  process.env.FRONTEND_URL, // Your deployed frontend URL
  process.env.DASHBOARD_URL, // Your deployed dashboard URL
];
```

### Step 2: Test Complete Flow

1. **Test Frontend**

   - ✅ Visit your deployed frontend URL
   - ✅ Navigate to pricing, products, support pages
   - ✅ Click "Sign Up" button

2. **Test Authentication**

   - ✅ Create a new account
   - ✅ Verify successful signup
   - ✅ Login with credentials
   - ✅ Verify redirect to dashboard

3. **Test Dashboard Features**

   - ✅ Check user profile displays correctly
   - ✅ Verify wallet balance loaded
   - ✅ Test watchlist displays stocks
   - ✅ Check WebSocket connection (Live indicator)
   - ✅ Test buying stocks
   - ✅ Test selling stocks
   - ✅ Verify holdings update
   - ✅ Check orders page
   - ✅ Test logout functionality

4. **Test WebSocket**
   - ✅ Open dashboard
   - ✅ Look for "● Live" indicator on Holdings
   - ✅ Watch for price updates in watchlist
   - ✅ Verify real-time updates working

### Step 3: Monitor and Debug

1. **Check Backend Logs**

   - Look for connection errors
   - Verify WebSocket connections
   - Check for authentication issues

2. **Check Browser Console**

   - No CORS errors
   - No API connection errors
   - WebSocket connected successfully

3. **Test from Different Devices**
   - Desktop browser
   - Mobile browser
   - Different networks

---

## 🌐 Platform-Specific Instructions

### Vercel (Recommended for React Apps)

**Backend:**

1. Import GitHub repository
2. Select `backend` folder as root directory
3. Set environment variables in project settings
4. Deploy

**Frontend/Dashboard:**

1. Import GitHub repository
2. Select `frontend` or `dashboard` folder
3. Build command: `npm run build`
4. Output directory: `build`
5. Set environment variables
6. Deploy

### Heroku

**Backend:**

```bash
cd backend
heroku create your-backend-app-name
heroku config:set MONGO_URL="your-mongodb-uri"
heroku config:set TOKEN_SECRET="your-secret"
heroku config:set FRONTEND_URL="https://yourdomain.com"
heroku config:set DASHBOARD_URL="https://dashboard.yourdomain.com"
git push heroku main
```

**Frontend/Dashboard:**

- Use Heroku buildpack: `heroku/nodejs`
- Add `serve` package for hosting
- Create `Procfile`: `web: npx serve -s build -l $PORT`

### Railway

1. Connect GitHub repository
2. Select service type: Node.js
3. Set root directory
4. Add environment variables
5. Deploy automatically on push

### DigitalOcean App Platform

1. Create new app from GitHub
2. Select repository and branch
3. Configure build settings
4. Add environment variables
5. Deploy

---

## 🔐 Security Checklist

- [ ] Strong JWT secret (64+ characters)
- [ ] HTTPS enabled on all services
- [ ] Secure cookies enabled (httpOnly, secure, sameSite)
- [ ] CORS properly configured
- [ ] MongoDB network access restricted (if possible)
- [ ] Environment variables not committed to Git
- [ ] Source maps disabled in production
- [ ] Rate limiting configured
- [ ] Input validation on all endpoints

---

## 📝 Environment Variables Summary

### Backend (.env)

```
MONGO_URL=<MongoDB Atlas URI>
PORT=3002
NODE_ENV=production
TOKEN_SECRET=<64 char random string>
TOKEN_EXPIRATION=7d
FRONTEND_URL=<Deployed frontend URL>
DASHBOARD_URL=<Deployed dashboard URL>
```

### Dashboard (.env)

```
REACT_APP_API_URL=<Deployed backend URL>
REACT_APP_WS_URL=<Deployed backend URL>
NODE_ENV=production
GENERATE_SOURCEMAP=false
```

### Frontend (.env)

```
REACT_APP_API_URL=<Deployed backend URL>
REACT_APP_DASHBOARD_URL=<Deployed dashboard URL>
NODE_ENV=production
GENERATE_SOURCEMAP=false
```

---

## 🆘 Troubleshooting

### CORS Errors

- Verify FRONTEND_URL and DASHBOARD_URL in backend .env
- Check allowedOrigins in backend/index.js
- Ensure URLs have no trailing slashes

### WebSocket Connection Failed

- Verify hosting platform supports WebSocket
- Check REACT_APP_WS_URL matches backend URL
- Ensure backend port is accessible

### Authentication Issues

- Verify TOKEN_SECRET is set and consistent
- Check cookie settings (secure, httpOnly, sameSite)
- Confirm HTTPS is enabled

### Database Connection Failed

- Verify MongoDB URI is correct
- Check database user credentials
- Confirm network access allows your server IP

### Build Errors

- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version compatibility
- Verify all environment variables are set

---

## 📞 Support

For issues or questions:

1. Check browser console for errors
2. Check backend logs for server errors
3. Verify all environment variables are set correctly
4. Test API endpoints using Postman/curl
5. Review this deployment guide carefully

---

## ✨ Success!

Once deployed successfully:

- ✅ Users can sign up and create accounts
- ✅ Login and access their dashboard
- ✅ View real-time stock prices
- ✅ Buy and sell stocks
- ✅ Track their portfolio
- ✅ Monitor holdings and orders

**Your trading platform is now live! 🎉**

---

## 📌 Quick Reference URLs

After deployment, bookmark these:

- **Frontend**: https://yourdomain.com
- **Dashboard**: https://dashboard.yourdomain.com
- **Backend API**: https://api.yourdomain.com
- **MongoDB Atlas**: https://cloud.mongodb.com

---

_Last Updated: November 2025_
_Version: 1.0.0_
