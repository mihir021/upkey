const express = require('express');
const { signup, login, getMe } = require('../controllers/auth.controller');
const { validateSignup, validateLogin } = require('../middleware/validate.middleware');
const requireAuth = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.get('/me', requireAuth, getMe);

module.exports = router;
