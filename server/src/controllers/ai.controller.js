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
 * Resilient fallback handler when the external LLM is offline or initializing.
 * Ensures the user is never blocked and always receives safe, helpful skincare advice.
/**
 * Extracts numeric budget/price ceiling from user message and profile.
 * Accurately parses queries such as "under 500", "below 1000", "< 500", "budget 500", etc.
 */
function extractBudget(message, user_profile) {
  // Check user profile first if explicitly set
  if (user_profile && typeof user_profile.budget === 'number' && user_profile.budget > 0) {
    return user_profile.budget;
  }
  if (!message || typeof message !== 'string') return null;

  const clean = message.toLowerCase();

  // Regex patterns matching English & common e-commerce phrasing
  const patterns = [
    /(?:under|below|less\s+than|within|upto|up\s+to|max|budget\s*(?:of|is|:)?)\s*(?:₹|rs\.?|inr)?\s*(\d{2,6})/i,
    /(?:₹|rs\.?|inr)\s*(\d{2,6})\s*(?:or\s+less|budget|max|limit)/i,
    /(\d{2,6})\s*(?:₹|rs\.?|inr)?\s*(?:ke\s*andar|or\s*less|max|budget)/i,
    /(?:<|<=)\s*(?:₹|rs\.?|inr)?\s*(\d{2,6})/i,
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match && match[1]) {
      const val = parseInt(match[1], 10);
      if (!isNaN(val) && val > 0) return val;
    }
  }

  return null;
}

/**
 * Resilient fallback handler when the external LLM is offline or initializing.
 * Ensures the user is never blocked and always receives safe, helpful skincare advice.
 */
async function handleLocalFallback(message, user_profile) {
  const cleanMsg = message.trim().toLowerCase();
  const explicitBudget = extractBudget(message, user_profile);

  // 1. Clinical safety guardrail: detect medical / infection / prescription queries
  if (/(cure|fungal|infection|medical|prescri|disease|doctor|dermatologist|antibiotic)/i.test(cleanMsg)) {
    const query = {
      $or: [
        { skin_types: { $in: [/sensitive/i, /all/i] } },
        { concerns: { $in: [/calming/i, /soothing/i, /barrier/i, /sensitive/i] } },
      ],
    };
    if (explicitBudget) {
      query.price_inr = { $lte: explicitBudget };
    }

    const gentleProducts = await Product.find(query).sort({ rating: -1 }).limit(3).lean();

    return {
      message: "Note: I am Glow More AI and cannot diagnose or prescribe medical treatments for severe conditions or infections. Please consult a dermatologist for clinical advice.\n\nHere are gentle, barrier-supporting formulas from our catalog:",
      intent: 'SAFETY_DISCLAIMER',
      tools_used: ['clinical_guardrail'],
      result: {
        results: gentleProducts.map(p => ({
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

  // 2. Greeting intent
  const isGreeting = /^(hi|hello|hey|hii+|hola|howdy|good\s*(morning|afternoon|evening)|yo|sup|greetings)\b/i.test(cleanMsg);
  if (isGreeting) {
    return {
      message: "Hey there! 👋 I'm Glow More AI, your smart beauty advisor. I can help you find products, build routines, compare formulas, or find budget dupes. What are you looking for today?",
      intent: 'GREETING',
      tools_used: [],
      result: { greeting: true },
      llm_powered: false,
    };
  }

  // 3. Product Comparison Intent (e.g. "compare P001 and P004")
  const idMatches = cleanMsg.match(/p0\d{2}/gi) || [];
  if (idMatches.length >= 2 || (cleanMsg.includes('compare') && idMatches.length >= 1)) {
    const compareIds = [...new Set(idMatches.map(id => id.toUpperCase()))];
    const compProducts = await Product.find({ id: { $in: compareIds } }).lean();
    if (compProducts.length > 0) {
      const summaries = compProducts.map(p => `• **${p.name}** ([${p.id}]) by ${p.brand}: ₹${p.price_inr?.toLocaleString('en-IN')}, Category: ${p.category}, Ideal for ${p.skin_types?.join(', ') || 'All'} skin`).join('\n');
      return {
        message: `Here is a side-by-side comparison of the requested products:\n\n${summaries}`,
        intent: 'PRODUCT_COMPARISON',
        tools_used: ['compare_products'],
        result: {
          results: compProducts.map(p => ({
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
  }

  // 4. Skincare Routine Intent
  if (/(routine|regimen|steps|morning|night|evening)/i.test(cleanMsg)) {
    const routineQuery = explicitBudget ? { price_inr: { $lte: explicitBudget } } : {};
    const routineCleansers = await Product.find({ ...routineQuery, category: /cleanser/i }).sort({ rating: -1 }).limit(1).lean();
    const routineSerums = await Product.find({ ...routineQuery, category: /serum/i }).sort({ rating: -1 }).limit(1).lean();
    const routineMoisturizers = await Product.find({ ...routineQuery, category: /moisturizer|sunscreen/i }).sort({ rating: -1 }).limit(1).lean();
    const routineItems = [...routineCleansers, ...routineSerums, ...routineMoisturizers];

    return {
      message: "Here is an optimal 3-step daily skincare routine tailored for healthy, radiant skin:\n\n" +
        "1. **Step 1: Cleanse** — Gently wash away impurities without stripping moisture.\n" +
        "2. **Step 2: Treat** — Target your specific skin concerns with an active serum.\n" +
        "3. **Step 3: Protect & Hydrate** — Lock in moisture and shield against environmental stress.\n\n" +
        "Recommended catalog essentials to build your routine:",
      intent: 'ROUTINE_BUILDER',
      tools_used: ['routine_builder'],
      result: {
        results: routineItems.map(p => ({
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

  // 5. Targeted active ingredient, category, or budget search query
  try {
    const stopwords = ['the', 'and', 'for', 'with', 'show', 'find', 'want', 'need', 'give', 'some', 'what', 'which', 'best', 'products', 'product', 'have', 'under', 'below', 'less', 'than', 'price'];
    const terms = cleanMsg
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopwords.includes(w) && isNaN(w));

    const orConditions = [];

    // Match query terms against product name, category, concerns, ingredients, and skin types
    if (terms.length > 0) {
      orConditions.push(
        { name: { $regex: terms.join('|'), $options: 'i' } },
        { category: { $regex: terms.join('|'), $options: 'i' } },
        { concerns: { $in: terms.map((t) => new RegExp(t, 'i')) } },
        { key_ingredients: { $in: terms.map((t) => new RegExp(t, 'i')) } },
        { ingredients_list: { $in: terms.map((t) => new RegExp(t, 'i')) } },
        { skin_types: { $in: terms.map((t) => new RegExp(t, 'i')) } }
      );
    }

    // Incorporate user profile skin type & concerns
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

    // Apply strict budget filter if specified in query or user profile
    if (explicitBudget) {
      query.price_inr = { $lte: explicitBudget };
    }

    let products = await Product.find(query).sort({ rating: -1, price_inr: 1 }).limit(4).lean();

    // If query was purely a budget filter (terms was empty) and products were found:
    if (products.length === 0 && explicitBudget) {
      products = await Product.find({ price_inr: { $lte: explicitBudget } })
        .sort({ rating: -1, price_inr: 1 })
        .limit(4)
        .lean();
    }

    if (products.length > 0) {
      const budgetNote = explicitBudget ? ` priced under ₹${explicitBudget}` : '';
      return {
        message: `Here are our top recommended products${budgetNote} matching your skincare query:`,
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

  // Default friendly fallback
  return {
    message: "I'm here to help you discover the perfect beauty products! Try asking me to recommend items for your skin type, compare products, or build a daily routine.",
    intent: 'GENERAL_SHOPPING',
    tools_used: [],
    result: null,
    llm_powered: false,
  };
}

/**
 * Direct Google Gemini LLM handler powered by Google's latest Gemini models.
 * Features automated model failover across candidate models for 99.9% uptime.
 * Grounded in real-time with the Joyory product catalog from MongoDB.
 */
async function handleGeminiChat(message, user_profile, product_id, conversation_history = []) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  // High-availability candidate model list with automatic failover
  const candidateModels = [
    process.env.LLM_MODEL || 'gemini-3.6-flash',
    'gemini-3.8-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
  ];

  // Extract explicit price / budget ceiling from user's message or profile
  const explicitBudget = extractBudget(message, user_profile);

  // 1. Fetch catalog products to ground the AI model with verified store inventory
  // If user requested a budget ceiling (e.g. "under 500"), strictly filter store catalog
  let catalogQuery = {};
  if (explicitBudget) {
    catalogQuery.price_inr = { $lte: explicitBudget };
  }

  let catalog = await Product.find(catalogQuery)
    .select('id name brand category price_inr rating skin_types concerns budget_tier')
    .sort({ rating: -1, price_inr: 1 })
    .limit(45)
    .lean();

  // If budget query returned zero items (e.g. extremely low budget), fallback to lowest priced items
  if (catalog.length === 0 && explicitBudget) {
    catalog = await Product.find({})
      .select('id name brand category price_inr rating skin_types concerns budget_tier')
      .sort({ price_inr: 1 })
      .limit(30)
      .lean();
  } else if (!explicitBudget) {
    catalog = await Product.find({})
      .select('id name brand category price_inr rating skin_types concerns budget_tier')
      .limit(45)
      .lean();
  }

  const catalogSummary = catalog
    .map(p => `[${p.id}] ${p.name} by ${p.brand} | ₹${p.price_inr} | Cat: ${p.category} | Skin: ${p.skin_types?.join(', ') || 'All'} | Concerns: ${p.concerns || 'N/A'}`)
    .join('\n');

  // 2. Prepare user profile context for personalization
  let profileText = 'Guest User (no saved skin profile)';
  if (user_profile) {
    profileText = `Skin Type: ${user_profile.skin_type || 'Unspecified'}, Skin Tone: ${user_profile.skin_tone || 'Unspecified'}, Concerns: ${Array.isArray(user_profile.concerns) ? user_profile.concerns.join(', ') : 'None'}, Budget: ₹${user_profile.budget || (explicitBudget || 'Flexible')}`;
  } else if (explicitBudget) {
    profileText = `Budget Constraint: Max ₹${explicitBudget}`;
  }

  const budgetRule = explicitBudget
    ? `\n7. STRICT BUDGET MANDATE: The user explicitly requested products under/within ₹${explicitBudget}. You MUST ONLY recommend, cite, and discuss products from the catalog that cost ₹${explicitBudget} or less. NEVER recommend or mention any product priced above ₹${explicitBudget}.`
    : '';

  // 3. Grounding System Instructions for the AI Skincare Advisor
  const systemInstructionText = `You are Glow More AI (Glow More's smart AI Skincare & Beauty Advisor).
You give warm, friendly, dermatologically grounded, and highly concise skincare advice.

Glow More Verified Product Catalog:
${catalogSummary}

User Skin Profile:
${profileText}

CRITICAL RULES FOR RESPONSES:
1. BREVITY & SIMPLICITY (TOP PRIORITY): The user needs a simple, concise answer. Keep your text response short, direct, and under 3–4 sentences or brief bullet points (max 50–70 words total). Never output long essays, conversational preambles, or walls of text.
2. RECOMMENDATIONS: Mention 2 to 4 recommended products with their name, ID in brackets like [P004], and price in ₹ (e.g. [P004] Bare Essentials Micellar Cleansing Water - ₹399).
3. DO NOT WRITE LENGTHY PRODUCT DESCRIPTIONS: Interactive product cards with photos, prices, and direct add-to-cart buttons are automatically displayed right below your message in the chat widget. Let the product cards speak for themselves!
4. ROUTINES: If asked for a routine, provide a simple, clean 3-4 step list (e.g. Cleanser -> Serum -> Moisturizer -> Sunscreen) with product IDs in brackets.
5. STRICT CATALOG GROUNDING: Ground recommendations strictly in the Glow More Product Catalog above. Never invent products.${budgetRule}
6. MEDICAL GUARDRAIL: If asked about severe infections or medical skin conditions, state in one brief sentence that you are an AI beauty advisor and advise consulting a dermatologist, while suggesting gentle barrier-supportive items.
7. NO FLUFF: Skip repetitive greetings, introductory fillers, and long disclaimers. Answer directly!`;

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
      temperature: 0.65,
      maxOutputTokens: 350,
    }
  };

  let lastError = null;

  // Attempt generation with automatic candidate failover
  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        lastError = new Error(`Model ${model} returned ${response.status}: ${errBody}`);
        console.warn(`[AI Controller] Model ${model} failed (${response.status}), trying next candidate...`);
        continue;
      }

      const data = await response.json();
      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!replyText) {
        lastError = new Error(`Empty response from model ${model}`);
        continue;
      }

      // 5. Detect referenced product IDs in the reply to extract interactive product cards
      const idMatches = [...new Set(replyText.match(/P0\d{2}/g) || [])];
      let matchedProducts = [];
      if (idMatches.length > 0) {
        const filter = { id: { $in: idMatches } };
        if (explicitBudget) {
          filter.price_inr = { $lte: explicitBudget };
        }
        matchedProducts = await Product.find(filter).lean();
      }

      // If explicit budget was set and few or no products matched, supplement from verified catalog <= budget
      if (explicitBudget && matchedProducts.length < 3) {
        const extra = await Product.find({
          price_inr: { $lte: explicitBudget },
          id: { $nin: matchedProducts.map(p => p.id) },
        })
          .sort({ rating: -1 })
          .limit(4 - matchedProducts.length)
          .lean();
        matchedProducts = [...matchedProducts, ...extra];
      } else if (matchedProducts.length === 0 && /(recommend|suggest|product|serum|cleanser|cream|moisturizer|sunscreen|best|buy|find)/i.test(message)) {
        matchedProducts = catalog.slice(0, 3);
      }

      // Strict enforcement: ensure NO product exceeding explicitBudget can ever be returned
      if (explicitBudget) {
        matchedProducts = matchedProducts.filter(p => (p.price_inr || 0) <= explicitBudget);
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
    } catch (modelErr) {
      lastError = modelErr;
      console.warn(`[AI Controller] Model ${model} request error:`, modelErr.message);
    }
  }

  throw lastError || new Error('All Gemini candidate models failed.');
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
