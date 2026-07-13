const express = require('express');
const router = express.Router();
const { register, verifyEmail, login, googleLogin, forgotPassword, resetPassword, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

router.post('/register', authLimiter, register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', authLimiter, login);
router.post('/google-login', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
