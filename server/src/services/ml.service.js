// ---------------------------------------------------------------------------
// ML Service Client
// ---------------------------------------------------------------------------
// Communicates with the Python FastAPI ML service over HTTP.
// The ML service URL is configured via ML_SERVICE_URL env var.
// This module is the ONLY place in the Node backend that knows about the
// Python service — all other code goes through this interface.
// ---------------------------------------------------------------------------

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Send a chat message to the AI Shopping Agent running in the Python ML service.
 *
 * @param {Object} payload
 * @param {string} payload.message        - The user's natural-language message.
 * @param {Object} [payload.user_profile]  - Optional skin profile + budget.
 * @param {string} [payload.product_id]    - Optional product context.
 * @param {Array}  [payload.conversation_history] - Previous turns for multi-turn.
 * @returns {Promise<Object>} The ML service JSON response.
 * @throws {Error} If the ML service is unreachable or returns a non-2xx status.
 */
async function sendAgentMessage(payload) {
  const url = `${ML_SERVICE_URL}/agent/message`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: payload.message,
      user_profile: payload.user_profile || null,
      product_id: payload.product_id || null,
      conversation_history: payload.conversation_history || [],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`ML service returned ${response.status}: ${errorText}`);
  }

  return response.json();
}

/**
 * Health check for the ML service.
 * @returns {Promise<Object>} Health status from the Python service.
 */
async function checkHealth() {
  const url = `${ML_SERVICE_URL}/health`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ML health check failed: ${response.status}`);
  }

  return response.json();
}

module.exports = { sendAgentMessage, checkHealth };
