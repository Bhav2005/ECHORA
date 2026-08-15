const express = require('express');
const complaintController = require('../controllers/complaint.controller');
const { upload } = require('../services/evidenceUpload.service');
const { verifyBlindToken } = require('../middleware/tokenAuth.middleware');

const router = express.Router();

// 'evidence' matches the form parameter for attachments
router.post('/', upload.single('evidence'), verifyBlindToken, complaintController.submitComplaint);
router.get('/:id', complaintController.getComplaintById);

module.exports = router;
