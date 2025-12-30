# Troubleshooting Guide - Admin Login Issues

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

