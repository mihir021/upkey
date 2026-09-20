// ---------------------------------------------------------------------------
// AI Chat Controller
// ---------------------------------------------------------------------------
// Handles POST /api/ai/chat — forwards the user's message to the Python ML
// service and relays the response back.  Never exposes Gemini API keys,
// Python stack traces, or internal service details to the frontend.
// ---------------------------------------------------------------------------

const { sendAgentMessage } = require('../services/ml.service');

/**
 * POST /api/ai/chat
 *
 * Expected body:
 * {
 *   "message": "string (required)",
 *   "user_profile": { ... } | null,
 *   "product_id": "string" | null,
 *   "conversation_history": [ { role, content }, ... ]
 * }
 */
async function chat(req, res) {
  try {
    const { message, user_profile, product_id, conversation_history } = req.body;

    // ------------------------------------------------------------------
    // Input validation
    // ------------------------------------------------------------------
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A non-empty "message" field is required.',
      });
    }

    // ------------------------------------------------------------------
    // Forward to Python ML service
    // ------------------------------------------------------------------
    const mlResponse = await sendAgentMessage({
      message: message.trim(),
      user_profile: user_profile || null,
      product_id: product_id || null,
      conversation_history: conversation_history || [],
    });

    // ------------------------------------------------------------------
    // Return the ML service response to the frontend
    // ------------------------------------------------------------------
    return res.status(200).json({
      success: true,
      data: mlResponse,
    });
  } catch (err) {
    // Log the real error server-side for debugging, but never expose it
    // to the frontend.  This prevents leaking Python tracebacks, Gemini
    // API errors, API keys, or internal URLs.
    console.error('AI chat error:', err.message);

    return res.status(503).json({
      success: false,
      message: 'AI service is currently unavailable.',
    });
  }
}

module.exports = { chat };
