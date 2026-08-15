const express = require('express');
const { pool } = require('../db/complaintDb');
const { authenticateAdmin } = require('../middleware/adminAuth.middleware');

const router = express.Router();

router.post('/outcomes', authenticateAdmin, async (req, res) => {
  const { complaintId, outcome, notes, status } = req.body;

  if (!complaintId || !outcome) {
    return res.status(400).json({
      success: false,
      error: 'complaintId and outcome are required',
    });
  }

  const normalizedStatus = status || 'PENDING';
  const adminName = req.admin?.username || 'admin';

  try {
    const result = await pool.query(
      `INSERT INTO admin_outcomes (complaint_id, outcome, notes, status, admin_username, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [complaintId, outcome, notes || '', normalizedStatus, adminName]
    );

    await pool.query(
      `UPDATE complaints SET status = $1 WHERE id = $2`,
      [normalizedStatus, complaintId]
    );

    return res.status(201).json({
      success: true,
      outcome: result.rows[0],
      message: 'Admin outcome logged successfully',
    });
  } catch (error) {
    console.error('Error logging admin outcome:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to log admin outcome',
    });
  }
});

router.get('/outcomes/:complaintId', authenticateAdmin, async (req, res) => {
  const { complaintId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM admin_outcomes
       WHERE complaint_id = $1
       ORDER BY created_at DESC`,
      [complaintId]
    );

    return res.status(200).json({
      success: true,
      outcomes: result.rows,
    });
  } catch (error) {
    console.error('Error fetching admin outcomes:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch admin outcomes',
    });
  }
});

module.exports = router;
