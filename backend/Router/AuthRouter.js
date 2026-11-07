const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../Controllers/AuthController');
const isAuthenticated = require('../Middleware/isAuthenticated');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', isAuthenticated, logout);

module.exports = router;

