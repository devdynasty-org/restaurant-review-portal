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
    
    // Return 201 Created with user info + JWT token
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: newUser,
        token: token,
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
module.exports = {
  register,
};