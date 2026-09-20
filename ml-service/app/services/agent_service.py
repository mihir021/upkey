"""
Joyory AI Shopping Agent Service

Analyses a user's natural-language message, detects intent, extracts
parameters, calls the appropriate deterministic shopping tool, and returns
a structured result.

Design:
  - Intent detection is keyword/pattern-based (no LLM).
  - The intent layer is isolated so it can later be swapped for LLM-based
    detection without touching the tool layer.
  - All product data comes from the existing deterministic tools in
    shopping_tools.py — this module never invents product information.
  - No API keys, no external LLM calls.
"""

import re
from typing import Dict, Any, Optional, List

from app.services import shopping_tools


# ---------------------------------------------------------------------------
# Known values for parameter extraction (algorithm-level constants,
# NOT product-specific)
# ---------------------------------------------------------------------------
KNOWN_SKIN_TYPES = ["oily", "dry", "combination", "sensitive", "normal"]
KNOWN_SKIN_TONES = ["fair", "light", "medium", "tan", "deep", "dark"]
KNOWN_CONCERNS = [
    "acne", "oiliness", "dryness", "sensitivity", "aging", "pigmentation",
    "dullness", "pores", "dark circles", "uneven tone",
]

# Regex for extracting product IDs
PRODUCT_ID_PATTERN = re.compile(r'\bP\d{3}\b', re.IGNORECASE)

# Regex for extracting budget numbers (supports ₹, rs, rs., inr prefixes)
BUDGET_PATTERN = re.compile(
    r'(?:under|below|within|budget\s*(?:of|is)?|less\s*than|max|upto|up\s*to)?\s*'
    r'(?:₹|rs\.?\s*|inr\s*)?'
    r'(\d{2,6})'
    r'(?:\s*(?:₹|rs|inr|rupees|budget))?',
    re.IGNORECASE
)


# ---------------------------------------------------------------------------
# Intent detection
# ---------------------------------------------------------------------------

# Each rule is (intent_name, tool_name, list_of_trigger_patterns).
# Patterns are checked in order; first match wins.
# This structure makes it trivial to add/remove intents later.

INTENT_RULES = [
    (
        "ROUTINE_BUILDER",
        "build_routine",
        [
            r'\b(?:routine|regimen|skincare\s*routine|skin\s*care\s*routine|daily\s*routine)\b',
            r'\bbuild\b.*\broutine\b',
        ],
    ),
    (
        "DUPE_SEARCH",
        "find_dupes",
        [
            r'\bdupe\b',
            r'\bdupes\b',
            r'\bcheaper\s*alternative\b',
            r'\baffordable\s*alternative\b',
            r'\bbudget\s*alternative\b',
            r'\balternative\b.*\bcheaper\b',
        ],
    ),
    (
        "PRODUCT_COMPARISON",
        "compare_products",
        [
            r'\bcompare\b',
            r'\bcomparison\b',
            r'\bvs\b',
            r'\bversus\b',
            r'\bdifference\s*between\b',
            r'\bwhich\s*is\s*better\b',
        ],
    ),
    (
        "PRODUCT_DETAILS",
        "get_product",
        [
            r'\bwhat\s*is\b.*P\d{3}',
            r'\btell\s*me\s*about\b',
            r'\bdetails?\s*(?:of|for|about)\b',
            r'\bmore\s*(?:info|information|about)\b',
            r'\babout\s+P\d{3}',
        ],
    ),
    (
        "PERSONALIZED_RECOMMENDATION",
        "recommend_products",
        [
            r'\brecommend\b',
            r'\bsuggest\b',
            r'\bwhat\s*should\s*I\s*(?:buy|use|get|try)\b',
            r'\bbest\s*(?:product|for)\b',
            r'\bhelp\s*me\s*(?:find|choose|pick)\b',
            r'\bsuited?\s*for\s*(?:my|me)\b',
            r'\bgood\s*for\b',
        ],
    ),
    (
        "PRODUCT_SEARCH",
        "search_products",
        [
            r'\bsearch\b',
            r'\bfind\b',
            r'\bshow\b',
            r'\blooking\s*for\b',
            r'\bi\s*(?:want|need)\b',
            r'\bany\b.*\b(?:products?|options?)\b',
        ],
    ),
]


def _detect_intent(message: str) -> tuple:
    """Return (intent_name, tool_name) for the first matching rule.

    Falls back to GENERAL_SHOPPING if nothing matches.
    """
    msg_lower = message.lower()

    # Special case: if the message is just a product ID, treat as PRODUCT_DETAILS
    stripped = message.strip()
    if PRODUCT_ID_PATTERN.fullmatch(stripped):
        return ("PRODUCT_DETAILS", "get_product")

    for intent_name, tool_name, patterns in INTENT_RULES:
        for pattern in patterns:
            if re.search(pattern, message, re.IGNORECASE):
                return (intent_name, tool_name)

    return ("GENERAL_SHOPPING", None)


# ---------------------------------------------------------------------------
# Parameter extraction
# ---------------------------------------------------------------------------

def _extract_product_ids(message: str) -> List[str]:
    """Extract all product IDs from the message."""
    return [pid.upper() for pid in PRODUCT_ID_PATTERN.findall(message)]


def _extract_budget(message: str) -> Optional[float]:
    """Extract a budget number from the message."""
    # Look for explicit budget-like patterns first
    budget_phrases = re.findall(
        r'(?:under|below|within|budget\s*(?:of|is)?|less\s*than|max|upto|up\s*to)\s*'
        r'(?:₹|rs\.?\s*|inr\s*)?'
        r'(\d{2,6})',
        message, re.IGNORECASE
    )
    if budget_phrases:
        return float(budget_phrases[0])

    # Look for currency-prefixed numbers (₹1000, Rs 1000)
    currency_nums = re.findall(
        r'(?:₹|rs\.?\s*|inr\s*)(\d{2,6})',
        message, re.IGNORECASE
    )
    if currency_nums:
        return float(currency_nums[0])

    return None


def _extract_skin_type(message: str) -> Optional[str]:
    """Extract skin type from the message."""
    msg_lower = message.lower()
    for st in KNOWN_SKIN_TYPES:
        # Match "oily skin" or just "oily" in relevant context
        if re.search(rf'\b{st}\b', msg_lower):
            return st.capitalize()
    return None


def _extract_skin_tone(message: str) -> Optional[str]:
    """Extract skin tone from the message."""
    msg_lower = message.lower()
    for tone in KNOWN_SKIN_TONES:
        if re.search(rf'\b{tone}\b', msg_lower):
            return tone.capitalize()
    return None


def _extract_concerns(message: str) -> List[str]:
    """Extract known skin concerns from the message."""
    msg_lower = message.lower()
    found = []
    for concern in KNOWN_CONCERNS:
        if concern in msg_lower:
            found.append(concern.title())
    return found


def _extract_search_query(message: str) -> str:
    """Build a search query from the message by stripping common filler words."""
    # Remove product IDs, budget numbers, and common filler
    cleaned = PRODUCT_ID_PATTERN.sub('', message)
    cleaned = re.sub(
        r'\b(?:show|find|search|me|for|i\s*want|i\s*need|a|an|the|some|any|'
        r'please|can\s*you|products?|under|below|within|budget|rs|inr)\b',
        '', cleaned, flags=re.IGNORECASE
    )
    cleaned = re.sub(r'[₹,.]', '', cleaned)
    cleaned = re.sub(r'\d{2,6}', '', cleaned)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned


def _extract_params(message: str, user_profile: Optional[Dict] = None,
                    product_id: Optional[str] = None) -> Dict[str, Any]:
    """Extract all available parameters from the message + profile."""
    product_ids = _extract_product_ids(message)
    if product_id and product_id.upper() not in product_ids:
        product_ids.insert(0, product_id.upper())

    # Message-level extractions
    msg_skin_type = _extract_skin_type(message)
    msg_skin_tone = _extract_skin_tone(message)
    msg_concerns = _extract_concerns(message)
    msg_budget = _extract_budget(message)

    # Profile-level defaults (message overrides profile)
    profile = user_profile or {}
    skin_type = msg_skin_type or profile.get("skin_type") or ""
    skin_tone = msg_skin_tone or profile.get("skin_tone") or ""
    concerns = msg_concerns or profile.get("concerns") or []
    budget = msg_budget if msg_budget is not None else profile.get("budget")

    search_query = _extract_search_query(message)

    return {
        "product_ids": product_ids,
        "skin_type": skin_type,
        "skin_tone": skin_tone,
        "concerns": concerns,
        "budget": budget,
        "search_query": search_query,
    }


# ---------------------------------------------------------------------------
# Tool execution
# ---------------------------------------------------------------------------

def _execute_tool(intent: str, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Call the appropriate shopping tool with extracted parameters."""

    if tool_name == "search_products":
        query = params["search_query"] or "skincare"
        return shopping_tools.search_products(query, limit=5)

    if tool_name == "get_product":
        pid = params["product_ids"][0] if params["product_ids"] else None
        if not pid:
            return {"error": "No product ID found in your message."}
        return shopping_tools.get_product(pid)

    if tool_name == "compare_products":
        pids = params["product_ids"]
        if len(pids) < 2:
            return {"error": "Please mention at least 2 product IDs to compare."}
        return shopping_tools.compare_products(pids[:4])

    if tool_name == "find_dupes":
        pid = params["product_ids"][0] if params["product_ids"] else None
        if not pid:
            return {"error": "Please mention a product ID to find dupes for."}
        return shopping_tools.find_dupes(pid)

    if tool_name == "recommend_products":
        user_profile = {
            "skin_type": params["skin_type"],
            "skin_tone": params["skin_tone"],
            "concerns": params["concerns"],
            "budget": params["budget"],
        }
        return shopping_tools.recommend_products(user_profile, limit=5)

    if tool_name == "build_routine":
        user_profile = {
            "skin_type": params["skin_type"],
            "skin_tone": params["skin_tone"],
            "concerns": params["concerns"],
        }
        return shopping_tools.build_routine(
            user_profile,
            goals=params["concerns"],
            budget=params["budget"],
        )

    # GENERAL_SHOPPING fallback — try search if we have a query
    if params["search_query"]:
        return shopping_tools.search_products(params["search_query"], limit=5)

    return {"message": "I'm here to help you shop! Try asking me to recommend products, search for something, compare items, or build a routine."}


# ---------------------------------------------------------------------------
# Response message generation (deterministic, no LLM)
# ---------------------------------------------------------------------------

def _generate_message(intent: str, tool_name: str, result: Dict[str, Any]) -> str:
    """Generate a simple human-readable summary of the tool result."""

    if "error" in result:
        return result["error"]

    if tool_name == "search_products":
        total = result.get("total_results", 0)
        query = result.get("query", "")
        if total == 0:
            return f"No products found for '{query}'."
        return f"Found {total} product(s) matching '{query}'. Here are the top results."

    if tool_name == "get_product":
        if not result.get("found"):
            return result.get("message", "Product not found.")
        p = result["product"]
        return f"{p.get('name', '?')} by {p.get('brand', '?')} — ₹{p.get('price_inr', '?')}."

    if tool_name == "compare_products":
        pids = result.get("product_ids", [])
        return f"Here's a side-by-side comparison of {len(pids)} products."

    if tool_name == "find_dupes":
        total = result.get("total_dupes", 0)
        source = result.get("product", {}).get("name", "this product")
        if total == 0:
            return f"No dupes found for {source}."
        return f"Found {total} alternative(s) for {source}."

    if tool_name == "recommend_products":
        recs = result.get("recommendations", [])
        if not recs:
            return "No matching products found for your profile."
        top = recs[0]
        return (
            f"I found {len(recs)} recommendations for you. "
            f"Top pick: {top['product'].get('name', '?')} "
            f"(score: {top['match_score']}/100)."
        )

    if tool_name == "build_routine":
        steps = result.get("steps", 0)
        total = result.get("total_price", 0)
        budget = result.get("budget")
        skipped = result.get("skipped_steps", [])
        msg = f"Built a {steps}-step routine (total: ₹{total})."
        if skipped:
            skipped_names = [s["step"] for s in skipped]
            msg += f" Skipped: {', '.join(skipped_names)} (budget constraints)."
        return msg

    return "Here are your results."


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def process_message(
    message: str,
    user_profile: Optional[Dict[str, Any]] = None,
    product_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Process a user's shopping message using deterministic intent detection.

    This is the fallback path used when the LLM is unavailable.

    Parameters
    ----------
    message : str
        The user's natural-language shopping request.
    user_profile : dict, optional
        Persistent profile (skin_type, skin_tone, concerns, budget).
    product_id : str, optional
        Context product ID (e.g. user is viewing a product page).

    Returns
    -------
    dict with: message, intent, tool, tool_input, result
    """
    if not message or not message.strip():
        return {
            "message": "Please tell me what you're looking for!",
            "intent": "GENERAL_SHOPPING",
            "tool": None,
            "tool_input": None,
            "result": None,
        }

    intent, tool_name = _detect_intent(message)
    params = _extract_params(message, user_profile, product_id)

    # Build tool_input for transparency
    tool_input = dict(params)

    # Execute
    result = _execute_tool(intent, tool_name, params)

    # Generate summary message
    summary = _generate_message(intent, tool_name, result)

    return {
        "message": summary,
        "intent": intent,
        "tool": tool_name,
        "tool_input": tool_input,
        "result": result,
    }


# ---------------------------------------------------------------------------
# LLM-powered agent
# ---------------------------------------------------------------------------

def process_message_with_llm(
    message: str,
    user_profile: Optional[Dict[str, Any]] = None,
    product_id: Optional[str] = None,
    conversation_history: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    """Process a user's shopping message using the LLM agent.

    Falls back to deterministic processing if the LLM is unavailable.

    Parameters
    ----------
    message : str
        The user's natural-language shopping request.
    user_profile : dict, optional
        Persistent profile (skin_type, skin_tone, concerns, budget).
    product_id : str, optional
        Context product ID (e.g. user is viewing a product page).
    conversation_history : list, optional
        Previous conversation turns as [{role, content}, ...].

    Returns
    -------
    dict with: message, intent, tools_used, result, llm_powered
    """
    from app.services.llm_service import chat_with_llm, is_llm_available

    if not message or not message.strip():
        return {
            "message": "Please tell me what you're looking for!",
            "intent": "GENERAL_SHOPPING",
            "tools_used": [],
            "result": None,
            "llm_powered": False,
        }

    # If LLM is not configured, fall back to deterministic processing
    if not is_llm_available():
        deterministic = process_message(message, user_profile, product_id)
        return {
            "message": deterministic["message"],
            "intent": deterministic["intent"],
            "tools_used": [deterministic["tool"]] if deterministic["tool"] else [],
            "result": deterministic["result"],
            "llm_powered": False,
        }

    # Use the LLM path
    llm_result = chat_with_llm(
        user_message=message,
        user_profile=user_profile,
        product_id=product_id,
        conversation_history=conversation_history,
    )

    # If the LLM errored, fall back to deterministic
    if llm_result.get("error") == "llm_unavailable":
        deterministic = process_message(message, user_profile, product_id)
        return {
            "message": deterministic["message"],
            "intent": deterministic["intent"],
            "tools_used": [deterministic["tool"]] if deterministic["tool"] else [],
            "result": deterministic["result"],
            "llm_powered": False,
        }

    # Determine intent from tools used
    intent = "LLM_AGENT"
    tools_used = llm_result.get("tools_used", [])
    if len(tools_used) == 1:
        tool_to_intent = {
            "search_products": "PRODUCT_SEARCH",
            "get_product": "PRODUCT_DETAILS",
            "compare_products": "PRODUCT_COMPARISON",
            "find_dupes": "DUPE_SEARCH",
            "recommend_products": "PERSONALIZED_RECOMMENDATION",
            "build_routine": "ROUTINE_BUILDER",
        }
        intent = tool_to_intent.get(tools_used[0], "LLM_AGENT")
    elif len(tools_used) > 1:
        intent = "MULTI_TOOL"

    # Build the consolidated result from all tool results
    tool_results = llm_result.get("tool_results", [])
    consolidated_result = None
    if len(tool_results) == 1:
        consolidated_result = tool_results[0].get("result")
    elif len(tool_results) > 1:
        consolidated_result = tool_results

    return {
        "message": llm_result["message"],
        "intent": intent,
        "tools_used": tools_used,
        "result": consolidated_result,
        "llm_powered": True,
    }

