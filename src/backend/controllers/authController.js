// controllers/authController.js
// Handles all authentication-related business logic
// Each function takes (req, res, next) and:
//   1. Pulls validated data from request
//   2. Performs the business operation
//   3. Sends a response
//
// IMPORTANT: This file assumes validation has already passed
// All input here is trusted (cleaned by middleware)

const db = require('../models');
const { generateToken } = require('../utils/jwt');

// ── Register a new user ───────────────────────────────────────────────────
// POST /api/auth/register
// Body: { email, password, name }
// 
// Flow:
//   1. Extract validated fields from request body
//   2. Call User.create() — Sequelize hooks will hash the password
//   3. Return 201 Created with user info (password_hash auto-stripped by toJSON)
//   4. Catch any unexpected database errors
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Create the user
    // The beforeCreate hook on the User model hashes the password
    // The toJSON override on the model strips password_hash from the response
    const newUser = await db.User.create({
      email,
      password_hash: password,  // model's beforeCreate hook hashes this
      name,
      role: 'customer',          // all registrations are customers by default
                                  // (admin/owner accounts created differently)
    });
    
   // Generate a JWT for the newly registered user — auto-login
   const token = generateToken(newUser);
    
   // Set the JWT as an httpOnly cookie (same as login)
   res.cookie('token', token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'lax',
     maxAge: 24 * 60 * 60 * 1000,
   });
   
   // Return 201 Created with user info (no token in body — it's in the cookie)
   return res.status(201).json({
     success: true,
     message: 'Account created successfully',
     data: {
       user: newUser,
     },
   });
    
  } catch (error) {
    // Log full error for debugging — but never send error details to client
    // (could leak DB structure, file paths, stack traces)
    console.error('Registration error:', error);
    
    // Handle Sequelize unique constraint error specifically
    // (in theory the validator catches this, but defence in depth)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered',
      });
    }
    
    // Handle Sequelize validation errors (shouldn't reach here if middleware works)
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(e => ({ field: e.path, message: e.message })),
      });
    }
    
    // Catch-all for any other unexpected errors
    return res.status(500).json({
      success: false,
      message: 'An error occurred while creating your account',
    });
  }
};

// ── Export ────────────────────────────────────────────────────────────────
// We export an object so we can add login/logout etc. later
// Usage in routes: const { register } = require('../controllers/authController')
// ── Login an existing user ────────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
//
// Security note: We deliberately give the same error for "email not found"
// vs "wrong password" to prevent attackers enumerating valid emails.
// Same error, same HTTP status code, same response shape.
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // ── Step 1: Find user by email ────────────────────────────────────
    const user = await db.User.findOne({ where: { email } });
    
    // ── Step 2: User doesn't exist — respond generically ──────────────
    // We use 401 Unauthorized — appropriate for failed authentication
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    
    // ── Step 3: Compare password using the model's method ─────────────
    // comparePassword uses bcrypt.compare — handles salt extraction
    const isPasswordValid = await user.comparePassword(password);
    
    // ── Step 4: Password wrong — same generic response ────────────────
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    
    // ── Step 5: Check account status ──────────────────────────────────
    // Admin may have suspended this account
    // We DO tell the user this — they need to know to contact support
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended. Please contact support.',
      });
    }
    
    // ── Step 6: Success — generate JWT and set as httpOnly cookie ────
    const token = generateToken(user);
    
    // Set the JWT as an httpOnly cookie
    // The browser will automatically send this cookie with every subsequent request
    // JavaScript cannot read this cookie (httpOnly flag) → protects against XSS
    res.cookie('token', token, {
      httpOnly: true,                              // not accessible via JS
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      sameSite: 'lax',                             // CSRF protection
      maxAge: 24 * 60 * 60 * 1000,                 // 24 hours in milliseconds
    });
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user,    // toJSON strips password_hash automatically
      },
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login',
    });
  }
};

// ── Logout the current user ───────────────────────────────────────────────
// POST /api/auth/logout
// Requires: Valid JWT (auth middleware protects this route)
//
// What it does:
//   1. Clears the httpOnly token cookie from the browser
//   2. Returns 200 success
//
// Why protect with auth middleware:
//   - You shouldn't be able to log out someone else
//   - Logout actions could be logged for audit (future)
//   - Prevents random POST /logout calls
const logout = async (req, res) => {
  // Clear the cookie by setting it to empty with immediate expiry
  // Cookie options MUST match what was used when setting the cookie
  // Otherwise browser sees them as different cookies and won't clear it
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// ── Get current user (used by frontend to check who's logged in) ──────────
// GET /api/auth/me
// Requires: Valid JWT in Authorization header
// 
// The auth middleware attaches req.user before this runs
// We just need to return it
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user,  // attached by authenticate middleware
    },
  });
};

// ── Export both functions ─────────────────────────────────────────────────
module.exports = {
  register,
  login,
  getMe,
  logout,
};