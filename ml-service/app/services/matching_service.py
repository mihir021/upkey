"""
Joyory Explainable Beauty Match Engine

Scores and ranks products against a user profile using a fully data-driven
algorithm.  Every product attribute is read dynamically from ProductService;
no product IDs, names, or brands are referenced anywhere in this module.

Scoring constants are defined at the top so they can be tuned without touching
the matching logic itself.
"""

from typing import List, Dict, Any, Optional

from app.services.product_service import product_service

# ---------------------------------------------------------------------------
# Scoring constants (algorithm-level, NOT product-specific)
# ---------------------------------------------------------------------------
SKIN_TYPE_EXACT = 30      # Product explicitly lists the user's skin type
SKIN_TYPE_ALL = 15        # Product says "All"
SKIN_TONE_EXACT = 15      # Product explicitly lists the user's skin tone
SKIN_TONE_ALL = 10        # Product says "All"
CONCERN_MATCH = 15        # Per matching concern
MAX_CONCERN_SCORE = 30    # Cap on total concern points
BUDGET_WITHIN = 20        # Price <= budget
BUDGET_SLIGHTLY_ABOVE = 10  # Price <= budget * BUDGET_TOLERANCE_FACTOR
MAX_RATING_SCORE = 5      # Max bonus from product rating

# Budget tolerance: "slightly above" means price is at most this factor × budget
BUDGET_TOLERANCE_FACTOR = 1.3
MAX_RATING_VALUE = 5.0    # Maximum possible rating in the dataset


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _parse_pipe_list(value: Any) -> List[str]:
    """Split a pipe-separated string into a list of lowercase, stripped tokens.
    
    Returns an empty list for empty/missing values.
    """
    if value is None:
        return []
    text = str(value).strip()
    if text == "":
        return []
    return [v.strip().lower() for v in text.split("|") if v.strip()]


def _safe_float(value: Any, default: float = 0.0) -> float:
    """Coerce a value to float, returning *default* on failure."""
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


# ---------------------------------------------------------------------------
# Scoring
# ---------------------------------------------------------------------------

def _score_product(product: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, Any]:
    """Score a single product against the user profile.

    Returns a dict with:
        product      – the original product dict (unchanged, includes future cols)
        match_score  – int 0-100
        reasons      – list[str] human-readable explanations
    """
    score = 0.0
    reasons: List[str] = []

    user_skin_type = (user_profile.get("skin_type") or "").strip().lower()
    user_skin_tone = (user_profile.get("skin_tone") or "").strip().lower()
    user_concerns = [c.strip().lower() for c in (user_profile.get("concerns") or []) if c.strip()]
    user_budget = _safe_float(user_profile.get("budget"), default=None)

    # ---- Skin Type --------------------------------------------------------
    product_skin_types = _parse_pipe_list(product.get("skin_type", ""))

    if user_skin_type and product_skin_types:
        if user_skin_type in product_skin_types:
            score += SKIN_TYPE_EXACT
            reasons.append(f"Matches your {user_skin_type} skin type")
        elif "all" in product_skin_types:
            score += SKIN_TYPE_ALL
            reasons.append(f"Suitable for all skin types including {user_skin_type}")
        else:
            product_types_display = ", ".join(product_skin_types)
            reasons.append(
                f"Designed for {product_types_display} skin rather than {user_skin_type} skin"
            )

    # ---- Skin Tone --------------------------------------------------------
    product_skin_tones = _parse_pipe_list(product.get("skin_tone", ""))

    if user_skin_tone and product_skin_tones:
        if user_skin_tone in product_skin_tones:
            score += SKIN_TONE_EXACT
            reasons.append(f"Matches your {user_skin_tone} skin tone")
        elif "all" in product_skin_tones:
            score += SKIN_TONE_ALL
            reasons.append(f"Suitable for all skin tones")
        else:
            product_tones_display = ", ".join(product_skin_tones)
            reasons.append(
                f"Designed for {product_tones_display} skin tone rather than {user_skin_tone}"
            )

    # ---- Concerns ---------------------------------------------------------
    product_concerns = _parse_pipe_list(product.get("concerns", ""))
    concern_score = 0.0
    matched_concerns: List[str] = []

    for uc in user_concerns:
        if uc in product_concerns:
            concern_score += CONCERN_MATCH
            matched_concerns.append(uc)

    concern_score = min(concern_score, MAX_CONCERN_SCORE)
    score += concern_score

    for mc in matched_concerns:
        reasons.append(f"Targets your {mc} concern")

    unmatched = [uc for uc in user_concerns if uc not in product_concerns]
    if unmatched and product_concerns:
        reasons.append(
            f"Does not specifically target: {', '.join(unmatched)}"
        )

    # ---- Budget -----------------------------------------------------------
    product_price = _safe_float(product.get("price_inr"), default=None)

    if user_budget is not None and product_price is not None:
        if product_price <= user_budget:
            score += BUDGET_WITHIN
            reasons.append(f"Within your ₹{int(user_budget)} budget")
        elif product_price <= user_budget * BUDGET_TOLERANCE_FACTOR:
            score += BUDGET_SLIGHTLY_ABOVE
            over = int(product_price - user_budget)
            reasons.append(f"₹{over} above your stated budget (slightly over)")
        else:
            over = int(product_price - user_budget)
            reasons.append(f"₹{over} above your ₹{int(user_budget)} budget")

    # ---- Rating -----------------------------------------------------------
    product_rating = _safe_float(product.get("rating"), default=0.0)

    if product_rating > 0 and MAX_RATING_VALUE > 0:
        rating_score = (product_rating / MAX_RATING_VALUE) * MAX_RATING_SCORE
        score += rating_score
        reasons.append(f"Highly rated ({product_rating}/5)")

    # ---- Final score (capped at 100) --------------------------------------
    final_score = min(int(round(score)), 100)

    return {
        "product": product,
        "match_score": final_score,
        "reasons": reasons,
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def match_products(
    user_profile: Dict[str, Any],
    limit: int = 5,
) -> Dict[str, Any]:
    """Score every product against *user_profile* and return the top *limit*.

    Parameters
    ----------
    user_profile : dict
        Keys: skin_type, skin_tone, concerns (list), budget (number).
    limit : int
        How many results to return (1–20, default 5).

    Returns
    -------
    dict with "user_profile" and "recommendations".
    """
    limit = max(1, min(limit, 20))

    all_products = product_service.get_all_products()
    scored = [_score_product(p, user_profile) for p in all_products]
    scored.sort(key=lambda x: x["match_score"], reverse=True)

    return {
        "user_profile": user_profile,
        "recommendations": scored[:limit],
    }
