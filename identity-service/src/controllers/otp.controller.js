const otpService = require('../services/otp.service');

const requestOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            error: 'Email is required'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid email format'
        });
    }

    try {
        await otpService.requestOtp(email);

        return res.status(200).json({
            success: true,
            message: 'OTP verification code sent'
        });

    } catch (error) {

        // Print the REAL error in the Identity Service terminal
        console.error('==========================================');
        console.error('OTP REQUEST FAILED');
        console.error('Email:', email);
        console.error('Error:', error);
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        console.error('==========================================');

        return res.status(500).json({
            success: false,
            error: 'Failed to send OTP code',
            details: process.env.NODE_ENV === 'development'
                ? error.message
                : undefined
        });
    }
};


const verifyOtp = async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({
            success: false,
            error: 'Email and OTP code are required'
        });
    }

    try {
        const sessionToken = await otpService.verifyOtp(email, code);

        if (!sessionToken) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired OTP code'
            });
        }

        return res.status(200).json({
            success: true,
            token: sessionToken
        });

    } catch (error) {

        console.error('==========================================');
        console.error('OTP VERIFICATION FAILED');
        console.error('Email:', email);
        console.error('Error:', error);
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        console.error('==========================================');

        return res.status(500).json({
            success: false,
            error: 'Verification failed',
            details: process.env.NODE_ENV === 'development'
                ? error.message
                : undefined
        });
    }
};


module.exports = {
    requestOtp,
    verifyOtp
};