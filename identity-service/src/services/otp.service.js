const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { pool } = require('../db/identityDb');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtp = async (email, code) => {
  if (process.env.NODE_ENV === 'development' || !process.env.EMAIL_USER) {
    console.log(`\n==========================================`);
    console.log(`[DEV OTP LOGGER] OTP for ${email}: ${code}`);
    console.log(`==========================================\n`);
    return true;
  }

  const mailOptions = {
    from: `"Echora Verification" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Echora Verification Code',
    text: `Your OTP verification code is: ${code}. It is valid for 5 minutes.`,
    html: `<p>Your OTP verification code is: <strong>${code}</strong>.</p><p>It is valid for 5 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send verification email');
  }
};

const requestOtp = async (email) => {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO otps (email, code, expires_at) VALUES ($1, $2, $3)`,
      [email, code, expiresAt]
    );
    await sendOtp(email, code);
  } finally {
    client.release();
  }
};

const verifyOtp = async (email, code) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM otps 
       WHERE email = $1 AND code = $2 AND verified = FALSE AND expires_at > NOW() 
       ORDER BY created_at DESC LIMIT 1`,
      [email, code]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const otpRecord = result.rows[0];
    const sessionToken = crypto.randomBytes(32).toString('hex');
    await client.query(
      `UPDATE otps SET verified = TRUE, session_token = $1 WHERE id = $2`, 
      [sessionToken, otpRecord.id]
    );
    return sessionToken;
  } finally {
    client.release();
  }
};

module.exports = {
  requestOtp,
  verifyOtp,
};
