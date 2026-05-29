// middleware/registerValidator.js
// Defines validation rules specific to user registration
// These run before the registration controller
//
// What we validate:
//   - email: required, valid format, not already used
//   - password: required, minimum 8 chars, 1 uppercase, 1 number, 1 special char
//   - name: required, 2-100 characters

const { body } = require('express-validator');
const db = require('../models');

const registerValidator = [
  
  // ── Email validation ─────────────────────────────────────────────────
  body('email')
    .trim()                                          // remove leading/trailing whitespace
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail()                                // lowercase + standardize
    .custom(async (email) => {
      // Check uniqueness — query the DB
      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        // Throwing an error here makes express-validator record this as a validation failure
        throw new Error('Email is already registered');
      }
      return true;
    }),
  
  // ── Password validation ──────────────────────────────────────────────
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[^a-zA-Z0-9]/).withMessage('Password must contain at least one special character'),
  
  // ── Name validation ──────────────────────────────────────────────────
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
];

module.exports = registerValidator;