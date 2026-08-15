const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,             // 20 OTP requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many OTP requests. Please try again later.'
    }
});

module.exports = {
    otpLimiter
};