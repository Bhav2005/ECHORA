const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticateAdmin } = require('../middleware/adminAuth.middleware');

const router = express.Router();

router.post('/login', adminController.login);
router.post('/create', authenticateAdmin, adminController.createAdmin);
router.patch('/complaints/:id/status', authenticateAdmin, adminController.updateComplaintStatus);

module.exports = router;
