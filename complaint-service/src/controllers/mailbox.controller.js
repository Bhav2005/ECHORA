const { pool } = require('../db/complaintDb');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Complaint = require('../models/complaint.model');
const MailboxMessage = require('../models/mailbox.model');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'complaint_jwt_secret_key_54321';

const getMailboxMessages = async (req, res) => {
  const { mailboxId } = req.params;

  if (!mailboxId) {
    return res.status(400).json({ success: false, error: 'mailboxId is required' });
  }

  try {
    // Verify complaint/mailbox exists
    const complaintResult = await pool.query(
      'SELECT id, category, department, building, content, evidence_url, status, created_at FROM complaints WHERE mailbox_id = $1',
      [mailboxId]
    );

    if (complaintResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Mailbox not found' });
    }

    const complaint = Complaint.fromRow(complaintResult.rows[0]);

    // Fetch message history
    const repliesResult = await pool.query(
      'SELECT id, sender, content, created_at FROM replies WHERE mailbox_id = $1 ORDER BY created_at ASC',
      [mailboxId]
    );

    const replies = repliesResult.rows.map(r => MailboxMessage.fromRow(r));

    return res.status(200).json({
      success: true,
      complaint,
      replies,
    });
  } catch (error) {
    console.error('Error checking mailbox:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve mailbox messages' });
  }
};

const addReply = async (req, res) => {
  const { mailboxId } = req.params;
  const { content } = req.body;

  if (!mailboxId || !content) {
    return res.status(400).json({ success: false, error: 'mailboxId and content are required' });
  }

  // Determine sender type (ADMIN or USER) by checking if a valid admin JWT is provided
  let sender = 'USER';
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
      jwt.verify(token, JWT_SECRET);
      sender = 'ADMIN';
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid admin authentication token' });
    }
  }

  try {
    const complaintCheck = await pool.query(
      'SELECT 1 FROM complaints WHERE mailbox_id = $1',
      [mailboxId]
    );

    if (complaintCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Mailbox does not exist' });
    }

    const result = await pool.query(
      'INSERT INTO replies (mailbox_id, sender, content) VALUES ($1, $2, $3) RETURNING *',
      [mailboxId, sender, content]
    );

    return res.status(201).json({
      success: true,
      reply: MailboxMessage.fromRow(result.rows[0]),
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    return res.status(500).json({ success: false, error: 'Failed to add message' });
  }
};

module.exports = {
  getMailboxMessages,
  addReply,
};
