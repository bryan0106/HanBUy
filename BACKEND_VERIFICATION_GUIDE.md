bun run bui;# Backend Verification Guide - Login & Token Issues

## 🔍 Problem Summary

After successful login (200 OK), `/auth/me` requests are returning **401 Unauthorized**, causing redirect loops.

## ✅ What to Check on Backend

### 1. **Login Endpoint (`POST /api/auth/login`)**

Verify the response includes a valid JWT token:

**Expected Response Format:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer",
    ...
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIuLi4iLCJlbWFpbCI6Ii4uLiIsInJvbGUiOiIuLi4iLCJpYXQiOjE2NDA5NjgwMDAsImV4cCI6MTY0MTA1NDQwMH0.xxx"
}
```

**Check:**
- ✅ Is `token` field present in the response?
- ✅ Is the token a valid JWT format?
- ✅ Does the token include: `userId`, `email`, `role`?
- ✅ Is the token signed with the correct `JWT_SECRET`?

**Backend Code Example:**
```javascript
// After successful password verification
const token = jwt.sign(
  {
    userId: user.id,
    email: user.email,
    role: user.role
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' } // or your preferred expiration
);

res.json({
  success: true,
  user: {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    // ... other fields (NO password_hash)
  },
  token: token  // ✅ Make sure this is included
});
```

### 2. **Auth Middleware (`GET /api/auth/me`)**

Verify the middleware properly reads and validates the token:

**Expected Middleware:**
```javascript
const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  
  // Check if header exists and has correct format
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      error: 'Access token required' 
    });
  }
  
  // Extract token from "Bearer <token>"
  const token = authHeader.split(' ')[1]; // Split by space, get second part
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Invalid token format' 
    });
  }
  
  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid or expired token' 
      });
    }
    
    // Attach user info to request
    req.user = decoded;
    next();
  });
};
```

**Check:**
- ✅ Is the middleware reading `req.headers['authorization']`?
- ✅ Is it splitting by space to get the token? (`Bearer <token>`)
- ✅ Is it using the same `JWT_SECRET` to verify?
- ✅ Is it handling token expiration correctly?

### 3. **Token Format Verification**

**Frontend sends:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Backend should:**
1. Read `req.headers['authorization']`
2. Split by space: `['Bearer', 'token_here']`
3. Take the second element: `token_here`
4. Verify with `jwt.verify(token, JWT_SECRET)`

### 4. **Common Backend Issues**

#### Issue 1: Token Not Returned in Login Response
**Symptom:** Login succeeds but no token in response
**Fix:** Make sure login endpoint returns `token` field

#### Issue 2: Wrong Token Secret
**Symptom:** Token generated but verification fails
**Fix:** Use same `JWT_SECRET` for signing and verification

#### Issue 3: Token Expiration Too Short
**Symptom:** Token works initially but expires quickly
**Fix:** Set appropriate expiration (e.g., `24h`)

#### Issue 4: Middleware Not Reading Header Correctly
**Symptom:** Token sent but backend doesn't see it
**Fix:** Check header name (should be lowercase `authorization`)

#### Issue 5: CORS Issues
**Symptom:** Token not sent in requests
**Fix:** Ensure CORS allows `Authorization` header:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 🧪 Testing Backend

### Test 1: Check Login Response
```bash
curl -X POST https://hanbuyapi.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer1@test.com","password":"test123"}' \
  | jq '.token'
```

**Expected:** Should return a JWT token string

### Test 2: Check Token Works with /auth/me
```bash
# First get token from login
TOKEN=$(curl -X POST https://hanbuyapi.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer1@test.com","password":"test123"}' \
  | jq -r '.token')

# Then test /auth/me with token
curl -X GET https://hanbuyapi.onrender.com/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Should return user data (200 OK), not 401

### Test 3: Check Token Format
```bash
# Decode token (first two parts are base64)
echo "YOUR_TOKEN_HERE" | cut -d. -f1,2 | base64 -d
```

**Expected:** Should show JSON with `userId`, `email`, `role`

## 🔧 Backend Code Checklist

### Login Endpoint (`/api/auth/login`)
- [ ] Verifies password with `bcrypt.compare()`
- [ ] Checks `approval_status` (reject if not approved, unless admin)
- [ ] Generates JWT token with `jwt.sign()`
- [ ] Returns `{ success: true, user: {...}, token: "..." }`
- [ ] Does NOT return `password_hash` in user object

### Auth Middleware (`authenticateToken`)
- [ ] Reads `req.headers['authorization']`
- [ ] Splits by space to extract token
- [ ] Verifies token with `jwt.verify()`
- [ ] Uses same `JWT_SECRET` as login
- [ ] Handles errors (401 for invalid/expired tokens)
- [ ] Attaches `req.user` with decoded token data

### /auth/me Endpoint
- [ ] Uses `authenticateToken` middleware
- [ ] Returns user data from database (not just from token)
- [ ] Returns same format as login: `{ success: true, user: {...} }`

## 📝 Backend Response Format

### Login Response (200 OK)
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer",
    "client_level": "solobox",
    "approval_status": "approved",
    ...
  },
  "token": "jwt_token_string_here"
}
```

### /auth/me Response (200 OK)
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer",
    ...
  }
}
```

### Error Response (401 Unauthorized)
```json
{
  "success": false,
  "error": "Invalid or expired token",
  "message": "Invalid or expired token"
}
```

## 🚨 Most Likely Issues

Based on the 401 errors after successful login:

1. **Token not in login response** - Check if backend returns `token` field
2. **Token verification failing** - Check if `JWT_SECRET` matches
3. **Header not read correctly** - Check middleware reads `authorization` header
4. **Token format issue** - Check token is valid JWT format

## ✅ Quick Fix Checklist

If backend needs changes:

1. **Login endpoint:**
   ```javascript
   // After password verification
   const token = jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '24h' });
   res.json({ success: true, user: userData, token });
   ```

2. **Auth middleware:**
   ```javascript
   const token = req.headers['authorization']?.split(' ')[1];
   jwt.verify(token, JWT_SECRET, (err, decoded) => { ... });
   ```

3. **/auth/me endpoint:**
   ```javascript
   router.get('/me', authenticateToken, async (req, res) => {
     const user = await getUserById(req.user.userId);
     res.json({ success: true, user });
   });
   ```

## 📞 Next Steps

1. **Check backend logs** - Look for token verification errors
2. **Test with curl** - Verify token is returned and works
3. **Check JWT_SECRET** - Ensure it's set and matches
4. **Verify middleware** - Ensure it's applied to `/auth/me`

If all backend checks pass, the issue might be frontend token handling (which we've already fixed).
