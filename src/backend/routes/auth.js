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

// ── Import controllers ─────────────────────────────────────────────────
const { register, login, getMe } = require('../controllers/authController');

// ── Routes ─────────────────────────────────────────────────────────────

// POST /api/auth/register
// Middleware chain: validate fields → check errors → create user
router.post('/register', registerValidator, validate, register);

// POST /api/auth/login
// Middleware chain: validate fields → check errors → authenticate
router.post('/login', loginValidator, validate, login);

// GET /api/auth/me — protected route, requires authentication
router.get('/me', authenticate, getMe);

// Export the router so app.js can mount it
module.exports = router;
