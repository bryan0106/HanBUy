# Vercel Deployment - API Connection Guide

## Current Status Check

### ✅ Good News
Your code is **configured** to connect to the production API:
- **Default API URL**: `https://hanbuyapi.onrender.com/api`
- This is set in both:
  - `src/lib/apiClient.ts` (new API client)
  - `src/services/api.ts` (old API service)

### ⚠️ What You Need to Verify

## 1. Check Environment Variable in Vercel

Your Vercel deployment **MUST** have the environment variable set:

### Steps to Check/Set in Vercel:

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Look for: `NEXT_PUBLIC_API_URL`
4. If it doesn't exist, **add it**:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://hanbuyapi.onrender.com/api`
   - **Environment**: Select all (Production, Preview, Development)
5. **Redeploy** your application after adding/updating the variable

### Why This Matters:
- Without the environment variable, it will use the default (`https://hanbuyapi.onrender.com/api`)
- But it's better to explicitly set it for clarity and flexibility

## 2. Verify Backend API is Running

Check if your backend API is actually running and connected to the database:

### Test the API:
```bash
# Test health endpoint
curl https://hanbuyapi.onrender.com/api/health

# Test products endpoint
curl https://hanbuyapi.onrender.com/api/products

# Test auth endpoint (should return error without credentials, but not 404)
curl -X POST https://hanbuyapi.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

### What to Look For:
- ✅ **200 OK** or **401 Unauthorized** = API is running
- ❌ **404 Not Found** = API endpoint doesn't exist
- ❌ **Connection refused** = API server is down
- ❌ **CORS error** = API is running but CORS not configured

## 3. Check Database Connection

Your backend API needs to be connected to a database. Check:

1. **Backend logs** (Render dashboard):
   - Look for database connection errors
   - Check if migrations ran successfully
   - Verify database credentials are set

2. **API responses**:
   - If API returns empty arrays `[]`, database might be empty but connected
   - If API returns errors, database might not be connected

## 4. Verify CORS Configuration

Your backend must allow requests from your Vercel domain:

### Backend CORS should include:
```javascript
// Example Express.js CORS config
const cors = require('cors');
app.use(cors({
  origin: [
    'https://your-vercel-app.vercel.app',  // Your Vercel URL
    'https://your-custom-domain.com',       // Your custom domain (if any)
    'http://localhost:3000'                 // For local development
  ],
  credentials: true
}));
```

## 5. Test Your Vercel Deployment

### In Browser Console (on your Vercel site):
```javascript
// Check what API URL is being used
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

// Test API connection
fetch('https://hanbuyapi.onrender.com/api/health')
  .then(res => res.json())
  .then(data => console.log('✅ API Connected:', data))
  .catch(err => console.error('❌ API Error:', err));
```

### Check Network Tab:
1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to load products or login
4. Look for API requests to `hanbuyapi.onrender.com`
5. Check response status:
   - **200** = Success ✅
   - **401** = Auth needed (normal for protected routes)
   - **404** = Endpoint not found ❌
   - **CORS error** = CORS not configured ❌
   - **Network error** = API server down ❌

## Quick Checklist

Before your Vercel site can connect to the API:

- [ ] Environment variable `NEXT_PUBLIC_API_URL` is set in Vercel
- [ ] Backend API is deployed and running on Render
- [ ] Backend API is connected to database
- [ ] CORS is configured to allow your Vercel domain
- [ ] Backend API endpoints are working (test with curl)
- [ ] Database has data (or at least tables created)

## Common Issues

### Issue 1: "Network Error" in Browser
**Cause**: Backend API is not running or not accessible
**Solution**: 
- Check Render dashboard - is the service running?
- Test API directly with curl
- Check API logs for errors

### Issue 2: "CORS Error"
**Cause**: Backend doesn't allow requests from your Vercel domain
**Solution**: 
- Update CORS configuration in backend
- Add your Vercel URL to allowed origins

### Issue 3: "404 Not Found"
**Cause**: API endpoint doesn't exist or URL is wrong
**Solution**: 
- Verify API routes are deployed
- Check API base URL is correct
- Test endpoints directly

### Issue 4: "Empty Data / No Products"
**Cause**: Database is empty or not connected
**Solution**: 
- Check database connection in backend logs
- Run database migrations
- Seed database with test data

## How to Verify Everything is Working

1. **Visit your Vercel URL**
2. **Open Browser Console** (F12)
3. **Try to login** or **browse products**
4. **Check Network tab** for API calls
5. **Look for**:
   - ✅ Successful API calls (200 status)
   - ✅ Data being returned
   - ✅ No CORS errors
   - ✅ No network errors

## Next Steps

1. **Set environment variable in Vercel** (if not already set)
2. **Test backend API** directly
3. **Check backend logs** for database connection
4. **Test your Vercel deployment** with browser console
5. **Fix any CORS issues** if found

## Need Help?

If you're still having issues:
1. Check Vercel deployment logs
2. Check Render backend logs
3. Test API endpoints directly
4. Check browser console for specific errors
