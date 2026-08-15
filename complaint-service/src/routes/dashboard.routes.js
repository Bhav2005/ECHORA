const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authenticateAdmin } = require('../middleware/adminAuth.middleware');

const router = express.Router();

// Public — no admin auth required. Must stay above the authenticateAdmin
// gate below, since Express applies middleware in registration order.
router.get('/public-transparency', dashboardController.getPublicTransparency);

router.use(authenticateAdmin);

router.get('/stats', dashboardController.getStats);
router.get('/heatmap', dashboardController.getHeatmap);
router.get('/complaints', dashboardController.getComplaints);

module.exports = router;