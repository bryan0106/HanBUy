# How to Run and Access HanBuy Frontend

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Access in Browser
Open your browser and go to:
```
http://localhost:3000
```

---

## Accessing Different Pages

### Public Pages (No Login Required)

#### Homepage
```
http://localhost:3000
```

#### Store Homepage
```
http://localhost:3000/store
```

#### Product Catalog
```
http://localhost:3000/store/products
```

#### Onhand Items
```
http://localhost:3000/store/products/onhand
```

#### Pre-Order Items
```
http://localhost:3000/store/products/preorder
```

#### Price Comparison
```
http://localhost:3000/store/products/kr-comparison
```

#### How It Works
```
http://localhost:3000/store/how-it-works
```

---

### Customer Dashboard (Login Required)

#### Login Page
```
http://localhost:3000/auth/login
```

**Note:** For demo, you can use any email and password to login.

#### Dashboard Overview
```
http://localhost:3000/dashboard
```

#### My Solo Box
```
http://localhost:3000/dashboard/box
```

#### Tracking
```
http://localhost:3000/dashboard/tracking
```

#### Invoices
```
http://localhost:3000/dashboard/invoices
```

#### CBM Calculator
```
http://localhost:3000/dashboard/cbm-calculator
```

#### Shipping Calculator
```
http://localhost:3000/dashboard/shipping-calculator
```

#### Penalty Calculator
```
http://localhost:3000/dashboard/penalty-calculator
```

#### Documents
```
http://localhost:3000/dashboard/documents
```

---

### Admin Dashboard (Admin Login Required)

#### Admin Dashboard
```
http://localhost:3000/admin
```

**Note:** To access admin, you need to login with an admin account. Currently using mock authentication, so you may need to modify the auth service to set admin role.

#### Admin Inventory
```
http://localhost:3000/admin/inventory
```

#### Admin Orders
```
http://localhost:3000/admin/orders
```

#### Admin Invoices
```
http://localhost:3000/admin/invoices
```

#### Admin Boxes
```
http://localhost:3000/admin/boxes
```

#### Admin Clients
```
http://localhost:3000/admin/clients
```

#### Admin Social Media
```
http://localhost:3000/admin/social
```

#### Admin Notifications
```
http://localhost:3000/admin/notifications
```

---

## Running the Application

### Development Mode
```bash
npm run dev
```
- Runs on: `http://localhost:3000`
- Hot reload enabled
- Development optimizations

### Production Build
```bash
npm run build
npm start
```
- Runs on: `http://localhost:3000`
- Optimized production build

### Check if Server is Running
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000
```

---

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
# Windows PowerShell
$env:PORT=3001; npm run dev
```

Or modify `package.json` scripts to use a different port.

### Cannot Access Localhost
1. Make sure the dev server is running
2. Check the terminal for any errors
3. Try `http://127.0.0.1:3000` instead of `localhost:3000`
4. Check firewall settings

### Page Not Found (404)
- Make sure you're using the correct URL
- Check that the route exists in `app/` directory
- Restart the dev server

### Authentication Issues
- Currently using mock authentication (localStorage)
- Any email/password works for demo
- Admin access requires role to be set to "admin" in auth service

---

## Quick Test Checklist

1. ✅ Homepage loads: `http://localhost:3000`
2. ✅ Store page loads: `http://localhost:3000/store`
3. ✅ Products page loads: `http://localhost:3000/store/products`
4. ✅ Login page loads: `http://localhost:3000/auth/login`
5. ✅ Dashboard redirects to login if not authenticated
6. ✅ Admin dashboard requires admin role

---

## Browser Console

Open browser DevTools (F12) to see:
- API URL being used: `🔗 Backend API URL: http://localhost:3001/api`
- Any errors or warnings
- Network requests (when backend is connected)

---

## Next Steps

1. **Start the frontend:**
   ```bash
   npm run dev
   ```

2. **Access in browser:**
   ```
   http://localhost:3000
   ```

3. **Test different pages:**
   - Browse public store pages
   - Login to access dashboard
   - Test admin features (if admin role is set)

4. **Connect to backend:**
   - Set up `.env.local` with backend URL
   - Update `src/services/api.ts` to use real API calls
   - Backend should be running on `http://localhost:3001/api`

