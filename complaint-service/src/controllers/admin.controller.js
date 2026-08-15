const jwt = require('jsonwebtoken');
const { pool } = require('../db/complaintDb');
const dotenv = require('dotenv');
const Admin = require('../models/admin.model');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'complaint_jwt_secret_key_54321';

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    const admin = Admin.fromRow(result.rows[0]);
    const isPasswordValid = await admin.verifyPassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      success: true,
      token,
      admin: { id: admin.id, username: admin.username }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error during login' });
  }
};

const createAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required' });
  }

  try {
    // Hash password
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO admins (username, password_hash) VALUES ($1, $2)',
      [username, hash]
    );

    return res.status(201).json({ success: true, message: `Admin user '${username}' created successfully` });
  } catch (error) {
    console.error('Create admin error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ success: false, error: 'Username already exists' });
    }
    return res.status(500).json({ success: false, error: 'Failed to create admin user' });
  }
};

const updateComplaintStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, error: 'Status is required' });
  }

  // Validate status value
  const allowedStatuses = ['PENDING', 'INVESTIGATING', 'RESOLVED', 'ESCALATED'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status value' });
  }

  try {
    const result = await pool.query(
      'UPDATE complaints SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    return res.status(200).json({ success: true, complaint: result.rows[0] });
  } catch (error) {
    console.error('Update complaint status error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update complaint status' });
  }
};

module.exports = {
  login,
  createAdmin,
  updateComplaintStatus,
};
