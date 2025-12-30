# Backend URL Configuration

## Current Setup

The frontend is configured to connect to a backend API. Here's how to configure it:

### Environment Variable

Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Or for production:
```env
NEXT_PUBLIC_API_URL=https://api.hanbuy.com/api
```

### Backend URL Structure

**Base URL Format:**
```
{PROTOCOL}://{HOST}:{PORT}/api
```

**Examples:**
- Local Development: `http://localhost:3001/api`
- Staging: `https://staging-api.hanbuy.com/api`
- Production: `https://api.hanbuy.com/api`

### Where It's Used

The backend URL is referenced in:
- `src/services/api.ts` - Main API service file
- All API service functions use `API_BASE_URL` constant

### Current Configuration

Currently, the code uses:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
```

This means:
- If `NEXT_PUBLIC_API_URL` is set in `.env.local`, it will use that
- Otherwise, it defaults to `http://localhost:3001/api`

### Testing Backend Connection

To test if your backend is accessible:

1. **Check if backend is running:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Test authentication endpoint:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

3. **Check from browser console:**
   ```javascript
   fetch('http://localhost:3001/api/health')
     .then(res => res.json())
     .then(data => console.log(data))
   ```

### CORS Configuration

Make sure your backend has CORS configured to allow requests from your frontend:

**For Express.js backend:**
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true
}));
```

**For Next.js API routes:**
CORS is handled automatically if using Next.js API routes.

### Quick Setup Steps

1. **Create `.env.local` file:**
   ```bash
   echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
   ```

2. **Restart Next.js dev server:**
   ```bash
   npm run dev
   ```

3. **Verify the URL is loaded:**
   Check browser console or add a log in `src/services/api.ts`:
   ```typescript
   console.log('API Base URL:', API_BASE_URL);
   ```

### Backend Endpoints Reference

All backend endpoints should follow this structure:

```
{API_BASE_URL}/auth/login
{API_BASE_URL}/products
{API_BASE_URL}/orders
{API_BASE_URL}/invoices
{API_BASE_URL}/boxes
{API_BASE_URL}/tracking/:id
{API_BASE_URL}/admin/dashboard/stats
... etc
```

See `API_ENDPOINTS.md` for complete endpoint documentation.

### Troubleshooting

**Issue: CORS errors**
- Solution: Configure CORS on backend to allow frontend origin

**Issue: 404 Not Found**
- Solution: Check backend is running and URL is correct

**Issue: Connection refused**
- Solution: Backend server is not running on the specified port

**Issue: Environment variable not loading**
- Solution: Restart Next.js dev server after changing `.env.local`

