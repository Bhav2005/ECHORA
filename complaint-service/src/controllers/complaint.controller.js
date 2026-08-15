const crypto = require('crypto');
const { pool } = require('../db/complaintDb');
const hashChainService = require('../services/hashChain.service');
const { processUpload } = require('../services/evidenceUpload.service');
const Complaint = require('../models/complaint.model');

const submitComplaint = async (req, res) => {
  const { category, department, building, content, tokenMessage, tokenSignature, mailboxId } = req.body;
  const file = req.file;

  if (!category || !department || !building || !content || !tokenMessage || !tokenSignature || !mailboxId) {
    return res.status(400).json({ success: false, error: 'All fields are required, including tokenMessage, tokenSignature, and mailboxId' });
  }

  const tokenHash = req.tokenHash; // Supplied by verifyBlindToken middleware
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Handle file upload first so data is ready before we commit the complaint.
    let evidenceUrl = null;
    if (file) {
      evidenceUrl = await processUpload(file);
    }

    // Hash chaining logic
    const previousHash = await hashChainService.getLatestBlockHash(client);
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const blockHash = hashChainService.calculateHash(
      id,
      category,
      department,
      building,
      content,
      tokenMessage,
      previousHash,
      createdAt
    );

    // Save complaint first, then mark token as used only after successful insert.
    await client.query(
      `INSERT INTO complaints 
       (id, category, department, building, content, evidence_url, token_message, token_signature, mailbox_id, previous_hash, block_hash, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [id, category, department, building, content, evidenceUrl, tokenMessage, tokenSignature, mailboxId, previousHash, blockHash, createdAt]
    );

    await client.query(
      'INSERT INTO used_tokens (token_hash) VALUES ($1)',
      [tokenHash]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted and hash-chained successfully',
      complaintId: id,
      mailboxId,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error submitting complaint:', error);
    return res.status(500).json({ success: false, error: 'Failed to submit complaint due to a server error' });
  } finally {
    client.release();
  }
};

const getComplaintById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, category, department, building, content, evidence_url, status, previous_hash, block_hash, created_at FROM complaints WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    const complaint = Complaint.fromRow(result.rows[0]);
    return res.status(200).json({ success: true, complaint });
  } catch (error) {
    console.error('Error fetching complaint by ID:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch complaint' });
  }
};

module.exports = {
  submitComplaint,
  getComplaintById,
};
