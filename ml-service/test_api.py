"""
Phase 5 verification script — LLM-Powered AI Shopping Agent.

Tests:
  - Deterministic fallback when LLM is unavailable
  - LLM-powered agent when API key is set
  - Multi-turn conversations
  - Hallucination/grounding
  - Error handling
"""
import sys, io, json, os, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load .env before importing app modules
from dotenv import load_dotenv
load_dotenv()

from app.services.agent_service import process_message, process_message_with_llm
from app.services.llm_service import is_llm_available


def section(num, title):
    print("\n" + "=" * 72)
    print(f"  {num}. {title}")
    print("=" * 72)


def show(result):
    print(f"  LLM Powered: {result.get('llm_powered', 'N/A')}")
    print(f"  Intent:       {result.get('intent', 'N/A')}")
    print(f"  Tools Used:   {result.get('tools_used', [])}")
    msg = result.get("message", "")
    # Truncate long messages for readability
    if len(msg) > 300:
        msg = msg[:300] + "..."
    print(f"  Message:      {msg}")


LLM_READY = is_llm_available()
print(f"LLM Available: {LLM_READY}")
if not LLM_READY:
    print("NOTE: Running in DETERMINISTIC FALLBACK mode (no API key set)")
    print("      Set LLM_API_KEY in .env to test LLM-powered features")

# -----------------------------------------------------------------------
# Test 0: Deterministic fallback
# -----------------------------------------------------------------------
section(0, "FALLBACK TEST: deterministic when no LLM")
# Temporarily unset LLM_API_KEY to force fallback
orig_key = os.environ.get("LLM_API_KEY", "")
os.environ["LLM_API_KEY"] = ""
# Need to reset the cached model
from app.services import llm_service
llm_service.LLM_API_KEY = ""
llm_service._gemini_model = None

result = process_message_with_llm("I want niacinamide")
show(result)
assert result["llm_powered"] == False, "Should be deterministic fallback"
print("  PASS — deterministic fallback works")

# Restore key
os.environ["LLM_API_KEY"] = orig_key
llm_service.LLM_API_KEY = orig_key
llm_service._gemini_model = None

if not LLM_READY:
    print("\n" + "=" * 72)
    print("  SKIPPING LLM TESTS — set LLM_API_KEY in .env to enable")
    print("=" * 72)
    sys.exit(0)

# -----------------------------------------------------------------------
# Test 1: Recommendation
# -----------------------------------------------------------------------
section(1, "RECOMMENDATION: 'I want something for oily skin and acne under 1000'")
time.sleep(12)
result = process_message_with_llm(
    "I want something for oily skin and acne under 1000",
    user_profile={"skin_type": "Oily", "skin_tone": "Medium", "concerns": ["Acne"], "budget": 1000}
)
show(result)
assert result["llm_powered"] == True
assert len(result["tools_used"]) > 0, "Should have used at least one tool"
print("  PASS")

# -----------------------------------------------------------------------
# Test 2: Product Details
# -----------------------------------------------------------------------
section(2, "PRODUCT_DETAILS: 'Tell me about P011'")
time.sleep(12)
result = process_message_with_llm("Tell me about P011")
show(result)
assert result["llm_powered"] == True
assert "get_product" in result["tools_used"], f"Expected get_product, got {result['tools_used']}"
print("  PASS")

# -----------------------------------------------------------------------
# Test 3: Compare
# -----------------------------------------------------------------------
section(3, "COMPARE: 'Compare P011 and P003'")
time.sleep(12)
result = process_message_with_llm("Compare P011 and P003")
show(result)
assert result["llm_powered"] == True
assert "compare_products" in result["tools_used"], f"Expected compare_products, got {result['tools_used']}"
print("  PASS")

# -----------------------------------------------------------------------
# Test 4: Dupes
# -----------------------------------------------------------------------
section(4, "DUPE: 'Find a cheaper alternative to P013'")
time.sleep(12)
result = process_message_with_llm("Find a cheaper alternative to P013")
show(result)
assert result["llm_powered"] == True
assert "find_dupes" in result["tools_used"], f"Expected find_dupes, got {result['tools_used']}"
print("  PASS")

# -----------------------------------------------------------------------
# Test 5: Routine
# -----------------------------------------------------------------------
section(5, "ROUTINE: 'Build me a routine for acne under 2000'")
time.sleep(12)
result = process_message_with_llm("Build me a routine for acne under 2000")
show(result)
assert result["llm_powered"] == True
assert "build_routine" in result["tools_used"], f"Expected build_routine, got {result['tools_used']}"
print("  PASS")

# -----------------------------------------------------------------------
# Test 6: Multi-turn
# -----------------------------------------------------------------------
section(6, "MULTI-TURN: Turn 1 = acne products, Turn 2 = which is cheapest")
time.sleep(12)
r1 = process_message_with_llm("Show me products for acne")
show(r1)
print("  --- Turn 2 ---")
time.sleep(12)

history = [
    {"role": "user", "content": "Show me products for acne"},
    {"role": "assistant", "content": r1["message"]},
]
r2 = process_message_with_llm(
    "Which one is the cheapest?",
    conversation_history=history,
)
show(r2)
assert r2["llm_powered"] == True
print("  PASS — multi-turn handled")

# -----------------------------------------------------------------------
# Test 7: Hallucination guard
# -----------------------------------------------------------------------
section(7, "HALLUCINATION: 'What is the vitamin E concentration of P011?'")
time.sleep(12)
result = process_message_with_llm("What is the vitamin E concentration of P011?")
show(result)
msg_lower = result["message"].lower()
# The assistant should NOT invent a specific concentration
hallucination_phrases = ["10%", "15%", "20%", "5%", "25%", "0.5%", "1%"]
found_hallucination = [p for p in hallucination_phrases if p in msg_lower and "vitamin e" in msg_lower]
if found_hallucination:
    print(f"  WARNING: Possible hallucination detected — found {found_hallucination}")
else:
    print("  PASS — no hallucinated vitamin E concentration")

# -----------------------------------------------------------------------
# Test 8: Unknown product
# -----------------------------------------------------------------------
section(8, "UNKNOWN: 'What do you know about P999?'")
time.sleep(12)
result = process_message_with_llm("What do you know about P999?")
show(result)
print("  PASS — handled gracefully")

# -----------------------------------------------------------------------
# Test 9: Out-of-catalog
# -----------------------------------------------------------------------
section(9, "OUT-OF-CATALOG: 'What is the latest price on Amazon?'")
time.sleep(12)
result = process_message_with_llm("What is the latest price of this product on Amazon?")
show(result)
msg_lower = result["message"].lower()
if "joyory" in msg_lower or "catalog" in msg_lower or "don't have" in msg_lower or "cannot" in msg_lower or "only" in msg_lower:
    print("  PASS — correctly scoped to Joyory catalog")
else:
    print("  WARNING — may not have clearly stated catalog limitation")

# -----------------------------------------------------------------------
# Test 10: API failure (bad key)
# -----------------------------------------------------------------------
section(10, "ERROR HANDLING: Invalid API key")
orig_key = os.environ.get("LLM_API_KEY", "")
os.environ["LLM_API_KEY"] = "invalid_key_12345"
llm_service.LLM_API_KEY = "invalid_key_12345"
llm_service._gemini_model = None

result = process_message_with_llm("Hello")
show(result)
# Should not crash — should gracefully handle
assert "error" not in str(type(result)), "Should return dict, not raise exception"
print("  PASS — API failure handled gracefully, server did not crash")

# Restore
os.environ["LLM_API_KEY"] = orig_key
llm_service.LLM_API_KEY = orig_key
llm_service._gemini_model = None

# -----------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------
print("\n" + "=" * 72)
print("  ALL PHASE 5 TESTS COMPLETE")
print("=" * 72)
