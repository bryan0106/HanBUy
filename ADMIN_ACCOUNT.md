# Default Admin Account

## Admin Login Credentials

**Email:** `admin@hanbuy.com`  
**Password:** `admin`

## How to Login as Admin

1. Go to: `http://localhost:3000/auth/login`
2. Enter:
   - Email: `admin@hanbuy.com`
   - Password: `admin`
3. Click "Sign In"
4. You will be redirected to: `http://localhost:3000/admin`

## Admin Access

Once logged in as admin, you can access:

- **Admin Dashboard:** `http://localhost:3000/admin`
- **Inventory Management:** `http://localhost:3000/admin/inventory`
- **Order Management:** `http://localhost:3000/admin/orders`
- **Invoice Management:** `http://localhost:3000/admin/invoices`
- **Box Tracking:** `http://localhost:3000/admin/boxes`
- **Client Management:** `http://localhost:3000/admin/clients`
- **Social Media:** `http://localhost:3000/admin/social`
- **Notifications:** `http://localhost:3000/admin/notifications`

## Security Note

⚠️ **Important:** This is a default demo account for development only.

For production:
- Change the default password
- Implement proper password hashing
- Use secure authentication (JWT tokens)
- Store credentials in secure database
- Implement password reset functionality
- Add two-factor authentication (optional)

## Testing Admin Features

1. Login with admin credentials
2. Access admin dashboard
3. All admin routes are protected and require admin role
4. Regular customers cannot access `/admin/*` routes

## Other Demo Accounts

- **Regular Customer:** Use any email and password (e.g., `customer@example.com` / `password123`)
- **Solo Box Client:** Requires admin approval (set in admin panel)

