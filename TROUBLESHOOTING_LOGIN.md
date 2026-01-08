# Troubleshooting Login Errors

## Common Login Error: "Login error: {}"

If you're seeing an empty error object `{}` or "Login error: {}", this usually indicates one of the following issues:

### 1. API Server Not Running

**Symptom:** Empty error object, network error in console

**Solution:**
1. Check if your backend API server is running
2. Verify the API URL in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```
3. Test the API endpoint directly:
   ```bash
   curl http://localhost:3001/api/health
   ```

### 2. CORS Configuration Issue

**Symptom:** Network error, CORS error in browser console

**Solution:**
- Ensure your backend API has CORS configured to allow requests from `http://localhost:3000` (or your frontend URL)
- Check backend CORS settings include your frontend origin

### 3. Wrong API URL

**Symptom:** Network error, connection refused

**Solution:**
1. Check `.env.local` file exists and has correct URL
2. Restart Next.js dev server after changing `.env.local`:
   ```bash
   npm run dev
   ```
3. Check browser console for the API URL being used (should log: `🔗 Backend API URL: ...`)

### 4. Invalid Credentials

**Symptom:** 401 Unauthorized error

**Solution:**
- Verify you're using correct email and password
- Check if account is approved (non-admin users need approval)
- Try test accounts from the login page

### 5. Backend API Error

**Symptom:** Error with status code (400, 500, etc.)

**Solution:**
- Check backend server logs
- Verify database connection
- Check API endpoint implementation

## Debugging Steps

### Step 1: Check API Connection

Open browser console and check:
1. Look for: `🔗 Backend API URL: http://localhost:3001/api`
2. Check Network tab for failed requests
3. Look for detailed error logs (now improved with better error messages)

### Step 2: Test API Directly

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test login endpoint
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Step 3: Check Environment Variables

1. Verify `.env.local` exists in project root
2. Check it contains:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```
3. Restart dev server after changes

### Step 4: Check Error Details

The improved error handling now shows:
- Error message
- HTTP status code
- Error code
- Original error details

Check browser console for detailed error information.

## Improved Error Messages

The error handling has been improved to show:
- **Network errors**: "Network error. Please check your connection and try again."
- **Timeout errors**: "Request timeout. Please try again."
- **401 errors**: "Unauthorized. Please log in again."
- **API errors**: Specific error message from backend

## Still Having Issues?

1. Check browser console for detailed error logs
2. Check Network tab in DevTools for failed requests
3. Verify backend API is running and accessible
4. Check `.env.local` configuration
5. Restart both frontend and backend servers
