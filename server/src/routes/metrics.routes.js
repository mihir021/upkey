const express = require('express');
const { trackEvent } = require('../controllers/metrics.controller');

const router = express.Router();

// POST /api/metrics/track
router.post('/track', trackEvent);

module.exports = router;
