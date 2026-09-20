"""
Joyory Shopping Tools

Deterministic, data-driven functions that operate on the live product catalog.
Each function returns structured data suitable for consumption by a future
AI Shopping Agent (LLM tool-calling layer).

No product IDs, names, or brands are hardcoded.
No LLM or external API is used.
"""

from typing import List, Dict, Any, Optional

from app.services.product_service import product_service
from app.services.matching_service import match_products, _score_product


# ---------------------------------------------------------------------------
# Routine step ordering — defines the preferred order of categories in a
# skincare routine.  Only categories that actually exist in the catalog at
# request time will be used.
# ---------------------------------------------------------------------------
ROUTINE_CATEGORY_ORDER = [
    "Cleanser",
    "Toner",
    "Serum",
    "Moisturizer",
    "Sunscreen",
]


# ---------------------------------------------------------------------------
# 1. search_products
# ---------------------------------------------------------------------------

def search_products(query: str, limit: int = 10) -> Dict[str, Any]:
    """Search the catalog across relevant product fields.

    Delegates to ProductService.search_products which searches dynamically
    across name, brand, category, concerns, key_ingredients, skin_type,
    and skin_tone.
    """
    limit = max(1, min(limit, 50))
    results = product_service.search_products(query)
    return {
        "query": query,
        "total_results": len(results),
        "products": results[:limit],
    }


# ---------------------------------------------------------------------------
# 2. get_product
# ---------------------------------------------------------------------------

def get_product(product_id: str) -> Dict[str, Any]:
    """Return a single product by ID, or a not-found result."""
    product = product_service.get_product_by_id(product_id)
    if product is None:
        return {
            "found": False,
            "product_id": product_id,
            "message": f"Product '{product_id}' not found in catalog.",
        }
    return {
        "found": True,
        "product": product,
    }


# ---------------------------------------------------------------------------
# 3. compare_products
# ---------------------------------------------------------------------------

def compare_products(product_ids: List[str]) -> Dict[str, Any]:
    """Return a structured side-by-side comparison for 2–4 products.

    Every field present in the catalog is included so that future columns
    (e.g. cloudinary_link) are automatically surfaced.
    """
    if len(product_ids) < 2:
        return {"error": "Please provide at least 2 product IDs to compare."}
    if len(product_ids) > 4:
        return {"error": "Please provide at most 4 product IDs to compare."}

    products = []
    not_found = []
    for pid in product_ids:
        p = product_service.get_product_by_id(pid)
        if p is None:
            not_found.append(pid)
        else:
            products.append(p)

    if not_found:
        return {
            "error": f"Product(s) not found: {', '.join(not_found)}",
            "not_found": not_found,
        }

    # Build a comparison dict keyed by field name
    # Dynamically uses whatever columns exist in the product dicts
    all_keys = set()
    for p in products:
        all_keys.update(p.keys())

    comparison = {}
    for key in sorted(all_keys):
        comparison[key] = [p.get(key, "") for p in products]

    return {
        "product_ids": product_ids,
        "products": products,
        "comparison": comparison,
    }


# ---------------------------------------------------------------------------
# 4. find_dupes
# ---------------------------------------------------------------------------

def find_dupes(product_id: str) -> Dict[str, Any]:
    """Find dupes related to a product using the catalog's dupe_of field.

    Relationships are bidirectional:
      - If product A has dupe_of = B, then A is a dupe of B.
      - If product B has dupe_of = A (or another product C has dupe_of = A),
        those are also returned.
    """
    source = product_service.get_product_by_id(product_id)
    if source is None:
        return {
            "found": False,
            "product_id": product_id,
            "message": f"Product '{product_id}' not found in catalog.",
        }

    all_products = product_service.get_all_products()
    dupes: List[Dict[str, Any]] = []
    seen_ids = {product_id}

    # Forward: source is a dupe of another product
    source_dupe_of = str(source.get("dupe_of", "")).strip()
    if source_dupe_of:
        original = product_service.get_product_by_id(source_dupe_of)
        if original and original.get("id") not in seen_ids:
            dupes.append(original)
            seen_ids.add(original.get("id"))

    # Reverse: other products that list source as their dupe_of
    for p in all_products:
        pid = str(p.get("id", ""))
        if pid in seen_ids:
            continue
        p_dupe_of = str(p.get("dupe_of", "")).strip()
        if p_dupe_of == product_id:
            dupes.append(p)
            seen_ids.add(pid)

    # Siblings: other products that share the same dupe_of target as source
    if source_dupe_of:
        for p in all_products:
            pid = str(p.get("id", ""))
            if pid in seen_ids:
                continue
            p_dupe_of = str(p.get("dupe_of", "")).strip()
            if p_dupe_of == source_dupe_of:
                dupes.append(p)
                seen_ids.add(pid)

    return {
        "found": True,
        "product": source,
        "dupes": dupes,
        "total_dupes": len(dupes),
    }


# ---------------------------------------------------------------------------
# 5. recommend_products — delegates to Phase 2 matching engine
# ---------------------------------------------------------------------------

def recommend_products(
    user_profile: Dict[str, Any],
    limit: int = 5,
) -> Dict[str, Any]:
    """Return explainable recommendations using the Phase 2 matching engine.

    This is a thin wrapper — the scoring logic lives entirely in
    matching_service.match_products and is NOT duplicated here.
    """
    return match_products(user_profile, limit=limit)


# ---------------------------------------------------------------------------
# 6. build_routine
# ---------------------------------------------------------------------------

def build_routine(
    user_profile: Dict[str, Any],
    goals: Optional[List[str]] = None,
    budget: Optional[float] = None,
) -> Dict[str, Any]:
    """Build a skincare routine from the catalog using the match engine.

    Steps:
      1. Discover which routine categories actually exist in the catalog.
      2. For each category, score all products in that category against the
         user profile (reusing the Phase 2 engine).
      3. Pick the best-scoring product per category that fits the remaining
         budget.  If no product fits, skip that category entirely rather
         than exceeding the budget.
    """
    goals = goals or []
    concerns = list(user_profile.get("concerns", []))
    # Merge goals into concerns for scoring (goals are effectively concerns)
    for g in goals:
        if g.strip().lower() not in [c.lower() for c in concerns]:
            concerns.append(g)

    profile_for_scoring = {
        "skin_type": user_profile.get("skin_type", ""),
        "skin_tone": user_profile.get("skin_tone", ""),
        "concerns": concerns,
        "budget": None,  # We handle budget ourselves at the routine level
    }

    all_products = product_service.get_all_products()

    # Discover categories that exist in the catalog, preserving preferred order
    existing_categories = set()
    for p in all_products:
        cat = str(p.get("category", "")).strip()
        if cat:
            existing_categories.add(cat)

    ordered_categories = [c for c in ROUTINE_CATEGORY_ORDER if c in existing_categories]

    routine: List[Dict[str, Any]] = []
    skipped_steps: List[Dict[str, str]] = []
    total_price = 0.0
    remaining_budget = float(budget) if budget is not None else None

    for category in ordered_categories:
        # Filter products in this category
        category_products = [
            p for p in all_products
            if str(p.get("category", "")).strip().lower() == category.lower()
        ]
        if not category_products:
            continue

        # Score each product against the user profile
        scored = [_score_product(p, profile_for_scoring) for p in category_products]
        scored.sort(key=lambda x: x["match_score"], reverse=True)

        # Pick the best-scoring product that fits the remaining budget
        selected = None
        for candidate in scored:
            price = 0.0
            try:
                price = float(candidate["product"].get("price_inr", 0))
            except (ValueError, TypeError):
                pass

            if remaining_budget is not None and price > remaining_budget:
                continue  # Skip — doesn't fit remaining budget

            selected = candidate
            break

        if selected is None:
            # No product in this category fits the remaining budget — skip it
            cheapest_price = min(
                float(s["product"].get("price_inr", 0) or 0) for s in scored
            )
            skipped_steps.append({
                "step": category,
                "reason": (
                    f"No {category} fits remaining budget "
                    f"(cheapest: ₹{int(cheapest_price)}, "
                    f"remaining: ₹{int(remaining_budget)})"
                ),
            })
            continue

        product_price = float(selected["product"].get("price_inr", 0) or 0)
        total_price += product_price
        if remaining_budget is not None:
            remaining_budget = remaining_budget - product_price

        step_reason = (
            selected["reasons"][0] if selected["reasons"]
            else f"Top-rated {category} for your profile"
        )

        routine.append({
            "step": category,
            "product": selected["product"],
            "match_score": selected["match_score"],
            "reason": step_reason,
        })

    within_budget = True
    if budget is not None:
        within_budget = total_price <= float(budget)

    return {
        "routine": routine,
        "total_price": int(total_price),
        "budget": int(budget) if budget is not None else None,
        "within_budget": within_budget,
        "steps": len(routine),
        "skipped_steps": skipped_steps,
    }

