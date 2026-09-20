import sys, json, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from dotenv import load_dotenv
load_dotenv()

from app.services.agent_service import process_message_with_llm

message = "I have oily skin and acne. Recommend something under ₹1000."

print(f"Testing Prompt: {message}\n")

result = process_message_with_llm(message)

print("--- RESULT ---")
print(f"LLM Powered: {result.get('llm_powered')}")
print(f"Intent: {result.get('intent')}")
print(f"Tools Used: {result.get('tools_used')}")
print("\nResponse:")
print(result.get("message"))
