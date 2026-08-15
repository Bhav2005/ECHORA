const express = require('express');
const otpController = require('../controllers/otp.controller');

const router = express.Router();

router.post('/request', otpController.requestOtp);
router.post('/verify', otpController.verifyOtp);

module.exports = router;