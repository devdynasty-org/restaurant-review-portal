// middleware/requireRole.js
// Role-based authorization guard.
// Use AFTER the `authenticate` middleware (which populates req.user).
//
// Usage:
//   const requireRole = require('../middleware/requireRole');
//   router.post('/x', authenticate, requireRole('owner'), handler);
//   router.get('/y',  authenticate, requireRole('admin'), handler);
//   router.get('/z',  authenticate, requireRole('owner', 'admin'), handler);

'use strict';

// Accepts one or more allowed roles, returns a middleware function.
// This is a "middleware factory" — calling requireRole('owner') RETURNS
// the actual middleware, which lets us configure the allowed roles per route.
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // authenticate must run first and attach req.user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check the logged-in user's role against the allowed list
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient permissions'
      });
    }

    // Role is permitted — continue to the route handler
    next();
  };
};

module.exports = requireRole;
