// ---------------------------------------------------------------------------
// AI Chat Controller
// ---------------------------------------------------------------------------
// Handles POST /api/ai/chat — forwards the user's message to the Python ML
// service and relays the response back.  Never exposes Gemini API keys,
// Python stack traces, or internal service details to the frontend.
// ---------------------------------------------------------------------------

const { sendAgentMessage } = require('../services/ml.service');
const Product = require('../models/Product');

/**
 * Resilient fallback handler when the Python ML microservice is offline or initializing.
 * Ensures the user is never blocked by a 503 Service Unavailable error.
 */
async function handleLocalFallback(message, user_profile) {
  const cleanMsg = message.trim().toLowerCase();

  // 1. Greeting intent
  const isGreeting = /^(hi|hello|hey|hii+|hola|howdy|good\s*(morning|afternoon|evening)|yo|sup|greetings)\b/i.test(cleanMsg);
  if (isGreeting) {
    return {
      message: "Hey there! 👋 I'm your Joyory beauty advisor. I can help you find skincare products, build routines, compare items, or discover budget-friendly dupes. What are you looking for?",
      intent: 'GREETING',
      tools_used: [],
      result: { greeting: true },
      llm_powered: false,
    };
  }

  // 2. Skincare products search fallback
  try {
    const stopwords = ['the', 'and', 'for', 'with', 'show', 'find', 'want', 'need', 'give', 'some', 'what', 'which', 'best'];
    const terms = cleanMsg
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopwords.includes(w));

    let query = {};
    if (terms.length > 0) {
      query = {
        $or: [
          { name: { $regex: terms.join('|'), $options: 'i' } },
          { category: { $regex: terms.join('|'), $options: 'i' } },
          { concerns: { $in: terms.map((t) => new RegExp(t, 'i')) } },
          { skin_types: { $in: terms.map((t) => new RegExp(t, 'i')) } },
        ],
      };
    }

    const products = await Product.find(query).sort({ rating: -1 }).limit(4).lean();
    if (products.length > 0) {
      return {
        message: `Here are some great options matching your query:`,
        intent: 'PRODUCT_RECOMMENDATION',
        tools_used: ['search_products'],
        result: {
          results: products.map((p) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            category: p.category,
            price_inr: p.price_inr,
            rating: p.rating,
          })),
        },
        llm_powered: false,
      };
    }
  } catch (dbErr) {
    console.error('AI chat fallback DB query error:', dbErr.message);
  }

  return {
    message: "I'm here to help you shop! Try asking me to recommend products for your skin type, compare items, or find dupes.",
    intent: 'GENERAL_SHOPPING',
    tools_used: [],
    result: null,
    llm_powered: false,
  };
}

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

  try {
    // ------------------------------------------------------------------
    // Forward to Python ML service
    // ------------------------------------------------------------------
    const mlResponse = await sendAgentMessage({
      message: message.trim(),
      user_profile: user_profile || null,
      product_id: product_id || null,
      conversation_history: conversation_history || [],
    });

    return res.status(200).json({
      success: true,
      data: mlResponse,
    });
  } catch (err) {
    console.warn(`[AI Controller] Python ML service unreachable (${err.message}). Using local fallback.`);

    try {
      const fallbackData = await handleLocalFallback(message, user_profile);
      return res.status(200).json({
        success: true,
        data: fallbackData,
      });
    } catch (fallbackErr) {
      console.error('AI chat fatal fallback error:', fallbackErr.message);
      return res.status(503).json({
        success: false,
        message: 'AI service is currently unavailable. Please try again in a moment.',
      });
    }
  }
}

module.exports = { chat };
