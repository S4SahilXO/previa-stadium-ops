import os
import json
import urllib.request
import urllib.error

# Read from .env file
api_key = os.environ.get("GEMINI_API_KEY")

if not api_key:
    try:
        env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".env"))
        print(f"Checking for .env at: {env_path}")
        if os.path.exists(env_path):
            print(".env file exists. Reading...")
            with open(env_path, "r", encoding="utf-8-sig") as f:
                for line in f:
                    print(f"Read line: {line.strip()}")
                    if "GEMINI_API_KEY=" in line:
                        api_key = line.split("GEMINI_API_KEY=", 1)[1].strip()
                        break
        else:
            print(".env file does not exist at path.")
    except Exception as e:
        print(f"Error reading .env file: {e}")

if not api_key:
    print("Error: GEMINI_API_KEY is not set in environment or .env file.")
    exit(1)

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"

payload = {
    "contents": [{
        "parts": [{
            "text": "Say hello in exactly 3 words."
        }]
    }]
}

headers = {
    "Content-Type": "application/json"
}

print("Sending request to Gemini API...")
req = urllib.request.Request(
    url, 
    data=json.dumps(payload).encode("utf-8"), 
    headers=headers, 
    method="POST"
)

try:
    with urllib.request.urlopen(req) as response:
        res_data = json.loads(response.read().decode("utf-8"))
        try:
            text = res_data["candidates"][0]["content"]["parts"][0]["text"]
            print("\nSuccess! Response from Gemini:")
            print(text.strip())
        except (KeyError, IndexError):
            print("\nSuccess, but unexpected response structure:")
            print(json.dumps(res_data, indent=2))
except urllib.error.HTTPError as e:
    print(f"\nAPI Connection Failed (HTTP {e.code}): {e.read().decode('utf-8')}")
    exit(1)
except Exception as e:
    print(f"\nAPI Connection Failed: {e}")
    exit(1)
