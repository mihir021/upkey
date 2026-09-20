// ---------------------------------------------------------------------------
// AI Routes
// ---------------------------------------------------------------------------
// Exposes the AI Shopping Agent endpoints.
// Uses the existing requireAuth middleware so only authenticated users can
// interact with the agent, consistent with how /api/dashboard is protected.
// ---------------------------------------------------------------------------

const express = require('express');
const requireAuth = require('../middleware/auth.middleware');
const { chat } = require('../controllers/ai.controller');

const router = express.Router();

// POST /api/ai/chat — send a message to the AI Shopping Agent.
// Protected by JWT auth, matching the existing project convention.
router.post('/chat', requireAuth, chat);

module.exports = router;
