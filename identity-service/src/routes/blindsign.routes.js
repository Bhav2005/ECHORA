const express = require('express');
const blindSignController = require('../controllers/blindsign.controller');

const router = express.Router();

router.get('/public-key', blindSignController.getPublicKey);
router.post('/sign', blindSignController.signToken);

module.exports = router;
