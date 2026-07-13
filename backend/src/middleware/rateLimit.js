const rateLimit = require('express-rate-limit');

// General api rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limit for authentication
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // Limit each IP to 15 login/register attempts per hour
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { apiLimiter, authLimiter };
