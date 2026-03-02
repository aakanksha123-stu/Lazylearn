import os
import requests
import certifi
from dotenv import load_dotenv

# Load secret API key from .env
load_dotenv()

API_KEY = (os.getenv("OPENROUTER_API_KEY") or "").strip()
BASE_URL = "https://openrouter.ai/api/v1/chat/completions"

def simplify_text(input_text: str):
    system_prompt = (
        "You are Jarvis, the AI Text Simplifier 🤓. "
        "Your job is to take complex text and rewrite it in the simplest, clearest way possible. "
        "Avoid jargon. Use short sentences, easy words, and fun analogies if helpful. "
        "Always keep meaning intact but make it easier to understand. "
        "👉 Add emojis to make the explanation more friendly and fun. "
        "For example: use 📖 for books, 🧪 for science, 💻 for computers, 🌍 for world, etc."
    )

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "openai/gpt-3.5-turbo",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": input_text}
        ],
        "max_tokens": 400,
        "temperature": 0.7
    }

    try:
        response = requests.post(
            BASE_URL,
            headers=headers,
            json=payload,
            verify=certifi.where()   # ✅ enforce valid CA bundle
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print("AI API failed:", repr(e))
        return (
            "⚠ Sorry, I couldn’t simplify this right now. "
            "Check your API connection or key."
        )
