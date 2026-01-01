// Simple Plain Text Login (No Bcrypt)
// POST /api/auth/login
// Replace your current login endpoint with this

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  try {
    // Find user by email (case-insensitive)
    const users = await sql`
      SELECT * FROM users 
      WHERE LOWER(TRIM(email)) = LOWER(TRIM(${email.trim()}))
      LIMIT 1
    `;

    // Check if user exists
    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Compare password directly (plain text - no bcrypt)
    const storedPassword = (user.password_hash || '').trim();
    const providedPassword = password.trim();

    if (storedPassword !== providedPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check approval status (admin can bypass)
    if (user.role !== 'admin' && user.approval_status !== 'approved') {
      return res.status(403).json({
        success: false,
        error: 'Account not approved',
        message: 'Your account is pending approval. Please wait for admin approval.'
      });
    }

    // Remove password_hash from response
    const { password_hash, ...userData } = user;

    // Return success
    res.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message || 'An error occurred during login.'
    });
  }
});

