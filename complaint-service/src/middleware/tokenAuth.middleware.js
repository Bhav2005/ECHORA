const crypto = require('crypto');
const { pool } = require('../db/complaintDb');
const tokenVerificationService = require('../services/tokenVerification.service');

const verifyBlindToken = async (req, res, next) => {
  const { tokenMessage, tokenSignature } = req.body;

  if (!tokenMessage || !tokenSignature) {
    return res.status(400).json({ 
      success: false, 
      error: 'Cryptographic tokenMessage and tokenSignature are required' 
    });
  }

  try {
    // 1. Verify token hasn't been used yet (Double-spending check)
    const tokenHash = crypto.createHash('sha256').update(tokenMessage).digest('hex');
    
    const usedCheck = await pool.query(
      'SELECT 1 FROM used_tokens WHERE token_hash = $1',
      [tokenHash]
    );

    if (usedCheck.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'This cryptographic token has already been spent/used' 
      });
    }

    // 2. Cryptographically verify signature
    const isValidSignature = await tokenVerificationService.verifyToken(tokenMessage, tokenSignature);
    if (!isValidSignature) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid cryptographic token signature' 
      });
    }

    // Save token hash to request for the controller to insert upon successful submission
    req.tokenHash = tokenHash;
    next();
  } catch (error) {
    console.error('[Token Auth Middleware] Verification error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error during token verification' 
    });
  }
};

module.exports = {
  verifyBlindToken,
};
