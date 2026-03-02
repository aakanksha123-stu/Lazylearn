import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")
base_url = "https://openrouter.ai/api/v1"

if not api_key:
    raise EnvironmentError("OPENROUTER_API_KEY not found in environment variables.")

client = OpenAI(api_key=api_key, base_url=base_url)