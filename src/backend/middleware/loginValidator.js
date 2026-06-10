// middleware/loginValidator.js
// Validation rules for login requests
// Much simpler than registration — we only check presence + email format
//
// What we DON'T validate here:
//   - Password strength rules (user might have an old account)
//   - Whether email exists in DB (controller handles this with security in mind)

const { body } = require('express-validator');

const loginValidator = [
  
  // ── Email validation ─────────────────────────────────────────────────
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),  // lowercase for consistent lookup
  
  // ── Password validation ──────────────────────────────────────────────
  body('password')
    .notEmpty().withMessage('Password is required'),
];

module.exports = loginValidator;