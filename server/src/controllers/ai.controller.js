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

    const orConditions = [];

    // Match query terms against product name, category, concerns, and skin types
    if (terms.length > 0) {
      orConditions.push(
        { name: { $regex: terms.join('|'), $options: 'i' } },
        { category: { $regex: terms.join('|'), $options: 'i' } },
        { concerns: { $in: terms.map((t) => new RegExp(t, 'i')) } },
        { skin_types: { $in: terms.map((t) => new RegExp(t, 'i')) } }
      );
    }

    // Incorporate user profile skin type & concerns for personalized recommendation fallback
    if (user_profile && user_profile.skin_type) {
      orConditions.push({ skin_types: new RegExp(user_profile.skin_type, 'i') });
    }
    if (user_profile && Array.isArray(user_profile.concerns) && user_profile.concerns.length > 0) {
      orConditions.push({ concerns: { $in: user_profile.concerns.map((c) => new RegExp(c, 'i')) } });
    }

    let query = {};
    if (orConditions.length > 0) {
      query = { $or: orConditions };
    }

    // Apply user budget filter if specified
    if (user_profile && typeof user_profile.budget === 'number' && user_profile.budget > 0) {
      query.price_inr = { $lte: user_profile.budget };
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
 * Direct Google Gemini LLM handler powered by Google's latest Gemini 3.6 Flash.
 * Grounded in real-time with the Joyory product catalog from MongoDB.
 */
async function handleGeminiChat(message, user_profile, product_id, conversation_history = []) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const model = process.env.LLM_MODEL || 'gemini-3.6-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // 1. Fetch catalog products to ground the AI model with verified store inventory
  const catalog = await Product.find({})
    .select('id name brand category price_inr rating skin_types concerns budget_tier')
    .limit(40)
    .lean();

  const catalogSummary = catalog
    .map(p => `[${p.id}] ${p.name} by ${p.brand} | ₹${p.price_inr} | Cat: ${p.category} | Skin: ${p.skin_types?.join(', ') || 'All'} | Concerns: ${p.concerns || 'N/A'}`)
    .join('\n');

  // 2. Prepare user profile context for personalization
  let profileText = 'Guest User (no saved skin profile)';
  if (user_profile) {
    profileText = `Skin Type: ${user_profile.skin_type || 'Unspecified'}, Skin Tone: ${user_profile.skin_tone || 'Unspecified'}, Concerns: ${Array.isArray(user_profile.concerns) ? user_profile.concerns.join(', ') : 'None'}, Budget: ₹${user_profile.budget || 'Flexible'}`;
  }

  // 3. Grounding System Instructions for the AI Skincare Advisor
  const systemInstructionText = `You are Joyory's expert AI Skincare & Beauty Advisor.
You give warm, dermatologically grounded, empathetic advice and recommend suitable skincare products.

Joyory Verified Product Catalog:
${catalogSummary}

User Skin Profile:
${profileText}

Instructions:
1. Ground your recommendations strictly in the Joyory Product Catalog above.
2. Whenever you recommend or reference a product, mention its exact name and ID in brackets (e.g. [P004] Bare Essentials Micellar Cleansing Water) and state its price in INR (₹).
3. If the user asks about routines, recommend a step-by-step routine (Cleanser -> Toner -> Serum -> Moisturizer -> Sunscreen) using catalog products where possible.
4. If the user asks general skincare questions (e.g. "how to treat acne", "what causes dry skin"), explain clearly and recommend targeted ingredients and products from the catalog.
5. Format your response cleanly using markdown (bullet points, bold text, headings).
6. Keep recommendations tailored to their skin type and budget.`;

  // 4. Build contents array including conversation history for multi-turn context
  const contents = [];

  if (Array.isArray(conversation_history)) {
    conversation_history.slice(-6).forEach(turn => {
      if (turn && turn.content) {
        contents.push({
          role: turn.role === 'assistant' || turn.role === 'model' ? 'model' : 'user',
          parts: [{ text: turn.content }]
        });
      }
    });
  }

  // Add current user prompt
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  const body = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstructionText }]
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000,
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`Gemini API error ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to help with your skincare needs! What can I help you find today?";

  // 5. Detect referenced product IDs in the reply to extract interactive product cards
  const idMatches = [...new Set(replyText.match(/P0\d{2}/g) || [])];
  let matchedProducts = [];
  if (idMatches.length > 0) {
    matchedProducts = await Product.find({ id: { $in: idMatches } }).lean();
  }

  // If no specific product ID was mentioned but user asked for recommendations, include relevant catalog items
  if (matchedProducts.length === 0 && /(recommend|suggest|product|serum|cleanser|cream|moisturizer|sunscreen|best|buy|find)/i.test(message)) {
    matchedProducts = catalog.slice(0, 3);
  }

  return {
    message: replyText,
    intent: 'PRODUCT_RECOMMENDATION',
    tools_used: ['gemini_grounded_search'],
    result: {
      results: matchedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        price_inr: p.price_inr,
        rating: p.rating,
      })),
    },
    llm_powered: true,
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

  // ------------------------------------------------------------------
  // 1. Direct Gemini LLM Engine (Highest fidelity, zero external daemon)
  // ------------------------------------------------------------------
  if (process.env.GEMINI_API_KEY || process.env.LLM_API_KEY) {
    try {
      const geminiData = await handleGeminiChat(message.trim(), user_profile, product_id, conversation_history);
      return res.status(200).json({
        success: true,
        data: geminiData,
      });
    } catch (geminiErr) {
      console.warn('[AI Controller] Direct Gemini engine failed, attempting ML service / fallback:', geminiErr.message);
    }
  }

  // ------------------------------------------------------------------
  // 2. Python ML Microservice (FastAPI agent if running)
  // ------------------------------------------------------------------
  try {
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

    // ------------------------------------------------------------------
    // 3. Resilient Local Database Search Fallback
    // ------------------------------------------------------------------
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
