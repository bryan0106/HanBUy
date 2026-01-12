# Troubleshooting Guide

## Problem: Network Error - Could Not Connect to Login Service

### Error Message:
```
Network error: Could not connect to login service
```

### Root Cause:
The frontend cannot reach the backend API server. This happens when:
- Backend server is not running
- Incorrect API URL configuration
- CORS (Cross-Origin Resource Sharing) issues
- Network connectivity problems
- Backend service is down or unreachable

### Solution Steps:

#### 1. **Check Backend Server Status**
   - Verify if your backend server is running
   - Check the backend server logs for errors
   - Ensure the backend is listening on the correct port

#### 2. **Verify API URL Configuration**
   - Check your `.env.local` file in the project root
   - Should contain: `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
   - Or for production: `NEXT_PUBLIC_API_URL=https://your-api-domain.com/api`
   - **Important:** Restart Next.js dev server after changing `.env.local`

#### 3. **Check Current API URL**
   - Open browser console (F12)
   - Look for: `🔗 Backend API URL: ...`
   - Verify it matches your backend server URL

#### 4. **Test Backend Connection**
   - Open browser console (F12)
   - Run this command:
   ```javascript
   fetch('http://localhost:3001/api/health')
     .then(res => res.json())
     .then(data => console.log('Backend is reachable:', data))
     .catch(err => console.error('Backend connection failed:', err))
   ```
   - If this fails, your backend is not accessible

#### 5. **CORS Configuration**
   - If backend is running but still getting errors, check CORS settings
   - Backend must allow requests from your frontend origin
   - For Express.js, add:
   ```javascript
   const cors = require('cors');
   app.use(cors({
     origin: 'http://localhost:3000', // Your frontend URL
     credentials: true
   }));
   ```

#### 6. **Quick Fix - Create .env.local**
   ```bash
   # In project root directory
   echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
   ```
   Then restart your Next.js server: `npm run dev`

### Common Scenarios:

**Scenario 1: Backend Not Running**
- **Symptom:** Network error immediately
- **Fix:** Start your backend server first, then try login again

**Scenario 2: Wrong Port**
- **Symptom:** Network error, backend running on different port
- **Fix:** Update `.env.local` with correct port number

**Scenario 3: Backend on Different Host**
- **Symptom:** Network error, backend on remote server
- **Fix:** Update `.env.local` with full URL: `https://your-api-domain.com/api`

**Scenario 4: CORS Blocking**
- **Symptom:** Network error in browser, but backend logs show request received
- **Fix:** Configure CORS on backend to allow frontend origin

### Debug Information:
When the error occurs, check browser console for:
- Attempted URL
- API Base URL
- Error type and message
- Network tab in DevTools for failed requests

---

## Problem: Admin Login Issues

## Problem: Cannot Access Admin Dashboard

### Solution Steps:

1. **Clear Browser Storage**
   - Open Browser DevTools (F12)
   - Go to Application/Storage tab
   - Clear Local Storage
   - Remove `hanbuy_user` key
   - Refresh the page

2. **Login Steps:**
   - Go to: `http://localhost:3000/auth/login`
   - Enter Email: `admin@hanbuy.com`
   - Enter Password: `admin`
   - Click "Sign In"
   - Should redirect to: `http://localhost:3000/admin`

3. **Check Browser Console:**
   - Open DevTools (F12)
   - Check Console for any errors
   - Check if user object is stored in localStorage

4. **Verify Admin Role:**
   - After login, check localStorage:
   ```javascript
   JSON.parse(localStorage.getItem('hanbuy_user'))
   ```
   - Should show: `{ role: "admin", ... }`

5. **Direct Admin Access:**
   - Try accessing: `http://localhost:3000/admin`
   - If not logged in, should redirect to login
   - After login, should access admin dashboard

### Common Issues:

**Issue: Redirects to /dashboard instead of /admin**
- **Fix:** Make sure you're using `admin@hanbuy.com` (not just "admin")
- The login page now automatically detects admin role and redirects correctly

**Issue: "Admin access required" error**
- **Fix:** You're logged in as a customer, not admin
- Logout and login again with `admin@hanbuy.com` / `admin`

**Issue: Stuck on loading screen**
- **Fix:** Clear localStorage and refresh
- Check browser console for errors

**Issue: Page not found (404)**
- **Fix:** Make sure dev server is running: `npm run dev`
- Check that route exists: `app/(admin)/admin/page.tsx`

### Quick Test:

1. Open browser console (F12)
2. Run this to check current user:
   ```javascript
   console.log(JSON.parse(localStorage.getItem('hanbuy_user')))
   ```
3. Should show admin user if logged in correctly

### Manual Admin Login (Browser Console):

If login form doesn't work, you can manually set admin in console:
```javascript
localStorage.setItem('hanbuy_user', JSON.stringify({
  id: 'admin-1',
  email: 'admin@hanbuy.com',
  name: 'Admin',
  role: 'admin',
  isAuthenticated: true
}));
window.location.href = '/admin';
```


