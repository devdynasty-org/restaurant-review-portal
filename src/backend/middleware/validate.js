// middleware/validate.js
// Generic validation result handler
// Runs after express-validator rules to check if any errors were collected
// If errors found → respond 400 with error details
// If no errors → continue to the controller
//
// Usage in routes:
//   router.post('/path', validationRules, validate, controller)
//                                          ↑ this file

const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  // Collect any validation errors that previous middleware added to the request
  const errors = validationResult(req);
  
  // If there are no errors, continue to the controller
  if (errors.isEmpty()) {
    return next();
  }
  
  // There are errors — format them and respond with 400 Bad Request
  // We map to a clean structure: { field, message }
  // This makes it easy for the frontend to show field-specific errors
  const formattedErrors = errors.array().map(err => ({
    field: err.path,
    message: err.msg,
  }));
  
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: formattedErrors,
  });
};

module.exports = validate;