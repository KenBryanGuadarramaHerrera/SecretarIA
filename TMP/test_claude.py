import os
import requests
import json

api_key = os.environ.get("ANTHROPIC_API_KEY", "")

headers = {
    "x-api-key": api_key,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json"
}

models = ["claude-3-haiku-20240307", "claude-3-5-haiku-20241022"]

for model in models:
    payload = {
        "model": model,
        "max_tokens": 10,
        "messages": [
            {"role": "user", "content": "hola"}
        ]
    }
    r = requests.post("https://api.anthropic.com/v1/messages", json=payload, headers=headers)
    print(f"Model: {model} -> Status: {r.status_code}")
    if r.status_code == 200:
        print(f"Success with {model}: {r.json()}")
        break
    else:
        print(f"Error: {r.text}")
