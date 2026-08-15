const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authenticateAdmin } = require('../middleware/adminAuth.middleware');

const router = express.Router();

router.use(authenticateAdmin);

router.get('/stats', dashboardController.getStats);
router.get('/heatmap', dashboardController.getHeatmap);
router.get('/complaints', dashboardController.getComplaints);

module.exports = router;
