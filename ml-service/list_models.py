import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("LLM_API_KEY")
if not api_key:
    print("NO API KEY")
    exit(1)

client = genai.Client(api_key=api_key)

models_to_test = ["gemini-2.5-flash", "gemini-3.8-flash"]

for m in models_to_test:
    print(f"\nTesting {m}...")
    try:
        response = client.models.generate_content(
            model=m,
            contents="Say hi"
        )
        print(f"  SUCCESS! Response: {response.text}")
    except Exception as e:
        print(f"  FAILED: {e}")

