// middleware/auth.js
// Protects routes by requiring a valid JWT in the Authorization header
//
// Usage in routes:
//   router.get('/protected', authenticate, controller)
//
// How it works:
//   1. Extracts the JWT from "Authorization: Bearer <token>" header
//   2. Verifies the token signature with JWT_SECRET
//   3. Loads the full user record from DB
//   4. Attaches the user to req.user
//   5. Calls next() — controller can now access req.user
//
// If any step fails → responds 401 Unauthorized, controller never runs

const { verifyToken } = require('../utils/jwt');
const db = require('../models');

const authenticate = async (req, res, next) => {
  try {
// ── Step 1: Extract token from cookie OR Authorization header ────
    // We support both methods:
    //   - Cookie: Set automatically by browser after login (preferred for web app)
    //   - Header: For API clients, mobile apps, Thunder Client testing
    
    let token = null;
    
    // First check cookie (preferred)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Fall back to Authorization header
    else if (req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided',
      });
    }
    
    // ── Step 3: Verify the token signature and decode it ──────────────
    // verifyToken returns null if invalid/expired/tampered
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
    
    // ── Step 4: Load the user from DB ─────────────────────────────────
    // Even with a valid token, the user might have been deleted/suspended
    // We always check the current state of the user account
    const user = await db.User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }
    
    // ── Step 5: Check account is still active ─────────────────────────
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended',
      });
    }
    
    // ── Step 6: Attach user to request and continue ───────────────────
    // Now req.user is available in all subsequent middleware and controllers
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

module.exports = authenticate;