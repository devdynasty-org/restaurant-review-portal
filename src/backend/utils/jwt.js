// utils/jwt.js
// Helper functions for JSON Web Token operations
// Used by registration (auto-login) and login controllers
//
// Functions:
//   generateToken(user)  → returns a signed JWT string
//   verifyToken(token)   → returns the decoded payload OR null if invalid

const jwt = require('jsonwebtoken');

// ── Configuration ─────────────────────────────────────────────────────────
// These come from environment variables for security
// JWT_SECRET is loaded by app.js → dotenv at startup
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Fail fast if no secret is configured — prevents accidentally using a default
// This check runs once when the file is first loaded
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET is not set in environment variables');
}

// ── generateToken ──────────────────────────────────────────────────────────
// Creates a signed JWT for a given user
// 
// Args:
//   user - the User model instance (must have id and role)
// 
// Returns:
//   string - the signed JWT
//
// What's in the token:
//   id   - user's database id (used to look them up later)
//   role - user's role (customer/owner/admin) — used for authorization
//
// IMPORTANT: We never put password_hash, email, or sensitive data in tokens
// The token is decoded easily by anyone — only the SIGNATURE is secret
const generateToken = (user) => {
  const payload = {
    id: user.id,
    role: user.role,
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// ── verifyToken ────────────────────────────────────────────────────────────
// Verifies and decodes a JWT
// 
// Args:
//   token - the JWT string from the request header
// 
// Returns:
//   object - the decoded payload { id, role, iat, exp } if valid
//   null   - if token is invalid, expired, or tampered with
//
// Used by the auth middleware on protected routes
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // jwt.verify throws if:
    //   - Signature is invalid (tampered)
    //   - Token is malformed
    //   - Token has expired
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};