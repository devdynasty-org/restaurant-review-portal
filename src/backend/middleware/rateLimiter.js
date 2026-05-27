// middleware/rateLimiter.js
// Rate limiting middleware to prevent brute-force attacks
//
// Strategy:
//   - Login endpoint: 5 attempts per 15 minutes per IP
//   - After limit hit: 429 Too Many Requests for the remainder of the window
//
// How it works:
//   - express-rate-limit tracks request counts per IP in memory
//   - Resets the counter every window (15 minutes)
//   - Sends standard rate-limit headers in responses (RateLimit-*)

const rateLimit = require('express-rate-limit');

// ── Login Rate Limiter ────────────────────────────────────────────────────
// Prevents brute-force password guessing
// 
// Industry standard: 5 attempts per 15 minutes
// More than 5 wrong tries from one IP in 15 minutes → temporarily blocked
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,             // 15 minutes in milliseconds
  max: 5,                                // max 5 requests per window per IP
  
  // Standard HTTP rate-limit headers (RateLimit-Limit, RateLimit-Remaining etc.)
  standardHeaders: true,
  
  // Disable the legacy X-RateLimit-* headers (deprecated)
  legacyHeaders: false,
  
  // Only count failed login attempts (not successful ones)
  // This prevents users from being locked out after legitimate logins
  skipSuccessfulRequests: true,
  
  // Custom response when limit is hit
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
});

module.exports = {
  loginLimiter,
};