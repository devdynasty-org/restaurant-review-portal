// routes/auth.js
// All authentication-related routes are grouped here
// 
// Routes defined:
//   POST /api/auth/register   - Create a new customer account
//   POST /api/auth/login      - (will add in Phase 3)
//   POST /api/auth/logout     - (will add in Phase 4)
//
// Each route chains middleware before reaching the controller:
//   Validator → Validate Handler → Controller

const express = require('express');
const router = express.Router();

// ── Import middleware ──────────────────────────────────────────────────
const registerValidator = require('../middleware/registerValidator');
const validate = require('../middleware/validate');

// ── Import controllers ─────────────────────────────────────────────────
const { register } = require('../controllers/authController');

// ── Routes ─────────────────────────────────────────────────────────────

// POST /api/auth/register
// Body: { email, password, name }
// 
// Middleware chain:
//   1. registerValidator → runs validation rules
//   2. validate          → checks if any rules failed, responds 400 if so
//   3. register          → controller runs only if validation passed
router.post('/register', registerValidator, validate, register);

// Export the router so app.js can mount it
module.exports = router;