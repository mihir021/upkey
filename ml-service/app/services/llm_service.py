"""
Joyory LLM Service — Google Gemini integration

Handles all LLM communication in a single, isolated module.
Reads configuration from environment variables.
Never exposes API keys in responses or logs.

Provider-specific code is contained entirely in this file so that
swapping providers later requires changes only here.
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration (read once at import time; safe to re-read on hot-reload)
# ---------------------------------------------------------------------------
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-2.5-flash")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")

# ---------------------------------------------------------------------------
# System prompt — grounding rules for the shopping assistant
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are Joyory's AI shopping assistant.

You help users discover and compare beauty/skincare products using the available Joyory shopping tools.

STRICT RULES — you MUST follow these at all times:

1. Never invent product information.
2. Never fabricate product names, prices, ratings, ingredients, skin compatibility, concerns, dupe relationships, or product availability.
3. When product information is required, use the appropriate shopping tool.
4. Only make claims that are directly supported by tool results.
5. If information is unavailable in the catalog, explicitly say so. Do NOT guess.
6. Never claim that a product treats, cures, or diagnoses any medical condition.
7. Avoid medical diagnosis. If a user describes symptoms, suggest they consult a dermatologist.
8. If a tool returns no results, say so honestly — do NOT invent alternatives.
9. Preserve exact prices, ratings, and product data returned by tools.
10. If a user asks about external sources (Amazon prices, competitor products, etc.), say that you only have access to the Joyory catalog.
11. When presenting products, be helpful, friendly, and concise.
12. You may suggest follow-up questions to help the user narrow down their choice.
13. Format prices in INR (₹).
"""

# ---------------------------------------------------------------------------
# Tool definitions for Gemini function calling
# ---------------------------------------------------------------------------
TOOL_DEFINITIONS = [
    {
        "name": "search_products",
        "description": "Search the Joyory product catalog. Searches across product name, brand, category, concerns, key ingredients, skin type, and skin tone.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The search term, e.g. 'niacinamide', 'cleanser', 'acne', 'oily skin'"
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum number of results to return (1-50, default 5)"
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "get_product",
        "description": "Get complete details for a specific product by its ID.",
        "parameters": {
            "type": "object",
            "properties": {
                "product_id": {
                    "type": "string",
                    "description": "The product ID, e.g. 'P011'"
                }
            },
            "required": ["product_id"]
        }
    },
    {
        "name": "compare_products",
        "description": "Compare 2 to 4 products side by side, showing all available attributes.",
        "parameters": {
            "type": "object",
            "properties": {
                "product_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of 2-4 product IDs to compare"
                }
            },
            "required": ["product_ids"]
        }
    },
    {
        "name": "find_dupes",
        "description": "Find cheaper alternatives (dupes) for a specific product. Uses the catalog's dupe relationships.",
        "parameters": {
            "type": "object",
            "properties": {
                "product_id": {
                    "type": "string",
                    "description": "The product ID to find dupes for"
                }
            },
            "required": ["product_id"]
        }
    },
    {
        "name": "recommend_products",
        "description": "Get personalized product recommendations based on the user's skin profile, concerns, and budget. Returns scored results with explanations.",
        "parameters": {
            "type": "object",
            "properties": {
                "skin_type": {
                    "type": "string",
                    "description": "User's skin type: Oily, Dry, Combination, Sensitive, Normal"
                },
                "skin_tone": {
                    "type": "string",
                    "description": "User's skin tone: Fair, Light, Medium, Tan, Deep, Dark"
                },
                "concerns": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "User's skin concerns, e.g. ['Acne', 'Oiliness', 'Pigmentation']"
                },
                "budget": {
                    "type": "number",
                    "description": "Maximum budget in INR"
                },
                "limit": {
                    "type": "integer",
                    "description": "Number of recommendations (1-20, default 5)"
                }
            },
            "required": []
        }
    },
    {
        "name": "build_routine",
        "description": "Build a complete skincare routine (Cleanser, Toner, Serum, Moisturizer, Sunscreen) tailored to the user's profile and budget. Respects budget strictly.",
        "parameters": {
            "type": "object",
            "properties": {
                "skin_type": {
                    "type": "string",
                    "description": "User's skin type"
                },
                "skin_tone": {
                    "type": "string",
                    "description": "User's skin tone"
                },
                "concerns": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Skin concerns"
                },
                "goals": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Skincare goals, e.g. ['Clear skin', 'Glow']"
                },
                "budget": {
                    "type": "number",
                    "description": "Total routine budget in INR"
                }
            },
            "required": []
        }
    },
]


# ---------------------------------------------------------------------------
# Tool executor — bridges LLM function calls to shopping_tools
# ---------------------------------------------------------------------------

def execute_tool_call(tool_name: str, tool_args: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a shopping tool by name with the given arguments.

    This is the ONLY place where LLM tool calls are dispatched.
    All execution goes through the existing deterministic shopping_tools module.
    """
    from app.services import shopping_tools

    try:
        if tool_name == "search_products":
            return shopping_tools.search_products(
                query=tool_args.get("query", ""),
                limit=tool_args.get("limit", 5),
            )

        if tool_name == "get_product":
            return shopping_tools.get_product(
                product_id=tool_args.get("product_id", ""),
            )

        if tool_name == "compare_products":
            return shopping_tools.compare_products(
                product_ids=tool_args.get("product_ids", []),
            )

        if tool_name == "find_dupes":
            return shopping_tools.find_dupes(
                product_id=tool_args.get("product_id", ""),
            )

        if tool_name == "recommend_products":
            user_profile = {
                "skin_type": tool_args.get("skin_type", ""),
                "skin_tone": tool_args.get("skin_tone", ""),
                "concerns": tool_args.get("concerns", []),
                "budget": tool_args.get("budget"),
            }
            return shopping_tools.recommend_products(
                user_profile, limit=tool_args.get("limit", 5),
            )

        if tool_name == "build_routine":
            user_profile = {
                "skin_type": tool_args.get("skin_type", ""),
                "skin_tone": tool_args.get("skin_tone", ""),
                "concerns": tool_args.get("concerns", []),
            }
            return shopping_tools.build_routine(
                user_profile,
                goals=tool_args.get("goals", []),
                budget=tool_args.get("budget"),
            )

        return {"error": f"Unknown tool: {tool_name}"}

    except Exception as e:
        logger.error(f"Tool execution error ({tool_name}): {e}")
        return {"error": f"Tool '{tool_name}' failed: {str(e)}"}


# ---------------------------------------------------------------------------
# Gemini client
# ---------------------------------------------------------------------------

_gemini_model = None


def _get_gemini_model():
    """Lazy-initialize the Gemini GenerativeModel with tool definitions."""
    global _gemini_model
    if _gemini_model is not None:
        return _gemini_model

    try:
        from google import genai
        from google.genai import types
    except ImportError:
        raise RuntimeError(
            "google-genai package is not installed. "
            "Run: pip install google-genai"
        )

    api_key = os.getenv("LLM_API_KEY", "") or LLM_API_KEY
    if not api_key:
        raise RuntimeError(
            "LLM_API_KEY environment variable is not set. "
            "Please set it in your .env file."
        )

    model_name = os.getenv("LLM_MODEL", "") or LLM_MODEL

    client = genai.Client(api_key=api_key)

    # Build function declarations from our tool definitions
    function_declarations = []
    for tool_def in TOOL_DEFINITIONS:
        function_declarations.append(
            types.FunctionDeclaration(
                name=tool_def["name"],
                description=tool_def["description"],
                parameters=tool_def["parameters"],
            )
        )

    tools = types.Tool(function_declarations=function_declarations)

    _gemini_model = {
        "client": client,
        "model_name": model_name,
        "tools": tools,
        "types": types,
    }
    logger.info(f"Gemini client initialized with model: {model_name}")
    return _gemini_model


# ---------------------------------------------------------------------------
# Main chat function
# ---------------------------------------------------------------------------

# Maximum rounds of tool-calling before we force a text response
MAX_TOOL_ROUNDS = 5


def chat_with_llm(
    user_message: str,
    user_profile: Optional[Dict[str, Any]] = None,
    product_id: Optional[str] = None,
    conversation_history: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    """Send a message through the LLM with function-calling support.

    Returns
    -------
    dict with: message (str), tools_used (list), tool_results (list), error (str|None)
    """
    tools_used: List[str] = []
    tool_results: List[Dict[str, Any]] = []

    try:
        gemini = _get_gemini_model()
    except RuntimeError as e:
        return {
            "message": str(e),
            "tools_used": [],
            "tool_results": [],
            "error": "llm_unavailable",
        }

    client = gemini["client"]
    model_name = gemini["model_name"]
    tools = gemini["tools"]
    types = gemini["types"]

    # Build the content list
    contents = []

    # Add conversation history
    if conversation_history:
        for entry in conversation_history:
            role = entry.get("role", "user")
            text = entry.get("content", "")
            if role == "user":
                contents.append(types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=text)],
                ))
            elif role == "assistant":
                contents.append(types.Content(
                    role="model",
                    parts=[types.Part.from_text(text=text)],
                ))

    # Build the current user message with context
    context_parts = []
    if user_profile:
        profile_str = json.dumps(user_profile, ensure_ascii=False)
        context_parts.append(f"[User profile: {profile_str}]")
    if product_id:
        context_parts.append(f"[Currently viewing product: {product_id}]")

    full_message = user_message
    if context_parts:
        full_message = " ".join(context_parts) + "\n\n" + user_message

    contents.append(types.Content(
        role="user",
        parts=[types.Part.from_text(text=full_message)],
    ))

    # Configure generation
    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        tools=[tools],
        temperature=0.3,
    )

    try:
        # Iterative tool-calling loop
        for round_num in range(MAX_TOOL_ROUNDS):
            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=config,
            )

            # Check if the response contains function calls
            candidate = response.candidates[0] if response.candidates else None
            if not candidate:
                return {
                    "message": "I'm sorry, I couldn't generate a response. Please try again.",
                    "tools_used": tools_used,
                    "tool_results": tool_results,
                    "error": "empty_response",
                }

            parts = candidate.content.parts if candidate.content else []

            # Collect all function calls in this response
            function_calls = [p for p in parts if p.function_call]
            text_parts = [p.text for p in parts if hasattr(p, 'text') and p.text]

            if not function_calls:
                # No tool calls — we have a final text response
                final_text = "\n".join(text_parts) if text_parts else ""
                if not final_text:
                    final_text = "I'm here to help! What would you like to know about our products?"
                return {
                    "message": final_text,
                    "tools_used": tools_used,
                    "tool_results": tool_results,
                    "error": None,
                }

            # Process function calls
            # Add the model's response (with function calls) to the conversation
            contents.append(candidate.content)

            # Execute each tool call and build function response parts
            function_response_parts = []
            for fc_part in function_calls:
                fc = fc_part.function_call
                tool_name = fc.name
                tool_args = dict(fc.args) if fc.args else {}

                logger.info(f"LLM tool call [{round_num+1}]: {tool_name}({json.dumps(tool_args, ensure_ascii=False)})")

                # Execute the tool
                result = execute_tool_call(tool_name, tool_args)

                tools_used.append(tool_name)
                tool_results.append({
                    "tool": tool_name,
                    "args": tool_args,
                    "result": result,
                })

                # Build the function response
                function_response_parts.append(
                    types.Part.from_function_response(
                        name=tool_name,
                        response=result,
                    )
                )

            # Add function responses to conversation
            contents.append(types.Content(
                role="user",
                parts=function_response_parts,
            ))

        # If we exhausted MAX_TOOL_ROUNDS, generate a final text response
        # by making one more call without tools
        config_no_tools = types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=0.3,
        )
        response = client.models.generate_content(
            model=model_name,
            contents=contents,
            config=config_no_tools,
        )
        final_text = ""
        if response.candidates:
            parts = response.candidates[0].content.parts if response.candidates[0].content else []
            final_text = "\n".join(p.text for p in parts if hasattr(p, 'text') and p.text)

        return {
            "message": final_text or "I found some results for you. Please let me know if you'd like more details.",
            "tools_used": tools_used,
            "tool_results": tool_results,
            "error": None,
        }

    except Exception as e:
        error_msg = str(e)
        # Never expose API key in error messages
        if LLM_API_KEY and LLM_API_KEY in error_msg:
            error_msg = error_msg.replace(LLM_API_KEY, "***")
        logger.error(f"LLM error: {error_msg}")
        return {
            "message": f"I encountered an error connecting to the AI service. Please try again later.",
            "tools_used": tools_used,
            "tool_results": tool_results,
            "error": "llm_error",
        }


# ---------------------------------------------------------------------------
# Status check
# ---------------------------------------------------------------------------

def is_llm_available() -> bool:
    """Check whether the LLM is configured and reachable."""
    api_key = os.getenv("LLM_API_KEY", "") or LLM_API_KEY
    return bool(api_key)
