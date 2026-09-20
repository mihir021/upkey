const express = require('express');
const requireAuth = require('../middleware/auth.middleware');
const { updatePreferences, getPreferences } = require('../controllers/profile.controller');

const router = express.Router();

router.get('/preferences', requireAuth, getPreferences);
router.put('/preferences', requireAuth, updatePreferences);

module.exports = router;
