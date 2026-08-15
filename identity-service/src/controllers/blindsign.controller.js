const { pool } = require('../db/identityDb');
const blindSignService = require('../services/blindSignature.service');
const crypto = require('crypto');

const getPublicKey = (req, res) => {
  try {
    const keyInfo = blindSignService.getPublicKeyInfo();
    return res.status(200).json(keyInfo);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const signToken = async (req, res) => {
  const authHeader = req.headers.authorization;
  const { blindedMessage } = req.body;

  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authorization header is required' });
  }

  // Support both "Bearer <token>" and raw token
  const sessionToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  if (!blindedMessage) {
    return res.status(400).json({ success: false, error: 'blindedMessage is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verify session token is valid and not expired
    const result = await client.query(
      `SELECT * FROM otps WHERE session_token = $1 AND verified = TRUE AND expires_at > NOW()`,
      [sessionToken]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(401).json({ success: false, error: 'Invalid, expired, or already-used session token' });
    }

    const otpRecord = result.rows[0];

    // 2. Hash the blinded message to prevent signing identical requests
    const tokenHash = crypto.createHash('sha256').update(blindedMessage).digest('hex');

    const tokenCheck = await client.query(
      `SELECT * FROM issued_tokens WHERE token_hash = $1`,
      [tokenHash]
    );

    if (tokenCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Token has already been signed' });
    }

    // 3. Perform RSA blind signing
    const signature = blindSignService.signBlindedMessage(blindedMessage);

    // 4. Record token hash and revoke session token
    await client.query(
      `INSERT INTO issued_tokens (token_hash, email) VALUES ($1, $2)`,
      [tokenHash, otpRecord.email]
    );

    await client.query(
      `UPDATE otps SET session_token = NULL WHERE id = $1`,
      [otpRecord.id]
    );

    await client.query('COMMIT');

    return res.status(200).json({ success: true, signature });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error during token signing:', error);
    return res.status(500).json({ success: false, error: 'Internal server error during signature' });
  } finally {
    client.release();
  }
};

module.exports = {
  getPublicKey,
  signToken,
};
