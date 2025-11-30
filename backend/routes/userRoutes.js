const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/userController');
const { validateUserSignup, validateUserLogin } = require('../middleware/validation');

// POST /api/v1/user/signup - Create new user account
router.post('/signup', validateUserSignup, signup);

// POST /api/v1/user/login - User login
router.post('/login', validateUserLogin, login);

module.exports = router;
