const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserSignup = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Employee validation rules
const validateEmployee = [
  body('first_name')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('last_name')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('position')
    .notEmpty()
    .withMessage('Position is required')
    .isLength({ max: 100 })
    .withMessage('Position cannot exceed 100 characters'),
  body('salary')
    .isNumeric()
    .withMessage('Salary must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Salary cannot be negative');
      }
      return true;
    }),
  body('date_of_joining')
    .isISO8601()
    .withMessage('Please provide a valid date for date_of_joining'),
  body('department')
    .notEmpty()
    .withMessage('Department is required')
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters'),
  handleValidationErrors
];

const validateEmployeeUpdate = [
  body('first_name')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('last_name')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('position')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Position cannot exceed 100 characters'),
  body('salary')
    .optional()
    .isNumeric()
    .withMessage('Salary must be a number')
    .custom((value) => {
      if (value < 0) {
        throw new Error('Salary cannot be negative');
      }
      return true;
    }),
  body('date_of_joining')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date for date_of_joining'),
  body('department')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters'),
  handleValidationErrors
];

const validateEmployeeId = [
  param('eid')
    .isMongoId()
    .withMessage('Invalid employee ID format'),
  handleValidationErrors
];

const validateEmployeeQuery = [
  query('eid')
    .isMongoId()
    .withMessage('Invalid employee ID format'),
  handleValidationErrors
];

module.exports = {
  validateUserSignup,
  validateUserLogin,
  validateEmployee,
  validateEmployeeUpdate,
  validateEmployeeId,
  validateEmployeeQuery,
  handleValidationErrors
};
