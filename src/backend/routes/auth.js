// routes/auth.js
// All authentication-related routes are grouped here
// 
// Routes defined:
//   POST /api/auth/register   - Create a new customer account
//   POST /api/auth/login      - Authenticate existing user
//   POST /api/auth/logout     - (will add in Phase 4)

const express = require('express');
const router = express.Router();

// ── Import middleware ──────────────────────────────────────────────────
const registerValidator = require('../middleware/registerValidator');
const loginValidator = require('../middleware/loginValidator');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

// ── Import controllers ─────────────────────────────────────────────────
const { register, login, getMe, logout, deleteAccount } = require('../controllers/authController');

// ── Import models for user-scoped queries ─────────────────────────────
const db = require('../models');
const { Review, Restaurant } = db;

// ── Routes ─────────────────────────────────────────────────────────────

// POST /api/auth/register
// Middleware chain: validate fields → check errors → create user
router.post('/register', registerValidator, validate, register);

// POST /api/auth/login
// Middleware chain: validate fields → check errors → authenticate
router.post('/login', loginLimiter, loginValidator, validate, login);

// GET /api/auth/me — protected route, requires authentication
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);
// DELETE /api/auth/me — CR-001 (SCRUM-284): soft-delete (anonymise) own account
router.delete('/me', authenticate, deleteAccount);

// GET /api/auth/me/reviews — all reviews submitted by the logged-in user
router.get('/me/reviews', authenticate, async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: Restaurant,
        as: 'restaurant',
        attributes: ['restaurant_id', 'name', 'cuisine_type'],
      }],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: reviews });
  } catch (err) {
    console.error('Error fetching user reviews:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});


// Export the router so app.js can mount it
module.exports = router;
